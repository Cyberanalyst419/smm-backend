// src/controllers/profilesController.js

const { supabaseAdmin } = require('../config/supabase');

// ==========================
// Get User Profile
// ==========================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, balance, avatar, full_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Supabase error (getProfile):', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================
// Update User Profile
// ==========================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { username, email, avatar, full_name } = req.body;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ username, email, avatar, full_name })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error (updateProfile):', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Profile updated successfully', data });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
