// src/middleware/auth.js
const { supabaseAdmin } = require('../config/supabase');

module.exports = async function authenticateToken(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = data.user;
    req.user = {
      id: user.id,
      email: user.email,
      ...user.user_metadata,
    };

    return next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
