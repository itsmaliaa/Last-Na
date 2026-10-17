import React, { useState } from 'react';
import { Heart, ArrowRight, Sparkles, Eye, Compass } from 'lucide-react';
import { Artwork } from '../types';

interface GalleryViewProps {
  artworks: Artwork[];
  onToggleFavorite: (id: string) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onNavigateToArtist: (artistName?: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  artworks,
  onToggleFavorite,
  onSelectArtwork,
  onNavigateToArtist,
}) => {
  const [selectedWing, setSelectedWing] = useState<string>('All');

  // Curated artist showcases with exhibition metadata
  const artistsShowcase = [
    {
      name: 'Malia Santos',
      wing: 'Painting Wing',
      specialty: 'Oil painting · Quezon City',
      bio: 'Atmospheric paintings about memory, heat, and the quiet edges of the city.',
      worksCount: 18,
      hall: 'Central Gallery · Salon East',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80',
      artworkIds: ['art-7', 'art-8', 'art-9'],
      fallbackArtworks: [
        {
          id: 'art-7',
          title: 'Golden Hour Reflections',
          artist: 'Malia Santos',
          badge: 'Curator\'s Choice',
          medium: 'Oil on Belgian Linen · 120 × 80 cm',
          year: '2026',
          price: 142000,
          heartsCount: 1420,
          image: artworks[6]?.image,
        },
        {
          id: 'art-8',
          title: 'Autumn Courtyard',
          artist: 'Malia Santos',
          badge: 'Exhibition Feature',
          medium: 'Impasto Oil & Pigment · 90 × 90 cm',
          year: '2026',
          price: 96500,
          heartsCount: 980,
          image: artworks[7]?.image,
        },
        {
          id: 'art-9',
          title: 'Solitude of Form',
          artist: 'Malia Santos',
          badge: 'Juried Selection',
          medium: 'Sumi Ink & Oil Wash · 150 × 100 cm',
          year: '2025',
          price: 178000,
          heartsCount: 1250,
          image: artworks[8]?.image || artworks[0]?.image,
        },
      ],
    },
    {
      name: 'Zhou Jin',
      wing: 'Sculpture Wing',
      specialty: 'Sculpture · Manila',
      bio: 'Small monuments assembled from stone, fired clay, and reclaimed architectural fragments.',
      worksCount: 18,
      hall: 'Sculpture Plinth Court',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=180&q=80',
      artworkIds: ['art-3', 'art-4', 'art-12'],
      fallbackArtworks: [
        {
          id: 'art-3',
          title: 'Structured Silence',
          artist: 'Zhou Jin',
          badge: 'Architectural Prize',
          medium: 'Reclaimed Stone & Mortar · 45 × 35 × 60 cm',
          year: '2026',
          price: 68900,
          heartsCount: 890,
          image: artworks[2]?.image,
        },
        {
          id: 'art-4',
          title: 'Clay & Void Study',
          artist: 'Zhou Jin',
          badge: 'Salon Highlight',
          medium: 'Fired Terracotta Loop · 30 × 30 × 40 cm',
          year: '2026',
          price: 51200,
          heartsCount: 1120,
          image: artworks[3]?.image,
        },
        {
          id: 'art-12',
          title: 'Ceramic Vessel III',
          artist: 'Zhou Jin',
          badge: 'New Exhibition Work',
          medium: 'Hand-thrown Stoneware · 35 × 25 × 45 cm',
          year: '2026',
          price: 74800,
          heartsCount: 760,
          image: artworks[3]?.image,
        },
      ],
    },
    {
      name: 'Li Ran',
      wing: 'Photography Wing',
      specialty: 'Photography · Cebu',
      bio: 'Monochrome studies of old trees, concrete surfaces, and communities in transition.',
      worksCount: 18,
      hall: 'Archival Print Pavilion',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=180&q=80',
      artworkIds: ['art-5', 'art-13', 'art-11'],
      fallbackArtworks: [
        {
          id: 'art-5',
          title: 'Beijing Shade II',
          artist: 'Li Ran',
          badge: 'Documentary Honoree',
          medium: 'Silver Gelatin Print · 80 × 120 cm',
          year: '2026',
          price: 12800,
          heartsCount: 1340,
          image: artworks[4]?.image,
        },
        {
          id: 'art-13',
          title: 'The Silent Alley',
          artist: 'Li Ran',
          badge: 'Limited Exhibition Print',
          medium: 'Archival Monochrome · 70 × 100 cm',
          year: '2026',
          price: 31500,
          heartsCount: 680,
          image: artworks[7]?.image,
        },
        {
          id: 'art-11',
          title: 'Urban Rhythm',
          artist: 'Li Ran',
          badge: 'Chromogenic Masterpiece',
          medium: 'Archival C-Print · 100 × 70 cm',
          year: '2026',
          price: 45900,
          heartsCount: 940,
          image: artworks[7]?.image,
        },
      ],
    },
  ];

  const wings = ['All', 'Painting Wing', 'Sculpture Wing', 'Photography Wing'];

  const filteredCurators = artistsShowcase.filter(
    (c) => selectedWing === 'All' || c.wing === selectedWing
  );

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Exhibition Wing Navigation */}
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200/80 pb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Exhibition Wings
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {wings.map((wing) => (
              <button
                key={wing}
                onClick={() => setSelectedWing(wing)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedWing === wing
                    ? 'bg-[#E52535] text-white shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80'
                }`}
              >
                {wing}
              </button>
            ))}
          </div>
        </div>

        {/* Curated Gallery Rows */}
        <div className="space-y-12">
          {filteredCurators.map((curator, idx) => {
            // Calculate total exhibition hearts for this artist dynamically
            const liveWorks = curator.artworkIds.map((artId, i) => {
              const live = artworks.find((a) => a.id === artId);
              const fallback = curator.fallbackArtworks[i];
              return {
                id: live?.id || fallback.id,
                title: live?.title || fallback.title,
                artist: live?.artist || fallback.artist,
                badge: fallback.badge,
                medium: live?.mediumsUsed || fallback.medium,
                year: fallback.year,
                price: live?.price || fallback.price,
                image: live?.image || fallback.image,
                isFavorited: live?.isFavorited ?? false,
                heartsCount: live?.heartsCount ?? fallback.heartsCount,
                originalArtwork: live || ({
                  ...fallback,
                  status: 'approved',
                  category: 'painting',
                  size: 'Exhibition',
                } as unknown as Artwork),
              };
            });

            const totalExhibitionHearts = liveWorks.reduce(
              (acc, w) => acc + (w.heartsCount || 0),
              0
            );

            return (
              <div
                key={idx}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
              >
                {/* Left Artist Profile Card (Exhibition Salons style) */}
                <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="relative inline-block mb-4">
                      <img
                        src={curator.avatar}
                        alt={curator.name}
                        className="w-16 h-16 rounded-full object-cover bg-neutral-100 shadow-sm border-2 border-white ring-1 ring-neutral-200"
                      />
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" title="Verified CAFA Student Artist" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                        {curator.name}
                      </h3>
                      <p className="text-xs text-red-600 font-semibold">
                        {curator.specialty}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium pt-0.5">
                        <Compass className="w-3 h-3 text-neutral-400" />
                        <span>{curator.hall}</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed mt-3.5 border-t border-neutral-100 pt-3">
                      {curator.bio}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-neutral-100 mt-6 space-y-4">
                    {/* Gallery Heart Highlights instead of commercial star ratings */}
                    <div className="bg-red-50/70 border border-red-100 rounded-2xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-red-600 font-bold">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500 animate-pulse" />
                        <span>{totalExhibitionHearts.toLocaleString()}</span>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-medium">Exhibition Hearts</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                      <span>{curator.worksCount} works in salon</span>
                      <span className="font-semibold text-slate-700">Class of 2026</span>
                    </div>

                    {/* View Profile Button: Exactly directs to Artist Profile */}
                    <button
                      onClick={() => onNavigateToArtist(curator.name)}
                      className="w-full py-2.5 px-4 rounded-full border border-neutral-900 bg-white text-slate-900 font-bold text-xs hover:bg-neutral-900 hover:text-white transition-all cursor-pointer text-center flex items-center justify-center gap-2 group shadow-2xs"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Right 3 Featured Artworks Grid */}
                <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {liveWorks.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col group"
                    >
                      {/* Image Frame */}
                      <div
                        onClick={() => onSelectArtwork(item.originalArtwork)}
                        className="relative aspect-4/3 overflow-hidden bg-neutral-100 cursor-pointer"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Curatorial Badge */}
                        {item.badge && (
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs bg-slate-900/85 backdrop-blur-xs text-white tracking-wide">
                            {item.badge}
                          </span>
                        )}

                        {/* Interactive Favorite Heart Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(item.id);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                            item.isFavorited
                              ? 'bg-red-500 text-white hover:bg-red-600 scale-105'
                              : 'bg-white/90 text-neutral-600 hover:text-red-500 hover:bg-white'
                          }`}
                          title={item.isFavorited ? 'Loved' : 'Heart this artwork'}
                        >
                          <Heart
                            className={`w-4 h-4 transition-transform active:scale-125 ${
                              item.isFavorited ? 'fill-white stroke-white' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Artwork Curatorial Details */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              onClick={() => onSelectArtwork(item.originalArtwork)}
                              className="font-extrabold text-sm sm:text-base text-slate-900 truncate hover:text-[#E52535] cursor-pointer"
                            >
                              {item.title}
                            </h4>
                          </div>

                          <p className="text-xs text-neutral-500 line-clamp-1 font-medium">
                            {item.medium}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            by {item.artist} · {item.year}
                          </p>
                        </div>

                        {/* HIGHLIGHTED HEART METRIC (Replaces Commercial Star Ratings!) */}
                        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100/70 text-xs font-bold">
                            <Heart className={`w-3.5 h-3.5 ${item.isFavorited ? 'fill-red-500 text-red-500' : 'text-red-500 fill-red-500/30'}`} />
                            <span>{item.heartsCount.toLocaleString()} hearts</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-neutral-400 block font-medium">Acquisition Value</span>
                            <span className="text-xs sm:text-sm font-black text-slate-900">
                              ₱{item.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
