const supabase = require('../config/supabase');

// ======== GET USER PROFILE ========
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar, balance')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ======== UPDATE USER PROFILE ========
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, username, avatar } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ email, username, avatar })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Profile updated successfully', data });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
