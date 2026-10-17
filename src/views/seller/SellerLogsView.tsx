import React, { useState } from 'react';
import { History, Shield, CheckCircle2, Clock, DollarSign, Palette, Ticket } from 'lucide-react';

interface SellerLogsViewProps {
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
}

export const SellerLogsView: React.FC<SellerLogsViewProps> = ({ onShowToast }) => {
  const [filterType, setFilterType] = useState<string>('All');

  const logs = [
    {
      id: 'log-1',
      action: 'Payout Received',
      type: 'Finance',
      description: '₱9,200 disbursed via InstaPay for Brutalist Pavilions (Buyer: Carla Espiritu).',
      timestamp: 'Sep 01, 2026 · 18:42:10',
      icon: DollarSign,
      color: 'emerald',
    },
    {
      id: 'log-2',
      action: 'Artwork Verified',
      type: 'Verification',
      description: 'Prof. Chen approved "Abstract Horizons" for Class of 2026 Showcase.',
      timestamp: 'Aug 28, 2026 · 14:15:30',
      icon: Palette,
      color: 'blue',
    },
    {
      id: 'log-3',
      action: 'Voucher Redeemed',
      type: 'Marketing',
      description: 'Buyer Maria Santos redeemed voucher REDNEXUS10 for 10% discount.',
      timestamp: 'Aug 28, 2026 · 11:20:45',
      icon: Ticket,
      color: 'red',
    },
    {
      id: 'log-4',
      action: 'Payout Received',
      type: 'Finance',
      description: '₱12,000 disbursed via InstaPay for Abstract Horizons (0% platform fee).',
      timestamp: 'Aug 28, 2026 · 11:22:00',
      icon: DollarSign,
      color: 'emerald',
    },
    {
      id: 'log-5',
      action: 'Studio Authenticated Login',
      type: 'Security',
      description: 'Verified student authentication session from Quezon City, Manila (IP 120.29.***.***).',
      timestamp: 'Aug 25, 2026 · 09:04:12',
      icon: Shield,
      color: 'slate',
    },
  ];

  const filteredLogs = logs.filter(
    (l) => filterType === 'All' || l.type.toLowerCase() === filterType.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Audit Trail & Records</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Seller Studio Activity Logs
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Immutable log of student acquisitions, payout disbursements, and curatorial actions.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Finance', 'Verification', 'Marketing', 'Security'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="divide-y divide-neutral-100 text-xs">
          {filteredLogs.map((log) => {
            const Icon = log.icon;
            return (
              <div key={log.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    log.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                    log.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    log.color === 'red' ? 'bg-red-50 text-red-600' :
                    'bg-neutral-100 text-slate-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-neutral-100 rounded-md text-neutral-600">
                        {log.type}
                      </span>
                    </div>
                    <p className="text-neutral-600 text-xs leading-relaxed">{log.description}</p>
                  </div>
                </div>

                <div className="text-neutral-400 text-[11px] whitespace-nowrap shrink-0">
                  {log.timestamp}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
