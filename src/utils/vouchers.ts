import { CartItem, VoucherItem } from '../types';

export interface VoucherEvaluation {
  voucher: VoucherItem;
  qualifyingSubtotal: number;
  discountAmount: number;
}

export const evaluateVoucher = (
  code: string,
  items: CartItem[],
  vouchers: VoucherItem[],
  now = Date.now()
): VoucherEvaluation | string => {
  const normalizedCode = code.trim().toUpperCase();
  const voucher = vouchers.find((candidate) => candidate.code.trim().toUpperCase() === normalizedCode);
  if (!voucher) return 'That voucher code was not found.';
  if (voucher.status !== 'Active') return 'That voucher is not active.';
  if (
    !Number.isFinite(voucher.discountValue) ||
    voucher.discountValue <= 0 ||
    (voucher.discountType === 'percentage' && voucher.discountValue > 100) ||
    !Number.isFinite(voucher.minSpend) ||
    voucher.minSpend < 0 ||
    !Number.isSafeInteger(voucher.usageLimit) ||
    !Number.isSafeInteger(voucher.usedCount) ||
    voucher.usageLimit <= 0 ||
    voucher.usedCount < 0
  ) return 'That voucher has invalid settings.';
  if (voucher.usedCount >= voucher.usageLimit) return 'That voucher has reached its redemption limit.';

  const expiry = new Date(`${voucher.expiresAt}T23:59:59`);
  if (Number.isNaN(expiry.getTime()) || expiry.getTime() < now) return 'That voucher has expired.';

  const qualifyingItems = voucher.sellerName
    ? items.filter((item) => item.artwork.artist.toLowerCase() === voucher.sellerName?.toLowerCase())
    : items;
  const qualifyingSubtotal = qualifyingItems.reduce(
    (subtotal, item) => subtotal + item.artwork.price * item.quantity,
    0
  );
  if (qualifyingItems.length === 0) return 'This voucher only applies to that seller’s artwork.';
  if (qualifyingSubtotal < voucher.minSpend) {
    return `Add ₱${(voucher.minSpend - qualifyingSubtotal).toLocaleString()} more in eligible items to use this voucher.`;
  }

  const rawDiscount = voucher.discountType === 'percentage'
    ? qualifyingSubtotal * voucher.discountValue / 100
    : voucher.discountValue;
  const discountAmount = Math.round(Math.min(qualifyingSubtotal, rawDiscount) * 100) / 100;
  return { voucher, qualifyingSubtotal, discountAmount };
};

export const allocateVoucherDiscounts = (
  items: CartItem[],
  voucher: VoucherItem,
  discountAmount: number
): number[] => {
  const discounts = items.map(() => 0);
  const eligibleIndexes = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => (
      !voucher.sellerName ||
      item.artwork.artist.toLowerCase() === voucher.sellerName.toLowerCase()
    ));
  const subtotal = eligibleIndexes.reduce(
    (sum, { item }) => sum + item.artwork.price * item.quantity,
    0
  );
  if (subtotal <= 0 || discountAmount <= 0 || eligibleIndexes.length === 0) return discounts;
  let remainingDiscountCents = Math.round(discountAmount * 100);

  eligibleIndexes.forEach(({ item, index }, position) => {
    const lineSubtotalCents = Math.round(item.artwork.price * item.quantity * 100);
    const lineDiscountCents = position === eligibleIndexes.length - 1
      ? remainingDiscountCents
      : Math.min(
        lineSubtotalCents,
        Math.round(discountAmount * 100 * (lineSubtotalCents / Math.round(subtotal * 100)))
      );
    discounts[index] = lineDiscountCents / 100;
    remainingDiscountCents -= lineDiscountCents;
  });

  return discounts;
};
