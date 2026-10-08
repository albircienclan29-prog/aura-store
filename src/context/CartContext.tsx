import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, WishlistItem } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  cartCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  wishlist: WishlistItem[];
  toggleWishlist: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  notification: string | null;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  const refreshCart = useCallback(async () => {
    try {
      const res = await api.getCart();
      setItems(Array.isArray(res.items) ? res.items : []);
      setSubtotal(typeof res.subtotal === 'number' ? res.subtotal : 0);
    } catch (err) {
      console.warn('Failed to fetch cart:', err);
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const res = await api.getWishlist();
      setWishlist(Array.isArray(res.wishlist) ? res.wishlist : []);
    } catch (err) {
      console.warn('Failed to fetch wishlist:', err);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
    refreshWishlist();
  }, [refreshCart, refreshWishlist]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      const res = await api.addToCart(productId, quantity);
      setItems(Array.isArray(res.items) ? res.items : []);
      setSubtotal(typeof res.subtotal === 'number' ? res.subtotal : 0);
      showNotification('Added to your shopping bag');
      setIsCartOpen(true);
    } catch (err: any) {
      showNotification(err.message || 'Could not add to cart');
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      const res = await api.updateCartItem(itemId, quantity);
      setItems(Array.isArray(res.items) ? res.items : []);
      setSubtotal(typeof res.subtotal === 'number' ? res.subtotal : 0);
    } catch (err: any) {
      showNotification(err.message || 'Error updating quantity');
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const res = await api.removeCartItem(itemId);
      setItems(Array.isArray(res.items) ? res.items : []);
      setSubtotal(typeof res.subtotal === 'number' ? res.subtotal : 0);
      showNotification('Item removed');
    } catch (err: any) {
      showNotification(err.message || 'Error removing item');
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setItems([]);
      setSubtotal(0);
    } catch (err: any) {
      console.error(err);
    }
  };

  const toggleWishlist = async (productId: number): Promise<boolean> => {
    if (!user) {
      showNotification('Please sign in to save items to your wishlist');
      return false;
    }
    try {
      const res = await api.toggleWishlist(productId);
      setWishlist(Array.isArray(res.wishlist) ? res.wishlist : []);
      showNotification(res.added ? 'Saved to wishlist' : 'Removed from wishlist');
      return res.added;
    } catch (err: any) {
      showNotification(err.message || 'Could not update wishlist');
      return false;
    }
  };

  const isInWishlist = (productId: number) => {
    return (Array.isArray(wishlist) ? wishlist : []).some(w => w.product_id === productId);
  };

  const safeItems = Array.isArray(items) ? items : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const cartCount = safeItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: safeItems,
        subtotal,
        cartCount,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        wishlist: safeWishlist,
        toggleWishlist,
        isInWishlist,
        isCheckoutOpen,
        openCheckout: () => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        },
        closeCheckout: () => setIsCheckoutOpen(false),
        notification,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
