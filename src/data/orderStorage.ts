import { initialOrders, initialSellerTransactions, sampleSellerTransactions } from './mockData';
import { OrderItem, SellerOrderTransaction } from '../types';

export interface OrderData {
  orders: OrderItem[];
  sellerTransactions: SellerOrderTransaction[];
}

const ORDER_DATA_KEY = 'red-nexus-orders';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isOrderItem = (value: unknown): value is OrderItem => (
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.orderNumber === 'string' &&
  typeof value.title === 'string' &&
  typeof value.artist === 'string' &&
  typeof value.medium === 'string' &&
  typeof value.status === 'string' &&
  typeof value.dateInfo === 'string' &&
  typeof value.price === 'number' &&
  typeof value.image === 'string'
);

const isSellerOrderTransaction = (value: unknown): value is SellerOrderTransaction => (
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.artwork === 'string' &&
  typeof value.artist === 'string' &&
  typeof value.buyer === 'string' &&
  typeof value.date === 'string' &&
  typeof value.grossAmount === 'number' &&
  typeof value.platformTakeRate === 'number' &&
  typeof value.platformTakeAmount === 'number' &&
  typeof value.netStudentPayout === 'number' &&
  typeof value.status === 'string'
);

const isOrderData = (value: unknown): value is OrderData => (
  isRecord(value) &&
  Array.isArray(value.orders) &&
  value.orders.every(isOrderItem) &&
  Array.isArray(value.sellerTransactions) &&
  value.sellerTransactions.every(isSellerOrderTransaction)
);

const normalizePaymentMethod = (paymentMethod: string | undefined) => (
  paymentMethod === 'Cash on delivery' || paymentMethod === 'Bank account'
    ? 'GCash'
    : paymentMethod
);

export const loadOrderData = (): OrderData => {
  const savedOrderData = window.localStorage.getItem(ORDER_DATA_KEY);
  if (!savedOrderData) {
    return {
      orders: initialOrders.map((order) => ({
        ...order,
        paymentMethod: normalizePaymentMethod(order.paymentMethod),
      })),
      sellerTransactions: initialSellerTransactions.map((transaction) => ({
        ...transaction,
        paymentMethod: normalizePaymentMethod(transaction.paymentMethod),
      })),
    };
  }

  const parsedData: unknown = JSON.parse(savedOrderData);
  if (!isOrderData(parsedData)) {
    throw new Error('Saved order data is unreadable. Clear this site’s local storage and try again.');
  }

  const defaultOrdersById = new Map(initialOrders.map((order) => [order.id, order]));
  const orders = parsedData.orders.map((order) => {
    const defaultOrder = defaultOrdersById.get(order.id);
    if (!defaultOrder) return order;
    return {
      ...defaultOrder,
      ...order,
      paymentMethod: normalizePaymentMethod(order.paymentMethod ?? defaultOrder?.paymentMethod),
      deliveryMethod: order.deliveryMethod ?? defaultOrder.deliveryMethod,
      shippingProvider: order.shippingProvider ?? defaultOrder.shippingProvider,
      trackingNumber: order.trackingNumber ?? defaultOrder.trackingNumber,
      trackingUrl: order.trackingUrl ?? defaultOrder.trackingUrl,
    };
  });

  return {
    orders,
    sellerTransactions: [
      ...parsedData.sellerTransactions.map((transaction) => ({
        ...transaction,
        paymentMethod: normalizePaymentMethod(transaction.paymentMethod),
        ...(String(transaction.fulfillmentStatus) === 'On the way'
          ? { fulfillmentStatus: 'Shipped' as const }
          : {}),
      })),
      ...sampleSellerTransactions.filter(
        (sample) => !parsedData.sellerTransactions.some((transaction) => transaction.id === sample.id)
      ),
    ],
  };
};

export const saveOrderData = (orderData: OrderData) => {
  window.localStorage.setItem(ORDER_DATA_KEY, JSON.stringify(orderData));
};
