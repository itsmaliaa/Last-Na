import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  Landmark,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { SellerOrderTransaction } from '../../types';

type EscrowStatus = NonNullable<SellerOrderTransaction['escrowStatus']>;
type EscrowFilter = 'All' | EscrowStatus;

interface AdminBankAccountViewProps {
  transactions: SellerOrderTransaction[];
  onUpdateEscrowStatus: (id: string, status: EscrowStatus) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

const getEscrowStatus = (transaction: SellerOrderTransaction): EscrowStatus => (
  transaction.escrowStatus ?? 'Awaiting payment'
);

const formatCurrency = (amount: number) => (
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
);

const statusStyles: Record<EscrowStatus, string> = {
  'Awaiting payment': 'bg-blue-50 text-blue-800 border-blue-200',
  Held: 'bg-amber-50 text-amber-800 border-amber-200',
  Released: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Refunded: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const AdminBankAccountView: React.FC<AdminBankAccountViewProps> = ({
  transactions,
  onUpdateEscrowStatus,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EscrowFilter>('All');

  const escrowTransactions = useMemo(
    () => transactions.map((transaction) => ({
      ...transaction,
      currentEscrowStatus: getEscrowStatus(transaction),
    })),
    [transactions]
  );

  const heldTransactions = escrowTransactions.filter((transaction) => transaction.currentEscrowStatus === 'Held');
  const awaitingTransactions = escrowTransactions.filter((transaction) => transaction.currentEscrowStatus === 'Awaiting payment');
  const releasedTransactions = escrowTransactions.filter((transaction) => transaction.currentEscrowStatus === 'Released');
  const refundedTransactions = escrowTransactions.filter((transaction) => transaction.currentEscrowStatus === 'Refunded');
  const heldBalance = heldTransactions.reduce((total, transaction) => total + transaction.grossAmount, 0);
  const awaitingTotal = awaitingTransactions.reduce((total, transaction) => total + transaction.grossAmount, 0);
  const releasedTotal = releasedTransactions.reduce((total, transaction) => total + transaction.grossAmount, 0);
  const refundedTotal = refundedTransactions.reduce((total, transaction) => total + transaction.grossAmount, 0);

  const filteredTransactions = escrowTransactions.filter((transaction) => {
    const matchesStatus = statusFilter === 'All' || transaction.currentEscrowStatus === statusFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [
      transaction.id,
      transaction.artwork,
      transaction.artist,
      transaction.buyer,
    ].some((value) => value.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const recordOutcome = (transaction: typeof escrowTransactions[number], status: EscrowStatus) => {
    const action = status === 'Held'
      ? 'receipt of funds'
      : status === 'Released'
        ? 'payout'
        : 'refund';
    const confirmed = window.confirm(
      `Record ${action} of ${formatCurrency(transaction.grossAmount)} for "${transaction.artwork}"? This only updates the local ledger; it does not move money.`
    );
    if (!confirmed) return;

    onUpdateEscrowStatus(transaction.id, status);
    onShowToast(
      status === 'Held'
        ? 'Funds Received Recorded'
        : status === 'Released'
          ? 'Payout Recorded'
          : 'Refund Recorded',
      `${transaction.id} was marked "${status}" in the ledger. No bank transfer was initiated.`,
      'info'
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700">
            <Landmark className="h-4 w-4" />
            <span>Admin Finance</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Bank Account &amp; Escrow</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Track customer funds held for sellers and record settlement outcomes.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
        <div>
          <p className="font-bold">Manual ledger — no bank is connected</p>
          <p className="mt-1 text-xs leading-relaxed text-blue-800">
          Orders are not treated as held funds until receipt is recorded. These actions update this local ledger only; they do not initiate a bank transfer or payment refund.
            Connect a payment provider and settlement account before handling real customer funds.
          </p>
        </div>
      </div>

      <section aria-label="Escrow summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Funds held</p>
            <Clock3 className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrency(heldBalance)}</p>
          <p className="mt-1 text-xs text-neutral-500">{heldTransactions.length} awaiting settlement</p>
        </div>
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Awaiting payment</p>
            <Clock3 className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrency(awaitingTotal)}</p>
          <p className="mt-1 text-xs text-neutral-500">{awaitingTransactions.length} orders; not confirmed received</p>
        </div>
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Payouts released</p>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrency(releasedTotal)}</p>
          <p className="mt-1 text-xs text-neutral-500">{releasedTransactions.length} recorded payouts</p>
        </div>
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Refunds recorded</p>
            <ArrowDownLeft className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrency(refundedTotal)}</p>
          <p className="mt-1 text-xs text-neutral-500">{refundedTransactions.length} recorded refunds</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-xs">
        <div className="flex flex-col gap-4 border-b border-neutral-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900">Escrow transaction ledger</h2>
            <p className="mt-1 text-xs text-neutral-500">
              {filteredTransactions.length} of {escrowTransactions.length} orders
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block sm:w-64">
              <span className="sr-only">Search transactions</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search order, artwork, buyer..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-red-400 focus:bg-white"
              />
            </label>
            <label>
              <span className="sr-only">Filter by escrow status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as EscrowFilter)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-red-400 sm:w-36"
              >
                <option value="All">All statuses</option>
                <option value="Awaiting payment">Awaiting payment</option>
                <option value="Held">Held</option>
                <option value="Released">Released</option>
                <option value="Refunded">Refunded</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Artwork</th>
                <th className="px-5 py-3">Customer / Seller</th>
                <th className="px-5 py-3">Order date</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Escrow status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-neutral-50/60">
                  <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-slate-800">{transaction.id}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{transaction.artwork}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{transaction.buyer}</p>
                    <p className="mt-0.5 text-neutral-500">Seller: {transaction.artist}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-neutral-600">{transaction.date}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-slate-900">
                    {formatCurrency(transaction.grossAmount)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[transaction.currentEscrowStatus]}`}>
                      {transaction.currentEscrowStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {transaction.currentEscrowStatus === 'Awaiting payment' ? (
                      <button
                        type="button"
                        onClick={() => recordOutcome(transaction, 'Held')}
                        className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 font-bold text-amber-900 transition-colors hover:bg-amber-100"
                      >
                        Record funds received
                      </button>
                    ) : transaction.currentEscrowStatus === 'Held' ? (
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => recordOutcome(transaction, 'Released')}
                          className="rounded-lg bg-emerald-700 px-3 py-2 font-bold text-white transition-colors hover:bg-emerald-800"
                        >
                          Record payout
                        </button>
                        <button
                          type="button"
                          onClick={() => recordOutcome(transaction, 'Refunded')}
                          className="rounded-lg border border-neutral-200 px-3 py-2 font-bold text-slate-700 transition-colors hover:bg-neutral-100"
                        >
                          Record refund
                        </button>
                      </div>
                    ) : (
                      <span className="text-neutral-400">No action</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-neutral-500">
                    No transactions match your search and status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
