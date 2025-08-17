// src/routes/wallet.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

// GET /api/wallet/balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('wallets')
      .select('balance, currency')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    return res.json({
      balance: data.balance,
      currency: data.currency || 'USD',
    });
  } catch (err) {
    console.error('Wallet balance error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
