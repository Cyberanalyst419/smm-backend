const { supabase } = require('../config/supabase');

// GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // comes from auth middleware

    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, balance, avatar, full_name')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

// PUT /api/profile/update (optional)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, avatar, full_name } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ username, email, avatar, full_name })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Profile updated successfully', data });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};
