import React, { useState } from 'react';
import { Star, Heart, Share2, ArrowRight } from 'lucide-react';
import { Artwork } from '../types';

interface HeartsViewProps {
  artworks: Artwork[];
  onToggleFavorite: (id: string) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onNavigateToGallery: () => void;
  onShare: () => void;
}

export const HeartsView: React.FC<HeartsViewProps> = ({
  artworks,
  onToggleFavorite,
  onSelectArtwork,
  onNavigateToGallery,
  onShare,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'paintings' | 'sculpture' | 'photography'>('all');

  // Exact 6 artworks matching Hearts page.png
  const heartsItems = [
    {
      id: 'art-7',
      title: 'Golden Hour Reflections',
      artist: 'Malia Santos · Oil Painting',
      price: 142000,
      rating: 5.0,
      category: 'paintings',
      image: artworks[6]?.image || artworks[0]?.image,
    },
    {
      id: 'art-4',
      title: 'Clay & Void Study',
      artist: 'Zhou Jin · Sculpture',
      price: 51200,
      rating: 4.9,
      category: 'sculpture',
      image: artworks[3]?.image || artworks[1]?.image,
    },
    {
      id: 'art-5',
      title: 'Beijing Shade II',
      artist: 'Li Ran · Photography',
      price: 12800,
      rating: 4.9,
      category: 'photography',
      image: artworks[4]?.image || artworks[2]?.image,
    },
    {
      id: 'art-9',
      title: 'Solitude of Form',
      artist: 'Rafi Delgado · Mixed Media',
      price: 178000,
      rating: 4.9,
      category: 'paintings',
      image: artworks[0]?.image,
    },
    {
      id: 'art-10',
      title: 'Crimson Balance',
      artist: 'Malia Santos · Assemblage',
      price: 71900,
      rating: 4.9,
      category: 'sculpture',
      image: artworks[2]?.image,
    },
    {
      id: 'art-11',
      title: 'Urban Rhythm',
      artist: 'Li Ran · Photography',
      price: 45900,
      rating: 5.0,
      category: 'photography',
      image: artworks[7]?.image || artworks[3]?.image,
    },
  ];

  const filteredItems = heartsItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  return (
    <div className="w-full bg-[#FAF9F6]/40 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header & Filter Row (Exact match to Hearts page.png) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
          {/* Subnav categories */}
          <div className="flex items-center gap-6 text-sm font-semibold text-neutral-500 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`pb-3 transition-colors cursor-pointer whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'text-red-600 font-bold border-b-2 border-red-600'
                  : 'hover:text-slate-900'
              }`}
            >
              All hearts
            </button>
            <button
              onClick={() => setActiveFilter('paintings')}
              className={`pb-3 transition-colors cursor-pointer whitespace-nowrap ${
                activeFilter === 'paintings'
                  ? 'text-red-600 font-bold border-b-2 border-red-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Paintings
            </button>
            <button
              onClick={() => setActiveFilter('sculpture')}
              className={`pb-3 transition-colors cursor-pointer whitespace-nowrap ${
                activeFilter === 'sculpture'
                  ? 'text-red-600 font-bold border-b-2 border-red-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Sculpture
            </button>
            <button
              onClick={() => setActiveFilter('photography')}
              className={`pb-3 transition-colors cursor-pointer whitespace-nowrap ${
                activeFilter === 'photography'
                  ? 'text-red-600 font-bold border-b-2 border-red-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Photography
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-5 py-2 rounded-full border border-neutral-800 text-slate-900 font-semibold text-xs hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Favorites</span>
            </button>
            <button
              onClick={onNavigateToGallery}
              className="px-6 py-2 rounded-full bg-[#E52535] hover:bg-red-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Explore Gallery
            </button>
          </div>
        </div>

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col group"
            >
              <div
                onClick={() => {
                  const full = artworks.find((a) => a.id === item.id) || artworks[0];
                  onSelectArtwork(full);
                }}
                className="relative aspect-16/10 overflow-hidden bg-neutral-100 cursor-pointer"
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
                  className="absolute bottom-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-xs text-red-600 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  title="Remove from favorites"
                >
                  <Heart className="w-4 h-4 fill-red-600 text-red-600" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-base text-slate-900 truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-neutral-600 shrink-0 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 truncate">
                    {item.artist}
                  </p>
                </div>

                <div className="pt-4 mt-2">
                  <span className="text-base font-extrabold text-[#E52535]">
                    ₱{item.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
