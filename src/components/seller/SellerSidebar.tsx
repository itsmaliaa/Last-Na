import React, { useState, useEffect } from 'react';
import {
  Menu,
  LayoutGrid,
  TrendingUp,
  Palette,
  ShoppingBag,
  BarChart3,
  MessageSquare,
  Image as ImageIcon,
  Ticket,
  History,
  Package,
  ChevronDown,
  ClipboardList,
  ShieldCheck,
  Tag,
  Sparkles,
} from 'lucide-react';
import { SellerTab } from '../../types';

interface SellerSidebarProps {
  currentTab: SellerTab;
  onSelectTab: (tab: SellerTab) => void;
  unreadMessagesCount?: number;
  pendingVerificationCount?: number;
}

export const SellerSidebar: React.FC<SellerSidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadMessagesCount = 2,
  pendingVerificationCount = 1,
}) => {
  // State for dropdowns
  const [isOrderOpen, setIsOrderOpen] = useState(
    currentTab === 'order' || currentTab === 'stock'
  );
  const [isArtVerificationOpen, setIsArtVerificationOpen] = useState(
    currentTab === 'art_verification' || currentTab === 'artist_gallery'
  );
  const [isVoucherPromotionsOpen, setIsVoucherPromotionsOpen] = useState(
    currentTab === 'voucher_generator' || currentTab === 'discount_code' || currentTab === 'promotions'
  );

  // Auto-expand when external navigation occurs (e.g. from Dashboard or Gallery buttons)
  useEffect(() => {
    if (currentTab === 'order' || currentTab === 'stock') {
      setIsOrderOpen(true);
    }
  }, [currentTab]);

  useEffect(() => {
    if (currentTab === 'art_verification' || currentTab === 'artist_gallery') {
      setIsArtVerificationOpen(true);
    }
  }, [currentTab]);

  useEffect(() => {
    if (currentTab === 'voucher_generator' || currentTab === 'discount_code' || currentTab === 'promotions') {
      setIsVoucherPromotionsOpen(true);
    }
  }, [currentTab]);

  const handleOrderParentClick = () => {
    if (!isOrderOpen) {
      setIsOrderOpen(true);
    } else {
      setIsOrderOpen(false);
    }
  };

  const handleArtVerificationParentClick = () => {
    if (!isArtVerificationOpen) {
      setIsArtVerificationOpen(true);
    } else {
      setIsArtVerificationOpen(false);
    }
  };

  const handleVoucherPromotionsParentClick = () => {
    if (!isVoucherPromotionsOpen) {
      setIsVoucherPromotionsOpen(true);
      if (currentTab !== 'voucher_generator' && currentTab !== 'discount_code' && currentTab !== 'promotions') {
        onSelectTab('voucher_generator');
      }
    } else {
      setIsVoucherPromotionsOpen(false);
    }
  };

  const isOrderActive = currentTab === 'order' || currentTab === 'stock';
  const isArtVerificationActive = currentTab === 'art_verification' || currentTab === 'artist_gallery';
  const isVoucherPromotionsActive =
    currentTab === 'voucher_generator' || currentTab === 'discount_code' || currentTab === 'promotions';

  return (
    <aside className="w-64 bg-[#8E1B24] text-white min-h-[calc(100vh-4.5rem)] flex flex-col shrink-0 select-none rounded-tr-3xl transition-all shadow-xl pb-8">
      {/* Navigation header row */}
      <div className="pt-6 pb-3 px-6 flex items-center gap-3 text-white/80 font-medium text-sm">
        <Menu className="w-4.5 h-4.5 text-white/80" />
        <span className="font-semibold tracking-wide">Navigation</span>
      </div>

      {/* Navigation links list */}
      <nav className="flex-1 px-3 space-y-1.5 mt-1 text-sm font-medium">
        {/* 1. Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-medium transition-all text-left cursor-pointer group ${
            currentTab === 'dashboard'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <LayoutGrid
              className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                currentTab === 'dashboard' ? 'text-slate-900' : 'text-white/85 group-hover:text-white'
              }`}
            />
            <span className="truncate">Dashboard</span>
          </div>
        </button>

        {/* 2. Order (Dropdown with "Manage Order" & "Stock Inventory") */}
        <div>
          <button
            type="button"
            onClick={handleOrderParentClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-medium transition-all text-left cursor-pointer group ${
              isOrderActive && !isOrderOpen
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : isOrderActive
                ? 'bg-white/15 text-white font-bold'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <TrendingUp
                className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                  isOrderActive && !isOrderOpen
                    ? 'text-slate-900'
                    : 'text-white/85 group-hover:text-white'
                }`}
              />
              <span className="truncate">Order</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                3
              </span>
              <ChevronDown
                className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
                  isOrderOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </div>
          </button>

          {/* Order Dropdown Items */}
          {isOrderOpen && (
            <div className="ml-5 pl-3 border-l-2 border-white/20 space-y-1 mt-1 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Sub-item: Manage Order */}
              <button
                type="button"
                onClick={() => onSelectTab('order')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  currentTab === 'order'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 shrink-0" />
                  <span>Manage Order</span>
                </div>
                {currentTab !== 'order' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/15 text-white">
                    3
                  </span>
                )}
              </button>

              {/* Sub-item: Stock Inventory */}
              <button
                type="button"
                onClick={() => onSelectTab('stock')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  currentTab === 'stock'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 shrink-0" />
                  <span>Stock Inventory</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 3. Manage Products (Dropdown with "Product Verification" & "Product Gallery") */}
        <div>
          <button
            type="button"
            onClick={handleArtVerificationParentClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-medium transition-all text-left cursor-pointer group ${
              isArtVerificationActive && !isArtVerificationOpen
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : isArtVerificationActive
                ? 'bg-white/15 text-white font-bold'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Palette
                className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                  isArtVerificationActive && !isArtVerificationOpen
                    ? 'text-slate-900'
                    : 'text-white/85 group-hover:text-white'
                }`}
              />
              <span className="truncate">Manage Products</span>
            </div>

            <div className="flex items-center gap-2">
              {pendingVerificationCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  {pendingVerificationCount}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
                  isArtVerificationOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </div>
          </button>

          {/* Product Verification Dropdown Items */}
          {isArtVerificationOpen && (
            <div className="ml-5 pl-3 border-l-2 border-white/20 space-y-1 mt-1 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Sub-item: Product Verification */}
              <button
                type="button"
                onClick={() => onSelectTab('art_verification')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  currentTab === 'art_verification'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Product Verification</span>
                </div>
                {pendingVerificationCount > 0 && currentTab !== 'art_verification' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/15 text-white">
                    {pendingVerificationCount}
                  </span>
                )}
              </button>

              {/* Sub-item: Product Gallery */}
              <button
                type="button"
                onClick={() => onSelectTab('artist_gallery')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  currentTab === 'artist_gallery'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <span>Product Gallery</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 4. Marketing */}
        <button
          onClick={() => onSelectTab('marketing')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-medium transition-all text-left cursor-pointer group ${
            currentTab === 'marketing'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <ShoppingBag
              className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                currentTab === 'marketing' ? 'text-slate-900' : 'text-white/85 group-hover:text-white'
              }`}
            />
            <span className="truncate">Marketing</span>
          </div>
        </button>

        {/* 5. Settlement and Payout (Renamed from Finance) */}
        <button
          onClick={() => onSelectTab('finance')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-medium transition-all text-left cursor-pointer group ${
            currentTab === 'finance'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <BarChart3
              className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                currentTab === 'finance' ? 'text-slate-900' : 'text-white/85 group-hover:text-white'
              }`}
            />
            <span className="truncate">Settlement and Payout</span>
          </div>
        </button>

        {/* 6. Customer Service (Renamed from Messages) */}
        <button
          onClick={() => onSelectTab('messages')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-medium transition-all text-left cursor-pointer group ${
            currentTab === 'messages'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <MessageSquare
              className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                currentTab === 'messages' ? 'text-slate-900' : 'text-white/85 group-hover:text-white'
              }`}
            />
            <span className="truncate">Customer Service</span>
          </div>

          {unreadMessagesCount > 0 && currentTab !== 'messages' && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* 7. Voucher and Promotions (Dropdown with Voucher Generator, Discount Code, Promotions) */}
        <div>
          <button
            type="button"
            onClick={handleVoucherPromotionsParentClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-medium transition-all text-left cursor-pointer group ${
              isVoucherPromotionsActive && !isVoucherPromotionsOpen
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : isVoucherPromotionsActive
                ? 'bg-white/15 text-white font-bold'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Ticket
                className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                  isVoucherPromotionsActive && !isVoucherPromotionsOpen
                    ? 'text-slate-900'
                    : 'text-white/85 group-hover:text-white'
                }`}
              />
              <span className="truncate">Voucher and Promotions</span>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
                isVoucherPromotionsOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          {/* Voucher and Promotions Dropdown Items */}
          {isVoucherPromotionsOpen && (
            <div className="ml-5 pl-3 border-l-2 border-white/20 space-y-1 mt-1 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Sub-item 1: Voucher Generator */}
              <button
                type="button"
                onClick={() => onSelectTab('voucher_generator')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  currentTab === 'voucher_generator'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 shrink-0" />
                  <span>Voucher Generator</span>
                </div>
              </button>

              {/* Sub-item 2: Discount Code */}
              <button
                type="button"
                onClick={() => onSelectTab('discount_code')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  currentTab === 'discount_code'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 shrink-0" />
                  <span>Discount Code</span>
                </div>
              </button>

              {/* Sub-item 3: Promotions */}
              <button
                type="button"
                onClick={() => onSelectTab('promotions')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  currentTab === 'promotions'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Promotions</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 8. Logs */}
        <button
          onClick={() => onSelectTab('logs')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-medium transition-all text-left cursor-pointer group ${
            currentTab === 'logs'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <History
              className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                currentTab === 'logs' ? 'text-slate-900' : 'text-white/85 group-hover:text-white'
              }`}
            />
            <span className="truncate">Logs</span>
          </div>
        </button>
      </nav>
    </aside>
  );
};
