import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    subtotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    openCheckout,
  } = useCart();

  const safeItems = Array.isArray(items) ? items : [];
  if (!isCartOpen) return null;

  const freeShippingThreshold = 300;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-black/5">
          {/* Drawer Header */}
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h3 className="font-serif-display text-lg text-neutral-900">
                Shopping Bag ({safeItems.reduce((acc, it) => acc + it.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress */}
          <div className="px-5 py-3.5 bg-[#F9F9F8] border-b border-black/5">
            <div className="flex justify-between text-xs text-neutral-600 mb-1.5">
              <span>
                {remainingForFreeShipping === 0 ? (
                  <strong className="text-emerald-700">Complimentary Courier Delivery unlocked</strong>
                ) : (
                  <>Add <strong className="text-neutral-900">${remainingForFreeShipping.toFixed(0)}</strong> for free delivery</>
                )}
              </span>
              <span className="font-medium text-neutral-800 tabular-nums">
                {Math.round(progressToFreeShipping)}%
              </span>
            </div>
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-neutral-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {safeItems.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                  <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="text-sm font-medium text-neutral-800">Your shopping bag is empty</p>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Browse our curated catalogue of architectural furniture, ceramics, and acoustics.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              safeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-neutral-50/70 rounded-xl border border-neutral-100 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border border-neutral-200/60 shrink-0">
                    <img
                      src={item.product?.image_url || '/src/assets/images/product_ceramic_vase_1791425554927.jpg'}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                          {item.product?.name || 'Archival Product'}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {item.product?.category_name}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-200 rounded-md bg-white text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 hover:bg-neutral-100 rounded-l transition-colors cursor-pointer text-neutral-600"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-medium text-neutral-800 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 hover:bg-neutral-100 rounded-r transition-colors cursor-pointer text-neutral-600"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-xs font-semibold text-neutral-950 tabular-nums">
                        ${((item.product?.price || item.price_at_addition) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {safeItems.length > 0 && (
            <div className="p-5 border-t border-neutral-100 bg-[#FBFBF9] space-y-4">
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="tabular-nums">${(subtotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="tabular-nums">
                    {subtotal > freeShippingThreshold ? 'Complimentary' : '$25.00'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-semibold text-neutral-950">
                  <span>Total Due</span>
                  <span className="tabular-nums">
                    ${(subtotal + subtotal * 0.08 + (subtotal > freeShippingThreshold ? 0 : 25)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={openCheckout}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>SSL Encrypted & Authentic Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
