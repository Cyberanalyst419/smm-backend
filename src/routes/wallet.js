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

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Failed to fetch wallet balance' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.json({
      balance: parseFloat(data.balance) || 0,
      currency: data.currency || 'USD',
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
    // Call RPC to add funds
    const { error } = await supabaseAdmin.rpc('add_funds', {
      user_id_input: userId,
      amount_input: parseFloat(amount)
    });

    if (error) {
      console.error('Add funds RPC error:', error);
      return res.status(500).json({ message: 'Failed to add funds' });
    }

    // Fetch updated balance
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('balance, currency')
      .eq('user_id', userId)
      .single();

    if (walletError || !wallet) {
      return res.status(500).json({ message: 'Failed to retrieve updated balance' });
    }

    res.json({
      message: `Successfully added ${amount} to wallet`,
      balance: parseFloat(wallet.balance),
      currency: wallet.currency || 'USD'
    });
  } catch (err) {
    console.error('Add funds error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
