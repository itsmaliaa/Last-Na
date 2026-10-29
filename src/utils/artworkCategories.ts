import { Artwork } from '../types';

export const ARTWORK_CATEGORIES: { value: Artwork['category']; label: string }[] = [
  { value: 'painting', label: 'Painting' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'digital', label: 'Digital Art' },
  { value: 'photography', label: 'Photography' },
  { value: 'print', label: 'Print' },
  { value: 'mixed_media', label: 'Mixed Media' },
];

export const getArtworkCategoryLabel = (category: Artwork['category']): string => (
  ARTWORK_CATEGORIES.find((item) => item.value === category)?.label ?? category
);
