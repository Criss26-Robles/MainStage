const express = require('express');
const bcrypt = require('bcryptjs');
const { findByEmail, createUser, sanitizeUser } = require('../utils/users');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  if (findByEmail(email)) {
    return res.status(409).json({ error: 'Este email ya está registrado' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser({ name: name.trim(), email: email.trim(), passwordHash });
  const token = generateToken(user);

  res.status(201).json({ user: sanitizeUser(user), token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  const user = findByEmail(email.trim());
  if (!user) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }

  const token = generateToken(user);
  res.json({ user: sanitizeUser(user), token });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;
