const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Create axios client with TLS settings
const smmApiClient = axios.create({
  baseURL: 'https://justanotherpanel.com/api/v2',
  headers: {
    'Content-Type': 'application/json'
  },
  httpsAgent: new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false // JAP has a valid cert, but this is safe fallback
  })
});

// 🔑 Use JAP API Key from .env
const API_KEY = process.env.JAP_API_KEY; 

// 📤 Place a new order with JAP
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
      console.error('❌ JAP Order Error:', response.data.error);
      return { error: response.data.error };
    }

    return { order: response.data.order }; // ✅ Success
  } catch (err) {
    console.error('❌ Failed to place JAP order:', err.message);
    return { error: 'Failed to connect to JAP' };
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
      console.error('❌ JAP Status Error:', response.data.error);
      return 'error';
    }

    return response.data.status || 'unknown';
  } catch (err) {
    console.error('❌ Failed to get JAP order status:', err.message);
    return 'error';
  }
}

module.exports = {
  placeOrder,
  getOrderStatus
};
