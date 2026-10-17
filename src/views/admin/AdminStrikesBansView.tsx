import React, { useState } from 'react';
import { Search, AlertTriangle, RotateCcw, Ban, Check } from 'lucide-react';
import { StrikeUser } from '../../types';

interface AdminStrikesBansViewProps {
  strikes: StrikeUser[];
  onAddStrike: (id: string) => void;
  onClearStrikes: (id: string) => void;
  onToggleBan: (id: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminStrikesBansView: React.FC<AdminStrikesBansViewProps> = ({
  strikes,
  onAddStrike,
  onClearStrikes,
  onToggleBan,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All Roles' | 'Seller' | 'Buyer'>('All Roles');

  const filtered = strikes.filter((item) => {
    if (roleFilter !== 'All Roles' && item.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.account.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar (Exact match to Strikers and Ban.png) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 text-xs bg-neutral-50/80 border border-neutral-200 rounded-full focus:bg-white focus:outline-none focus:border-red-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
          <div className="flex items-center gap-2">
            <span>Sort:</span>
            <select className="border border-neutral-200 rounded-xl px-3 py-1.5 bg-white text-slate-800 font-bold focus:outline-none cursor-pointer">
              <option>A to Z</option>
              <option>Z to A</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="border border-neutral-200 rounded-xl px-3 py-1.5 bg-white text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option>All Roles</option>
              <option>Seller</option>
              <option>Buyer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Strikes and Bans Table (Exact match to Strikers and Ban.png) */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/60 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Strikes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                  {/* Role */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                        item.role === 'Seller'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>

                  {/* Account */}
                  <td className="px-6 py-4.5 font-bold text-slate-900 whitespace-nowrap font-mono">
                    {item.account}
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4.5 text-neutral-600 whitespace-nowrap">
                    {item.email}
                  </td>

                  {/* Strikes */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span
                      className={`font-black text-xs ${
                        item.strikes > 0 ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      {item.strikes} / 3
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Active' ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      />
                      <span>{item.status}</span>
                    </span>
                  </td>

                  {/* Actions (Strike, Clear, Ban buttons) */}
                  <td className="px-6 py-4.5 text-right whitespace-nowrap space-x-2">
                    {/* Strike Button */}
                    <button
                      onClick={() => {
                        onAddStrike(item.id);
                        onShowToast('Strike Recorded', `Strike issued to ${item.account}`, 'error');
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-amber-300 text-amber-700 bg-amber-50/50 hover:bg-amber-100 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Strike</span>
                    </button>

                    {/* Clear Button (shown if strikes > 0) */}
                    {item.strikes > 0 && (
                      <button
                        onClick={() => {
                          onClearStrikes(item.id);
                          onShowToast('Strikes Cleared', `Strikes reset for ${item.account}`, 'success');
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Clear</span>
                      </button>
                    )}

                    {/* Ban Button */}
                    <button
                      onClick={() => {
                        onToggleBan(item.id);
                        onShowToast(
                          item.status === 'Active' ? 'Account Banned' : 'Account Re-enabled',
                          `${item.account} status changed to ${item.status === 'Active' ? 'Banned' : 'Active'}`,
                          item.status === 'Active' ? 'error' : 'success'
                        );
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-red-300 text-red-700 bg-rose-50/50 hover:bg-rose-100 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5 text-red-600" />
                      <span>{item.status === 'Active' ? 'Ban' : 'Unban'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
