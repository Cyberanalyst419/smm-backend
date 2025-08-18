// server.js

// ===============================
// 🌍 Load environment variables
// ===============================
require("dotenv").config();

// ===============================
// 🚀 Import Express app
// ===============================
const app = require("./src/app");

// ===============================
// 🗄️ Import Supabase
// ===============================
const { supabaseAdmin } = require("./src/config/supabase");

// ===============================
// ⏰ Import cron job functions
// ===============================
const retryPendingOrders = require("./src/utils/retryPendingOrders");
const syncPendingOrders = require("./src/cron/syncOrders");
const processAutoOrders = require("./src/cron/processAutoOrders");

const PORT = process.env.PORT || 5000;

// ===============================
// ▶️ Start Express server
// ===============================
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  // 🔌 Test Supabase connection on startup
  try {
    const { data, error } = await supabaseAdmin.from("users").select("id").limit(1);
    if (error) {
      console.error("❌ Supabase test query failed:", error.message);
    } else {
      console.log("✅ Supabase connected successfully");
    }
  } catch (err) {
    console.error("❌ Supabase startup error:", err.message);
  }

  console.log(`✅ Database connected at: ${new Date().toISOString()}`);
});

// ===============================
// 🔁 Retry Failed Orders every 10 min
// ===============================
setInterval(async () => {
  console.log("🔁 Retrying failed orders...");
  try {
    await retryPendingOrders();
  } catch (error) {
    console.error("❌ Error in retry job:", error.message);
  }
}, 10 * 60 * 1000);

// ===============================
// 🔄 Sync BoostProvider Orders every 5 min
// ===============================
setInterval(async () => {
  console.log("🔄 Syncing BoostProvider orders...");
  try {
    await syncPendingOrders();
  } catch (error) {
    console.error("❌ Error syncing orders:", error.message);
  }
}, 5 * 60 * 1000);

// ===============================
// 📌 Process Auto Orders every 15 min
// ===============================
setInterval(async () => {
  console.log("📌 Running auto orders check...");
  try {
    await processAutoOrders();
  } catch (error) {
    console.error("❌ Error processing auto orders:", error.message);
  }
}, 15 * 60 * 1000);

