import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { createHash } from 'node:crypto';

const squareApiBase = process.env.SQUARE_ENVIRONMENT === 'sandbox'
  ? 'https://connect.squareupsandbox.com/v2'
  : 'https://connect.squareup.com/v2';

export const orderController = {
  getPaymentConfig: (_req: AuthenticatedRequest, res: Response) => {
    const applicationId = process.env.SQUARE_APPLICATION_ID;
    const locationId = process.env.SQUARE_LOCATION_ID;
    if (!applicationId || !locationId) {
      return res.status(503).json({ error: 'Card payments are not configured' });
    }
    return res.json({
      applicationId,
      locationId,
      environment: process.env.SQUARE_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'production',
    });
  },

  createOrder: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Please sign in to complete checkout' });
      }

      const {
        customerName,
        customerEmail,
        shippingAddress,
        shippingCity,
        shippingPostal,
        shippingPhone,
        paymentMethod,
        sourceId,
        items,
      } = req.body;

      if (!shippingAddress || !shippingCity || !shippingPostal || !shippingPhone) {
        return res.status(400).json({ error: 'All shipping details are required' });
      }
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one product' });
      }
      if (paymentMethod !== 'card' && paymentMethod !== 'cod') {
        return res.status(400).json({ error: 'Unsupported payment method' });
      }

      for (const item of items) {
        const product = db.getProductById(Number(item.productId));
        if (!product) {
          return res.status(404).json({ error: `Product ID ${item.productId} not found` });
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1 || product.stock_quantity < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for "${product.name}". Only ${product.stock_quantity} available.`,
          });
        }
      }

      const totals = db.calculateOrderTotals(items);
      let transactionReference: string | undefined;
      if (paymentMethod === 'card') {
        const accessToken = process.env.SQUARE_ACCESS_TOKEN;
        const locationId = process.env.SQUARE_LOCATION_ID;
        if (!accessToken || !locationId) {
          return res.status(503).json({ error: 'Card payments are not configured on the server' });
        }
        if (typeof sourceId !== 'string' || !sourceId.trim() || sourceId.length > 256) {
          return res.status(400).json({ error: 'A valid secure card token is required' });
        }

        const squareResponse = await fetch(`${squareApiBase}/payments`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            'Square-Version': '2025-10-16',
          },
          body: JSON.stringify({
            source_id: sourceId,
            idempotency_key: createHash('sha256').update(`${req.user.id}:${sourceId}`).digest('hex'),
            amount_money: { amount: Math.round(totals.totalAmount * 100), currency: 'USD' },
            location_id: locationId,
            autocomplete: true,
            buyer_email_address: customerEmail || req.user.email,
            note: 'Aura Store order',
          }),
        });
        const squareResult = await squareResponse.json() as {
          payment?: { id?: string; status?: string };
          errors?: { detail?: string }[];
        };
        if (!squareResponse.ok || squareResult.payment?.status !== 'COMPLETED' || !squareResult.payment.id) {
          return res.status(402).json({
            error: squareResult.errors?.[0]?.detail || 'Card payment was not completed. Please try another payment method.',
          });
        }
        transactionReference = squareResult.payment.id;
      }

      const order = db.createOrder({
        userId: req.user.id,
        customerName: customerName || req.user.name,
        customerEmail: customerEmail || req.user.email,
        shippingAddress,
        shippingCity,
        shippingPostal,
        shippingPhone,
        paymentMethod,
        paymentStatus: paymentMethod === 'card' ? 'paid' : 'cod',
        transactionReference,
        items,
      });

      const sessionId = req.headers['x-session-id'] as string;
      const { cart } = db.getOrCreateCart(req.user.id, sessionId);
      db.clearCart(cart.id);

      return res.status(201).json({ order, message: 'Order created successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error processing order' });
    }
  },

  getUserOrders: (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const orders = db.getOrders(req.user.id);
      return res.json({ orders });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching orders' });
    }
  },

  getOrderById: (req: AuthenticatedRequest, res: Response) => {
    try {
      const orderId = Number(req.params.id);
      if (isNaN(orderId)) return res.status(400).json({ error: 'Invalid order ID' });

      const order = db.getOrderById(orderId);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      // Only allow owner or admin
      if (req.user && req.user.role !== 'admin' && order.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.json({ order });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error retrieving order' });
    }
  },

  getAllOrders: (_req: AuthenticatedRequest, res: Response) => {
    try {
      const orders = db.getOrders();
      return res.json({ orders });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error retrieving orders' });
    }
  },

  updateStatus: (req: AuthenticatedRequest, res: Response) => {
    try {
      const orderId = Number(req.params.id);
      const { status, paymentStatus } = req.body;

      if (!status) return res.status(400).json({ error: 'Status is required' });

      const updated = db.updateOrderStatus(orderId, status, paymentStatus);
      if (!updated) return res.status(404).json({ error: 'Order not found' });

      return res.json({ order: updated, message: 'Order status updated' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error updating order status' });
    }
  },
};
