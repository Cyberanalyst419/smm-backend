// smm-backend/src/cron/processAutoOrders.js

const db = require('../config/database');
// ✅ Corrected import
const { placeOrder } = require('../services/apiClient');

async function processAutoOrders() {
  console.log("📌 Checking auto orders...");

  try {
    // 1️⃣ Fetch all active auto orders
    const { rows: autoOrders } = await db.query(
      `SELECT * FROM auto_orders WHERE status = 'active'`
    );

    if (autoOrders.length === 0) {
      console.log("✅ No active auto orders found.");
      return;
    }

    for (const order of autoOrders) {
      const now = new Date();
      const lastRun = order.last_run_at ? new Date(order.last_run_at) : null;

      // 2️⃣ Check if it's time to run this auto order
      const shouldRun =
        !lastRun ||
        now - lastRun >= order.interval_minutes * 60 * 1000;

      if (!shouldRun) continue;

      console.log(`🚀 Placing auto order #${order.id} (${order.service_id})`);

      // 3️⃣ Place a new order with BoostProvider
      const result = await placeOrder({
        service: order.service_id,
        link: order.link,
        quantity: order.quantity,
      });

      if (result.error) {
        console.error(`❌ Auto order #${order.id} failed: ${result.error}`);
        continue;
      }

      // 4️⃣ Save the new order in orders table
      await db.query(
        `INSERT INTO orders (user_id, service_id, link, quantity, external_order_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.user_id,
          order.service_id,
          order.link,
          order.quantity,
          result.order,
          'pending',
        ]
      );

      // 5️⃣ Update last_run_at for this auto order
      await db.query(
        `UPDATE auto_orders SET last_run_at = NOW() WHERE id = $1`,
        [order.id]
      );

      console.log(`✅ Auto order #${order.id} placed successfully.`);
    }
  } catch (error) {
    console.error("❌ Auto order cron error:", error.message);
  }
}

module.exports = processAutoOrders;
