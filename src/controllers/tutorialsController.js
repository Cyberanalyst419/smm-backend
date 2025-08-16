const supabase = require('../config/supabase');

exports.getAllTutorials = async (req, res) => {
  try {
    const { data, error } = await supabase.from('tutorials').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load tutorials.', error: err.message });
  }
};
