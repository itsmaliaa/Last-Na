import { Artwork, PaymentMethod } from '../types';
import { initialArtworks } from './mockData';

const ARTWORK_DATA_KEY = 'red-nexus-artworks';
const PAYMENT_METHODS_MIGRATION_KEY = 'red-nexus-online-payment-methods-v1';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isArtwork = (value: unknown): value is Artwork => (
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.title === 'string' &&
  typeof value.artist === 'string' &&
  typeof value.image === 'string' &&
  typeof value.price === 'number' &&
  typeof value.size === 'string' &&
  (value.status === 'pending' || value.status === 'approved' || value.status === 'rejected') &&
  ['painting', 'sculpture', 'architecture', 'digital', 'photography', 'print', 'mixed_media'].includes(String(value.category))
);

const normalizeArtworkPayments = (artwork: Artwork, migrateLegacy: boolean): Artwork => {
  const methods = Array.isArray(artwork.availablePayments)
    ? artwork.availablePayments.filter((method): method is PaymentMethod => method === 'Maya' || method === 'GCash')
    : [];
  const migratedMethods = migrateLegacy && methods.includes('GCash') && !methods.includes('Maya')
    ? ['Maya', 'GCash'] as PaymentMethod[]
    : methods;
  return {
    ...artwork,
    stock: artwork.status === 'approved' && artwork.stock === undefined ? 1 : artwork.stock,
    availablePayments: migratedMethods.length > 0 ? migratedMethods : ['Maya', 'GCash'],
  };
};

export const loadArtworkData = (): Artwork[] => {
  const migrateLegacyPayments = window.localStorage.getItem(PAYMENT_METHODS_MIGRATION_KEY) !== '1';
  const savedArtworks = window.localStorage.getItem(ARTWORK_DATA_KEY);
  if (!savedArtworks) {
    const artworks = initialArtworks.map((artwork) => normalizeArtworkPayments(artwork, migrateLegacyPayments));
    window.localStorage.setItem(PAYMENT_METHODS_MIGRATION_KEY, '1');
    return artworks;
  }

  const parsedArtworks: unknown = JSON.parse(savedArtworks);
  if (!Array.isArray(parsedArtworks) || !parsedArtworks.every(isArtwork)) {
    throw new Error('Saved artwork data is unreadable. Clear this site’s local storage and try again.');
  }

  const artworksById = new Map(initialArtworks.map((artwork) => [artwork.id, artwork]));
  parsedArtworks.forEach((artwork) => {
    artworksById.set(artwork.id, {
      ...artworksById.get(artwork.id),
      ...artwork,
    });
  });
  const artworks = Array.from(artworksById.values())
    .map((artwork) => normalizeArtworkPayments(artwork, migrateLegacyPayments));
  window.localStorage.setItem(PAYMENT_METHODS_MIGRATION_KEY, '1');
  return artworks;
};

export const saveArtworkData = (artworks: Artwork[]) => {
  window.localStorage.setItem(ARTWORK_DATA_KEY, JSON.stringify(artworks));
};
