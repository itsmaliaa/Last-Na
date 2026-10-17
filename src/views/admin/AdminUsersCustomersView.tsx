import React, { useState } from 'react';
import { Search, Eye, MoreVertical } from 'lucide-react';
import { CustomerUser } from '../../types';

interface AdminUsersCustomersViewProps {
  customers: CustomerUser[];
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminUsersCustomersView: React.FC<AdminUsersCustomersViewProps> = ({
  customers,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCust, setSelectedCust] = useState<CustomerUser | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Search Input Bar (Exact match to Customer.png) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student name, school number, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-xs bg-neutral-50/80 border border-neutral-200 rounded-full focus:bg-white focus:outline-none focus:border-red-400"
          />
        </div>
      </div>

      {/* Customer Cards Grid (Exact match to Customer.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cust) => (
          <div
            key={cust.id}
            className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
          >
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
                onClick={() => setSelectedCust(cust)}
                className="p-1 text-neutral-400 hover:text-slate-800 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-1">
              <h4 className="font-extrabold text-base text-slate-900">{cust.name}</h4>
              <p className="text-xs text-neutral-500 font-mono">{cust.handle}</p>
              <div className="pt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 inline-block">
                  {cust.role}
                </span>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => setSelectedCust(cust)}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-neutral-200/80 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-red-600" />
                <span>View Info</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Info Modal */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-slate-900">Customer Profile</h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                Active Patron
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <p><strong>Name:</strong> {selectedCust.name}</p>
              <p><strong>Handle:</strong> {selectedCust.handle}</p>
              <p><strong>Email:</strong> {selectedCust.email}</p>
              <p><strong>Total Purchases:</strong> 2 Completed acquisitions</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCust(null)}
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
