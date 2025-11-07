const express = require('express');
const { sequelize } = require('./db');
const Collaborator = require('./models/Collaborator');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { authRequired, signToken } = require('./auth');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Password policy: min 8, 1 lower, 1 upper, 1 number, 1 special
function isStrongPassword(pw) {
  if (typeof pw !== 'string') return false;
  const lengthOK = pw.length >= 8;
  const lower = /[a-z]/.test(pw);
  const upper = /[A-Z]/.test(pw);
  const number = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return lengthOK && lower && upper && number && special;
}

app.get('/health', (req, res) => res.json({ ok: true }));

// Public: sign up new user
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and include lowercase, uppercase, number, and special character',
      });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, firstName, lastName });
    const token = signToken({ sub: user.id, email: user.email });
    res.status(201).json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Public: login to get a JWT using DB
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Protect all routes below, but bypass these public endpoints
app.use((req, res, next) => {
  const publicPaths = ['/health', '/api/login', '/api/signup'];
  if (publicPaths.includes(req.path)) return next();
  return authRequired(req, res, next);
});

// Protected: logout (stateless JWT) — client should discard token
app.post('/api/logout', async (req, res) => {
  // With stateless JWT there is nothing to revoke server-side by default.
  // Implement token blacklist if needed. For now, just respond OK.
  return res.status(200).json({ ok: true });
});

app.get('/api/collaborators', async (req, res) => {
  try {
    const rows = await Collaborator.findAll();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/collaborators/:id', async (req, res) => {
  try {
    const row = await Collaborator.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/collaborators', async (req, res) => {
  const { firstName, lastName, email, post } = req.body || {};
  if (!firstName || !lastName || !email || !post) {
    return res.status(400).json({ error: 'firstName, lastName, post and email are required' });
  }
  try {
    const created = await Collaborator.create({ firstName, lastName, email, post });
    res.status(201).json(created);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/collaborators/:id', async (req, res) => {
  const { firstName, lastName, email, post } = req.body || {};
  try {
    const row = await Collaborator.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update({ firstName, lastName, email, post });
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/collaborators/:id', async (req, res) => {
  try {
    const row = await Collaborator.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.destroy();
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
})();
