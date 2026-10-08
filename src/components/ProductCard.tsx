import React from 'react';
import { Heart, Plus, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-black/5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Product Image Area */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-[4/3] bg-[#F9F9F8] overflow-hidden cursor-pointer"
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors backdrop-blur-md cursor-pointer ${
            wishlisted
              ? 'bg-neutral-900 text-white'
              : 'bg-white/80 text-neutral-700 hover:bg-white hover:text-neutral-950'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? 'fill-current' : 'stroke-[1.75]'}`}
          />
        </button>

        {/* Stock / Limited status tag (single subtle tag, not pill spam) */}
        {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-[11px] font-medium text-amber-800 px-2.5 py-1 rounded border border-amber-200/50">
            Only {product.stock_quantity} remaining
          </span>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div className="space-y-1.5">
          {/* Zero-Pill Metadata Line */}
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="uppercase tracking-wider text-[11px] font-medium">
              {product.category_name || 'Design Object'}
            </span>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1 text-neutral-600">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="tabular-nums font-medium">{product.rating || 5.0}</span>
              {product.reviews_count !== undefined && product.reviews_count > 0 && (
                <span className="text-neutral-400">({product.reviews_count})</span>
              )}
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelect(product)}
            className="text-base font-semibold text-neutral-900 group-hover:text-black transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Bottom Bar: Price & Quick Action */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-medium text-neutral-950 tabular-nums">
              ${product.price.toLocaleString()}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-neutral-400 line-through tabular-nums">
                ${product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product.id, 1)}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            aria-label={`Add ${product.name} to bag`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
