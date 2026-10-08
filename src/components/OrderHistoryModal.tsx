import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const safeOrders = Array.isArray(orders) ? orders : [];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      api.getUserOrders()
        .then(res => setOrders(Array.isArray(res.orders) ? res.orders : []))
        .catch(err => console.warn(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="text-emerald-700 text-xs font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="text-sky-700 text-xs font-medium flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="text-amber-700 text-xs font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-rose-700 text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="text-neutral-600 text-xs font-medium">Pending</span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-neutral-900" />
            <div>
              <h3 className="font-serif-display text-lg text-neutral-900">Order History & Receipts</h3>
              <p className="text-xs text-neutral-500">Archived client transactions for {user?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-500">Loading your orders...</div>
          ) : safeOrders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Package className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs font-medium text-neutral-700">No previous orders found</p>
              <p className="text-[11px] text-neutral-400">Your completed purchases will appear here.</p>
            </div>
          ) : (
            safeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#FBFBF9] p-5 rounded-xl border border-neutral-200/80 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-200">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs text-neutral-900">
                      Order #{order.order_number}
                    </span>
                    <div className="text-[11px] text-neutral-500">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Items in order */}
                <div className="space-y-2 text-xs">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-neutral-700">
                      <span>{item.quantity}× {item.product_name}</span>
                      <span className="font-medium tabular-nums">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-xs">
                  <span className="text-neutral-500">
                    Delivered to {order.shipping_city} · {order.payment_status.toUpperCase()}
                  </span>
                  <span className="font-semibold text-neutral-950 text-sm tabular-nums">
                    Total: ${order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
