const db = require('../config/database');
const { getOrderStatus } = require('../services/apiClient');

async function retryPendingOrders() {
  try {
    console.log("🔁 Retrying failed/pending orders...");

    // Fetch failed or pending orders
    const result = await db.query(
      "SELECT id, external_order_id FROM orders WHERE status = ANY($1) AND external_order_id IS NOT NULL",
      [['failed', 'pending']]
    );

    const orders = result.rows;

    if (orders.length === 0) {
      console.log("✅ No failed/pending orders to retry.");
      return;
    }

    for (const order of orders) {
      const status = await getOrderStatus(order.external_order_id);

      await db.query(
        "UPDATE orders SET status = $1 WHERE id = $2",
        [status, order.id]
      );
    }

    console.log(`✅ Retried ${orders.length} orders.`);
  } catch (error) {
    console.error("❌ Error in retryPendingOrders:", error.message);
  }
}

module.exports = retryPendingOrders;
