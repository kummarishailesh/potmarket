import http from 'http';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.BREVO_API_KEY) dotenv.config({ path: path.join(__dirname, '.env.1') });

http.globalAgent.maxHeaderSize = 128 * 1024;
http.globalAgent.maxRequestHeaderSize = 128 * 1024;

const app = express();
// Default backend port moved to 3001 for local development so Vite can run on 3000
const PORT = process.env.PORT || 3001;
const isGatewayPayment = paymentMethod => ['online', 'upi'].includes(String(paymentMethod || '').toLowerCase());
const publicAppOrigin = String(process.env.PUBLIC_APP_URL || '').replace(/\/$/, '');
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const Razorpay = (await import('razorpay')).default;
const razorpayClient = razorpayKeyId && razorpayKeySecret ? new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret }) : null;
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://kummarishailesh.github.io',
    publicAppOrigin
].filter(Boolean);

const getNetworkAddresses = () => Object.values(os.networkInterfaces()).flat().filter(address => address && !address.internal && address.family === 'IPv4').map(address => address.address);
const blueLink = value => `\x1b[34m\x1b[4m${value}\x1b[0m`;

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', '*']
}));

const server = http.createServer(app);
server.maxHeaderSize = 128 * 1024;

app.use(express.json({
    limit: '50mb',
    verify: (request, _response, buffer) => {
        request.rawBody = Buffer.from(buffer);
    }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve frontend build (if present) so backend can serve both API and static files from one server
const buildPath = path.join(__dirname, '..', 'build');
if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    // fallback to index.html for client-side routing
    app.get('*', (req, res, next) => {
        // allow API routes to continue
        if (req.path.startsWith('/api') || req.path === '/health') return next();
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

app.use((req, res, next) => {
    // Only log requests when QUIET is not set
    if (!process.env.QUIET) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.post('/api/payments/webhook', async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const body = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
        if (!razorpayWebhookSecret || !signature) {
            return res.status(401).json({ success: false, message: 'Missing Razorpay webhook signature' });
        }
        const expected = crypto.createHmac('sha256', razorpayWebhookSecret).update(body).digest('hex');
        const expectedBuffer = Buffer.from(expected);
        const signatureBuffer = Buffer.from(String(signature));
        if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
            return res.status(401).json({ success: false, message: 'Invalid Razorpay webhook signature' });
        }
        const payload = JSON.parse(body.toString('utf8'));
        const event = payload.event;
        const payment = payload.payload && payload.payload.payment && payload.payload.payment.entity ? payload.payload.payment.entity : null;
        if (event === 'payment.captured' && payment) {
            const draft = db.getOrders().find(order => order.paymentOrderId === payment.order_id);
            if (draft) {
                const updatedAt = new Date().toISOString();
                db.updateOrder(draft.id, { status: 'Confirmed', orderStatus: 'Confirmed', paymentStatus: 'Paid', paymentVerified: true, transactionId: payment.id || null, gatewayOrderId: payment.order_id || null, paidAt: updatedAt, updatedAt });
                if (!db.getPayments().some(item => item.orderId === draft.id)) {
                    db.addPayment({ id: payment.id || `pay_${Date.now()}`, orderId: draft.id, provider: 'razorpay', amount: draft.total, currency: 'INR', transactionId: payment.id || null, method: draft.paymentMethod, status: 'Paid', paymentDate: updatedAt, createdAt: draft.createdAt, updatedAt });
                }
            }
        }
        return res.status(200).json({ success: true });
    } catch (error) {
        res.status(502).json({ success: false, message: `Payment webhook processing failed: ${error.message}` });
    }
});

app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Pot market backend is running!',
        version: '1.0.0',
        endpoints: {
            orders: '/api/orders',
            products: '/api/products',
            health: '/health'
        }
    });
});

// Simple API routes for orders using the local database helper
import db from './database.js';
import { legacyProducts } from './catalog.js';
import { sendProductAnnouncement, sendRegistrationOtp, sendPasswordResetOtp, sendAdminLoginOtp, sendOrderConfirmation } from './product-email.js';
import { invoicePdf } from './invoice.js';

const ADMIN_COOKIE = 'admin_session';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'local-admin-secret-change-me');
const ADMIN_ROLES = new Set(['admin', 'super_admin']);
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_LOGIN_MAX_ATTEMPTS = 10;
const adminLoginAttempts = new Map();
const adminLoginChallenges = new Map();
const registrationChallenges = new Map();
const passwordResetChallenges = new Map();

const base64Url = value => Buffer.from(value).toString('base64url');
const parseCookies = header => Object.fromEntries(String(header || '').split(';').map(part => part.trim().split('='))
    .filter(([key, value]) => key && value).map(([key, ...value]) => [key, value.join('=')]));

const hashPassword = password => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(String(password), salt, 210000, 64, 'sha512').toString('hex');
    return `pbkdf2_sha512$210000$${salt}$${hash}`;
};

const verifyPassword = (password, storedHash) => {
    if (!storedHash || !String(storedHash).startsWith('pbkdf2_sha512$')) return false;
    const [algorithm, iterations, salt, expected] = String(storedHash).split('$');
    const actual = crypto.pbkdf2Sync(String(password), salt, Number(iterations), 64, 'sha512').toString('hex');
    return algorithm === 'pbkdf2_sha512' && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
};

const createToken = admin => {
    if (!ADMIN_JWT_SECRET) throw new Error('ADMIN_JWT_SECRET is not configured');
    const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = base64Url(JSON.stringify({ sub: admin.id, role: admin.role, email: admin.email, exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60 }));
    const signature = base64Url(crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(`${header}.${payload}`).digest());
    return `${header}.${payload}.${signature}`;
};

