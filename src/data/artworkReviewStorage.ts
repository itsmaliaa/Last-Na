import { ArtworkReview } from '../types';

const ARTWORK_REVIEWS_KEY = 'red-nexus-artwork-reviews';

const isArtworkReview = (value: unknown): value is ArtworkReview => (
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).orderId === 'string' &&
  (typeof (value as Record<string, unknown>).artworkId === 'string' ||
    (value as Record<string, unknown>).artworkId === undefined) &&
  typeof (value as Record<string, unknown>).artworkTitle === 'string' &&
  typeof (value as Record<string, unknown>).artist === 'string' &&
  typeof (value as Record<string, unknown>).buyerEmail === 'string' &&
  typeof (value as Record<string, unknown>).buyerName === 'string' &&
  typeof (value as Record<string, unknown>).rating === 'number' &&
  typeof (value as Record<string, unknown>).text === 'string' &&
  typeof (value as Record<string, unknown>).createdAt === 'string'
);

export const loadArtworkReviews = (): ArtworkReview[] => {
  const savedReviews = window.localStorage.getItem(ARTWORK_REVIEWS_KEY);
  if (!savedReviews) return [];

  const parsedReviews: unknown = JSON.parse(savedReviews);
  if (!Array.isArray(parsedReviews) || !parsedReviews.every(isArtworkReview)) {
    throw new Error('Saved artwork reviews are unreadable. Clear this site’s local storage and try again.');
  }
  return parsedReviews;
};

export const saveArtworkReview = (review: ArtworkReview) => {
  const reviews = loadArtworkReviews();
  const existingIndex = reviews.findIndex((item) => item.orderId === review.orderId);
  if (existingIndex === -1) reviews.push(review);
  else reviews[existingIndex] = review;
  window.localStorage.setItem(ARTWORK_REVIEWS_KEY, JSON.stringify(reviews));
};

export const saveArtworkReviewReply = (orderId: string, reply: string) => {
  const reviews = loadArtworkReviews();
  const reviewIndex = reviews.findIndex((review) => review.orderId === orderId);
  if (reviewIndex === -1) {
    throw new Error('The customer review could not be found.');
  }

  reviews[reviewIndex] = {
    ...reviews[reviewIndex],
    sellerReply: reply,
    sellerReplyAt: new Date().toISOString(),
  };
  window.localStorage.setItem(ARTWORK_REVIEWS_KEY, JSON.stringify(reviews));
  return reviews[reviewIndex];
};
