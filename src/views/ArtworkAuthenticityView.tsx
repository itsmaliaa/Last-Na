import React, { useState } from 'react';
import { AlertCircle, BadgeCheck, PackageCheck, Search, ShieldCheck } from 'lucide-react';
import { Artwork, OrderItem, SellerOrderTransaction } from '../types';

interface ArtworkAuthenticityViewProps {
  artworks: Artwork[];
  orders: OrderItem[];
  transactions: SellerOrderTransaction[];
}

export const ArtworkAuthenticityView: React.FC<ArtworkAuthenticityViewProps> = ({
  artworks,
  orders,
  transactions,
}) => {
  const [artworkId, setArtworkId] = useState('');
  const [checkedId, setCheckedId] = useState<string | null>(null);

  const completedProducts = [
    ...orders
      .filter((order) => order.status === 'Completed')
      .map((order) => ({
        key: `${order.orderNumber}-${order.title}-${order.artist}`,
        title: order.title,
        artist: order.artist,
        image: order.image,
        orderNumber: order.orderNumber,
        completedDate: order.dateInfo,
        artworkId: artworks.find(
          (artwork) =>
            artwork.title.trim().toLowerCase() === order.title.trim().toLowerCase() &&
            artwork.artist.trim().toLowerCase() === order.artist.trim().toLowerCase()
        )?.id,
      })),
    ...transactions
      .filter((transaction) => transaction.status === 'Completed' || transaction.fulfillmentStatus === 'Delivered')
      .map((transaction) => {
        const artwork = artworks.find(
          (item) =>
            item.title.trim().toLowerCase() === transaction.artwork.trim().toLowerCase() &&
            item.artist.trim().toLowerCase() === transaction.artist.trim().toLowerCase()
        );
        return {
          key: `${transaction.orderNumber ?? transaction.id}-${transaction.artwork}-${transaction.artist}`,
          title: transaction.artwork,
          artist: transaction.artist,
          image: artwork?.image,
          orderNumber: transaction.orderNumber,
          completedDate: transaction.date,
          artworkId: artwork?.id,
        };
      }),
  ].filter((product, index, products) =>
    products.findIndex((candidate) => candidate.key === product.key) === index
  );

  const matchedArtwork = checkedId
    ? artworks.find((artwork) => artwork.id.trim().toLowerCase() === checkedId.toLowerCase())
    : undefined;

  const checkListedProduct = (id: string) => {
    setArtworkId(id);
    setCheckedId(id);
  };

  const checkArtwork = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedId = artworkId.trim();
    if (!normalizedId) return;
    setCheckedId(normalizedId);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8e1b24]">
          <ShieldCheck className="h-4 w-4" />
          Artwork verification
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Check Artwork Authenticity
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Enter an artwork ID to check whether it is registered and what verification status it has on Red Nexus.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <form onSubmit={checkArtwork}>
          <label htmlFor="artwork-id" className="mb-2 block text-sm font-bold text-slate-800">
            Artwork ID
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="artwork-id"
              value={artworkId}
              onChange={(event) => {
                setArtworkId(event.target.value);
                setCheckedId(null);
              }}
              placeholder="e.g. art-3"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#8e1b24] focus:ring-2 focus:ring-[#8e1b24]/10"
            />
            <button
              type="submit"
              disabled={!artworkId.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8e1b24] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#75151d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              Check ID
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            This checks the artwork registration and review status stored on this platform.
          </p>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Completed and delivered products</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a listed artwork ID to check its current authenticity status.
            </p>
          </div>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {completedProducts.length}
          </span>
        </div>
        {completedProducts.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {completedProducts.map((product) => (
              <li key={product.key} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-6">
                {product.image ? (
                  <img src={product.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{product.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {product.artist}
                    {product.orderNumber ? ` · Order ${product.orderNumber}` : ''}
                    {product.completedDate ? ` · ${product.completedDate}` : ''}
                  </p>
                </div>
                {product.artworkId ? (
                  <button
                    type="button"
                    onClick={() => checkListedProduct(product.artworkId!)}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#8e1b24]/20 bg-red-50 px-3 py-2 text-xs font-bold text-[#8e1b24] transition hover:bg-red-100 sm:self-auto"
                  >
                    Check {product.artworkId}
                  </button>
                ) : (
                  <span className="self-start rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 sm:self-auto">
                    Artwork ID unavailable
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-sm text-slate-500">There are no completed or delivered products to display yet.</p>
        )}
      </section>

      {checkedId && matchedArtwork?.status === 'approved' && (
        <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm" aria-live="polite">
          <div className="flex items-start gap-4 p-5 sm:p-6">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-extrabold text-emerald-900">Verified on Red Nexus</p>
              <p className="mt-1 text-sm leading-6 text-emerald-800">
                This artwork is registered and has been approved through the platform&apos;s artwork verification process.
              </p>
              <ArtworkDetails artwork={matchedArtwork} />
            </div>
          </div>
        </section>
      )}

      {checkedId && matchedArtwork?.status === 'pending' && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6" aria-live="polite">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-100 p-3 text-amber-700">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-amber-900">Verification pending</p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                This artwork is registered, but its authenticity has not yet been confirmed by the platform.
              </p>
              <ArtworkDetails artwork={matchedArtwork} />
            </div>
          </div>
        </section>
      )}

      {checkedId && matchedArtwork?.status === 'rejected' && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm sm:p-6" aria-live="polite">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-red-100 p-3 text-red-700">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-red-900">Not verified</p>
              <p className="mt-1 text-sm leading-6 text-red-800">
                This artwork was not approved through the platform&apos;s verification process. Its authenticity is not confirmed.
              </p>
              <ArtworkDetails artwork={matchedArtwork} />
            </div>
          </div>
        </section>
      )}

      {checkedId && !matchedArtwork && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6" aria-live="polite">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-slate-200 p-3 text-slate-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">No matching artwork found</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                No artwork with ID <span className="font-bold">{checkedId}</span> is registered in the platform&apos;s current records.
                Its authenticity cannot be confirmed here.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const ArtworkDetails: React.FC<{ artwork: Artwork }> = ({ artwork }) => (
  <div className="mt-5 flex flex-col gap-4 border-t border-current/10 pt-4 sm:flex-row sm:items-center">
    <img
      src={artwork.image}
      alt={artwork.title}
      className="h-20 w-20 rounded-xl object-cover"
    />
    <dl className="grid min-w-0 flex-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide opacity-70">Artwork</dt>
        <dd className="mt-0.5 truncate font-bold">{artwork.title}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide opacity-70">Artist</dt>
        <dd className="mt-0.5 truncate font-bold">{artwork.artist}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide opacity-70">Artwork ID</dt>
        <dd className="mt-0.5 font-mono font-bold">{artwork.id}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide opacity-70">Platform status</dt>
        <dd className="mt-0.5 font-bold capitalize">{artwork.status}</dd>
      </div>
    </dl>
  </div>
);