const verifyToken = token => {
    try {
        const [header, payload, signature] = String(token || '').split('.');
        if (!header || !payload || !signature || !ADMIN_JWT_SECRET) return null;
        const expected = base64Url(crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(`${header}.${payload}`).digest());
        if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
        const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        return claims.exp > Math.floor(Date.now() / 1000) ? claims : null;
    } catch (error) {
        return null;
    }
};

const publicAdmin = admin => ({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, createdAt: admin.createdAt });
const publicUser = user => user && ({ id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt, active: user.active !== false });
const setCookie = (res, name, value, maxAge) => res.setHeader('Set-Cookie', `${name}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
const clearCookie = (res, name) => res.setHeader('Set-Cookie', `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

const requireAdmin = (req, res, next) => {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE] || String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const claims = verifyToken(token);
    if (!claims || !ADMIN_ROLES.has(claims.role)) return res.status(401).json({ success: false, message: 'Admin authentication required' });
    const admin = db.getAdmins().find(item => item.id === claims.sub && item.active !== false);
    if (!admin) return res.status(403).json({ success: false, message: 'Admin account is inactive' });
    req.admin = admin;
    next();
};

const sanitizeText = value => String(value ?? '').replace(/[<>]/g, '').trim();
const dateStart = value => value ? new Date(`${value}T00:00:00.000Z`) : null;
const dateEnd = value => value ? new Date(`${value}T23:59:59.999Z`) : null;
const inDateRange = (date, from, to) => (!from || date >= from) && (!to || date <= to);
const csvValue = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
const sendCsv = (res, filename, headers, rows) => {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send([headers, ...rows].map(row => row.map(csvValue).join(',')).join('\n'));
};
const sendInvoicePdf = async (res, order) => { try { const pdf = await invoicePdf(order); res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.id}.pdf"`); return res.send(pdf); } catch (error) { return res.status(500).json({ success: false, message: 'Unable to create invoice PDF' }); } };

const verifyRazorpayPayment = ({ orderId, paymentId, signature }) => {
    if (!razorpayKeySecret || !orderId || !paymentId || !signature) return false;
    const expected = crypto.createHmac('sha256', razorpayKeySecret).update(`${orderId}|${paymentId}`).digest('hex');
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);
    if (expectedBuffer.length !== signatureBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
};

const ensureBootstrapAdmin = () => {
    const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;
    const existingAdmin = db.getAdminByEmail(email);
    if (!existingAdmin) {
        db.addAdmin({ id: `admin_${Date.now()}`, name: process.env.ADMIN_NAME || 'Platform Administrator', email, passwordHash: hashPassword(password), role: 'super_admin', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        console.log(`[admin] bootstrap administrator created for ${email}`);
    } else if (process.env.NODE_ENV !== 'production') {
        db.updateAdmin?.(existingAdmin.id, { passwordHash: hashPassword(password), updatedAt: new Date().toISOString() });
    }
};

const migrateLegacyUserPasswords = () => {
    db.getUsers().filter(user => user.password && !user.passwordHash).forEach(user => {
        db.updateUser(user.id, { passwordHash: hashPassword(user.password), password: undefined });
    });
};

const ensureDemoUser = () => {
    const email = 'demo@potmarket.test';
    const password = 'Demo@12345';
    const existingUser = db.getUserByEmail(email);
    if (!existingUser) {
        db.addUser({ id: 'u_demo_potmarket', name: 'PotMarket Demo User', email, phone: '+15550101234', passwordHash: hashPassword(password), wishlist: [], cart: [], active: true, createdAt: new Date().toISOString() });
    } else if (process.env.NODE_ENV !== 'production') {
        db.updateUser(existingUser.id, { passwordHash: hashPassword(password), password: undefined, active: true, updatedAt: new Date().toISOString() });
    }
};

ensureBootstrapAdmin();
migrateLegacyUserPasswords();
ensureDemoUser();
db.bootstrapProducts(legacyProducts);

app.post('/api/admin/auth/login', async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const attempt = adminLoginAttempts.get(ip) || { count: 0, startedAt: Date.now() };
    if (Date.now() - attempt.startedAt > ADMIN_LOGIN_WINDOW_MS) { attempt.count = 0; attempt.startedAt = Date.now(); }
    if (attempt.count >= ADMIN_LOGIN_MAX_ATTEMPTS) return res.status(429).json({ success: false, message: 'Too many login attempts. Try again later.' });
    const identifier = sanitizeText(req.body?.email || req.body?.username).toLowerCase();
    const password = String(req.body?.password || '');
    const admin = db.getAdmins().find(item => String(item.email || '').toLowerCase() === identifier && item.active !== false);
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
        attempt.count += 1; adminLoginAttempts.set(ip, attempt);
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    adminLoginAttempts.delete(ip);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const challenge = crypto.randomBytes(24).toString('hex');
    adminLoginChallenges.set(challenge, { adminId: admin.id, otp, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 });
    setCookie(res, 'admin_login_challenge', challenge, 10 * 60);
    try {
        const sent = await sendAdminLoginOtp(admin.email, otp);
        if (!sent) {
            adminLoginChallenges.delete(challenge);
            clearCookie(res, 'admin_login_challenge');
            return res.status(503).json({ success: false, message: 'Admin email delivery is not configured' });
        }
    } catch (error) {
        adminLoginChallenges.delete(challenge);
        clearCookie(res, 'admin_login_challenge');
        return res.status(502).json({ success: false, message: 'Unable to send the admin verification code' });
    }
    return res.status(202).json({ success: true, requiresOtp: true, message: `A verification code was sent to ${admin.email}` });
});

app.post('/api/admin/auth/verify-otp', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const challengeKey = cookies.admin_login_challenge;
    const challenge = adminLoginChallenges.get(challengeKey);
    const code = String(req.body?.otp || '').trim();
    if (!challenge || challenge.expiresAt < Date.now()) return res.status(401).json({ success: false, message: 'This admin verification code has expired. Sign in again.' });
    challenge.attempts += 1;
    if (challenge.attempts > 5) {
        adminLoginChallenges.delete(challengeKey);
        return res.status(429).json({ success: false, message: 'Too many verification attempts. Sign in again.' });
    }
    if (code !== challenge.otp) return res.status(401).json({ success: false, message: 'Invalid verification code' });
    const admin = db.getAdmins().find(item => item.id === challenge.adminId && item.active !== false);
    adminLoginChallenges.delete(challengeKey);
    if (!admin) return res.status(403).json({ success: false, message: 'Admin account is inactive' });
    setCookie(res, 'admin_login_challenge', '', 0);
    setCookie(res, ADMIN_COOKIE, createToken(admin), 8 * 60 * 60);
    db.addAuditLog({ id: `audit_${Date.now()}`, action: 'admin.login', adminId: admin.id, createdAt: new Date().toISOString() });
    return res.json({ success: true, admin: publicAdmin(admin) });
});

app.post('/api/admin/auth/logout', (req, res) => { clearCookie(res, ADMIN_COOKIE); res.json({ success: true }); });
app.get('/api/admin/auth/me', requireAdmin, (req, res) => res.json({ success: true, admin: publicAdmin(req.admin) }));

app.get('/api/products', (req, res) => res.json({ success: true, products: db.getProducts().filter(product => product.active !== false) }));
app.post('/api/products/bootstrap', (req, res) => {
    const products = Array.isArray(req.body?.products) ? req.body.products.filter(product => product && product.id && product.name) : [];
    if (!products.length) return res.status(400).json({ success: false, message: 'Products are required' });
    return res.json({ success: true, products: db.bootstrapProducts(products) });
});

app.post('/api/payments/create', async (req, res) => {
    try {
        const input = req.body || {};
        const paymentMethod = String(input.paymentMethod || '').toLowerCase();
        if (!['online', 'upi'].includes(paymentMethod) || !Array.isArray(input.items) || !input.items.length) {
            return res.status(400).json({ success: false, message: 'Select online payment to use Razorpay' });
        }
        const items = input.items.map(item => {
            const product = db.getProducts().find(candidate => String(candidate.id) === String(item.id));
            const quantity = Math.max(Number(item.quantity) || 0, 1);
            if (!product || product.active === false) throw new Error(`Product ${item.id} is unavailable`);
            return { id: product.id, name: product.name, price: Number(product.price) || 0, quantity, image: product.image || '' };
        });
        const amount = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100);
        const orderId = `ord_${crypto.randomUUID()}`;
        if (!razorpayClient || !razorpayKeyId) {
            return res.status(500).json({ success: false, message: 'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' });
        }
        const razorpayOrder = await razorpayClient.orders.create({
            amount,
            currency: 'INR',
            receipt: orderId,
            notes: {
                customer_id: String(input.customerId || input.customerEmail || 'guest'),
                customer_name: sanitizeText(input.customerName || 'Customer'),
                customer_email: sanitizeText(input.customerEmail),
                customer_phone: sanitizeText(input.customerPhone || input.shippingAddress?.phone || '0000000000')
            }
        });
        return res.status(201).json({
            success: true,
            orderId,
            amount: amount / 100,
            items,
            payment: {
                id: razorpayOrder.id,
                order_id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key_id: razorpayKeyId,
                razorpay_order_id: razorpayOrder.id,
                receipt: razorpayOrder.receipt
            }
        });
    } catch (error) {
        return res.status(502).json({ success: false, message: error.message || 'Unable to create payment' });
    }
});

