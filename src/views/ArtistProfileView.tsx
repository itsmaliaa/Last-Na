import React, { useState } from 'react';
import {
  Star,
  Award,
  Calendar,
  Heart,
  MessageSquare,
  Check,
  Share2,
  ArrowLeft,
} from 'lucide-react';
import { Artwork, BuyerTab, ArtistDirectoryItem } from '../types';
import { oilBannerImg } from '../data/mockData';

interface ArtistProfileViewProps {
  artworks: Artwork[];
  artist?: ArtistDirectoryItem | null;
  onBackToArtists?: () => void;
  onToggleFavorite: (id: string) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onNavigateToBuyerMessages: () => void;
}

export const ArtistProfileView: React.FC<ArtistProfileViewProps> = ({
  artworks,
  artist,
  onBackToArtists,
  onToggleFavorite,
  onSelectArtwork,
  onNavigateToBuyerMessages,
}) => {
  const [isFollowing, setIsFollowing] = useState(artist?.isFollowed ?? false);
  const [activeTab, setActiveTab] = useState<'sale' | 'portfolio' | 'about' | 'reviews'>('sale');

  // Display data (either the passed artist or Malia as default)
  const displayName = artist?.name || 'Malia';
  const displayAvatar =
    artist?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80';
  const displayBanner = artist?.banner || oilBannerImg;
  const displayProgram = (() => {
    const raw = (artist?.dept || artist?.artType || 'Architecture').trim();
    const cleaned = raw.replace(/\s*(Dept|School)\.?$/i, '').trim();

    if (/architecture/i.test(cleaned)) return 'Architecture';
    if (/interior/i.test(cleaned)) return 'Interior Design';
    if (/fine art|fine arts|arts and design/i.test(cleaned)) return 'Fine Art';
    if (/painting|oil painting/i.test(cleaned)) return 'Painting';
    if (/visual communication|communication/i.test(cleaned)) return 'Visual Communication';

    return 'Fine Art';
  })();
  const displayType = displayProgram;
  const displayDesignation = 'Artist and Designer';
  const displayBio =
    artist?.bio ||
    'Combining traditional Chinese atmospheric values with modern oil impressionism. Focusing on light, reflection, and quiet urban environments of Beijing.';
  const displayFollowers = artist?.followers || 234;
  const displayArtworksCount = artist?.artworksCount || 47;
  const displaySales = artist?.salesCount || 89;
  const displayRating = artist?.rating || 4.8;
  const displaySpecialties = artist?.specialties || [
    'Oil Painting',
    'Modern Impressionist',
    'Landscape',
    'Impasto',
  ];
  const displayAchievements = artist?.achievements || [
    { title: 'Top Seller', description: 'Top 5% total sales in Painting Dept.' },
    { title: 'Featured Artist', description: 'Showcased in spring exhibition 2026' },
  ];
  const displayMemberSince = artist?.memberSince || 'September 2024';

  // 6 artworks for sale
  const artistWorks = [
    {
      id: 'malia-1',
      title: 'Golden Hour Reflections',
      dept: `${displayName} (Arts & Design)`,
      price: 2450,
      rating: 5.0,
      badge: 'Best Seller',
      image: artworks[6]?.image || artworks[0]?.image,
    },
    {
      id: 'malia-2',
      title: 'Beijing Autumn Breeze',
      dept: `${displayName} (Arts & Design)`,
      price: 1850,
      rating: 4.9,
      badge: 'For Sale',
      image: artworks[7]?.image || artworks[1]?.image,
    },
    {
      id: 'malia-3',
      title: 'Solitude of Form',
      dept: `${displayName} (Arts & Design)`,
      price: 3100,
      rating: 4.8,
      badge: 'Featured',
      image: artworks[8]?.image || artworks[2]?.image,
    },
    {
      id: 'malia-4',
      title: 'Crimson Balance Study',
      dept: `${displayName} (Arts & Design)`,
      price: 1200,
      rating: 4.7,
      badge: 'For Sale',
      image: artworks[2]?.image || artworks[3]?.image,
    },
    {
      id: 'malia-5',
      title: 'The Silent Alley',
      dept: `${displayName} (Arts & Design)`,
      price: 2100,
      rating: 4.9,
      badge: 'For Sale',
      image: artworks[7]?.image || artworks[4]?.image,
    },
    {
      id: 'malia-6',
      title: 'Urban Rhythm',
      dept: `${displayName} (Arts & Design)`,
      price: 2800,
      rating: 5.0,
      badge: 'New',
      image: artworks[0]?.image,
    },
  ];

  return (
    <div className="w-full bg-[#FAF9F6]/40 min-h-screen pb-16">
      {/* 1. Impasto / Artwork Banner */}
      <div className="w-full h-48 sm:h-64 relative overflow-hidden bg-neutral-900">
        <img
          src={displayBanner}
          alt={`${displayName} Studio Banner`}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Back navigation button if onBackToArtists provided */}
        {onBackToArtists && (
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={onBackToArtists}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md text-slate-900 font-bold text-xs hover:bg-white transition-all shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Artists Directory</span>
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-8">
        {/* 2. Top Profile Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Floating Profile Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-lg flex flex-col md:flex-row gap-6 items-start md:items-center">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md bg-neutral-100 shrink-0"
            />
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold text-slate-900">{displayName}</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200">
                  {displayType}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xl">
                {displayDesignation}
              </p>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xl">
                {displayBio}
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-1 text-xs sm:text-sm">
                <div>
                  <span className="font-extrabold text-slate-900">{displayFollowers}</span>
                  <span className="text-neutral-500 ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-900">{displayArtworksCount}</span>
                  <span className="text-neutral-500 ml-1">Artworks</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-900">{displaySales}</span>
                  <span className="text-neutral-500 ml-1">Sales</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-slate-900">{displayRating}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-neutral-500">Rating</span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-neutral-100 text-slate-700 hover:bg-neutral-200'
                      : 'bg-[#E52535] hover:bg-red-700 text-white shadow-sm'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={onNavigateToBuyerMessages}
                  className="px-6 py-2 rounded-full border border-neutral-800 text-slate-900 hover:bg-neutral-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Contact Artist
                </button>
              </div>
            </div>
          </div>

          {/* Right Side Cards */}
          <div className="lg:col-span-4 space-y-4">
            {/* Artist Achievements Card */}
            <div className="bg-[#FFF8EE] rounded-3xl p-6 border border-amber-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Artist Achievements</h3>
              <div className="space-y-3 text-xs">
                {displayAchievements.map((ach, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      {idx === 0 ? <Award className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{ach.title}</h4>
                      <p className="text-[11px] text-neutral-600 mt-0.5">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialties & Member Since Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  MEMBER SINCE
                </span>
                <p className="font-bold text-sm text-slate-900 mt-0.5">{displayMemberSince}</p>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  SPECIALTIES
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {displaySpecialties.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-amber-50 text-amber-900 text-[11px] font-semibold rounded-full border border-amber-200/80"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div className="border-b border-neutral-200 flex items-center gap-8 text-sm font-semibold text-neutral-500">
          <button
            onClick={() => setActiveTab('sale')}
            className={`pb-3 transition-colors cursor-pointer relative ${
              activeTab === 'sale' ? 'text-red-600 font-bold border-b-2 border-red-600' : 'hover:text-slate-900'
            }`}
          >
            Artworks for Sale
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'portfolio' ? 'text-red-600 font-bold border-b-2 border-red-600' : 'hover:text-slate-900'
            }`}
          >
            Gallery Portfolio
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'about' ? 'text-red-600 font-bold border-b-2 border-red-600' : 'hover:text-slate-900'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'reviews' ? 'text-red-600 font-bold border-b-2 border-red-600' : 'hover:text-slate-900'
            }`}
          >
            Reviews (128)
          </button>
        </div>

        {/* 4. Artworks for Sale Grid (Exact match to artist profile.png) */}
        {activeTab === 'sale' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artistWorks.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                <div
                  onClick={() => {
                    const fullItem = artworks.find((a) => a.title === item.title) || {
                      ...artworks[0],
                      title: item.title,
                      price: item.price,
                    };
                    onSelectArtwork(fullItem);
                  }}
                  className="relative aspect-4/3 overflow-hidden bg-neutral-100 cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.badge && (
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm ${
                        item.badge === 'Best Seller'
                          ? 'bg-[#E52535] text-white'
                          : item.badge === 'Featured'
                          ? 'bg-rose-600 text-white'
                          : item.badge === 'New'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#E52535] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-neutral-600 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-neutral-600 shrink-0 font-medium">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 truncate">
                      {item.dept}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[#E52535]">
                      ₱{item.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 text-center py-16 space-y-2">
            <h3 className="font-bold text-lg text-slate-900">CAFA Degree Exhibition Portfolio</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Curated architectural and oil landscape studies presented during the Spring 2026 Academic Jury Examination.
            </p>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Artist Biography & Statement</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Malia Santos is a senior fine arts scholar at the Central Academy of Fine Arts (CAFA), specializing in atmospheric oil impressionism. Having trained across classical wet-on-wet brushwork and contemporary architectural rendering, her work centers on light diffusion in dense historical alleyways and transitionary urban boundaries.
            </p>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="font-bold text-lg text-slate-900">Collector Reviews (128)</h3>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.8 Overall Rating</span>
              </div>
            </div>
            <div className="divide-y divide-neutral-100 space-y-4 text-xs">
              <div className="pt-3">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Dr. Corazon Mendoza</span>
                  <span className="text-neutral-400 font-normal">Delivered Aug 2026</span>
                </div>
                <p className="text-neutral-600 mt-1">
                  &quot;The impasto textures on Golden Hour Reflections are sublime in natural morning light. The certificate of provenance stamped by the academy faculty arrived in pristine condition.&quot;
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
