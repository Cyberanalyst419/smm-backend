// src/controllers/manualPaymentsController.js
const supabase = require('../config/supabase');

exports.submitManualPayment = async (req, res) => {
  try {
    const { email, amount, currency, method, reference } = req.body;

    if (!email || !amount || !currency || !method || !reference) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const result = await db.query(
      `INSERT INTO manual_payments (email, amount, currency, method, reference, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())`,
      [email, amount, currency, method, reference]
    );

    return res.status(200).json({ message: "Manual payment submitted. Pending verification." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error submitting manual payment." });
  }
};

exports.getPendingPayments = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM manual_payments WHERE status = 'pending' ORDER BY created_at DESC`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch pending payments." });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const { reference } = req.params;

    const update = await db.query(
      `UPDATE manual_payments SET status = 'completed' WHERE reference = $1 RETURNING *`,
      [reference]
    );

    if (update.rowCount === 0) {
      return res.status(404).json({ message: "Reference not found." });
    }

    return res.status(200).json({ message: "Marked as paid.", data: update.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update payment." });
  }
};
