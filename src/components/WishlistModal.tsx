import React from 'react';
import { X, Heart, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose }) => {
  const { wishlist: savedItems, toggleWishlist, addToCart } = useCart();
  const wishlist = Array.isArray(savedItems) ? savedItems : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-neutral-900 fill-neutral-900" />
            <div>
              <h3 className="font-serif-display text-lg text-neutral-900">Your Saved Pieces</h3>
              <p className="text-xs text-neutral-500">{wishlist.length} design objects preserved</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
          {wishlist.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <Heart className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs font-medium text-neutral-800">Your wishlist is currently empty</p>
              <p className="text-[11px] text-neutral-400">Click the heart icon on any piece to save it for later.</p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 bg-neutral-50/70 rounded-xl border border-neutral-100"
              >
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-neutral-200/60 shrink-0">
                  <img
                    src={item.product?.image_url || '/src/assets/images/product_ceramic_vase_1791425554927.jpg'}
                    alt={item.product?.name || 'Saved piece'}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                    {item.product?.name}
                  </h4>
                  <div className="text-[11px] text-neutral-500">
                    {item.product?.category_name}
                  </div>
                  <div className="text-xs font-medium text-neutral-900 mt-1 tabular-nums">
                    ${item.product?.price.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (item.product) {
                        addToCart(item.product.id, 1);
                        toggleWishlist(item.product.id);
                      }
                    }}
                    className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(item.product_id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
