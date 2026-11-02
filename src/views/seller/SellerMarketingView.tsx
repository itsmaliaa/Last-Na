import React, { useState } from 'react';
import {
  ImagePlus,
  ShoppingBag,
  Sparkles,
  Share2,
  Calendar,
  Award,
  QrCode,
  CheckCircle2,
  ExternalLink,
  Megaphone,
  Store,
  Tag,
  Plus,
  MapPin,
  Clock,
  Trash2,
  X,
} from 'lucide-react';
import { Artwork, HomePromotion, SellerAnnouncement } from '../../types';

interface SellerMarketingViewProps {
  sellerName: string;
  artworks: Artwork[];
  announcements: SellerAnnouncement[];
  homePromotions: HomePromotion[];
  onAddAnnouncement: (announcement: SellerAnnouncement) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onSaveHomePromotion: (promotion: HomePromotion) => void;
  onDeleteHomePromotion: (id: string) => void;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
}

export const SellerMarketingView: React.FC<SellerMarketingViewProps> = ({
  sellerName,
  artworks,
  announcements,
  homePromotions,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onSaveHomePromotion,
  onDeleteHomePromotion,
  onShowToast,
}) => {
  const [requestedSpotlight, setRequestedSpotlight] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [annType, setAnnType] = useState<'sale' | 'booth' | 'exhibition'>('booth');
  const [annTitle, setAnnTitle] = useState('');
  const [annLocation, setAnnLocation] = useState('');
  const [annDate, setAnnDate] = useState('');
  const [annPromo, setAnnPromo] = useState('');
  const [annDesc, setAnnDesc] = useState('');
  const [homeHeadline, setHomeHeadline] = useState('');
  const [homeDescription, setHomeDescription] = useState('');
  const [homeImage, setHomeImage] = useState('');
  const sellerArtworks = artworks.filter((artwork) => (
    artwork.artist.toLowerCase() === sellerName.toLowerCase() &&
    artwork.status === 'approved' &&
    artwork.isActive !== false
  ));
  const [homeArtworkId, setHomeArtworkId] = useState('');
  const [homePlacement, setHomePlacement] = useState<HomePromotion['placement']>('add');
  const sellerPromotions = homePromotions.filter((promotion) => (
    promotion.sellerName.toLowerCase() === sellerName.toLowerCase()
  ));

  const handleHomeImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      onShowToast('Invalid feature image', 'Choose a JPG, PNG, or WebP image.', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      onShowToast('Feature image is too large', 'Choose an image smaller than 8 MB.', 'error');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = imageUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('The selected image could not be opened.'));
      });

      const scale = Math.min(1, 1400 / image.width, 1000 / image.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image processing is not available in this browser.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressedImage = canvas.toDataURL('image/jpeg', 0.68);
      if (compressedImage.length > 450_000) {
        throw new Error('This image is too large to save. Choose a smaller image.');
      }
      setHomeImage(compressedImage);
    } catch (error) {
      onShowToast(
        'Feature image could not be added',
        error instanceof Error ? error.message : 'The selected image could not be prepared.',
        'error'
      );
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const handlePublishHomePromotion = (event: React.FormEvent) => {
    event.preventDefault();
    if (!homeHeadline.trim() || !homeDescription.trim() || !homeArtworkId) {
      onShowToast('Homepage feature details required', 'Add a headline, description, and approved artwork.', 'error');
      return;
    }

    onSaveHomePromotion({
      id: `home-promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sellerName,
      headline: homeHeadline.trim(),
      description: homeDescription.trim(),
      artworkId: homeArtworkId,
      image: homeImage || undefined,
      placement: homePlacement,
      createdAt: new Date().toISOString(),
    });
    onShowToast(
      'Homepage feature published',
      homePlacement === 'replace'
        ? 'Your feature now replaces the default customer homepage hero.'
        : 'Your feature has been added to the customer homepage.',
      'success'
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.origin);
    onShowToast('Store Link Copied', 'Your student gallery URL was copied to clipboard.', 'success');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) {
      onShowToast('Missing Title', 'Please specify a title for the announcement.', 'error');
      return;
    }

    const newAnn: SellerAnnouncement = {
      id: `ann-${Date.now()}`,
      title: annTitle.trim(),
      type: annType,
      description: annDesc.trim() || (annType === 'booth' ? 'Visit my student booth stand! Originals & prints on display.' : 'Studio discount on selected original pieces.'),
      locationOrBooth: annLocation.trim() || (annType === 'booth' ? 'Campus Quadrangle Booth' : 'Online Studio Store'),
      dateRange: annDate.trim() || 'Upcoming Event',
      discountPromo: annPromo.trim() || undefined,
      status: 'Active',
      createdAt: 'Today',
      viewsCount: 1,
    };

    onAddAnnouncement(newAnn);
    setShowModal(false);
    setAnnTitle('');
    setAnnLocation('');
    setAnnDate('');
    setAnnPromo('');
    setAnnDesc('');
    onShowToast('Announcement Live', `"${newAnn.title}" is published to your student profile & dashboard.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4" />
            <span>Student Promotion & Outreach</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Studio Marketing & Announcements Hub
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Announce upcoming physical booth stands, post studio discount sales, and apply for campus spotlight features.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Post Announcement</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-slate-800 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Share2 className="w-4 h-4 text-neutral-500" />
            <span>Share Gallery Link</span>
          </button>
        </div>
      </div>

      <section className="space-y-5 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Customer Homepage Feature</h3>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            Publish an approved artwork and message on the customer homepage. Add it as a new feature or replace the current hero.
          </p>
        </div>

        <form onSubmit={handlePublishHomePromotion} className="grid gap-4 md:grid-cols-2">
          <label className="text-xs font-semibold text-neutral-700">
            Headline
            <input
              value={homeHeadline}
              onChange={(event) => setHomeHeadline(event.target.value)}
              maxLength={100}
              placeholder="Introduce your featured artwork"
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-red-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-neutral-700">
            Featured approved artwork
            <select
              value={homeArtworkId}
              onChange={(event) => setHomeArtworkId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-red-400 focus:outline-none"
            >
              <option value="">Choose your artwork</option>
              {sellerArtworks.map((artwork) => (
                <option key={artwork.id} value={artwork.id}>{artwork.title}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-neutral-700">
            Description
            <textarea
              value={homeDescription}
              onChange={(event) => setHomeDescription(event.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Tell customers about this artwork or your shop."
              className="mt-1 w-full resize-y rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-red-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-neutral-700">
            Feature image (optional)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void handleHomeImageChange(event)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 p-2 text-xs font-normal text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold"
            />
            <span className="mt-1 block font-normal text-neutral-500">
              Add a JPG, PNG, or WebP image. If omitted, the selected artwork image is used.
            </span>
            {homeImage && (
              <span className="mt-2 flex items-center gap-3">
                <img src={homeImage} alt="Homepage feature preview" className="h-20 w-28 rounded-lg object-cover" />
                <button type="button" onClick={() => setHomeImage('')} className="font-bold text-red-600 hover:text-red-800">
                  Remove image
                </button>
              </span>
            )}
          </label>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-neutral-700">
              Homepage placement
              <select
                value={homePlacement}
                onChange={(event) => setHomePlacement(event.target.value as HomePromotion['placement'])}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-red-400 focus:outline-none"
              >
                <option value="add">Add as a featured promotion</option>
                <option value="replace">Replace the current homepage hero</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={sellerArtworks.length === 0}
              className="rounded-full bg-[#DC2626] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Publish Homepage Feature
            </button>
            {sellerArtworks.length === 0 && (
              <p className="text-xs text-neutral-500">You need an approved, active artwork before publishing a homepage feature.</p>
            )}
          </div>
        </form>

        {sellerPromotions.length > 0 && (
          <div className="space-y-2 border-t border-neutral-100 pt-4">
            <h4 className="text-xs font-bold text-slate-800">Your published homepage features</h4>
            {sellerPromotions.map((promotion) => (
              <div key={promotion.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{promotion.headline}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {promotion.placement === 'replace' ? 'Replaces homepage hero' : 'Added to homepage'} · {artworks.find((artwork) => artwork.id === promotion.artworkId)?.title || 'Artwork unavailable'}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Published {new Date(promotion.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <img
                  src={promotion.image || artworks.find((artwork) => artwork.id === promotion.artworkId)?.image}
                  alt=""
                  className="h-12 w-16 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => onDeleteHomePromotion(promotion.id)}
                  className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Studio Announcements Section (Sale or Booth Stand) */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-red-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Active Studio Announcements & Booth Notices
            </h3>
          </div>
          <span className="text-xs font-semibold text-neutral-500">
            {announcements.length} announcement{announcements.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                ann.type === 'booth'
                  ? 'bg-blue-50/30 border-blue-200/80'
                  : 'bg-red-50/30 border-red-200/80'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {ann.type === 'booth' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      Physical Booth Stand Notice
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                      <Tag className="w-3.5 h-3.5 text-red-600" />
                      Studio Sale Announcement
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">{ann.description}</p>

                <div className="space-y-1 pt-1 text-xs">
                  {ann.locationOrBooth && (
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{ann.locationOrBooth}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{ann.dateRange}</span>
                  </div>
                  {ann.discountPromo && (
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-white text-red-700 font-mono font-bold text-xs rounded-lg border border-red-200">
                      <Tag className="w-3 h-3" />
                      <span>{ann.discountPromo}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200/50 flex items-center justify-between text-xs text-neutral-500">
                <span>{ann.viewsCount ?? 150} buyer impressions</span>
                {onDeleteAnnouncement && (
                  <button
                    onClick={() => onDeleteAnnouncement(ann.id)}
                    className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                    title="Remove Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="col-span-2 py-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
              <Megaphone className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">No Active Announcements</p>
              <p className="text-xs text-neutral-500 mt-1">
                Post an announcement about a studio discount sale or your upcoming physical booth stand.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-3 px-4 py-2 bg-[#DC2626] text-white rounded-full text-xs font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer"
              >
                Create Announcement
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Homepage Spotlight */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Homepage Artist Pavilion Spotlight</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Submit your verified portfolio for curatorial placement on the Red Nexus homepage banner seen by over 15,000 monthly collectors.
            </p>
          </div>

          <div className="pt-2">
            {requestedSpotlight ? (
              <div className="px-4 py-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Application Submitted for Fall 2026 Rotation</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setRequestedSpotlight(true);
                  onShowToast('Spotlight Requested', 'Your curatorial application was sent to CAFA committee.', 'success');
                }}
                className="w-full py-2.5 bg-[#8E1B24] hover:bg-[#73151D] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Apply for Featured Pavilion Slot
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Campus Exhibition Fair Booth */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Physical Campus Art Fair Booth Reservation</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Reserve your official student artist booth at the upcoming Manila Biennale Student Pavilion (Oct 18-20, 2026).
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onShowToast('Booth Reserved', 'Table #B14 reserved under Malia Santos. Free for enrolled student artists.', 'success')}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reserve Table #B14 (Free for Verified Students)
            </button>
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Post Marketing Announcement</h3>
                <p className="text-xs text-neutral-500">Broadcast your upcoming sale or physical booth stand</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Announcement Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAnnType('booth')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                      annType === 'booth'
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-400 text-blue-900 font-bold'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Store className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold">Physical Booth Stand</p>
                      <p className="text-[10px] text-neutral-500">Campus fair or pop-up</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnnType('sale')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                      annType === 'sale'
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-400 text-red-900 font-bold'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Tag className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <p className="font-bold">Possible Studio Sale</p>
                      <p className="text-[10px] text-neutral-500">Promotions or clearance</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    annType === 'booth'
                      ? 'e.g. Physical Booth Stand: Fine Arts Week Table #A12'
                      : 'e.g. Flash Studio Sale: 15% Off All Canvas Works'
                  }
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-red-500 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {annType === 'booth' ? 'Booth Stand Location & Number *' : 'Sale Venue / Channel'}
                </label>
                <input
                  type="text"
                  placeholder={
                    annType === 'booth'
                      ? 'e.g. Booth #B14 · University Arts Quadrangle (Main Hall)'
                      : 'e.g. Online Studio Store & In-Person Studio Pickup'
                  }
                  value={annLocation}
                  onChange={(e) => setAnnLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-red-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date / Schedule *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oct 18 - 20, 2026 (9am - 5pm)"
                    value={annDate}
                    onChange={(e) => setAnnDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-red-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Use code EXPO2026"
                    value={annPromo}
                    onChange={(e) => setAnnPromo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-red-500 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Details for Visitors</label>
                <textarea
                  rows={3}
                  placeholder="Share details about what pieces will be featured or where buyers can locate you..."
                  value={annDesc}
                  onChange={(e) => setAnnDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-red-500 text-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                >
                  Publish Announcement
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
