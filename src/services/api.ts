import {
  User,
  Product,
  Category,
  CartItem,
  Order,
  Review,
  WishlistItem,
  DashboardMetrics,
} from '../types';

const API_BASE = '/api';

// Retrieve or generate a persistent session ID for guest carts
function getSessionId(): string {
  let sessionId = localStorage.getItem('aura_session_id');
  if (!sessionId) {
    sessionId = `sess_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    localStorage.setItem('aura_session_id', sessionId);
  }
  return sessionId;
}

function getAuthToken(): string | null {
  return localStorage.getItem('aura_auth_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('aura_auth_token', token);
  } else {
    localStorage.removeItem('aura_auth_token');
  }
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const sessionId = getSessionId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetchJson<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    address?: string;
    city?: string;
    postal_code?: string;
    phone?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetchJson<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);
    return res;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return fetchJson<{ user: User }>('/auth/me');
  },

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    return fetchJson<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Products & Categories
  async getProducts(params?: {
    category?: number;
    search?: string;
    featured?: boolean;
    sort?: string;
  }): Promise<{ products: Product[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', String(params.category));
    if (params?.search) query.set('search', params.search);
    if (params?.featured) query.set('featured', 'true');
    if (params?.sort) query.set('sort', params.sort);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<{ products: Product[]; total: number }>(`/products${qs}`);
  },

  async getProduct(id: number): Promise<{ product: Product; reviews: Review[]; related: Product[] }> {
    return fetchJson<{ product: Product; reviews: Review[]; related: Product[] }>(`/products/${id}`);
  },

  async addReview(productId: number, rating: number, comment: string): Promise<{ review: Review }> {
    return fetchJson<{ review: Review }>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },

  async getCategories(): Promise<{ categories: Category[] }> {
    return fetchJson<{ categories: Category[] }>('/categories');
  },

  // Cart
  async getCart(): Promise<{ items: CartItem[]; subtotal: number }> {
    return fetchJson<{ items: CartItem[]; subtotal: number }>('/cart');
  },

  async addToCart(productId: number, quantity: number = 1): Promise<{ items: CartItem[]; subtotal: number }> {
    return fetchJson<{ items: CartItem[]; subtotal: number }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  async updateCartItem(itemId: number, quantity: number): Promise<{ items: CartItem[]; subtotal: number }> {
    return fetchJson<{ items: CartItem[]; subtotal: number }>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  async removeCartItem(itemId: number): Promise<{ items: CartItem[]; subtotal: number }> {
    return fetchJson<{ items: CartItem[]; subtotal: number }>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  async clearCart(): Promise<{ items: CartItem[]; subtotal: number }> {
    return fetchJson<{ items: CartItem[]; subtotal: number }>('/cart/clear', {
      method: 'DELETE',
    });
  },

  // Wishlist
  async getWishlist(): Promise<{ wishlist: WishlistItem[] }> {
    return fetchJson<{ wishlist: WishlistItem[] }>('/wishlist');
  },

  async toggleWishlist(productId: number): Promise<{ added: boolean; wishlist: WishlistItem[] }> {
    return fetchJson<{ added: boolean; wishlist: WishlistItem[] }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Payments
  async getPaymentConfig(): Promise<{ applicationId: string; locationId: string; environment: 'sandbox' | 'production' }> {
    return fetchJson('/payments/config');
  },

  // Orders
  async createOrder(orderData: {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    shippingCity: string;
    shippingPostal: string;
    shippingPhone: string;
    paymentMethod: 'card' | 'cod' | 'bank_transfer';
    sourceId?: string;
    items: { productId: number; quantity: number }[];
  }): Promise<{ order: Order }> {
    return fetchJson<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getUserOrders(): Promise<{ orders: Order[] }> {
    return fetchJson<{ orders: Order[] }>('/orders');
  },

  async getOrder(id: number): Promise<{ order: Order }> {
    return fetchJson<{ order: Order }>(`/orders/${id}`);
  },

  // Admin
  async getAdminStats(): Promise<DashboardMetrics> {
    return fetchJson<DashboardMetrics>('/admin/dashboard');
  },

  async getAllOrders(): Promise<{ orders: Order[] }> {
    return fetchJson<{ orders: Order[] }>('/admin/orders');
  },

  async updateOrderStatus(orderId: number, status: string, paymentStatus?: string): Promise<{ order: Order }> {
    return fetchJson<{ order: Order }>(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, paymentStatus }),
    });
  },

  async createProduct(productData: any): Promise<{ product: Product }> {
    return fetchJson<{ product: Product }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id: number, productData: any): Promise<{ product: Product }> {
    return fetchJson<{ product: Product }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  async deleteProduct(id: number): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  async getSqlSchema(): Promise<{ schema: string; filename: string; tables: string[] }> {
    return fetchJson<{ schema: string; filename: string; tables: string[] }>('/admin/sql-schema');
  },
};
