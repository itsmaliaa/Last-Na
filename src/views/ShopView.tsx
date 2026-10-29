import React, { useState } from 'react';
import {
  Package,
  MessageSquare,
  Truck,
  MapPin,
  ChevronRight,
  Star,
  Heart,
  ShoppingBag,
  Users,
  Palette,
} from 'lucide-react';
import { BlackCartIcon } from '../components/BlackCartIcon';
import { Artwork, BuyerTab } from '../types';

interface ShopViewProps {
  artworks: Artwork[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (artwork: Artwork) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onNavigateToBuyerTab: (tab: BuyerTab) => void;
  onNavigateToArtists?: (artType?: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  artworks,
  onToggleFavorite,
  onAddToCart,
  onSelectArtwork,
  onNavigateToBuyerTab,
  onNavigateToArtists,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Exact 8 artworks matching Shop.png
  const shopItems = artworks
    .filter((artwork) => artwork.status === 'approved' && artwork.isActive !== false)
    .slice(0, 8);

  const mapCategoryToArtType = (cat?: string): string => {
    if (!cat) return 'All';
    const lower = cat.toLowerCase();
    if (lower.includes('paint')) return 'Painting';
    if (lower.includes('sculpt')) return 'Sculpture';
    if (lower.includes('arch')) return 'Architecture';
    if (lower.includes('photo')) return 'Photography';
    if (lower.includes('digit')) return 'Digital Art';
    if (lower.includes('mix')) return 'Mixed Media';
    return 'All';
  };

  return (
    <div className="w-full bg-[#FAF9F6]/40 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Top Quick Action Cards (Exact match to Shop.png) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Orders */}
          <div
            onClick={() => onNavigateToBuyerTab('orders')}
            className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-red-200 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                  Orders
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Order status, cancellations, receipts
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Message */}
          <div
            onClick={() => onNavigateToBuyerTab('messages')}
            className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-red-200 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                  Message
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Contact artists or buyer support in one safe inbox
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Shipping */}
          <div
            onClick={() => onNavigateToBuyerTab('orders')}
            className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-red-200 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                  Shipping
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Packaging, tracking, delivery timing
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Manage Address */}
          <div
            onClick={() => onNavigateToBuyerTab('addresses')}
            className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-red-200 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                  Manage Address
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 truncate max-w-[150px]">
                  Delivering to Quezon City · Unit **, Brgy. D*****
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Quick Artists Navigation Strip */}
        {onNavigateToArtists && (
          <div className="bg-white rounded-2xl px-5 py-3 border border-neutral-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Users className="w-4 h-4 text-red-600" />
              <span>Explore CAFA Artists by Discipline:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['Painting', 'Sculpture', 'Architecture', 'Photography', 'Digital Art'].map((type) => (
                <button
                  key={type}
                  onClick={() => onNavigateToArtists(type)}
                  className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-red-50 hover:text-red-700 text-neutral-700 font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  {type}
                </button>
              ))}
              <button
                onClick={() => onNavigateToArtists('All')}
                className="px-3 py-1 rounded-full text-red-600 hover:underline font-bold cursor-pointer whitespace-nowrap"
              >
                Browse All Artists &gt;
              </button>
            </div>
          </div>
        )}

        {/* 2. Artwork Catalog Grid (8 items with badges and ₱ prices matching Shop.png) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shopItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col group"
            >
              <div
                onClick={() => onSelectArtwork(item)}
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
                      item.badge === 'Trending'
                        ? 'bg-[#E52535] text-white'
                        : item.badge === 'Best Seller'
                        ? 'bg-amber-500 text-white'
                        : item.badge === 'Popular'
                        ? 'bg-blue-600 text-white'
                        : item.badge === 'Collector Pick'
                        ? 'bg-purple-600 text-white'
                        : item.badge === 'New'
                        ? 'bg-emerald-600 text-white'
                        : item.badge === 'Featured'
                        ? 'bg-rose-600 text-white'
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
                  title="Toggle favorite"
                >
                  <Heart className={`w-4 h-4 ${item.isFavorited ? 'fill-red-600 text-red-600' : ''}`} />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      onClick={() => onSelectArtwork(item)}
                      className="font-bold text-sm text-slate-900 truncate hover:text-red-600 cursor-pointer"
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-neutral-600 shrink-0 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating || 4.9}</span>
                    </div>
                  </div>

                  {/* Clickable artist name directs to Artists Directory for that art type */}
                  <p
                    onClick={(e) => {
                      if (onNavigateToArtists) {
                        e.stopPropagation();
                        onNavigateToArtists(mapCategoryToArtType(item.category));
                      }
                    }}
                    className={`text-xs text-neutral-500 mt-1 truncate ${
                      onNavigateToArtists ? 'hover:text-[#E52535] cursor-pointer' : ''
                    }`}
                    title={onNavigateToArtists ? `View ${item.artist} & other ${item.category} artists in directory` : undefined}
                  >
                    {item.artist} · {item.mediumsUsed?.split(',')[0] || item.category}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-100">
                  <span className="text-sm font-extrabold text-[#E52535]">
                    ₱{item.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onAddToCart(item)}
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

        {/* 3. Pagination Controls (Exact match to Shop.png) */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            Previous
          </button>

          {[1, 2, 3, 4].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-[#E52535] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-neutral-100'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(4, currentPage + 1))}
            className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
