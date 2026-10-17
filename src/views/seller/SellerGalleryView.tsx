import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Edit3,
  Eye,
  PlusCircle,
  Tag,
  CheckCircle2,
  Trash2,
  Heart,
} from 'lucide-react';
import { Artwork } from '../../types';

interface SellerGalleryViewProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateToVerification: () => void;
}

export const SellerGalleryView: React.FC<SellerGalleryViewProps> = ({
  artworks,
  onSelectArtwork,
  onShowToast,
  onNavigateToVerification,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  // Filter Malia Santos artworks or student catalog
  const studentArtworks = artworks.slice(0, 8);

  const handleStartEdit = (art: Artwork) => {
    setEditingId(art.id);
    setNewPrice(art.price);
  };

  const handleSavePrice = (art: Artwork) => {
    art.price = newPrice;
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
            <span>Studio Collection & Catalog</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Product Gallery
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your exhibited works, update acquisition prices, and monitor hearts/views.
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

      {/* Grid of Artworks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {studentArtworks.map((art) => {
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
                    {art.category}
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
      </div>
    </div>
  );
};
