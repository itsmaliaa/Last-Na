import React, { useEffect, useState } from 'react';
import {
  Image as ImageIcon,
  Edit3,
  Eye,
  PlusCircle,
  Heart,
} from 'lucide-react';
import { Artwork, ArtistDirectoryItem } from '../../types';
import { getArtworkCategoryLabel } from '../../utils/artworkCategories';

interface SellerGalleryViewProps {
  artworks: Artwork[];
  artist: ArtistDirectoryItem;
  sellerName: string;
  onUpdateArtist: (artist: ArtistDirectoryItem) => void;
  onUpdateArtwork: (artwork: Artwork) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateToVerification: () => void;
}

export const SellerGalleryView: React.FC<SellerGalleryViewProps> = ({
  artworks,
  artist,
  sellerName,
  onUpdateArtist,
  onUpdateArtwork,
  onSelectArtwork,
  onShowToast,
  onNavigateToVerification,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(artist);

  useEffect(() => {
    setProfileDraft(artist);
  }, [artist]);

  const sellerArtworks = artworks.filter(
    (artwork) =>
      artwork.artist.toLowerCase() === sellerName.toLowerCase() &&
      artwork.status === 'approved' &&
      artwork.isActive !== false
  );

  const handleSaveProfile = () => {
    onUpdateArtist(profileDraft);
    setIsEditingProfile(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <ImageIcon className="w-4 h-4" />
            <span>Artist Page</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Product Gallery
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Update your public profile and manage the artworks shown on your artist page.
          </p>
        </div>

        <button
          onClick={onNavigateToVerification}
          className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New Artwork</span>
        </button>
      </div>

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
              Profile photo URL
              <input
                type="url"
                value={profileDraft.avatar}
                onChange={(event) => setProfileDraft({ ...profileDraft, avatar: event.target.value })}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-normal text-slate-900"
              />
            </label>
            <label className="text-xs font-semibold text-neutral-700">
              Banner image URL
              <input
                type="url"
                value={profileDraft.banner ?? ''}
                onChange={(event) => setProfileDraft({ ...profileDraft, banner: event.target.value })}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-normal text-slate-900"
              />
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

      {/* Grid of Artworks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sellerArtworks.map((art) => {
          const isEditing = editingId === art.id;

          return (
            <div
              key={art.id}
              className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {getArtworkCategoryLabel(art.category)}
                  </span>
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[11px] font-bold text-red-600 shadow-2xs">
                    <Heart className="w-3 h-3 fill-red-600" />
                    <span>{art.heartsCount ?? 350}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-extrabold text-sm text-slate-900 truncate">
                    {art.title}
                  </h3>
                  <p className="text-xs text-neutral-500 truncate">
                    {art.mediumsUsed || 'Oil on Canvas'} · {art.size}
                  </p>

                  {/* Price display / editor */}
                  <div className="pt-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-bold text-slate-900">₱</span>
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-neutral-300 rounded text-xs font-bold focus:outline-none focus:border-red-500"
                        />
                        <button
                          onClick={() => handleSavePrice(art)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 border border-neutral-200 text-neutral-600 rounded text-[11px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-slate-900">
                          ₱{art.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleStartEdit(art)}
                          className="text-[11px] text-neutral-500 hover:text-red-600 flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 border-t border-neutral-100 flex items-center gap-2">
                <button
                  onClick={() => onSelectArtwork(art)}
                  className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Public Preview</span>
                </button>
              </div>
            </div>
          );
        })}
        {sellerArtworks.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-neutral-200/80 p-8 text-center text-sm text-neutral-500">
            You have not added any artworks to your gallery yet.
          </div>
        )}
      </div>
    </div>
  );
};
