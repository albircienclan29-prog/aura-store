export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'customer' | 'admin';
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  created_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  sku: string;
  stock_quantity: number;
  image_url: string;
  gallery_urls?: string[];
  featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  rating?: number;
  reviews_count?: number;
}

export interface Cart {
  id: number;
  user_id?: number | null;
  session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price_at_addition: number;
  created_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'cod';

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal: string;
  shipping_phone: string;
  subtotal: number;
  tax: number;
  shipping_fee: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image?: string;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method: 'card' | 'cod' | 'bank_transfer';
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  transaction_reference?: string;
  created_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product?: Product;
  created_at: string;
}