app.post('/api/payments/verify', (req, res) => {
    try {
        const { orderId, paymentId, signature } = req.body || {};
        if (!verifyRazorpayPayment({ orderId, paymentId, signature })) {
            return res.status(400).json({ success: false, message: 'Razorpay payment verification failed' });
        }
        return res.json({ success: true, verified: true, paymentId, orderId });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Unable to verify payment' });
    }
});

app.get('/api/themes', (req, res) => res.json({ success: true, default: {}, custom: db.getThemes() }));
app.get('/api/themes/user/:userId', (req, res) => res.json({ success: true, theme: db.getUserTheme(sanitizeText(req.params.userId) || 'guest') }));
app.post('/api/themes/user/:userId', (req, res) => {
    const theme = sanitizeText(req.body?.theme) || 'default';
    return res.json({ success: true, theme: db.setUserTheme(sanitizeText(req.params.userId) || 'guest', theme) });
});
app.post('/api/themes/custom', (req, res) => {
    const theme = req.body && typeof req.body === 'object' ? req.body : {};
    const themeId = sanitizeText(theme.id || theme.key || `custom_${Date.now()}`);
    if (!themeId || themeId === 'default') return res.status(400).json({ success: false, message: 'A valid custom theme id is required' });
    return res.status(201).json({ success: true, theme: db.addTheme(themeId, { ...theme, id: themeId }) });
});

const orderPaymentStatus = order => order.paymentStatus || (order.paymentVerified ? 'Paid' : 'Pending');
const orderStatus = order => order.orderStatus || order.status || 'Pending';
const isPlacedOrder = order => !isGatewayPayment(order.paymentMethod) || order.paymentVerified === true;
const normalizeOrder = order => ({ ...order, orderStatus: orderStatus(order), paymentStatus: orderPaymentStatus(order), customerPhone: order.customerPhone || order.shippingAddress?.phone || '', paymentDate: order.paidAt || order.verifiedAt || null });

