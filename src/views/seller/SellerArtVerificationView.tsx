import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  FileCheck,
  Image as ImageIcon,
  Upload,
  Film,
} from 'lucide-react';
import { Artwork, ArtworkOptionGroup } from '../../types';
import { ARTWORK_CATEGORIES, getArtworkCategoryLabel } from '../../utils/artworkCategories';
import { ARTWORK_STYLE_SUGGESTIONS, ARTWORK_TYPE_SUGGESTIONS } from '../../utils/artworkTaxonomy';

type SubmissionStatus = 'Active' | 'Reviewing' | 'Approved' | 'Rejected' | 'Draft';
type VerificationFilter = SubmissionStatus;
type ArtworkCategory = Artwork['category'];

interface SellerArtworkDraft {
  id: string;
  title: string;
  category: ArtworkCategory;
  genre?: string;
  style?: string;
  medium: string;
  dimensions: string;
  price: string;
  description: string;
  image: string;
  video?: string;
  productType: NonNullable<Artwork['productType']>;
  fulfillmentType: NonNullable<Artwork['fulfillmentType']>;
  weightKg: string;
  stock: string;
  designOptions: string[] | string;
  sizeOptions: string[] | string;
  colorOptions: string[];
  optionGroups?: ArtworkOptionGroup[];
  availablePayments: Artwork['availablePayments'];
  paymentMethodsVersion?: 1;
}

const normalizePaymentMethods = (
  value: unknown,
  migrateLegacy = false,
  fallbackToAll = true
): NonNullable<Artwork['availablePayments']> => {
  const methods = Array.isArray(value)
    ? value.filter((method): method is NonNullable<Artwork['availablePayments']>[number] => (
      method === 'Maya' || method === 'GCash'
    ))
    : [];
  if (methods.length === 0) return fallbackToAll ? ['Maya', 'GCash'] : [];
  if (migrateLegacy && methods.includes('GCash') && !methods.includes('Maya')) {
    return ['Maya', 'GCash'];
  }
  return methods;
};

const VERIFICATION_FILTERS: VerificationFilter[] = [
  'Active',
  'Reviewing',
  'Approved',
  'Rejected',
  'Draft',
];

const createDefaultOptionGroups = (): ArtworkOptionGroup[] => [
  { id: 'color', name: 'Color', options: [''] },
  { id: 'size', name: 'Size', options: [''] },
  { id: 'design', name: 'Design', options: [''] },
];

const createOptionGroupsFromDraft = (draft: SellerArtworkDraft): ArtworkOptionGroup[] => {
  if (draft.optionGroups?.length) return draft.optionGroups;
  const groups = createDefaultOptionGroups();
  groups[0].options = draft.colorOptions.length ? draft.colorOptions : [''];
  groups[1].options = normalizeLegacyOptions(draft.sizeOptions);
  groups[2].options = normalizeLegacyOptions(draft.designOptions);
  return groups;
};

