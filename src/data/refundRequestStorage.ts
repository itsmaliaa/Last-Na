import { RefundRequest, RefundRequestStatus } from '../types';

const REFUND_REQUESTS_KEY = 'red-nexus-refund-requests';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isRefundRequest = (value: unknown): value is RefundRequest => (
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.orderId === 'string' &&
  typeof value.orderNumber === 'string' &&
  typeof value.artworkTitle === 'string' &&
  typeof value.artist === 'string' &&
  typeof value.buyerName === 'string' &&
  typeof value.buyerEmail === 'string' &&
  (value.issueType === 'received_with_issues' || value.issueType === 'not_received') &&
  typeof value.reason === 'string' &&
  typeof value.details === 'string' &&
  typeof value.evidenceImage === 'string' &&
  (value.status === 'pending' || value.status === 'approved' || value.status === 'declined') &&
  typeof value.createdAt === 'string' &&
  typeof value.updatedAt === 'string'
);

export const loadRefundRequests = (): RefundRequest[] => {
  const savedRequests = window.localStorage.getItem(REFUND_REQUESTS_KEY);
  if (!savedRequests) return [];

  const parsedRequests: unknown = JSON.parse(savedRequests);
  if (!Array.isArray(parsedRequests) || !parsedRequests.every(isRefundRequest)) {
    throw new Error('Saved refund requests are unreadable. Clear this site’s local storage and try again.');
  }
  return parsedRequests;
};

export const saveRefundRequest = (request: RefundRequest) => {
  const requests = loadRefundRequests();
  const existingIndex = requests.findIndex((item) => item.orderId === request.orderId);
  if (existingIndex === -1) requests.push(request);
  else requests[existingIndex] = request;
  window.localStorage.setItem(REFUND_REQUESTS_KEY, JSON.stringify(requests));
};

export const updateRefundRequestStatus = (requestId: string, status: RefundRequestStatus) => {
  const requests = loadRefundRequests();
  const request = requests.find((item) => item.id === requestId);
  if (!request) throw new Error('The refund request could not be found.');

  const updatedRequest = { ...request, status, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(
    REFUND_REQUESTS_KEY,
    JSON.stringify(requests.map((item) => item.id === requestId ? updatedRequest : item))
  );
  return updatedRequest;
};
