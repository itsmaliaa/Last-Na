import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  Palette,
  Eye,
  ArrowUpRight,
  PlusCircle,
  Ticket,
  Clock,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  MapPin,
  Calendar,
  Tag,
  AlertTriangle,
  Megaphone,
  Store,
  Layers,
  BarChart2,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Info,
  X,
  Plus,
  FileText,
  Users,
  Compass,
} from 'lucide-react';
import { SellerTab, Artwork, SellerOrderTransaction, SellerAnnouncement } from '../../types';

interface SellerDashboardViewProps {
  onNavigateTab: (tab: SellerTab) => void;
  artworks: Artwork[];
  transactions: SellerOrderTransaction[];
  announcements: SellerAnnouncement[];
  onAddAnnouncement: (announcement: SellerAnnouncement) => void;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
}

type MetricTab = 'visitors' | 'items_sold' | 'revenue' | 'stock';

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  onNavigateTab,
  artworks,
  transactions,
  announcements,
  onAddAnnouncement,
  onShowToast,
}) => {
  // Timeframe dropdown state: '7days' | 'month' | '3months' | 'all'
  const [timeframe, setTimeframe] = useState<'7days' | 'month' | '3months' | 'all'>('7days');
  const [activeMetricTab, setActiveMetricTab] = useState<MetricTab>('items_sold');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [currencyMode, setCurrencyMode] = useState<'PHP' | 'USD'>('PHP');

  // Announcement Form State
  const [annType, setAnnType] = useState<'sale' | 'booth' | 'exhibition'>('booth');
  const [annTitle, setAnnTitle] = useState('');
  const [annLocation, setAnnLocation] = useState('');
  const [annDate, setAnnDate] = useState('');
  const [annPromo, setAnnPromo] = useState('');
  const [annDesc, setAnnDesc] = useState('');

  // Stock calculations
  const totalStockCount = artworks.length;
  const soldCount = transactions.filter((t) => t.status === 'Completed').length;
  const inStockCount = Math.max(0, totalStockCount - soldCount);
  const lowStockCount = 2;

  // Timeframe-specific data
  const timeframeData = {
    '7days': {
      dropdownLabel: 'Last 7 days',
      updatedAt: 'Updated Jan 1, 16:00 (GMT-08:00)',
      visitors: '12.80K',
      visitorsDelta: '+ 1.55%',
      itemsSold: 1,
      itemsSoldDelta: '+ 100%',
      revenuePHP: 12000,
      revenueUSD: 30.08,
      revenueDelta: '+ 150%',
      locations: [
        { name: 'Metro Manila (NCR)', percent: 46, count: '5,888' },
        { name: 'Cebu & Central Visayas', percent: 22, count: '2,816' },
        { name: 'Davao & Southern Mindanao', percent: 14, count: '1,792' },
        { name: 'Northern Luzon (Baguio / Ilocos)', percent: 10, count: '1,280' },
        { name: 'International / Overseas Collectors', percent: 8, count: '1,024' },
      ],
      genders: [
        { label: 'Female', percent: 58, color: 'bg-rose-500', barColor: 'bg-rose-500' },
        { label: 'Male', percent: 36, color: 'bg-blue-500', barColor: 'bg-blue-500' },
        { label: 'Non-binary / Other', percent: 6, color: 'bg-purple-500', barColor: 'bg-purple-500' },
      ],
    },
    'month': {
      dropdownLabel: 'This month',
      updatedAt: 'Updated Sep 29, 17:35 (GMT+08:00)',
      visitors: '38.40K',
      visitorsDelta: '+ 24.6%',
      itemsSold: 1,
      itemsSoldDelta: '+ 100%',
      revenuePHP: 12000,
      revenueUSD: 30.08,
      revenueDelta: '+ 180%',
      locations: [
        { name: 'Metro Manila (NCR)', percent: 48, count: '18,432' },
        { name: 'Cebu & Central Visayas', percent: 24, count: '9,216' },
        { name: 'Davao & Southern Mindanao', percent: 13, count: '4,992' },
        { name: 'Northern Luzon (Baguio / Ilocos)', percent: 9, count: '3,456' },
        { name: 'International / Overseas Collectors', percent: 6, count: '2,304' },
      ],
      genders: [
        { label: 'Female', percent: 57, color: 'bg-rose-500', barColor: 'bg-rose-500' },
        { label: 'Male', percent: 37, color: 'bg-blue-500', barColor: 'bg-blue-500' },
        { label: 'Non-binary / Other', percent: 6, color: 'bg-purple-500', barColor: 'bg-purple-500' },
      ],
    },
    '3months': {
      dropdownLabel: 'Last 3 months',
      updatedAt: 'Updated Sep 29, 17:35 (GMT+08:00)',
      visitors: '94.20K',
      visitorsDelta: '+ 45.2%',
      itemsSold: 1,
      itemsSoldDelta: '+ 100%',
      revenuePHP: 12000,
      revenueUSD: 30.08,
      revenueDelta: '+ 210%',
      locations: [
        { name: 'Metro Manila (NCR)', percent: 45, count: '42,390' },
        { name: 'Cebu & Central Visayas', percent: 25, count: '23,550' },
        { name: 'Davao & Southern Mindanao', percent: 15, count: '14,130' },
        { name: 'Northern Luzon (Baguio / Ilocos)', percent: 9, count: '8,478' },
        { name: 'International / Overseas Collectors', percent: 6, count: '5,652' },
      ],
      genders: [
        { label: 'Female', percent: 60, color: 'bg-rose-500', barColor: 'bg-rose-500' },
        { label: 'Male', percent: 34, color: 'bg-blue-500', barColor: 'bg-blue-500' },
        { label: 'Non-binary / Other', percent: 6, color: 'bg-purple-500', barColor: 'bg-purple-500' },
      ],
    },
    'all': {
      dropdownLabel: 'All time',
      updatedAt: 'Updated Sep 29, 17:35 (GMT+08:00)',
      visitors: '142.50K',
      visitorsDelta: '+ 320%',
      itemsSold: 1,
      itemsSoldDelta: '+ 100%',
      revenuePHP: 12000,
      revenueUSD: 30.08,
      revenueDelta: '+ 250%',
      locations: [
        { name: 'Metro Manila (NCR)', percent: 47, count: '66,975' },
        { name: 'Cebu & Central Visayas', percent: 23, count: '32,775' },
        { name: 'Davao & Southern Mindanao', percent: 14, count: '19,950' },
        { name: 'Northern Luzon (Baguio / Ilocos)', percent: 10, count: '14,250' },
        { name: 'International / Overseas Collectors', percent: 6, count: '8,550' },
      ],
      genders: [
        { label: 'Female', percent: 59, color: 'bg-rose-500', barColor: 'bg-rose-500' },
        { label: 'Male', percent: 35, color: 'bg-blue-500', barColor: 'bg-blue-500' },
        { label: 'Non-binary / Other', percent: 6, color: 'bg-purple-500', barColor: 'bg-purple-500' },
      ],
    },
  };

  const current = timeframeData[timeframe];

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) {
      onShowToast('Missing Title', 'Please enter an announcement title.', 'error');
      return;
    }

    const newAnnouncement: SellerAnnouncement = {
      id: `ann-${Date.now()}`,
      title: annTitle.trim(),
      type: annType,
      description: annDesc.trim() || (annType === 'booth' ? 'Visit my student booth stand! Originals & prints on display.' : 'Studio discount on selected original pieces.'),
      locationOrBooth: annLocation.trim() || (annType === 'booth' ? 'Campus Quadrangle Booth' : 'Online Studio Store'),
      dateRange: annDate.trim() || 'Upcoming Event',
      discountPromo: annPromo.trim() || undefined,
      status: 'Active',
      createdAt: 'Today',
      viewsCount: 1,
    };

    onAddAnnouncement(newAnnouncement);
    setShowAnnounceModal(false);
    setAnnTitle('');
    setAnnLocation('');
    setAnnDate('');
    setAnnPromo('');
    setAnnDesc('');
    onShowToast(
      annType === 'booth' ? 'Booth Stand Announced!' : 'Sale Announced!',
      `"${newAnnouncement.title}" is now visible to buyers and visitors.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP ANALYTICS DASHBOARD CARD */}
      <div className="bg-[#fbfbfb] rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        {/* Top Header Row: Dropdown Select + Updated Timestamp + External details icon */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 relative">
            {/* Dropdown Button: Last 7 days v */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
                className="flex items-center gap-1.5 font-bold text-slate-900 hover:text-red-600 text-sm cursor-pointer transition-colors"
              >
                <span>{current.dropdownLabel}</span>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </button>

              {showTimeframeDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-40 animate-in fade-in zoom-in-95 text-xs">
                  {(['7days', 'month', '3months', 'all'] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setTimeframe(key);
                        setShowTimeframeDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                        timeframe === key ? 'font-bold text-red-600 bg-red-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{timeframeData[key].dropdownLabel}</span>
                      {timeframe === key && <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Updated timestamp from screenshot */}
            <span className="text-neutral-400 text-xs hidden sm:inline">
              {current.updatedAt}
            </span>
          </div>

          {/* Right Tools: Currency Toggle & Details Popout */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrencyMode(currencyMode === 'PHP' ? 'USD' : 'PHP')}
              className="text-[11px] font-bold text-neutral-500 hover:text-slate-900 bg-white border border-neutral-200 px-2 py-0.5 rounded-md shadow-2xs cursor-pointer"
              title="Toggle Currency Display (PHP ₱ / USD $)"
            >
              {currencyMode === 'PHP' ? 'Currency: ₱ PHP' : 'Currency: $ USD'}
            </button>
            <button
              onClick={() => onNavigateTab('order')}
              className="p-1.5 text-neutral-400 hover:text-slate-800 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              title="View Complete Orders & Sales Ledger"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Metric Cards: Visitors, Items sold, Revenue, Studio Stock */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
          {/* 1. Visitors > (Opens Location & Gender Demographics Modal when clicked) */}
          <button
            type="button"
            onClick={() => {
              setActiveMetricTab('visitors');
              setShowVisitorModal(true);
            }}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer relative group ${
              activeMetricTab === 'visitors'
                ? 'bg-[#e9ecef] shadow-2xs'
                : 'hover:bg-neutral-100/70'
            }`}
            title="Click to view visitor locations and gender demographics"
          >
            <div className="flex items-center justify-between text-slate-500 font-medium text-xs">
              <span className="group-hover:text-red-600 transition-colors font-semibold">Visitors</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {current.visitors}
            </div>
            <div className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center justify-between">
              <span>{current.visitorsDelta}</span>
              <span className="text-[10px] text-neutral-400 font-normal hidden group-hover:inline">View details</span>
            </div>
          </button>

          {/* 2. Items sold > (Redirects straight into the Order page in list type when clicked) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setActiveMetricTab('items_sold');
                onNavigateTab('order');
              }}
              className={`w-full p-3.5 rounded-xl text-left transition-all cursor-pointer group ${
                activeMetricTab === 'items_sold'
                  ? 'bg-[#e9ecef] shadow-2xs'
                  : 'hover:bg-neutral-100/70'
              }`}
              title="Click to redirect to Orders list"
            >
              <div className="flex items-center justify-between text-slate-500 font-medium text-xs">
                <span className="group-hover:text-red-600 transition-colors font-semibold">Items sold</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {current.itemsSold}
              </div>
              <div className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center justify-between">
                <span>{current.itemsSoldDelta}</span>
                <span className="text-[10px] text-neutral-400 font-normal hidden group-hover:inline">Open Orders</span>
              </div>
            </button>

          </div>

          {/* 3. Revenue > */}
          <button
            type="button"
            onClick={() => {
              setActiveMetricTab('revenue');
              onNavigateTab('order');
            }}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer ${
              activeMetricTab === 'revenue'
                ? 'bg-[#e9ecef] shadow-2xs'
                : 'hover:bg-neutral-100/70'
            }`}
            title="Click to view sales and revenue in Orders"
          >
            <div className="flex items-center justify-between text-slate-500 font-medium text-xs">
              <span className="font-semibold">Revenue</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {currencyMode === 'PHP'
                ? `₱${current.revenuePHP.toLocaleString()}`
                : `$${current.revenueUSD.toFixed(2)}`}
            </div>
            <div className="text-xs font-semibold text-emerald-600 mt-0.5">
              {current.revenueDelta}
            </div>
          </button>

          {/* 4. Studio Stock > (Redirects straight into the Stock page where seller edits stocks) */}
          <button
            type="button"
            onClick={() => {
              setActiveMetricTab('stock');
              onNavigateTab('stock');
            }}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer group ${
              activeMetricTab === 'stock'
                ? 'bg-[#e9ecef] shadow-2xs'
                : 'hover:bg-neutral-100/70'
            }`}
            title="Click to open the Stock page and edit stock quantities"
          >
            <div className="flex items-center justify-between text-slate-500 font-medium text-xs">
              <span className="group-hover:text-red-600 transition-colors font-semibold">Studio Stock</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {inStockCount} In Stock
            </div>
            <div className="text-xs font-semibold text-amber-600 mt-0.5 flex items-center justify-between">
              <span>{lowStockCount} Low stock prints</span>
              <span className="text-[10px] text-neutral-400 font-normal hidden group-hover:inline">Edit Stock</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. VISITOR DEMOGRAPHICS MODAL (Shows Location & Gender Percentages) */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Visitor Audience Demographics
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {current.visitors} total visits in {current.dropdownLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVisitorModal(false)}
                className="text-neutral-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECTION 1: VISITOR LOCATIONS (Percentages & Volume) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Visitor Locations (% Breakdown)
                  </h4>
                </div>
                <span className="text-xs font-semibold text-neutral-400">
                  5 primary geographic hubs
                </span>
              </div>

              <div className="space-y-2.5">
                {current.locations.map((loc, idx) => (
                  <div key={idx} className="bg-neutral-50 p-3 rounded-xl space-y-1.5 border border-neutral-200/60">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        {loc.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">{loc.count} visitors</span>
                        <span className="font-extrabold text-slate-900 text-xs px-2 py-0.5 bg-white rounded-md border border-neutral-200">
                          {loc.percent}%
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-red-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${loc.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: VISITOR GENDERS (Percentages & Distribution) */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Gender Distribution (% Breakdown)
                  </h4>
                </div>
                <span className="text-xs font-semibold text-neutral-400">
                  Self-identified & platform analytics
                </span>
              </div>

              {/* Stacked Comparative Bar */}
              <div className="h-4 rounded-full overflow-hidden flex bg-neutral-100">
                {current.genders.map((g, i) => (
                  <div
                    key={i}
                    style={{ width: `${g.percent}%` }}
                    className={`${g.barColor} h-full transition-all duration-500`}
                    title={`${g.label}: ${g.percent}%`}
                  />
                ))}
              </div>

              {/* Gender Legend Chips with percentage */}
              <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs">
                {current.genders.map((g, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 text-center space-y-1"
                  >
                    <div className="flex items-center justify-center gap-1.5 text-neutral-600 font-medium">
                      <span className={`w-2.5 h-2.5 rounded-full ${g.color}`} />
                      <span>{g.label}</span>
                    </div>
                    <p className="font-extrabold text-base text-slate-900">
                      {g.percent}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowVisitorModal(false)}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Demographics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CAMPUS BOOTH STANDS & ANNOUNCEMENTS PREVIEW */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Store className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Campus Booth Stands & Exhibition Notices
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                {announcements.filter((a) => a.type !== 'sale').length} Live
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Announce your upcoming physical booth stand or university showcase location to buyers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Announce Booth Stand</span>
            </button>
          </div>
        </div>

        {/* Live Announcements Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.filter((a) => a.type !== 'sale').map((ann) => (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                ann.type === 'booth'
                  ? 'bg-blue-50/20 border-blue-200/80'
                  : 'bg-red-50/20 border-red-200/80'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {ann.type === 'booth' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                        <Store className="w-3.5 h-3.5 text-blue-600" />
                        Physical Booth Stand Notice
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                        <Tag className="w-3.5 h-3.5 text-red-600" />
                        Studio Sale Announcement
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-400 font-medium">
                    {ann.viewsCount ?? 140} impressions
                  </span>
                </div>

                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                  {ann.title}
                </h4>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {ann.description}
                </p>

                <div className="pt-1 space-y-1 text-xs">
                  {ann.locationOrBooth && (
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{ann.locationOrBooth}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{ann.dateRange}</span>
                  </div>

                  {ann.discountPromo && (
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-white text-red-700 font-mono font-bold text-xs rounded-lg border border-red-200">
                      <Tag className="w-3 h-3" />
                      <span>{ann.discountPromo}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-400">Created: {ann.createdAt}</span>
                <button
                  onClick={() => onNavigateTab('marketing')}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Edit in Marketing Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MAKE ANNOUNCEMENT MODAL (Sale or Booth Stand) */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Make a Studio Announcement</h3>
                <p className="text-xs text-neutral-500">Announce a possible sale or your physical booth stand</p>
              </div>
              <button
                onClick={() => setShowAnnounceModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Announcement Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAnnType('booth')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                      annType === 'booth'
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-400 text-blue-900 font-bold'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Store className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold">Physical Booth Stand</p>
                      <p className="text-[10px] text-neutral-500">Campus fair or pop-up</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnnType('exhibition')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                      annType === 'exhibition'
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-400 text-blue-900 font-bold'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Store className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold">Campus Exhibition</p>
                      <p className="text-[10px] text-neutral-500">Fine arts showcase</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    annType === 'booth'
                      ? 'e.g. Physical Booth Stand: Fine Arts Week Table #A12'
                      : 'e.g. Annual CAFA Student Showcase Exhibition'
                  }
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-red-500 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {annType === 'booth' ? 'Booth Stand Location & Number *' : 'Exhibition Hall / Venue *'}
                </label>
                <input
                  type="text"
                  placeholder={
                    annType === 'booth'
                      ? 'e.g. Booth #B14 · University Arts Quadrangle (Main Hall)'
                      : 'e.g. CAFA Central Gallery (2nd Floor Atrium)'
                  }
                  value={annLocation}
                  onChange={(e) => setAnnLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-red-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date / Schedule *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oct 18 - 20, 2026 (9am - 5pm)"
                  value={annDate}
                  onChange={(e) => setAnnDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-red-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Details for Visitors</label>
                <textarea
                  rows={3}
                  placeholder="Share details about what pieces will be featured or where buyers can locate you..."
                  value={annDesc}
                  onChange={(e) => setAnnDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-red-500 text-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                >
                  Publish Announcement
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl font-semibold text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
