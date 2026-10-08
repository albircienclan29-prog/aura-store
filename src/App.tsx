/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { WishlistModal } from './components/WishlistModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SqlSchemaViewerModal } from './components/admin/SqlSchemaViewerModal';
import { Footer } from './components/Footer';
import { Product, Category } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { notification } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSqlSchemaOpen, setIsSqlSchemaOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(Array.isArray(prodRes.products) ? prodRes.products : []);
      setCategories(Array.isArray(catRes.categories) ? catRes.categories : []);
    } catch (err) {
      console.error('Failed to load catalogue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg border border-neutral-700 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar Contract Navigation */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={(id) => {
          setSelectedCategory(id);
          setIsAdminView(false);
        }}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAdmin={() => setIsAdminView(true)}
        onOpenSqlSchema={() => setIsSqlSchemaOpen(true)}
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isAdminView ? (
          <AdminDashboard
            onOpenSqlSchema={() => setIsSqlSchemaOpen(true)}
            onRefreshCatalog={fetchCatalog}
          />
        ) : (
          <>
            {/* Show Hero only when not filtering specific categories */}
            {selectedCategory === null && (
              <Hero
                onExplore={() => {
                  const elem = document.getElementById('catalog');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            <ProductCatalog
              products={products}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onSelectProduct={setSelectedProduct}
              isLoading={isLoading}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenSqlSchema={() => setIsSqlSchemaOpen(true)}
        onSelectCategory={(id) => {
          setSelectedCategory(id);
          setIsAdminView(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer />

      <CheckoutModal />

      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      <AuthModal />

      <SqlSchemaViewerModal
        isOpen={isSqlSchemaOpen}
        onClose={() => setIsSqlSchemaOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
