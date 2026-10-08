import React, { useState } from 'react';
import { X, CheckCircle2, CreditCard, Banknote, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

declare global {
  interface Window {
    Square?: {
      payments: (applicationId: string, locationId: string) => Promise<{
        card: () => Promise<{
          attach: (container: string) => Promise<void>;
          tokenize: () => Promise<{ status: string; token?: string; errors?: { message?: string }[] }>;
          destroy?: () => void;
        }>;
      }>;
    };
  }
}

async function loadSquareSdk(environment: 'sandbox' | 'production') {
  const src = environment === 'sandbox'
    ? 'https://sandbox.web.squarecdn.com/v1/square.js'
    : 'https://web.squarecdn.com/v1/square.js';
  const configuredScript = document.querySelector<HTMLScriptElement>('script[data-square-sandbox-src]');
  if (configuredScript && configuredScript.src !== src) {
    const replacement = document.createElement('script');
    replacement.src = src;
    replacement.async = true;
    await new Promise<void>((resolve, reject) => {
      replacement.onload = () => resolve();
      replacement.onerror = () => reject(new Error('Square payment form failed to load.'));
      configuredScript.replaceWith(replacement);
    });
  }
  if (window.Square) return;
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Square payment form failed to load.')), { once: true });
    });
  } else {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Square payment form failed to load.'));
      document.head.appendChild(script);
    });
  }
  if (!window.Square) throw new Error('Square payment form failed to initialize.');
}

