import React, { useEffect, useRef, useState } from 'react';
import { toDataURL } from 'qrcode';
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Download,
  FileImage,
  Trash2,
} from 'lucide-react';
import { Artwork } from '../../types';
import facebookIcon from '../../final design/Group (2).png';
import instagramIcon from '../../final design/Group 2182.png';
import whatsappIcon from '../../final design/Group 2183.png';

interface SellerCertificateViewProps {
  artworks: Artwork[];
  artistName: string;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
}

const TEMPLATE_WIDTH = 1200;
const TEMPLATE_HEIGHT = 840;
const MAX_SAVED_DRAFTS = 5;

interface CertificateDraft {
  id: string;
  savedAt: string;
  selectedArtworkId: string;
  artworkTitle: string;
  description: string;
  medium: string;
  dimensions: string;
  instagram: string;
  phone: string;
  facebook: string;
  issueDate: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCertificateDraft = (value: unknown): value is CertificateDraft => {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.savedAt === 'string' &&
    Number.isFinite(Date.parse(value.savedAt)) &&
    typeof value.selectedArtworkId === 'string' &&
    typeof value.artworkTitle === 'string' &&
    typeof value.description === 'string' &&
    typeof value.medium === 'string' &&
    typeof value.dimensions === 'string' &&
    typeof value.instagram === 'string' &&
    typeof value.phone === 'string' &&
    typeof value.facebook === 'string' &&
    typeof value.issueDate === 'string'
  );
};

const isPreviousDraft = (
  value: unknown
): value is Omit<CertificateDraft, 'id' | 'savedAt'> => {
  if (!isRecord(value)) return false;
  return (
    typeof value.selectedArtworkId === 'string' &&
    typeof value.artworkTitle === 'string' &&
    typeof value.description === 'string' &&
    typeof value.medium === 'string' &&
    typeof value.dimensions === 'string' &&
    typeof value.instagram === 'string' &&
    typeof value.phone === 'string' &&
    typeof value.facebook === 'string' &&
    typeof value.issueDate === 'string'
  );
};

const getDraftStorageKey = (artistName: string) =>
  `red-nexus-certificate-draft-${artistName.trim().toLowerCase()}`;

