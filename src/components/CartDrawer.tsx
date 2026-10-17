import React from 'react';
import { X, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { BlackCartIcon } from './BlackCartIcon';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.artwork.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BlackCartIcon className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-bold text-slate-900">
                Your Acquisition Cart ({items.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 py-12">
                <BlackCartIcon className="w-12 h-12 text-neutral-300 mb-3" />
                <p className="font-semibold text-slate-800">Your cart is empty</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Explore original works by emerging CAFA students and support independent art practice.
                </p>
              </div>
            ) : (
              items.map(({ artwork, quantity }) => (
                <div
                  key={artwork.id}
                  className="flex gap-4 p-3 rounded-2xl border border-neutral-200/80 hover:border-neutral-300 transition-colors bg-white shadow-xs"
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 object-cover rounded-xl bg-neutral-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {artwork.title}
                      </h4>
                      <p className="text-xs text-neutral-500 truncate">
                        {artwork.artist} · {artwork.artistDept || artwork.category}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-extrabold text-[#E52535]">
                        ₱{artwork.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => onRemoveItem(artwork.id)}
                        className="text-neutral-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Direct Student Payout Guarantee */}
            {items.length > 0 && (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="font-semibold">100% Student Artist Proceeds:</strong> RED NEXUS applies a 0% platform fee. All acquisition funds go directly to the CAFA student creator.
                </p>
              </div>
            )}
          </div>

          {/* Footer Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping & Museum Crating</span>
                  <span className="text-emerald-600 font-medium">Complimentary</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span className="text-[#E52535]">₱{subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3 px-4 bg-[#E52535] hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