app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const week = new Date(today); week.setUTCDate(today.getUTCDate() - 6);
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const orders = db.getOrders().filter(isPlacedOrder).map(normalizeOrder);
    const successfulPayments = db.getPayments().filter(payment => ['Paid', 'successful', 'success'].includes(payment.status) || payment.verified === true);
    const revenue = successfulPayments.length ? successfulPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) : orders.filter(order => order.paymentStatus === 'Paid').reduce((sum, order) => sum + Number(order.total || 0), 0);
    const countSince = start => orders.filter(order => new Date(order.createdAt) >= start).length;
    const revenueSince = start => orders.filter(order => order.paymentStatus === 'Paid' && new Date(order.createdAt) >= start).reduce((sum, order) => sum + Number(order.total || 0), 0);
    const statusCount = status => orders.filter(order => order.orderStatus.toLowerCase() === status.toLowerCase()).length;
    const days = Array.from({ length: 14 }, (_, index) => { const day = new Date(today); day.setUTCDate(today.getUTCDate() - (13 - index)); const next = new Date(day); next.setUTCDate(day.getUTCDate() + 1); return { date: day.toISOString().slice(0, 10), orders: orders.filter(order => { const created = new Date(order.createdAt); return created >= day && created < next; }).length, revenue: orders.filter(order => order.paymentStatus === 'Paid' && new Date(order.createdAt) >= day && new Date(order.createdAt) < next).reduce((sum, order) => sum + Number(order.total || 0), 0) }; });
    return res.json({ success: true, metrics: { totalOrders: orders.length, ordersToday: countSince(today), ordersThisWeek: countSince(week), ordersThisMonth: countSince(month), totalRevenue: revenue, revenueToday: revenueSince(today), pendingPayments: orders.filter(order => order.paymentStatus === 'Pending').length, successfulPayments: orders.filter(order => order.paymentStatus === 'Paid').length, failedPayments: orders.filter(order => order.paymentStatus === 'Failed').length, cancelledOrders: statusCount('Cancelled'), pendingOrders: statusCount('Pending'), completedOrders: statusCount('Delivered') + statusCount('Completed'), registeredUsers: db.getUsers().length }, series: days, paymentBreakdown: ['Paid', 'Failed', 'Pending', 'Refunded'].map(status => ({ status, count: orders.filter(order => order.paymentStatus === status).length })), statusBreakdown: [...new Set(orders.map(order => order.orderStatus))].map(status => ({ status, count: statusCount(status) })), recentOrders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8) });
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
    const query = sanitizeText(req.query.search).toLowerCase();
    const status = sanitizeText(req.query.status).toLowerCase();
    const paymentStatus = sanitizeText(req.query.paymentStatus).toLowerCase();
    const paymentMethod = sanitizeText(req.query.paymentMethod).toLowerCase();
    const from = dateStart(req.query.from); const to = dateEnd(req.query.to);
    const sort = req.query.sort === 'oldest' ? 1 : -1;
    const page = Math.max(Number(req.query.page) || 1, 1); const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const filtered = db.getOrders().filter(isPlacedOrder).map(normalizeOrder).filter(order => { const searchable = `${order.id} ${order.customerName} ${order.customerEmail} ${order.customerPhone}`.toLowerCase(); return (!query || searchable.includes(query)) && (!status || order.orderStatus.toLowerCase() === status) && (!paymentStatus || order.paymentStatus.toLowerCase() === paymentStatus) && (!paymentMethod || order.paymentMethod.toLowerCase() === paymentMethod) && inDateRange(new Date(order.createdAt), from, to); }).sort((a, b) => sort * (new Date(a.createdAt) - new Date(b.createdAt)));
    return res.json({ success: true, orders: filtered.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: filtered.length, pages: Math.ceil(filtered.length / limit) } });
});

app.get('/api/admin/orders/:id', requireAdmin, (req, res) => { const order = db.getOrderById(req.params.id); if (!order) return res.status(404).json({ success: false, message: 'Order not found' }); return res.json({ success: true, order: normalizeOrder(order), timeline: db.getOrderStatusHistory(order.id) }); });
app.get('/api/admin/orders/:id/invoice', requireAdmin, (req, res) => { const order = db.getOrderById(req.params.id); if (!order) return res.status(404).json({ success: false, message: 'Order not found' }); return sendInvoicePdf(res, order); });

app.patch('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
    const allowed = new Set(['Created', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']);
    const nextStatus = sanitizeText(req.body?.status); const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!allowed.has(nextStatus)) return res.status(400).json({ success: false, message: 'Invalid order status' });
    const previous = orderStatus(order); const updated = db.updateOrder(order.id, { orderStatus: nextStatus, status: nextStatus, updatedAt: new Date().toISOString() });
    db.addOrderStatusHistory({ id: `history_${Date.now()}`, orderId: order.id, status: nextStatus, previousStatus: previous, changedBy: req.admin.id, createdAt: new Date().toISOString() });
    db.addAuditLog({ id: `audit_${Date.now()}`, action: 'order.status_changed', adminId: req.admin.id, orderId: order.id, from: previous, to: nextStatus, createdAt: new Date().toISOString() });
    if (nextStatus === 'Cancelled') db.addNotification({ id: `notification_${Date.now()}`, type: 'order.cancelled', message: `Order ${order.id} was cancelled`, read: false, createdAt: new Date().toISOString() });
    return res.json({ success: true, order: normalizeOrder(updated) });
});