const formatDate = (date: string) => {
  if (!date) return 'Date of issue';
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getLocalDateValue = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const SellerCertificateView: React.FC<SellerCertificateViewProps> = ({
  artworks,
  artistName,
  onShowToast,
}) => {
  const skipNextArtworkSync = useRef(false);
  const showToastRef = useRef(onShowToast);
  const approvedArtworks = artworks.filter((artwork) => artwork.status === 'approved');
  const [selectedArtworkId, setSelectedArtworkId] = useState(
    () => approvedArtworks[0]?.id ?? ''
  );
  const [description, setDescription] = useState('');
  const [medium, setMedium] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [facebook, setFacebook] = useState('');
  const [issueDate, setIssueDate] = useState(getLocalDateValue());
  const [savedDrafts, setSavedDrafts] = useState<CertificateDraft[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const selectedArtwork = approvedArtworks.find((item) => item.id === selectedArtworkId);
  const artworkTitle = selectedArtwork?.title ?? '';
  const isArtworkApproved = selectedArtwork?.status === 'approved';
  const verificationUrl = selectedArtwork
    ? (() => {
        const url = new URL(window.location.href);
        url.search = '';
        url.hash = '';
        url.searchParams.set('verify', selectedArtwork.id);
        return url.toString();
      })()
    : '';
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  useEffect(() => {
    showToastRef.current = onShowToast;
  }, [onShowToast]);

  useEffect(() => {
    try {
      const savedValue = window.localStorage.getItem(getDraftStorageKey(artistName));
      if (!savedValue) {
        setSavedDrafts([]);
        return;
      }

      const parsedValue: unknown = JSON.parse(savedValue);
      if (Array.isArray(parsedValue)) {
        if (!parsedValue.every(isCertificateDraft)) {
          throw new Error('A saved draft has an invalid format. Delete it and save a new draft.');
        }
        const limitedDrafts = parsedValue.slice(0, MAX_SAVED_DRAFTS);
        if (limitedDrafts.length !== parsedValue.length) {
          window.localStorage.setItem(getDraftStorageKey(artistName), JSON.stringify(limitedDrafts));
        }
        setSavedDrafts(limitedDrafts);
        return;
      }

      if (isPreviousDraft(parsedValue)) {
        const previousDraft = parsedValue;
        setSavedDrafts([{
          ...previousDraft,
          id: 'legacy-certificate-draft',
          savedAt: new Date().toISOString(),
        }]);
        return;
      }
      throw new Error('The saved certificate draft has an invalid format.');
    } catch (error) {
      showToastRef.current(
        'Saved drafts could not be loaded',
        error instanceof Error ? error.message : 'The saved certificate drafts could not be read.',
        'error'
      );
    }
  }, [artistName]);

  useEffect(() => {
    if (!selectedArtwork) return;
    if (skipNextArtworkSync.current) {
      skipNextArtworkSync.current = false;
      return;
    }
    setDescription(selectedArtwork.description || selectedArtwork.features || '');
    setMedium(selectedArtwork.mediumsUsed || selectedArtwork.genre || '');
    setDimensions(selectedArtwork.size || '');
  }, [selectedArtworkId]);

  useEffect(() => {
    let isCurrent = true;
    setQrCodeDataUrl('');
    if (!verificationUrl || !isArtworkApproved) return () => {
      isCurrent = false;
    };

    toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 256,
      color: { dark: '#111111', light: '#ffffff' },
    }).then((dataUrl) => {
      if (isCurrent) setQrCodeDataUrl(dataUrl);
    }).catch((error: unknown) => {
      if (isCurrent) {
        onShowToast(
          'QR code could not be created',
          error instanceof Error ? error.message : 'Please try again.',
          'error'
        );
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [verificationUrl, isArtworkApproved]);

  const handleArtworkChange = (artworkId: string) => {
    setSelectedArtworkId(artworkId);
    const artwork = artworks.find((item) => item.id === artworkId);
    if (artwork?.status === 'approved') {
      setMedium(artwork.genre ?? artwork.category.replace('_', ' '));
      setDescription(artwork.description || artwork.features || '');
      setDimensions(artwork.size || '');
    } else {
      setMedium('');
      setDescription('');
      setDimensions('');
    }
  };

  const saveDraft = () => {
    try {
      const draft: CertificateDraft = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        savedAt: new Date().toISOString(),
        selectedArtworkId,
        artworkTitle,
        description,
        medium,
        dimensions,
        instagram,
        phone,
        facebook,
        issueDate,
      };
      const updatedDrafts = [draft, ...savedDrafts].slice(0, MAX_SAVED_DRAFTS);
      window.localStorage.setItem(getDraftStorageKey(artistName), JSON.stringify(updatedDrafts));
      setSavedDrafts(updatedDrafts);
      onShowToast('Draft saved', 'Your certificate details were saved in this browser.', 'success');
    } catch (error) {
      onShowToast('Draft could not be saved', error instanceof Error ? error.message : 'Unable to save this draft in the browser.', 'error');
    }
  };

  const restoreDraft = (draft: CertificateDraft) => {
    const restoredArtworkId = approvedArtworks.some((artwork) => artwork.id === draft.selectedArtworkId)
      ? draft.selectedArtworkId
      : '';
    skipNextArtworkSync.current = selectedArtworkId !== restoredArtworkId;
    setSelectedArtworkId(restoredArtworkId);
    setDescription(draft.description);
    setMedium(draft.medium);
    setDimensions(draft.dimensions);
    setInstagram(draft.instagram);
    setPhone(draft.phone);
    setFacebook(draft.facebook);
    setIssueDate(draft.issueDate);
    onShowToast(
      'Draft restored',
      restoredArtworkId
        ? `“${artworkTitle || draft.artworkTitle || 'Untitled certificate'}” is ready to continue.`
        : 'Choose an approved artwork to complete this certificate.',
      'success'
    );
  };

  const deleteDraft = (draftId: string) => {
    try {
      const updatedDrafts = savedDrafts.filter((draft) => draft.id !== draftId);
      window.localStorage.setItem(getDraftStorageKey(artistName), JSON.stringify(updatedDrafts));
      setSavedDrafts(updatedDrafts);
      onShowToast('Draft deleted', 'The saved certificate draft was removed.', 'success');
    } catch (error) {
      onShowToast('Draft could not be deleted', error instanceof Error ? error.message : 'Unable to update saved drafts.', 'error');
    }
  };

  const downloadCertificate = async () => {
    if (!selectedArtwork || !isArtworkApproved) {
      onShowToast('Approved artwork required', 'Choose an artwork approved by Red Nexus before issuing its certificate.', 'error');
      return;
    }
    if (!qrCodeDataUrl) {
      onShowToast('Verification QR code is not ready', 'Wait for the QR code to generate, then download the certificate.', 'error');
      return;
    }

    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = TEMPLATE_WIDTH;
      canvas.height = TEMPLATE_HEIGHT;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas is not available in this browser.');

      context.fillStyle = '#fbf8f1';
      context.fillRect(0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
      context.strokeStyle = '#8e1b24';
      context.lineWidth = 7;
      context.strokeRect(8, 4, TEMPLATE_WIDTH - 16, TEMPLATE_HEIGHT - 8);
      context.strokeStyle = '#c9a96e';
      context.lineWidth = 1.5;
      context.strokeRect(50, 40, TEMPLATE_WIDTH - 100, TEMPLATE_HEIGHT - 80);

      context.fillStyle = '#9b1c28';
      context.beginPath();
      context.arc(116, 105, 31, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#f4e8ce';
      context.lineWidth = 2.5;
      context.beginPath();
      context.arc(116, 99, 8, Math.PI, Math.PI * 2);
      context.lineTo(122, 114);
      context.lineTo(116, 110);
      context.lineTo(110, 114);
      context.closePath();
      context.stroke();

      context.textAlign = 'center';
      context.fillStyle = '#8e1b24';
      context.font = '700 15px Arial, sans-serif';
      context.letterSpacing = '4px';
      context.fillText('RED NEXUS · ARTIST CERTIFICATE', TEMPLATE_WIDTH / 2, 101);
      context.letterSpacing = '0px';
      context.fillStyle = '#bd8646';
      context.font = 'italic 46px Georgia, serif';
      context.fillText('Certificate of Authenticity', TEMPLATE_WIDTH / 2, 148);
      context.fillStyle = '#53647e';
      context.font = '16px Arial, sans-serif';
      context.fillText('This is to guarantee and represents the following artwork is authenticated and signed', TEMPLATE_WIDTH / 2, 174, 780);
      context.fillText('by the artist.', TEMPLATE_WIDTH / 2, 203);

      if (selectedArtwork) {
        const artworkImage = new Image();
        artworkImage.src = selectedArtwork.image;
        await new Promise<void>((resolve, reject) => {
          artworkImage.onload = () => resolve();
          artworkImage.onerror = () => reject(new Error('The artwork image could not be added to the certificate.'));
        });
        const imageX = 142;
        const imageY = 288;
        const imageWidth = 370;
        const imageHeight = 288;
        context.save();
        context.beginPath();
        context.roundRect(imageX, imageY, imageWidth, imageHeight, 10);
        context.clip();
        const imageScale = Math.max(imageWidth / artworkImage.width, imageHeight / artworkImage.height);
        const sourceWidth = imageWidth / imageScale;
        const sourceHeight = imageHeight / imageScale;
        context.drawImage(
          artworkImage,
          (artworkImage.width - sourceWidth) / 2,
          (artworkImage.height - sourceHeight) / 2,
          sourceWidth,
          sourceHeight,
          imageX,
          imageY,
          imageWidth,
          imageHeight
        );
        context.restore();
      }

      context.textAlign = 'left';
      context.fillStyle = '#8e1b24';
      context.textAlign = 'center';
      context.font = 'italic 26px Arial, sans-serif';
      context.fillText(`“${artworkTitle.trim() || '[Artwork title]'}”`, 805, 305, 500);
      context.textAlign = 'left';
      context.fillStyle = '#53647e';
      context.font = '15px Arial, sans-serif';
      const descriptionWords = (description || 'Artwork description will appear here.').trim().split(/\s+/);
      const descriptionLines: string[] = [];
      let descriptionLine = '';
      descriptionWords.forEach((word) => {
        const candidate = descriptionLine ? `${descriptionLine} ${word}` : word;
        if (context.measureText(candidate).width > 500 && descriptionLine) {
          descriptionLines.push(descriptionLine);
          descriptionLine = word;
        } else {
          descriptionLine = candidate;
        }
      });
      if (descriptionLine) descriptionLines.push(descriptionLine);
      descriptionLines.slice(0, 5).forEach((line, index) => {
        context.fillText(line, 563, 345 + index * 20);
      });

      const contacts = [
        { icon: facebookIcon, text: facebook || 'Facebook profile' },
        { icon: instagramIcon, text: instagram || '@your_instagram' },
        { icon: whatsappIcon, text: phone || 'Phone number' },
      ];
      const contactImages = await Promise.all(contacts.map(({ icon }) => new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('A contact logo could not be added to the certificate.'));
        image.src = icon;
      })));
      contacts.forEach((contact, index) => {
        const y = 520 + index * 32;
        context.drawImage(contactImages[index], 560, y - 17, 20, 20);
        context.fillStyle = '#53647e';
        context.font = '15px Arial, sans-serif';
        context.fillText(contact.text, 590, y, 195);
      });

      const metadata = [
        ['Medium:', medium || 'Not specified'],
        ['Dimensions:', dimensions || 'Not specified'],
        ['Date of Creation:', formatDate(issueDate)],
      ];
      metadata.forEach(([label, value], index) => {
        const y = 520 + index * 32;
        context.fillStyle = '#555555';
        context.font = 'bold 14px Arial, sans-serif';
        context.fillText(label, 784, y);
        context.fillStyle = '#53647e';
        context.font = '15px Arial, sans-serif';
        context.fillText(value, 905, y, 225);
      });

      context.strokeStyle = '#999999';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(167, 665);
      context.lineTo(445, 665);
      context.stroke();
      context.textAlign = 'center';
      context.fillStyle = '#8e1b24';
      context.font = 'bold 13px Arial, sans-serif';
      context.fillText('ARTIST SIGNATURE', 306, 689);

      const qrImage = new Image();
      qrImage.src = qrCodeDataUrl;
      await new Promise<void>((resolve, reject) => {
        qrImage.onload = () => resolve();
        qrImage.onerror = () => reject(new Error('The verification QR code could not be added to the certificate.'));
      });
      context.fillStyle = '#ffffff';
      context.drawImage(qrImage, 1000, 638, 105, 105);
      context.fillStyle = '#53647e';
      context.font = 'bold 13px Arial, sans-serif';
      context.textAlign = 'center';
      context.fillText('SCAN TO VERIFY', 1052, 772);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error('The certificate image could not be created.'));
        }, 'image/png');
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${artworkTitle.trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-certificate.png`;
      link.click();
      URL.revokeObjectURL(url);
      onShowToast('Certificate downloaded', 'Your certificate has been saved as a PNG image.', 'success');
    } catch (error) {
      onShowToast(
        'Certificate could not be downloaded',
        error instanceof Error ? error.message : 'Please try again.',
        'error'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-7 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Certificate of Authenticity
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Create a certificate for a platform-approved artwork. Its QR code opens the Red Nexus authenticity check.
          </p>
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(350px,0.78fr)_minmax(0,1.22fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Certificate details</h2>
            <p className="mt-1 text-sm text-slate-500">Add the information that will appear on the certificate.</p>
          </div>

          <div className="space-y-4">
            {approvedArtworks.length > 0 && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">Choose from your artworks</span>
                <select
                  value={selectedArtworkId}
                  onChange={(event) => handleArtworkChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#8e1b24] focus:ring-2 focus:ring-[#8e1b24]/10"
                >
                  <option value="">Select an artwork (optional)</option>
                  {approvedArtworks.map((artwork) => (
                    <option key={artwork.id} value={artwork.id}>
                      {artwork.title}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Description</span>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the artwork and its story"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#8e1b24] focus:ring-2 focus:ring-[#8e1b24]/10"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-bold text-slate-700">Instagram
                <input value={instagram} onChange={(event) => setInstagram(event.target.value)} placeholder="@artist" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-[#8e1b24]" />
              </label>
              <label className="block text-xs font-bold text-slate-700">Phone No.
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Contact number" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-[#8e1b24]" />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-bold text-slate-700">Medium
              <input
                value={medium}
                onChange={(event) => setMedium(event.target.value)}
                placeholder="e.g. Oil on canvas"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#8e1b24] focus:ring-2 focus:ring-[#8e1b24]/10"
              />
              </label>
              <label className="block text-xs font-bold text-slate-700">Facebook
                <input value={facebook} onChange={(event) => setFacebook(event.target.value)} placeholder="Artist profile" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-[#8e1b24]" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">Dimensions</span>
                <input
                  value={dimensions}
                  onChange={(event) => setDimensions(event.target.value)}
                  placeholder="e.g. 12 x 12 inches"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#8e1b24] focus:ring-2 focus:ring-[#8e1b24]/10"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" /> Issue date
                </span>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(event) => setIssueDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#8e1b24] focus:ring-2 focus:ring-[#8e1b24]/10"
                />
              </label>
            </div>

            {selectedArtworkId && !isArtworkApproved && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                A certificate with a verification QR can only be issued for an artwork approved by Red Nexus.
              </p>
            )}
            {isArtworkApproved && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                The QR code is linked to this approved artwork and will show its Red Nexus authenticity status when scanned.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadCertificate}
                disabled={isExporting || !isArtworkApproved || !qrCodeDataUrl}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#8e1b24] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#75151d] disabled:cursor-wait disabled:opacity-70 sm:text-sm"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Preparing…' : 'Download certificate'}
              </button>
              <button
                type="button"
                onClick={saveDraft}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#8e1b24]/30 hover:text-[#8e1b24] sm:text-sm"
              >
                Save Draft
              </button>
            </div>
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Live preview</h2>
              <p className="mt-1 text-sm text-slate-500">Your downloaded certificate will use this layout.</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ready to personalize
            </span>
          </div>

          <div className="overflow-hidden border border-slate-200 bg-slate-100 p-3 shadow-sm sm:p-5">
            <div
              className="relative mx-auto aspect-[10/7] w-full overflow-hidden border-[6px] border-[#8e1b24] bg-[#fbf8f1] text-center shadow-lg [container-type:inline-size]"
            >
              <div className="absolute left-[4%] top-[4.75%] h-[90.5%] w-[92%] border border-[#c9a96e] bg-white" />
              <div className="absolute left-[7.1%] top-[9.2%] flex aspect-square w-[5.3%] items-center justify-center rounded-full bg-[#9b1c28] text-[#f4e8ce]">
                <Award className="h-[48%] w-[48%]" strokeWidth={2} />
              </div>
              <header className="absolute left-[20%] top-[10.1%] w-[60%] text-center">
                <p className="font-bold uppercase tracking-[0.28em] text-[#8e1b24]" style={{ fontSize: '1.35cqw' }}>
                  Red Nexus · Artist Certificate
                </p>
                <h3 className="font-serif italic leading-[1.05] text-[#bd8646]" style={{ fontSize: '3.25cqw' }}>
                  Certificate of Authenticity
                </h3>
                <p className="mt-[0.25%] text-slate-500" style={{ fontSize: '1.2cqw' }}>
                  This is to guarantee and represents the following artwork is authenticated and signed
                </p>
                <p className="text-slate-500" style={{ fontSize: '1.2cqw' }}>by the artist.</p>
              </header>

              <div className="absolute left-[11%] top-[34%] grid h-[42%] w-[84%] grid-cols-[36%_1fr] gap-[7%] text-left">
                <div className="aspect-[1.28] w-full self-start overflow-hidden rounded-[2.5%] bg-neutral-100">
                  {selectedArtwork ? (
                    <img src={selectedArtwork.image} alt={artworkTitle} className="h-full w-full object-cover" />
                  ) : <FileImage className="h-8 w-8 text-neutral-300" />}
                </div>
                <div className="min-w-0 text-[#53647e]" style={{ fontSize: '1.3cqw' }}>
                  <p className="truncate text-center font-sans italic leading-tight text-[#a82a35]" style={{ fontSize: '2.2cqw' }}>
                    “{artworkTitle || '[Artwork title]'}”
                  </p>
                  <p className="mt-[4%] line-clamp-5 text-justify leading-[1.25]">
                    {description || 'Artwork description will appear here.'}
                  </p>
                  <div className="mt-[7%] grid grid-cols-[37%_61%] gap-[2%]">
                    <div className="space-y-[5%]">
                      <p className="flex items-center gap-[7%] truncate">
                        <img src={facebookIcon} alt="" className="h-[1.65cqw] w-[1.65cqw] shrink-0 object-contain" />
                        <span className="truncate">{facebook || 'Facebook profile'}</span>
                      </p>
                      <p className="flex items-center gap-[7%] truncate">
                        <img src={instagramIcon} alt="" className="h-[1.65cqw] w-[1.65cqw] shrink-0 object-contain" />
                        <span className="truncate">{instagram || '@your_instagram'}</span>
                      </p>
                      <p className="flex items-center gap-[7%] truncate">
                        <img src={whatsappIcon} alt="" className="h-[1.65cqw] w-[1.65cqw] shrink-0 object-contain" />
                        <span className="truncate">{phone || 'Phone number'}</span>
                      </p>
                    </div>
                    <div className="space-y-[5%]">
                      <p className="flex items-center gap-[3%]"><strong className="shrink-0 whitespace-nowrap text-[#555]">Medium:</strong><span className="min-w-0 truncate">{medium || 'Not specified'}</span></p>
                      <p className="flex items-center gap-[3%]"><strong className="shrink-0 whitespace-nowrap text-[#555]">Dimensions:</strong><span className="min-w-0 truncate">{dimensions || 'Not specified'}</span></p>
                      <p className="flex items-center gap-[3%]"><strong className="shrink-0 whitespace-nowrap text-[#555]">Date of Creation:</strong><span className="min-w-0 truncate">{formatDate(issueDate)}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute left-[13%] top-[79.1%] w-[24%] border-t border-slate-400 pt-[0.8%] text-center font-bold uppercase text-[#8e1b24]" style={{ fontSize: '0.95cqw' }}>
                Artist signature
              </div>

              <div className="absolute right-[7.8%] top-[76.2%] z-10 flex w-[9.5%] flex-col items-center bg-white">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR code to verify this artwork" className="w-full" />
                ) : (
                  <div className="flex aspect-square w-full flex-col items-center justify-center bg-[#fbf8f1] text-center font-bold text-[#8e1b24]" style={{ fontSize: '0.8cqw' }}>
                    {isArtworkApproved ? 'GENERATING QR…' : 'SELECT AN APPROVED ARTWORK'}
                  </div>
                )}
                <span className="mt-[5%] font-bold text-slate-600" style={{ fontSize: '0.95cqw' }}>SCAN TO VERIFY</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Artwork image is automatically taken from the selected approved artwork.
          </p>
          <section aria-labelledby="saved-certificate-drafts" className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 id="saved-certificate-drafts" className="text-sm font-bold text-slate-800">Saved drafts</h3>
                <p className="mt-0.5 text-xs text-slate-500">Continue editing a certificate later on this device.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                {savedDrafts.length}/{MAX_SAVED_DRAFTS}
              </span>
            </div>
            {savedDrafts.length > 0 ? (
              <ul className="space-y-2">
                {savedDrafts.map((draft) => (
                  <li key={draft.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800">{draft.artworkTitle || 'Untitled certificate'}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Saved {new Date(draft.savedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => restoreDraft(draft)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#8e1b24]/30 hover:text-[#8e1b24]"
                      >
                        Continue
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDraft(draft.id)}
                        aria-label={`Delete ${draft.artworkTitle || 'untitled'} draft`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-center">
                <FileImage className="mx-auto h-5 w-5 text-slate-400" />
                <p className="mt-2 text-xs font-semibold text-slate-600">Your saved drafts will appear here.</p>
                <p className="mt-1 text-[11px] text-slate-500">Use Save Draft to keep certificate details for later.</p>
              </div>
            )}
          </section>
        </section>
      </div>
    </div>
  );
};
