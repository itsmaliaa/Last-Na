import React, { useState } from 'react';
import { Ticket, Plus, Copy, Check, Clock, Percent, DollarSign, Trash2 } from 'lucide-react';
import { VoucherItem } from '../../types';

interface SellerVoucherGeneratorViewProps {
  initialVouchers: VoucherItem[];
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
  mode?: 'voucher' | 'discount';
}

export const SellerVoucherGeneratorView: React.FC<SellerVoucherGeneratorViewProps> = ({
  initialVouchers,
  onShowToast,
  mode = 'voucher',
}) => {
  const [vouchers, setVouchers] = useState<VoucherItem[]>(initialVouchers);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    mode === 'discount' ? 'fixed' : 'percentage'
  );
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minSpend, setMinSpend] = useState<number>(2000);
  const [usageLimit, setUsageLimit] = useState<number>(50);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleGenerateRandomCode = () => {
    const prefixes = ['NEXUS', 'CAFA', 'MALIA', 'STUDENT', 'EXPO'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    setCode(`${randomPrefix}${randomNum}`);
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      onShowToast('Missing Code', 'Please enter or generate a voucher code.', 'error');
      return;
    }

    const newVoucher: VoucherItem = {
      id: `vch-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minSpend: Number(minSpend),
      usageLimit: Number(usageLimit),
      usedCount: 0,
      expiresAt: '2026-12-31',
      status: 'Active',
    };

    setVouchers([newVoucher, ...vouchers]);
    setShowCreateModal(false);
    setCode('');
    onShowToast('Voucher Created', `Code "${newVoucher.code}" is now live for buyers.`, 'success');
  };

  const handleCopyCode = (vCode: string) => {
    navigator.clipboard?.writeText?.(vCode);
    setCopiedCode(vCode);
    onShowToast('Copied to Clipboard', `Voucher code ${vCode} copied.`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteVoucher = (id: string) => {
    setVouchers(vouchers.filter((v) => v.id !== id));
    onShowToast('Voucher Deactivated', 'The voucher was removed from circulation.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Ticket className="w-4 h-4" />
            <span>Buyer Incentives & Discounts</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            {mode === 'discount' ? 'Discount Codes & Promotions' : 'Voucher and Promotions'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Issue exclusive promotional discount codes to patrons, university students, and art collectors.
          </p>
        </div>

        <button
          onClick={() => {
            handleGenerateRandomCode();
            setShowCreateModal(true);
          }}
          className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Voucher</span>
        </button>
      </div>

      {/* Active Vouchers Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Active Seller Vouchers</h3>
          <span className="text-xs text-neutral-500">{vouchers.length} codes registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="p-4 font-semibold">VOUCHER CODE</th>
                <th className="p-4 font-semibold">DISCOUNT</th>
                <th className="p-4 font-semibold">MIN. SPEND</th>
                <th className="p-4 font-semibold">REDEMPTIONS</th>
                <th className="p-4 font-semibold">EXPIRY</th>
                <th className="p-4 font-semibold">STATUS</th>
                <th className="p-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-slate-900 tracking-wider bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
                        {v.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(v.code)}
                        className="p-1 text-neutral-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        {copiedCode === v.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="p-4 font-bold text-red-600">
                    {v.discountType === 'percentage' ? `${v.discountValue}% OFF` : `₱${v.discountValue} OFF`}
                  </td>

                  <td className="p-4 text-neutral-600">
                    ₱{v.minSpend.toLocaleString()}
                  </td>

                  <td className="p-4 text-neutral-600">
                    <span className="font-bold text-slate-800">{v.usedCount}</span> / {v.usageLimit}
                  </td>

                  <td className="p-4 text-neutral-500 whitespace-nowrap">
                    {v.expiresAt}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteVoucher(v.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Deactivate Voucher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-extrabold text-lg text-slate-900">Create Discount Voucher</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Voucher Code *</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Randomize Code
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MALIA15"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-red-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₱)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {discountType === 'percentage' ? 'Percentage Discount (%)' : 'Amount (₱)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min. Order Spend (₱)</label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                >
                  Activate Voucher
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl font-semibold text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
