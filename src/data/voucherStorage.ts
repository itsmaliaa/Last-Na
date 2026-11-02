import { VoucherItem } from '../types';
import { initialVouchers } from './mockData';

const VOUCHERS_KEY = 'red-nexus-vouchers';

const isVoucher = (value: unknown): value is VoucherItem => (
  typeof value === 'object' &&
  value !== null &&
  'id' in value && typeof value.id === 'string' &&
  'code' in value && typeof value.code === 'string' &&
  'discountType' in value && (value.discountType === 'percentage' || value.discountType === 'fixed') &&
  'discountValue' in value && typeof value.discountValue === 'number' &&
    Number.isFinite(value.discountValue) && value.discountValue > 0 &&
    (value.discountType !== 'percentage' || value.discountValue <= 100) &&
  'minSpend' in value && typeof value.minSpend === 'number' &&
    Number.isFinite(value.minSpend) && value.minSpend >= 0 &&
  'usageLimit' in value && typeof value.usageLimit === 'number' &&
    Number.isSafeInteger(value.usageLimit) && value.usageLimit > 0 &&
  'usedCount' in value && typeof value.usedCount === 'number' &&
    Number.isSafeInteger(value.usedCount) && value.usedCount >= 0 &&
  'expiresAt' in value && typeof value.expiresAt === 'string' &&
  'status' in value && (value.status === 'Active' || value.status === 'Expired' || value.status === 'Draft') &&
  (!('sellerName' in value) || typeof value.sellerName === 'string')
);

export const loadVoucherData = (): VoucherItem[] => {
  const savedVouchers = window.localStorage.getItem(VOUCHERS_KEY);
  if (!savedVouchers) return initialVouchers;

  const parsedVouchers: unknown = JSON.parse(savedVouchers);
  if (!Array.isArray(parsedVouchers) || !parsedVouchers.every(isVoucher)) {
    throw new Error('Saved voucher data is unreadable. Clear this site’s local storage and try again.');
  }
  return parsedVouchers;
};

export const saveVoucherData = (vouchers: VoucherItem[]) => {
  window.localStorage.setItem(VOUCHERS_KEY, JSON.stringify(vouchers));
};
