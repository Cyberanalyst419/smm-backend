// server.js
require('dotenv').config();
const app = require('./src/app');
const { supabaseAdmin } = require('./src/config/supabase');

const retryPendingOrders = require('./src/utils/retryPendingOrders');
const syncPendingOrders = require('./src/cron/syncOrders');
const processAutoOrders = require('./src/cron/processAutoOrders');

const PORT = process.env.PORT || 5000;

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users') // Only call this inside an async function
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Supabase test query failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (err) {
    console.error('❌ Supabase startup error:', err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  await testSupabaseConnection();
  console.log(`✅ Database connected at: ${new Date().toISOString()}`);
});

// Retry failed orders every 10 min
setInterval(async () => {
  console.log('🔁 Retrying failed orders...');
  try {
    await retryPendingOrders();
  } catch (error) {
    console.error('❌ Error in retry job:', error.message);
  }
}, 10 * 60 * 1000);

// Sync BoostProvider Orders every 5 min
setInterval(async () => {
  console.log('🔄 Syncing BoostProvider orders...');
  try {
    await syncPendingOrders();
  } catch (error) {
    console.error('❌ Error syncing orders:', error.message);
  }
}, 5 * 60 * 1000);

// Process Auto Orders every 15 min
setInterval(async () => {
  console.log('📌 Running auto orders check...');
  try {
    await processAutoOrders();
  } catch (error) {
    console.error('❌ Error processing auto orders:', error.message);
  }
}, 15 * 60 * 1000);
