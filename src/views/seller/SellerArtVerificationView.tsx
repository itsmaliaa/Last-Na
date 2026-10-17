import React, { useState } from 'react';
import {
  Palette,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  FileCheck,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { Artwork } from '../../types';

interface SellerArtVerificationViewProps {
  artworks: Artwork[];
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
  onSubmitArtwork?: (newArt: Partial<Artwork>) => void;
}

export const SellerArtVerificationView: React.FC<SellerArtVerificationViewProps> = ({
  artworks,
  onShowToast,
  onSubmitArtwork,
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'painting' | 'sculpture' | 'architecture' | 'digital' | 'photography'>('painting');
  const [medium, setMedium] = useState('Oil on Canvas');
  const [dimensions, setDimensions] = useState('80x60 cm');
  const [price, setPrice] = useState('8500');
  const [description, setDescription] = useState('');

  // Sample submission list for student artist Malia
  const [submissions, setSubmissions] = useState([
    {
      id: 'sub-1',
      title: 'Abstract Horizons',
      medium: 'Oil on Primed Belgian Canvas',
      date: 'Aug 25, 2026',
      status: 'Verified',
      reviewer: 'Prof. Chen (Dean of Painting)',
      notes: 'Approved for official 2026 Class of 2026 exhibition. Authentic technique.',
    },
    {
      id: 'sub-2',
      title: 'Solitude in Red',
      medium: 'Acrylic & Mixed Pigment',
      date: 'Sep 02, 2026',
      status: 'Pending',
      reviewer: 'Faculty Curatorial Board',
      notes: 'Under review for pigment safety and Academy certification.',
    },
    {
      id: 'sub-3',
      title: 'Neon Echoes Maquette',
      medium: 'Laser-Cut Acrylic & LED',
      date: 'Aug 10, 2026',
      status: 'Needs Revision',
      reviewer: 'Sculpture Dept. Committee',
      notes: 'Please attach detailed electrical certificate for embedded lighting.',
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast('Missing Title', 'Please enter artwork title.', 'error');
      return;
    }

    const newSub = {
      id: `sub-${Date.now()}`,
      title,
      medium,
      date: 'Today',
      status: 'Pending',
      reviewer: 'Faculty Curatorial Board',
      notes: 'Submitted for verification. Expected review within 24-48 hours.',
    };

    setSubmissions([newSub, ...submissions]);
    setShowSubmitModal(false);
    setTitle('');
    setDescription('');
    onShowToast('Artwork Submitted', `"${title}" has been submitted for CAFA faculty review.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Submit CTA */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Palette className="w-4 h-4" />
            <span>Faculty Verification Gateway</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Product Verification
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Every piece on Red Nexus is reviewed by faculty to guarantee 100% genuine student craftsmanship.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Work for Review</span>
        </button>
      </div>

      {/* Verification Status List */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Your Submissions Queue</h3>
          <span className="text-xs text-neutral-500">{submissions.length} submissions</span>
        </div>

        <div className="divide-y divide-neutral-100">
          {submissions.map((sub) => (
            <div key={sub.id} className="p-6 hover:bg-neutral-50/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{sub.title}</h4>
                    {sub.status === 'Verified' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {sub.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Pending Review
                      </span>
                    )}
                    {sub.status === 'Needs Revision' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        Needs Revision
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">Medium: {sub.medium} · Submitted on {sub.date}</p>
                </div>

                <div className="text-xs sm:text-right">
                  <p className="text-neutral-500">Reviewer: <span className="font-medium text-slate-700">{sub.reviewer}</span></p>
                </div>
              </div>

              {/* Review notes */}
              <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs text-slate-700">
                <span className="font-bold text-slate-900 mr-1.5">Faculty Feedback:</span>
                {sub.notes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-extrabold text-lg text-slate-900">Submit Artwork for CAFA Review</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Artwork Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawn over Pasig River"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none"
                  >
                    <option value="painting">Painting</option>
                    <option value="sculpture">Sculpture</option>
                    <option value="architecture">Architecture</option>
                    <option value="photography">Photography</option>
                    <option value="digital">Digital Art</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₱) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mediums Used</label>
                  <input
                    type="text"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    placeholder="e.g. Oil on Canvas"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. 60x80 cm"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Artist Statement / Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your creative process, inspiration, and student studio background..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-neutral-200 rounded-2xl text-center space-y-1 bg-neutral-50/50">
                <Upload className="w-6 h-6 text-neutral-400 mx-auto" />
                <p className="font-semibold text-slate-700">Drop high-res artwork photos or certificate</p>
                <p className="text-[11px] text-neutral-400">JPG, PNG up to 25MB · Color calibrated</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                >
                  Confirm & Submit to Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl font-semibold text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
