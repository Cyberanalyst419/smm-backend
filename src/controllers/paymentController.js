const axios = require('axios');
const supabase = require('../config/supabase');
const { PAYSTACK_SECRET_KEY } = process.env;

// ✅ Initiate a deposit (Paystack)
const initiateDeposit = async (req, res) => {
  try {
    const { amount, currency = 'GHS' } = req.body;
    const email = req.user?.email || req.body.email;
    const userId = req.user?.id || req.body.userId;

    if (!email || !userId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Convert to kobo/pesewa
        currency
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { data } = response.data;

    // Save deposit record
    await supabase.from('payments').insert([
      {
        user_id: userId,
        amount,
        currency,
        status: 'pending',
        reference: data.reference
      }
    ]);

    res.status(200).json({ success: true, authorization_url: data.authorization_url });

  } catch (err) {
    console.error('Initiate Deposit Error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to initiate deposit' });
  }
};

// ✅ Verify deposit (after Paystack payment)
const verifyDeposit = async (req, res) => {
  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ success: false, message: 'Reference required' });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = response.data.data;

    if (data.status === 'success') {
      // Update payment status
      const { data: paymentRow, error: fetchError } = await supabase
        .from('payments')
        .select('user_id, amount')
        .eq('reference', reference)
        .single();

      if (fetchError || !paymentRow) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      // 1. Mark as success
      await supabase
        .from('payments')
        .update({ status: 'success' })
        .eq('reference', reference);

      // 2. Update user wallet
      await supabase.rpc('add_balance', {
        user_id_input: paymentRow.user_id,
        amount_input: paymentRow.amount
      });

      return res.status(200).json({ success: true, message: 'Payment verified and balance updated' });
    }

    return res.status(400).json({ success: false, message: 'Transaction not successful' });

  } catch (err) {
    console.error('Verify Deposit Error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

// ✅ Manual Payment Submission (for mobile money, bank, etc.)
const manualPayment = async (req, res) => {
  const { email, amount, currency, method, reference, user_id } = req.body;

  if (!email || !amount || !currency || !method || !reference || !user_id) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    await supabase.from('payments').insert([
      {
        user_id,
        amount,
        currency,
        method,
        reference,
        status: 'pending',
        is_manual: true
      }
    ]);

    return res.status(200).json({ success: true, message: "Manual payment submitted and pending approval" });
  } catch (err) {
    console.error('Manual Payment Error:', err.message);
    return res.status(500).json({ success: false, message: "Failed to submit manual payment" });
  }
};

module.exports = {
  initiateDeposit,
  verifyDeposit,
  manualPayment
};
