const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../Controllers/AuthController.js');  // Ensure correct import

const verifyToken = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  // If the token has "Bearer " at the beginning, remove it
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

  try {
    // Verify the token using JWT_SECRET
    const decoded = jwt.verify(tokenValue, JWT_SECRET);

    // Attach the decoded data (uid and role) to the request object
    req.user = decoded;  // { uid, role }

    console.log('Decoded Payload:', decoded);  // For debugging

    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Token verification failed:', error);  // Log errors for debugging
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
