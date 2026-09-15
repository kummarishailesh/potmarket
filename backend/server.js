import http from 'http';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

http.globalAgent.maxHeaderSize = 128 * 1024;
http.globalAgent.maxRequestHeaderSize = 128 * 1024;

const app = express();
// Default backend port moved to 3001 for local development so Vite can run on 3000
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', '*']
}));

const server = http.createServer(app);
server.maxHeaderSize = 128 * 1024;

app.use(express.json({ limit: '50mb' }));
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

// Create a new order
app.post('/api/orders', (req, res) => {
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

        // sanitize and normalize order items and fields to avoid serialization errors
        const sanitizedItems = (order.items || []).map(it => ({
            id: it && (it.id || it.productId || it.sku) ? it.id || it.productId || it.sku : String(Date.now()),
            name: it && (it.name || it.title) ? String(it.name || it.title) : '',
            price: Number((it && (it.price || it.cost)) || 0) || 0,
            quantity: Number((it && (it.quantity || it.qty)) || 1) || 1
        }));

        const computedTotal = Number(order.total) || sanitizedItems.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

        // generate simple order id
        const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const newOrder = {
            id: orderId,
            orderId,
            customerEmail: order.customerEmail || '',
            customerName: order.customerName || 'Guest',
            items: sanitizedItems,
            total: computedTotal,
            shippingAddress: typeof order.shippingAddress === 'object' && order.shippingAddress ? order.shippingAddress : {},
            paymentMethod: order.paymentMethod || 'cod',
            status: 'created',
            paymentVerified: false,
            createdAt: new Date().toISOString()
        };

        // debug dump sizes
        console.log('[DEBUG] Adding order with id:', newOrder.id, 'itemsCount:', newOrder.items.length, 'total:', newOrder.total);
        try {
            db.addOrder(newOrder);
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

// Auth: register
app.post('/api/auth/register', (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        if (!email || !password || !name) return res.status(400).json({ success: false, message: 'Missing fields' });

        if (db.getUserByEmail(email)) return res.status(409).json({ success: false, message: 'User already exists' });

        const newUser = { id: `u_${Date.now()}`, name, email, password, wishlist: [], cart: [] };
        db.addUser(newUser);

        // set cookie for session (httpOnly)
        res.cookie('userId', newUser.id, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        return res.json({ success: true, user: newUser });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// Auth: login
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ success: false, message: 'Missing email/password' });

        const user = db.getUserByEmail(email);
        if (!user || user.password !== password) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        res.cookie('userId', user.id, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        return res.json({ success: true, user });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Auth: logout (clear cookie)
app.post('/api/auth/logout', (req, res) => {
    try {
        res.clearCookie('userId');
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

        const orders = db.getOrdersByUser(userId);
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
    try {
        const { orderId } = req.params;
        const { transactionId } = req.body || {};

        const order = db.getOrderById(orderId) || db.getOrderById(orderId.replace(/^ord_?/, ''));
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Mark payment as verified and update status
        const updates = {
            paymentVerified: true,
            status: 'Confirmed',
            transactionId: transactionId || `TXN_${Date.now()}`,
            verifiedAt: new Date().toISOString()
        };

        const updated = db.updateOrder(order.id, updates);

        // Save a payment record for audit
        try {
            db.addPayment({
                id: `pay_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                orderId: updated.id,
                amount: updated.total || 0,
                transactionId: updates.transactionId,
                method: (updated.paymentMethod || 'unknown').toLowerCase(),
                timestamp: new Date().toISOString()
            });
        } catch (pErr) {
            console.warn('Failed to save payment record:', pErr.message || pErr);
        }

        // Respond with success (email sending can be handled separately)
        return res.json({ success: true, orderId: updated.id, paymentVerified: true, status: updated.status, emailSent: false });
    } catch (err) {
        console.error('Error verifying payment (POST):', err);
        return res.status(500).json({ success: false, message: 'Failed to verify payment' });
    }
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
server.listen(PORT, '0.0.0.0', () => {
    // Print startup info unless QUIET mode is enabled
    if (!process.env.QUIET) {
        console.log(`\n✓ Server is running on http://localhost:${PORT}`);
        console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`✓ CORS enabled for: http://localhost:3000\n`);
    }
});