import React from 'react';
import { AlertCircle, BadgeCheck, ShieldCheck } from 'lucide-react';
import { Artwork } from '../types';

interface CertificateVerificationViewProps {
  artwork?: Artwork;
  certificateNumber: string;
}

export const CertificateVerificationView: React.FC<CertificateVerificationViewProps> = ({
  artwork,
  certificateNumber,
}) => {
  const verifiedArtwork = artwork && artwork.status === 'approved' && certificateNumber.trim()
    ? artwork
    : undefined;
  const isVerified = Boolean(verifiedArtwork);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4 py-10">
      <section
        className={`w-full max-w-2xl overflow-hidden rounded-3xl border bg-white shadow-lg ${
          isVerified ? 'border-emerald-200' : 'border-red-200'
        }`}
        aria-live="polite"
      >
        <div className={`flex items-center gap-3 px-6 py-5 ${isVerified ? 'bg-emerald-50' : 'bg-red-50'}`}>
          {isVerified
            ? <BadgeCheck className="h-8 w-8 text-emerald-700" />
            : <AlertCircle className="h-8 w-8 text-red-700" />}
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <ShieldCheck className="h-4 w-4" /> Red Nexus certificate check
            </p>
            <h1 className={`mt-1 text-xl font-extrabold ${isVerified ? 'text-emerald-900' : 'text-red-900'}`}>
              {isVerified ? 'Product is authentic' : 'Authenticity not confirmed'}
            </h1>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {verifiedArtwork ? (
            <>
              <p className="text-sm leading-6 text-slate-600">
                This artwork is registered on Red Nexus and has passed the platform&apos;s artwork verification process.
              </p>
              <div className="mt-6 flex flex-col gap-5 border-t border-slate-100 pt-6 sm:flex-row">
                <img src={verifiedArtwork.image} alt={verifiedArtwork.title} className="h-32 w-32 rounded-2xl object-cover" />
                <dl className="grid flex-1 content-start gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Artwork</dt>
                    <dd className="mt-1 font-bold text-slate-900">{verifiedArtwork.title}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Artist</dt>
                    <dd className="mt-1 font-bold text-slate-900">{verifiedArtwork.artist}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Artwork ID</dt>
                    <dd className="mt-1 font-mono font-bold text-slate-900">{verifiedArtwork.id}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Certificate ID</dt>
                    <dd className="mt-1 font-mono font-bold text-slate-900">{certificateNumber}</dd>
                  </div>
                </dl>
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              This certificate does not match an approved Red Nexus artwork record. Do not treat it as verified.
            </p>
          )}
          <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
            Verification confirms the artwork&apos;s current approval status in Red Nexus records. Contact Red Nexus support if the details do not match the physical artwork.
          </p>
          <a href={window.location.pathname} className="mt-5 inline-flex text-sm font-bold text-[#8e1b24] hover:underline">
            Visit Red Nexus
          </a>
        </div>
      </section>
    </main>
  );
};
