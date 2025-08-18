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

// ✅ Middleware

// Allow requests only from your frontend domain
app.use(cors({
  origin: 'https://mediarocket-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // replaces body-parser

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (auth required)
app.use('/api/services', authenticateToken, serviceRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/wallet', authenticateToken, walletRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('✅ SMM Backend API is running!');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
