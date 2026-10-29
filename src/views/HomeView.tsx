import React, { useState } from 'react';
import {
  ChevronRight,
  Star,
  ShieldCheck,
  Lock,
  FileCheck,
  Headphones,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { Artwork, RankedArtist } from '../types';
import { AllCategoriesSlideDown } from '../components/AllCategoriesSlideDown';
import { BlackCartIcon } from '../components/BlackCartIcon';
import { oilBannerImg } from '../data/mockData';

interface HomeViewProps {
  artworks: Artwork[];
  rankedArtists: RankedArtist[];
  onToggleFollowArtist: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (artwork: Artwork) => void;
  onNavigateToShop: () => void;
  onNavigateToGallery: () => void;
  onNavigateToArtist: (artistName?: string) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  isAllCategoriesOpen?: boolean;
  onToggleAllCategories?: () => void;
  onOpenAllCategories?: () => void;
  onCloseAllCategories?: (immediate?: boolean) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  artworks,
  rankedArtists,
  onToggleFollowArtist,
  onToggleFavorite,
  onAddToCart,
  onNavigateToShop,
  onNavigateToGallery,
  onNavigateToArtist,
  onSelectArtwork,
  isAllCategoriesOpen = false,
  onToggleAllCategories,
  onOpenAllCategories,
  onCloseAllCategories,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern Expressionism');
  const [selectedArtTypes, setSelectedArtTypes] = useState<string[]>(['Painting']);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Modern']);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>('Red');
  const [priceValue, setPriceValue] = useState<number>(10000);
  // Style chips row matching all Categories button slide down bar.png
  const styleChips = [
    'All Style',
    'Modern Expressionism',
    'Minimalist Geometry',
    'Abstract Form',
    'Traditional Chinese Ink',
    'Pop Art',
    'Cute / Kawaii',
    'Cute / Kawaii',
    'Cute / Kawaii',
  ];

  const toggleArtType = (type: string) => {
    setSelectedArtTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleStyleFilter = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  // 4 Featured Artworks matching all Categories button slide down bar.png
  const featuredArtworks = [
    {
      id: artworks[2]?.id || 'art-3',
      title: 'Structured Silence',
      artist: 'Zhou Jin',
      artistDept: 'Sculpture Dept.',
      price: 1200,
      rating: 4.9,
      badge: 'Trending' as const,
      image: artworks[2]?.image,
      isFavorited: artworks[2]?.isFavorited ?? false,
      rawArtwork: artworks[2] || {
        ...artworks[0],
        title: 'Structured Silence',
        price: 1200,
      },
    },
    {
      id: artworks[3]?.id || 'art-4',
      title: 'Clay & Void Study',
      artist: 'Zhang Wei',
      artistDept: 'Sculpture Dept.',
      price: 890,
      rating: 4.9,
      badge: 'Best Seller' as const,
      image: artworks[3]?.image,
      isFavorited: artworks[3]?.isFavorited ?? false,
      rawArtwork: artworks[3] || {
        ...artworks[0],
        title: 'Clay & Void Study',
        price: 890,
      },
    },
    {
      id: artworks[4]?.id || 'art-5',
      title: 'Beijing Shade II',
      artist: 'Li Ran',
      artistDept: 'Photography Dept.',
      price: 190,
      rating: 4.9,
      badge: 'Popular' as const,
      image: artworks[4]?.image,
      isFavorited: artworks[4]?.isFavorited ?? false,
      rawArtwork: artworks[4] || {
        ...artworks[0],
        title: 'Beijing Shade II',
        price: 190,
      },
    },
    {
      id: artworks[5]?.id || 'art-6',
      title: 'Monolith Study',
      artist: 'Lu Han',
      artistDept: 'Architecture Dept.',
      price: 620,
      rating: 4.9,
      badge: 'For Sale' as const,
      image: artworks[5]?.image,
      isFavorited: artworks[5]?.isFavorited ?? false,
      rawArtwork: artworks[5] || {
        ...artworks[0],
        title: 'Monolith Study',
        price: 620,
      },
    },
  ];

  // 8 items for "You May Also Like" matching all Categories button slide down bar.png
  const youMayAlsoLike = [
    ...featuredArtworks,
    ...featuredArtworks,
  ];

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-4 pb-16 relative">
      {/* 1. All Category Slide-Down Overlay: COVERS content beneath without removing or shifting what is under it */}
      <div
        onMouseEnter={onOpenAllCategories}
        onMouseLeave={() => onCloseAllCategories?.(false)}
        className={`absolute top-2 left-0 right-0 z-30 transition-all duration-300 ease-out origin-top ${
          isAllCategoriesOpen
            ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-y-95 -translate-y-3 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="shadow-2xl rounded-3xl">
            <AllCategoriesSlideDown
              selectedStyleChip={selectedStyle}
              onSelectStyleChip={setSelectedStyle}
              selectedArtTypes={selectedArtTypes}
              onToggleArtType={toggleArtType}
              selectedStyles={selectedStyles}
              onToggleStyle={toggleStyleFilter}
              selectedMaterials={selectedMaterials}
              onToggleMaterial={toggleMaterial}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              priceValue={priceValue}
              onChangePrice={setPriceValue}
              onClose={() => onCloseAllCategories?.(true)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Discover Hero Section: "Discover Original Art by Emerging CAFA Artists" (Exact match to Home page.png) */}
        <section className="pt-2 pb-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.08]">
                Discover Original Art by<br />
                Emerging CAFA Artists
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-lg">
                Acquire hand-crafted paintings, fine art printworks, digital assets and miniature architectural mockups straight from the studios of Beijing&apos;s premier Fine Arts academy.
              </p>
              <div className="flex items-center gap-3.5 pt-2">
                <button
                  onClick={onNavigateToShop}
                  className="px-6 py-3 rounded-full bg-[#E52535] hover:bg-[#c91d2c] text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onNavigateToGallery}
                  className="px-6 py-3 rounded-full bg-white hover:bg-neutral-50 text-slate-900 text-xs sm:text-sm font-bold border border-neutral-300 transition-all cursor-pointer shadow-2xs"
                >
                  Explore Gallery
                </button>
              </div>
            </div>

            {/* Right Showcase Cards (Overlapping cards as seen in Home page.png) */}
            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end min-h-[300px] pt-4 lg:pt-0">
              {/* Card 1: Reborn Petals (Behind, Left) */}
              <div className="w-40 sm:w-48 bg-white rounded-2xl p-2.5 shadow-md border border-neutral-200/90 -rotate-3 hover:rotate-0 transition-transform duration-300 z-10">
                <div className="aspect-4/5 rounded-xl overflow-hidden bg-neutral-100 mb-2">
                  <img
                    src={oilBannerImg || artworks[0]?.image}
                    alt="Reborn Petals"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">Reborn Petals</h4>
                  <p className="text-[10px] text-neutral-500 truncate">by Wang Yue (Oil Painting Dept.)</p>
                </div>
              </div>

              {/* Card 2: Structured Silence (In front, Right, overlapping) */}
              <div className="w-48 sm:w-56 bg-white rounded-2xl p-3 shadow-xl border border-neutral-200/90 rotate-2 hover:rotate-0 transition-transform duration-300 -ml-10 sm:-ml-14 mt-10 sm:mt-12 z-20">
                <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 mb-2">
                  <img
                    src={artworks[2]?.image}
                    alt="Structured Silence"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">Structured Silence</h4>
                    <p className="text-[10px] text-neutral-500 truncate">by Zhou Jin (Sculpture Dept.)</p>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#E52535] bg-red-50 px-2 py-0.5 rounded-full border border-red-100 shrink-0">
                    $1,200
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Horizontal Style Chips Row (Exact match to all Categories button slide down bar.png) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {styleChips.map((chip, idx) => {
            const isSelected =
              idx === 1
                ? selectedStyle === chip || selectedStyle === 'Modern Expressionism'
                : selectedStyle === chip && idx !== 1;
            return (
              <button
                key={idx}
                onClick={() => setSelectedStyle(chip)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E52535] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* 3. Four Featured Cards Grid (Exact match to all Categories button slide down bar.png) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArtworks.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col group"
            >
              {/* Image Container with Badge and Heart */}
              <div
                onClick={() => onSelectArtwork(item.rawArtwork)}
                className="relative aspect-4/3 overflow-hidden bg-neutral-100 cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {item.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs bg-[#E52535] text-white">
                    {item.badge}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-neutral-600 hover:text-red-600 hover:bg-white transition-colors cursor-pointer shadow-xs"
                  title="Toggle favorite"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      item.isFavorited ? 'fill-red-600 text-red-600' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      onClick={() => onSelectArtwork(item.rawArtwork)}
                      className="font-bold text-sm text-slate-900 truncate hover:text-red-600 cursor-pointer"
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-neutral-600 shrink-0 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 truncate">
                    {item.artist} ({item.artistDept})
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-100">
                  <span className="text-sm font-extrabold text-[#E52535]">
                    ₱{item.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onAddToCart(item.rawArtwork)}
                    className="p-2 rounded-xl text-neutral-900 hover:text-white hover:bg-[#E52535] border border-neutral-200 hover:border-[#E52535] transition-all cursor-pointer"
                    title="Add to cart"
                  >
                    <BlackCartIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 4. Trust Badges Row (Exact match to all Categories button slide down bar.png) */}
        <section className="border-y border-neutral-200/80 bg-white py-8 rounded-2xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 text-[#E52535] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Authentic Art</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                  Verifiable student work with academic track record
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Secure Payments</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                  Fully encrypted escrow payment architecture
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Certificates</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                  Stamped certificate signed by CAFA department advisor
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-50 text-[#E52535] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">24/7 Support</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                  Our gallery handlers are here to assist you anytime
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Top Listed Artists This Month (Exact match to all Categories button slide down bar.png) */}
        <section className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">
                POPULAR ARTIST
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Top Listed Artists This Month
              </h2>
            </div>
            <button
              onClick={onNavigateToGallery}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Gallery</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Wang Yue Feature Banner Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 rounded-2xl overflow-hidden aspect-4/3 bg-neutral-100 shadow-inner">
              <img
                src={artworks[0]?.image}
                alt="Wang Yue Exhibition Piece"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-7 space-y-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Wang Yue</h3>
              <p className="text-xs text-neutral-500 font-medium">Oil Painting School, Class of 2026</p>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Awarded the Academy Grand Prix for her series &quot;Reborn Petals&quot;. Her work probes the friction between traditional oil application techniques and pixelated generative representations.
              </p>
              <div className="flex items-center gap-8 py-2">
                <div>
                  <div className="text-[11px] text-neutral-400 font-semibold uppercase">Artworks</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">18 works</div>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400 font-semibold uppercase">Sales</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">42 items sold</div>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400 font-semibold uppercase">Rating</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>5.0</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigateToArtist('Wang Yue')}
                className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>View Wang&apos;s Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 8 Ranked Artist Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rankedArtists.map((artist) => (
              <div
                key={artist.id}
                className="bg-white rounded-2xl p-3.5 border border-neutral-200/80 shadow-xs flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-11 h-11 rounded-full object-cover bg-neutral-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-red-600">#{artist.rank}</span>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{artist.name}</h4>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate">{artist.dept}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {artist.soldCount} sold · ⭐ {artist.rating}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleFollowArtist(artist.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                    artist.isFollowed
                      ? 'bg-neutral-100 text-slate-700 hover:bg-neutral-200'
                      : 'border border-neutral-300 text-slate-800 hover:bg-neutral-50'
                  }`}
                >
                  {artist.isFollowed ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 6. You May Also Like Section (Exact match to all Categories button slide down bar.png) */}
        <section className="space-y-6 pt-4 border-t border-neutral-200/80">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            You May Also Like
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {youMayAlsoLike.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                <div
                  onClick={() => onSelectArtwork(item.rawArtwork)}
                  className="relative aspect-4/3 overflow-hidden bg-neutral-100 cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-neutral-600 hover:text-red-600 hover:bg-white transition-colors cursor-pointer shadow-xs"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.isFavorited ? 'fill-red-600 text-red-600' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        onClick={() => onSelectArtwork(item.rawArtwork)}
                        className="font-bold text-sm text-slate-900 truncate hover:text-red-600 cursor-pointer"
                      >
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-neutral-600 shrink-0 font-medium">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating || 4.9}</span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 truncate">
                      {item.artist} ({item.artistDept})
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-100">
                    <span className="text-sm font-extrabold text-[#E52535]">
                      ₱{item.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => onAddToCart(item.rawArtwork)}
                      className="p-2 rounded-xl text-neutral-900 hover:text-white hover:bg-[#E52535] border border-neutral-200 hover:border-[#E52535] transition-all cursor-pointer"
                      title="Add to cart"
                    >
                      <BlackCartIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
