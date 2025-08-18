// src/routes/wallet.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database'); // PostgreSQL pool

// GET /api/wallet/balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT balance, currency FROM wallets WHERE user_id = $1',
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const wallet = result.rows[0];

    res.json({
      balance: parseFloat(wallet.balance) || 0,
      currency: wallet.currency || 'USD',
    });
  } catch (err) {
    console.error('Wallet balance error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/wallet/add-funds
router.post('/add-funds', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    // Update balance
    const updateResult = await pool.query(
      'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 RETURNING balance, currency',
      [parseFloat(amount), userId]
    );

    if (!updateResult.rows.length) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const wallet = updateResult.rows[0];

    res.json({
      message: `Successfully added ${amount} to wallet`,
      balance: parseFloat(wallet.balance),
      currency: wallet.currency || 'USD',
    });
  } catch (err) {
    console.error('Add funds error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
