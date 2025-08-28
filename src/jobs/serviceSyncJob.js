const cron = require('node-cron');
const axios = require('axios');
const pool = require('../config/database');

const API_URL = 'https://justanotherpanel.com/api/v2';
const API_KEY = process.env.JAP_API_KEY || '6a5b0f9c90f8dcb9fcae03d3bbee2d1c'; // ✅ from .env

const syncServicesJob = async () => {
  try {
    console.log("🔄 Syncing services from JAP...");

    // 1️⃣ Fetch all services from JAP
    const res = await axios.post(API_URL, {
      key: API_KEY,
      action: 'services'
    });

    const services = res.data;
    if (!Array.isArray(services)) {
      console.error('❌ Invalid API response from JAP');
      return;
    }

    // 2️⃣ Clear old services
    await pool.query('DELETE FROM services');

    // 3️⃣ Insert new services
    for (const item of services) {
      const {
        service: id,
        name,
        rate,
        min,
        max,
        category,
        type,
        dripfeed,
        refill,
        guarantee
      } = item;

      await pool.query(
        `INSERT INTO services (
          service, name, rate, min, max, category, type, dripfeed, guarantee, platform, tier
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (service) DO UPDATE 
        SET name = EXCLUDED.name,
            rate = EXCLUDED.rate,
            min = EXCLUDED.min,
            max = EXCLUDED.max,
            category = EXCLUDED.category,
            type = EXCLUDED.type,
            dripfeed = EXCLUDED.dripfeed,
            guarantee = EXCLUDED.guarantee,
            platform = EXCLUDED.platform,
            tier = EXCLUDED.tier`,
        [
          id,
          name,
          rate,
          min,
          max,
          category || 'Other',
          type || 'N/A',
          dripfeed ? true : false,
          refill || guarantee || 'None',
          derivePlatform(category),
          'basic'
        ]
      );
    }

    console.log(`✅ Synced ${services.length} JAP services at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("❌ Auto sync failed:", err.message);
  }
};

// Helper: guess platform from category
function derivePlatform(category = '') {
  const cat = category.toLowerCase();
  if (cat.includes('instagram')) return 'instagram';
  if (cat.includes('tiktok')) return 'tiktok';
  if (cat.includes('youtube')) return 'youtube';
  if (cat.includes('twitter')) return 'twitter';
  if (cat.includes('facebook')) return 'facebook';
  if (cat.includes('telegram')) return 'telegram';
  if (cat.includes('whatsapp')) return 'whatsapp';
  if (cat.includes('snapchat')) return 'snapchat';
  if (cat.includes('pinterest')) return 'pinterest';
  if (cat.includes('linkedin')) return 'linkedin';
  if (cat.includes('audiomack')) return 'audiomack';
  if (cat.includes('spotify')) return 'spotify';
  if (cat.includes('apple music')) return 'applemusic';
  return 'general';
}

// Run every 1 hour
cron.schedule('0 * * * *', syncServicesJob);

module.exports = syncServicesJob;
