import { Conversation } from '../types';
import { initialConversations } from './mockData';

const CONVERSATION_DATA_KEY = 'red-nexus-conversations';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isConversation = (value: unknown): value is Conversation => (
  isRecord(value) &&
  typeof value.id === 'string' &&
  (value.orderId === undefined || typeof value.orderId === 'string') &&
  (value.buyerName === undefined || typeof value.buyerName === 'string') &&
  (value.buyerEmail === undefined || typeof value.buyerEmail === 'string') &&
  (value.sellerName === undefined || typeof value.sellerName === 'string') &&
  (value.isSupport === undefined || typeof value.isSupport === 'boolean') &&
  typeof value.name === 'string' &&
  typeof value.email === 'string' &&
  typeof value.lastMessage === 'string' &&
  typeof value.time === 'string' &&
  typeof value.unread === 'boolean' &&
  (value.buyerUnread === undefined || typeof value.buyerUnread === 'boolean') &&
  (value.sellerUnread === undefined || typeof value.sellerUnread === 'boolean') &&
  (value.adminUnread === undefined || typeof value.adminUnread === 'boolean') &&
  typeof value.avatarBg === 'string' &&
  typeof value.avatarInitials === 'string' &&
  typeof value.subject === 'string' &&
  Array.isArray(value.messages) &&
  value.messages.every((message) => (
    isRecord(message) &&
    typeof message.id === 'string' &&
    (message.sender === 'buyer' || message.sender === 'seller' || message.sender === 'support') &&
    typeof message.text === 'string' &&
    typeof message.time === 'string' &&
    (message.refundRequestId === undefined || typeof message.refundRequestId === 'string')
  ))
);

export const loadConversationData = (): Conversation[] => {
  const savedConversations = window.localStorage.getItem(CONVERSATION_DATA_KEY);
  if (!savedConversations) return initialConversations;

  const parsedConversations: unknown = JSON.parse(savedConversations);
  if (!Array.isArray(parsedConversations) || !parsedConversations.every(isConversation)) {
    throw new Error('Saved conversation data is unreadable. Clear this site’s local storage and try again.');
  }
  return parsedConversations;
};

export const saveConversationData = (conversations: Conversation[]) => {
  window.localStorage.setItem(CONVERSATION_DATA_KEY, JSON.stringify(conversations));
};