export const CheckoutModal: React.FC = () => {
  const { items, subtotal, isCheckoutOpen, closeCheckout, clearCart, refreshCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<'details' | 'success'>('details');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [squareCard, setSquareCard] = useState<{ tokenize: () => Promise<{ status: string; token?: string; errors?: { message?: string }[] }>; destroy?: () => void } | null>(null);

  // Form Fields
  const [name, setName] = useState(user?.name || 'Elena Vance');
  const [email, setEmail] = useState(user?.email || 'customer@aura.com');
  const [address, setAddress] = useState(user?.address || '44 Kronprinsens Alle');
  const [city, setCity] = useState(user?.city || 'Copenhagen');
  const [postalCode, setPostalCode] = useState(user?.postal_code || '1260');
  const [phone, setPhone] = useState(user?.phone || '+45 32 45 67 89');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');

  React.useEffect(() => {
    if (!isCheckoutOpen || paymentMethod !== 'card') return;
    let mounted = true;
    let cardInstance: typeof squareCard;
    const mountCard = async () => {
      try {
        const config = await api.getPaymentConfig();
        if (!mounted) return;
        await loadSquareSdk(config.environment);
        const payments = await window.Square!.payments(config.applicationId, config.locationId);
        const card = await payments.card();
        const container = document.getElementById('square-card-container');
        if (!container) return;
        await card.attach('#square-card-container');
        if (!mounted) {
          card.destroy?.();
          return;
        }
        cardInstance = card;
        setSquareCard(card);
        setIsPaymentReady(true);
        setErrorMessage(null);
      } catch (err) {
        if (mounted) {
          setIsPaymentReady(false);
          setErrorMessage(err instanceof Error ? err.message : 'Unable to initialize secure card payments.');
        }
      }
    };
    setIsPaymentReady(false);
    setSquareCard(null);
    mountCard();
    return () => {
      mounted = false;
      cardInstance?.destroy?.();
    };
  }, [isCheckoutOpen, paymentMethod]);

  if (!isCheckoutOpen) return null;

  const tax = Number((subtotal * 0.08).toFixed(2));
  const shippingFee = subtotal > 300 ? 0 : 25;
  const totalAmount = Number((subtotal + tax + shippingFee).toFixed(2));

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!address || !city || !postalCode || !phone) {
      setErrorMessage('Please fill in all shipping fields');
      return;
    }

    try {
      setIsSubmitting(true);
      let sourceId: string | undefined;
      if (paymentMethod === 'card') {
        if (!squareCard) throw new Error('Secure card entry is not ready yet. Please wait or refresh.');
        const tokenResult = await squareCard.tokenize();
        if (tokenResult.status !== 'OK' || !tokenResult.token) {
          throw new Error(tokenResult.errors?.map(error => error.message).filter(Boolean).join(' ') || 'Card details could not be verified.');
        }
        sourceId = tokenResult.token;
      }
      const res = await api.createOrder({
        customerName: name,
        customerEmail: email,
        shippingAddress: address,
        shippingCity: city,
        shippingPostal: postalCode,
        shippingPhone: phone,
        paymentMethod,
        sourceId,
        items: items.map(it => ({
          productId: it.product_id,
          quantity: it.quantity,
        })),
      });

      setCreatedOrder(res.order);
      setStep('success');
      await refreshCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="font-serif-display text-xl text-neutral-900">
              {step === 'details' ? 'Secure Checkout' : 'Order Confirmed'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {step === 'details'
                ? 'Review shipping address and payment method'
                : `Reference #${createdOrder?.order_number}`}
            </p>
          </div>
          <button
            onClick={closeCheckout}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleCompleteOrder} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Shipping Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                1. Delivery Address
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 44 Kronprinsens Alle"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                2. Payment Method
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">Credit / Debit Card</div>
                    <div className="text-[11px] text-neutral-500">Instant verification</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">Cash on Delivery (COD)</div>
                    <div className="text-[11px] text-neutral-500">Pay upon package arrival</div>
                  </div>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                  <div id="square-card-container" className="min-h-12" />
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    Card details are securely tokenized by Square and never touch our server.
                  </div>
                  {!isPaymentReady && <p className="text-[11px] text-neutral-500">Loading secure card form…</p>}

                </div>
              )}
            </div>

            {/* Order Summary & Submit Button */}
            <div className="pt-4 border-t border-neutral-100 bg-[#FBFBF9] p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items ({items.reduce((acc, it) => acc + it.quantity, 0)})</span>
                <span className="tabular-nums">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Tax (8%)</span>
                <span className="tabular-nums">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Courier Transit</span>
                <span className="tabular-nums">{shippingFee === 0 ? 'Complimentary' : '$25.00'}</span>
              </div>
              <div className="flex justify-between font-semibold text-neutral-950 text-sm pt-2 border-t border-neutral-200">
                <span>Total Due</span>
                <span className="tabular-nums">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (paymentMethod === 'card' && !isPaymentReady)}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span>Securing Order...</span>
              ) : (
                <>
                  <span>Confirm Order · ${totalAmount.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Order Confirmation View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-[1.75]" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif-display text-2xl text-neutral-900">
                Thank you for your order
              </h3>
              <p className="text-xs text-neutral-500">
                Order <strong className="text-neutral-900">#{createdOrder?.order_number}</strong> confirmed.
                We have notified our warehouse craftsmen.
              </p>
            </div>

            {/* Tracking Stages Tracker */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 text-left">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Shipment Status
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Order Placed
                </span>
                <span className="text-neutral-800 font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Processing
                </span>
                <span className="text-neutral-400">Shipped</span>
                <span className="text-neutral-400">Delivered</span>
              </div>
            </div>

            {/* Summary Details */}
            <div className="p-4 bg-[#FBFBF9] rounded-xl text-xs text-neutral-600 text-left space-y-1.5">
              <div className="flex justify-between">
                <span>Shipping to:</span>
                <strong className="text-neutral-900">{createdOrder?.shipping_address}, {createdOrder?.shipping_city}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment method:</span>
                <strong className="text-neutral-900 uppercase">{createdOrder?.payment_status === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total amount:</span>
                <strong className="text-neutral-900 tabular-nums">${createdOrder?.total_amount}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                closeCheckout();
                setStep('details');
              }}
              className="px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Return to Catalog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
