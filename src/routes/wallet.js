// src/routes/wallet.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const supabase = require('../config/supabase'); // assuming you use supabase client

// GET /api/wallet/balance
router.get('/balance', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', req.user.id)
      .single();

    if (error) return res.status(400).json({ message: error.message });

    res.json({ balance: data.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
