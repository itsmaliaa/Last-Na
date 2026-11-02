import React, { useEffect, useState } from 'react';
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
  MessageCircle,
} from 'lucide-react';
import { Artwork, BuyerAddress, CartItem, CheckoutDetails, PaymentMethod, VoucherItem } from '../types';
import { evaluateVoucher } from '../utils/vouchers';

interface CartCheckoutViewProps {
  items: CartItem[];
  vouchers: VoucherItem[];
  startAtPayment?: boolean;
  savedAddresses: BuyerAddress[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onContinueShopping: () => void;
  onPlaceOrder: (details: CheckoutDetails) => string | undefined | Promise<string | undefined>;
  onContactSeller: (sellerName: string) => void;
  onViewOrders: () => void;
  recommendations: Artwork[];
  onAddRecommendation: (artwork: Artwork) => void;
  onSelectArtwork: (artwork: Artwork) => void;
}

export const CartCheckoutView: React.FC<CartCheckoutViewProps> = ({
  items,
  vouchers,
  startAtPayment = false,
  savedAddresses,
  onRemoveItem,
  onUpdateQuantity,
  onContinueShopping,
  onPlaceOrder,
  onContactSeller,
  onViewOrders,
  recommendations,
  onAddRecommendation,
  onSelectArtwork,
}) => {
  const [step, setStep] = useState<'cart' | 'delivery' | 'review' | 'success'>(
    startAtPayment ? 'delivery' : 'cart'
  );
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState('');
  const [confirmedItems, setConfirmedItems] = useState<CartItem[]>([]);
  const [confirmedDetails, setConfirmedDetails] = useState<CheckoutDetails | null>(null);
  const [details, setDetails] = useState<CheckoutDetails>({
    deliveryMethod: 'door_to_door',
    paymentMethod: 'GCash',
    recipientName: '',
    phone: '',
    deliveryAddress: '',
  });
  const [selectedAddressId, setSelectedAddressId] = useState(
    savedAddresses.find((address) => address.isDefault)?.id || savedAddresses[0]?.id || ''
  );
  const [checkoutNote, setCheckoutNote] = useState('');
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucherCode, setAppliedVoucherCode] = useState('');
  const [voucherMessage, setVoucherMessage] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const selectedAddress = savedAddresses.find((address) => address.id === selectedAddressId);
  const isPhysicalOrder = items.some(({ artwork }) => (
    (artwork.productType ?? 'pre_made') !== 'digital' &&
    (artwork.fulfillmentType ?? 'physical') === 'physical'
  ));
  const allowedPaymentMethods: PaymentMethod[] = (['Maya', 'GCash'] as PaymentMethod[]).filter((method) => (
    items.length > 0 && items.every(({ artwork }) => {
      return (artwork.availablePayments ?? (['Maya', 'GCash'] as PaymentMethod[])).includes(method);
    })
  ));
  const allowedPaymentMethodsKey = allowedPaymentMethods.join('|');

  const subtotal = items.reduce((sum, item) => sum + item.artwork.price * item.quantity, 0);
  const voucherEvaluation = appliedVoucherCode
    ? evaluateVoucher(appliedVoucherCode, items, vouchers)
    : null;
  const voucherDiscount = voucherEvaluation && typeof voucherEvaluation !== 'string'
    ? voucherEvaluation.discountAmount
    : 0;
  const deliveryFee = details.deliveryMethod === 'campus_pickup' ? 0 : null;
  const total = subtotal - voucherDiscount + (deliveryFee || 0);

  const updateDeliveryMethod = (deliveryMethod: CheckoutDetails['deliveryMethod']) => {
    setDetails((current) => ({
      ...current,
      deliveryMethod,
    }));
  };

  const formatPrice = (price: number) => `₱${price.toLocaleString()}`;
  const paymentDescriptions: Record<PaymentMethod, { brand: string; style: string; description: string }> = {
    Maya: { brand: 'Maya', style: 'bg-[#00A94F] text-white', description: 'Online wallet · coordinate payment with seller' },
    GCash: { brand: 'GCash', style: 'bg-[#007DFE] text-white', description: 'Online wallet · coordinate payment with seller' },
  };
  const paymentMethods = allowedPaymentMethods.map((name) => ({ name, ...paymentDescriptions[name] }));

