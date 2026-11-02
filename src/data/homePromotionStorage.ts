import { HomePromotion } from '../types';

const HOME_PROMOTIONS_KEY = 'red-nexus-home-promotions';

const isHomePromotion = (value: unknown): value is HomePromotion => (
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).id === 'string' &&
  typeof (value as Record<string, unknown>).sellerName === 'string' &&
  typeof (value as Record<string, unknown>).headline === 'string' &&
  typeof (value as Record<string, unknown>).description === 'string' &&
  ((value as Record<string, unknown>).artworkId === undefined ||
    typeof (value as Record<string, unknown>).artworkId === 'string') &&
  ((value as Record<string, unknown>).date === undefined ||
    typeof (value as Record<string, unknown>).date === 'string') &&
  ((value as Record<string, unknown>).image === undefined ||
    typeof (value as Record<string, unknown>).image === 'string') &&
  ((value as Record<string, unknown>).placement === 'add' ||
    (value as Record<string, unknown>).placement === 'replace') &&
  typeof (value as Record<string, unknown>).createdAt === 'string'
);

export const loadHomePromotions = (): HomePromotion[] => {
  const savedPromotions = window.localStorage.getItem(HOME_PROMOTIONS_KEY);
  if (!savedPromotions) return [];

  const parsedPromotions: unknown = JSON.parse(savedPromotions);
  if (!Array.isArray(parsedPromotions) || !parsedPromotions.every(isHomePromotion)) {
    throw new Error('Saved homepage promotions are unreadable. Clear this site’s local storage and try again.');
  }
  return parsedPromotions;
};

export const saveHomePromotions = (promotions: HomePromotion[]) => {
  window.localStorage.setItem(HOME_PROMOTIONS_KEY, JSON.stringify(promotions));
};
