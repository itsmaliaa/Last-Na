import React, { useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import { AuditLogItem } from '../../types';

interface AdminAuditLogsViewProps {
  logs: AuditLogItem[];
}

export const AdminAuditLogsView: React.FC<AdminAuditLogsViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [timeRange, setTimeRange] = useState('All time');

  const filtered = logs.filter((log) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        log.actor.toLowerCase().includes(q) ||
        log.information.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar (Exact match to logs.png) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search logs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 text-xs bg-neutral-50/80 border border-neutral-200 rounded-full focus:bg-white focus:outline-none focus:border-red-400"
            />
          </div>
        </div>

        {/* Date and Time Filters */}
        <div className="flex items-center gap-3 text-xs font-medium text-neutral-500">
          <div className="relative">
            <input
              type="text"
              placeholder="mm / dd / yyyy"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-3 pr-8 py-1.5 border border-neutral-200 rounded-xl bg-white text-slate-800 text-xs focus:outline-none cursor-pointer"
            />
            <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-neutral-200 rounded-xl px-3 py-1.5 bg-white text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option>All time</option>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table Container (Exact match to logs.png) */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs overflow-hidden">
        {/* Table Header Row */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-neutral-100">
          <h3 className="font-extrabold text-sm text-slate-900 tracking-wider uppercase">
            Audit Log List
          </h3>
          <span className="text-xs text-neutral-500">
            Showing {filtered.length} of {logs.length} entries
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/60 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Datetime</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Information</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                  {/* Datetime */}
                  <td className="px-6 py-4 text-neutral-600 font-mono whitespace-nowrap">
                    {item.datetime}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                    {item.action}
                  </td>

                  {/* Actor */}
                  <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                    {item.actor}
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 text-[11px] rounded-md border border-neutral-200/60">
                      {item.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                  </td>

                  {/* Information */}
                  <td className="px-6 py-4 text-neutral-700 whitespace-nowrap">
                    {item.information}
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
