import { Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const adminController = {
  getDashboardStats: (_req: AuthenticatedRequest, res: Response) => {
    try {
      const metrics = db.getAdminMetrics();
      return res.json(metrics);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching admin metrics' });
    }
  },

  createProduct: (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        categoryId,
        name,
        slug,
        description,
        price,
        compareAtPrice,
        sku,
        stockQuantity,
        imageUrl,
        galleryUrls,
        featured,
        isActive,
      } = req.body;

      if (!name || !price || !categoryId || !sku) {
        return res.status(400).json({ error: 'Name, price, category, and SKU are required' });
      }

      const product = db.createProduct({
        category_id: Number(categoryId),
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description || '',
        price: Number(price),
        compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
        sku,
        stock_quantity: Number(stockQuantity) || 0,
        image_url: imageUrl || '/src/assets/images/product_ceramic_vase_1791425554927.jpg',
        gallery_urls: galleryUrls || [],
        featured: Boolean(featured),
        is_active: isActive !== undefined ? Boolean(isActive) : true,
      });

      return res.status(201).json({ product, message: 'Product created successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error creating product' });
    }
  },

  updateProduct: (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

      const updates: any = {};
      const {
        categoryId,
        name,
        slug,
        description,
        price,
        compareAtPrice,
        sku,
        stockQuantity,
        imageUrl,
        featured,
        isActive,
      } = req.body;

      if (categoryId !== undefined) updates.category_id = Number(categoryId);
      if (name !== undefined) updates.name = name;
      if (slug !== undefined) updates.slug = slug;
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = Number(price);
      if (compareAtPrice !== undefined) updates.compare_at_price = compareAtPrice ? Number(compareAtPrice) : null;
      if (sku !== undefined) updates.sku = sku;
      if (stockQuantity !== undefined) updates.stock_quantity = Number(stockQuantity);
      if (imageUrl !== undefined) updates.image_url = imageUrl;
      if (featured !== undefined) updates.featured = Boolean(featured);
      if (isActive !== undefined) updates.is_active = Boolean(isActive);

      const product = db.updateProduct(id, updates);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      return res.json({ product, message: 'Product updated successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error updating product' });
    }
  },

  deleteProduct: (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

      const success = db.deleteProduct(id);
      if (!success) return res.status(404).json({ error: 'Product not found' });

      return res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error deleting product' });
    }
  },

  createCategory: (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, slug, description, imageUrl } = req.body;
      if (!name) return res.status(400).json({ error: 'Category name is required' });

      const category = db.createCategory({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description || '',
        image_url: imageUrl || '',
      });

      return res.status(201).json({ category, message: 'Category created' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error creating category' });
    }
  },

  getUsers: (_req: AuthenticatedRequest, res: Response) => {
    try {
      const users = db.getAllUsers();
      return res.json({ users });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching users' });
    }
  },

  getSqlSchema: (_req: AuthenticatedRequest, res: Response) => {
    try {
      const sqlPath = path.resolve(process.cwd(), 'database', 'ecommerce.sql');
      if (!fs.existsSync(sqlPath)) {
        return res.status(404).json({ error: 'SQL file not found' });
      }
      const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
      return res.json({
        schema: sqlContent,
        filename: 'ecommerce.sql',
        tables: [
          'users',
          'categories',
          'products',
          'cart',
          'cart_items',
          'orders',
          'order_items',
          'payments',
          'reviews',
          'wishlist',
        ],
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error reading SQL schema' });
    }
  },
};
