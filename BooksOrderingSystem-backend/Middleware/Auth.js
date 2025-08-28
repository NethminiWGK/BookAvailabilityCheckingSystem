const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../Controllers/AuthController.js');

const auth = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });

    console.log('Received Token:', token);  // Log the token for debugging

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      console.log('Decoded Payload:', payload);  // Log the decoded payload

      req.user = payload; // { uid, role }
      if (roles.length && !roles.includes(payload.role))
        return res.status(403).json({ message: 'Forbidden' });

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = auth;
