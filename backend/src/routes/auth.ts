import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateToken, authMiddleware, sanitizeUser } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};

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

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({ error: 'Este email ya está registrado' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalizedEmail, password: passwordHash }
  });

  const token = generateToken(user);
  res.status(201).json({ user: sanitizeUser(user), token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
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

export default router;
