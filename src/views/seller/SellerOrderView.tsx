import React, { useState } from 'react';
import {
  Download,
  Search,
  TrendingUp,
  Tag,
  DollarSign,
  CheckCircle2,
  FileText,
  X,
  CreditCard,
  User,
  Calendar,
  ExternalLink,
  List,
  LayoutGrid,
  Package,
  ChevronRight,
  Truck,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { SellerOrderTransaction, SellerTab } from '../../types';

interface SellerOrderViewProps {
  transactions: SellerOrderTransaction[];
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateTab?: (tab: SellerTab) => void;
}

export const SellerOrderView: React.FC<SellerOrderViewProps> = ({
  transactions,
  onShowToast,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<SellerOrderTransaction | null>(null);
  const [displayMode, setDisplayMode] = useState<'list' | 'table'>('list');
  const [activeTodo, setActiveTodo] = useState<'orders_to_ship' | 'pending_returns' | 'unread_messages' | 'low_stock'>('orders_to_ship');

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const q = searchTerm.toLowerCase();
    return (
      tx.artwork.toLowerCase().includes(q) ||
      tx.artist.toLowerCase().includes(q) ||
      tx.buyer.toLowerCase().includes(q) ||
      tx.date.toLowerCase().includes(q)
    );
  });

  // Calculate dynamic totals
  const totalGross = transactions.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalPayout = transactions.reduce((acc, curr) => acc + curr.netStudentPayout, 0);

  // Handle Export Sales CSV
  const handleExportCSV = () => {
    const headers = ['ARTWORK,ARTIST,BUYER,DATE,PRICE,PLATFORM TAKE,NET STUDENT PAYOUT,STATUS'];
    const rows = transactions.map(
      (tx) =>
        `"${tx.artwork}","${tx.artist}","${tx.buyer}","${tx.date}",₱${tx.grossAmount.toLocaleString()},"₱${tx.platformTakeAmount} (${tx.platformTakeRate}%)",₱${tx.netStudentPayout.toLocaleString()},"Completed"`
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
                onShowToast('Orders to ship', '1 artwork completed and ready for student payout & packaging.', 'info');
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
                1
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
              {filteredTransactions.length} item{filteredTransactions.length === 1 ? '' : 's'} sold
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
                onClick={() => setSelectedTx(tx)}
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
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tx.status}
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
                <p className="font-semibold text-sm text-slate-700">No sold items recorded yet</p>
                <p className="text-xs text-neutral-400">Transactions will appear here once buyers acquire your work.</p>
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
                    onClick={() => setSelectedTx(tx)}
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
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Order Receipt Breakdown
                  </h3>
                  <p className="text-xs text-neutral-400">Order ID: #{selectedTx.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
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
                  <span>Payment Gateway Processing (Sponsored)</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-900">Total Net Student Payout</span>
                  <span className="font-extrabold text-[#16A34A] text-base">
                    ₱{selectedTx.netStudentPayout.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 text-[11px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  100% payout disbursed directly to registered student bank account via InstaPay.
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
