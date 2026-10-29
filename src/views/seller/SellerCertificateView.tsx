import React, { useEffect, useRef, useState } from 'react';
import { toDataURL } from 'qrcode';
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Download,
  FileImage,
  Hash,
  ImagePlus,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { Artwork } from '../../types';

interface SellerCertificateViewProps {
  artworks: Artwork[];
  artistName: string;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
}

const TEMPLATE_WIDTH = 1200;
const TEMPLATE_HEIGHT = 850;
const starterTemplate = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850">
  <rect width="1200" height="850" fill="#fbf8f1"/>
  <rect x="24" y="24" width="1152" height="802" rx="8" fill="none" stroke="#8e1b24" stroke-width="3"/>
  <rect x="38" y="38" width="1124" height="774" rx="5" fill="none" stroke="#c9a96e" stroke-width="1"/>
  <circle cx="600" cy="125" r="42" fill="#8e1b24"/>
  <path d="M600 98l9 18 20 3-14 14 3 20-18-10-18 10 3-20-14-14 20-3z" fill="#f4e8ce"/>
  <text x="600" y="222" text-anchor="middle" font-family="Georgia,serif" font-size="25" letter-spacing="6" fill="#8e1b24">RED NEXUS • ARTIST CERTIFICATE</text>
  <text x="600" y="302" text-anchor="middle" font-family="Georgia,serif" font-size="56" fill="#252525">Certificate of Authenticity</text>
  <text x="600" y="368" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#666">This document certifies that the artwork</text>
  <text x="600" y="445" text-anchor="middle" font-family="Georgia,serif" font-size="40" font-style="italic" fill="#8e1b24">[Artwork title]</text>
  <text x="600" y="502" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#666">is an original work created by</text>
  <text x="600" y="552" text-anchor="middle" font-family="Georgia,serif" font-size="31" fill="#252525">[Artist name]</text>
  <line x1="205" y1="660" x2="465" y2="660" stroke="#999" stroke-width="1"/>
  <line x1="735" y1="660" x2="995" y2="660" stroke="#999" stroke-width="1"/>
  <text x="335" y="690" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#666">ARTIST SIGNATURE</text>
  <text x="865" y="690" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#666">DATE OF ISSUE</text>
  <text x="600" y="760" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#777">Certificate ID: [Certificate number]</text>
  <rect x="1010" y="670" width="150" height="150" rx="6" fill="#fff" stroke="#8e1b24" stroke-width="2"/>
  <text x="1085" y="735" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#8e1b24">QR CODE</text>
  <text x="1085" y="755" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#555">ADDED WHEN ISSUED</text>
