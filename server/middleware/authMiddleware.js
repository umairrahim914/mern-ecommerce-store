const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects routes — verifies JWT and attaches the user to req.user
const protect = async (req, res, next) => {
  let token;

  // Standard convention: token sent as "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify signature and expiration; throws if invalid/expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch fresh user data from DB using the ID stored in the token payload —
      // never trust stale data baked into the token itself
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      next(); // token valid, user found — proceed to the actual route handler
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };