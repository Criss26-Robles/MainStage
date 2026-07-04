import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import type { SafeUser } from '../types';
import type { User } from '@prisma/client';

export const JWT_SECRET = process.env.JWT_SECRET || 'mainstage-dev-secret-change-in-production';

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export function sanitizeUser(user: User): SafeUser {
  const { password, ...safe } = user;
  return { ...safe, role: safe.role || 'user' };
}

export function generateToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role } satisfies TokenPayload,
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Debes iniciar sesión' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    req.user = sanitizeUser(user);
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión expirada o inválida' });
  }
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
}
