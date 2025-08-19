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
// 🗄️ Import Supabase Admin Client
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

  // 🔌 Test Supabase admin client
  if (!supabaseAdmin) {
    console.error("❌ Supabase admin client is not initialized. Check your .env file.");
  } else {
    try {
      const { data, error } = await supabaseAdmin.from("users").select("id").limit(1);

      if (error) {
        console.error("❌ Supabase test query failed:", error.message);
        console.error("💡 Hint: Double check your SUPABASE_SERVICE_ROLE_KEY in .env");
      } else {
        console.log("✅ Supabase connected successfully. Sample user:", data);
      }
    } catch (err) {
      console.error("❌ Supabase startup error:", err.message);
    }
  }

  console.log(`✅ Database connected at: ${new Date().toISOString()}`);
});

// ===============================
// 🔁 Retry Failed Orders every 10 min
// ===============================
setInterval(async () => {
  try {
    console.log("🔁 Retrying failed orders...");
    await retryPendingOrders();
  } catch (err) {
    console.error("❌ Error in retry job:", err.message);
  }
}, 10 * 60 * 1000);

// ===============================
// 🔄 Sync BoostProvider Orders every 5 min
// ===============================
setInterval(async () => {
  try {
    console.log("🔄 Syncing BoostProvider orders...");
    await syncPendingOrders();
  } catch (err) {
    console.error("❌ Error syncing orders:", err.message);
  }
}, 5 * 60 * 1000);

// ===============================
// 📌 Process Auto Orders every 15 min
// ===============================
setInterval(async () => {
  try {
    console.log("📌 Running auto orders check...");
    await processAutoOrders();
  } catch (err) {
    console.error("❌ Error processing auto orders:", err.message);
  }
}, 15 * 60 * 1000);
