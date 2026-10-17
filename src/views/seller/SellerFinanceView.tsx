import React, { useState } from 'react';
import {
  BarChart3,
  DollarSign,
  Landmark,
  Smartphone,
  CheckCircle2,
  Download,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { SellerOrderTransaction } from '../../types';

interface SellerFinanceViewProps {
  transactions: SellerOrderTransaction[];
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
}

export const SellerFinanceView: React.FC<SellerFinanceViewProps> = ({
  transactions,
  onShowToast,
}) => {
  const [payoutMethod, setPayoutMethod] = useState<'gcash' | 'bank' | 'maya'>('gcash');
  const [accountNumber, setAccountNumber] = useState('0917-***-4821');

  const totalEarned = transactions.reduce((acc, curr) => acc + curr.netStudentPayout, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Student Artist Financials</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Settlement and Payout
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            100% of purchase proceeds are disbursed directly to you with zero commission fees deducted.
          </p>
        </div>

        <button
          onClick={() => onShowToast('Ledger Downloaded', 'Financial statement for Q3 2026 saved.', 'success')}
          className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-slate-800 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-neutral-500" />
          <span>Export Financial Statement</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Disbursed</p>
          <h3 className="text-3xl font-extrabold text-[#16A34A] mt-2">₱{totalEarned.toLocaleString()}</h3>
          <p className="text-xs text-emerald-600 font-medium mt-3">Disbursed directly via InstaPay</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Platform Take (CAFA)</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">₱0 (0%)</h3>
          <p className="text-xs text-neutral-400 mt-3">Subsidized student empowerment</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Available Balance</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">₱0.00</h3>
          <p className="text-xs text-neutral-400 mt-3">All funds settled in real-time</p>
        </div>
      </div>

      {/* Payout Destination Account */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Direct Payout Account</h3>
            <p className="text-xs text-neutral-500">Your registered payout destination for artwork sales</p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified & Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPayoutMethod('gcash')}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              payoutMethod === 'gcash'
                ? 'border-red-500 bg-red-50/30 ring-1 ring-red-400'
                : 'border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>GCash (Mobile Wallet)</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">0917-***-4821 (Malia S.)</p>
          </button>

          <button
            type="button"
            onClick={() => setPayoutMethod('maya')}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              payoutMethod === 'maya'
                ? 'border-red-500 bg-red-50/30 ring-1 ring-red-400'
                : 'border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Maya Wallet</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">0917-***-4821</p>
          </button>

          <button
            type="button"
            onClick={() => setPayoutMethod('bank')}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              payoutMethod === 'bank'
                ? 'border-red-500 bg-red-50/30 ring-1 ring-red-400'
                : 'border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Landmark className="w-4 h-4 text-slate-600" />
              <span>BPI Student Savings</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">**** **** 9214</p>
          </button>
        </div>
      </div>
    </div>
  );
};
