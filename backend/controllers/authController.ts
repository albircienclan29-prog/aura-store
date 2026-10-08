import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest, generateToken } from '../middleware/auth';

export const authController = {
  register: (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, email, password, address, city, postal_code, phone } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const existing = db.findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const user = db.createUser({
        name,
        email,
        password_hash: password, // In production, bcrypt.hash
        role: 'customer',
        address,
        city,
        postal_code,
        phone,
      });

      const token = generateToken(user);
      const { password_hash, ...safeUser } = user;
      return res.status(201).json({ user: safeUser, token });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  },

  login: (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = db.findUserByEmail(email);
      if (!user || user.password_hash !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      const { password_hash, ...safeUser } = user;
      return res.json({ user: safeUser, token });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  },

  me: (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { password_hash, ...safeUser } = req.user;
    return res.json({ user: safeUser });
  },

  updateProfile: (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { name, address, city, postal_code, phone } = req.body;
    const updated = db.updateUser(req.user.id, {
      name,
      address,
      city,
      postal_code,
      phone,
    });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    const { password_hash, ...safeUser } = updated;
    return res.json({ user: safeUser });
  },
};