app.get('/api/admin/payments', requireAdmin, (req, res) => { const payments = db.getPayments().map(payment => ({ ...payment, status: payment.status || (payment.verified ? 'Paid' : 'Pending') })); return res.json({ success: true, payments: payments.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)) }); });
app.get('/api/admin/users', requireAdmin, (req, res) => { const query = sanitizeText(req.query.search).toLowerCase(); const users = db.getUsers().filter(user => !query || `${user.name} ${user.email} ${user.phone || ''}`.toLowerCase().includes(query)).map(user => { const orders = db.getOrdersByUser(user.id); return { ...publicUser(user), orderCount: orders.length, totalSpent: orders.filter(order => orderPaymentStatus(order) === 'Paid').reduce((sum, order) => sum + Number(order.total || 0), 0) }; }); return res.json({ success: true, users }); });
app.get('/api/admin/users/:id', requireAdmin, (req, res) => { const user = db.getUserById(req.params.id); if (!user) return res.status(404).json({ success: false, message: 'User not found' }); return res.json({ success: true, user: { ...publicUser(user), orders: db.getOrdersByUser(user.id).map(normalizeOrder) } }); });
app.get('/api/admin/notifications', requireAdmin, (req, res) => res.json({ success: true, notifications: db.getNotifications() }));
app.get('/api/admin/products', requireAdmin, (req, res) => res.json({ success: true, products: db.getProducts() }));
app.post('/api/admin/products', requireAdmin, async (req, res) => {
    const body = req.body || {};
    const name = sanitizeText(body.name);
    const price = Number(body.price);
    if (!name || !Number.isFinite(price) || price < 0) return res.status(400).json({ success: false, message: 'Product name and a valid price are required' });
    const product = db.addProduct({ name, price, originalPrice: Number(body.originalPrice) || price, image: sanitizeText(body.image), category: sanitizeText(body.category) || 'general', discount: Number(body.discount) || 0, inStock: body.inStock !== false, active: body.active !== false, delivery: sanitizeText(body.delivery) || '2 days', prime: body.prime === true, size: sanitizeText(body.size) || 'Medium', rating: Math.min(Math.max(Number(body.rating) || 0, 0), 5), reviews: Math.max(Number(body.reviews) || 0, 0), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    const recipients = [...new Set(db.getUsers().map(user => String(user.email || '').trim().toLowerCase()).filter(Boolean))];
    const delivery = await sendProductAnnouncement(product, recipients);
    db.addNotification({ id: `notification_${Date.now()}`, type: 'product.created', message: `New product "${product.name}" published and announced to ${delivery.sent} consumer${delivery.sent === 1 ? '' : 's'}`, read: false, createdAt: new Date().toISOString() });
    db.addAuditLog({ id: `audit_${Date.now()}`, action: 'product.created', adminId: req.admin.id, productId: product.id, createdAt: new Date().toISOString() });
    return res.status(201).json({ success: true, product, delivery });
});
app.patch('/api/admin/products/:id', requireAdmin, (req, res) => {
    const existing = db.getProductById(Number(req.params.id));
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });
    const body = req.body || {};
    const updates = { ...body, name: sanitizeText(body.name), price: Number(body.price), originalPrice: Number(body.originalPrice), category: sanitizeText(body.category), image: sanitizeText(body.image), delivery: sanitizeText(body.delivery), size: sanitizeText(body.size), rating: Math.min(Math.max(Number(body.rating) || 0, 0), 5), reviews: Math.max(Number(body.reviews) || 0, 0), updatedAt: new Date().toISOString() };
    if (!updates.name || !Number.isFinite(updates.price) || updates.price < 0) return res.status(400).json({ success: false, message: 'Product name and a valid price are required' });
    const product = db.updateProduct(existing.id, updates);
    db.addAuditLog({ id: `audit_${Date.now()}`, action: 'product.updated', adminId: req.admin.id, productId: product.id, createdAt: new Date().toISOString() });
    return res.json({ success: true, product });
});
app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    const product = db.getProductById(Number(req.params.id));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    db.deleteProduct(product.id);
    db.addAuditLog({ id: `audit_${Date.now()}`, action: 'product.deleted', adminId: req.admin.id, productId: product.id, createdAt: new Date().toISOString() });
    return res.json({ success: true });
});
app.get('/api/admin/reports/revenue', requireAdmin, (req, res) => { const from = dateStart(req.query.from); const to = dateEnd(req.query.to); const orders = db.getOrders().map(normalizeOrder).filter(order => inDateRange(new Date(order.createdAt), from, to)); const paid = orders.filter(order => order.paymentStatus === 'Paid'); return res.json({ success: true, summary: { totalRevenue: paid.reduce((sum, order) => sum + Number(order.total || 0), 0), pendingAmount: orders.filter(order => order.paymentStatus === 'Pending').reduce((sum, order) => sum + Number(order.total || 0), 0), refundedAmount: orders.filter(order => order.paymentStatus === 'Refunded').reduce((sum, order) => sum + Number(order.total || 0), 0), failedAmount: orders.filter(order => order.paymentStatus === 'Failed').reduce((sum, order) => sum + Number(order.total || 0), 0) }, rows: paid.map(order => ({ date: order.createdAt, orderId: order.id, amount: order.total })) }); });
app.get('/api/admin/reports/export', requireAdmin, (req, res) => { const type = req.query.type; if (type === 'orders') return sendCsv(res, 'orders.csv', ['Order ID', 'Customer', 'Email', 'Total', 'Order Status', 'Payment Status', 'Created At'], db.getOrders().map(normalizeOrder).map(order => [order.id, order.customerName, order.customerEmail, order.total, order.orderStatus, order.paymentStatus, order.createdAt])); if (type === 'payments') return sendCsv(res, 'payments.csv', ['Payment ID', 'Order ID', 'Amount', 'Method', 'Status', 'Transaction ID', 'Created At'], db.getPayments().map(payment => [payment.id, payment.orderId, payment.amount, payment.method || payment.paymentMethod, payment.status || (payment.verified ? 'Paid' : 'Pending'), payment.transactionId, payment.createdAt || payment.timestamp])); return res.status(400).json({ success: false, message: 'Unsupported export type' }); });

