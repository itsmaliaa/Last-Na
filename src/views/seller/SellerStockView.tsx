import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Tag,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Artwork } from '../../types';
import { ARTWORK_CATEGORIES, getArtworkCategoryLabel } from '../../utils/artworkCategories';

interface SellerStockViewProps {
  artworks: Artwork[];
  onUpdateArtworkStock?: (artworkId: string, newStock: number) => void;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateToGallery?: () => void;
}

export const SellerStockView: React.FC<SellerStockViewProps> = ({
  artworks,
  onUpdateArtworkStock,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Artwork['category'] | 'all'>('all');

  // Local state for stock quantities per artwork
  const [stockMap, setStockMap] = useState<Record<string, number>>(() => {
    const initialMap: Record<string, number> = {};
    artworks.forEach((art, idx) => {
      // Provide realistic default stock if not present:
      if (typeof art.stock === 'number') {
        initialMap[art.id] = art.stock;
      } else if (art.title === 'Abstract Horizons') {
        initialMap[art.id] = 0; // Sold
      } else if (art.title === 'Golden Hour Reflections') {
        initialMap[art.id] = 1; // 1 left (Low)
      } else if (art.title === 'Clay & Void Study') {
        initialMap[art.id] = 2; // 2 left (Low)
      } else {
        initialMap[art.id] = (idx % 3 === 0) ? 1 : (idx % 2 === 0 ? 3 : 5);
      }
    });
    return initialMap;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Handle stock change
  const handleStockChange = (artworkId: string, delta: number) => {
    setStockMap((prev) => {
      const current = prev[artworkId] ?? 1;
      const next = Math.max(0, current + delta);
      return { ...prev, [artworkId]: next };
    });
    setHasUnsavedChanges(true);
  };

  const handleSetExactStock = (artworkId: string, value: number) => {
    const safeVal = Math.max(0, isNaN(value) ? 0 : value);
    setStockMap((prev) => ({ ...prev, [artworkId]: safeVal }));
    setHasUnsavedChanges(true);
  };

  // Save all changes
  const handleSaveAll = () => {
    if (onUpdateArtworkStock) {
      Object.entries(stockMap).forEach(([id, qty]) => {
        onUpdateArtworkStock(id, qty);
      });
    }
    setHasUnsavedChanges(false);
    onShowToast('Stock Updated', 'All studio inventory quantities have been saved.', 'success');
  };

  // Filter artworks
  const filteredArtworks = artworks.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.artist.toLowerCase().includes(searchTerm.toLowerCase());

    const stock = stockMap[art.id] ?? 1;
    if (!matchesSearch || (categoryFilter !== 'all' && art.category !== categoryFilter)) return false;

    if (filterType === 'in_stock') return stock > 2;
    if (filterType === 'low_stock') return stock > 0 && stock <= 2;
    if (filterType === 'out_of_stock') return stock === 0;
    return true;
  });

  // Calculate summary counts
  const totalItems = artworks.length;
  const inStockCount = artworks.filter((a) => (stockMap[a.id] ?? 1) > 2).length;
  const lowStockCount = artworks.filter((a) => {
    const s = stockMap[a.id] ?? 1;
    return s > 0 && s <= 2;
  }).length;
  const outOfStockCount = artworks.filter((a) => (stockMap[a.id] ?? 1) === 0).length;

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <p className="text-xs font-normal text-black">In Stock</p>
          <h3 className="text-2xl font-normal text-black mt-1">{inStockCount} Works</h3>
          <p className="text-xs font-normal text-black mt-0.5">&gt; 2 units available</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <p className="text-xs font-normal text-black">Low Stock</p>
          <h3 className="text-2xl font-normal text-black mt-1">{lowStockCount} Works</h3>
          <p className="text-xs font-normal text-black mt-0.5">1-2 units remaining</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <p className="text-xs font-normal text-black">Out of Stock / Sold</p>
          <h3 className="text-2xl font-normal text-black mt-1">{outOfStockCount} Works</h3>
          <p className="text-xs font-normal text-black mt-0.5">0 units available</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search artworks by title, medium, genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-neutral-50/70 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white transition-all text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="stock-category" className="text-xs font-bold text-slate-700">Artwork category</label>
            <select
              id="stock-category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as Artwork['category'] | 'all')}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-slate-700"
            >
              <option value="all">All categories</option>
              {ARTWORK_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All ({totalItems})
            </button>
            <button
              onClick={() => setFilterType('in_stock')}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                filterType === 'in_stock'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              In Stock ({inStockCount})
            </button>
            <button
              onClick={() => setFilterType('low_stock')}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                filterType === 'low_stock'
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterType('out_of_stock')}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                filterType === 'out_of_stock'
                  ? 'bg-slate-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
            {hasUnsavedChanges && (
              <button
                onClick={handleSaveAll}
                className="px-4 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            )}
          </div>
        </div>

        {/* Stock Items List */}
        <div className="divide-y divide-neutral-100">
          {filteredArtworks.map((art) => {
            const stock = stockMap[art.id] ?? 1;
            const isOutOfStock = stock === 0;
            const isLowStock = stock > 0 && stock <= 2;

            return (
              <div
                key={art.id}
                className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-neutral-50/50 p-2.5 rounded-2xl transition-colors"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/80 shadow-2xs">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                        {art.title}
                      </h4>
                      {/* Status Badge */}
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          In Stock
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-500">
                      Category: <span className="text-slate-700 font-medium">{getArtworkCategoryLabel(art.category)}</span>
                      {' · Medium: '}{art.mediumsUsed || 'Not specified'} · Size: {art.size}
                    </p>

                    <p className="text-xs font-bold text-slate-900">
                      ₱{art.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Right: Stock Controls */}
                <div className="flex items-center gap-3 sm:justify-end">
                  {/* Quick Preset Buttons */}
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
                    <button
                      type="button"
                      onClick={() => handleSetExactStock(art.id, 0)}
                      className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
                      title="Set stock to 0 (Mark as Sold Out)"
                    >
                      Sold Out (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetExactStock(art.id, 1)}
                      className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
                      title="Set stock to 1 (Original 1/1)"
                    >
                      Original (1)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockChange(art.id, 5)}
                      className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
                      title="Add 5 prints to inventory"
                    >
                      +5 Prints
                    </button>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center border border-neutral-200 rounded-xl bg-white shadow-2xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleStockChange(art.id, -1)}
                      disabled={stock <= 0}
                      className="p-2.5 text-neutral-500 hover:bg-neutral-100 active:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Decrease Stock"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={stock}
                      onChange={(e) => handleSetExactStock(art.id, parseInt(e.target.value) || 0)}
                      className="w-14 text-center font-bold text-sm text-slate-900 border-x border-neutral-200 py-1.5 focus:outline-none focus:bg-red-50/30"
                    />

                    <button
                      type="button"
                      onClick={() => handleStockChange(art.id, 1)}
                      className="p-2.5 text-neutral-500 hover:bg-neutral-100 active:bg-neutral-200 transition-colors cursor-pointer"
                      aria-label="Increase Stock"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredArtworks.length === 0 && (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <Package className="w-8 h-8 mx-auto text-neutral-300" />
              <p className="font-semibold text-sm text-slate-700">No Artworks Found</p>
              <p className="text-xs text-neutral-400">
                Try adjusting your search terms or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
