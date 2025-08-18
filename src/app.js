require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const walletRoutes = require('./routes/wallet');

const { authenticateToken } = require('./middleware/auth');

const app = express();

// ✅ Allowed frontend origins
const allowedOrigins = [
  'https://mediarocket-frontend.vercel.app',
  'http://localhost:3000' // local dev
];

// ✅ CORS Middleware
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (Postman, curl) or from allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn('Blocked CORS request from:', origin);
    return callback(new Error('CORS policy blocked this origin'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Authorization']
}));

// ✅ Handle preflight requests
app.options('*', cors());

// ✅ Built-in middleware to parse JSON
app.use(express.json());

// ✅ Public routes (no auth required)
app.use('/api/auth', authRoutes);

// ✅ Protected routes (auth required)
app.use('/api/services', authenticateToken, serviceRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/wallet', authenticateToken, walletRoutes);

// ✅ Root endpoint
app.get('/', (req, res) => {
  res.send('✅ SMM Backend API is running!');
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message || err);

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'CORS policy blocked this origin' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
