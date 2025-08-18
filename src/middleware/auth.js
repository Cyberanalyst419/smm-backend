// src/middleware/auth.js
const jwt = require('jsonwebtoken');

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    // Verify JWT using backend secret
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email,
        ...user.user_metadata // preserve any custom fields
      };

      next();
    });
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = { authenticateToken };