</svg>`;

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedArtworkId, setSelectedArtworkId] = useState(
    () => artworks.find((artwork) => artwork.status === 'approved')?.id ?? ''
  );
  const [artworkTitle, setArtworkTitle] = useState('');
  const [medium, setMedium] = useState('');
  const [certificateNumber, setCertificateNumber] = useState(
    `RN-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  );
  const [issueDate, setIssueDate] = useState(getLocalDateValue());
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const selectedArtwork = artworks.find((item) => item.id === selectedArtworkId);
  const isArtworkApproved = selectedArtwork?.status === 'approved';
  const verificationUrl = selectedArtwork && certificateNumber.trim()
    ? (() => {
        const url = new URL(window.location.href);
        url.search = '';
        url.hash = '';
        url.searchParams.set('verify', selectedArtwork.id);
        url.searchParams.set('certificate', certificateNumber.trim());
        return url.toString();
      })()
    : '';
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

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
    if (artwork) {
      setArtworkTitle(artwork.title);
      setMedium(artwork.genre ?? artwork.category.replace('_', ' '));
    } else {
      setArtworkTitle('');
      setMedium('');
    }
  };

  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const supportedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!supportedTypes.includes(file.type)) {
      onShowToast('Unsupported template', 'Choose a PNG, JPG, WebP, or SVG image template.', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      onShowToast('Template is too large', 'Please choose an image smaller than 8 MB.', 'error');
      return;
    }

    const loadTemplate = (template: Blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          onShowToast('Template could not be loaded', 'Please try another image file.', 'error');
          return;
        }
        setTemplateImage(reader.result);
        setTemplateName(file.name);
        onShowToast('Template uploaded', `${file.name} is ready to use.`, 'success');
      };
      reader.onerror = () => {
        onShowToast('Template could not be loaded', 'Please try another image file.', 'error');
      };
      reader.readAsDataURL(template);
    };

    if (file.type === 'image/svg+xml') {
      file.text().then((source) => {
        const document = new DOMParser().parseFromString(source, 'image/svg+xml');
        if (document.querySelector('parsererror') || document.documentElement.localName !== 'svg') {
          onShowToast('Invalid SVG template', 'Choose a valid SVG image file.', 'error');
          return;
        }
        document.querySelectorAll('script, foreignObject').forEach((element) => element.remove());
        document.querySelectorAll('*').forEach((element) => {
          Array.from(element.attributes).forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value.trim().toLowerCase();
            if (
              name.startsWith('on') ||
              ((name === 'href' || name.endsWith(':href')) && !value.startsWith('#')) ||
              (name === 'style' && (value.includes('url(') || value.includes('@import')))
            ) {
              element.removeAttribute(attribute.name);
            }
          });
        });
        document.querySelectorAll('style').forEach((element) => {
          if (element.textContent?.toLowerCase().includes('@import') || element.textContent?.toLowerCase().includes('url(')) {
            element.remove();
          }
        });
        const safeSvg = new XMLSerializer().serializeToString(document);
        loadTemplate(new Blob([safeSvg], { type: 'image/svg+xml' }));
      }).catch(() => {
        onShowToast('Template could not be loaded', 'Please try another image file.', 'error');
      });
      return;
    }

    loadTemplate(file);
  };

  const downloadStarterTemplate = () => {
    const url = URL.createObjectURL(new Blob([starterTemplate], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'red-nexus-certificate-template.svg';
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Template downloaded', 'Use it as a reference for your own certificate design.', 'success');
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

      if (templateImage) {
        const image = new Image();
        image.src = templateImage;
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error('The uploaded template could not be read.'));
        });
        const scale = Math.max(TEMPLATE_WIDTH / image.width, TEMPLATE_HEIGHT / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        context.drawImage(image, (TEMPLATE_WIDTH - width) / 2, (TEMPLATE_HEIGHT - height) / 2, width, height);
        context.fillStyle = 'rgba(255, 255, 255, 0.84)';
        context.fillRect(100, 90, 1000, 670);
      } else {
        context.fillStyle = '#fbf8f1';
        context.fillRect(0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
        context.strokeStyle = '#8e1b24';
        context.lineWidth = 4;
        context.strokeRect(24, 24, TEMPLATE_WIDTH - 48, TEMPLATE_HEIGHT - 48);
        context.strokeStyle = '#c9a96e';
        context.lineWidth = 1;
        context.strokeRect(38, 38, TEMPLATE_WIDTH - 76, TEMPLATE_HEIGHT - 76);
      }

      const centeredText = (text: string, y: number, font: string, color: string) => {
        context.font = font;
        context.fillStyle = color;
        context.textAlign = 'center';
        context.fillText(text, TEMPLATE_WIDTH / 2, y, 1000);
      };
      centeredText('RED NEXUS  •  ARTIST CERTIFICATE', 170, '600 22px Arial, sans-serif', '#8e1b24');
      centeredText('Certificate of Authenticity', 260, '56px Georgia, serif', '#252525');
      centeredText('This document certifies that the artwork', 325, '20px Arial, sans-serif', '#666666');
      centeredText(artworkTitle.trim(), 405, 'italic 40px Georgia, serif', '#8e1b24');
      if (medium.trim()) centeredText(medium.trim(), 445, '18px Arial, sans-serif', '#666666');
      centeredText('is an original work created by', 500, '20px Arial, sans-serif', '#666666');
      centeredText(artistName, 550, '32px Georgia, serif', '#252525');

      context.strokeStyle = '#999999';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(205, 660);
      context.lineTo(465, 660);
      context.moveTo(735, 660);
      context.lineTo(995, 660);
      context.stroke();
      context.textAlign = 'center';
      context.fillStyle = '#666666';
      context.font = '16px Arial, sans-serif';
      context.fillText('ARTIST SIGNATURE', 335, 690);
      context.fillText(formatDate(issueDate).toUpperCase(), 865, 690);
      context.fillStyle = '#777777';
      context.font = '14px Arial, sans-serif';
      context.fillText(`Certificate ID: ${certificateNumber}`, TEMPLATE_WIDTH / 2, 760, 700);

      const qrImage = new Image();
      qrImage.src = qrCodeDataUrl;
      await new Promise<void>((resolve, reject) => {
        qrImage.onload = () => resolve();
        qrImage.onerror = () => reject(new Error('The verification QR code could not be added to the certificate.'));
      });
      context.fillStyle = '#ffffff';
      context.fillRect(1012, 672, 152, 166);
      context.drawImage(qrImage, 1024, 682, 128, 128);
      context.fillStyle = '#555555';
      context.font = '12px Arial, sans-serif';
      context.textAlign = 'center';
      context.fillText('SCAN TO VERIFY', 1088, 826);

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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8e1b24]">
            <ShieldCheck className="h-4 w-4" />
            Artist tools
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Certificate of Authenticity
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Create a certificate for a platform-approved artwork. Its QR code opens the Red Nexus authenticity check.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadStarterTemplate}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#8e1b24]/30 hover:text-[#8e1b24]"
        >
          <Download className="h-4 w-4" />
          Download starter template
        </button>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Certificate details</h2>
            <p className="mt-1 text-sm text-slate-500">Add the information that will appear on the certificate.</p>
          </div>

          <div className="space-y-4">
            {artworks.length > 0 && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">Choose from your artworks</span>
                <select
                  value={selectedArtworkId}
                  onChange={(event) => handleArtworkChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#8e1b24] focus:ring-2 focus:ring-[#8e1b24]/10"
                >
                  <option value="">Select an artwork (optional)</option>
                  {artworks.map((artwork) => (
                    <option key={artwork.id} value={artwork.id} disabled={artwork.status !== 'approved'}>
                      {artwork.title} ({artwork.status === 'approved' ? 'Approved' : `Not approved: ${artwork.status}`})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Artwork title</span>
              <input
                value={artworkTitle}
                onChange={(event) => setArtworkTitle(event.target.value)}
                placeholder="e.g. Study in Warm Light"
                readOnly={Boolean(selectedArtworkId)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#8e1b24] focus:ring-2 focus:ring-[#8e1b24]/10"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Medium or materials</span>
              <input
                value={medium}
                onChange={(event) => setMedium(event.target.value)}
                placeholder="e.g. Oil on canvas"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#8e1b24] focus:ring-2 focus:ring-[#8e1b24]/10"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Hash className="h-3.5 w-3.5 text-slate-400" /> Certificate ID
                </span>
                <input
                  value={certificateNumber}
                  onChange={(event) => setCertificateNumber(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#8e1b24] focus:ring-2 focus:ring-[#8e1b24]/10"
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

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white p-2 text-[#8e1b24] shadow-sm">
                  <FileImage className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">Use your own design</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Upload a PNG, JPG, WebP, or SVG template (up to 8 MB). The certificate details are layered over it.
                  </p>
                  {templateName && (
                    <p className="mt-2 flex items-center gap-1.5 truncate text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      {templateName}
                    </p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleTemplateUpload}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#8e1b24]/30 hover:text-[#8e1b24]"
                  >
                    {templateImage ? <Upload className="h-3.5 w-3.5" /> : <ImagePlus className="h-3.5 w-3.5" />}
                    {templateImage ? 'Replace template' : 'Upload template'}
                  </button>
                  {templateImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateImage(null);
                        setTemplateName('');
                      }}
                      className="ml-2 mt-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"
                    >
                      Use default
                    </button>
                  )}
                </div>
              </div>
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

            <button
              type="button"
              onClick={downloadCertificate}
              disabled={isExporting || !isArtworkApproved || !qrCodeDataUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8e1b24] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#75151d] disabled:cursor-wait disabled:opacity-70"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Preparing certificate…' : 'Download certificate with QR (PNG)'}
            </button>
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

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-3 shadow-sm sm:p-5">
            <div
              className={`relative mx-auto aspect-[1200/850] w-full overflow-hidden border-[6px] border-[#8e1b24] bg-[#fbf8f1] p-[3%] text-center shadow-lg ${
                templateImage ? 'bg-cover bg-center' : ''
              }`}
              style={templateImage ? { backgroundImage: `url("${templateImage}")` } : undefined}
            >
              <div className="flex h-full flex-col items-center justify-center border border-[#c9a96e] bg-[#fbf8f1]/90 px-4 text-center sm:px-8">
                <div className="mb-[2%] flex h-[9%] aspect-square items-center justify-center rounded-full bg-[#8e1b24] text-[#f4e8ce]">
                  <Award className="h-1/2 w-1/2" />
                </div>
                <p className="text-[clamp(6px,1.4vw,15px)] font-bold uppercase tracking-[0.2em] text-[#8e1b24]">
                  Red Nexus • Artist Certificate
                </p>
                <h3 className="mt-[2%] font-serif text-[clamp(12px,3.6vw,38px)] text-[#252525]">
                  Certificate of Authenticity
                </h3>
                <p className="mt-[2%] text-[clamp(7px,1.5vw,16px)] text-slate-600">
                  This document certifies that the artwork
                </p>
                <p className="mt-[2%] max-w-full truncate font-serif text-[clamp(12px,2.8vw,30px)] italic text-[#8e1b24]">
                  {artworkTitle || '[Artwork title]'}
                </p>
                {medium && (
                  <p className="mt-1 text-[clamp(6px,1.2vw,13px)] text-slate-500">{medium}</p>
                )}
                <p className="mt-[2%] text-[clamp(7px,1.5vw,16px)] text-slate-600">is an original work created by</p>
                <p className="mt-1 max-w-full truncate font-serif text-[clamp(10px,2.2vw,23px)] text-[#252525]">
                  {artistName}
                </p>
                <div className="mt-auto grid w-full grid-cols-2 gap-[10%] px-[6%] pt-[5%]">
                  <div className="border-t border-slate-400 pt-1.5 text-[clamp(5px,1vw,11px)] font-semibold uppercase tracking-wide text-slate-500">
                    Artist signature
                  </div>
                  <div className="border-t border-slate-400 pt-1.5 text-[clamp(5px,1vw,11px)] font-semibold uppercase tracking-wide text-slate-500">
                    {formatDate(issueDate)}
                  </div>
                </div>
                <p className="mt-[2%] text-[clamp(5px,1vw,11px)] text-slate-500">
                  Certificate ID: {certificateNumber || '—'}
                </p>
              </div>
              <div className="absolute bottom-[3%] right-[3%] z-10 flex w-[15%] flex-col items-center border border-[#8e1b24] bg-white p-[0.5%]">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR code to verify this artwork" className="w-full" />
                ) : (
                  <div className="flex aspect-square w-full flex-col items-center justify-center bg-[#fbf8f1] text-center text-[clamp(5px,0.8vw,9px)] font-bold text-[#8e1b24]">
                    {isArtworkApproved ? 'GENERATING QR…' : 'SELECT AN APPROVED ARTWORK'}
                  </div>
                )}
                <span className="text-[clamp(4px,0.7vw,8px)] font-bold text-slate-600">SCAN TO VERIFY</span>
                </div>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-slate-500">
            <Upload className="h-3.5 w-3.5 shrink-0" />
            {templateImage
              ? 'Your uploaded image is used as the certificate background.'
              : 'The included design is used by default. Download the starter SVG to create your own design.'}
          </p>
        </section>
      </div>
    </div>
  );
};
