import { Request, Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const productController = {
  getProducts: (req: Request, res: Response) => {
    try {
      const { category, search, featured, sort } = req.query;
      const categoryId = category ? Number(category) : undefined;
      const isFeatured = featured === 'true' ? true : undefined;

      const products = db.getProducts({
        categoryId,
        search: search ? String(search) : undefined,
        featured: isFeatured,
        sort: sort as any,
      });

      return res.json({ products, total: products.length });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching products' });
    }
  },

  getProductById: (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

      const product = db.getProductById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const reviews = db.getReviews(id);
      const related = db.getProducts({ categoryId: product.category_id })
        .filter(p => p.id !== product.id)
        .slice(0, 3);

      return res.json({ product, reviews, related });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching product' });
    }
  },

  getCategories: (_req: Request, res: Response) => {
    try {
      const categories = db.getAllCategories();
      return res.json({ categories });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching categories' });
    }
  },

  addReview: (req: AuthenticatedRequest, res: Response) => {
    try {
      const productId = Number(req.params.id);
      const { rating, comment } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Sign in required to leave a review' });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      }

      if (!comment || comment.trim().length < 5) {
        return res.status(400).json({ error: 'Review comment must be at least 5 characters' });
      }

      const product = db.getProductById(productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const review = db.addReview({
        product_id: productId,
        user_id: req.user.id,
        user_name: req.user.name,
        rating: Math.round(rating),
        comment: comment.trim(),
      });

      return res.status(201).json({ review });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error adding review' });
    }
  },
};
