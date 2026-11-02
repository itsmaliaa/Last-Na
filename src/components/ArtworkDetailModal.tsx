import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Star, ShieldCheck, Plus, Minus, Truck, Package, ShoppingBag, Check } from 'lucide-react';
import { BlackCartIcon } from './BlackCartIcon';
import { Artwork, ArtworkReview, CartItem } from '../types';
import { loadArtworkReviews } from '../data/artworkReviewStorage';

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  artworks: Artwork[];
  onClose: () => void;
  onAddToCart: (artwork: Artwork, selection: Omit<CartItem, 'artwork'>) => void;
  onProceedToCheckout: (artwork: Artwork, selection: Omit<CartItem, 'artwork'>) => void;
  onToggleFavorite: (id: string) => void;
  onSelectArtwork: (artwork: Artwork) => void;
}

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  artwork,
  artworks,
  onClose,
  onAddToCart,
  onProceedToCheckout,
  onToggleFavorite,
  onSelectArtwork,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [designChoice, setDesignChoice] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [buyerNote, setBuyerNote] = useState('');
  const [reviews, setReviews] = useState<ArtworkReview[]>([]);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setSelectedSize(artwork?.sizeOptions?.[0] ?? artwork?.size ?? '');
    setDesignChoice(artwork?.designOptions?.[0] ?? '');
    setSelectedColor(artwork?.colorOptions?.[0] ?? '');
    setSelectedOptions(Object.fromEntries(
      (artwork?.optionGroups ?? []).map((group) => [group.name, group.options[0] ?? ''])
    ));
    setBuyerNote('');
    setReviewsOpen(false);
    try {
      const savedReviews = loadArtworkReviews();
      setReviews(savedReviews.filter((review) => (
        (review.artworkId && review.artworkId === artwork?.id) ||
        (!review.artworkId && review.artworkTitle === artwork?.title && review.artist === artwork.artist)
      )));
    } catch (error) {
      console.error('Unable to load artwork reviews.', error);
      setReviews([]);
    }
  }, [artwork?.id]);

  if (!artwork) return null;
  const isOutOfStock = typeof artwork.stock === 'number' && artwork.stock <= 0;
  const maximumQuantity = typeof artwork.stock === 'number' ? artwork.stock : Number.MAX_SAFE_INTEGER;
  const isDigital = artwork.productType === 'digital' || artwork.fulfillmentType === 'digital';
  const selection = { quantity, selectedSize, designChoice, selectedColor, selectedOptions, buyerNote };
  const recommendations = artworks.filter((item) => item.id !== artwork.id && item.status === 'approved').slice(0, 4);
  const baselineRating = Number(artwork.rating || 4.9);
  const displayedRating = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : baselineRating;
  const sortedReviews = [...reviews].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );
  const reviewCountsByRating = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
  }));

  if (reviewsOpen) {
    return (
      <main className="min-h-screen bg-[#faf8f4] text-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setReviewsOpen(false)}
            className="inline-flex items-center gap-2 rounded-full border border-[#eadcc8] bg-white px-4 py-2 text-sm font-semibold hover:border-red-300 hover:text-red-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to artwork
          </button>

          <header className="mt-8 border-b border-[#eadcc8] pb-6">
            <p className="text-sm font-semibold text-red-700">{artwork.title}</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Customer Reviews</h1>
            <p className="mt-2 text-sm text-neutral-500">Reviews from customers who purchased this artwork.</p>
          </header>

          <section className="mt-6 grid gap-6 rounded-2xl border border-[#eadcc8] bg-white p-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:p-7">
            <div className="flex flex-col items-center justify-center border-b border-[#eadcc8] pb-5 text-center sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
              <p className="text-5xl font-black">{displayedRating}</p>
              <div className="mt-2 flex" aria-label={`${displayedRating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-5 w-5 ${star <= Math.round(Number(displayedRating)) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                ))}
              </div>
              <p className="mt-2 text-sm text-neutral-500">{reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'}</p>
            </div>

            <div className="flex flex-col justify-center gap-2">
              {reviewCountsByRating.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-3 text-xs text-neutral-500">
                  <span className="w-10 shrink-0">{rating} star</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-extrabold">All reviews ({reviews.length})</h2>
            {sortedReviews.length ? (
              <ul className="mt-4 divide-y divide-[#eadcc8] rounded-2xl border border-[#eadcc8] bg-white px-5 sm:px-7">
                {sortedReviews.map((review) => (
                  <li key={review.orderId} className="py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{review.buyerName}</p>
                        <div className="mt-1 flex" aria-label={`${review.rating} out of 5 stars`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                          ))}
                        </div>
                      </div>
                      <time className="text-sm text-neutral-400" dateTime={review.createdAt}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">{review.text}</p>
                    {review.sellerReply && (
                      <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                        <p className="text-xs font-bold text-red-800">Seller reply</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-neutral-700">{review.sellerReply}</p>
                        {review.sellerReplyAt && (
                          <time className="mt-2 block text-xs text-neutral-400" dateTime={review.sellerReplyAt}>
                            {new Date(review.sellerReplyAt).toLocaleDateString()}
                          </time>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-[#d9c9b4] bg-white px-5 py-12 text-center">
                <Star className="mx-auto h-8 w-8 text-amber-400" />
                <p className="mt-3 font-semibold text-slate-800">No reviews yet</p>
                <p className="mt-1 text-sm text-neutral-500">Be the first customer to review this artwork.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <button type="button" onClick={onClose} className="hover:text-red-700">Home</button>
          <span>›</span><button type="button" onClick={onClose} className="hover:text-red-700">Gallery</button>
          <span>›</span><span className="capitalize">{artwork.category.replace('_', ' ')}</span>
          <span>›</span><span className="font-semibold text-red-700">{artwork.title}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="min-w-0">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-[#eadcc8] bg-[#faf8f4]">
              <img src={artwork.image} alt={artwork.title} className="h-full w-full object-contain" />
              {artwork.badge && (
                <span className="absolute left-4 top-4 rounded-md bg-[#E52535] px-3 py-1 text-xs font-bold text-white">{artwork.badge}</span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3" aria-label="Artwork gallery">
              {[artwork.image, artwork.image, artwork.image, artwork.image].map((image, index) => (
                <div key={`${artwork.id}-image-${index}`} className={`aspect-square overflow-hidden rounded-lg border ${index === 0 ? 'border-red-500' : 'border-[#eadcc8]'}`}>
                  <img src={image} alt={`${artwork.title} view ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            {artwork.video && <video src={artwork.video} controls preload="metadata" className="mt-4 max-h-80 w-full rounded-xl bg-black" aria-label={`${artwork.title} video`} />}
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-md bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{isOutOfStock ? 'Sold Out' : 'For Sale'}</span>
              <button
                type="button"
                onClick={() => setReviewsOpen(true)}
                aria-label={`View reviews for ${artwork.title}`}
                className="flex items-center gap-1 text-sm font-semibold text-neutral-700 hover:text-red-700"
              >
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {displayedRating} <span className="font-normal text-neutral-500">({reviews.length} reviews)</span>
              </button>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{artwork.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-[#eadcc8] pb-5 text-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadcc8] bg-neutral-50 font-bold text-red-700">{artwork.artist.slice(0, 1)}</span>
              <div>
                <p className="font-bold">{artwork.artist}</p>
                <p className="text-xs text-neutral-500">{artwork.artistDept || artwork.course || 'Fine Arts Department'}</p>
              </div>
              <span className="h-5 border-l border-[#eadcc8]" />
              <button type="button" onClick={onClose} className="text-xs font-semibold text-red-700 hover:underline">View Profile</button>
            </div>

            <div className="border-b border-[#eadcc8] py-5">
              <p className="text-xs text-neutral-500">Acquisition Price</p>
              <p className="mt-1 text-3xl font-black text-[#E52535]">₱{artwork.price.toLocaleString()}</p>
            </div>

            <section className="mt-5 rounded-xl bg-[#fff3dc] p-4">
              <h2 className="font-serif text-sm font-bold">Specifications</h2>
              <dl className="mt-2 space-y-1.5 text-xs">
                {[
                  ['Art Type', artwork.genre || artwork.category.replace('_', ' ')],
                  ['Medium', artwork.mediumsUsed || 'Not specified'],
                  ['Dimensions', artwork.size || 'Not specified'],
                  ['Department', artwork.artistDept || artwork.course || 'Fine Arts'],
                  ['Style', artwork.style || artwork.editionType || 'Original artwork'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="capitalize text-neutral-600">{label}</dt><dd className="text-right font-semibold capitalize">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-5">
              <h2 className="font-serif text-sm font-bold">About the Artwork</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {artwork.description || artwork.features || 'An original artwork created by an emerging artist in the CAFA creative community.'}
              </p>
            </section>

            <div className="mt-5 space-y-3">
              {artwork.optionGroups?.map((group) => {
                const selectedValue = selectedOptions[group.name] ?? group.options[0] ?? '';
                const isColorGroup = group.name.toLowerCase() === 'color';
                return (
                  <fieldset key={group.id} className="min-w-0">
                    <legend className="mb-2 text-xs font-bold text-slate-700">
                      <span className="capitalize">{group.name}</span>
                      {isColorGroup ? ` (${group.options.length})` : ''}
                    </legend>
                    <div className={isColorGroup
                      ? 'grid grid-cols-2 gap-2 sm:grid-cols-3'
                      : 'flex flex-wrap gap-2'}
                    >
                      {group.options.map((option) => {
                        const isSelected = selectedValue === option;
                        if (isColorGroup) {
                          return (
                            <button
                              key={option}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => {
                                setSelectedOptions((previous) => ({ ...previous, [group.name]: option }));
                                setSelectedColor(option);
                              }}
                              className={`overflow-hidden rounded-xl border-2 bg-white text-left transition-colors ${
                                isSelected ? 'border-[#E52535]' : 'border-neutral-200 hover:border-neutral-400'
                              }`}
                            >
                              <img
                                src={group.optionImages?.[option] || artwork.image}
                                alt={`${option} color option`}
                                className="aspect-square w-full object-cover"
                              />
                              <span className={`block truncate px-2 py-2 text-center text-xs font-semibold ${
                                isSelected ? 'text-red-700' : 'text-slate-700'
                              }`}>
                                {isSelected && <Check className="mr-1 inline h-3.5 w-3.5" />}
                                {option}
                              </span>
                            </button>
                          );
                        }
                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                              setSelectedOptions((previous) => ({ ...previous, [group.name]: option }));
                              if (group.name.toLowerCase() === 'size') setSelectedSize(option);
                              if (group.name.toLowerCase() === 'design') setDesignChoice(option);
                            }}
                            className={`min-h-10 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                              isSelected
                                ? 'border-[#E52535] bg-red-50 text-red-700'
                                : 'border-neutral-200 bg-white text-slate-700 hover:border-neutral-400'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
              {(!artwork.optionGroups || artwork.optionGroups.length === 0) && (
                <>
                  {artwork.sizeOptions && artwork.sizeOptions.length > 0 && (
                    <label className="block text-xs font-bold text-slate-700">Size
                      <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-normal">
                        {artwork.sizeOptions.map((size) => <option key={size}>{size}</option>)}
                      </select>
                    </label>
                  )}
                  {artwork.colorOptions?.length ? (
                    <label className="block text-xs font-bold text-slate-700">Color
                      <select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-normal">
                        {artwork.colorOptions.map((color) => <option key={color}>{color}</option>)}
                      </select>
                    </label>
                  ) : null}
                </>
              )}
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-neutral-500">Quantity</span>
                <div className="flex items-center rounded-lg border border-[#eadcc8]">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-3 py-2 hover:text-red-700"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="min-w-8 text-center font-semibold">{quantity}</span>
                  <button type="button" aria-label="Increase quantity" disabled={quantity >= maximumQuantity} onClick={() => setQuantity((value) => Math.min(maximumQuantity, value + 1))} className="px-3 py-2 hover:text-red-700 disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              {(artwork.productType === 'custom_made' || artwork.productType === 'digital') && (
                <label className="block text-xs font-bold text-slate-700">Note to seller
                  <textarea rows={2} value={buyerNote} onChange={(event) => setBuyerNote(event.target.value)} placeholder="Add customization details or a reference note" className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal" />
                </label>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" disabled={isOutOfStock} onClick={() => onAddToCart(artwork, selection)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#E52535] px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:bg-neutral-300">
                <BlackCartIcon className="h-4 w-4" /> Add to Cart
              </button>
              <button type="button" disabled={isOutOfStock} onClick={() => onProceedToCheckout(artwork, selection)} className="min-h-11 flex-1 rounded-full border border-neutral-900 px-5 py-3 text-sm font-bold hover:bg-neutral-50 disabled:border-neutral-300 disabled:text-neutral-400">
                Buy Now
              </button>
              <button type="button" aria-label="Add to favorites" onClick={() => onToggleFavorite(artwork.id)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadcc8] text-neutral-700 hover:text-red-700">
                <Heart className={`h-5 w-5 ${artwork.isFavorited ? 'fill-red-600 text-red-600' : ''}`} />
              </button>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-lg border border-[#eadcc8] p-3">
              {isDigital ? <Package className="h-5 w-5 shrink-0 text-red-700" /> : <Truck className="h-5 w-5 shrink-0 text-red-700" />}
              <div>
                <p className="text-xs font-bold">{isDigital ? 'Digital Artwork Delivery' : 'Professional Art Courier Shipping'}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{isDigital ? 'The seller will deliver your artwork through messages.' : 'Pickup or door-to-door delivery is coordinated at checkout.'}</p>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-emerald-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Student artist support:</strong> Your purchase directly supports {artwork.artist}.</span>
            </p>
          </div>
        </section>
      </div>

      {recommendations.length > 0 && (
        <section className="bg-[#fffaf3] py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl font-bold">You May Also Like</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {recommendations.map((item) => (
                <button key={item.id} type="button" onClick={() => onSelectArtwork(item)} className="group overflow-hidden rounded-xl border border-[#eadcc8] bg-white text-left transition hover:-translate-y-0.5 hover:shadow-md">
                  <img src={item.image} alt={item.title} className="aspect-[4/3] w-full object-cover" />
                  <span className="block p-3">
                    <span className="flex items-start justify-between gap-2 font-serif text-sm font-bold">
                      {item.title}<span className="flex shrink-0 items-center gap-1 font-sans text-xs"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{item.rating || '4.9'}</span>
                    </span>
                    <span className="mt-1 block text-xs text-neutral-500">{item.artist}</span>
                    <span className="mt-2 flex items-center justify-between font-bold text-red-600">
                      ₱{item.price.toLocaleString()}<ShoppingBag className="h-4 w-4" />
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};
