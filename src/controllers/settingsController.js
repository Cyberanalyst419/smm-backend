const supabase = require('../config/supabase');

exports.getSettings = async (req, res) => {
  try {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load settings.', error: err.message });
  }
};

exports.updateSetting = async (req, res) => {
  const { key, value } = req.body;

  try {
    const { error } = await supabase
      .from('settings')
      .update({ value })
      .eq('key', key);

    if (error) throw error;

    res.json({ message: 'Setting updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update setting.', error: err.message });
  }
};
