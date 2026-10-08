import { Router } from 'express';
import { authController } from '../controllers/authController';
import { productController } from '../controllers/productController';
import { cartController } from '../controllers/cartController';
import { orderController } from '../controllers/orderController';
import { adminController } from '../controllers/adminController';
import { authenticate, requireAuth, requireAdmin } from '../middleware/auth';

export const apiRouter = Router();

// Apply auth identification to all routes
apiRouter.use(authenticate);

// --- Auth Routes ---
apiRouter.post('/auth/register', authController.register);
apiRouter.post('/auth/login', authController.login);
apiRouter.get('/auth/me', requireAuth, authController.me);
apiRouter.put('/auth/profile', requireAuth, authController.updateProfile);

// --- Products & Categories Routes ---
apiRouter.get('/products', productController.getProducts);
apiRouter.get('/products/:id', productController.getProductById);
apiRouter.post('/products/:id/reviews', requireAuth, productController.addReview);
apiRouter.get('/categories', productController.getCategories);

// --- Shopping Cart Routes ---
apiRouter.get('/cart', cartController.getCart);
apiRouter.post('/cart/items', cartController.addItem);
apiRouter.put('/cart/items/:id', cartController.updateQuantity);
apiRouter.delete('/cart/items/:id', cartController.removeItem);
apiRouter.delete('/cart/clear', cartController.clearCart);

// --- Wishlist Routes ---
apiRouter.get('/wishlist', requireAuth, cartController.getWishlist);
apiRouter.post('/wishlist/toggle', requireAuth, cartController.toggleWishlist);

// --- Order Routes ---
apiRouter.get('/payments/config', orderController.getPaymentConfig);
apiRouter.post('/orders', requireAuth, orderController.createOrder);
apiRouter.get('/orders', requireAuth, orderController.getUserOrders);
apiRouter.get('/orders/:id', requireAuth, orderController.getOrderById);

// --- Admin Protected Routes ---
apiRouter.get('/admin/dashboard', requireAdmin, adminController.getDashboardStats);
apiRouter.get('/admin/orders', requireAdmin, orderController.getAllOrders);
apiRouter.put('/admin/orders/:id/status', requireAdmin, orderController.updateStatus);
apiRouter.post('/admin/products', requireAdmin, adminController.createProduct);
apiRouter.put('/admin/products/:id', requireAdmin, adminController.updateProduct);
apiRouter.delete('/admin/products/:id', requireAdmin, adminController.deleteProduct);
apiRouter.post('/admin/categories', requireAdmin, adminController.createCategory);
apiRouter.get('/admin/users', requireAdmin, adminController.getUsers);
apiRouter.get('/admin/sql-schema', adminController.getSqlSchema); // Available for dev / demo inspection
