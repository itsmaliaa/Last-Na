import React, { useState } from 'react';
import { Megaphone, Trash2 } from 'lucide-react';
import { HomePromotion } from '../../types';

interface AdminMarketingViewProps {
  homePromotions: HomePromotion[];
  onSaveHomePromotion: (promotion: HomePromotion) => void;
  onDeleteHomePromotion: (id: string) => void;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminMarketingView: React.FC<AdminMarketingViewProps> = ({
  homePromotions,
  onSaveHomePromotion,
  onDeleteHomePromotion,
  onShowToast,
}) => {
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState('');
  const sortedPromotions = [...homePromotions].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const source = new Image();
      source.src = imageUrl;
      await new Promise<void>((resolve, reject) => {
        source.onload = () => resolve();
        source.onerror = () => reject(new Error('The selected image could not be opened.'));
      });

      const scale = Math.min(1, 1400 / source.width, 1000 / source.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image processing is not available in this browser.');
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      const compressedImage = canvas.toDataURL('image/jpeg', 0.68);
      if (compressedImage.length > 450_000) {
        throw new Error('This image is too large to save. Choose a smaller image.');
      }
      setImage(compressedImage);
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

  const handlePublish = (event: React.FormEvent) => {
    event.preventDefault();
    if (!headline.trim() || !description.trim() || !date || !image) {
      onShowToast('Homepage feature details required', 'Add a title, description, date, and image.', 'error');
      return;
    }

    onSaveHomePromotion({
      id: `home-promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sellerName: 'RED NEXUS',
      headline: headline.trim(),
      description: description.trim(),
      date,
      image,
      placement: 'replace',
      createdAt: new Date().toISOString(),
    });
    setHeadline('');
    setDescription('');
    setDate('');
    setImage('');
    onShowToast(
      'Homepage feature published',
      'This feature is now available in the customer homepage hero slider.',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
          <Megaphone className="h-4 w-4" />
          <span>Admin Marketing</span>
        </div>
        <h2 className="mt-1 text-xl font-extrabold text-slate-900">Customer Homepage Features</h2>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          Publish and manage homepage banners using a title, description, date, and image.
        </p>
      </header>

      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6">
        <form onSubmit={handlePublish} className="grid gap-4 md:grid-cols-2">
          <label className="text-xs font-semibold text-neutral-700">
            Title
            <input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              maxLength={100}
              placeholder="Add a homepage title"
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-red-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-neutral-700">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Describe this homepage feature."
              className="mt-1 w-full resize-y rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-red-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-neutral-700">
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-red-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-neutral-700">
            Image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void handleImageChange(event)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 p-2 text-xs font-normal text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold"
            />
            <span className="mt-1 block font-normal text-neutral-500">
              Upload a JPG, PNG, or WebP image for the homepage banner.
            </span>
            {image && (
              <span className="mt-2 flex items-center gap-3">
                <img src={image} alt="Feature preview" className="h-20 w-28 rounded-lg object-cover" />
                <button type="button" onClick={() => setImage('')} className="font-bold text-red-600 hover:text-red-800">
                  Remove image
                </button>
              </span>
            )}
          </label>
          <div className="space-y-3">
            <button
              type="submit"
              className="rounded-full bg-[#DC2626] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Publish Homepage Feature
            </button>
          </div>
        </form>

        <div className="space-y-2 border-t border-neutral-100 pt-4">
          <h3 className="text-sm font-bold text-slate-900">Published homepage features</h3>
          {sortedPromotions.length === 0 ? (
            <p className="text-xs text-neutral-500">No homepage features have been published.</p>
          ) : sortedPromotions.map((promotion) => {
            return (
              <article key={promotion.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{promotion.headline}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Homepage slider{promotion.date ? ` · ${new Date(`${promotion.date}T00:00:00`).toLocaleDateString()}` : ''}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Published {new Date(promotion.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {promotion.image && (
                  <img
                    src={promotion.image}
                    alt=""
                    className="h-12 w-16 rounded-lg object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onDeleteHomePromotion(promotion.id)}
                  aria-label={`Delete ${promotion.headline}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