app.get('/api/orders/:orderId/invoice', (req, res) => { const order = db.getOrderById(req.params.orderId); if (!order) return res.status(404).json({ success: false, message: 'Order not found' }); const email = sanitizeText(req.query.email).toLowerCase(); if (!email || email !== String(order.customerEmail || '').toLowerCase()) return res.status(403).json({ success: false, message: 'Order email verification required' }); return sendInvoicePdf(res, order); });

// Create a new order
app.post('/api/orders', async (req, res) => {
    try {
        const order = req.body || {};
        // Log incoming order body for debugging (use safe stringify to avoid throwing on circular refs)
        try {
            const orderStr = JSON.stringify(order);
            console.log('[DEBUG] POST /api/orders body:', orderStr.slice(0, 1000));
        } catch (sErr) {
            console.log('[DEBUG] POST /api/orders body: <unserializable payload>', sErr && sErr.message ? sErr.message : sErr);
        }
        // basic validation: items are required. customerEmail/name are optional (guests allowed)
        if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order must include at least one item' });
        }
        // normalize missing customer data for guest orders
        order.customerEmail = order.customerEmail || '';
        order.customerName = order.customerName || 'Guest';
        const paymentMethod = String(order.paymentMethod || 'cod').toLowerCase();
        if (!['cod', 'online', 'upi'].includes(paymentMethod)) {
            return res.status(400).json({ success: false, message: 'Unsupported payment method. Use COD or Razorpay online payment.' });
        }

        // sanitize and normalize order items and fields to avoid serialization errors
        const sanitizedItems = (order.items || []).map(it => {
            const productId = it && (it.id || it.productId || it.sku) ? it.id || it.productId || it.sku : null;
            const product = db.getProducts().find(candidate => String(candidate.id) === String(productId));
            if (!product || product.active === false) throw new Error(`Product ${productId || 'unknown'} is unavailable`);
            return {
                id: product.id,
                name: String(product.name || ''),
                price: Number(product.price) || 0,
                quantity: Number((it && (it.quantity || it.qty)) || 1) || 1,
                image: typeof product.image === 'string' ? product.image : ''
            };
        });

        const computedTotal = sanitizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let verifiedPayment = null;
        if (isGatewayPayment(paymentMethod)) {
            if (!order.paymentOrderId || !order.razorpayPaymentId || !order.razorpaySignature) {
                return res.status(402).json({ success: false, message: 'Complete payment before placing this order' });
            }
            const validSignature = verifyRazorpayPayment({
                orderId: order.paymentOrderId,
                paymentId: order.razorpayPaymentId,
                signature: order.razorpaySignature
            });
            if (!validSignature) {
                return res.status(402).json({ success: false, message: 'Razorpay payment verification failed' });
            }
            verifiedPayment = {
                id: order.razorpayPaymentId,
                order_id: order.paymentOrderId,
                provider: 'razorpay',
                payment_method: paymentMethod,
                gateway_order_id: order.paymentOrderId,
                transaction_id: order.razorpayPaymentId,
                amount: computedTotal * 100,
                currency: 'INR',
                status: 'PAID',
                updated_at: new Date().toISOString()
            };
        }

        const existingGatewayOrder = isGatewayPayment(paymentMethod)
            ? db.getOrders().find(candidate => candidate.paymentOrderId === order.paymentOrderId)
            : null;
        if (existingGatewayOrder) {
            if (existingGatewayOrder.paymentVerified) return res.status(200).json({ success: true, orderId: existingGatewayOrder.id, total: existingGatewayOrder.total, status: existingGatewayOrder.status, paymentVerified: true, message: 'Order already created' });
            const updated = db.updateOrder(existingGatewayOrder.id, { customerEmail: order.customerEmail, customerName: order.customerName, items: sanitizedItems, total: computedTotal, shippingAddress: order.shippingAddress, paymentStatus: 'Paid', paymentVerified: true, transactionId: verifiedPayment.transaction_id || null, gatewayOrderId: verifiedPayment.gateway_order_id || null, status: 'created', orderStatus: 'Pending', paidAt: verifiedPayment.updated_at || new Date().toISOString(), updatedAt: new Date().toISOString() });
            if (!db.getPayments().some(payment => payment.orderId === updated.id)) db.addPayment({ id: verifiedPayment.id || `pay_${Date.now()}`, orderId: updated.id, provider: verifiedPayment.provider || 'razorpay', amount: updated.total, currency: verifiedPayment.currency || 'INR', transactionId: verifiedPayment.utr || verifiedPayment.transaction_id || null, method: paymentMethod, status: 'Paid', paymentDate: verifiedPayment.updated_at || updated.createdAt, createdAt: updated.createdAt, updatedAt: new Date().toISOString() });
            return res.status(200).json({ success: true, orderId: updated.id, total: updated.total, status: updated.status, paymentVerified: true, message: 'Order updated' });
        }

        // generate simple order id
        const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const newOrder = {
            id: orderId,
            orderId,
            userId: order.userId || null,
            customerEmail: order.customerEmail || '',
            customerName: order.customerName || 'Guest',
            items: sanitizedItems,
            total: computedTotal,
            shippingAddress: typeof order.shippingAddress === 'object' && order.shippingAddress ? order.shippingAddress : {},
            paymentMethod,
            status: 'created',
            orderStatus: 'Pending',
            paymentStatus: verifiedPayment ? 'Paid' : 'Pending',
            paymentVerified: Boolean(verifiedPayment),
            transactionId: verifiedPayment?.transaction_id || null,
            gatewayOrderId: verifiedPayment?.gateway_order_id || null,
            paidAt: verifiedPayment?.updated_at || null,
            createdAt: new Date().toISOString()
        };

        // debug dump sizes
        console.log('[DEBUG] Adding order with id:', newOrder.id, 'itemsCount:', newOrder.items.length, 'total:', newOrder.total);
        try {
            db.addOrder(newOrder);
            db.addOrderStatusHistory({ id: `history_${Date.now()}`, orderId: newOrder.id, status: 'Pending', changedBy: 'system', createdAt: newOrder.createdAt });
            if (isGatewayPayment(newOrder.paymentMethod)) {
                db.addOrderStatusHistory({ id: `history_${Date.now()}_payment`, orderId: newOrder.id, status: 'Payment Initiated', changedBy: 'customer', createdAt: newOrder.createdAt });
            }
            db.addNotification({ id: `notification_${Date.now()}`, type: 'order.created', message: `New order ${newOrder.id} received`, read: false, createdAt: newOrder.createdAt });
            if (verifiedPayment) {
                db.addPayment({ id: verifiedPayment.id || `pay_${Date.now()}`, orderId: newOrder.id, provider: verifiedPayment.provider || 'razorpay', amount: newOrder.total, currency: verifiedPayment.currency || 'INR', transactionId: verifiedPayment.transaction_id, method: paymentMethod, status: 'Paid', paymentDate: verifiedPayment.updated_at || newOrder.createdAt, createdAt: newOrder.createdAt, updatedAt: newOrder.createdAt });
            }
            sendOrderConfirmation(newOrder).catch(error => console.error('Order confirmation email failed:', error.message));
        } catch (dbErr) {
            console.error('DB addOrder error:', dbErr && dbErr.stack ? dbErr.stack : dbErr);
            return res.status(500).json({ success: false, message: 'Failed to save order to database', error: dbErr && dbErr.message ? dbErr.message : undefined });
        }

        // respond similarly to what frontend expects
        return res.status(201).json({
            success: true,
            orderId: newOrder.id,
            total: newOrder.total,
            status: newOrder.status,
            paymentVerified: newOrder.paymentVerified,
            message: 'Order created'
        });
    } catch (err) {
        console.error('Error creating order:', err && err.stack ? err.stack : err);
        return res.status(500).json({ success: false, message: 'Failed to create order', error: err && err.message ? err.message : undefined });
    }
});

