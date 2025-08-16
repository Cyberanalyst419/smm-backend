const cron = require('node-cron');
const axios = require('axios');
const pool = require('../config/database');

const API_URL = 'https://boostprovider.com/api/v2';
const API_KEY = '67d09115e12500d775a4905013330c08';

const syncServicesJob = async () => {
  try {
    const res = await axios.post(API_URL, {
      key: API_KEY,
      action: 'services'
    });

    const services = res.data;
    if (!Array.isArray(services)) {
      console.log('Invalid API response');
      return;
    }

    await pool.query('DELETE FROM services');

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

      await pool.query(`
        INSERT INTO services (
          id, platform, name, price, min, max, description, speed, guarantee, category, tier
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [
        id,
        category?.toLowerCase() || 'unknown',
        name,
        rate,
        min,
        max,
        type || 'no desc',
        dripfeed ? 'Fast' : 'Standard',
        refill || guarantee || 'None',
        category || 'Other',
        'basic'
      ]);
    }

    console.log(`✅ Auto-synced ${services.length} services at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("❌ Auto sync failed:", err.message);
  }
};

// Schedule to run every hour
cron.schedule('0 * * * *', syncServicesJob);
