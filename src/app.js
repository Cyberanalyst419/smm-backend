// src/app.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// ===============================
// ✅ CORS Configuration
// Allow requests from your frontend domain
app.use(cors({
  origin: [
    'http://127.0.0.1:3000',                // local dev
    'https://mediarocket-frontend.vercel.app' // deployed frontend
  ],
  credentials: true, // allow cookies/auth headers
}));

// Handle preflight requests for all routes
app.options('*', cors({
  origin: [
    'http://127.0.0.1:3000',
    'https://mediarocket-frontend.vercel.app'
  ],
  credentials: true,
}));

// ===============================
// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(morgan('dev'));

// ===============================
// Routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const serviceRoutes = require('./routes/services');
const paymentRoutes = require('./routes/payments');
const walletRoutes = require('./routes/wallet'); // ✅ Added wallet route

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes); // ✅ Wallet route

// ===============================
// Health check
app.get('/', (req, res) => {
  res.send('SMM Backend API running.');
});

module.exports = app;