app.post('/api/orders/:orderId/cancel', (req, res) => {
    try {
        const order = db.getOrderById(req.params.orderId);
        const requesterEmail = sanitizeText(req.body?.customerEmail).toLowerCase();
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (!requesterEmail || requesterEmail !== String(order.customerEmail || '').toLowerCase()) return res.status(403).json({ success: false, message: 'You are not allowed to cancel this order' });
        if (['Delivered', 'Completed', 'Cancelled', 'Refunded'].includes(orderStatus(order))) return res.status(409).json({ success: false, message: 'This order can no longer be cancelled' });
        const reason = sanitizeText(req.body?.reason);
        const now = new Date().toISOString();
        const updated = db.updateOrder(order.id, { status: 'Cancelled', orderStatus: 'Cancelled', cancelReason: reason, cancelledAt: now, updatedAt: now });
        db.addOrderStatusHistory({ id: `history_${Date.now()}`, orderId: order.id, status: 'Cancelled', previousStatus: orderStatus(order), changedBy: 'customer', createdAt: now });
        db.addNotification({ id: `notification_${Date.now()}`, type: 'order.cancelled', message: `Order ${order.id} was cancelled by the customer`, read: false, createdAt: now });
        return res.json({ success: true, order: normalizeOrder(updated) });
    } catch (err) {
        console.error('Cancel order error:', err);
        return res.status(500).json({ success: false, message: 'Failed to cancel order' });
    }
});

app.post('/api/auth/register/request-otp', async (req, res) => {
    try {
        const name = sanitizeText(req.body?.name); const email = sanitizeText(req.body?.email).toLowerCase(); const phone = sanitizeText(req.body?.phone); const password = String(req.body?.password || '');
        if (!name || !email || !phone || password.length < 8) return res.status(400).json({ success: false, message: 'Name, email, phone number and a password of at least 8 characters are required' });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });
        if (!/^\+?[0-9 ()-]{8,20}$/.test(phone)) return res.status(400).json({ success: false, message: 'Enter a valid phone number' });
        if (db.getUserByEmail(email)) return res.status(409).json({ success: false, message: 'User already exists' });
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        registrationChallenges.set(email, { name, email, phone, password, otp, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 });
        const sent = await sendRegistrationOtp(email, otp);
        if (!sent) { registrationChallenges.delete(email); return res.status(503).json({ success: false, message: 'Email delivery is not configured. Add SMTP settings before registering.' }); }
        return res.json({ success: true, message: `A verification code was sent to ${email}` });
    } catch (error) { console.error('OTP request error:', error); return res.status(500).json({ success: false, message: 'Unable to send verification code' }); }
});

