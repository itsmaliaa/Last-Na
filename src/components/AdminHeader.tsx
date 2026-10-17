import React, { useState } from 'react';
import { Search, Bell, Settings, Layers, LogOut, Check } from 'lucide-react';
import { ViewMode } from '../types';
import { RedNexusLogo } from './RedNexusLogo';

interface AdminHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentViewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchQuery,
  onSearchChange,
  currentViewMode,
  onChangeViewMode,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-18 px-6 sm:px-8 bg-white/70 backdrop-blur-md border-b border-neutral-200/80 flex items-center justify-between gap-4 sm:gap-6 sticky top-0 z-30">
      <div
        onClick={() => onChangeViewMode('marketplace')}
        className="cursor-pointer shrink-0"
        title="Go to Public Marketplace"
      >
        <RedNexusLogo size="md" />
      </div>

      {/* Search Input in Top Bar */}
      <div className="flex-1 min-w-0 max-w-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search artworks, submitters, or documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-neutral-100/90 border border-transparent rounded-full focus:bg-white focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Switch View Quick Pill */}
        <button
          onClick={() => onChangeViewMode('marketplace')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200 transition-colors cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-red-600" />
          <span>Exit to Marketplace</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="font-bold text-sm text-slate-900">Admin Notifications</span>
                <span className="text-[11px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">2 new</span>
              </div>
              <div className="divide-y divide-neutral-100 mt-2 text-xs">
                <div className="py-2.5">
                  <p className="font-semibold text-slate-800">New artwork submitted</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Jeremi Johnson submitted "Sunflower" for review</p>
                </div>
                <div className="py-2.5">
                  <p className="font-semibold text-slate-800">Student enrollment proof</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Dreizu uploaded registration verification card</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Icon */}
        <button
          onClick={() => alert('Admin Settings panel: System parameters, CAFA fee structure (0%), and API integrations verified.')}
          className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Admin User Capsule: Malia + J circle */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 pl-3 pr-1.5 py-1 bg-neutral-100 hover:bg-neutral-200/80 rounded-full border border-neutral-200 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-800">Malia</span>
            <div className="w-7 h-7 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              J
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-neutral-100">
                <div className="font-bold text-sm text-slate-900">Malia J.</div>
                <div className="text-xs text-slate-500">Super Administrator</div>
              </div>
              <button
                onClick={() => {
                  onChangeViewMode('seller_portal');
                  setShowUserDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <span>Switch to Seller Portal (Malia J)</span>
              </button>
              <button
                onClick={() => {
                  onChangeViewMode('buyer_profile');
                  setShowUserDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
              >
                <span>View Buyer Account (Ana Reyes)</span>
              </button>
              <button
                onClick={() => {
                  onChangeViewMode('marketplace');
                  setShowUserDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
