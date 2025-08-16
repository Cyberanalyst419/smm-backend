const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const supabase = require('../config/supabase');

// GET /api/wallet/balance - Get balance of logged-in user
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;

    const { data, error } = await db
      .from('users')
      .select('balance') 
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'User not found or balance unavailable' });
    }

    return res.json({ balance: data.balance });
  } catch (err) {
    console.error('Wallet balance error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