const normalizeLegacyOptions = (options: string[] | string): string[] => (
  Array.isArray(options) ? options : options.split(',')
).map((option) => option.trim()).filter(Boolean).length
  ? (Array.isArray(options) ? options : options.split(',')).map((option) => option.trim()).filter(Boolean)
  : [''];

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
  const [showSubmitPage, setShowSubmitPage] = useState(false);
  const [drafts, setDrafts] = useState<SellerArtworkDraft[]>([]);
  const [draftsLoaded, setDraftsLoaded] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ArtworkCategory>('painting');
  const [artType, setArtType] = useState('');
  const [artStyle, setArtStyle] = useState('');
  const [medium, setMedium] = useState('Oil on Canvas');
  const [dimensions, setDimensions] = useState('80x60 cm');
  const [price, setPrice] = useState('8500');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState<NonNullable<Artwork['productType']>>('pre_made');
  const [fulfillmentType, setFulfillmentType] = useState<NonNullable<Artwork['fulfillmentType']>>('physical');
  const [weightKg, setWeightKg] = useState('');
  const [designOptions, setDesignOptions] = useState<string[]>(['']);
  const [sizeOptions, setSizeOptions] = useState<string[]>(['']);
  const [colorOptions, setColorOptions] = useState<string[]>(['']);
  const [optionGroups, setOptionGroups] = useState<ArtworkOptionGroup[]>(createDefaultOptionGroups);
  const [stock, setStock] = useState('1');
  const [availablePayments, setAvailablePayments] = useState<NonNullable<Artwork['availablePayments']>>(['Maya', 'GCash']);
  const [video, setVideo] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [mediaError, setMediaError] = useState('');
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
        setDrafts(savedDraftItems.length > 0 ? savedDraftItems.map((draft) => ({
          ...draft,
          genre: draft.genre ?? '',
          style: draft.style ?? '',
          productType: draft.productType ?? 'pre_made',
          fulfillmentType: draft.fulfillmentType ?? 'physical',
          weightKg: draft.weightKg ?? '',
          stock: draft.stock ?? '1',
          designOptions: draft.designOptions ?? [''],
          sizeOptions: draft.sizeOptions ?? [''],
          colorOptions: Array.isArray(draft.colorOptions) ? draft.colorOptions : [''],
          optionGroups: createOptionGroupsFromDraft(draft),
          availablePayments: normalizePaymentMethods(draft.availablePayments, draft.paymentMethodsVersion !== 1),
          paymentMethodsVersion: 1,
        })) : [{
          id: 'sample-draft-evening-light',
          title: 'Sample Draft: Evening Light Study',
          category: 'painting',
          medium: 'Oil on Canvas',
          dimensions: '50x70 cm',
          price: '6800',
          description: 'Sample saved draft. Edit the details and submit it for admin approval when ready.',
          image: '',
          video: '',
          productType: 'pre_made',
          fulfillmentType: 'physical',
          weightKg: '',
          stock: '1',
          designOptions: [''],
          sizeOptions: [''],
          colorOptions: [''],
          availablePayments: ['Maya', 'GCash'],
          paymentMethodsVersion: 1,
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
          image: '',
          video: '',
          productType: 'pre_made',
          fulfillmentType: 'physical',
          weightKg: '',
          stock: '1',
          designOptions: [''],
          sizeOptions: [''],
          colorOptions: [''],
          availablePayments: ['Maya', 'GCash'],
          paymentMethodsVersion: 1,
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
    setArtType(draft?.genre ?? '');
    setArtStyle(draft?.style ?? '');
    setMedium(draft?.medium ?? 'Oil on Canvas');
    setDimensions(draft?.dimensions ?? '80x60 cm');
    setPrice(draft?.price ?? '8500');
    setDescription(draft?.description ?? '');
    setImageUrl(draft?.image ?? '');
    setVideo(draft?.video ?? '');
    setImageFileName(draft?.image?.startsWith('data:') ? 'Uploaded artwork image' : '');
    setVideoFileName(draft?.video?.startsWith('data:') ? 'Uploaded artwork video' : '');
    setMediaError('');
    setProductType(draft?.productType ?? 'pre_made');
    setFulfillmentType(draft?.fulfillmentType ?? 'physical');
    setWeightKg(draft?.weightKg ?? '');
    setDesignOptions(normalizeOptions(draft?.designOptions));
    setSizeOptions(normalizeOptions(draft?.sizeOptions));
    setColorOptions(draft?.colorOptions ?? ['']);
    setOptionGroups(draft ? createOptionGroupsFromDraft(draft) : createDefaultOptionGroups());
    setStock(draft?.stock ?? '1');
    setAvailablePayments(normalizePaymentMethods(draft?.availablePayments, draft?.paymentMethodsVersion !== 1));
    setShowSubmitPage(true);
  };

  const [imageUrl, setImageUrl] = useState('');

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('The selected file could not be read.'));
    };
    reader.onerror = () => reject(new Error('The selected file could not be read.'));
    reader.readAsDataURL(file);
  });

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMediaError('Select a valid image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMediaError('Choose an image smaller than 8 MB.');
      return;
    }
    try {
      const source = await readFileAsDataUrl(file);
      const image = new Image();
      image.src = source;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('The selected image could not be opened.'));
      });
      const scale = Math.min(1, 1600 / image.width, 1600 / image.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image processing is not available in this browser.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressedImage = canvas.toDataURL('image/jpeg', 0.78);
      if (compressedImage.length > 2_000_000) {
        throw new Error('This image is still too large to save. Choose a smaller image.');
      }
      setImageUrl(compressedImage);
      setImageFileName(file.name);
      setMediaError('');
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'The image could not be imported.');
    }
  };

  const handleVideoUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setMediaError('Select a valid video file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMediaError('Choose a video smaller than 2 MB so it can be saved with your draft.');
      return;
    }
    try {
      setVideo(await readFileAsDataUrl(file));
      setVideoFileName(file.name);
      setMediaError('');
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'The video could not be imported.');
    }
  };

  const handleOptionImageUpload = async (groupId: string, option: string, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMediaError('Select an image file for this color option.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setMediaError('Choose a color image smaller than 3 MB.');
      return;
    }
    try {
      const source = await readFileAsDataUrl(file);
      const image = new Image();
      image.src = source;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('The selected color image could not be opened.'));
      });
      const scale = Math.min(1, 800 / image.width, 800 / image.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image processing is not available in this browser.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressedImage = canvas.toDataURL('image/jpeg', 0.68);
      if (compressedImage.length > 500_000) {
        throw new Error('This color image is too large to save. Choose a smaller image.');
      }
      setOptionGroups((previous) => previous.map((group) => (
        group.id === groupId
          ? { ...group, optionImages: { ...group.optionImages, [option]: compressedImage } }
          : group
      )));
      setMediaError('');
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'The color image could not be imported.');
    }
  };

  const normalizeOptions = (options?: string[] | string) => {
    if (Array.isArray(options)) return options.length > 0 ? options : [''];
    return options ? options.split(',').map((option) => option.trim()) : [''];
  };

  const getDraftFromForm = (): SellerArtworkDraft => ({
    id: editingDraftId ?? `draft-${Date.now()}`,
    title: title.trim(),
    category,
    genre: artType.trim(),
    style: artStyle.trim(),
    medium: medium.trim(),
    dimensions: dimensions.trim(),
    price,
    description: description.trim(),
    image: imageUrl.trim(),
    video,
    productType,
    fulfillmentType: productType === 'digital' ? 'digital' : fulfillmentType,
    weightKg,
    designOptions,
    sizeOptions,
    colorOptions,
    optionGroups,
    stock,
    availablePayments,
    paymentMethodsVersion: 1,
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
    setShowSubmitPage(false);
    onShowToast('Draft saved', `"${draft.title}" is saved for later.`, 'success');
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>, draft?: SellerArtworkDraft) => {
    e?.preventDefault();
    const product = draft ?? getDraftFromForm();
    const productPrice = Number(product.price);
    const productWeight = Number(product.weightKg);
    const productStock = Number(product.stock);
    const needsWeight = product.productType !== 'digital' && product.fulfillmentType === 'physical';
    const eligiblePayments = normalizePaymentMethods(product.availablePayments, false, false);
    const submittedOptionGroups = (product.optionGroups ?? createDefaultOptionGroups())
      .map((group) => ({
        ...group,
        name: group.name.trim(),
        options: group.options.map((option) => option.trim()).filter(Boolean),
      }))
      .filter((group) => group.name && group.options.length > 0);
    const optionGroupNames = submittedOptionGroups.map((group) => group.name.toLowerCase());
    if (
      !product.title.trim() ||
      !product.image.trim() ||
      !Number.isFinite(productPrice) ||
      productPrice <= 0 ||
      !Number.isInteger(productStock) ||
      productStock < 0 ||
      productStock > 999 ||
      product.stock.trim() === '' ||
      eligiblePayments.length === 0 ||
      new Set(optionGroupNames).size !== optionGroupNames.length ||
      (needsWeight && (!Number.isFinite(productWeight) || productWeight <= 0))
    ) {
      onShowToast(
        'Product details required',
        'Enter a title, import an artwork image, provide valid price and stock, select at least one payment method, use unique option group names, and add product weight for physical items.',
        'error'
      );
      return;
    }

    onSubmitArtwork?.({
      title: product.title.trim(),
      image: product.image.trim(),
      video: product.video || undefined,
      price: productPrice,
      category: product.category,
      genre: product.genre?.trim() || undefined,
      style: product.style?.trim() || undefined,
      size: product.dimensions,
      mediumsUsed: product.medium,
      description: product.description,
      productType: product.productType,
      fulfillmentType: product.productType === 'digital' ? 'digital' : product.fulfillmentType,
      weightKg: Number(product.weightKg) || undefined,
      stock: Number(product.stock),
      designOptions: normalizeOptions(product.designOptions).map((option) => option.trim()).filter(Boolean),
      sizeOptions: normalizeOptions(product.sizeOptions).map((option) => option.trim()).filter(Boolean),
      colorOptions: product.colorOptions.map((option) => option.trim()).filter(Boolean),
      colors: product.colorOptions.map((option) => option.trim()).filter(Boolean),
      optionGroups: submittedOptionGroups,
      availablePayments: eligiblePayments,
    });
    setDrafts((previous) => previous.filter((item) => item.id !== product.id));
    setStatusFilter('Reviewing');
    setShowSubmitPage(false);
    setTitle('');
    setArtType('');
    setArtStyle('');
    setDescription('');
    setImageUrl('');
    setVideo('');
    setImageFileName('');
    setVideoFileName('');
    setMediaError('');
    if (!draft) onShowToast('Artwork Submitted', `"${product.title}" has been submitted for admin approval.`, 'success');
  };

  return (
    <div className="space-y-6">
      {!showSubmitPage && (
        <>
      {/* Product verification heading and creation action */}
      <div className="bg-[#FFFFFF] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Product Verification
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Create a product and submit it for faculty review.
          </p>
        </div>

        <button
          onClick={() => openDraftForm()}
          className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Product</span>
        </button>
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
                  {artwork.genre && ` · ${artwork.genre}`}
                  {artwork.style && ` · ${artwork.style}`}
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
                  {draft.genre && ` · ${draft.genre}`}
                  {draft.style && ` · ${draft.style}`}
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
        </>
      )}

      {showSubmitPage && (
        <section className="mx-auto w-full max-w-5xl space-y-5">
          <div>
            <button
              type="button"
              onClick={() => setShowSubmitPage(false)}
              className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-neutral-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Product Verification
            </button>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Submit Artwork for CAFA Review
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Add your artwork details and submit them for faculty review.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs sm:p-8">
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Artwork category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ArtworkCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                  >
                    {ARTWORK_CATEGORIES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Product type *</label>
                  <select
                    value={productType}
                    onChange={(event) => {
                      const nextType = event.target.value as NonNullable<Artwork['productType']>;
                      setProductType(nextType);
                      if (nextType === 'digital') setFulfillmentType('digital');
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                  >
                    <option value="pre_made">Pre-made</option>
                    <option value="digital">Digital art</option>
                    <option value="custom_made">Custom-made</option>
                  </select>
                </div>
              </div>

              <section className="space-y-3 rounded-xl border border-neutral-200 p-3">
                <div>
                  <h3 className="font-bold text-slate-700">Artwork classification</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
                    Choose an art type and style from any program, or enter your own. Your academic program does not limit what you can create or sell.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Art type
                    <input
                      type="text"
                      list="seller-art-type-suggestions"
                      value={artType}
                      onChange={(event) => setArtType(event.target.value)}
                      placeholder="Choose or enter an art type"
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal"
                    />
                    <datalist id="seller-art-type-suggestions">
                      {ARTWORK_TYPE_SUGGESTIONS.map((suggestion) => <option key={suggestion} value={suggestion} />)}
                    </datalist>
                  </label>
                  <label className="block text-xs font-bold text-slate-700">
                    Art style
                    <input
                      type="text"
                      list="seller-art-style-suggestions"
                      value={artStyle}
                      onChange={(event) => setArtStyle(event.target.value)}
                      placeholder="Choose or enter an art style"
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal"
                    />
                    <datalist id="seller-art-style-suggestions">
                      {ARTWORK_STYLE_SUGGESTIONS.map((suggestion) => <option key={suggestion} value={suggestion} />)}
                    </datalist>
                  </label>
                </div>
              </section>

              {productType !== 'digital' && (
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Fulfillment *</label>
                  <select
                    value={fulfillmentType}
                    onChange={(event) => {
                      const nextType = event.target.value as NonNullable<Artwork['fulfillmentType']>;
                      setFulfillmentType(nextType);
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                  >
                    <option value="physical">Physical product</option>
                    <option value="digital">Digital delivery</option>
                  </select>
                </div>
              )}

              <fieldset className="space-y-2 rounded-xl border border-neutral-200 p-3">
                <legend className="px-1 font-bold text-slate-700">Payment methods allowed *</legend>
                {(['Maya', 'GCash'] as const).map((method) => {
                  const label = method;
                  const checked = availablePayments.includes(method);
                  return (
                    <label key={method} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          setAvailablePayments((previous) => event.target.checked
                            ? [...previous, method]
                            : previous.filter((payment) => payment !== method));
                        }}
                      />
                      {label}
                    </label>
                  );
                })}
                <p className="text-[11px] leading-relaxed text-neutral-500">
                  Choose the online wallets customers can use for this product. Maya and GCash are available for every product type.
                </p>
              </fieldset>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    Selling price (₱) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                    Required: include an additional 10% in this price to cover the system commission.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    Stock quantity *
                  </label>
                  <input type="number" min="0" max="999" step="1" required value={stock} onChange={(event) => setStock(event.target.value)} className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
                  <p className="mt-1 text-[11px] text-neutral-500">You can edit this later in Stock Inventory.</p>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Weight (kg) {productType !== 'digital' && fulfillmentType === 'physical' ? '*' : ''}</label>
                  <input type="number" min="0.01" step="0.01" required={productType !== 'digital' && fulfillmentType === 'physical'} value={weightKg} onChange={(event) => setWeightKg(event.target.value)} className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
                </div>
              </div>

              <section className="space-y-3 rounded-xl border border-neutral-200 p-3">
                <div>
                  <h4 className="font-bold text-slate-700">Customer-selectable options</h4>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Add option groups such as color, size, material, finish, or framing. Customers choose one value from each group.
                  </p>
                </div>
                {optionGroups.map((group) => (
                  <fieldset key={group.id} className="space-y-2 rounded-xl border border-neutral-200 p-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor={`option-group-name-${group.id}`} className="sr-only">Option group name</label>
                      <input
                        id={`option-group-name-${group.id}`}
                        type="text"
                        value={group.name}
                        onChange={(event) => setOptionGroups((previous) => previous.map((item) => item.id === group.id ? { ...item, name: event.target.value } : item))}
                        placeholder="Option group name, e.g. Material"
                        className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold"
                      />
                      {optionGroups.length > 1 && (
                        <button type="button" onClick={() => setOptionGroups((previous) => previous.filter((item) => item.id !== group.id))} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-neutral-50">
                          Remove group
                        </button>
                      )}
                    </div>
                    {group.options.map((value, index) => (
                      <div key={`${group.id}-option-${index}`} className="space-y-2 rounded-lg bg-neutral-50 p-2">
                        <div className="flex items-center gap-2">
                          <label className="sr-only" htmlFor={`${group.id}-option-${index}`}>{group.name || 'Option'} value {index + 1}</label>
                          <input
                            id={`${group.id}-option-${index}`}
                            type="text"
                            value={value}
                            onChange={(event) => {
                              const nextValue = event.target.value;
                              setOptionGroups((previous) => previous.map((item) => {
                                if (item.id !== group.id) return item;
                                const optionImages = { ...item.optionImages };
                                if (value && value !== nextValue && optionImages[value]) {
                                  optionImages[nextValue] = optionImages[value];
                                  delete optionImages[value];
                                }
                                return {
                                  ...item,
                                  options: item.options.map((option, optionIndex) => optionIndex === index ? nextValue : option),
                                  optionImages,
                                };
                              }));
                            }}
                            placeholder={`${group.name || 'Option'} choice ${index + 1}`}
                            className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                          />
                          {group.options.length > 1 && (
                            <button type="button" onClick={() => setOptionGroups((previous) => previous.map((item) => {
                              if (item.id !== group.id) return item;
                              const optionImages = { ...item.optionImages };
                              delete optionImages[value];
                              return {
                                ...item,
                                options: item.options.filter((_, optionIndex) => optionIndex !== index),
                                optionImages,
                              };
                            }))} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-neutral-50">
                              Remove
                            </button>
                          )}
                        </div>
                        {group.name.trim().toLowerCase() === 'color' && (
                          <div className="flex items-center gap-3">
                            {group.optionImages?.[value] && (
                              <img src={group.optionImages[value]} alt={`${value} color preview`} className="h-14 w-14 rounded-lg border border-neutral-200 object-cover" />
                            )}
                            <label className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-neutral-100">
                              {group.optionImages?.[value] ? 'Change color photo' : 'Add color photo (optional)'}
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                disabled={!value.trim()}
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  event.target.value = '';
                                  void handleOptionImageUpload(group.id, value, file);
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setOptionGroups((previous) => previous.map((item) => item.id === group.id ? { ...item, options: [...item.options, ''] } : item))}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                    >
                      <PlusCircle className="h-4 w-4" /> Add option {group.options.length + 1}
                    </button>
                  </fieldset>
                ))}
                <button
                  type="button"
                  onClick={() => setOptionGroups((previous) => [...previous, {
                    id: `option-group-${Date.now()}-${previous.length}`,
                    name: '',
                    options: [''],
                  }])}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800"
                >
                  <PlusCircle className="h-4 w-4" /> Add option group
                </button>
              </section>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Materials used</label>
                  <input
                    type="text"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    placeholder="e.g. Oil paint, canvas, varnish"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Artwork size / dimensions</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. 60 × 80 cm"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
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
                <h4 className="font-bold text-slate-700">Artwork media</h4>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 p-4 text-center hover:border-red-400 hover:bg-red-50/40">
                    <Upload className="h-5 w-5 text-red-700" />
                    <span className="text-sm font-bold text-slate-800">Import artwork image *</span>
                    <span className="text-[11px] text-neutral-500">PNG, JPG, WebP · max 8 MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        void handleImageUpload(event.target.files?.[0]);
                        event.target.value = '';
                      }}
                      className="sr-only"
                    />
                  </label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 p-4 text-center hover:border-red-400 hover:bg-red-50/40">
                    <Film className="h-5 w-5 text-red-700" />
                    <span className="text-sm font-bold text-slate-800">Import artwork video</span>
                    <span className="text-[11px] text-neutral-500">Video file · optional · max 2 MB</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(event) => {
                        void handleVideoUpload(event.target.files?.[0]);
                        event.target.value = '';
                      }}
                      className="sr-only"
                    />
                  </label>
                </div>
                {imageFileName && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                    <img src={imageUrl} alt="Uploaded artwork preview" className="h-16 w-16 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{imageFileName}</span>
                    <button type="button" onClick={() => { setImageUrl(''); setImageFileName(''); }} className="text-xs font-semibold text-red-700 hover:underline">Remove</button>
                  </div>
                )}
                {videoFileName && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                    <Film className="h-5 w-5 shrink-0 text-red-700" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{videoFileName}</span>
                    <button type="button" onClick={() => { setVideo(''); setVideoFileName(''); }} className="text-xs font-semibold text-red-700 hover:underline">Remove</button>
                  </div>
                )}
                {video && <video src={video} controls className="mt-3 max-h-48 w-full rounded-xl bg-black" />}
                {mediaError && <p role="alert" className="mt-2 text-xs font-medium text-red-700">{mediaError}</p>}
                <p className="mt-2 text-[11px] text-neutral-500">An image is required to submit; a video is optional. Drafts can be saved without media and completed later.</p>
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
                  onClick={() => setShowSubmitPage(false)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl font-semibold text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};
