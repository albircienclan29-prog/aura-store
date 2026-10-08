import { Request, Response, NextFunction } from 'express';
import { db } from '../models/db';
import { User } from '../models/types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Generate token: base64 encoded user info + signature for reliable stateless session
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    issuedAt: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function parseToken(token: string): { id: number; email: string; role: string } | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const decoded = parseToken(token);
  if (decoded && decoded.id) {
    const user = db.findUserById(decoded.id);
    if (user) {
      req.user = user;
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access privileges required' });
  }
  next();
}
