const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Create axios client with TLS settings
const smmApiClient = axios.create({
  baseURL: 'https://boostprovider.com/api/v2',
  headers: {
    'Content-Type': 'application/json'
  },
  httpsAgent: new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false // bypass SSL issues if BoostProvider uses non-standard certs
  })
});

const API_KEY = process.env.BOOST_API_KEY; // ✅ Must be defined in .env

// 📤 Place a new order with BoostProvider
async function placeOrder({ service, link, quantity }) {
  try {
    const response = await smmApiClient.post('/', {
      key: API_KEY,
      action: 'add',
      service,
      link,
      quantity
    });

    if (response.data.error) {
      console.error('❌ BoostProvider Order Error:', response.data.error);
      return { error: response.data.error };
    }

    return { order: response.data.order }; // ✅ Success
  } catch (err) {
    console.error('❌ Failed to place order:', err.message);
    return { error: 'Failed to connect to BoostProvider' };
  }
}

// 🔍 Get order status by external order ID
async function getOrderStatus(orderId) {
  try {
    const response = await smmApiClient.post('/', {
      key: API_KEY,
      action: 'status',
      order: orderId
    });

    if (response.data.error) {
      console.error('❌ BoostProvider Status Error:', response.data.error);
      return 'error';
    }

    return response.data.status || 'unknown';
  } catch (err) {
    console.error('❌ Failed to get order status:', err.message);
    return 'error';
  }
}

module.exports = {
  placeOrder,
  getOrderStatus
};
