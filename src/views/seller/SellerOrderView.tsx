import React, { useState } from 'react';
import {
  Download,
  ImagePlus,
  Search,
  TrendingUp,
  Tag,
  DollarSign,
  CheckCircle2,
  FileText,
  ArrowLeft,
  CreditCard,
  User,
  Calendar,
  ExternalLink,
  List,
  LayoutGrid,
  Package,
  ChevronRight,
  Truck,
  MapPin,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { DeliveryCompletionDetails, SellerOrderTransaction, SellerTab, ShipmentDetails } from '../../types';

type OrderCategory = 'to_ship' | 'shipped' | 'on_the_way' | 'completed' | 'cancelled';
type OrderCategoryFilter = 'all' | OrderCategory;

const getOrderCategory = (transaction: SellerOrderTransaction): OrderCategory => {
  if (transaction.status === 'Cancelled') return 'cancelled';
  if (transaction.status === 'Completed' || transaction.fulfillmentStatus === 'Delivered') return 'completed';
  if (transaction.fulfillmentStatus === 'On the way') return 'on_the_way';
  if (transaction.status === 'Shipped' || transaction.fulfillmentStatus === 'Shipped') return 'shipped';
  if (transaction.deliveryMethod === 'door_to_door') return 'to_ship';
  return 'to_ship';
};

const ORDER_CATEGORIES: { id: OrderCategoryFilter; label: string }[] = [
  { id: 'all', label: 'All orders' },
  { id: 'to_ship', label: 'To ship' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'on_the_way', label: 'On the way' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const ORDER_CATEGORY_STYLES: Record<OrderCategory, string> = {
  to_ship: 'bg-amber-50 text-amber-800 border-amber-200',
  shipped: 'bg-blue-50 text-blue-800 border-blue-200',
  on_the_way: 'bg-violet-50 text-violet-800 border-violet-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

interface SellerOrderViewProps {
  transactions: SellerOrderTransaction[];
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateTab?: (tab: SellerTab) => void;
  onCompleteDelivery: (id: string, details: DeliveryCompletionDetails) => void;
  onMarkOnTheWay: (id: string, shipment: ShipmentDetails) => void;
}

const prepareProofImage = async (file: File): Promise<string> => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image for proof of delivery.');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Choose an image smaller than 8 MB.');
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The selected image could not be read.'));
    });

    const scale = Math.min(1, 1200 / image.width, 1200 / image.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is not available in this browser.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const compressedImage = canvas.toDataURL('image/jpeg', 0.72);
    if (compressedImage.length > 1_500_000) {
      throw new Error('This image is still too large to save. Choose a smaller or more compressed image.');
    }
    return compressedImage;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

export const SellerOrderView: React.FC<SellerOrderViewProps> = ({
  transactions,
  onShowToast,
  onNavigateTab,
  onCompleteDelivery,
  onMarkOnTheWay,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<SellerOrderTransaction | null>(null);
  const [proofOfDeliveryImage, setProofOfDeliveryImage] = useState('');
  const [deliveryRiderName, setDeliveryRiderName] = useState('');
  const [deliveryRiderPhone, setDeliveryRiderPhone] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [shippingProvider, setShippingProvider] = useState('');
  const [trackingDetailsError, setTrackingDetailsError] = useState('');
  const [proofImageError, setProofImageError] = useState('');
  const [displayMode, setDisplayMode] = useState<'list' | 'table'>('list');
  const [categoryFilter, setCategoryFilter] = useState<OrderCategoryFilter>('all');
  const [activeTodo, setActiveTodo] = useState<'orders_to_ship' | 'pending_returns' | 'unread_messages' | 'low_stock'>('orders_to_ship');

  const openTransaction = (transaction: SellerOrderTransaction) => {
    setSelectedTx(transaction);
    setProofOfDeliveryImage(transaction.proofOfDeliveryImage || '');
    setDeliveryRiderName(transaction.deliveryRiderName || '');
    setDeliveryRiderPhone(transaction.deliveryRiderPhone || '');
    setTrackingNumber(transaction.trackingNumber || '');
    setTrackingUrl(transaction.trackingUrl || '');
    setShippingProvider(transaction.shippingProvider || '');
    setTrackingDetailsError('');
    setProofImageError('');
  };

  const handleProofImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setProofOfDeliveryImage(await prepareProofImage(file));
      setProofImageError('');
    } catch (error) {
      setProofImageError(error instanceof Error ? error.message : 'The proof image could not be prepared.');
    }
  };

  const handleCompleteDelivery = () => {
    if (!selectedTx || !proofOfDeliveryImage) {
      setProofImageError('Upload proof of delivery before marking this order completed.');
      return;
    }
    onCompleteDelivery(selectedTx.id, { proofOfDeliveryImage });
    setSelectedTx(null);
  };

  const handleMarkOnTheWay = () => {
    if (!selectedTx || !shippingProvider.trim() || !trackingNumber.trim() || !trackingUrl.trim()) {
      setTrackingDetailsError('Enter the carrier, tracking number, and tracking link before continuing.');
      return;
    }
    let parsedTrackingUrl: URL;
    try {
      parsedTrackingUrl = new URL(trackingUrl.trim());
    } catch {
      setTrackingDetailsError('Enter a valid carrier tracking link.');
      return;
    }
    if (!['http:', 'https:'].includes(parsedTrackingUrl.protocol)) {
      setTrackingDetailsError('Tracking link must start with http:// or https://.');
      return;
    }
    onMarkOnTheWay(selectedTx.id, {
      shippingProvider: shippingProvider.trim(),
      trackingNumber: trackingNumber.trim(),
      trackingUrl: parsedTrackingUrl.toString(),
      deliveryRiderName: deliveryRiderName.trim() || undefined,
      deliveryRiderPhone: deliveryRiderPhone.trim() || undefined,
      parcelWeightKg: selectedTx.parcelWeightKg,
      parcelLengthCm: selectedTx.parcelLengthCm,
      parcelWidthCm: selectedTx.parcelWidthCm,
      parcelHeightCm: selectedTx.parcelHeightCm,
    });
    setSelectedTx(null);
  };

  // Filter transactions
  const searchedTransactions = transactions.filter((tx) => {
    const q = searchTerm.toLowerCase();
    return (
      tx.artwork.toLowerCase().includes(q) ||
      tx.artist.toLowerCase().includes(q) ||
      tx.buyer.toLowerCase().includes(q) ||
      tx.date.toLowerCase().includes(q) ||
      tx.orderNumber?.toLowerCase().includes(q) ||
      tx.trackingNumber?.toLowerCase().includes(q)
    );
  });
  const filteredTransactions = searchedTransactions.filter(
    (transaction) => categoryFilter === 'all' || getOrderCategory(transaction) === categoryFilter
  );
  const categoryCounts = transactions.reduce<Record<OrderCategoryFilter, number>>((counts, transaction) => {
    counts.all += 1;
    counts[getOrderCategory(transaction)] += 1;
    return counts;
  }, { all: 0, to_ship: 0, shipped: 0, on_the_way: 0, completed: 0, cancelled: 0 });

  // Calculate dynamic totals
  const totalGross = transactions.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalPayout = transactions.reduce((acc, curr) => acc + curr.netStudentPayout, 0);
  const ordersToShipCount = categoryCounts.to_ship;

  // Handle Export Sales CSV
  const handleExportCSV = () => {
    const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const headers = [
      'ARTWORK,ARTIST,BUYER,DATE,PRICE,PLATFORM TAKE,NET STUDENT PAYOUT,STATUS,FULFILLMENT STATUS,SHIPPING PROVIDER,TRACKING NUMBER',
    ];
    const rows = transactions.map(
      (tx) => [
        tx.artwork,
        tx.artist,
        tx.buyer,
        tx.date,
        `₱${tx.grossAmount.toLocaleString()}`,
        `₱${tx.platformTakeAmount} (${tx.platformTakeRate}%)`,
        `₱${tx.netStudentPayout.toLocaleString()}`,
        tx.status,
        tx.fulfillmentStatus || '',
        tx.shippingProvider || '',
        tx.trackingNumber || '',
      ].map(csvCell).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `red_nexus_seller_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('Sales CSV Exported', 'Downloaded complete sales ledger for CAFA student payouts.', 'success');
  };

  return (
    <div className="space-y-6">
      {!selectedTx && (
        <>
      {/* Top Action Row: Export Sales CSV */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Orders & Student Payouts Ledger
          </h2>
          <p className="text-xs text-neutral-500">
            Real-time record of all sold items, buyer details, platform fees, and net payouts.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* TO-DO LIST (Exact match to uploaded image 401453e6-cfb5-4e7e-a743-c53444ab9b18.jpg) */}
      <div className="bg-[#fbfbfb] rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            To-do list
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            These are the key daily tasks for your shop.
          </p>
        </div>

        {/* 4 Items in a Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {/* 1. Orders to ship */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setActiveTodo('orders_to_ship');
                if (onNavigateTab) {
                  onNavigateTab('shipping_fulfillment');
                } else {
                  onShowToast('Orders to ship', `${ordersToShipCount} order${ordersToShipCount === 1 ? '' : 's'} need fulfillment.`, 'info');
                }
              }}
              className={`w-full p-3.5 rounded-xl text-left transition-all cursor-pointer group ${
                activeTodo === 'orders_to_ship'
                  ? 'bg-[#e9ecef] shadow-2xs'
                  : 'hover:bg-neutral-100/70'
              }`}
            >
              <div className="flex items-center justify-between text-slate-600 font-medium text-xs sm:text-sm">
                <span className="font-semibold group-hover:text-red-600 transition-colors">
                  Orders to ship
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                {ordersToShipCount}
              </div>
            </button>
          </div>

          {/* 2. Pending returns > */}
          <button
            type="button"
            onClick={() => {
              setActiveTodo('pending_returns');
              onShowToast('Pending returns', '0 returns pending. All student thesis purchases are final.', 'info');
            }}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer group ${
              activeTodo === 'pending_returns'
                ? 'bg-[#e9ecef] shadow-2xs'
                : 'hover:bg-neutral-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-600 font-medium text-xs sm:text-sm">
              <span className="font-semibold group-hover:text-red-600 transition-colors">
                Pending returns
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              0
            </div>
            <div className="text-xs text-neutral-400 font-medium mt-1">
              All caught up!
            </div>
          </button>

          {/* 3. Unread buyer messages > */}
          <button
            type="button"
            onClick={() => {
              setActiveTodo('unread_messages');
              if (onNavigateTab) {
                onNavigateTab('messages');
              } else {
                onShowToast('Unread messages', 'You are all caught up on buyer inquiries.', 'info');
              }
            }}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer group ${
              activeTodo === 'unread_messages'
                ? 'bg-[#e9ecef] shadow-2xs'
                : 'hover:bg-neutral-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-600 font-medium text-xs sm:text-sm">
              <span className="font-semibold group-hover:text-red-600 transition-colors">
                Unread buyer messages
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              0
            </div>
            <div className="text-xs text-neutral-400 font-medium mt-1">
              All caught up!
            </div>
          </button>

          {/* 4. Low stock > */}
          <button
            type="button"
            onClick={() => {
              setActiveTodo('low_stock');
              if (onNavigateTab) {
                onNavigateTab('stock');
              } else {
                onShowToast('Low stock', 'All stock inventory levels are adequate.', 'info');
              }
            }}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer group ${
              activeTodo === 'low_stock'
                ? 'bg-[#e9ecef] shadow-2xs'
                : 'hover:bg-neutral-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-600 font-medium text-xs sm:text-sm">
              <span className="font-semibold group-hover:text-red-600 transition-colors">
                Low stock
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              0
            </div>
            <div className="text-xs text-neutral-400 font-medium mt-1">
              All caught up!
            </div>
          </button>
        </div>
      </div>

      {/* Main Orders Card: List Type / Table Type */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-6 space-y-6">
        <div className="flex gap-2 overflow-x-auto border-b border-neutral-100 pb-4" role="group" aria-label="Filter orders by status">
          {ORDER_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={categoryFilter === category.id}
              onClick={() => setCategoryFilter(category.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                categoryFilter === category.id
                  ? 'bg-[#8e1b24] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {category.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                categoryFilter === category.id ? 'bg-white/20 text-white' : 'bg-white text-neutral-600'
              }`}>
                {categoryCounts[category.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input Row & Count & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search artwork, artist, buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-400 focus:bg-white transition-all text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-neutral-500">
              {filteredTransactions.length} order{filteredTransactions.length === 1 ? '' : 's'}
            </span>

            {/* View Mode Toggle: List Type vs Table Type */}
            <div className="inline-flex bg-neutral-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setDisplayMode('list')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  displayMode === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-neutral-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('table')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  displayMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-neutral-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. LIST TYPE VIEW (Shows: what item, price, amount, platform take, date sold) */}
        {displayMode === 'list' && (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => openTransaction(tx)}
                className="p-5 rounded-2xl border border-neutral-200/80 hover:border-red-300 hover:shadow-xs transition-all bg-white cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* What item & artist */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-red-600" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-slate-900 group-hover:text-red-600 transition-colors">
                        {tx.artwork}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${ORDER_CATEGORY_STYLES[getOrderCategory(tx)]}`}>
                        {ORDER_CATEGORIES.find((category) => category.id === getOrderCategory(tx))?.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Artist: <span className="font-medium text-slate-700">{tx.artist}</span> · Buyer: <span className="font-medium text-slate-700">{tx.buyer}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Date Sold: <strong className="text-slate-700 font-semibold">{tx.date}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Price, Platform Take, Net Payout */}
                <div className="grid grid-cols-3 gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100 text-xs">
                  {/* Price / Gross Amount */}
                  <div className="bg-neutral-50 p-3 rounded-xl text-center md:text-left">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Price / Gross
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      ₱{tx.grossAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Platform Take */}
                  <div className="bg-neutral-50 p-3 rounded-xl text-center md:text-left">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Platform Take
                    </span>
                    <span className="inline-flex items-center font-bold text-xs text-neutral-700">
                      ₱{tx.platformTakeAmount} (0%)
                    </span>
                  </div>

                  {/* Net Student Payout */}
                  <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl text-center md:text-left">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Net Payout
                    </span>
                    <span className="font-extrabold text-sm text-[#16A34A]">
                      ₱{tx.netStudentPayout.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="py-12 text-center text-neutral-400 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-neutral-300" />
                <p className="font-semibold text-sm text-slate-700">
                  {transactions.length === 0 ? 'No orders recorded yet' : `No ${categoryFilter === 'all' ? '' : `${ORDER_CATEGORIES.find((category) => category.id === categoryFilter)?.label.toLowerCase()} `}orders found`}
                </p>
                <p className="text-xs text-neutral-400">Orders matching this status and search will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. TABLE VIEW */}
        {displayMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-semibold">ARTWORK</th>
                  <th className="pb-3 px-4 font-semibold">ARTIST</th>
                  <th className="pb-3 px-4 font-semibold">BUYER</th>
                  <th className="pb-3 px-4 font-semibold">DATE SOLD</th>
                  <th className="pb-3 px-4 font-semibold">PRICE</th>
                  <th className="pb-3 px-4 font-semibold">PLATFORM TAKE</th>
                  <th className="pb-3 px-4 font-semibold">NET STUDENT PAYOUT</th>
                  <th className="pb-3 pl-4 font-semibold text-right sm:text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => openTransaction(tx)}
                    className="hover:bg-neutral-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pr-4 font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      {tx.artwork}
                    </td>
                    <td className="py-4 px-4 text-slate-600">{tx.artist}</td>
                    <td className="py-4 px-4 text-slate-600">{tx.buyer}</td>
                    <td className="py-4 px-4 text-neutral-500 whitespace-nowrap">{tx.date}</td>
                    <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                      ₱{tx.grossAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                        ₱{tx.platformTakeAmount} (0%)
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#16A34A] whitespace-nowrap">
                      ₱{tx.netStudentPayout.toLocaleString()}
                    </td>
                    <td className="py-4 pl-4 text-right sm:text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${ORDER_CATEGORY_STYLES[getOrderCategory(tx)]}`}>
                        {ORDER_CATEGORIES.find((category) => category.id === getOrderCategory(tx))?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}

      {/* Full-page order and fulfillment details */}
      {selectedTx && (
        <div className="mx-auto w-full max-w-4xl animate-in fade-in">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedTx(null)}
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to manage orders
            </button>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900">
                    Fulfillment &amp; delivery
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Order {selectedTx.orderNumber || `#${selectedTx.id}`} · {selectedTx.artwork}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-neutral-50 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Artwork Title</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedTx.artwork}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Student Artist</span>
                  <span className="font-medium text-slate-800">{selectedTx.artist}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Collector / Buyer</span>
                  <span className="font-medium text-slate-800">{selectedTx.buyer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Acquisition Date</span>
                  <span className="font-medium text-slate-800">{selectedTx.date}</span>
                </div>
              </div>

              <div className="border border-neutral-200/80 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Gross Price</span>
                  <span className="font-bold text-slate-900">₱{selectedTx.grossAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Platform Commission (0%)</span>
                  <span className="font-semibold text-neutral-700">₱0</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>{selectedTx.status === 'Pending' || selectedTx.status === 'Shipped' ? 'Online payment processing' : 'Payment Gateway Processing (Sponsored)'}</span>
                  <span className={`font-semibold ${selectedTx.status === 'Pending' || selectedTx.status === 'Shipped' ? 'text-amber-700' : 'text-emerald-600'}`}>
                    {selectedTx.status === 'Pending' || selectedTx.status === 'Shipped' ? 'Not connected' : 'FREE'}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-900">
                    {selectedTx.status === 'Pending' || selectedTx.status === 'Shipped' ? 'Expected Student Payout' : 'Total Net Student Payout'}
                  </span>
                  <span className="font-extrabold text-[#16A34A] text-base">
                    ₱{selectedTx.netStudentPayout.toLocaleString()}
                  </span>
                </div>
              </div>

              <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
                <div className="flex items-start gap-3">
                  {selectedTx.deliveryMethod === 'campus_pickup'
                    ? <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                    : <Truck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900">Delivery & fulfillment</h4>
                    <p className="mt-1 text-xs text-neutral-600">
                      {selectedTx.deliveryMethod === 'campus_pickup'
                        ? 'Campus pickup'
                        : selectedTx.deliveryMethod === 'door_to_door'
                        ? 'Door-to-door delivery'
                        : 'No delivery details on this legacy transaction'}
                      {selectedTx.orderNumber && ` · ${selectedTx.orderNumber}`}
                    </p>
                    {selectedTx.deliveryAddress && (
                      <p className="mt-1 break-words text-xs text-neutral-600">{selectedTx.deliveryAddress}</p>
                    )}
                    {selectedTx.paymentMethod && (
                      <p className="mt-1 text-xs text-neutral-600">Payment preference: {selectedTx.paymentMethod}</p>
                    )}
                    <p className="mt-2 text-xs font-semibold text-blue-900">
                      Status: {selectedTx.fulfillmentStatus || 'Awaiting seller update'}
                    </p>
                    {selectedTx.shippingProvider && selectedTx.trackingNumber && (
                      <p className="mt-2 text-xs text-neutral-700">
                        Carrier: <strong>{selectedTx.shippingProvider}</strong> · Tracking: <strong>{selectedTx.trackingNumber}</strong>
                      </p>
                    )}
                    {selectedTx.fulfillmentStatus === 'Shipped' && (
                      <div className="mt-4 space-y-3 border-t border-blue-200 pt-4">
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">Shipping and rider details</h5>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            Review or update the parcel tracking and rider details before moving it to On the way.
                          </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block text-xs font-semibold text-slate-700">
                            Carrier
                            <input
                              type="text"
                              required
                              value={shippingProvider}
                              onChange={(event) => setShippingProvider(event.target.value)}
                              placeholder="Carrier name"
                              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-700">
                            Tracking number
                            <input
                              type="text"
                              required
                              value={trackingNumber}
                              onChange={(event) => setTrackingNumber(event.target.value)}
                              placeholder="Carrier tracking number"
                              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                            Tracking link
                            <input
                              type="url"
                              required
                              value={trackingUrl}
                              onChange={(event) => setTrackingUrl(event.target.value)}
                              placeholder="https://carrier.example/track/..."
                              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-700">
                            Rider name <span className="font-normal text-neutral-400">(optional)</span>
                            <input
                              type="text"
                              value={deliveryRiderName}
                              onChange={(event) => setDeliveryRiderName(event.target.value)}
                              placeholder="Enter rider's name"
                              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-700">
                            Rider phone number <span className="font-normal text-neutral-400">(optional)</span>
                            <input
                              type="tel"
                              value={deliveryRiderPhone}
                              onChange={(event) => setDeliveryRiderPhone(event.target.value)}
                              placeholder="Enter rider's phone number"
                              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>
                        </div>
                        {trackingDetailsError && <p role="alert" className="text-xs font-semibold text-red-700">{trackingDetailsError}</p>}
                        <button
                          type="button"
                          onClick={handleMarkOnTheWay}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-bold text-white hover:bg-violet-800"
                        >
                          <Truck className="h-4 w-4" />
                          Save details and mark on the way
                        </button>
                      </div>
                    )}
                    {selectedTx.fulfillmentStatus === 'On the way' && (
                      <div className="mt-4 space-y-3 border-t border-blue-200 pt-4">
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">Confirm delivery</h5>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            After confirming the parcel was delivered, upload proof of delivery and mark the order completed.
                          </p>
                        </div>
                        {proofOfDeliveryImage ? (
                          <div className="space-y-2">
                            <img src={proofOfDeliveryImage} alt="Proof of delivery" className="max-h-52 w-full rounded-xl border border-neutral-200 object-contain bg-neutral-50" />
                            <button
                              type="button"
                              onClick={() => setProofOfDeliveryImage('')}
                              className="text-xs font-semibold text-red-700 underline"
                            >
                              Remove proof image
                            </button>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-white px-4 py-5 text-sm font-semibold text-blue-900 hover:bg-blue-50">
                            <ImagePlus className="h-5 w-5" />
                            Upload proof of delivery image
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleProofImageChange}
                              className="sr-only"
                            />
                          </label>
                        )}
                        <p className="text-[11px] leading-4 text-neutral-500">
                          Images are resized before saving in this browser. Maximum upload size: 8 MB.
                        </p>
                        {proofImageError && <p role="alert" className="text-xs font-semibold text-red-700">{proofImageError}</p>}
                        {proofOfDeliveryImage && (
                          <button
                            type="button"
                            onClick={handleCompleteDelivery}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark as completed
                          </button>
                        )}
                      </div>
                    )}
                    {selectedTx.proofOfDeliveryImage && selectedTx.status === 'Completed' && (
                      <div className="mt-4 border-t border-blue-200 pt-4">
                        <p className="mb-2 text-sm font-bold text-slate-900">Proof of delivery</p>
                        {(selectedTx.deliveryRiderName || selectedTx.deliveryRiderPhone) && (
                          <div className="mb-3 rounded-xl bg-white p-3 text-xs text-slate-700">
                            {selectedTx.deliveryRiderName && <p>Rider: <strong>{selectedTx.deliveryRiderName}</strong></p>}
                            {selectedTx.deliveryRiderPhone && <p className="mt-1">Rider phone: <strong>{selectedTx.deliveryRiderPhone}</strong></p>}
                          </div>
                        )}
                        <img src={selectedTx.proofOfDeliveryImage} alt="Proof of delivery" className="max-h-52 w-full rounded-xl border border-neutral-200 object-contain bg-white" />
                        {selectedTx.completedAt && (
                          <p className="mt-2 text-xs text-neutral-500">Marked completed: {new Date(selectedTx.completedAt).toLocaleString()}</p>
                        )}
                      </div>
                    )}
                    {selectedTx.deliveryMethod && selectedTx.fulfillmentStatus === 'Processing' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTx(null);
                          onNavigateTab?.('shipping_fulfillment');
                        }}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                      >
                        <Truck className="h-4 w-4" />
                        Open fulfillment page
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <div className={`rounded-xl p-3 text-[11px] flex items-center gap-2 ${
                selectedTx.status === 'Pending' || selectedTx.status === 'Shipped'
                  ? 'bg-amber-50 text-amber-900'
                  : 'bg-emerald-50 text-emerald-800'
              }`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                  selectedTx.status === 'Pending' || selectedTx.status === 'Shipped'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`} />
                <span>
                  {selectedTx.status === 'Pending' || selectedTx.status === 'Shipped'
                    ? 'This prototype does not process payments or disburse payouts. Coordinate payment with the buyer directly.'
                    : '100% payout disbursed directly to registered student bank account via InstaPay.'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedTx(null);
                  onShowToast('Receipt Downloaded', `Official receipt generated for ${selectedTx.artwork}.`, 'info');
                }}
                className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
              >
                Download PDF Receipt
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2.5 border border-neutral-200 rounded-xl font-semibold text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
              >
                Back to orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
