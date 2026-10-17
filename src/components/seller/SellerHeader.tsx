import React, { useState } from 'react';
import { Search, Bell, Settings, Layers, LogOut, Check, ShoppingBag, Store, User, Shield } from 'lucide-react';
import { ViewMode } from '../../types';
import { RedNexusLogo } from '../RedNexusLogo';

interface SellerHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentViewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenSettings?: () => void;
}

export const SellerHeader: React.FC<SellerHeaderProps> = ({
  searchQuery,
  onSearchChange,
  currentViewMode,
  onChangeViewMode,
  onOpenSettings,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPortalMenu, setShowPortalMenu] = useState(false);

  return (
    <header className="h-18 px-6 sm:px-8 bg-white border-b border-neutral-200/80 flex items-center justify-between gap-4 sm:gap-6 sticky top-0 z-30 shadow-2xs">
      {/* Left: Red Nexus Logo */}
      <div 
        onClick={() => onChangeViewMode('marketplace')}
        className="cursor-pointer shrink-0"
        title="Go to Public Marketplace"
      >
        <RedNexusLogo size="md" />
      </div>

      {/* Search Input in Top Bar (Matches image: "Search artworks, submitters, or documents...") */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search artworks, submitters, or documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2 text-sm bg-neutral-100/90 border border-transparent rounded-full focus:bg-white focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-neutral-400 text-slate-800"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Switch View Portal Menu */}
        <div className="relative">
          <button
            onClick={() => setShowPortalMenu(!showPortalMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200 transition-colors cursor-pointer"
            title="Switch portal"
          >
            <Layers className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Portal Switcher</span>
          </button>

          {showPortalMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Select Red Nexus View
              </div>
              <button
                onClick={() => {
                  onChangeViewMode('marketplace');
                  setShowPortalMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors text-slate-700 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Marketplace & Gallery
                </span>
              </button>
              <button
                onClick={() => {
                  onChangeViewMode('buyer_profile');
                  setShowPortalMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors text-slate-700 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Buyer Profile (Ana Reyes)
                </span>
              </button>
              <button
                onClick={() => {
                  onChangeViewMode('seller_portal');
                  setShowPortalMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center justify-between bg-red-50/70 text-red-600 font-bold transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-red-600" />
                  Seller Portal (Malia J)
                </span>
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  onChangeViewMode('admin_portal');
                  setShowPortalMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors text-slate-700 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  Admin Management Suite
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="font-bold text-sm text-slate-900">Seller Alerts</span>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">New Order Paid</span>
              </div>
              <div className="divide-y divide-neutral-100 mt-2 text-xs">
                <div className="py-2.5">
                  <p className="font-semibold text-slate-800">Acquisition Completed</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Carla Espiritu purchased "Brutalist Pavilions" for ₱9,200. Payout ready.</p>
                </div>
                <div className="py-2.5">
                  <p className="font-semibold text-slate-800">CAFA Verification Passed</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Your artwork "Abstract Horizons" was approved for the Class of 2026 showcase.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Icon */}
        <button
          onClick={() => {
            if (onOpenSettings) {
              onOpenSettings();
            } else {
              setShowUserDropdown((prev) => !prev);
            }
          }}
          className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          title="Seller Settings"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-neutral-200" />

        {/* User Capsule: Malia + dark circle J (as shown in image) */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 pl-3 pr-1.5 py-1 bg-neutral-100 hover:bg-neutral-200/80 rounded-full border border-neutral-200 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-800">Malia</span>
            <div className="w-6.5 h-6.5 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              J
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-neutral-100">
                <p className="text-xs font-bold text-slate-900">Malia Santos</p>
                <p className="text-[11px] text-neutral-500">Student Artist · BFA Painting</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  Verified Seller · 0% Fee
                </span>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    onChangeViewMode('marketplace');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-neutral-50 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5 text-neutral-400" />
                  View Public Gallery Profile
                </button>
                <button
                  onClick={() => {
                    onChangeViewMode('marketplace');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Exit Seller Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