app.post('/api/auth/register', (req, res) => {
    try {
        const email = sanitizeText(req.body?.email).toLowerCase(); const otp = String(req.body?.otp || ''); const challenge = registrationChallenges.get(email);
        if (!challenge || challenge.expiresAt < Date.now()) return res.status(400).json({ success: false, message: 'Verification code expired. Request a new code.' });
        if (challenge.attempts >= 5) return res.status(429).json({ success: false, message: 'Too many incorrect codes. Request a new code.' });
        if (challenge.otp !== otp) { challenge.attempts += 1; return res.status(400).json({ success: false, message: 'Incorrect verification code' }); }
        if (db.getUserByEmail(email)) return res.status(409).json({ success: false, message: 'User already exists' });
        const newUser = { id: `u_${Date.now()}`, name: challenge.name, email, phone: challenge.phone, passwordHash: hashPassword(challenge.password), wishlist: [], cart: [], active: true, createdAt: new Date().toISOString() };
        db.addUser(newUser);
        registrationChallenges.delete(email);

        // set cookie for session (httpOnly)
        setCookie(res, 'userId', newUser.id, 30 * 24 * 60 * 60);
        return res.json({ success: true, user: publicUser(newUser) });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

app.post('/api/auth/password/request-otp', async (req, res) => {
    try {
        const email = sanitizeText(req.body?.email).toLowerCase();
        const user = db.getUserByEmail(email);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });
        if (!user || user.active === false) return res.status(404).json({ success: false, message: 'No active account was found for this email' });
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        passwordResetChallenges.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 });
        const sent = await sendPasswordResetOtp(email, otp);
        if (!sent) { passwordResetChallenges.delete(email); return res.status(503).json({ success: false, message: 'Email delivery is not configured' }); }
        return res.json({ success: true, message: `A password reset code was sent to ${email}` });
    } catch (error) { console.error('Password reset OTP error:', error); return res.status(500).json({ success: false, message: error.message || 'Unable to send password reset code' }); }
});

app.post('/api/auth/password/reset', (req, res) => {
    try {
        const email = sanitizeText(req.body?.email).toLowerCase(); const otp = String(req.body?.otp || ''); const password = String(req.body?.password || ''); const challenge = passwordResetChallenges.get(email);
        if (!challenge || challenge.expiresAt < Date.now()) return res.status(400).json({ success: false, message: 'Reset code expired. Request a new code.' });
        if (challenge.attempts >= 5) return res.status(429).json({ success: false, message: 'Too many incorrect codes. Request a new code.' });
        if (challenge.otp !== otp) { challenge.attempts += 1; return res.status(400).json({ success: false, message: 'Incorrect reset code' }); }
        if (password.length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
        const user = db.getUserByEmail(email); if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        db.updateUser(user.id, { passwordHash: hashPassword(password), password: undefined, updatedAt: new Date().toISOString() }); passwordResetChallenges.delete(email);
        return res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) { console.error('Password reset error:', error); return res.status(500).json({ success: false, message: 'Unable to reset password' }); }
});

// Auth: login
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ success: false, message: 'Missing email/password' });

        const user = db.getUserByEmail(email);
        let valid = user && user.passwordHash ? verifyPassword(password, user.passwordHash) : user && user.password === password;
        if (!valid || user.active === false) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        if (user.password && !user.passwordHash) db.updateUser(user.id, { passwordHash: hashPassword(password), password: undefined });

        setCookie(res, 'userId', user.id, 30 * 24 * 60 * 60);
        return res.json({ success: true, user: publicUser(user) });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Auth: logout (clear cookie)
app.post('/api/auth/logout', (req, res) => {
    try {
        clearCookie(res, 'userId');
        return res.json({ success: true, message: 'Logged out' });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ success: false, message: 'Failed to logout' });
    }
});

// Get user data (cart, wishlist, orders)
app.get('/api/users/:userId/data', (req, res) => {
    try {
        const { userId } = req.params;
        const user = db.getUserById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const orders = db.getOrdersByUser(userId).filter(isPlacedOrder);
        return res.json({ success: true, data: { cart: user.cart || [], wishlist: user.wishlist || [], orders } });
    } catch (err) {
        console.error('Get user data error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch user data' });
    }
});

// Update user data (cart, wishlist)
app.post('/api/users/:userId/data', (req, res) => {
    try {
        const { userId } = req.params;
        const { cart, wishlist } = req.body || {};
        const user = db.getUserById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const updated = db.updateUser(userId, { cart: cart || user.cart || [], wishlist: wishlist || user.wishlist || [] });
        return res.json({ success: true, user: updated });
    } catch (err) {
        console.error('Update user data error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update user data' });
    }
});

// Verify payment endpoint (simple stub)
app.get('/api/orders/:orderId/verify-payment', (req, res) => {
    try {
        const { orderId } = req.params;
        const order = db.getOrderById(orderId) || db.getOrderById(orderId.replace(/^ord_?/, ''));
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // for now, return stored paymentVerified flag
        return res.json({ success: true, orderId: order.id, paymentVerified: !!order.paymentVerified, status: order.status });
    } catch (err) {
        console.error('Error verifying payment:', err);
        return res.status(500).json({ success: false, message: 'Verification failed' });
    }
});

// POST endpoint to verify payment and update order status
app.post('/api/orders/:orderId/verify-payment', (req, res) => {
    return res.status(410).json({ success: false, message: 'Manual payment verification is disabled. Payment status is updated by the provider webhook.' });
});


app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found',
        path: req.path
    });
});

// Bind explicitly to 0.0.0.0 so the server is reachable via IPv4 loopback and LAN during development
server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
        console.warn(`Backend port ${PORT} is already in use; using the existing backend instance.`);
        process.exit(0);
    }
    throw error;
});

server.listen(PORT, '0.0.0.0', () => {
    // Print startup info unless QUIET mode is enabled
    if (!process.env.QUIET) {
        console.log(`\n✓ Server is running on ${blueLink(`http://localhost:${PORT}`)}`);
        getNetworkAddresses().forEach(address => console.log(`✓ Network: ${blueLink(`http://${address}:${PORT}`)}`));
        console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`✓ CORS enabled for: http://localhost:3000\n`);
    }
});