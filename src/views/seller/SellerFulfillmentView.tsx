import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ClipboardList, MapPin, Package, Printer, Truck } from 'lucide-react';
import { ManualFulfillmentStatus, SellerOrderTransaction, ShipmentDetails } from '../../types';

interface SellerFulfillmentViewProps {
  transactions: SellerOrderTransaction[];
  sellerName: string;
  onBackToOrders: () => void;
  onUpdateShipping: (id: string, fulfillmentStatus: ManualFulfillmentStatus, shipment?: Partial<ShipmentDetails>) => void;
}

interface ReceiptSettings {
  shopName: string;
  shopAddress: string;
  receiptMessage: string;
  isFragile: boolean;
}

const EMPTY_RECEIPT_SETTINGS: ReceiptSettings = {
  shopName: '',
  shopAddress: '',
  receiptMessage: 'No proof video, no return.',
  isFragile: false,
};
const CODE_39_PATTERNS: Record<string, string> = {
  '0': 'nnnwwnwnn',
  '1': 'wnnwnnnnw',
  '2': 'nnwwnnnnw',
  '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn',
  '6': 'nnwwwnnnn',
  '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn',
  '9': 'nnwwnnwnn',
  A: 'wnnnnwnnw',
  N: 'nnnnwnnww',
  R: 'wnnnnnnwn',
  '-': 'wnnnnnwnw',
  '*': 'nwnnwnwnn',
};

const makeCode39Barcode = (value: string) => {
  let x = 0;
  const bars: Array<{ x: number; width: number }> = [];
  const encodedValue = `*${value.toUpperCase()}*`;

  for (const [characterIndex, character] of Array.from(encodedValue).entries()) {
    const pattern = CODE_39_PATTERNS[character];
    if (!pattern) throw new Error(`The order ID contains an unsupported barcode character: ${character}`);

    [...pattern].forEach((width, index) => {
      const barWidth = width === 'w' ? 3 : 1;
      if (index % 2 === 0) bars.push({ x, width: barWidth });
      x += barWidth;
    });
    if (characterIndex < encodedValue.length - 1) x += 1;
  }

  return { bars, width: x };
};

