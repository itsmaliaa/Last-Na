import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
} from 'lucide-react';
import { BuyerAddress, CartItem, CheckoutDetails } from '../types';

interface CartCheckoutViewProps {
  items: CartItem[];
  savedAddresses: BuyerAddress[];
  onRemoveItem: (id: string) => void;
  onContinueShopping: () => void;
  onPlaceOrder: (details: CheckoutDetails) => void;
}

export const CartCheckoutView: React.FC<CartCheckoutViewProps> = ({
  items,
  savedAddresses,
  onRemoveItem,
  onContinueShopping,
  onPlaceOrder,
}) => {
  const [step, setStep] = useState<'cart' | 'delivery' | 'review'>('cart');
  const [details, setDetails] = useState<CheckoutDetails>({
    deliveryMethod: 'door_to_door',
    paymentMethod: 'Cash on delivery',
    recipientName: '',
    phone: '',
    deliveryAddress: '',
  });
  const [selectedAddressId, setSelectedAddressId] = useState(
    savedAddresses.find((address) => address.isDefault)?.id || savedAddresses[0]?.id || ''
  );
  const selectedAddress = savedAddresses.find((address) => address.id === selectedAddressId);

  const subtotal = items.reduce((sum, item) => sum + item.artwork.price * item.quantity, 0);
  const deliveryFee = details.deliveryMethod === 'campus_pickup' ? 0 : null;
  const total = subtotal + (deliveryFee || 0);

  const updateDeliveryMethod = (deliveryMethod: CheckoutDetails['deliveryMethod']) => {
    setDetails((current) => ({
      ...current,
      deliveryMethod,
      paymentMethod: deliveryMethod === 'campus_pickup' ? 'Pay at campus pickup' : 'Cash on delivery',
    }));
  };

  const formatPrice = (price: number) => `₱${price.toLocaleString()}`;
  const paymentMethods = details.deliveryMethod === 'campus_pickup'
    ? [
        { name: 'Pay at campus pickup', brand: 'PAY', style: 'bg-slate-800 text-white', description: 'Pay directly when you collect your order' },
        { name: 'GCash', brand: 'GCash', style: 'bg-[#007DFE] text-white', description: 'Mobile wallet · coordinate payment with seller' },
        { name: 'Maya', brand: 'maya', style: 'bg-[#00A86B] text-white', description: 'Mobile wallet · coordinate payment with seller' },
        { name: 'Bank transfer · BPI', brand: 'BPI', style: 'bg-[#8A1538] text-white', description: 'Bank transfer · details shared by seller' },
        { name: 'Bank transfer · BDO', brand: 'BDO', style: 'bg-[#003A70] text-white', description: 'Bank transfer · details shared by seller' },
        { name: 'Bank transfer · UnionBank', brand: 'UB', style: 'bg-[#E52535] text-white', description: 'Bank transfer · details shared by seller' },
      ]
    : [
        { name: 'Cash on delivery', brand: 'COD', style: 'bg-slate-800 text-white', description: 'Pay the delivery person when your order arrives' },
        { name: 'GCash', brand: 'GCash', style: 'bg-[#007DFE] text-white', description: 'Mobile wallet · coordinate payment with seller' },
        { name: 'Maya', brand: 'maya', style: 'bg-[#00A86B] text-white', description: 'Mobile wallet · coordinate payment with seller' },
        { name: 'Bank transfer · BPI', brand: 'BPI', style: 'bg-[#8A1538] text-white', description: 'Bank transfer · details shared by seller' },
        { name: 'Bank transfer · BDO', brand: 'BDO', style: 'bg-[#003A70] text-white', description: 'Bank transfer · details shared by seller' },
        { name: 'Bank transfer · UnionBank', brand: 'UB', style: 'bg-[#E52535] text-white', description: 'Bank transfer · details shared by seller' },
      ];

  const submitOrder = () => {
    if (details.deliveryMethod === 'door_to_door' && !selectedAddress) return;
    onPlaceOrder({
      ...details,
      recipientName: selectedAddress?.name || 'Ana Reyes',
      phone: selectedAddress?.phone || '',
      deliveryAddress: details.deliveryMethod === 'door_to_door' && selectedAddress
        ? `${selectedAddress.line1}, ${selectedAddress.city}`
        : '',
      addressId: selectedAddress?.id,
    });
  };

  const heading = step === 'cart'
    ? 'Your cart'
    : step === 'delivery'
    ? 'Delivery and payment'
    : 'Review your order';

  return (
    <main className="min-h-screen bg-[#FAF9F6]/60 py-8 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-7 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={onContinueShopping}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue shopping
            </button>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">Red Nexus ArtMart</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">{heading}</h1>
          </div>

          <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold sm:gap-3" aria-label="Checkout progress">
            {([
              ['cart', 'Cart'],
              ['delivery', 'Delivery & payment'],
              ['review', 'Order summary'],
            ] as const).map(([key, label], index) => {
              const active = step === key;
              const complete = ['cart', 'delivery', 'review'].indexOf(step) > index;
              return (
                <li key={key} className="flex items-center gap-2">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    active || complete
                      ? 'border-red-700 bg-red-700 text-white'
                      : 'border-neutral-300 bg-white text-neutral-500'
                  }`}>
                    {complete ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className={active ? 'text-slate-900' : 'text-neutral-500'}>{label}</span>
                  {index < 2 && <span className="mx-1 h-px w-4 bg-neutral-300 sm:w-8" />}
                </li>
              );
            })}
          </ol>
        </div>

        {items.length === 0 ? (
          <section className="rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-neutral-300" />
            <h2 className="mt-4 text-xl font-extrabold text-slate-900">Your cart is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
              Discover original work by CAFA student artists and add a piece to your cart.
            </p>
            <button
              type="button"
              onClick={onContinueShopping}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E52535] px-6 py-3 font-bold text-white hover:bg-red-700"
            >
              Browse artworks <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <section className="space-y-5 lg:col-span-2">
              {step === 'cart' && (
                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
                  <div className="border-b border-neutral-100 p-5 sm:p-6">
                    <h2 className="text-lg font-extrabold text-slate-900">Artwork in your cart</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {items.length} {items.length === 1 ? 'artwork' : 'artworks'} · Original work from independent student artists
                    </p>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {items.map(({ artwork, quantity }) => (
                      <article key={artwork.id} className="flex gap-4 p-5 sm:p-6">
                        <img
                          src={artwork.image}
                          alt={artwork.title}
                          className="h-24 w-24 shrink-0 rounded-2xl bg-neutral-100 object-cover sm:h-28 sm:w-28"
                        />
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-900">{artwork.title}</h3>
                            <p className="mt-1 text-sm text-neutral-500">{artwork.artist}</p>
                            <p className="mt-1 text-xs capitalize text-neutral-400">
                              {artwork.mediumsUsed?.split(',')[0] || artwork.category} · Qty {quantity}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                            <span className="font-extrabold text-red-700">{formatPrice(artwork.price * quantity)}</span>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(artwork.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-neutral-500 hover:bg-red-50 hover:text-red-700"
                              aria-label={`Remove ${artwork.title} from cart`}
                            >
                              <Trash2 className="h-4 w-4" /> Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  <div className="flex items-start gap-3 border-t border-emerald-100 bg-emerald-50/70 p-5 text-sm text-emerald-900">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                    <p><strong>Supporting student artists.</strong> Each piece is an original work from the CAFA creative community.</p>
                  </div>
                </div>
              )}

              {step === 'delivery' && (
                <form
                  id="delivery-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setStep('review');
                  }}
                  className="space-y-5 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7"
                >
                  <fieldset>
                    <legend className="text-lg font-extrabold text-slate-900">Choose a delivery method</legend>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${
                        details.deliveryMethod === 'campus_pickup' ? 'border-red-500 bg-red-50/60' : 'border-neutral-200'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="campus_pickup"
                          checked={details.deliveryMethod === 'campus_pickup'}
                          onChange={() => updateDeliveryMethod('campus_pickup')}
                          className="mt-1 accent-red-600"
                        />
                        <span>
                          <span className="flex items-center gap-2 font-bold text-slate-900">
                            <Store className="h-4 w-4 text-red-700" /> Campus pickup
                          </span>
                          <span className="mt-1 block text-sm text-neutral-500">Collect from the CAFA Main Campus Pickup Desk. No delivery fee.</span>
                        </span>
                      </label>
                      <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${
                        details.deliveryMethod === 'door_to_door' ? 'border-red-500 bg-red-50/60' : 'border-neutral-200'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="door_to_door"
                          checked={details.deliveryMethod === 'door_to_door'}
                          onChange={() => updateDeliveryMethod('door_to_door')}
                          className="mt-1 accent-red-600"
                        />
                        <span>
                          <span className="flex items-center gap-2 font-bold text-slate-900">
                            <Truck className="h-4 w-4 text-red-700" /> Door-to-door
                          </span>
                          <span className="mt-1 block text-sm text-neutral-500">The seller will arrange delivery and share the carrier and tracking reference.</span>
                        </span>
                      </label>
                    </div>
                  </fieldset>

                  {details.deliveryMethod === 'door_to_door' ? (
                    <fieldset>
                      <legend className="text-lg font-extrabold text-slate-900">Select a saved address</legend>
                      <div className="mt-3 space-y-3">
                        {savedAddresses.map((address) => (
                          <label
                            key={address.id}
                            className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${
                              selectedAddressId === address.id
                                ? 'border-red-500 bg-red-50/60'
                                : 'border-neutral-200 hover:border-red-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="savedAddress"
                              value={address.id}
                              checked={selectedAddressId === address.id}
                              onChange={() => setSelectedAddressId(address.id)}
                              className="mt-1 accent-red-600"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2 font-bold text-slate-900">
                                <MapPin className="h-4 w-4 text-red-700" />
                                {address.label}
                                {address.isDefault && (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                    Default
                                  </span>
                                )}
                              </span>
                              <span className="mt-2 block text-sm text-slate-700">{address.name} · {address.phone}</span>
                              <span className="mt-1 block text-sm leading-relaxed text-neutral-500">
                                {address.line1}, {address.city}
                              </span>
                            </span>
                          </label>
                        ))}
                        {savedAddresses.length === 0 && (
                          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                            No saved delivery address is available. Add an address in your buyer profile before placing a door-to-door order.
                          </p>
                        )}
                      </div>
                    </fieldset>
                  ) : (
                    <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                      <MapPin className="h-5 w-5 shrink-0" />
                      <p><strong>Pickup point:</strong> CAFA Main Campus Pickup Desk. The seller will message you when the artwork is ready.</p>
                    </div>
                  )}

                  <fieldset>
                    <legend className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                      <CreditCard className="h-5 w-5 text-red-700" /> Payment preference
                    </legend>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.name}
                          className={`flex min-h-[76px] cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors ${
                            details.paymentMethod === method.name
                              ? 'border-red-400 bg-red-50/50 ring-1 ring-red-100'
                              : 'border-neutral-200 hover:border-red-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.name}
                            checked={details.paymentMethod === method.name}
                            onChange={() => setDetails({ ...details, paymentMethod: method.name })}
                            className="shrink-0 accent-red-600"
                          />
                          <span className={`flex h-10 min-w-12 shrink-0 items-center justify-center rounded-lg px-2 text-xs font-black tracking-tight ${
                            method.style
                          }`}>
                            {method.brand}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-slate-800">{method.name}</span>
                            <span className="mt-0.5 block text-xs leading-snug text-neutral-500">{method.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                      Payment options are preferences only. This app does not connect to GCash, Maya, or bank services; the seller will provide payment instructions directly.
                    </p>
                  </fieldset>
                </form>
              )}

              {step === 'review' && (
                <section className="space-y-5 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Delivery details</h2>
                    <div className="mt-3 rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
                      <p className="font-bold text-slate-900">{selectedAddress?.name || 'No saved address selected'}</p>
                      {selectedAddress && <p>{selectedAddress.phone}</p>}
                      <p className="mt-1">
                        {details.deliveryMethod === 'campus_pickup'
                          ? 'Campus pickup · CAFA Main Campus Pickup Desk'
                          : selectedAddress
                          ? `${selectedAddress.label} · ${selectedAddress.line1}, ${selectedAddress.city}`
                          : 'No saved delivery address selected'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Payment preference</h2>
                    <p className="mt-2 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">{details.paymentMethod}</p>
                  </div>
                  {details.deliveryMethod === 'door_to_door' && (
                    <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                      <Truck className="h-5 w-5 shrink-0" />
                      <p>
                        <strong>Manual delivery coordination:</strong> the seller will confirm any delivery fee, then share the carrier name and tracking number after dispatch. Payment is coordinated directly; this app does not process payments or show live parcel location.
                      </p>
                    </div>
                  )}
                </section>
              )}

              <div className="flex flex-wrap justify-between gap-3">
                {step !== 'cart' ? (
                  <button
                    type="button"
                    onClick={() => setStep(step === 'review' ? 'delivery' : 'cart')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-neutral-50"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                ) : (
                  <span />
                )}

                {step === 'cart' && (
                  <button
                    type="button"
                    onClick={() => setStep('delivery')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E52535] px-6 py-3 font-bold text-white hover:bg-red-700"
                  >
                    Continue to delivery <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {step === 'delivery' && (
                  <button
                    type="submit"
                    form="delivery-form"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E52535] px-6 py-3 font-bold text-white hover:bg-red-700"
                  >
                    Review order <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {step === 'review' && (
                  <button
                    type="button"
                    onClick={submitOrder}
                    disabled={details.deliveryMethod === 'door_to_door' && !selectedAddress}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E52535] px-6 py-3 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Submit order request <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </section>

            <aside className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-extrabold text-slate-900">Order summary</h2>
              <div className="mt-5 space-y-4">
                {items.map(({ artwork, quantity }) => (
                  <div key={artwork.id} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 text-neutral-600">
                      <span className="block truncate font-medium text-slate-800">{artwork.title}</span>
                      <span className="text-xs text-neutral-400">Qty {quantity}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-slate-800">{formatPrice(artwork.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3 border-t border-neutral-100 pt-4 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{details.deliveryMethod === 'campus_pickup' ? 'Campus pickup' : 'Door-to-door delivery'}</span>
                  <span>{deliveryFee === 0 ? 'Free' : 'To be confirmed'}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-4 text-base font-extrabold text-slate-900">
                  <span>{deliveryFee === 0 ? 'Total' : 'Artwork subtotal'}</span><span className="text-red-700">{formatPrice(total)}</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2 rounded-xl bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900">
                <Package className="h-4 w-4 shrink-0" />
                <p>For door-to-door delivery, the seller confirms the fee and shares tracking details manually. No carrier live-location tracking is available in this app.</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};
