const axios = require('axios');

// 🔹 Fetch services directly from JAP
exports.getAllServices = async (req, res) => {
  try {
    const response = await axios.post(process.env.JAP_API_URL, {
      key: process.env.JAP_API_KEY,
      action: 'services'
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('⚠️ JAP Services Fetch Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch services', error: err.message });
  }
};

// 🔹 Filter JAP services by platform (Instagram, TikTok, etc.)
exports.getByPlatform = async (req, res) => {
  const { platform } = req.params;

  try {
    const response = await axios.post(process.env.JAP_API_URL, {
      key: process.env.JAP_API_KEY,
      action: 'services'
    });

    const services = response.data;

    // Filter services that match the requested platform
    const filtered = services.filter(service =>
      service.category.toLowerCase().includes(platform.toLowerCase())
    );

    res.status(200).json(filtered);
  } catch (err) {
    console.error('⚠️ JAP Platform Filter Error:', err.message);
    res.status(500).json({ message: 'Failed to filter services', error: err.message });
  }
};
