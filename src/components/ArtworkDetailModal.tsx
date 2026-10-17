import React from 'react';
import { X, Heart, Star, ShieldCheck, Check } from 'lucide-react';
import { BlackCartIcon } from './BlackCartIcon';
import { Artwork } from '../types';

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  onClose: () => void;
  onAddToCart: (artwork: Artwork) => void;
  onToggleFavorite: (id: string) => void;
}

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  artwork,
  onClose,
  onAddToCart,
  onToggleFavorite,
}) => {
  if (!artwork) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700">
              CAFA Emerging Artist Catalog
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Image */}
          <div className="relative aspect-4/3 md:aspect-square rounded-2xl overflow-hidden bg-neutral-900 shadow-md">
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
            {artwork.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#E52535] text-white text-xs font-bold shadow-md">
                {artwork.badge}
              </span>
            )}
            <button
              onClick={() => onToggleFavorite(artwork.id)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-neutral-700 hover:text-red-600 transition-colors cursor-pointer shadow-sm"
            >
              <Heart className={`w-4 h-4 ${artwork.isFavorited ? 'fill-red-600 text-red-600' : ''}`} />
            </button>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-4 text-xs">
            <div className="space-y-3">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">{artwork.title}</h3>
                <p className="text-sm font-semibold text-neutral-600 mt-1">
                  By {artwork.artist}
                </p>
                <p className="text-neutral-400 text-xs">
                  {artwork.artistDept || artwork.course || 'Fine Arts Academy'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 font-bold text-slate-800 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{artwork.rating || 4.9}</span>
                </div>
                <span className="text-neutral-300">·</span>
                <span className="text-neutral-500 font-mono">Size: {artwork.size}</span>
              </div>

              <div className="text-2xl font-black text-[#E52535]">
                ₱{artwork.price.toLocaleString()}
              </div>

              <p className="text-neutral-600 leading-relaxed text-xs">
                {artwork.description ||
                  'Authentic original fine art created in the studios of the Central Academy of Fine Arts (CAFA).'}
              </p>

              {artwork.colors && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
                    Color Palette
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {artwork.colors.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-slate-700 text-[11px] font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 100% Student support pledge */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-2 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Academic Escrow Guarantee:</strong> 100% of proceeds go directly to student artist {artwork.artist} upon delivery confirmation.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
              <button
                onClick={() => {
                  onAddToCart(artwork);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-[#E52535] hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <BlackCartIcon className="w-4 h-4" />
                <span>Buy now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
