import React from 'react';
import { ShoppingBag, Heart, User as UserIcon, Shield, Database, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onSelectCategory: (catId: number | null) => void;
  selectedCategory: number | null;
  onOpenOrders: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  onOpenSqlSchema: () => void;
  isAdminView: boolean;
  setIsAdminView: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectCategory,
  selectedCategory,
  onOpenOrders,
  onOpenWishlist,
  onOpenAdmin,
  onOpenSqlSchema,
  isAdminView,
  setIsAdminView,
}) => {
  const { user, openAuthModal, logout, demoLogin } = useAuth();
  const { cartCount, openCart, wishlist: savedWishlist } = useCart();
  const wishlist = Array.isArray(savedWishlist) ? savedWishlist : [];

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/90 backdrop-blur-md border-b border-black/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            setIsAdminView(false);
            onSelectCategory(null);
          }}
          className="text-left group cursor-pointer"
        >
          <span className="font-serif-display text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-black transition-colors">
            AURA
          </span>
        </button>

        {/* Zone 2: 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
          <button
            onClick={() => {
              setIsAdminView(false);
              onSelectCategory(null);
            }}
            className={`transition-colors hover:text-neutral-900 pb-1 border-b-2 cursor-pointer ${
              !isAdminView && selectedCategory === null
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            All Works
          </button>
          <button
            onClick={() => {
              setIsAdminView(false);
              onSelectCategory(1);
            }}
            className={`transition-colors hover:text-neutral-900 pb-1 border-b-2 cursor-pointer ${
              !isAdminView && selectedCategory === 1
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Living
          </button>
          <button
            onClick={() => {
              setIsAdminView(false);
              onSelectCategory(2);
            }}
            className={`transition-colors hover:text-neutral-900 pb-1 border-b-2 cursor-pointer ${
              !isAdminView && selectedCategory === 2
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Acoustics
          </button>
          <button
            onClick={() => {
              setIsAdminView(false);
              onSelectCategory(3);
            }}
            className={`transition-colors hover:text-neutral-900 pb-1 border-b-2 cursor-pointer ${
              !isAdminView && selectedCategory === 3
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Ceramics
          </button>
          <button
            onClick={() => {
              setIsAdminView(false);
              onSelectCategory(4);
            }}
            className={`transition-colors hover:text-neutral-900 pb-1 border-b-2 cursor-pointer ${
              !isAdminView && selectedCategory === 4
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Horology
          </button>
          <button
            onClick={onOpenSqlSchema}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 pb-1 transition-colors cursor-pointer"
            title="Inspect MySQL Schema (ecommerce.sql)"
          >
            <Database className="w-3.5 h-3.5" />
            <span>MySQL Schema</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher */}
          <div className="hidden lg:flex items-center bg-black/5 p-1 rounded-lg text-xs font-medium text-neutral-600">
            <button
              onClick={() => {
                demoLogin('customer');
                setIsAdminView(false);
              }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                user?.role === 'customer'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'hover:text-neutral-900'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => {
                demoLogin('admin');
                setIsAdminView(true);
              }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                user?.role === 'admin'
                  ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                  : 'hover:text-neutral-900'
              }`}
            >
              Admin Mode
            </button>
          </div>

          {/* Admin Dashboard Toggle Button */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsAdminView(!isAdminView)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                isAdminView
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-200/80 text-neutral-900 hover:bg-neutral-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdminView ? 'Storefront' : 'Admin'}</span>
            </button>
          )}

          {/* Wishlist */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2 text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer rounded-full hover:bg-black/5"
            aria-label="View Wishlist"
          >
            <Heart className="w-5 h-5 stroke-[1.75]" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-neutral-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Shopping Bag */}
          <button
            onClick={openCart}
            className="relative p-2 text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer rounded-full hover:bg-black/5"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-neutral-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Menu / Orders */}
          {user ? (
            <div className="relative group">
              <button
                onClick={onOpenOrders}
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-800 hover:text-neutral-950 p-2 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-[11px] font-medium flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-3 py-1.5 text-xs font-medium text-neutral-900 border border-neutral-300 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
