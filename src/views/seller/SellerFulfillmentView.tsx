import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ClipboardList, MapPin, Package, Truck } from 'lucide-react';
import { ManualFulfillmentStatus, SellerOrderTransaction, ShipmentDetails } from '../../types';

interface SellerFulfillmentViewProps {
  transactions: SellerOrderTransaction[];
  onBackToOrders: () => void;
  onUpdateShipping: (id: string, fulfillmentStatus: ManualFulfillmentStatus, shipment?: ShipmentDetails) => void;
}

const SHIPPING_PROVIDERS = ['LBC', 'J&T Express', 'Ninja Van', 'Flash Express', 'Other'];

export const SellerFulfillmentView: React.FC<SellerFulfillmentViewProps> = ({
  transactions,
  onBackToOrders,
  onUpdateShipping,
}) => {
  const openOrders = useMemo(
    () => transactions.filter((transaction) => (
      transaction.deliveryMethod === 'door_to_door' &&
      transaction.fulfillmentStatus !== 'Shipped' &&
      transaction.fulfillmentStatus !== 'Delivered' &&
      transaction.status !== 'Cancelled'
    )),
    [transactions]
  );
  const pickupOrders = useMemo(
    () => transactions.filter((transaction) => (
      transaction.deliveryMethod === 'campus_pickup' &&
      transaction.fulfillmentStatus === 'Processing' &&
      transaction.status !== 'Cancelled'
    )),
    [transactions]
  );
  const [selectedId, setSelectedId] = useState(openOrders[0]?.id || '');
  const selectedOrder = openOrders.find((order) => order.id === selectedId);
  const [shippingProvider, setShippingProvider] = useState('');
  const [customProvider, setCustomProvider] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [deliveryRiderName, setDeliveryRiderName] = useState('');
  const [deliveryRiderPhone, setDeliveryRiderPhone] = useState('');
  const [parcelWeightKg, setParcelWeightKg] = useState('');
  const [parcelLengthCm, setParcelLengthCm] = useState('');
  const [parcelWidthCm, setParcelWidthCm] = useState('');
  const [parcelHeightCm, setParcelHeightCm] = useState('');
  const [trackingUrlError, setTrackingUrlError] = useState('');

  useEffect(() => {
    if (!openOrders.some((order) => order.id === selectedId)) {
      setSelectedId(openOrders[0]?.id || '');
    }
  }, [openOrders, selectedId]);

  useEffect(() => {
    if (!selectedOrder) {
      setShippingProvider('');
      setCustomProvider('');
      setTrackingNumber('');
      setTrackingUrl('');
      setDeliveryRiderName('');
      setDeliveryRiderPhone('');
      setParcelWeightKg('');
      setParcelLengthCm('');
      setParcelWidthCm('');
      setParcelHeightCm('');
      return;
    }

    const savedProvider = selectedOrder.shippingProvider || '';
    const isKnownProvider = SHIPPING_PROVIDERS.slice(0, -1).includes(savedProvider);
    setShippingProvider(savedProvider && !isKnownProvider ? 'Other' : savedProvider);
    setCustomProvider(savedProvider && !isKnownProvider ? savedProvider : '');
    setTrackingNumber(selectedOrder.trackingNumber || '');
    setTrackingUrl(selectedOrder.trackingUrl || '');
    setDeliveryRiderName(selectedOrder.deliveryRiderName || '');
    setDeliveryRiderPhone(selectedOrder.deliveryRiderPhone || '');
    setParcelWeightKg(selectedOrder.parcelWeightKg?.toString() || '');
    setParcelLengthCm(selectedOrder.parcelLengthCm?.toString() || '');
    setParcelWidthCm(selectedOrder.parcelWidthCm?.toString() || '');
    setParcelHeightCm(selectedOrder.parcelHeightCm?.toString() || '');
  }, [selectedOrder]);

  const handleShipOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrder) return;
    const provider = shippingProvider === 'Other' ? customProvider.trim() : shippingProvider;
    if (!provider || !trackingNumber.trim() || !trackingUrl.trim()) return;
    let parsedTrackingUrl: URL;
    try {
      parsedTrackingUrl = new URL(trackingUrl.trim());
    } catch {
      setTrackingUrlError('Enter a valid carrier tracking URL.');
      return;
    }
    if (!['http:', 'https:'].includes(parsedTrackingUrl.protocol)) {
      setTrackingUrlError('Tracking link must start with http:// or https://.');
      return;
    }

    setTrackingUrlError('');
    onUpdateShipping(selectedOrder.id, 'Shipped', {
      shippingProvider: provider,
      trackingNumber: trackingNumber.trim(),
      trackingUrl: parsedTrackingUrl.toString(),
      deliveryRiderName: deliveryRiderName.trim() || undefined,
      deliveryRiderPhone: deliveryRiderPhone.trim() || undefined,
      parcelWeightKg: Number(parcelWeightKg),
      parcelLengthCm: Number(parcelLengthCm),
      parcelWidthCm: Number(parcelWidthCm),
      parcelHeightCm: Number(parcelHeightCm),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBackToOrders}
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-red-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to manage orders
          </button>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Seller workspace</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Orders to ship</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Select an order, hand the parcel to your chosen carrier, then enter the carrier and tracking reference manually.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-950">
          <Truck className="h-5 w-5 shrink-0 text-amber-700" />
          Parcel location is checked with the carrier, outside this app.
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
        <section className="space-y-3 xl:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900">Door-to-door queue</h2>
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
              {openOrders.length} to ship
            </span>
          </div>

          {openOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
              <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
              <h3 className="mt-3 font-bold text-slate-900">No door-to-door orders to ship</h3>
              <p className="mt-1 text-sm text-neutral-500">New orders requiring shipment will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {openOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedId(order.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                    selectedOrder?.id === order.id
                      ? 'border-red-300 bg-red-50/70 ring-1 ring-red-100'
                      : 'border-neutral-200 bg-white hover:border-red-200'
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-slate-900">{order.artwork}</span>
                      <span className="mt-1 block text-xs text-neutral-500">
                        {order.orderNumber || order.id} · {order.buyer}
                      </span>
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900">
                        <Package className="h-3.5 w-3.5" />
                        {order.fulfillmentStatus || 'Processing'}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-extrabold text-slate-900">
                      ₱{order.grossAmount.toLocaleString()}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="xl:col-span-2">
          {selectedOrder ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-4 border-b border-neutral-100 pb-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                  <Package className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Order {selectedOrder.orderNumber || selectedOrder.id}
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold text-slate-900">{selectedOrder.artwork}</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Buyer: {selectedOrder.buyer} · Artist: {selectedOrder.artist}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">
                  {selectedOrder.fulfillmentStatus || 'Processing'}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">Ship to</p>
                  <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-slate-800">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
                    {selectedOrder.deliveryAddress || 'No delivery address recorded'}
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">Buyer payment preference</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {selectedOrder.paymentMethod || 'Not provided'}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Payment is coordinated directly. No payment service is connected.
                  </p>
                </div>
              </div>

              <form onSubmit={handleShipOrder} className="mt-6 space-y-5">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Record shipment details</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Mark this as shipped only after you have handed the parcel to the carrier.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Shipping provider
                    <select
                      required
                      value={shippingProvider}
                      onChange={(event) => setShippingProvider(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    >
                      <option value="" disabled>Select a carrier</option>
                      {SHIPPING_PROVIDERS.map((provider) => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Tracking number / reference
                    <input
                      required
                      value={trackingNumber}
                      onChange={(event) => setTrackingNumber(event.target.value)}
                      placeholder="Enter the number from the carrier"
                      className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                  </label>
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Tracking link
                  <input
                    type="url"
                    required
                    value={trackingUrl}
                    onChange={(event) => {
                      setTrackingUrl(event.target.value);
                      setTrackingUrlError('');
                    }}
                    placeholder="https://carrier.example/track/..."
                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                  <span className="mt-1 block text-xs font-normal text-neutral-500">
                    Paste the tracking URL from your carrier. Buyers will be able to open it from their order.
                  </span>
                  {trackingUrlError && <span className="mt-1 block text-xs font-semibold text-red-700">{trackingUrlError}</span>}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Rider name <span className="font-normal text-neutral-400">(optional)</span>
                    <input
                      type="text"
                      value={deliveryRiderName}
                      onChange={(event) => setDeliveryRiderName(event.target.value)}
                      placeholder="Enter rider's name"
                      className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Rider phone number <span className="font-normal text-neutral-400">(optional)</span>
                    <input
                      type="tel"
                      value={deliveryRiderPhone}
                      onChange={(event) => setDeliveryRiderPhone(event.target.value)}
                      placeholder="Enter rider's phone number"
                      className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                  </label>
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-bold text-slate-800">Parcel size and weight</legend>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <label className="block text-sm font-semibold text-slate-700">
                      Weight (kg)
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={parcelWeightKg}
                        onChange={(event) => setParcelWeightKg(event.target.value)}
                        placeholder="e.g. 1.25"
                        className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                    </label>
                    {[
                      { label: 'Length (cm)', value: parcelLengthCm, onChange: setParcelLengthCm },
                      { label: 'Width (cm)', value: parcelWidthCm, onChange: setParcelWidthCm },
                      { label: 'Height (cm)', value: parcelHeightCm, onChange: setParcelHeightCm },
                    ].map((dimension) => (
                      <label key={dimension.label} className="block text-sm font-semibold text-slate-700">
                        {dimension.label}
                        <input
                          type="number"
                          required
                          min="0.1"
                          step="0.1"
                          value={dimension.value}
                          onChange={(event) => dimension.onChange(event.target.value)}
                          placeholder="e.g. 30"
                          className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>

                {shippingProvider === 'Other' && (
                  <label className="block text-sm font-semibold text-slate-700">
                    Other shipping provider
                    <input
                      required
                      value={customProvider}
                      onChange={(event) => setCustomProvider(event.target.value)}
                      placeholder="Enter the carrier name"
                      className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                  </label>
                )}

                <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-sm leading-relaxed text-blue-950">
                  <Truck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                  <p>
                    <strong>No live carrier integration:</strong> the buyer can use your tracking link or reference to check parcel location directly with the shipping provider.
                  </p>
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E52535] px-5 py-3.5 font-bold text-white hover:bg-red-700 sm:w-auto"
                >
                  <Truck className="h-4 w-4" />
                  Mark as shipped and save tracking
                </button>
              </form>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white p-8 text-center">
              <ClipboardList className="h-10 w-10 text-neutral-300" />
              <h2 className="mt-3 font-extrabold text-slate-900">Select an order to fulfill</h2>
              <p className="mt-1 max-w-md text-sm text-neutral-500">
                Choose an order from the shipping queue to review its delivery address and enter manual tracking details.
              </p>
            </div>
          )}
        </section>
      </div>

      {pickupOrders.length > 0 && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
          <h2 className="flex items-center gap-2 font-extrabold text-slate-900">
            <MapPin className="h-5 w-5 text-blue-700" /> Campus pickup orders
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            These orders do not need a shipping provider or tracking number. Open Manage Order to mark one ready for collection.
          </p>
          <ul className="mt-3 space-y-2">
            {pickupOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/80 px-4 py-3 text-sm">
                <span className="font-semibold text-slate-800">{order.artwork} · {order.buyer}</span>
                <button
                  type="button"
                  onClick={() => onUpdateShipping(order.id, 'Ready for pickup')}
                  className="rounded-lg bg-blue-800 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Mark ready for pickup
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
