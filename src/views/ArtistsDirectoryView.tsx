import React, { useState } from 'react';
import {
  ArrowRight,
  Heart,
  Palette,
  Sparkles,
  Layers,
  MapPin,
  Check,
} from 'lucide-react';
import { ArtistDirectoryItem } from '../types';

interface ArtistsDirectoryViewProps {
  artists: ArtistDirectoryItem[];
  onSelectArtist: (artist: ArtistDirectoryItem) => void;
  onToggleFollow: (id: string) => void;
  initialArtType?: string;
}

export const ArtistsDirectoryView: React.FC<ArtistsDirectoryViewProps> = ({
  artists,
  onSelectArtist,
  onToggleFollow,
  initialArtType = 'All',
}) => {
  const [selectedArtType, setSelectedArtType] = useState<string>(initialArtType);
  const [sortBy, setSortBy] = useState<'hearts' | 'artworks' | 'sales' | 'rating' | 'name'>('hearts');

  const artTypes = [
    'All',
    'Architecture',
    'Interior Design',
    'Fine Art',
    'Painting',
    'Visual Communication',
  ];

  const getArtTypeCount = (type: string) => {
    if (type === 'All') return artists.length;
    return artists.filter((a) => a.artType === type).length;
  };

  const filteredArtists = artists
    .filter((artist) => {
      if (selectedArtType !== 'All' && artist.artType !== selectedArtType) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'hearts') return (b.followers * 4) - (a.followers * 4);
      if (sortBy === 'artworks') return b.artworksCount - a.artworksCount;
      if (sortBy === 'sales') return b.salesCount - a.salesCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const topPopularArtists = [...artists]
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 6);

  const getProgramLabel = (artist: ArtistDirectoryItem) => {
    const raw = (artist.dept || artist.artType || 'Architecture').trim();
    const cleaned = raw.replace(/\s*(Dept|School)\.?$/i, '').trim();

    if (/architecture/i.test(cleaned)) return 'Architecture';
    if (/interior/i.test(cleaned)) return 'Interior Design';
    if (/fine art|fine arts|arts and design/i.test(cleaned)) return 'Fine Art';
    if (/painting|oil painting/i.test(cleaned)) return 'Painting';
    if (/visual communication|communication/i.test(cleaned)) return 'Visual Communication';

    return 'Fine Art';
  };

  const getDesignationLabel = () => 'Artist and Designer';

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Top Part: Top Popular Artists (Small, simple, space-saving) */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Top Popular Artists
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {topPopularArtists.map((artist) => (
              <button
                key={artist.id}
                onClick={() => onSelectArtist(artist)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-50 hover:bg-red-50 hover:border-red-200 border border-neutral-200/80 transition-all text-left shrink-0 cursor-pointer group"
                title={`View ${artist.name}`}
              >
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-neutral-300"
                />
                <span className="text-xs font-semibold text-slate-800 group-hover:text-red-600 truncate max-w-[100px]">
                  {artist.name}
                </span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded-full">
                  ★ {artist.rating}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls: Type of Art & Compact System-Themed Sort By Button */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Showing Count */}
          <div className="text-xs font-semibold text-neutral-500">
            Showing <span className="font-bold text-slate-900">{filteredArtists.length}</span> of {artists.length} artists
          </div>

          {/* Simple Button-Style Controls in System Red Palette */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1. Type of Art Filter */}
            <div className="relative inline-flex items-center">
              <select
                value={selectedArtType}
                onChange={(e) => setSelectedArtType(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 rounded-full text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-400 cursor-pointer transition-colors shadow-2xs"
              >
                {artTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All' ? `All Types (${artists.length})` : `${type} (${getArtTypeCount(type)})`}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-[10px]">
                ▼
              </div>
            </div>

            {/* 2. Sort By Button in System Color (Simple button style, no big border) */}
            <div className="relative inline-flex items-center">
              <span className="text-xs font-bold text-red-700 mr-1.5 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-7 py-1.5 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 rounded-full text-xs font-bold focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer transition-colors shadow-2xs"
              >
                <option value="hearts">Most Hearts</option>
                <option value="artworks">Most Artworks</option>
                <option value="sales">Acquisitions Sold</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-red-600 text-[10px]">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map((artist) => {
            const estimatedHearts = (artist.followers * 4) + (artist.salesCount * 12);
            return (
              <div
                key={artist.id}
                className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Artist Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-14 h-14 rounded-full object-cover bg-neutral-100 border-2 border-white shadow-xs ring-1 ring-neutral-200"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" title="Verified Artist" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-base text-slate-900 truncate group-hover:text-[#E52535] transition-colors">
                          {artist.name}
                        </h3>
                        <p className="text-[11px] text-neutral-400 mt-0.5 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          <span>{artist.location}</span>
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                          {getDesignationLabel()}
                        </p>
                      </div>
                    </div>

                    {/* Discipline Badge (Base on what type of art it is) */}
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 border bg-rose-50 text-rose-800 border-rose-200"
                    >
                      {getProgramLabel(artist)}
                    </span>
                  </div>

                  {/* Bio Excerpt */}
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {artist.bio}
                  </p>

                  {/* Sample Artworks Thumbnail Preview */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Exhibition Studies
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {artist.sampleImages.slice(0, 3).map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100 shadow-2xs"
                        >
                          <img
                            src={img}
                            alt="Artwork thumbnail"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specialties Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {artist.specialties.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-neutral-50 text-neutral-600 text-[10px] font-medium border border-neutral-200/60"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Metrics: Highlights hearts! */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <div>
                      <span className="font-bold text-slate-900">{artist.artworksCount}</span> works
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{artist.salesCount}</span> acquisitions
                    </div>
                    <div className="flex items-center gap-1 font-bold text-red-600 bg-red-50/70 px-2 py-0.5 rounded-full border border-red-100/60">
                      <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      <span>{estimatedHearts.toLocaleString()} hearts</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Follow and View Profile */}
                <div className="pt-5 flex items-center gap-2">
                  <button
                    onClick={() => onToggleFollow(artist.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                      artist.isFollowed
                        ? 'bg-neutral-100 text-slate-700 hover:bg-neutral-200'
                        : 'border border-neutral-300 text-slate-700 hover:bg-neutral-50'
                    }`}
                  >
                    {artist.isFollowed ? 'Following' : 'Follow'}
                  </button>

                  {/* ONLY this button triggers the single Artist Profile View */}
                  <button
                    onClick={() => onSelectArtist(artist)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs group/btn"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
