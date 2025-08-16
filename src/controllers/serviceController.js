const supabase = require('../config/supabase');

// 🔹 Get all services
exports.getAllServices = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('platform', { ascending: true });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('⚠️ Services Fetch Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch services.', error: err.message });
  }
};

// 🔹 Get services by platform (e.g., Instagram, TikTok)
exports.getByPlatform = async (req, res) => {
  const { platform } = req.params;

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .ilike('platform', `%${platform}%`);

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('⚠️ Platform Filter Error:', err.message);
    res.status(500).json({ message: 'Failed to filter services.', error: err.message });
  }
};

// 🔹 Get services ordered by category (merged from Postgres query() style)
exports.getServicesByCategory = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('⚠️ Services Category Fetch Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch services by category.', error: err.message });
  }
};
