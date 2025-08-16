const supabase = require('../config/supabase');

// 🔹 Get user profile
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('⚠️ Get Profile Error:', err.message);
    res.status(500).json({
      message: 'Failed to load profile.',
      error: err.message,
    });
  }
};

// 🔹 Update user profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { full_name, avatar, bio } = req.body;

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ full_name, avatar, bio })
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('⚠️ Update Profile Error:', err.message);
    res.status(500).json({
      message: 'Failed to update profile.',
      error: err.message,
    });
  }
};
