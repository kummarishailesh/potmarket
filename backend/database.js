import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'db.json');
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const SUPABASE_TABLE = String(process.env.SUPABASE_TABLE || 'potmarket_state').replace(/[^a-zA-Z0-9_]/g, '');

const defaultDB = {
  themes: {},
  userThemes: {},
  orders: [],
  users: [],
  payments: [],
  products: [],
  admins: [],
  orderStatusHistory: [],
  notifications: [],
  auditLogs: []
};

class Database {
  constructor() {
    this.data = this.loadData();
    this.remoteWrite = Promise.resolve();
    this.remoteEnabled = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
  }

  async initialize() {
    if (!this.remoteEnabled) {
      if (process.env.NODE_ENV === 'production') console.warn('[database] Remote persistence is not configured; Render Free storage is temporary.');
      return;
    }
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.1&select=data`, {
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
      });
      if (!response.ok) throw new Error(`Supabase read failed (${response.status})`);
      const rows = await response.json();
      if (rows[0]?.data && typeof rows[0].data === 'object') {
        this.data = { ...defaultDB, ...rows[0].data };
        this.saveLocalData();
        console.log('[database] Loaded persistent state from Supabase.');
      } else {
        await this.writeRemote();
        console.log('[database] Initialized Supabase state from local data.');
      }
    } catch (error) {
      console.error('[database] Supabase initialization failed:', error.message);
      throw error;
    }
  }

  loadData() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const rawData = fs.readFileSync(DB_PATH, 'utf8');
        try {
          const parsed = JSON.parse(rawData);
          return { ...defaultDB, ...parsed };
        } catch (parseErr) {
          console.error('Database JSON parse error:', parseErr);
          // Try to recover from a backup file
          const bakPath = DB_PATH + '.bak';
          if (fs.existsSync(bakPath)) {
            try {
              const bakData = fs.readFileSync(bakPath, 'utf8');
              return JSON.parse(bakData);
            } catch (bakErr) {
              console.error('Failed to parse backup DB file:', bakErr);
            }
          }
          return { ...defaultDB };
        }
      }
      return { ...defaultDB };
    } catch (error) {
      console.error('Error loading database:', error);
      return { ...defaultDB };
    }
  }

  saveData() {
    const localSaved = this.saveLocalData();
    if (this.remoteEnabled) {
      this.remoteWrite = this.remoteWrite.then(() => this.writeRemote()).catch(error => {
        console.error('[database] Supabase write failed:', error.message);
      });
    }
    return localSaved;
  }

  saveLocalData() {
    try {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      // Atomic write: write to a temp file then rename to avoid corrupting the DB on partial writes
      const tmpPath = DB_PATH + '.tmp';
      fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), 'utf8');
      try {
        fs.renameSync(tmpPath, DB_PATH);
      } catch (renameErr) {
        // On some Windows setups rename can fail if target is open; fallback to direct write
        try {
          fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
          // remove tmp if exists
          if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        } catch (directErr) {
          // rethrow to outer catch
          throw directErr;
        }
      }
      return true;
    } catch (error) {
      try {
        // attempt to save a backup
        const bakPath = DB_PATH + '.bak';
        fs.writeFileSync(bakPath, JSON.stringify(this.data, null, 2), 'utf8');
        console.error('Error saving database to main path; backup written to', bakPath, error && error.message ? error.message : error);
        return true; // consider success since backup saved
      } catch (e) {
        console.error('Failed to save database backup:', e && e.message ? e.message : e);
      }
      return false;
    }
  }

  async writeRemote() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({ id: 1, data: this.data, updated_at: new Date().toISOString() })
    });
    if (!response.ok) throw new Error(`Supabase write failed (${response.status})`);
  }

  getOrders() {
    return this.data.orders || [];
  }

  resetTransactionData() {
    this.data.orders = [];
    this.data.payments = [];
    this.data.orderStatusHistory = [];
    this.data.notifications = [];
    this.data.auditLogs = [];
    this.data.users = [];
    this.data.userThemes = {};
    return this.saveData();
  }

  addOrder(order) {
    if (!this.data.orders) {
      this.data.orders = [];
    }
    this.data.orders.push(order);
    const ok = this.saveData();
    if (!ok) {
      // log warning but do not throw so API can still respond; a backup copy may exist
      console.error('Warning: Failed to persist order to main DB file; order added to memory and backup attempted');
    }
    return order;
  }

  getOrderById(orderId) {
    const orders = this.data.orders || [];
    return orders.find(order => order.id === orderId);
  }

  updateOrder(orderId, updates) {
    const orders = this.data.orders || [];
    const index = orders.findIndex(order => order.id === orderId);
    
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      this.saveData();
      return orders[index];
    }
    return null;
  }

  getProducts() {
    return this.data.products || [];
  }

  getProductById(productId) {
    const products = this.getProducts();
    return products.find(p => p.id === productId);
  }

  addProduct(productData) {
    const products = this.getProducts();
    const newProduct = { id: Date.now(), ...productData };
    products.push(newProduct);
    this.saveData();
    return newProduct;
  }

  bootstrapProducts(products) {
    if (this.getProducts().length || !Array.isArray(products)) return this.getProducts();
    this.data.products = products.map(product => ({ ...product, createdAt: product.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }));
    this.saveData();
    return this.data.products;
  }

  updateProduct(productId, updates) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      this.saveData();
      return products[index];
    }
    return null;
  }

  deleteProduct(productId) {
    this.data.products = this.getProducts().filter(p => p.id !== productId);
    return this.saveData();
  }
  getOrdersByUser(userId) {
    const orders = this.getOrders() || [];
    return orders.filter(o => o.userId === userId || String(o.userId) === String(userId));
  }
  getUsers() {
    return this.data.users || [];
  }

  addUser(user) {
    if (!this.data.users) {
      this.data.users = [];
    }
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  getUserByEmail(email) {
    const users = this.data.users || [];
    const normalizedEmail = String(email || '').trim().toLowerCase();
    return users.find(user => String(user.email || '').trim().toLowerCase() === normalizedEmail);
  }

  getUserById(userId) {
    const users = this.getUsers();
    return users.find(u => u.id === userId || String(u.id) === String(userId));
  }

  updateUser(userId, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId || String(u.id) === String(userId));
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.saveData();
      return users[index];
    }
    return null;
  }

  deleteUser(userId) {
    const before = this.data.users.length;
    this.data.users = this.getUsers().filter(user => user.id !== userId && String(user.id) !== String(userId));
    return before !== this.data.users.length && this.saveData();
  }

  getPayments() {
    return this.data.payments || [];
  }

  addPayment(payment) {
    if (!this.data.payments) {
      this.data.payments = [];
    }
    this.data.payments.push(payment);
    this.saveData();
    return payment;
  }

  getAdmins() {
    return this.data.admins || [];
  }

  getAdminByEmail(email) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    return this.getAdmins().find(admin => String(admin.email || '').toLowerCase() === normalizedEmail);
  }

  addAdmin(admin) {
    if (!this.data.admins) this.data.admins = [];
    this.data.admins.push(admin);
    this.saveData();
    return admin;
  }

  updateAdmin(adminId, updates) {
    const admins = this.getAdmins();
    const index = admins.findIndex(admin => admin.id === adminId);
    if (index === -1) return null;
    admins[index] = { ...admins[index], ...updates };
    this.saveData();
    return admins[index];
  }

  getOrderStatusHistory(orderId) {
    return (this.data.orderStatusHistory || []).filter(entry => entry.orderId === orderId);
  }

  addOrderStatusHistory(entry) {
    if (!this.data.orderStatusHistory) this.data.orderStatusHistory = [];
    this.data.orderStatusHistory.push(entry);
    this.saveData();
    return entry;
  }

  getNotifications() {
    return this.data.notifications || [];
  }

  addNotification(notification) {
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift(notification);
    this.data.notifications = this.data.notifications.slice(0, 200);
    this.saveData();
    return notification;
  }

  addAuditLog(entry) {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.push(entry);
    this.saveData();
    return entry;
  }

  getThemes() {
    return this.data.themes || {};
  }

  addTheme(themeId, themeData) {
    if (!this.data.themes) {
      this.data.themes = {};
    }
    this.data.themes[themeId] = themeData;
    this.saveData();
    return themeData;
  }

  getUserTheme(userId) {
    return (this.data.userThemes || {})[userId] || 'default';
  }

  setUserTheme(userId, themeId) {
    if (!this.data.userThemes) {
      this.data.userThemes = {};
    }
    this.data.userThemes[userId] = themeId;
    this.saveData();
    return themeId;
  }
}

export default new Database();
