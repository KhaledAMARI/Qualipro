const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function signToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h', ...options });
}

module.exports = { authRequired, signToken };
