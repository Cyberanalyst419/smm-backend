const supabase = require('../config/supabase');

// GET /api/auto-orders - List all auto orders for the logged-in user
exports.getAutoOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('auto_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ autoOrders: data });
  } catch (err) {
    console.error('Get auto orders error:', err.message);
    res.status(500).json({ error: 'Failed to load auto orders' });
  }
};

// POST /api/auto-orders - Create new auto order
exports.createAutoOrder = async (req, res) => {
  const userId = req.user.id;
  const { service_id, quantity, link, frequency } = req.body;

  try {
    const { data, error } = await supabase
      .from('auto_orders')
      .insert([{
        user_id: userId,
        service_id,
        quantity,
        link,
        frequency,
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Auto-order created', autoOrder: data });
  } catch (err) {
    console.error('Create auto order error:', err.message);
    res.status(500).json({ error: 'Failed to create auto order' });
  }
};

// DELETE /api/auto-orders/:id - Delete an auto order
exports.deleteAutoOrder = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('auto_orders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Auto-order deleted' });
  } catch (err) {
    console.error('Delete auto order error:', err.message);
    res.status(500).json({ error: 'Failed to delete auto order' });
  }
};
