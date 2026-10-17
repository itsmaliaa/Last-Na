import React, { useState } from 'react';
import {
  CreditCard,
  TrendingUp,
  Download,
  Search,
  CheckCircle,
  FileText,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

interface AdminSalesViewProps {
  onExport: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminSalesView: React.FC<AdminSalesViewProps> = ({
  onExport,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const salesRecords = [
    {
      id: 'TX-2026-0901',
      artwork: 'Deforestation',
      student: 'Jake Doe',
      dept: 'Visual Communication',
      buyer: 'Ana Reyes',
      amount: 8500,
      studentPayout: 8500,
      fee: 0,
      date: 'Aug 30, 2026',
      status: 'Paid Out',
    },
    {
      id: 'TX-2026-0814',
      artwork: 'Sunflower',
      student: 'Jeremi Johnson',
      dept: 'BFA Painting',
      buyer: 'Dotdot',
      amount: 5000,
      studentPayout: 5000,
      fee: 0,
      date: 'Aug 28, 2026',
      status: 'Paid Out',
    },
    {
      id: 'TX-2026-0802',
      artwork: 'Monolith Concept Study',
      student: 'Lu Han',
      dept: 'BS Architecture',
      buyer: 'Benjamin Reyes',
      amount: 5000,
      studentPayout: 5000,
      fee: 0,
      date: 'Aug 20, 2026',
      status: 'Paid Out',
    },
  ];

  const filtered = salesRecords.filter(
    (s) =>
      s.artwork.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Gross Sales
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₱18,500</div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold">100% completed</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Completed Orders
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">2</div>
          <div className="text-xs text-neutral-500 mt-1">Acquisitions finalized</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Avg. Order Value
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₱9,250</div>
          <div className="text-xs text-neutral-500 mt-1">Per student transaction</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Student Payouts
          </div>
          <div className="text-2xl font-extrabold text-[#E52535] mt-1">₱18,500</div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold">0% Platform commission</div>
        </div>
      </div>

      {/* 2. Top Bar & Export */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by transaction ID, artwork, student, or buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 text-xs bg-neutral-50/80 border border-neutral-200 rounded-full focus:bg-white focus:outline-none focus:border-red-400"
            />
          </div>
        </div>

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#8E1B24] hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* 3. Sales Ledger Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs overflow-hidden">
        <div className="p-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 tracking-wider uppercase">
            Sales & Student Payouts Ledger
          </h3>
          <span className="text-xs text-neutral-500">
            Showing {filtered.length} of {salesRecords.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/60 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Artwork</th>
                <th className="px-6 py-4">Student Creator</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Fee</th>
                <th className="px-6 py-4">Student Net</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{tx.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{tx.artwork}</td>
                  <td className="px-6 py-4 text-neutral-700">
                    <div>{tx.student}</div>
                    <div className="text-[11px] text-neutral-400">{tx.dept}</div>
                  </td>
                  <td className="px-6 py-4 text-neutral-700">{tx.buyer}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">₱{tx.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-emerald-600 font-bold">₱0.00 (0%)</td>
                  <td className="px-6 py-4 font-extrabold text-emerald-700">
                    ₱{tx.studentPayout.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onShowToast('Receipt Downloaded', `Receipt for ${tx.id} exported as PDF.`, 'success')}
                      className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-slate-700 transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <FileText className="w-4 h-4" />
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
