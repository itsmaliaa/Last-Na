import React, { useState } from 'react';
import { Search, Eye, MoreVertical, ShieldCheck, User } from 'lucide-react';
import { AdminUser } from '../../types';

interface AdminUsersAdminsViewProps {
  admins: AdminUser[];
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminUsersAdminsView: React.FC<AdminUsersAdminsViewProps> = ({
  admins,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  const filtered = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar (Exact match to Admins.png) */}
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
            <select className="border border-neutral-200 rounded-xl px-3 py-1.5 bg-white text-slate-800 font-bold focus:outline-none cursor-pointer">
              <option>All Roles</option>
              <option>Super Admin</option>
              <option>Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admin Cards Grid (Exact match to Admins.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((adm) => (
          <div
            key={adm.id}
            className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
          >
            {/* Top row with info icon */}
            <div className="flex items-start justify-between">
              <div className="w-18 h-18 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 overflow-hidden border border-neutral-200/60">
                <svg
                  className="w-14 h-14 text-neutral-300 translate-y-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <button
                onClick={() => setSelectedAdmin(adm)}
                className="p-1 text-neutral-400 hover:text-slate-800 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-1">
              <h4 className="font-extrabold text-base text-slate-900">{adm.name}</h4>
              <p className="text-xs text-neutral-500 font-mono">{adm.handle}</p>
              <div className="pt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 inline-block">
                  {adm.role}
                </span>
              </div>
            </div>

            {/* View Info button */}
            <div className="pt-6">
              <button
                onClick={() => setSelectedAdmin(adm)}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-neutral-200/80 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-red-600" />
                <span>View Info</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Info Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-slate-900">Administrator Details</h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                Active
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <p><strong>Name:</strong> {selectedAdmin.name}</p>
              <p><strong>Handle:</strong> {selectedAdmin.handle}</p>
              <p><strong>Role:</strong> {selectedAdmin.role}</p>
              <p><strong>Privileges:</strong> Art Verification, User Management, Audit Inspection</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAdmin(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
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
