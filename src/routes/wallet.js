// src/routes/wallet.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const supabase = require('../config/supabase');

// GET /api/wallet/balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;

    const { data, error } = await supabase
      .from('wallets')
      .select('balance, currency')
      .eq('user_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.json({
      balance: data.balance,
      currency: data.currency || 'USD'
    });
  } catch (err) {
    console.error('Wallet error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
