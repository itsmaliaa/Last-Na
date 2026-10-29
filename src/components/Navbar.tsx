import React, { useState } from 'react';
import { RedNexusLogo } from './RedNexusLogo';
import { BlackCartIcon } from './BlackCartIcon';
import {
  Heart,
  User,
  Search,
  Menu,
  ChevronRight,
  ChevronDown,
  Shield,
  Package,
  MapPin,
  MessageSquare,
  KeyRound,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { MarketplaceTab, BuyerTab } from '../types';

interface NavbarProps {
  currentTab: MarketplaceTab;
  onSelectTab: (tab: MarketplaceTab) => void;
  favoritesCount: number;
  cartCount: number;
  onOpenCart: () => void;
  isBuyerProfile?: boolean;
  userName: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAllCategoriesOpen?: boolean;
  onToggleAllCategories?: () => void;
  onOpenAllCategories?: () => void;
  onCloseAllCategories?: (immediate?: boolean) => void;
  onNavigateToBuyerTab?: (tab: BuyerTab) => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount,
  cartCount,
  onOpenCart,
  isBuyerProfile = false,
  userName,
  searchQuery,
  onSearchChange,
  isAllCategoriesOpen = false,
  onToggleAllCategories,
  onOpenAllCategories,
  onCloseAllCategories,
  onNavigateToBuyerTab,
  onSignOut,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="w-full bg-white border-b border-neutral-100 sticky top-0 z-40 shadow-xs">
      {/* 1. Top Red Announcement Bar */}
      <div className="bg-[#E52535] text-white text-xs md:text-sm font-medium py-2 px-4 md:px-8 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2 truncate">
          <span>Special Spring Exhibition: Post-Digital Sculptures by Class of 2026 out now.</span>
        </div>
        <button
          onClick={() => onSelectTab('gallery')}
          className="flex items-center gap-1 font-semibold text-xs md:text-sm hover:underline cursor-pointer shrink-0 ml-4"
        >
          Explore Collection
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* 2. Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('home')}
          className="cursor-pointer shrink-0"
        >
          <RedNexusLogo size="md" />
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-2xl mx-2 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search artwork, artist, or medium..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-2 text-sm bg-white border border-neutral-200 rounded-full focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Hearts / Favorites Icon */}
          <button
            onClick={() => onSelectTab('hearts')}
            className={`p-2 rounded-full hover:bg-neutral-100 transition-colors relative cursor-pointer ${
              currentTab === 'hearts' ? 'text-red-600' : 'text-neutral-700'
            }`}
            title="Saved favorites"
          >
            <Heart className={`w-5 h-5 ${currentTab === 'hearts' ? 'fill-red-600 text-red-600' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* User Profile Slide-Down Bar Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              onTouchStart={() => setShowProfileMenu((prev) => !prev)}
              className={`p-2 rounded-full transition-all cursor-pointer relative ${
                showProfileMenu || isBuyerProfile
                  ? 'text-[#E52535] bg-red-50 ring-1 ring-red-200'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
              title="Customer Profile & Menu"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Customer Profile Slide Bar / Menu */}
            <div
              className={`absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-neutral-200/90 py-2.5 z-50 transition-all duration-200 origin-top-right transform ${
                showProfileMenu
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}
            >
              {/* Profile Card Header */}
              <div className="px-4 py-2.5 border-b border-neutral-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs text-slate-900 truncate">{userName}</div>
                  <div className="text-[11px] text-neutral-500 truncate">Buyer Account</div>
                </div>
              </div>

              {/* 7 Requested Buttons */}
              <div className="p-1.5 space-y-0.5 text-xs font-semibold text-neutral-700">
                {/* 1. Orders */}
                <button
                  onClick={() => {
                    onNavigateToBuyerTab?.('orders');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-neutral-100 transition-colors text-left cursor-pointer"
                >
                  <Package className="w-4 h-4 text-neutral-500" />
                  <span>Orders</span>
                </button>

                {/* 2. Addresses */}
                <button
                  onClick={() => {
                    onNavigateToBuyerTab?.('addresses');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-neutral-100 transition-colors text-left cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-neutral-500" />
                  <span>Addresses</span>
                </button>

                {/* 3. Messages */}
                <button
                  onClick={() => {
                    onNavigateToBuyerTab?.('messages');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-neutral-100 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-neutral-500" />
                    <span>Messages</span>
                  </div>
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    2
                  </span>
                </button>

                {/* 4. Security & privacy */}
                <button
                  onClick={() => {
                    onNavigateToBuyerTab?.('security');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-neutral-100 transition-colors text-left cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-neutral-500" />
                  <span>Security & privacy</span>
                </button>

                {/* 5. Password */}
                <button
                  onClick={() => {
                    onNavigateToBuyerTab?.('password');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-neutral-100 transition-colors text-left cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-neutral-500" />
                  <span>Password</span>
                </button>

                {/* 6. Payment methods */}
                <button
                  onClick={() => {
                    onNavigateToBuyerTab?.('payments');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-neutral-100 transition-colors text-left cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-neutral-500" />
                  <span>Payment methods</span>
                </button>

                {/* 7. Sign out */}
                <div className="pt-1 mt-1 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      onSignOut?.();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer font-bold"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Shopping Cart Button with badge 2 */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
            title="Shopping Cart"
          >
            <BlackCartIcon className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E52535] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Secondary Links Bar */}
      <div className="border-t border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs sm:text-sm font-medium text-neutral-700">
          <div className="flex items-center gap-6 py-2.5 overflow-x-auto no-scrollbar">
            {/* All Categories Button Trigger (Hold to show, release to retract on its own) */}
            <button
              onClick={onToggleAllCategories}
              onMouseDown={onOpenAllCategories}
              onMouseUp={() => onCloseAllCategories?.(true)}
              onTouchStart={onOpenAllCategories}
              onTouchEnd={() => onCloseAllCategories?.(true)}
              onMouseEnter={onOpenAllCategories}
              onMouseLeave={() => onCloseAllCategories?.(false)}
              className={`flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap py-1 px-2.5 rounded-full select-none ${
                isAllCategoriesOpen
                  ? 'text-[#E52535] font-bold bg-red-50/90 shadow-2xs ring-1 ring-red-200/50'
                  : 'hover:text-red-600 hover:bg-neutral-50'
              }`}
              title="Hold to show All Categories, release to retract"
            >
              <Menu className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isAllCategoriesOpen ? 'rotate-180 text-red-600' : 'text-neutral-400'
                }`}
              />
            </button>

            <button
              onClick={() => onSelectTab('shop')}
              className={`hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap pb-0.5 ${
                currentTab === 'shop' ? 'text-red-600 font-semibold border-b-2 border-red-600' : ''
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => onSelectTab('artists')}
              className={`hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap pb-0.5 ${
                currentTab === 'artists' || currentTab === 'artist_profile' ? 'text-red-600 font-semibold border-b-2 border-red-600' : ''
              }`}
            >
              Artist
            </button>
            <button
              onClick={() => onSelectTab('gallery')}
              className={`hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap pb-0.5 ${
                currentTab === 'gallery' ? 'text-red-600 font-semibold border-b-2 border-red-600' : ''
              }`}
            >
              Gallery
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-6 py-2.5 text-neutral-600">
            <button
              onClick={() => onSelectTab('home')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button
              onClick={() => onNavigateToBuyerTab?.('orders')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Help Support
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
