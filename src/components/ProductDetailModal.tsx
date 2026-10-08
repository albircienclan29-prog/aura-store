import React, { useState, useEffect } from 'react';
import { X, Heart, Star, Check, ShieldCheck, Truck, RotateCcw, Send } from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user, openAuthModal } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setReviewSuccess(false);
      api.getProduct(product.id).then(res => {
        setReviews(Array.isArray(res.reviews) ? res.reviews : []);
      }).catch(err => console.warn(err));
    }
  }, [product]);

  if (!product) return null;

  const wishlisted = isInWishlist(product.id);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!newComment.trim()) return;

    try {
      setIsSubmittingReview(true);
       const res = await api.addReview(product.id, newRating, newComment);
      setReviews(currentReviews => [...(Array.isArray(currentReviews) ? currentReviews : []), res.review]);
      setNewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 hover:bg-white text-neutral-600 hover:text-neutral-950 transition-colors shadow-xs cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Visual Gallery */}
          <div className="md:col-span-6 bg-[#F9F9F8] p-6 sm:p-8 flex flex-col justify-between">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-black/5 shadow-xs">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Quality Guarantees */}
            <div className="mt-8 pt-6 border-t border-black/5 space-y-3 text-xs text-neutral-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-neutral-800" />
                <span>Express courier shipping with carbon-neutral transit</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-neutral-800" />
                <span>5-year craftsmanship warranty & authenticity certificate</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-neutral-800" />
                <span>30-day effortless returns in original packaging</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Unboxed Metadata Header */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                <span className="uppercase tracking-wider font-medium text-[11px]">
                  {product.category_name}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">SKU: {product.sku}</span>
                <span aria-hidden="true">·</span>
                <span className={product.stock_quantity > 0 ? 'text-emerald-700 font-medium' : 'text-rose-600'}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Sold out'}
                </span>
              </div>

              {/* Title & Price */}
              <h2 className="font-serif-display text-2xl sm:text-3xl text-neutral-900 leading-tight">
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-neutral-950 tabular-nums">
                  ${product.price.toLocaleString()}
                </span>
                {product.compare_at_price && (
                  <span className="text-sm text-neutral-400 line-through tabular-nums">
                    ${product.compare_at_price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Design Specifications
                </h4>
                <p className="text-sm text-neutral-600 leading-relaxed font-light">
                  {product.description}
                </p>
              </div>

              {/* Quantity Stepper & Buy Actions */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-neutral-600">Quantity</span>
                  <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50 text-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 hover:bg-neutral-200 rounded-l-lg transition-colors cursor-pointer text-neutral-700"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 font-semibold text-neutral-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-3 py-1.5 hover:bg-neutral-200 rounded-r-lg transition-colors cursor-pointer text-neutral-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={product.stock_quantity === 0}
                    onClick={() => {
                      addToCart(product.id, quantity);
                      onClose();
                    }}
                    className="flex-1 py-3.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-sm font-medium rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    {product.stock_quantity > 0 ? `Add to Bag · $${(product.price * quantity).toLocaleString()}` : 'Out of Stock'}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      wishlisted
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                    aria-label="Wishlist toggle"
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Reviews & Feedback Section */}
            <div className="mt-8 pt-6 border-t border-neutral-100 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-900">
                  Client Reviews ({safeReviews.length})
                </h4>
                <div className="flex items-center gap-1 text-xs font-medium text-neutral-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="tabular-nums">
                    {safeReviews.length > 0
                      ? (safeReviews.reduce((acc, r) => acc + r.rating, 0) / safeReviews.length).toFixed(1)
                      : '5.0'}
                  </span>
                </div>
              </div>

              {/* Review Input Form */}
              <form onSubmit={handleAddReview} className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-700">Write an impression</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="text-amber-400 cursor-pointer p-0.5"
                      >
                        <Star
                          className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400' : 'text-neutral-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={user ? "Share your thoughts on build quality, tactile feel..." : "Sign in to leave a review"}
                    disabled={!user}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  {user ? (
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !newComment.trim()}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={openAuthModal}
                      className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Sign In
                    </button>
                  )}
                </div>
                {reviewSuccess && (
                  <p className="text-[11px] text-emerald-600 font-medium">Thank you! Your review has been recorded.</p>
                )}
              </form>

              {/* Reviews List */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {safeReviews.map((rev) => (
                  <div key={rev.id} className="text-xs p-3 rounded-lg bg-neutral-50/60 border border-neutral-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-neutral-800">{rev.user_name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-neutral-600 font-light leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
