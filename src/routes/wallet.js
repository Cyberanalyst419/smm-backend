// src/routes/wallet.js

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const supabase = require('../config/supabase').supabase; // ensure correct import

// GET /api/wallet/balance - Get balance of logged-in user
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('wallets')          // your wallets table
      .select('balance, currency')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    return res.status(200).json({
      balance: data.balance,
      currency: data.currency || 'USD'
    });

  } catch (err) {
    console.error('⚠️ Wallet Fetch Error:', err.message);
    return res.status(500).json({ message: 'Failed to fetch wallet balance' });
  }
});

module.exports = router;