  useEffect(() => {
    if (!paymentMethods.some((method) => method.name === details.paymentMethod)) {
      setDetails((current) => ({ ...current, paymentMethod: allowedPaymentMethods[0] ?? 'GCash' }));
    }
  }, [allowedPaymentMethodsKey, details.paymentMethod]);

  const submitOrder = async () => {
    if (isSubmittingOrder) return;
    if (isPhysicalOrder && details.deliveryMethod === 'door_to_door' && !selectedAddress) return;
    const checkoutDetails: CheckoutDetails = {
      ...details,
      recipientName: selectedAddress?.name || 'Ana Reyes',
      phone: selectedAddress?.phone || '',
      deliveryAddress: details.deliveryMethod === 'door_to_door' && selectedAddress
        ? `${selectedAddress.line1}, ${selectedAddress.city}`
        : '',
      addressId: selectedAddress?.id,
      buyerNote: checkoutNote.trim(),
      voucherCode: voucherEvaluation && typeof voucherEvaluation !== 'string'
        ? appliedVoucherCode
        : undefined,
    };
    setIsSubmittingOrder(true);
    try {
      const orderNumber = await onPlaceOrder(checkoutDetails);
      if (orderNumber) {
        setConfirmedOrderNumber(orderNumber);
        setConfirmedItems(items);
        setConfirmedDetails(checkoutDetails);
        setStep('success');
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const heading = step === 'cart'
    ? 'Your cart'
    : step === 'delivery'
    ? 'Delivery and payment'
    : step === 'review'
    ? 'Review your order'
    : 'Order confirmation';

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
            <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
              <button type="button" onClick={onContinueShopping} className="hover:text-red-700">Home</button>
              <span>›</span><button type="button" onClick={onContinueShopping} className="hover:text-red-700">Gallery</button>
              <span>›</span><span className="text-red-700">{step === 'cart' ? 'Cart' : 'Payment'}</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">Red Nexus ArtMart</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">{heading}</h1>
          </div>

        </div>

        {step === 'success' ? (
          <section className="mx-auto max-w-5xl">
            <div className="text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#E52535] bg-[#fff3dc] text-[#E52535]">
                <Check className="h-8 w-8" />
              </span>
              <h2 className="mt-5 font-serif text-3xl font-bold text-slate-900">Thank you for your order!</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500">
                Thank you for supporting emerging academy artists. Your order is registered and the seller will coordinate payment and delivery with you.
              </p>
              <span className="mt-4 inline-flex rounded-full bg-[#f3e7d5] px-4 py-2 text-xs font-bold text-slate-800">Order Number: {confirmedOrderNumber}</span>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[1.4fr_0.9fr]">
              <section className="rounded-2xl border border-[#eadcc8] bg-white p-5">
                <h3 className="font-serif text-lg font-bold">Purchased Artworks</h3>
                <div className="mt-4 divide-y divide-neutral-100">
                  {confirmedItems.map(({ artwork, quantity, lineId }) => (
                    <div key={lineId ?? artwork.id} className="flex items-center gap-3 py-3 first:pt-0">
                      <img src={artwork.image} alt={artwork.title} className="h-14 w-14 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{artwork.title}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">by {artwork.artist} · Qty {quantity}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-[#E52535]">{formatPrice(artwork.price * quantity)}</p>
                    </div>
                  ))}
                </div>
              </section>
              <div className="space-y-5">
                <section className="rounded-2xl border border-[#eadcc8] bg-white p-5">
                  <h3 className="font-serif text-lg font-bold">Shipping Destination</h3>
                  <p className="mt-3 text-sm font-bold">{confirmedDetails?.recipientName}</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    {confirmedItems.every(({ artwork }) => artwork.productType === 'digital' || artwork.fulfillmentType === 'digital')
                      ? 'Digital delivery through seller messages'
                      : confirmedDetails?.deliveryMethod === 'campus_pickup'
                      ? 'CAFA Main Campus Pickup Desk'
                      : confirmedDetails?.deliveryAddress}
                  </p>
                  {confirmedDetails?.phone && <p className="mt-1 text-xs text-neutral-500">{confirmedDetails.phone}</p>}
                </section>
                <section className="rounded-2xl border border-[#eadcc8] bg-white p-5">
                  <h3 className="font-serif text-lg font-bold">Payment Summary</h3>
                  <div className="mt-3 flex justify-between gap-3 text-xs"><span className="text-neutral-500">Payment method</span><strong>{confirmedDetails?.paymentMethod}</strong></div>
                  <div className="mt-2 flex justify-between gap-3 border-t border-neutral-100 pt-3 text-sm font-bold"><span>Total</span><strong className="text-[#E52535]">{formatPrice(confirmedItems.reduce((sum, item) => sum + item.artwork.price * item.quantity, 0))}</strong></div>
                  <p className="mt-2 text-[10px] leading-4 text-neutral-500">Payment is coordinated with the seller; no payment is processed in this app.</p>
                </section>
              </div>
            </div>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={onContinueShopping} className="rounded-full border border-neutral-900 px-7 py-3 text-sm font-bold hover:bg-neutral-50">Go to shop</button>
              <button type="button" onClick={onViewOrders} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E52535] px-7 py-3 text-sm font-bold text-white hover:bg-red-700">Track order <ArrowRight className="h-4 w-4" /></button>
            </div>
          </section>
        ) : items.length === 0 ? (
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
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-extrabold text-slate-900">Selected Artworks</h2>
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{items.length} {items.length === 1 ? 'piece' : 'pieces'}</span>
                    </div>
                    <span className="text-xs text-neutral-400">100% Proceeds to Artist</span>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {items.map(({ artwork, quantity, lineId, selectedSize, designChoice, selectedColor, selectedOptions, buyerNote }) => (
                      <article key={lineId ?? artwork.id} className="flex gap-4 p-5 sm:p-6">
                        <img
                          src={artwork.image}
                          alt={artwork.title}
                          className="h-24 w-24 shrink-0 rounded-2xl bg-neutral-100 object-cover sm:h-28 sm:w-28"
                        />
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-900">{artwork.title}</h3>
                            <p className="mt-1 text-sm text-neutral-500">{artwork.artist}</p>
                            <p className="mt-1 text-xs uppercase text-neutral-400">
                              {artwork.category.replace('_', ' ')} · {artwork.size || 'Original artwork'}
                            </p>
                            <p className="mt-1 text-xs text-neutral-600">By <strong>{artwork.artist}</strong> · {artwork.mediumsUsed?.split(',')[0] || artwork.category}</p>
                            <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Verified Craftsmanship</span>
                            <p className="mt-1 text-xs text-neutral-500">
                              {[
                                ...Object.entries(selectedOptions ?? {}).map(([optionName, value]) => `${optionName}: ${value}`),
                                ...(!selectedOptions || Object.keys(selectedOptions).length === 0
                                  ? [selectedSize && `Size: ${selectedSize}`, selectedColor && `Color: ${selectedColor}`, designChoice && `Design: ${designChoice}`].filter(Boolean)
                                  : []),
                                ...(buyerNote ? [`Note: ${buyerNote}`] : []),
                              ].join(' · ')}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center rounded-lg border border-neutral-200">
                                <button type="button" aria-label={`Decrease ${artwork.title} quantity`} disabled={quantity <= 1} onClick={() => onUpdateQuantity(lineId ?? artwork.id, quantity - 1)} className="px-2.5 py-2 text-neutral-600 hover:text-red-700 disabled:opacity-40">−</button>
                                <span className="min-w-8 text-center text-sm font-bold">{quantity}</span>
                                <button type="button" disabled={typeof artwork.stock === 'number' && quantity >= artwork.stock} aria-label={`Increase ${artwork.title} quantity`} onClick={() => onUpdateQuantity(lineId ?? artwork.id, quantity + 1)} className="px-2.5 py-2 text-neutral-600 hover:text-red-700 disabled:opacity-40">+</button>
                              </div>
                              <div className="text-right">
                                <span className="block font-extrabold text-red-700">{formatPrice(artwork.price * quantity)}</span>
                                <span className="text-[10px] text-neutral-400">{formatPrice(artwork.price)} each</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => onRemoveItem(lineId ?? artwork.id)}
                                className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-700"
                                aria-label={`Remove ${artwork.title} from cart`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
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
                  {isPhysicalOrder && <fieldset>
                    <legend className="text-lg font-extrabold text-slate-900">Choose a delivery method</legend>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {isPhysicalOrder && <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${
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
                      </label>}
                      {isPhysicalOrder && <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${
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
                      </label>}
                    </div>
                  </fieldset>}

                  {!isPhysicalOrder ? (
                    <div className="flex gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-900">
                      <Package className="h-5 w-5 shrink-0" />
                      <p><strong>Digital delivery:</strong> the seller will deliver your artwork through messages after Maya or GCash payment is coordinated.</p>
                    </div>
                  ) : details.deliveryMethod === 'door_to_door' ? (
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
                      <CreditCard className="h-5 w-5 text-red-700" /> Online payment method
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
                      Payment is coordinated directly with the seller; this app does not process payments.
                    </p>
                  </fieldset>
                  {items.some(({ artwork }) => artwork.productType === 'custom_made' || artwork.productType === 'digital') && (
                    <div>
                      <label htmlFor="checkout-note" className="block text-sm font-bold text-slate-900">Note to seller</label>
                      <textarea
                        id="checkout-note"
                        rows={3}
                        value={checkoutNote}
                        onChange={(event) => setCheckoutNote(event.target.value)}
                        placeholder="Add your design reference or customization details from the product page."
                        className="mt-2 w-full rounded-xl border border-neutral-200 p-3 text-sm"
                      />
                    </div>
                  )}
                </form>
              )}

              {step === 'review' && (
                <section className="space-y-5 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Delivery details</h2>
                    <div className="mt-3 rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
                      <p className="font-bold text-slate-900">{selectedAddress?.name || 'No saved address selected'}</p>
                      {selectedAddress?.phone && <p>{selectedAddress.phone}</p>}
                      <p className="mt-1">
                        {!isPhysicalOrder
                          ? 'Digital delivery through seller messages'
                          : details.deliveryMethod === 'campus_pickup'
                          ? 'Campus pickup · CAFA Main Campus Pickup Desk'
                          : selectedAddress
                          ? `${selectedAddress.label} · ${selectedAddress.line1}, ${selectedAddress.city}`
                          : 'No saved delivery address selected'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Online payment method</h2>
                    <p className="mt-2 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">{details.paymentMethod}</p>
                  </div>
                  {items.some(({ buyerNote }) => buyerNote?.trim()) && (
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">Note to seller</h2>
                      <p className="mt-2 whitespace-pre-wrap rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">{items.map(({ artwork, buyerNote }) => buyerNote?.trim() ? `${artwork.title}: ${buyerNote}` : '').filter(Boolean).join('\n')}</p>
                    </div>
                  )}
                  {checkoutNote && (
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">Note to seller</h2>
                      <p className="mt-2 whitespace-pre-wrap rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">{checkoutNote}</p>
                    </div>
                  )}
                  <button type="button" onClick={() => onContactSeller(items[0].artwork.artist)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50">
                    <MessageCircle className="h-4 w-4" /> Contact seller
                  </button>
                  {isPhysicalOrder && details.deliveryMethod === 'door_to_door' && (
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
                    disabled={isSubmittingOrder || (isPhysicalOrder && details.deliveryMethod === 'door_to_door' && !selectedAddress)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E52535] px-6 py-3 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmittingOrder ? 'Reserving stock…' : 'Submit order request'} <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </section>

            <aside className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-extrabold text-slate-900">Order summary</h2>
              <div className="mt-5 space-y-4">
                {items.map(({ artwork, quantity, lineId, selectedSize, designChoice, selectedColor, selectedOptions }) => (
                  <div key={lineId ?? artwork.id} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 text-neutral-600">
                      <span className="block truncate font-medium text-slate-800">{artwork.title}</span>
                      <span className="text-xs text-neutral-400">
                        Qty {quantity}
                        {Object.entries(selectedOptions ?? {}).map(([optionName, value]) => ` · ${optionName}: ${value}`)}
                        {(!selectedOptions || Object.keys(selectedOptions).length === 0) && selectedSize ? ` · ${selectedSize}` : ''}
                        {(!selectedOptions || Object.keys(selectedOptions).length === 0) && selectedColor ? ` · ${selectedColor}` : ''}
                        {(!selectedOptions || Object.keys(selectedOptions).length === 0) && designChoice ? ` · ${designChoice}` : ''}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold text-slate-800">{formatPrice(artwork.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3 border-t border-neutral-100 pt-4 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="rounded-xl border border-neutral-200 p-3">
                  <label htmlFor="voucher-code" className="block text-xs font-bold text-slate-700">Voucher code</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="voucher-code"
                      value={voucherCodeInput}
                      onChange={(event) => {
                        setVoucherCodeInput(event.target.value.toUpperCase());
                        setAppliedVoucherCode('');
                        setVoucherMessage('');
                      }}
                      placeholder="Enter code"
                      className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const result = evaluateVoucher(voucherCodeInput, items, vouchers);
                        if (typeof result === 'string') {
                          setAppliedVoucherCode('');
                          setVoucherMessage(result);
                        } else {
                          setAppliedVoucherCode(result.voucher.code);
                          setVoucherMessage('');
                        }
                      }}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                    >
                      Apply
                    </button>
                  </div>
                  {voucherMessage && (
                    <p className="mt-2 text-xs text-red-600">{voucherMessage}</p>
                  )}
                  {appliedVoucherCode && typeof voucherEvaluation === 'string' && (
                    <p className="mt-2 text-xs text-red-600">{voucherEvaluation}</p>
                  )}
                  {voucherEvaluation && typeof voucherEvaluation !== 'string' && (
                    <p className="mt-2 text-xs text-emerald-700">
                      {voucherEvaluation.voucher.code} applied to eligible artwork.
                    </p>
                  )}
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Voucher discount</span><span>−{formatPrice(voucherDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>{!isPhysicalOrder ? 'Digital delivery' : details.deliveryMethod === 'campus_pickup' ? 'Campus pickup' : 'Door-to-door delivery'}</span>
                  <span>{!isPhysicalOrder || deliveryFee === 0 ? 'Free' : 'To be confirmed'}</span>
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
        {step === 'cart' && recommendations.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-3xl font-bold text-slate-900">You May Also Like</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {recommendations.map((artwork) => (
                <article key={artwork.id} className="overflow-hidden rounded-xl border border-[#eadcc8] bg-white">
                  <button type="button" onClick={() => onSelectArtwork(artwork)} className="block w-full text-left">
                    <img src={artwork.image} alt={artwork.title} className="aspect-[4/3] w-full object-cover" />
                    <div className="p-3">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-serif text-sm font-bold">{artwork.title}</h3>
                        <span className="flex shrink-0 items-center gap-1 text-xs"><span className="text-amber-400">★</span>{artwork.rating || '4.9'}</span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">{artwork.artist}</p>
                    </div>
                  </button>
                  <div className="flex items-center justify-between px-3 pb-3">
                    <span className="font-bold text-red-600">{formatPrice(artwork.price)}</span>
                    <button type="button" onClick={() => onAddRecommendation(artwork)} aria-label={`Add ${artwork.title} to cart`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff3dc] text-red-700 hover:bg-red-100">
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};
