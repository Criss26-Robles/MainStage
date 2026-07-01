const jwt = require('jsonwebtoken');
const { findById, sanitizeUser } = require('../utils/users');

const JWT_SECRET = process.env.JWT_SECRET || 'mainstage-dev-secret-change-in-production';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Debes iniciar sesión' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    req.user = sanitizeUser(user);
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión expirada o inválida' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware, generateToken, JWT_SECRET };
