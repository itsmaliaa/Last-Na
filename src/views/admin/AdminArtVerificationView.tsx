import React, { useState } from 'react';
import {
  Search,
  ArrowUpDown,
  Eye,
  Check,
  X,
  Palette,
  CheckCircle,
} from 'lucide-react';
import { Artwork } from '../../types';

interface AdminArtVerificationViewProps {
  artworks: Artwork[];
  onVerifyArtwork: (id: string) => void;
  onRejectArtwork: (id: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminArtVerificationView: React.FC<AdminArtVerificationViewProps> = ({
  artworks,
  onVerifyArtwork,
  onRejectArtwork,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'rejected' | 'approved' | 'all'>('pending');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const filteredArtworks = artworks.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.artist.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleVerify = (artwork: Artwork) => {
    onVerifyArtwork(artwork.id);
    setSelectedArtwork(null);
    onShowToast('Artwork Verified', `"${artwork.title}" has been verified and published to the marketplace.`, 'success');
  };

  const handleReject = (artwork: Artwork) => {
    onRejectArtwork(artwork.id);
    setSelectedArtwork(null);
    onShowToast('Artwork Rejected', `"${artwork.title}" was rejected with feedback sent to student.`, 'error');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar (Exact match to Art Verification.png) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search artworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 text-xs bg-neutral-50/80 border border-neutral-200 rounded-full focus:bg-white focus:outline-none focus:border-red-400"
            />
          </div>
        </div>

        {/* Right Status Count, Filter Pills & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-4 shrink-0 text-xs">
          <span className="text-neutral-500 font-medium">Status: 29</span>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                statusFilter === 'rejected'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                statusFilter === 'approved'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
          </div>

          {/* Sort Dropdown button */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 bg-white font-medium cursor-pointer">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span>Newest First</span>
          </div>
        </div>
      </div>

      {/* Artworks Verification Grid (Exact match to Art Verification.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredArtworks.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl overflow-hidden border border-neutral-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Top image preview */}
            <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-100/90 backdrop-blur-xs text-amber-800 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                {item.status.toUpperCase()}
              </span>
            </div>

            {/* Artwork Card Info */}
            <div className="p-5 space-y-3">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">By {item.artist}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-neutral-500">Size: {item.size}</span>
                <span className="text-sm font-extrabold text-[#E52535]">
                  ₱{item.price.toLocaleString()}
                </span>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => setSelectedArtwork(item)}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-neutral-200/80 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-red-600" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Artwork Information Modal (Exact match to Art Verification-1.png) */}
      {selectedArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Artwork Information</h3>
              </div>
              <button
                onClick={() => setSelectedArtwork(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Full Width Image Preview */}
              <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-neutral-900 shadow-md">
                <img
                  src={selectedArtwork.image}
                  alt={selectedArtwork.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-100/90 backdrop-blur-xs text-amber-900 font-extrabold text-xs tracking-wider">
                  {selectedArtwork.status.toUpperCase()}
                </span>
              </div>

              {/* Two Column Details Grid (Exact match to Art Verification-1.png) */}
              <div className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-neutral-500 font-medium">Name</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedArtwork.artist}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 font-medium">School Number</span>
                    <p className="font-bold text-slate-900 font-mono text-sm">
                      {selectedArtwork.schoolNumber || '2000000000'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-500 font-medium">Course</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedArtwork.course || 'Bachelor of Fine Arts in Visual Communication'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-neutral-500 font-medium">Title</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedArtwork.title}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 font-medium">Genre</span>
                    <p className="font-bold text-slate-900 text-sm">
                      {selectedArtwork.genre || 'Environmental Art'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-neutral-500 font-medium">Size</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedArtwork.size}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 font-medium">Price</span>
                    <p className="font-extrabold text-base text-[#E52535]">
                      ₱{selectedArtwork.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Color Used Chips */}
                <div>
                  <span className="text-[11px] text-neutral-500 font-medium">Color Used</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {(selectedArtwork.colors || ['Forest Green', 'Earthy Brown', 'Ash Gray', 'Smoky White']).map(
                      (col, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white border border-neutral-200 rounded-full text-slate-800 font-semibold text-[11px]"
                        >
                          {col}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <span className="text-[11px] text-neutral-500 font-medium">Description</span>
                  <p className="text-neutral-700 leading-relaxed mt-1">
                    {selectedArtwork.description ||
                      'A sobering reflection on forestry clearance juxtaposed with untouched woodland.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-neutral-500 font-medium">Features</span>
                    <p className="font-bold text-slate-900">
                      {selectedArtwork.features || 'Textured brushwork'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 font-medium">Mediums Used</span>
                    <p className="font-bold text-slate-900">
                      {selectedArtwork.mediumsUsed || 'Acrylic on Canvas'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-500 font-medium">Posted</span>
                  <p className="font-bold text-slate-900">
                    {selectedArtwork.postedDate || 'August 30, 2026'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Reject Artwork, Verify Artwork, Close (Exact match to Art Verification-1.png) */}
            <div className="p-5 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-end gap-3">
              <button
                onClick={() => handleReject(selectedArtwork)}
                className="px-5 py-2.5 rounded-xl bg-[#A8383B] hover:bg-red-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Reject Artwork
              </button>
              <button
                onClick={() => handleVerify(selectedArtwork)}
                className="px-5 py-2.5 rounded-xl bg-[#44A08D] hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Verify Artwork</span>
              </button>
              <button
                onClick={() => setSelectedArtwork(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