export const SellerFulfillmentView: React.FC<SellerFulfillmentViewProps> = ({
  transactions,
  sellerName,
  onBackToOrders,
  onUpdateShipping,
}) => {
  const openOrders = useMemo(
    () => transactions.filter((transaction) => (
      transaction.deliveryMethod === 'door_to_door' &&
      transaction.fulfillmentStatus !== 'Shipped' &&
      transaction.fulfillmentStatus !== 'Out for Delivery' &&
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
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'pre_made' | 'custom_made' | 'digital'>('all');
  const [selectedId, setSelectedId] = useState(openOrders[0]?.id || '');
  const filteredOpenOrders = useMemo(
    () => openOrders.filter((order) => (
      productTypeFilter === 'all' || (order.productType ?? 'pre_made') === productTypeFilter
    )),
    [openOrders, productTypeFilter]
  );
  const selectedOrder = filteredOpenOrders.find((order) => order.id === selectedId);
  const barcode = selectedOrder
    ? makeCode39Barcode(selectedOrder.orderNumber || selectedOrder.id.replace(/^order-/, 'RN-'))
    : null;
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>(EMPTY_RECEIPT_SETTINGS);
  const [receiptSettingsLoaded, setReceiptSettingsLoaded] = useState(false);
  const [receiptSettingsError, setReceiptSettingsError] = useState('');
  const [parcelWeightKg, setParcelWeightKg] = useState('');
  const [parcelLengthCm, setParcelLengthCm] = useState('');
  const [parcelWidthCm, setParcelWidthCm] = useState('');
  const [parcelHeightCm, setParcelHeightCm] = useState('');
  const receiptSettingsKey = `red-nexus-receipt-settings-${sellerName.toLowerCase()}`;

  useEffect(() => {
    setParcelWeightKg(selectedOrder?.parcelWeightKg?.toString() || '');
    setParcelLengthCm(selectedOrder?.parcelLengthCm?.toString() || '');
    setParcelWidthCm(selectedOrder?.parcelWidthCm?.toString() || '');
    setParcelHeightCm(selectedOrder?.parcelHeightCm?.toString() || '');
  }, [selectedOrder?.id]);

  const parcelSize = [parcelLengthCm, parcelWidthCm, parcelHeightCm].every(Boolean)
    ? `${parcelLengthCm} x ${parcelWidthCm} x ${parcelHeightCm} cm`
    : selectedOrder?.selectedSize || 'Not specified';
  const receiptDetails = selectedOrder
    ? {
      ...(selectedOrder.receiptDetails ?? {
        buyerName: selectedOrder.buyer,
        buyerAddress: selectedOrder.productType === 'digital' ? '' : selectedOrder.deliveryAddress || '',
        sellerName: selectedOrder.artist,
        sellerAddress: '',
        itemTitle: selectedOrder.artwork,
        quantity: selectedOrder.quantity ?? 1,
        size: selectedOrder.selectedSize || 'Not specified',
      }),
      weight: parcelWeightKg ? `${parcelWeightKg} kg` : undefined,
      size: parcelSize,
    }
    : null;

  useEffect(() => {
    try {
      const savedSettings = window.localStorage.getItem(receiptSettingsKey);
      if (savedSettings) {
        const parsedSettings: unknown = JSON.parse(savedSettings);
        if (
          typeof parsedSettings !== 'object' ||
          parsedSettings === null ||
          !('shopName' in parsedSettings) ||
          typeof parsedSettings.shopName !== 'string' ||
          !('shopAddress' in parsedSettings) ||
          typeof parsedSettings.shopAddress !== 'string' ||
          !('receiptMessage' in parsedSettings) ||
          typeof parsedSettings.receiptMessage !== 'string' ||
          !('isFragile' in parsedSettings) ||
          typeof parsedSettings.isFragile !== 'boolean'
        ) {
          throw new Error('Saved receipt settings are unreadable.');
        }
        setReceiptSettings({
          shopName: parsedSettings.shopName,
          shopAddress: parsedSettings.shopAddress,
          receiptMessage: parsedSettings.receiptMessage,
          isFragile: parsedSettings.isFragile,
        });
      }
    } catch (error) {
      setReceiptSettingsError(error instanceof Error ? error.message : 'Unable to load receipt settings.');
    } finally {
      setReceiptSettingsLoaded(true);
    }
  }, [receiptSettingsKey]);

  useEffect(() => {
    if (!receiptSettingsLoaded) return;
    try {
      window.localStorage.setItem(receiptSettingsKey, JSON.stringify(receiptSettings));
      setReceiptSettingsError('');
    } catch (error) {
      setReceiptSettingsError(error instanceof Error ? error.message : 'Unable to save receipt settings.');
    }
  }, [receiptSettings, receiptSettingsKey, receiptSettingsLoaded]);

  useEffect(() => {
    if (!filteredOpenOrders.some((order) => order.id === selectedId)) {
      setSelectedId(filteredOpenOrders[0]?.id || '');
    }
  }, [filteredOpenOrders, selectedId]);

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
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Orders to ship</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Select an order and mark it as shipped after handing the parcel to the carrier. Add tracking and rider details under Shipped orders.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-950">
          <Truck className="h-5 w-5 shrink-0 text-amber-700" />
          Parcel location is checked with the carrier, outside this app.
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
        <section className="space-y-3 xl:col-span-1">
          <div className="flex items-center gap-1 overflow-x-auto border-b border-neutral-200 pb-2" role="group" aria-label="Filter shipment queue by product type">
            {([
              ['all', 'All'],
              ['pre_made', 'Pre-made'],
              ['custom_made', 'Custom'],
              ['digital', 'Digital'],
            ] as const).map(([type, label]) => (
              <button
                key={type}
                type="button"
                aria-pressed={productTypeFilter === type}
                onClick={() => setProductTypeFilter(type)}
                className={`shrink-0 px-3 py-2 text-xs font-semibold transition-colors ${
                  productTypeFilter === type
                    ? 'border-b-2 border-[#8e1b24] text-[#8e1b24]'
                    : 'text-neutral-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {filteredOpenOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
              <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
              <h3 className="mt-3 font-bold text-slate-900">No door-to-door orders to ship</h3>
              <p className="mt-1 text-sm text-neutral-500">New orders requiring shipment will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOpenOrders.map((order) => (
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

              {receiptDetails && barcode && (
                <>
                <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="text-sm font-extrabold text-slate-900">Parcel size and weight</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {([
                      ['Weight (kg)', parcelWeightKg, setParcelWeightKg, 'e.g. 1.25'],
                      ['Length (cm)', parcelLengthCm, setParcelLengthCm, 'e.g. 30'],
                      ['Width (cm)', parcelWidthCm, setParcelWidthCm, 'e.g. 20'],
                      ['Height (cm)', parcelHeightCm, setParcelHeightCm, 'e.g. 10'],
                    ] as const).map(([label, value, setValue, placeholder]) => (
                      <label key={label} className="block text-xs font-semibold text-slate-700">
                        {label}
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={value}
                          onChange={(event) => setValue(event.target.value)}
                          placeholder={placeholder}
                          className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                      </label>
                    ))}
                  </div>
                </section>
                <section className="mt-6 space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Receipt details</h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Add your shop details and optional parcel notices. These settings are saved for your next order.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Shop name
                      <input
                        type="text"
                        value={receiptSettings.shopName}
                        onChange={(event) => setReceiptSettings((settings) => ({ ...settings, shopName: event.target.value }))}
                        placeholder={receiptDetails.sellerName || 'Enter your shop name'}
                        className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">
                      Shop address
                      <input
                        type="text"
                        value={receiptSettings.shopAddress}
                        onChange={(event) => setReceiptSettings((settings) => ({ ...settings, shopAddress: event.target.value }))}
                        placeholder="Enter your shop address"
                        className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                      <span className="mt-1 block text-xs font-normal text-neutral-500">
                        Required before printing so the seller address appears on the receipt.
                      </span>
                    </label>
                    <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                      Receipt note
                      <input
                        type="text"
                        value={receiptSettings.receiptMessage}
                        onChange={(event) => setReceiptSettings((settings) => ({ ...settings, receiptMessage: event.target.value }))}
                        placeholder="e.g. No proof video, no return."
                        className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                    </label>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={receiptSettings.isFragile}
                      onChange={(event) => setReceiptSettings((settings) => ({ ...settings, isFragile: event.target.checked }))}
                      className="h-5 w-5 rounded border-neutral-300 text-red-700 focus:ring-red-500"
                    />
                    Mark parcel as fragile
                  </label>
                  {receiptSettingsError && (
                    <p role="alert" className="text-sm font-medium text-red-700">{receiptSettingsError}</p>
                  )}
                </section>

                <section className="print-receipt mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Red Nexus ArtMart</p>
                      <h3 className="mt-1 text-xl font-black text-slate-900">Order receipt</h3>
                      <p className="mt-1 text-xs text-neutral-500">Attach this receipt to the parcel. Product prices are not included.</p>
                      {receiptSettings.isFragile && (
                        <p className="mt-2 inline-flex rounded border-2 border-red-700 px-3 py-1 text-sm font-black uppercase tracking-widest text-red-700">
                          Fragile
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      disabled={!receiptSettings.shopAddress.trim()}
                      className="print:hidden inline-flex items-center gap-2 rounded-xl bg-[#E52535] px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Printer className="h-4 w-4" />
                      Print receipt
                    </button>
                  </div>
                  <div className="mt-4 border-t border-neutral-200 pt-4 text-sm">
                    <div className="text-center">
                      <div className="flex justify-center" aria-label={`Barcode for order ${selectedOrder.orderNumber || selectedOrder.id}`}>
                        <svg role="img" aria-label={`Order barcode ${selectedOrder.orderNumber || selectedOrder.id}`} viewBox={`0 0 ${barcode.width} 64`} className="h-16 max-w-full">
                          {barcode.bars.map(({ x, width }, index) => <rect key={index} x={x} y="0" width={width} height="52" fill="#111827" />)}
                        </svg>
                      </div>
                      <p className="font-mono text-sm font-bold tracking-widest">{selectedOrder.orderNumber || selectedOrder.id}</p>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="font-bold text-slate-900">Buyer information</h4>
                        <p className="mt-1">{receiptDetails.buyerName}</p>
                        <p>{receiptDetails.buyerAddress || 'Digital delivery'}</p>
                        {receiptDetails.buyerPhone && <p>{receiptDetails.buyerPhone}</p>}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Seller information</h4>
                        <p className="mt-1">{receiptSettings.shopName || receiptDetails.sellerName}</p>
                        <p>{receiptSettings.shopAddress}</p>
                      </div>
                    </div>
                    <div className="mt-4 border-t border-neutral-200 pt-3">
                      <h4 className="font-bold text-slate-900">Item</h4>
                      <p className="mt-1 font-semibold">{receiptDetails.itemTitle}</p>
                      <p>Quantity: {receiptDetails.quantity} · Weight: {receiptDetails.weight || 'Not specified'} · Size: {receiptDetails.size || 'Not specified'}</p>
                    </div>
                    {receiptSettings.receiptMessage.trim() && (
                      <p className="mt-4 border-t border-neutral-200 pt-3 text-center font-bold">
                        {receiptSettings.receiptMessage.trim()}
                      </p>
                    )}
                  </div>
                </section>
                </>
              )}

              <div className="mt-6 space-y-4">
                <p className="text-sm leading-relaxed text-neutral-600">
                  Once you have handed the parcel to the carrier, mark it as shipped. You can add tracking and rider details in the Shipped orders section.
                </p>
                <button
                  type="button"
                  onClick={() => onUpdateShipping(selectedOrder.id, 'Shipped', {
                    parcelWeightKg: parcelWeightKg ? Number(parcelWeightKg) : undefined,
                    parcelLengthCm: parcelLengthCm ? Number(parcelLengthCm) : undefined,
                    parcelWidthCm: parcelWidthCm ? Number(parcelWidthCm) : undefined,
                    parcelHeightCm: parcelHeightCm ? Number(parcelHeightCm) : undefined,
                  })}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E52535] px-5 py-3.5 font-bold text-white hover:bg-red-700 sm:w-auto"
                >
                  <Truck className="h-4 w-4" />
                  Mark as shipped
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white p-8 text-center">
              <ClipboardList className="h-10 w-10 text-neutral-300" />
              <h2 className="mt-3 font-extrabold text-slate-900">Select an order to fulfill</h2>
              <p className="mt-1 max-w-md text-sm text-neutral-500">
                Choose an order from the shipping queue to review its delivery address and receipt.
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
