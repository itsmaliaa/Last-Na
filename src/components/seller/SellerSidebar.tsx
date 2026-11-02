import React, { useState, useEffect } from 'react';
import {
  Menu,
  LayoutGrid,
  TrendingUp,
  Palette,
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
  Award,
  Search,
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
    currentTab === 'order' || currentTab === 'shipping_fulfillment' || currentTab === 'stock'
  );
  const [isArtVerificationOpen, setIsArtVerificationOpen] = useState(
    currentTab === 'art_verification' || currentTab === 'artist_gallery'
  );
  const [isVoucherMenuOpen, setIsVoucherMenuOpen] = useState(
    currentTab === 'voucher_generator' || currentTab === 'discount_code'
  );
  const [isAuthenticityOpen, setIsAuthenticityOpen] = useState(
    currentTab === 'certificate' || currentTab === 'authenticity_check'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab: SellerTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  // Auto-expand when external navigation occurs (e.g. from Dashboard or Gallery buttons)
  useEffect(() => {
    if (currentTab === 'order' || currentTab === 'shipping_fulfillment' || currentTab === 'stock') {
      setIsOrderOpen(true);
    }
  }, [currentTab]);

  useEffect(() => {
    if (currentTab === 'art_verification' || currentTab === 'artist_gallery') {
      setIsArtVerificationOpen(true);
    }
  }, [currentTab]);

  useEffect(() => {
    if (currentTab === 'voucher_generator' || currentTab === 'discount_code') {
      setIsVoucherMenuOpen(true);
    }
  }, [currentTab]);

  useEffect(() => {
    if (currentTab === 'certificate' || currentTab === 'authenticity_check') {
      setIsAuthenticityOpen(true);
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

  const handleVoucherMenuClick = () => {
    if (!isVoucherMenuOpen) {
      setIsVoucherMenuOpen(true);
      if (currentTab !== 'voucher_generator' && currentTab !== 'discount_code') {
        handleSelectTab('voucher_generator');
      }
    } else {
      setIsVoucherMenuOpen(false);
    }
  };

  const handleAuthenticityParentClick = () => {
    setIsAuthenticityOpen((isOpen) => !isOpen);
  };

  const isOrderActive = currentTab === 'order' || currentTab === 'shipping_fulfillment' || currentTab === 'stock';
  const isArtVerificationActive = currentTab === 'art_verification' || currentTab === 'artist_gallery';
  const isVoucherMenuActive = currentTab === 'voucher_generator' || currentTab === 'discount_code';
  const isAuthenticityActive = currentTab === 'certificate' || currentTab === 'authenticity_check';

  return (
    <aside className="w-full bg-[#8E1B24] text-white md:w-64 md:min-h-[calc(100vh-4.5rem)] flex flex-col shrink-0 select-none md:rounded-tr-3xl transition-all shadow-xl pb-4 md:pb-8">
      {/* Navigation header row */}
      <div className="pt-4 pb-2 px-5 md:pt-6 md:pb-3 md:px-6 flex items-center justify-between gap-3 text-white/80 font-medium text-sm">
        <div className="flex items-center gap-3">
          <Menu className="w-4.5 h-4.5 text-white/80" />
          <span className="font-semibold tracking-wide">Navigation</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          aria-expanded={isMobileMenuOpen}
          className="rounded-lg px-3 py-1.5 font-semibold text-white hover:bg-white/10 md:hidden"
        >
          {isMobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Navigation links list */}
      <nav className={`${isMobileMenuOpen ? 'flex' : 'hidden'} flex-col md:flex md:flex-col flex-1 px-3 space-y-1.5 mt-1 text-sm font-medium`}>
        {/* 1. Dashboard */}
        <button
          onClick={() => handleSelectTab('dashboard')}
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
                onClick={() => handleSelectTab('order')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  currentTab === 'order' || currentTab === 'shipping_fulfillment'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 shrink-0" />
                  <span>Manage Order</span>
                </div>
                {currentTab !== 'order' && currentTab !== 'shipping_fulfillment' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/15 text-white">
                    3
                  </span>
                )}
              </button>

              {/* Sub-item: Stock Inventory */}
              <button
                type="button"
                onClick={() => handleSelectTab('stock')}
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
                onClick={() => handleSelectTab('art_verification')}
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
                onClick={() => handleSelectTab('artist_gallery')}
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

        {/* 5. Settlement and Payout (Renamed from Finance) */}
        <button
          onClick={() => handleSelectTab('finance')}
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
          onClick={() => handleSelectTab('messages')}
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

        {/* 7. Vouchers and Discounts */}
        <div>
          <button
            type="button"
            onClick={handleVoucherMenuClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-medium transition-all text-left cursor-pointer group ${
              isVoucherMenuActive && !isVoucherMenuOpen
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : isVoucherMenuActive
                ? 'bg-white/15 text-white font-bold'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Ticket
                className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                  isVoucherMenuActive && !isVoucherMenuOpen
                    ? 'text-slate-900'
                    : 'text-white/85 group-hover:text-white'
                }`}
              />
              <span className="truncate">Vouchers and Discounts</span>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
                isVoucherMenuOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          {/* Voucher and discount options */}
          {isVoucherMenuOpen && (
            <div className="ml-5 pl-3 border-l-2 border-white/20 space-y-1 mt-1 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Sub-item 1: Voucher Generator */}
              <button
                type="button"
                onClick={() => handleSelectTab('voucher_generator')}
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
                onClick={() => handleSelectTab('discount_code')}
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

            </div>
          )}
        </div>

        {/* Authenticity tools dropdown */}
        <div>
          <button
            type="button"
            onClick={handleAuthenticityParentClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-medium transition-all text-left cursor-pointer group ${
              isAuthenticityActive && !isAuthenticityOpen
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : isAuthenticityActive
                ? 'bg-white/15 text-white font-bold'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <ShieldCheck
                className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                  isAuthenticityActive && !isAuthenticityOpen
                    ? 'text-slate-900'
                    : 'text-white/85 group-hover:text-white'
                }`}
              />
              <span className="truncate">Authenticity</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
                isAuthenticityOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          {isAuthenticityOpen && (
            <div className="ml-5 pl-3 border-l-2 border-white/20 space-y-1 mt-1 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <button
                type="button"
                onClick={() => handleSelectTab('certificate')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  currentTab === 'certificate'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>Certificate of Authenticity</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('authenticity_check')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  currentTab === 'authenticity_check'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Check Artwork Authenticity</span>
              </button>
            </div>
          )}
        </div>

        {/* 8. Logs */}
        <button
          onClick={() => handleSelectTab('logs')}
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
