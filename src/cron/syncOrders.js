const db = require('../config/database');
const axios = require('axios');

const JAP_API_URL = process.env.JAP_API_URL;
const JAP_API_KEY = process.env.JAP_API_KEY;

async function getJAPOrderStatus(orderId) {
  try {
    const response = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: 'status',
      order: orderId
    });

    return response.data.status || 'unknown';
  } catch (err) {
    console.error(`⚠️ Failed to fetch JAP order status [${orderId}]:`, err.message);
    return 'error';
  }
}

async function syncPendingOrders() {
  try {
    console.log("🔄 Syncing JAP orders...");

    // Fetch orders still not completed
    const result = await db.query(
      "SELECT id, external_order_id FROM orders WHERE status = ANY($1) AND external_order_id IS NOT NULL",
      [['pending', 'processing', 'in progress', 'queued']]
    );

    const pendingOrders = result.rows;

    if (pendingOrders.length === 0) {
      console.log("✅ No pending orders found to sync.");
      return;
    }

    for (const order of pendingOrders) {
      const status = await getJAPOrderStatus(order.external_order_id);

      await db.query(
        "UPDATE orders SET status = $1 WHERE id = $2",
        [status, order.id]
      );

      console.log(`🔹 Order ${order.id} synced → ${status}`);
    }

    console.log(`✅ Synced ${pendingOrders.length} orders.`);
  } catch (error) {
    console.error("🚨 Order sync failed:", error.message);
  }
}

module.exports = syncPendingOrders;
