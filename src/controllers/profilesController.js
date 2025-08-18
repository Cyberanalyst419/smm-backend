const supabase = require('../config/supabase');

exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar')
      .eq('id', userId)
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, email, avatar } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ username, email, avatar })
      .eq('id', userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
