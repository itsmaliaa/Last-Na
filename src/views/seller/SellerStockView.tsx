import React, { useEffect, useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Minus,
  Save,
} from 'lucide-react';
import { Artwork } from '../../types';
import { ARTWORK_CATEGORIES, getArtworkCategoryLabel } from '../../utils/artworkCategories';

interface SellerStockViewProps {
  artworks: Artwork[];
  sellerName: string;
  onUpdateArtworkStock?: (artworkId: string, newStock: number) => void;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateToGallery?: () => void;
}

export const SellerStockView: React.FC<SellerStockViewProps> = ({
  artworks,
  sellerName,
  onUpdateArtworkStock,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const sellerArtworks = artworks.filter((artwork) => (
    artwork.artist.toLowerCase() === sellerName.toLowerCase() &&
    artwork.status === 'approved'
  ));

  // Local state for stock quantities per artwork
  const [stockMap, setStockMap] = useState<Record<string, number>>(() => {
    const initialMap: Record<string, number> = {};
    sellerArtworks.forEach((art, idx) => {
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

  useEffect(() => {
    if (hasUnsavedChanges) return;
    setStockMap((previous) => {
      const next = { ...previous };
      sellerArtworks.forEach((artwork, index) => {
        if (typeof artwork.stock === 'number') {
          next[artwork.id] = artwork.stock;
        } else if (artwork.title === 'Abstract Horizons') {
          next[artwork.id] = 0;
        } else if (artwork.title === 'Golden Hour Reflections') {
          next[artwork.id] = 1;
        } else if (artwork.title === 'Clay & Void Study') {
          next[artwork.id] = 2;
        } else {
          next[artwork.id] = (index % 3 === 0) ? 1 : (index % 2 === 0 ? 3 : 5);
        }
      });
      return next;
    });
  }, [artworks, sellerName, hasUnsavedChanges]);

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
      sellerArtworks.forEach((artwork) => {
        const quantity = stockMap[artwork.id];
        if (typeof quantity === 'number') onUpdateArtworkStock(artwork.id, quantity);
      });
    }
    setHasUnsavedChanges(false);
    onShowToast('Stock Updated', 'All studio inventory quantities have been saved.', 'success');
  };

  // Filter artworks
  const filteredArtworks = sellerArtworks.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.artist.toLowerCase().includes(searchTerm.toLowerCase());

    const stock = stockMap[art.id] ?? 1;
    if (!matchesSearch) return false;

    if (filterType === 'in_stock') return stock > 2;
    if (filterType === 'low_stock') return stock > 0 && stock <= 2;
    if (filterType === 'out_of_stock') return stock === 0;
    return true;
  });

  // Calculate summary counts
  const totalItems = sellerArtworks.length;
  const inStockCount = sellerArtworks.filter((a) => (stockMap[a.id] ?? 1) > 2).length;
  const lowStockCount = sellerArtworks.filter((a) => {
    const s = stockMap[a.id] ?? 1;
    return s > 0 && s <= 2;
  }).length;
  const outOfStockCount = sellerArtworks.filter((a) => (stockMap[a.id] ?? 1) === 0).length;
  const totalUnits = sellerArtworks.reduce((sum, artwork) => sum + (stockMap[artwork.id] ?? 0), 0);

  return (
    <div className="space-y-5 text-slate-900">
      <header className="rounded-xl border border-neutral-200 bg-white p-5">
        <h1 className="text-xl font-extrabold tracking-tight">Product Stocks</h1>
        <p className="mt-1 text-sm text-neutral-500">These are the stocks of products in your shop.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'All Products', count: totalItems, hint: 'Products in your shop', filter: 'all' as const },
            { label: 'In Stocks', count: inStockCount, hint: 'More than 2 units available', filter: 'in_stock' as const },
            { label: 'Low Stocks', count: lowStockCount, hint: '1–2 units remaining', filter: 'low_stock' as const },
            { label: 'Out of Stocks', count: outOfStockCount, hint: '0 units available', filter: 'out_of_stock' as const },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setFilterType(item.filter)}
              className={`rounded-xl p-3 text-left transition-colors ${filterType === item.filter ? 'bg-slate-100' : 'hover:bg-neutral-50'}`}
            >
              <span className="block text-xs font-semibold text-slate-600">{item.label}</span>
              <span className="mt-1 block text-2xl font-bold">{item.count}</span>
              <span className="mt-1 block text-[11px] text-neutral-400">{item.hint}</span>
            </button>
          ))}
        </div>
      </header>

      <section className="min-h-[460px] rounded-2xl border border-neutral-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter inventory by stock">
            {[
              ['all', 'All Stocks', totalItems],
              ['in_stock', 'In stocks', inStockCount],
              ['low_stock', 'Low Stocks', lowStockCount],
              ['out_of_stock', 'Out of Stocks', outOfStockCount],
            ].map(([filter, label, count]) => (
              <button key={filter} type="button" onClick={() => setFilterType(filter as typeof filterType)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${filterType === filter ? 'border border-neutral-300 bg-white text-slate-900' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                {label} <span className="ml-1 text-neutral-400">{count}</span>
              </button>
            ))}
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <label className="relative min-w-48 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search products..." className="w-full rounded-full border border-neutral-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-red-400" />
            </label>
            {hasUnsavedChanges && (
              <button type="button" onClick={handleSaveAll} className="inline-flex items-center gap-1.5 rounded-full bg-[#E52535] px-4 py-2 text-xs font-bold text-white hover:bg-red-700">
                <Save className="h-4 w-4" /> Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-neutral-100 px-4 sm:px-6">
          {filteredArtworks.map((artwork) => {
            const stock = stockMap[artwork.id] ?? 1;
            const outOfStock = stock === 0;
            const lowStock = stock > 0 && stock <= 2;
            return (
              <article key={artwork.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <img src={artwork.image} alt={artwork.title} className="h-16 w-16 shrink-0 rounded-xl border border-neutral-200 object-cover" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-extrabold">{artwork.title}</h2>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${outOfStock ? 'border-neutral-200 bg-neutral-100 text-neutral-600' : lowStock ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        {outOfStock ? 'Out of Stock' : lowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      Medium: <span className="capitalize text-slate-700">{getArtworkCategoryLabel(artwork.category)}</span>
                      {' · Size: '}{artwork.size || 'Not specified'}
                    </p>
                    <p className="mt-1 text-xs font-bold">₱{artwork.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="text-xs text-neutral-500 sm:hidden">Available stock</span>
                  <div className="flex items-center overflow-hidden rounded-full border border-neutral-200">
                    <button type="button" aria-label={`Decrease ${artwork.title} stock`} onClick={() => handleStockChange(artwork.id, -1)} disabled={stock <= 0} className="px-3 py-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"><Minus className="h-3.5 w-3.5" /></button>
                    <input aria-label={`${artwork.title} stock quantity`} type="number" min="0" max="999" value={stock} onChange={(event) => handleSetExactStock(artwork.id, Number.parseInt(event.target.value, 10) || 0)} className="w-12 border-x border-neutral-200 py-2 text-center text-sm font-bold outline-none" />
                    <button type="button" aria-label={`Increase ${artwork.title} stock`} onClick={() => handleStockChange(artwork.id, 1)} className="px-3 py-2 text-neutral-500 hover:bg-neutral-100"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </article>
            );
          })}
          {filteredArtworks.length === 0 && (
            <div className="py-14 text-center">
              <Package className="mx-auto h-8 w-8 text-neutral-300" />
              <p className="mt-2 text-sm font-semibold">No products match this filter</p>
              <p className="mt-1 text-xs text-neutral-400">Adjust your search or stock filter and try again.</p>
            </div>
          )}
        </div>
        <p className="border-t border-neutral-100 px-6 py-3 text-xs text-neutral-500">Total inventory: <strong className="text-slate-800">{totalUnits}</strong> units across {totalItems} products</p>
      </section>
    </div>
  );
};
