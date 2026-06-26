const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'emarket-super-secret-change-in-production';

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    next();
  });
}

function optionalAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) { try { req.user = jwt.verify(token, JWT_SECRET); } catch {} }
  next();
}

module.exports = { authMiddleware, adminMiddleware, optionalAuth, JWT_SECRET };
