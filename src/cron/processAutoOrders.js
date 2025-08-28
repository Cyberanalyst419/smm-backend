// smm-backend/src/cron/processAutoOrders.js

const db = require('../config/database');
const { placeOrder } = require('../services/apiClient'); // JAP client

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

      console.log(`🚀 Placing auto order #${order.id} (Service: ${order.service_id})`);

      // 3️⃣ Place a new order with JAP
      const result = await placeOrder({
        service: order.service_id,   // ✅ JAP service ID
        link: order.link,
        quantity: order.quantity,
      });

      if (result.error) {
        console.error(`❌ Auto order #${order.id} failed: ${result.error}`);
        continue;
      }

      // 4️⃣ Save the new order in orders table
      await db.query(
        `INSERT INTO orders 
          (user_id, service, link, quantity, external_order_id, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.user_id,
          order.service_id, // ✅ Keep consistent with provider ID field
          order.link,
          order.quantity,
          result.order,     // external_order_id from JAP
          'pending',
        ]
      );

      // 5️⃣ Update last_run_at for this auto order
      await db.query(
        `UPDATE auto_orders SET last_run_at = NOW() WHERE id = $1`,
        [order.id]
      );

      console.log(`✅ Auto order #${order.id} placed successfully (JAP Order ID: ${result.order}).`);
    }
  } catch (error) {
    console.error("❌ Auto order cron error:", error.message);
  }
}

module.exports = processAutoOrders;
