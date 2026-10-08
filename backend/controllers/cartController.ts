import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const cartController = {
  getCart: (req: AuthenticatedRequest, res: Response) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const { cart, items } = db.getOrCreateCart(req.user?.id, sessionId);
      const subtotal = items.reduce(
        (sum, item) => sum + (item.product ? item.product.price * item.quantity : 0),
        0
      );
      return res.json({ cart, items, subtotal });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching cart' });
    }
  },

  addItem: (req: AuthenticatedRequest, res: Response) => {
    try {
      const { productId, quantity = 1 } = req.body;
      const sessionId = req.headers['x-session-id'] as string;

      if (!productId) {
        return res.status(400).json({ error: 'productId is required' });
      }

      const { cart } = db.getOrCreateCart(req.user?.id, sessionId);
      const item = db.addToCart(cart.id, Number(productId), Number(quantity));

      const { items } = db.getOrCreateCart(req.user?.id, sessionId);
      const subtotal = items.reduce(
        (sum, it) => sum + (it.product ? it.product.price * it.quantity : 0),
        0
      );

      return res.status(201).json({ item, items, subtotal });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error adding item to cart' });
    }
  },

  updateQuantity: (req: AuthenticatedRequest, res: Response) => {
    try {
      const itemId = Number(req.params.id);
      const { quantity } = req.body;
      const sessionId = req.headers['x-session-id'] as string;

      if (isNaN(itemId) || typeof quantity !== 'number') {
        return res.status(400).json({ error: 'Valid itemId and quantity are required' });
      }

      db.updateCartItemQuantity(itemId, quantity);
      const { items } = db.getOrCreateCart(req.user?.id, sessionId);
      const subtotal = items.reduce(
        (sum, it) => sum + (it.product ? it.product.price * it.quantity : 0),
        0
      );

      return res.json({ success: true, items, subtotal });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error updating cart item' });
    }
  },

  removeItem: (req: AuthenticatedRequest, res: Response) => {
    try {
      const itemId = Number(req.params.id);
      const sessionId = req.headers['x-session-id'] as string;

      if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Valid itemId required' });
      }

      db.removeCartItem(itemId);
      const { items } = db.getOrCreateCart(req.user?.id, sessionId);
      const subtotal = items.reduce(
        (sum, it) => sum + (it.product ? it.product.price * it.quantity : 0),
        0
      );

      return res.json({ success: true, items, subtotal });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error removing item' });
    }
  },

  clearCart: (req: AuthenticatedRequest, res: Response) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const { cart } = db.getOrCreateCart(req.user?.id, sessionId);
      db.clearCart(cart.id);
      return res.json({ success: true, items: [], subtotal: 0 });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error clearing cart' });
    }
  },

  getWishlist: (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Sign in to access wishlist' });
      }
      const wishlist = db.getWishlist(req.user.id);
      return res.json({ wishlist });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching wishlist' });
    }
  },

  toggleWishlist: (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Sign in to manage wishlist' });
      }
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'productId required' });
      }

      const result = db.toggleWishlist(req.user.id, Number(productId));
      const wishlist = db.getWishlist(req.user.id);
      return res.json({ ...result, wishlist });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error toggling wishlist' });
    }
  },
};
