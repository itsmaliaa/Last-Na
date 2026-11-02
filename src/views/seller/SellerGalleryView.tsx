import React, { useEffect, useState } from 'react';
import {
  Edit3,
  Eye,
  Heart,
  Star,
} from 'lucide-react';
import { Artwork, ArtworkReview, ArtistDirectoryItem } from '../../types';
import { getArtworkCategoryLabel } from '../../utils/artworkCategories';
import { loadArtworkReviews } from '../../data/artworkReviewStorage';

type ProfilePreviewTab = 'sale' | 'portfolio' | 'about' | 'reviews';

const prepareProfileImage = async (file: File): Promise<string> => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Choose an image smaller than 8 MB.');
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The selected image could not be opened.'));
    });

    const scale = Math.min(1, 1200 / image.width, 1200 / image.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is not available in this browser.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const compressedImage = canvas.toDataURL('image/jpeg', 0.72);
    if (compressedImage.length > 500_000) {
      throw new Error('The image is too large to save. Choose a smaller image.');
    }
    return compressedImage;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

interface SellerGalleryViewProps {
  artworks: Artwork[];
  artist: ArtistDirectoryItem;
  sellerName: string;
  onUpdateArtist: (artist: ArtistDirectoryItem) => void;
  onUpdateArtwork: (artwork: Artwork) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
}

export const SellerGalleryView: React.FC<SellerGalleryViewProps> = ({
  artworks,
  artist,
  sellerName,
  onUpdateArtist,
  onUpdateArtwork,
  onSelectArtwork,
  onShowToast,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [profileDraft, setProfileDraft] = useState(artist);
  const [activeProfileTab, setActiveProfileTab] = useState<ProfilePreviewTab>('sale');
  const [reviews, setReviews] = useState<ArtworkReview[]>([]);

  useEffect(() => {
    setProfileDraft(artist);
  }, [artist]);

  useEffect(() => {
    try {
      setReviews(loadArtworkReviews().filter((review) => (
        review.artist.toLowerCase() === sellerName.toLowerCase()
      )));
    } catch (error) {
      console.error('Unable to load seller profile reviews.', error);
      onShowToast(
        'Customer reviews could not be loaded',
        error instanceof Error ? error.message : 'Saved customer reviews are unreadable.',
        'error'
      );
    }
  }, [sellerName]);

  const sellerArtworks = artworks.filter(
    (artwork) =>
      artwork.artist.toLowerCase() === sellerName.toLowerCase() &&
      artwork.status === 'approved' &&
      artwork.isActive !== false
  );

  const handleSaveProfile = () => {
    onUpdateArtist(profileDraft);
    setIsEditingProfile(false);
    setIsEditingAbout(false);
    onShowToast('Artist Profile Updated', 'Your artist page information has been saved.', 'success');
  };

  const handleStartEdit = (art: Artwork) => {
    setEditingId(art.id);
    setNewPrice(art.price);
  };

  const handleSavePrice = (art: Artwork) => {
    onUpdateArtwork({ ...art, price: newPrice });
    setEditingId(null);
    onShowToast('Price Updated', `Price for ${art.title} changed to ₱${newPrice.toLocaleString()}`, 'success');
  };

  const handleProfileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    imageType: 'avatar' | 'banner'
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const image = await prepareProfileImage(file);
      setProfileDraft((previous) => ({
        ...previous,
        ...(imageType === 'avatar' ? { avatar: image } : { banner: image }),
      }));
    } catch (error) {
      onShowToast(
        'Profile image could not be loaded',
        error instanceof Error ? error.message : 'The selected image could not be prepared.',
        'error'
      );
    }
  };

  return (
    <div className="space-y-6">
      {isEditingProfile ? (
        <section className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900">Artist Profile Information</h3>
            <button
              type="button"
              onClick={() => {
                setProfileDraft(artist);
                setIsEditingProfile(false);
              }}
              className="px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-xs font-semibold text-neutral-700">
              Artist name
              <input
                value={profileDraft.name}
                onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-normal text-slate-900"
              />
            </label>
            <label className="text-xs font-semibold text-neutral-700">
              Art type
              <select
                value={profileDraft.artType}
                onChange={(event) => setProfileDraft({ ...profileDraft, artType: event.target.value as ArtistDirectoryItem['artType'] })}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-normal text-slate-900"
              >
                <option>Painting</option>
                <option>Sculpture</option>
                <option>Architecture</option>
                <option>Photography</option>
                <option>Digital Art</option>
                <option>Mixed Media</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-neutral-700">
              Department
              <input
                value={profileDraft.dept}
                onChange={(event) => setProfileDraft({ ...profileDraft, dept: event.target.value })}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-normal text-slate-900"
              />
            </label>
            <label className="text-xs font-semibold text-neutral-700">
              Location
              <input
                value={profileDraft.location}
                onChange={(event) => setProfileDraft({ ...profileDraft, location: event.target.value })}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-normal text-slate-900"
              />
            </label>
            <label className="text-xs font-semibold text-neutral-700 md:col-span-2">
              Artist bio
              <textarea
                value={profileDraft.bio}
                onChange={(event) => setProfileDraft({ ...profileDraft, bio: event.target.value })}
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-normal text-slate-900 resize-y"
              />
            </label>
            <label className="text-xs font-semibold text-neutral-700">
              Profile image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => void handleProfileImageChange(event, 'avatar')}
                className="mt-1 block w-full rounded-lg border border-neutral-200 p-2 text-xs font-normal text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold"
              />
              <img src={profileDraft.avatar} alt="Profile image preview" className="mt-2 h-16 w-16 rounded-full object-cover" />
            </label>
            <label className="text-xs font-semibold text-neutral-700">
              Shop banner image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => void handleProfileImageChange(event, 'banner')}
                className="mt-1 block w-full rounded-lg border border-neutral-200 p-2 text-xs font-normal text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold"
              />
              {profileDraft.banner && (
                <img src={profileDraft.banner} alt="Shop banner preview" className="mt-2 h-20 w-full rounded-lg object-cover" />
              )}
            </label>
            <label className="text-xs font-semibold text-neutral-700">
              Member since
              <input
                value={profileDraft.memberSince ?? ''}
                onChange={(event) => setProfileDraft({ ...profileDraft, memberSince: event.target.value })}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-normal text-slate-900"
              />
            </label>
            <label className="text-xs font-semibold text-neutral-700 md:col-span-2">
              Specialties (separate with commas)
              <input
                value={profileDraft.specialties.join(', ')}
                onChange={(event) => setProfileDraft({
                  ...profileDraft,
                  specialties: event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                })}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-normal text-slate-900"
              />
            </label>
            <label className="text-xs font-semibold text-neutral-700 md:col-span-2">
              Achievements (one per line: title | description)
              <textarea
                value={(profileDraft.achievements ?? []).map(({ title, description }) => `${title} | ${description}`).join('\n')}
                onChange={(event) => setProfileDraft({
                  ...profileDraft,
                  achievements: event.target.value.split('\n').map((line) => {
                    const [title = '', ...description] = line.split('|');
                    return { title: title.trim(), description: description.join('|').trim() };
                  }).filter(({ title, description }) => title || description),
                })}
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-normal text-slate-900 resize-y"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleSaveProfile}
            className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full text-xs font-bold cursor-pointer"
          >
            Save Artist Profile
          </button>
        </section>
      ) : (
        <section className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
          <div className="h-36 sm:h-48 bg-neutral-100 relative">
            {profileDraft.banner && (
              <img src={profileDraft.banner} alt="" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="absolute top-3 right-3 px-3 py-2 bg-white/95 text-slate-800 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Artist Page
            </button>
          </div>
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
            <img
              src={profileDraft.avatar}
              alt={profileDraft.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm -mt-12 bg-neutral-100"
            />
            <div className="min-w-0">
              <h3 className="text-xl font-extrabold text-slate-900">{profileDraft.name}</h3>
              <p className="text-xs text-neutral-500 mt-1">{profileDraft.artType} · {profileDraft.dept} · {profileDraft.location}</p>
              <p className="text-sm text-neutral-700 mt-3 leading-relaxed">{profileDraft.bio}</p>
              <div className="flex flex-wrap gap-5 mt-3 text-xs text-neutral-600">
                <span><strong className="text-slate-900">{profileDraft.followers}</strong> Followers</span>
                <span><strong className="text-slate-900">{profileDraft.artworksCount}</strong> Artworks</span>
                <span><strong className="text-slate-900">{profileDraft.salesCount}</strong> Sales</span>
                <span><strong className="text-slate-900">{profileDraft.rating}</strong> Rating</span>
                <span>Member since <strong className="text-slate-900">{profileDraft.memberSince}</strong></span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {profileDraft.specialties.map((specialty) => (
                  <span key={specialty} className="px-3 py-1 bg-amber-50 text-amber-900 text-[11px] font-semibold rounded-full border border-amber-200/80">
                    {specialty}
                  </span>
                ))}
              </div>
              {(profileDraft.achievements ?? []).length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-900">Achievements</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileDraft.achievements?.map(({ title, description }) => (
                      <span key={`${title}-${description}`} title={description} className="px-3 py-1.5 bg-amber-50 text-amber-900 text-[11px] font-semibold rounded-lg border border-amber-200/80">
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <nav className="flex items-center gap-8 overflow-x-auto border-b border-neutral-200 text-sm font-semibold text-neutral-500" aria-label="Public profile preview sections">
        {([
          ['sale', 'Artworks for Sale'],
          ['portfolio', 'Gallery Portfolio'],
          ['about', 'About'],
          ['reviews', `Reviews (${reviews.length})`],
        ] as const).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            aria-pressed={activeProfileTab === tab}
            onClick={() => setActiveProfileTab(tab)}
            className={`shrink-0 border-b-2 py-3 transition-colors ${
              activeProfileTab === tab
                ? 'border-red-600 font-bold text-red-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeProfileTab === 'sale' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sellerArtworks.map((art) => {
            const isEditing = editingId === art.id;
            return (
              <div
                key={art.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xs transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                    />
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                      {getArtworkCategoryLabel(art.category)}
                    </span>
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-red-600 shadow-2xs backdrop-blur-xs">
                      <Heart className="h-3 w-3 fill-red-600" />
                      <span>{art.heartsCount ?? 350}</span>
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    <h3 className="truncate text-sm font-extrabold text-slate-900">{art.title}</h3>
                    <p className="truncate text-xs text-neutral-500">{art.mediumsUsed || 'Oil on Canvas'} · {art.size}</p>
                    <div className="pt-1">
                      {isEditing ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">₱</span>
                          <input
                            type="number"
                            value={newPrice}
                            onChange={(event) => setNewPrice(Number(event.target.value))}
                            className="w-24 rounded border border-neutral-300 px-2 py-1 text-xs font-bold focus:border-red-500 focus:outline-none"
                          />
                          <button type="button" onClick={() => handleSavePrice(art)} className="cursor-pointer rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white">Save</button>
                          <button type="button" onClick={() => setEditingId(null)} className="cursor-pointer rounded border border-neutral-200 px-2 py-1 text-[11px] text-neutral-600">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-base font-extrabold text-slate-900">₱{art.price.toLocaleString()}</span>
                          <button type="button" onClick={() => handleStartEdit(art)} className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-red-600">
                            <Edit3 className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-neutral-100 p-3">
                  <button
                    type="button"
                    onClick={() => onSelectArtwork(art)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-neutral-100 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-neutral-200"
                  >
                    <Eye className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Public Preview</span>
                  </button>
                </div>
              </div>
            );
          })}
          {sellerArtworks.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
              <h3 className="font-bold text-slate-900">No artworks for sale yet</h3>
              <p className="mt-2 text-sm text-neutral-500">Approved and published artworks will appear on your public profile.</p>
            </div>
          )}
        </div>
      )}

      {activeProfileTab === 'portfolio' && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Gallery Portfolio</h3>
          {profileDraft.sampleImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {profileDraft.sampleImages.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${profileDraft.name} portfolio artwork ${index + 1}`}
                  className="aspect-square w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-neutral-50 p-8 text-center text-sm text-neutral-500">Add portfolio images to your artist profile to show them here.</p>
          )}
        </section>
      )}

      {activeProfileTab === 'about' && (
        <section className="space-y-5 rounded-2xl bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900">About {profileDraft.name}</h3>
            {!isEditingAbout ? (
              <button
                type="button"
                onClick={() => setIsEditingAbout(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-neutral-50"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit About
              </button>
            ) : null}
          </div>
          {isEditingAbout ? (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-neutral-700">
                Artist biography
                <textarea
                  value={profileDraft.bio}
                  onChange={(event) => setProfileDraft({ ...profileDraft, bio: event.target.value })}
                  rows={5}
                  maxLength={1200}
                  placeholder="Share your background, creative process, and what inspires your work."
                  className="mt-1 w-full resize-y rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-red-400 focus:outline-none"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-neutral-700">
                  Program / department
                  <input
                    value={profileDraft.dept}
                    onChange={(event) => setProfileDraft({ ...profileDraft, dept: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal text-slate-900 focus:border-red-400 focus:outline-none"
                  />
                </label>
                <label className="text-xs font-semibold text-neutral-700">
                  Location
                  <input
                    value={profileDraft.location}
                    onChange={(event) => setProfileDraft({ ...profileDraft, location: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal text-slate-900 focus:border-red-400 focus:outline-none"
                  />
                </label>
                <label className="text-xs font-semibold text-neutral-700 sm:col-span-2">
                  Specialties (separate with commas)
                  <input
                    value={profileDraft.specialties.join(', ')}
                    onChange={(event) => setProfileDraft({
                      ...profileDraft,
                      specialties: event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                    })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal text-slate-900 focus:border-red-400 focus:outline-none"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="rounded-full bg-[#DC2626] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#B91C1C]"
                >
                  Save About
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDraft(artist);
                    setIsEditingAbout(false);
                  }}
                  className="rounded-full border border-neutral-200 px-5 py-2.5 text-xs font-bold text-neutral-600 transition-colors hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap text-sm leading-7 text-neutral-600">{profileDraft.bio || 'Add an artist biography to introduce yourself to customers.'}</p>
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <p><span className="font-semibold text-slate-900">Program:</span> <span className="text-neutral-600">{profileDraft.dept}</span></p>
                <p><span className="font-semibold text-slate-900">Location:</span> <span className="text-neutral-600">{profileDraft.location}</span></p>
                <p><span className="font-semibold text-slate-900">Member since:</span> <span className="text-neutral-600">{profileDraft.memberSince || 'Not specified'}</span></p>
              </div>
              {profileDraft.specialties.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Specialties</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profileDraft.specialties.map((specialty) => (
                      <span key={specialty} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">{specialty}</span>
                    ))}
                  </div>
                </div>
              )}
              {(profileDraft.achievements ?? []).length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Achievements</h4>
                  <ul className="mt-2 space-y-2">
                    {profileDraft.achievements?.map(({ title, description }) => (
                      <li key={`${title}-${description}`} className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-sm font-semibold text-slate-900">{title}</p>
                        <p className="mt-1 text-xs text-neutral-600">{description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {activeProfileTab === 'reviews' && (
        <section className="space-y-4 rounded-2xl bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Customer Reviews ({reviews.length})</h3>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{reviews.length
                ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
                : profileDraft.rating.toFixed(1)} Overall Rating</span>
            </div>
          </div>
          {reviews.length ? (
            <ul className="divide-y divide-neutral-100">
              {[...reviews]
                .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
                .map((review) => (
                  <li key={review.orderId} className="py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{review.buyerName}</p>
                        <p className="mt-1 text-xs text-neutral-500">{review.artworkTitle}</p>
                        <div className="mt-2 flex" aria-label={`${review.rating} out of 5 stars`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                          ))}
                        </div>
                      </div>
                      <time className="text-xs text-neutral-400" dateTime={review.createdAt}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">{review.text}</p>
                    {review.sellerReply && (
                      <div className="mt-4 rounded-xl bg-red-50 p-4">
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
            <p className="py-10 text-center text-sm text-neutral-500">Customer reviews will appear here after a buyer leaves a rating.</p>
          )}
        </section>
      )}
    </div>
  );
};
