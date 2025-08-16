const db = require('../config/database');
const { getOrderStatus } = require('../services/apiClient');

async function syncPendingOrders() {
  try {
    console.log("🔄 Syncing BoostProvider orders...");

    // Fetch pending or in-progress orders
    const result = await db.query(
      "SELECT id, external_order_id FROM orders WHERE status = ANY($1) AND external_order_id IS NOT NULL",
      [['pending', 'in progress']]
    );

    const pendingOrders = result.rows;

    if (pendingOrders.length === 0) {
      console.log("✅ No pending orders found to sync.");
      return;
    }

    for (const order of pendingOrders) {
      const status = await getOrderStatus(order.external_order_id);

      await db.query(
        "UPDATE orders SET status = $1 WHERE id = $2",
        [status, order.id]
      );
    }

    console.log(`✅ Synced ${pendingOrders.length} orders.`);
  } catch (error) {
    console.error("🚨 Order sync failed:", error.message);
  }
}

module.exports = syncPendingOrders;
