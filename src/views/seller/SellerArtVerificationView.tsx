import React, { useEffect, useState } from 'react';
import {
  Palette,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  FileCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { Artwork } from '../../types';
import { ARTWORK_CATEGORIES, getArtworkCategoryLabel } from '../../utils/artworkCategories';

type SubmissionStatus = 'Active' | 'Reviewing' | 'Approved' | 'Rejected' | 'Draft';
type VerificationFilter = SubmissionStatus;
type ArtworkCategory = Artwork['category'];

interface SellerArtworkDraft {
  id: string;
  title: string;
  category: ArtworkCategory;
  medium: string;
  dimensions: string;
  price: string;
  description: string;
  image: string;
}

const VERIFICATION_FILTERS: VerificationFilter[] = [
  'Active',
  'Reviewing',
  'Approved',
  'Rejected',
  'Draft',
];

interface SellerArtVerificationViewProps {
  artworks: Artwork[];
  sellerName: string;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
  onSubmitArtwork?: (newArt: Partial<Artwork>) => void;
  onActivateArtwork?: (artworkId: string) => void;
}

export const SellerArtVerificationView: React.FC<SellerArtVerificationViewProps> = ({
  artworks,
  sellerName,
  onShowToast,
  onSubmitArtwork,
  onActivateArtwork,
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [drafts, setDrafts] = useState<SellerArtworkDraft[]>([]);
  const [draftsLoaded, setDraftsLoaded] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ArtworkCategory>('painting');
  const [medium, setMedium] = useState('Oil on Canvas');
  const [dimensions, setDimensions] = useState('80x60 cm');
  const [price, setPrice] = useState('8500');
  const [description, setDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationFilter>('Active');
  const [categoryFilter, setCategoryFilter] = useState<ArtworkCategory | 'all'>('all');

  const sellerArtworks = artworks.filter(
    (artwork) => artwork.artist.toLowerCase() === sellerName.toLowerCase()
  );

  const storageKey = `red-nexus-artwork-drafts-${sellerName.toLowerCase()}`;
  useEffect(() => {
    try {
      const savedDrafts = window.localStorage.getItem(storageKey);
      if (savedDrafts) {
        const parsed: unknown = JSON.parse(savedDrafts);
        if (!Array.isArray(parsed)) throw new Error('Saved product drafts are unreadable.');
        const savedDraftItems = parsed.filter((draft): draft is SellerArtworkDraft => (
          typeof draft === 'object' &&
          draft !== null &&
          'id' in draft &&
          typeof draft.id === 'string' &&
          'title' in draft &&
          typeof draft.title === 'string'
        ));
        setDrafts(savedDraftItems.length > 0 ? savedDraftItems : [{
          id: 'sample-draft-evening-light',
          title: 'Sample Draft: Evening Light Study',
          category: 'painting',
          medium: 'Oil on Canvas',
          dimensions: '50x70 cm',
          price: '6800',
          description: 'Sample saved draft. Edit the details and submit it for admin approval when ready.',
          image: sellerArtworks[0]?.image ?? artworks[0]?.image ?? '',
        }]);
      } else {
        setDrafts([{
          id: 'sample-draft-evening-light',
          title: 'Sample Draft: Evening Light Study',
          category: 'painting',
          medium: 'Oil on Canvas',
          dimensions: '50x70 cm',
          price: '6800',
          description: 'Sample saved draft. Edit the details and submit it for admin approval when ready.',
          image: sellerArtworks[0]?.image ?? artworks[0]?.image ?? '',
        }]);
      }
    } catch (error) {
      onShowToast(
        'Drafts could not be loaded',
        error instanceof Error ? error.message : 'Saved product drafts are unreadable.',
        'error'
      );
    } finally {
      setDraftsLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!draftsLoaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(drafts));
    } catch (error) {
      onShowToast(
        'Drafts could not be saved',
        error instanceof Error ? error.message : 'Unable to save drafts in this browser.',
        'error'
      );
    }
  }, [drafts, draftsLoaded, storageKey]);

  const filteredArtworks = sellerArtworks.filter((artwork) => {
    const matchesStatus = statusFilter === 'Active'
      ? artwork.status === 'approved' && artwork.isActive !== false
      : statusFilter === 'Approved'
        ? artwork.status === 'approved'
        : statusFilter === 'Reviewing'
          ? artwork.status === 'pending'
          : statusFilter === 'Rejected'
            ? artwork.status === 'rejected'
            : false;
    return matchesStatus && (categoryFilter === 'all' || artwork.category === categoryFilter);
  });
  const filteredDrafts = statusFilter === 'Draft'
    ? drafts.filter((draft) => categoryFilter === 'all' || draft.category === categoryFilter)
    : [];
  const submissionCounts: Record<VerificationFilter, number> = {
    Active: sellerArtworks.filter((artwork) => artwork.status === 'approved' && artwork.isActive !== false).length,
    Approved: sellerArtworks.filter((artwork) => artwork.status === 'approved').length,
    Reviewing: sellerArtworks.filter((artwork) => artwork.status === 'pending').length,
    Rejected: sellerArtworks.filter((artwork) => artwork.status === 'rejected').length,
    Draft: drafts.length,
  };

  const openDraftForm = (draft?: SellerArtworkDraft) => {
    setEditingDraftId(draft?.id ?? null);
    setTitle(draft?.title ?? '');
    setCategory(draft?.category ?? 'painting');
    setMedium(draft?.medium ?? 'Oil on Canvas');
    setDimensions(draft?.dimensions ?? '80x60 cm');
    setPrice(draft?.price ?? '8500');
    setDescription(draft?.description ?? '');
    setImageUrl(draft?.image ?? '');
    setShowSubmitModal(true);
  };

  const [imageUrl, setImageUrl] = useState('');

  const getDraftFromForm = (): SellerArtworkDraft => ({
    id: editingDraftId ?? `draft-${Date.now()}`,
    title: title.trim(),
    category,
    medium: medium.trim(),
    dimensions: dimensions.trim(),
    price,
    description: description.trim(),
    image: imageUrl.trim(),
  });

  const handleSaveDraft = () => {
    if (!title.trim()) {
      onShowToast('Product title required', 'Enter a title before saving this draft.', 'error');
      return;
    }
    const draft = getDraftFromForm();
    setDrafts((previous) => editingDraftId
      ? previous.map((item) => item.id === editingDraftId ? draft : item)
      : [draft, ...previous]);
    setStatusFilter('Draft');
    setShowSubmitModal(false);
    onShowToast('Draft saved', `"${draft.title}" is saved for later.`, 'success');
  };

  const downloadImportTemplate = () => {
    const csv = [
      'title,category,medium,dimensions,price,description,image_url',
      'Sample Artwork,painting,Oil on Canvas,50x70 cm,6800,Sample product description,https://example.com/artwork.jpg',
    ].join('\n');
    const link = document.createElement('a');
    const templateUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.href = templateUrl;
    link.download = 'seller-product-import-template.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(templateUrl), 1000);
    onShowToast(
      'Import template downloaded',
      'Category values: painting, sculpture, architecture, digital, photography, print, or mixed_media.',
      'success'
    );
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>, draft?: SellerArtworkDraft) => {
    e?.preventDefault();
    const product = draft ?? getDraftFromForm();
    const productPrice = Number(product.price);
    if (!product.title.trim() || !product.image.trim() || !Number.isFinite(productPrice) || productPrice <= 0) {
      onShowToast('Product details required', 'Enter a title, artwork image URL, and valid price before submitting for approval.', 'error');
      return;
    }

    onSubmitArtwork?.({
      title: product.title.trim(),
      image: product.image.trim(),
      price: productPrice,
      category: product.category,
      size: product.dimensions,
      mediumsUsed: product.medium,
      description: product.description,
    });
    setDrafts((previous) => previous.filter((item) => item.id !== product.id));
    setStatusFilter('Reviewing');
    setShowSubmitModal(false);
    setTitle('');
    setDescription('');
    setImageUrl('');
    if (!draft) onShowToast('Artwork Submitted', `"${product.title}" has been submitted for admin approval.`, 'success');
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={downloadImportTemplate}
            className="rounded-full border border-neutral-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-neutral-50"
          >
            Download import template
          </button>
          <button
            onClick={() => openDraftForm()}
            className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Work for Review</span>
          </button>
        </div>
      </div>

      {/* Verification Status List */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Your Submissions Queue</h3>
          <span className="text-xs text-neutral-500">{sellerArtworks.length + drafts.length} products</span>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-neutral-100 px-6 py-4" role="group" aria-label="Filter products by verification status">
          {VERIFICATION_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={statusFilter === filter}
              onClick={() => setStatusFilter(filter)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                statusFilter === filter
                  ? 'bg-[#8e1b24] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {filter}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                statusFilter === filter ? 'bg-white/20 text-white' : 'bg-white text-neutral-600'
              }`}>
                {submissionCounts[filter]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-b border-neutral-100 px-6 py-4 sm:flex-row sm:items-center">
          <label htmlFor="seller-product-category" className="text-xs font-bold text-slate-700">Artwork category</label>
          <select
            id="seller-product-category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as ArtworkCategory | 'all')}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-slate-700"
          >
            <option value="all">All categories</option>
            {ARTWORK_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        {filteredArtworks.length > 0 || filteredDrafts.length > 0 ? (
          <div className="divide-y divide-neutral-100">
          {filteredArtworks.map((artwork) => (
            <div key={artwork.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <img src={artwork.image} alt={artwork.title} className="h-20 w-20 rounded-xl bg-neutral-100 object-cover" />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-slate-900">{artwork.title}</h4>
                <p className="mt-1 text-xs text-neutral-500">
                  <span className="font-semibold text-slate-700">{getArtworkCategoryLabel(artwork.category)}</span>
                  {' · '}{artwork.mediumsUsed || 'Medium not set'} · {artwork.size} · ₱{artwork.price.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {statusFilter === 'Active'
                    ? 'Published in your product list.'
                    : statusFilter === 'Approved'
                    ? artwork.isActive === false
                      ? 'Approved by admin. Activate it to publish in your product list.'
                      : 'Approved by admin and already posted in your active product list.'
                    : statusFilter === 'Reviewing'
                    ? 'Submitted and awaiting admin approval.'
                    : 'Rejected by admin. Review the feedback before submitting again.'}
                </p>
                {statusFilter === 'Rejected' && artwork.reviewNotes && (
                  <p className="mt-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                    <strong>Admin feedback:</strong> {artwork.reviewNotes}
                  </p>
                )}
              </div>
              {statusFilter === 'Approved' && artwork.isActive === false && (
                <button
                  type="button"
                  onClick={() => onActivateArtwork?.(artwork.id)}
                  className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  Publish to active products
                </button>
              )}
            </div>
          ))}
          {filteredDrafts.map((draft) => (
            <div key={draft.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              {draft.image ? (
                <img src={draft.image} alt={draft.title} className="h-20 w-20 rounded-xl bg-neutral-100 object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-slate-900">{draft.title}</h4>
                <p className="mt-1 text-xs text-neutral-500">
                  <span className="font-semibold text-slate-700">{getArtworkCategoryLabel(draft.category)}</span>
                  {' · Draft · '}{draft.medium || 'Medium not set'} · {draft.dimensions || 'Dimensions not set'}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openDraftForm(draft)} className="rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-neutral-50">
                  Edit draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSubmit(undefined, draft);
                  }}
                  className="rounded-xl bg-[#DC2626] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#B91C1C]"
                >
                  Submit for approval
                </button>
                <button type="button" onClick={() => setDrafts((previous) => previous.filter((item) => item.id !== draft.id))} className="rounded-xl border border-red-100 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <FileCheck className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">No {statusFilter.toLowerCase()} products</p>
            <p className="mt-1 text-xs text-neutral-500">
              Products in this category will appear here when their status changes.
            </p>
          </div>
        )}
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
                    onChange={(e) => setCategory(e.target.value as ArtworkCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none"
                  >
                    {ARTWORK_CATEGORIES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Artwork image URL *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/artwork.jpg"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-red-500"
                />
                <p className="mt-1 text-[11px] text-neutral-500">Required to submit for approval; drafts can be saved without an image.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-neutral-50"
                >
                  Save draft
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                >
                  Submit for admin approval
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
