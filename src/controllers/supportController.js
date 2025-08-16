const supabase = require('../config/supabase');

// Create a new support ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required.' });
    }

    const result = await pool.query(
      `INSERT INTO support_tickets (user_id, subject, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, subject, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create support ticket.' });
  }
};

// Get all tickets for current user
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets.' });
  }
};

// (Optional) Admin: Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM support_tickets ORDER BY created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets.' });
  }
};
