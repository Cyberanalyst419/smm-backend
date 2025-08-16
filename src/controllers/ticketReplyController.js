const supabase = require('../config/supabase');

// ✅ Add a reply to a ticket
exports.addReply = async (req, res) => {
  try {
    const { ticket_id, message } = req.body;
    const user_id = req.user.id;

    if (!ticket_id || !message) {
      return res.status(400).json({ error: 'Ticket ID and message are required.' });
    }

    const { data, error } = await supabase
      .from('ticket_replies')
      .insert([
        {
          ticket_id,
          user_id,
          message
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('❌ Error adding reply:', error.message);
    res.status(500).json({ error: 'Failed to add reply.' });
  }
};

// ✅ Get all replies for a ticket
exports.getReplies = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const { data, error } = await supabase
      .from('ticket_replies')
      .select('*, users(username)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error fetching replies:', error.message);
    res.status(500).json({ error: 'Failed to fetch replies.' });
  }
};
