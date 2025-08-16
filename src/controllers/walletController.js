const supabase = require('../config/supabase');

// ✅ Get wallet balance for logged-in user
exports.getUserBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('wallets')
      .select('balance, currency')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.status(200).json({
      balance: data.balance,
      currency: data.currency || 'USD'
    });

  } catch (err) {
    console.error('⚠️ Wallet Fetch Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
};
