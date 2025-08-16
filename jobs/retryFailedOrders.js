const supabase = require('../src/config/supabase');
const { placeOrder } = require('../src/services/apiClient');

async function retryFailedOrders() {
  console.log("🔄 Checking for failed/pending orders...");

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['queued', 'failed']);

    if (error) {
      console.error("❌ Failed to fetch orders:", error.message);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log("✅ No orders to retry.");
      return;
    }

    for (const order of orders) {
      try {
        const apiResponse = await placeOrder({
          service: order.service_id,
          link: order.link,
          quantity: order.quantity
        });

        if (!apiResponse || !apiResponse.order) {
          console.error(`❌ API request failed for order ${order.id}: No order ID returned`);
          continue;
        }

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            external_order_id: apiResponse.order,
            status: 'processing'
          })
          .eq('id', order.id);

        if (updateError) {
          console.error(`❌ Failed to update order ${order.id}:`, updateError.message);
        } else {
          console.log(`✅ Order ${order.id} resubmitted successfully`);
        }

      } catch (err) {
        console.error(`❌ API request failed for order ${order.id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Retry job failed:", err.message);
  }
}

module.exports = retryFailedOrders;
