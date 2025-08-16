const supabase = require('../config/supabase');
const { initializeTransaction, verifyTransaction } = require('../utils/paystack');

// 1. Initialize Paystack transaction
exports.initPaystack = async (req, res) => {
  const { amount } = req.body;
  const email = req.user.email;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Amount must be a valid number' });
  }

  try {
    const callback_url = 'https://your-frontend.com/payment-complete.html'; // ✅ Replace with your frontend callback URL
    const response = await initializeTransaction(email, amount * 100, callback_url); // amount in kobo

    if (!response.status || !response.data.authorization_url) {
      return res.status(500).json({ error: 'Failed to initiate Paystack transaction' });
    }

    return res.status(200).json({
      success: true,
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
    });
  } catch (error) {
    console.error('Paystack init error:', error.message);
    return res.status(500).json({ error: 'Paystack transaction initiation failed' });
  }
};

// 2. Verify Paystack transaction
exports.verifyPaystack = async (req, res) => {
  const { ref } = req.params;
  const userId = req.user.id;

  if (!ref) {
    return res.status(400).json({ error: 'Transaction reference is required' });
  }

  try {
    const result = await verifyTransaction(ref);

    if (!result.status || !result.data || result.data.status !== 'success') {
      return res.status(400).json({ success: false, error: 'Transaction verification failed or was not successful' });
    }

    const data = result.data;

    // ✅ Check if reference was already used
    const existing = await db.query('SELECT * FROM payments WHERE reference = $1', [ref]);
    if (existing.rows.length > 0) {
      return res.status(200).json({ success: true, message: 'Transaction already processed' });
    }

    const amount = data.amount / 100; // Convert kobo to naira

    // ✅ Insert payment record
    await db.query(
      `INSERT INTO payments (user_id, amount, method, status, reference)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, amount, 'Paystack', 'completed', ref]
    );

    // ✅ Update user wallet balance
    await db.query(
      `UPDATE wallets SET balance = balance + $1 WHERE user_id = $2`,
      [amount, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Transaction verified successfully. Wallet updated.',
    });
  } catch (error) {
    console.error('Paystack verification error:', error.message);
    return res.status(500).json({ error: 'An error occurred while verifying the transaction' });
  }
};
