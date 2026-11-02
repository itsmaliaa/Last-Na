import React, { useState } from 'react';
import {
  Download,
  ImagePlus,
  Search,
  TrendingUp,
  Tag,
  DollarSign,
  CheckCircle2,
  FileText,
  ArrowLeft,
  CreditCard,
  User,
  Calendar,
  ExternalLink,
  List,
  LayoutGrid,
  Package,
  ChevronRight,
  Truck,
  MapPin,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { Conversation, DeliveryCompletionDetails, RefundRequest, SellerOrderTransaction, SellerTab, ShipmentDetails } from '../../types';

type OrderCategory = 'to_ship' | 'shipped' | 'out_for_delivery' | 'completed' | 'returned' | 'cancelled';
type OrderCategoryFilter = 'all' | OrderCategory;
type ProductTypeFilter = 'all' | 'pre_made' | 'custom_made' | 'digital';

const getOrderCategory = (transaction: SellerOrderTransaction): OrderCategory => {
  if (transaction.status === 'Cancelled') return 'cancelled';
  if (transaction.fulfillmentStatus === 'Returned') return 'returned';
  if (transaction.status === 'Completed' || transaction.fulfillmentStatus === 'Delivered') return 'completed';
  if (transaction.fulfillmentStatus === 'Out for Delivery') return 'out_for_delivery';
  if (
    transaction.status === 'Shipped' ||
    transaction.fulfillmentStatus === 'Shipped'
  ) return 'shipped';
  if (transaction.deliveryMethod === 'door_to_door') return 'to_ship';
  return 'to_ship';
};

const ORDER_CATEGORIES: { id: OrderCategoryFilter; label: string }[] = [
  { id: 'all', label: 'All orders' },
  { id: 'to_ship', label: 'To ship' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'completed', label: 'Completed' },
  { id: 'returned', label: 'Return' },
];

const ORDER_CATEGORY_STYLES: Record<OrderCategory, string> = {
  to_ship: 'bg-amber-50 text-amber-800 border-amber-200',
  shipped: 'bg-blue-50 text-blue-800 border-blue-200',
  out_for_delivery: 'bg-violet-50 text-violet-800 border-violet-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  returned: 'bg-orange-50 text-orange-800 border-orange-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

interface SellerOrderViewProps {
  transactions: SellerOrderTransaction[];
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateTab?: (tab: SellerTab) => void;
  renderToShipView: (onBack: () => void) => React.ReactNode;
  onCompleteDelivery: (id: string, details: DeliveryCompletionDetails) => void;
  onUpdateShippedDetails: (id: string, shipment: ShipmentDetails) => void;
  onUpdateShipping: (id: string, fulfillmentStatus: 'Out for Delivery') => void;
  refundRequests: RefundRequest[];
  conversations: Conversation[];
  onRefundRequestDecision: (requestId: string, status: 'approved' | 'declined') => void;
  onNavigateToCustomerService: (conversationId: string) => void;
}

const prepareProofImage = async (file: File): Promise<string> => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image for proof of delivery.');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Choose an image smaller than 8 MB.');
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The selected image could not be read.'));
    });

    const scale = Math.min(1, 1200 / image.width, 1200 / image.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is not available in this browser.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const compressedImage = canvas.toDataURL('image/jpeg', 0.72);
    if (compressedImage.length > 1_500_000) {
      throw new Error('This image is still too large to save. Choose a smaller or more compressed image.');
    }
    return compressedImage;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

type ExportCell = string | number;

const SALES_EXPORT_HEADERS = [
  'ORDER NUMBER',
  'ARTWORK',
  'ARTIST',
  'BUYER',
  'DATE',
  'GROSS AMOUNT',
  'PLATFORM TAKE',
  'NET STUDENT PAYOUT',
  'PAYMENT METHOD',
  'FULFILLMENT STATUS',
  'SHIPPING PROVIDER',
  'TRACKING NUMBER',
];

const getSalesExportRows = (transactions: SellerOrderTransaction[]): ExportCell[][] => (
  transactions.map((transaction) => [
    transaction.orderNumber || transaction.id,
    transaction.artwork,
    transaction.artist,
    transaction.buyer,
    transaction.date,
    transaction.grossAmount,
    transaction.platformTakeAmount,
    transaction.netStudentPayout,
    transaction.paymentMethod || '',
    transaction.fulfillmentStatus || transaction.status,
    transaction.shippingProvider || '',
    transaction.trackingNumber || '',
  ])
);

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const columnName = (index: number) => {
  let name = '';
  let current = index + 1;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
};

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
};

const createStoredZip = (files: { name: string; content: string }[]) => {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  files.forEach(({ name, content }) => {
    const fileName = encoder.encode(name);
    const fileData = encoder.encode(content);
    const checksum = crc32(fileData);
    const localHeader = new Uint8Array(30 + fileName.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0x21, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, fileData.length, true);
    localView.setUint32(22, fileData.length, true);
    localView.setUint16(26, fileName.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(fileName, 30);
    localParts.push(localHeader, fileData);

    const centralHeader = new Uint8Array(46 + fileName.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0x21, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, fileData.length, true);
    centralView.setUint32(24, fileData.length, true);
    centralView.setUint16(28, fileName.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(fileName, 46);
    centralParts.push(centralHeader);
    localOffset += localHeader.length + fileData.length;
  });

  const centralDirectory = new Blob(centralParts.map(toArrayBuffer));
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralDirectory.size, true);
  endView.setUint32(16, localOffset, true);
  return new Blob([
    ...localParts.map(toArrayBuffer),
    ...centralParts.map(toArrayBuffer),
    toArrayBuffer(endRecord),
  ], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

const createSalesWorkbook = (rows: ExportCell[][]) => {
  const worksheetRows = [SALES_EXPORT_HEADERS, ...rows].map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
      if (typeof value === 'number') return `<c r="${reference}"><v>${value}</v></c>`;
      return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    }).join('');
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join('');
  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${worksheetRows}</sheetData></worksheet>`;
  return createStoredZip([
    {
      name: '[Content_Types].xml',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    },
    {
      name: '_rels/.rels',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    },
    {
      name: 'xl/workbook.xml',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Completed Sales" sheetId="1" r:id="rId1"/></sheets></workbook>',
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    },
    { name: 'xl/worksheets/sheet1.xml', content: worksheet },
  ]);
};

interface SaveFileHandle {
  name: string;
  createWritable: () => Promise<{
    write: (data: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
}

interface SaveFilePickerOptions {
  suggestedName: string;
  excludeAcceptAllOption: boolean;
  types: {
    description: string;
    accept: Record<string, string[]>;
  }[];
}

const createSalesPdf = async (transactions: SellerOrderTransaction[], exportDate: string) => {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape' });
  const left = 12;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let y = 14;
  pdf.setFontSize(16);
  pdf.text('Red Nexus - Completed Sales', left, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.text(`Exported ${exportDate} | ${transactions.length} completed order${transactions.length === 1 ? '' : 's'}`, left, y);
  y += 9;
  pdf.setFontSize(8);

  transactions.forEach((transaction, index) => {
    const lines = [
      `${transaction.orderNumber || transaction.id} | ${transaction.date} | ${transaction.artwork}`,
      `Artist: ${transaction.artist} | Buyer: ${transaction.buyer}`,
      `Gross: PHP ${transaction.grossAmount.toLocaleString()} | Platform take: PHP ${transaction.platformTakeAmount.toLocaleString()} | Net payout: PHP ${transaction.netStudentPayout.toLocaleString()}`,
      `Payment: ${transaction.paymentMethod || 'Not specified'} | Status: ${transaction.fulfillmentStatus || transaction.status}`,
      `Shipping: ${transaction.shippingProvider || 'N/A'} | Tracking: ${transaction.trackingNumber || 'N/A'}`,
    ];
    const wrappedLines = lines.flatMap((line) => pdf.splitTextToSize(line, pageWidth - left * 2));
    const blockHeight = wrappedLines.length * 4 + 5;
    if (y + blockHeight > pageHeight - 10) {
      pdf.addPage();
      y = 14;
    }
    pdf.setFont('helvetica', 'bold');
    pdf.text(wrappedLines[0], left, y);
    pdf.setFont('helvetica', 'normal');
    wrappedLines.slice(1).forEach((line, lineIndex) => {
      pdf.text(line, left, y + (lineIndex + 1) * 4);
    });
    y += wrappedLines.length * 4 + 5;
    if (index < transactions.length - 1) {
      pdf.setDrawColor(220, 220, 220);
      pdf.line(left, y - 2, pageWidth - left, y - 2);
    }
  });
  return pdf.output('blob');
};

export const SellerOrderView: React.FC<SellerOrderViewProps> = ({
  transactions,
  onShowToast,
  onNavigateTab,
  renderToShipView,
  onCompleteDelivery,
  onUpdateShippedDetails,
  onUpdateShipping,
  refundRequests,
  conversations,
  onRefundRequestDecision,
  onNavigateToCustomerService,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<SellerOrderTransaction | null>(null);
  const [showToShipView, setShowToShipView] = useState(false);
  const [proofOfDeliveryImage, setProofOfDeliveryImage] = useState('');
  const [deliveryRiderName, setDeliveryRiderName] = useState('');
  const [deliveryRiderPhone, setDeliveryRiderPhone] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [shippingProvider, setShippingProvider] = useState('');
  const [trackingDetailsError, setTrackingDetailsError] = useState('');
  const [proofImageError, setProofImageError] = useState('');
  const [displayMode, setDisplayMode] = useState<'list' | 'table'>('list');
  const [categoryFilter, setCategoryFilter] = useState<OrderCategoryFilter>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<ProductTypeFilter>('all');
  const [activeTodo, setActiveTodo] = useState<'orders_to_ship' | 'pending_returns' | 'unread_messages' | 'low_stock'>('orders_to_ship');
  const sellerRefundRequests = refundRequests.filter((request) => (
    transactions.some((transaction) => transaction.id === request.orderId)
  ));
  const pendingRefundRequests = sellerRefundRequests.filter((request) => request.status === 'pending');
  const unreadBuyerConversations = conversations.filter((conversation) => conversation.unread);
  const getTransactionCategory = getOrderCategory;

  const openTransaction = (transaction: SellerOrderTransaction) => {
    setSelectedTx(transaction);
    setProofOfDeliveryImage(transaction.proofOfDeliveryImage || '');
    setDeliveryRiderName(transaction.deliveryRiderName || '');
    setDeliveryRiderPhone(transaction.deliveryRiderPhone || '');
    setTrackingNumber(transaction.trackingNumber || '');
    setTrackingUrl(transaction.trackingUrl || '');
    setShippingProvider(transaction.shippingProvider || '');
    setTrackingDetailsError('');
    setProofImageError('');
  };

  const handleProofImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setProofOfDeliveryImage(await prepareProofImage(file));
      setProofImageError('');
    } catch (error) {
      setProofImageError(error instanceof Error ? error.message : 'The proof image could not be prepared.');
    }
  };

  const handleCompleteDelivery = () => {
    if (!selectedTx || !proofOfDeliveryImage) {
      setProofImageError('Upload proof of delivery before marking this order completed.');
      return;
    }
    onCompleteDelivery(selectedTx.id, { proofOfDeliveryImage });
    setSelectedTx(null);
  };

  const persistShippedDetails = (): boolean => {
    if (!selectedTx || !shippingProvider.trim() || !trackingNumber.trim() || !trackingUrl.trim()) {
      setTrackingDetailsError('Enter the carrier, tracking number, and tracking link before continuing.');
      return false;
    }
    let parsedTrackingUrl: URL;
    try {
      parsedTrackingUrl = new URL(trackingUrl.trim());
    } catch {
      setTrackingDetailsError('Enter a valid carrier tracking link.');
      return false;
    }
    if (!['http:', 'https:'].includes(parsedTrackingUrl.protocol)) {
      setTrackingDetailsError('Tracking link must start with http:// or https://.');
      return false;
    }
    onUpdateShippedDetails(selectedTx.id, {
      shippingProvider: shippingProvider.trim(),
      trackingNumber: trackingNumber.trim(),
      trackingUrl: parsedTrackingUrl.toString(),
      deliveryRiderName: deliveryRiderName.trim() || undefined,
      deliveryRiderPhone: deliveryRiderPhone.trim() || undefined,
      parcelWeightKg: selectedTx.parcelWeightKg,
      parcelLengthCm: selectedTx.parcelLengthCm,
      parcelWidthCm: selectedTx.parcelWidthCm,
      parcelHeightCm: selectedTx.parcelHeightCm,
    });
    return true;
  };

  const handleMarkOutForDelivery = () => {
    if (!selectedTx || !persistShippedDetails()) return;
    onUpdateShipping(selectedTx.id, 'Out for Delivery');
    setCategoryFilter('out_for_delivery');
    setSelectedTx(null);
  };

  // Filter transactions
  const searchedTransactions = transactions.filter((tx) => {
    const q = searchTerm.toLowerCase();
    return (
      tx.artwork.toLowerCase().includes(q) ||
      tx.artist.toLowerCase().includes(q) ||
      tx.buyer.toLowerCase().includes(q) ||
      tx.date.toLowerCase().includes(q) ||
      tx.orderNumber?.toLowerCase().includes(q) ||
      tx.trackingNumber?.toLowerCase().includes(q)
    );
  });
  const filteredTransactions = searchedTransactions.filter((transaction) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'returned') {
      return getTransactionCategory(transaction) === 'returned';
    }
    return getTransactionCategory(transaction) === categoryFilter;
  });
  const typeFilteredTransactions = filteredTransactions.filter((transaction) => (
    productTypeFilter === 'all' || (transaction.productType ?? 'pre_made') === productTypeFilter
  ));
  const categoryCounts = transactions.reduce<Record<OrderCategoryFilter, number>>((counts, transaction) => {
    counts.all += 1;
    counts[getTransactionCategory(transaction)] += 1;
    return counts;
  }, { all: 0, to_ship: 0, shipped: 0, out_for_delivery: 0, completed: 0, returned: 0, cancelled: 0 });
  categoryCounts.returned = new Set([
    ...transactions
      .filter((transaction) => getOrderCategory(transaction) === 'returned')
      .map((transaction) => transaction.id),
    ...sellerRefundRequests.map((request) => request.orderId),
  ]).size;

  // Calculate dynamic totals
  const totalGross = transactions.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalPayout = transactions.reduce((acc, curr) => acc + curr.netStudentPayout, 0);
  const ordersToShipCount = categoryCounts.to_ship;

  const completedTransactions = transactions.filter(
    (transaction) => getTransactionCategory(transaction) === 'completed'
  );
  const exportRows = getSalesExportRows(completedTransactions);
  const exportDate = new Date().toISOString().slice(0, 10);

  const handleExportData = async () => {
    if (completedTransactions.length === 0) return;
    const showSaveFilePicker = (
      window as Window & {
        showSaveFilePicker?: (options: SaveFilePickerOptions) => Promise<SaveFileHandle>;
      }
    ).showSaveFilePicker;
    if (!showSaveFilePicker) {
      onShowToast(
        'Save dialog unavailable',
        'Use a browser that supports the system Save dialog to choose the export format and location.',
        'error'
      );
      return;
    }

    try {
      const fileHandle = await showSaveFilePicker.call(window, {
        suggestedName: `red_nexus_completed_sales_${exportDate}.pdf`,
        excludeAcceptAllOption: true,
        types: [
          { description: 'PDF document', accept: { 'application/pdf': ['.pdf'] } },
          {
            description: 'Excel workbook',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
          },
          { description: 'CSV file', accept: { 'text/csv': ['.csv'] } },
        ],
      });

      const extension = fileHandle.name.split('.').pop()?.toLowerCase();
      let exportBlob: Blob;
      if (extension === 'pdf') {
        exportBlob = await createSalesPdf(completedTransactions, exportDate);
      } else if (extension === 'xlsx') {
        exportBlob = createSalesWorkbook(exportRows);
      } else if (extension === 'csv') {
        const csvCell = (value: ExportCell) => {
          const safeValue = typeof value === 'string' && /^[=+\-@]/.test(value)
            ? `'${value}`
            : String(value);
          return `"${safeValue.replace(/"/g, '""')}"`;
        };
        const csvContent = [SALES_EXPORT_HEADERS, ...exportRows]
          .map((row) => row.map(csvCell).join(','))
          .join('\r\n');
        exportBlob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8' });
      } else {
        throw new Error('Choose PDF, Excel (.xlsx), or CSV as the file type.');
      }

      const writable = await fileHandle.createWritable();
      await writable.write(exportBlob);
      await writable.close();
      onShowToast('Completed sales exported', `Saved ${completedTransactions.length} completed order${completedTransactions.length === 1 ? '' : 's'} to ${fileHandle.name}.`, 'success');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      onShowToast(
        'Export failed',
        error instanceof Error ? error.message : 'Completed sales could not be saved.',
        'error'
      );
    }
  };

  return (
    <div className="space-y-6">
      {showToShipView ? renderToShipView(() => {
        setShowToShipView(false);
        setCategoryFilter('all');
      }) : (
      <>
      {!selectedTx && (
        <>
      {/* Top Action Row: Export completed sales only */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Orders & Student Payouts Ledger
          </h2>
          <p className="text-xs text-neutral-500">
            Save completed orders only as PDF, Excel, or CSV.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportData}
          disabled={completedTransactions.length === 0}
          className="flex items-center gap-2 rounded-full bg-[#DC2626] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* TO-DO LIST (Exact match to uploaded image 401453e6-cfb5-4e7e-a743-c53444ab9b18.jpg) */}
      <div className="bg-[#fbfbfb] rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            To-do list
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            These are the key daily tasks for your shop.
          </p>
        </div>

        {/* 4 Items in a Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {/* 1. Orders to ship */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setActiveTodo('orders_to_ship');
                setShowToShipView(true);
              }}
              className={`w-full p-3.5 rounded-xl text-left transition-all cursor-pointer group ${
                activeTodo === 'orders_to_ship'
                  ? 'bg-[#e9ecef] shadow-2xs'
                  : 'hover:bg-neutral-100/70'
              }`}
            >
              <div className="flex items-center justify-between text-slate-600 font-medium text-xs sm:text-sm">
                <span className="font-semibold group-hover:text-red-600 transition-colors">
                  Orders to ship
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                {ordersToShipCount}
              </div>
            </button>
          </div>

          {/* 2. Pending returns > */}
          <button
            type="button"
            onClick={() => {
              setActiveTodo('pending_returns');
              const firstPendingRequest = pendingRefundRequests[0];
              if (!firstPendingRequest) {
                onShowToast('Pending returns', 'There are no refund requests awaiting review.', 'info');
                return;
              }
              onNavigateToCustomerService(
                `refund-${firstPendingRequest.buyerEmail.toLowerCase()}-${firstPendingRequest.orderId}`
              );
            }}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer group ${
              activeTodo === 'pending_returns'
                ? 'bg-[#e9ecef] shadow-2xs'
                : 'hover:bg-neutral-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-600 font-medium text-xs sm:text-sm">
              <span className="font-semibold group-hover:text-red-600 transition-colors">
                Pending returns
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              {pendingRefundRequests.length}
            </div>
            <div className="text-xs text-neutral-400 font-medium mt-1">
              {pendingRefundRequests.length ? 'Requests need review' : 'All caught up!'}
            </div>
          </button>

          {/* 3. Unread buyer messages > */}
          <button
            type="button"
            onClick={() => {
              setActiveTodo('unread_messages');
              const firstUnread = unreadBuyerConversations[0];
              if (!firstUnread) {
                onShowToast('Unread messages', 'You are all caught up on buyer inquiries.', 'info');
                return;
              }
              onNavigateToCustomerService(firstUnread.id);
            }}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer group ${
              activeTodo === 'unread_messages'
                ? 'bg-[#e9ecef] shadow-2xs'
                : 'hover:bg-neutral-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-600 font-medium text-xs sm:text-sm">
              <span className="font-semibold group-hover:text-red-600 transition-colors">
                Unread buyer messages
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              {unreadBuyerConversations.length}
            </div>
            <div className="text-xs text-neutral-400 font-medium mt-1">
              {unreadBuyerConversations.length ? 'Messages need a reply' : 'All caught up!'}
            </div>
          </button>

          {/* 4. Low stock > */}
          <button
            type="button"
            onClick={() => {
              setActiveTodo('low_stock');
              if (onNavigateTab) {
                onNavigateTab('stock');
              } else {
                onShowToast('Low stock', 'All stock inventory levels are adequate.', 'info');
              }
            }}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer group ${
              activeTodo === 'low_stock'
                ? 'bg-[#e9ecef] shadow-2xs'
                : 'hover:bg-neutral-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-600 font-medium text-xs sm:text-sm">
              <span className="font-semibold group-hover:text-red-600 transition-colors">
                Low stock
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              0
            </div>
            <div className="text-xs text-neutral-400 font-medium mt-1">
              All caught up!
            </div>
          </button>
        </div>
      </div>

      {/* Main Orders Card: List Type / Table Type */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-6 space-y-6">
        <div className="flex gap-2 overflow-x-auto border-b border-neutral-100 pb-4" role="group" aria-label="Filter orders by status">
          {ORDER_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={categoryFilter === category.id}
              onClick={() => {
                if (category.id === 'to_ship') {
                  setShowToShipView(true);
                  return;
                }
                setCategoryFilter(category.id);
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                categoryFilter === category.id
                  ? 'bg-[#8e1b24] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {category.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                categoryFilter === category.id ? 'bg-white/20 text-white' : 'bg-white text-neutral-600'
              }`}>
                {categoryCounts[category.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input Row & Count & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search artwork, artist, buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-400 focus:bg-white transition-all text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-neutral-500">
              {filteredTransactions.length} order{filteredTransactions.length === 1 ? '' : 's'}
            </span>

            {/* View Mode Toggle: List Type vs Table Type */}
            <div className="inline-flex bg-neutral-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setDisplayMode('list')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  displayMode === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-neutral-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('table')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  displayMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-neutral-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. LIST TYPE VIEW (Shows: what item, price, amount, platform take, date sold) */}
        {displayMode === 'list' && (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => openTransaction(tx)}
                className="p-5 rounded-2xl border border-neutral-200/80 hover:border-red-300 hover:shadow-xs transition-all bg-white cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* What item & artist */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-red-600" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-slate-900 group-hover:text-red-600 transition-colors">
                        {tx.artwork}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${ORDER_CATEGORY_STYLES[getTransactionCategory(tx)]}`}>
                        {sellerRefundRequests.some((request) => request.orderId === tx.id)
                          ? 'Refund request'
                          : ORDER_CATEGORIES.find((category) => category.id === getTransactionCategory(tx))?.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Artist: <span className="font-medium text-slate-700">{tx.artist}</span> · Buyer: <span className="font-medium text-slate-700">{tx.buyer}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Date Sold: <strong className="text-slate-700 font-semibold">{tx.date}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Price, Platform Take, Net Payout */}
                <div className="grid grid-cols-3 gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100 text-xs">
                  {/* Price / Gross Amount */}
                  <div className="bg-neutral-50 p-3 rounded-xl text-center md:text-left">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Price / Gross
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      ₱{tx.grossAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Platform Take */}
                  <div className="bg-neutral-50 p-3 rounded-xl text-center md:text-left">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Platform Take
                    </span>
                    <span className="inline-flex items-center font-bold text-xs text-neutral-700">
                      ₱{tx.platformTakeAmount} (0%)
                    </span>
                  </div>

                  {/* Net Student Payout */}
                  <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl text-center md:text-left">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Net Payout
                    </span>
                    <span className="font-extrabold text-sm text-[#16A34A]">
                      ₱{tx.netStudentPayout.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="py-12 text-center text-neutral-400 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-neutral-300" />
                <p className="font-semibold text-sm text-slate-700">
                  {transactions.length === 0 ? 'No orders recorded yet' : `No ${categoryFilter === 'all' ? '' : `${ORDER_CATEGORIES.find((category) => category.id === categoryFilter)?.label.toLowerCase()} `}orders found`}
                </p>
                <p className="text-xs text-neutral-400">Orders matching this status and search will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. TABLE VIEW */}
        {displayMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-semibold">ARTWORK</th>
                  <th className="pb-3 px-4 font-semibold">ARTIST</th>
                  <th className="pb-3 px-4 font-semibold">BUYER</th>
                  <th className="pb-3 px-4 font-semibold">DATE SOLD</th>
                  <th className="pb-3 px-4 font-semibold">PRICE</th>
                  <th className="pb-3 px-4 font-semibold">PLATFORM TAKE</th>
                  <th className="pb-3 px-4 font-semibold">NET STUDENT PAYOUT</th>
                  <th className="pb-3 pl-4 font-semibold text-right sm:text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => openTransaction(tx)}
                    className="hover:bg-neutral-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pr-4 font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      {tx.artwork}
                    </td>
                    <td className="py-4 px-4 text-slate-600">{tx.artist}</td>
                    <td className="py-4 px-4 text-slate-600">{tx.buyer}</td>
                    <td className="py-4 px-4 text-neutral-500 whitespace-nowrap">{tx.date}</td>
                    <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                      ₱{tx.grossAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                        ₱{tx.platformTakeAmount} (0%)
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#16A34A] whitespace-nowrap">
                      ₱{tx.netStudentPayout.toLocaleString()}
                    </td>
                    <td className="py-4 pl-4 text-right sm:text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${ORDER_CATEGORY_STYLES[getTransactionCategory(tx)]}`}>
                        {sellerRefundRequests.some((request) => request.orderId === tx.id)
                          ? 'Refund request'
                          : ORDER_CATEGORIES.find((category) => category.id === getTransactionCategory(tx))?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}

      {/* Order details with the status queue kept alongside the selected order */}
      {selectedTx && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-red-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to manage orders
              </button>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {categoryFilter === 'out_for_delivery'
                  ? 'Fulfillment and Delivery'
                  : ORDER_CATEGORIES.find((category) => category.id === categoryFilter)?.label || 'Manage orders'}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-neutral-500">
                {categoryFilter === 'shipped'
                  ? 'Review carrier tracking and rider details for shipped orders.'
                  : categoryFilter === 'out_for_delivery'
                  ? 'Confirm delivery with proof, then mark the order completed.'
                  : 'Select an order to review its details and fulfillment status.'}
              </p>
            </div>
            {(categoryFilter === 'shipped' || categoryFilter === 'out_for_delivery') && (
              <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-950">
                <Truck className="h-5 w-5 shrink-0 text-amber-700" />
                Parcel location is checked with the carrier, outside this app.
              </div>
            )}
          </div>

          <div className="grid items-start gap-5 xl:grid-cols-3">
            <aside className="space-y-3">
              <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 pb-2" role="group" aria-label="Filter orders by product type">
                {([
                  ['all', 'All'],
                  ['pre_made', 'Pre-made'],
                  ['custom_made', 'Custom'],
                  ['digital', 'Digital'],
                ] as const).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={productTypeFilter === type}
                    onClick={() => setProductTypeFilter(type)}
                    className={`shrink-0 px-3 py-2 text-xs font-semibold transition-colors ${
                      productTypeFilter === type
                        ? 'border-b-2 border-[#8e1b24] text-[#8e1b24]'
                        : 'text-neutral-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {typeFilteredTransactions.map((transaction) => (
                  <button
                    key={transaction.id}
                    type="button"
                    onClick={() => openTransaction(transaction)}
                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                      selectedTx.id === transaction.id
                        ? 'border-[#8e1b24] bg-red-50/30'
                        : 'border-neutral-200 bg-white hover:border-red-200'
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-bold text-slate-900">{transaction.artwork}</span>
                      <span className="shrink-0 text-xs font-bold text-slate-900">
                        ₱{transaction.grossAmount.toLocaleString()}
                      </span>
                    </span>
                    <span className="mt-2 block text-xs text-neutral-500">
                      {transaction.orderNumber || transaction.id} · {transaction.buyer}
                    </span>
                  </button>
                ))}
                {typeFilteredTransactions.length === 0 && (
                  <p className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
                    No orders in this product type.
                  </p>
                )}
              </div>
            </aside>

            <section className="min-w-0 xl:col-span-2">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                    Order {selectedTx.orderNumber || `#${selectedTx.id}`}
                  </p>
                  <h3 className="font-extrabold text-xl text-slate-900">{selectedTx.artwork}</h3>
                  <p className="text-xs text-neutral-500">
                    Buyer: {selectedTx.buyer} · Artist: {selectedTx.artist}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {categoryFilter === 'all' ? (
              <div className="bg-neutral-50 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Artwork Title</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedTx.artwork}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Student Artist</span>
                  <span className="font-medium text-slate-800">{selectedTx.artist}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Collector / Buyer</span>
                  <span className="font-medium text-slate-800">{selectedTx.buyer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Acquisition Date</span>
                  <span className="font-medium text-slate-800">{selectedTx.date}</span>
                </div>
              </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Ship to</p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedTx.buyer}</p>
                    <p className="mt-1 break-words leading-5 text-neutral-600">
                      {selectedTx.deliveryAddress || 'Delivery address not provided'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Buyer payment preference</p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {selectedTx.paymentMethod || 'Not specified'}
                    </p>
                    <p className="mt-1 leading-5 text-neutral-500">
                      Payment is coordinated directly. No payment service is connected.
                    </p>
                  </div>
                </div>
              )}

              {categoryFilter === 'all' && (
              <div className="border border-neutral-200/80 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Gross Price</span>
                  <span className="font-bold text-slate-900">₱{selectedTx.grossAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Platform Commission (0%)</span>
                  <span className="font-semibold text-neutral-700">₱0</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>{selectedTx.status === 'Pending' || selectedTx.status === 'Shipped' ? 'Online payment processing' : 'Payment Gateway Processing (Sponsored)'}</span>
                  <span className={`font-semibold ${selectedTx.status === 'Pending' || selectedTx.status === 'Shipped' ? 'text-amber-700' : 'text-emerald-600'}`}>
                    {selectedTx.status === 'Pending' || selectedTx.status === 'Shipped' ? 'Not connected' : 'FREE'}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-900">
                    {selectedTx.status === 'Pending' || selectedTx.status === 'Shipped' ? 'Expected Student Payout' : 'Total Net Student Payout'}
                  </span>
                  <span className="font-extrabold text-[#16A34A] text-base">
                    ₱{selectedTx.netStudentPayout.toLocaleString()}
                  </span>
                </div>
              </div>
              )}

              <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
                <div className="flex items-start gap-3">
                  {selectedTx.deliveryMethod === 'campus_pickup'
                    ? <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                    : <Truck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900">Delivery & fulfillment</h4>
                    <p className="mt-1 text-xs text-neutral-600">
                      {selectedTx.deliveryMethod === 'campus_pickup'
                        ? 'Campus pickup'
                        : selectedTx.deliveryMethod === 'door_to_door'
                        ? 'Door-to-door delivery'
                        : 'No delivery details on this legacy transaction'}
                      {selectedTx.orderNumber && ` · ${selectedTx.orderNumber}`}
                    </p>
                    {categoryFilter === 'all' && selectedTx.deliveryAddress && (
                      <p className="mt-1 break-words text-xs text-neutral-600">{selectedTx.deliveryAddress}</p>
                    )}
                    {categoryFilter === 'all' && selectedTx.paymentMethod && (
                      <p className="mt-1 text-xs text-neutral-600">Payment preference: {selectedTx.paymentMethod}</p>
                    )}
                    <p className="mt-1 text-xs text-neutral-600">
                      Quantity: {selectedTx.quantity ?? 1}
                      {selectedTx.selectedSize && ` · Size: ${selectedTx.selectedSize}`}
                      {selectedTx.selectedColor && ` · Color: ${selectedTx.selectedColor}`}
                      {selectedTx.designChoice && ` · Design: ${selectedTx.designChoice}`}
                    </p>
                    {selectedTx.selectedOptions && Object.keys(selectedTx.selectedOptions).length > 0 && (
                      <p className="mt-1 text-xs text-neutral-600">
                        {Object.entries(selectedTx.selectedOptions).map(([name, value]) => `${name}: ${value}`).join(' · ')}
                      </p>
                    )}
                    {selectedTx.buyerNote && (
                      <p className="mt-2 whitespace-pre-wrap rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                        <strong>Buyer note:</strong> {selectedTx.buyerNote}
                      </p>
                    )}
                    <p className="mt-2 text-xs font-semibold text-blue-900">
                      Status: {selectedTx.fulfillmentStatus || 'Awaiting seller update'}
                    </p>
                    {(() => {
                      const refundRequest = sellerRefundRequests.find((request) => request.orderId === selectedTx.id);
                      if (!refundRequest) return null;
                      return (
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h5 className="font-bold text-slate-900">Buyer refund request</h5>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                              refundRequest.status === 'pending'
                                ? 'bg-amber-200 text-amber-950'
                                : refundRequest.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {refundRequest.status === 'pending'
                                ? 'Awaiting your review'
                                : refundRequest.status === 'approved' ? 'Approved' : 'Declined'}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-neutral-600">
                            From {refundRequest.buyerName} · {refundRequest.buyerEmail}
                          </p>
                          <p className="mt-3 text-sm font-bold text-slate-900">{refundRequest.reason}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-neutral-700">{refundRequest.details}</p>
                          <img
                            src={refundRequest.evidenceImage}
                            alt={`Evidence for ${refundRequest.artworkTitle} refund request`}
                            className="mt-3 max-h-80 w-full rounded-xl border border-amber-200 bg-white object-contain"
                          />
                          {refundRequest.status === 'pending' ? (
                            <>
                              <p className="mt-3 text-xs leading-5 text-amber-950">
                                Approving records your decision. Coordinate the actual payment refund directly with the buyer; payment processing is not connected.
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => onRefundRequestDecision(refundRequest.id, 'approved')}
                                  className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800"
                                >
                                  Approve refund request
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRefundRequestDecision(refundRequest.id, 'declined')}
                                  className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                                >
                                  Reject refund request
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onNavigateToCustomerService(
                                    `refund-${refundRequest.buyerEmail.toLowerCase()}-${refundRequest.orderId}`
                                  )}
                                  className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-neutral-50"
                                >
                                  Talk to customer
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs text-neutral-600">
                                Decision updated {new Date(refundRequest.updatedAt).toLocaleString()}.
                              </p>
                              <button
                                type="button"
                                onClick={() => onNavigateToCustomerService(
                                  `refund-${refundRequest.buyerEmail.toLowerCase()}-${refundRequest.orderId}`
                                )}
                                className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-neutral-50"
                              >
                                Talk to customer
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {categoryFilter === 'shipped' && selectedTx.fulfillmentStatus === 'Shipped' && selectedTx.shippingProvider && selectedTx.trackingNumber && (
                      <p className="mt-2 text-xs text-neutral-700">
                        Carrier: <strong>{selectedTx.shippingProvider}</strong> · Tracking: <strong>{selectedTx.trackingNumber}</strong>
                      </p>
                    )}
                    {categoryFilter === 'shipped' && selectedTx.fulfillmentStatus === 'Shipped' && (
                      <div className="mt-4 space-y-3 border-t border-blue-200 pt-4">
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">Shipping and rider details</h5>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            Enter or update carrier tracking and rider details for this shipped order.
                          </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block text-xs font-semibold text-slate-700">
                            Carrier
                            <input
                              type="text"
                              required
                              value={shippingProvider}
                              onChange={(event) => setShippingProvider(event.target.value)}
                              placeholder="Carrier name"
                              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-700">
                            Tracking number
                            <input
                              type="text"
                              required
                              value={trackingNumber}
                              onChange={(event) => setTrackingNumber(event.target.value)}
                              placeholder="Carrier tracking number"
                              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                            Tracking link
                            <input
                              type="url"
                              required
                              value={trackingUrl}
                              onChange={(event) => setTrackingUrl(event.target.value)}
                              placeholder="https://carrier.example/track/..."
                              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-700">
                            Rider name <span className="font-normal text-neutral-400">(optional)</span>
                            <input
                              type="text"
                              value={deliveryRiderName}
                              onChange={(event) => setDeliveryRiderName(event.target.value)}
                              placeholder="Enter rider's name"
                              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-700">
                            Rider phone number <span className="font-normal text-neutral-400">(optional)</span>
                            <input
                              type="tel"
                              value={deliveryRiderPhone}
                              onChange={(event) => setDeliveryRiderPhone(event.target.value)}
                              placeholder="Enter rider's phone number"
                              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>
                        </div>
                        {trackingDetailsError && <p role="alert" className="text-xs font-semibold text-red-700">{trackingDetailsError}</p>}
                        <button
                          type="button"
                          onClick={handleMarkOutForDelivery}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 ring-1 ring-neutral-300 hover:bg-neutral-50"
                        >
                          <Truck className="h-4 w-4" />
                          Out for Delivery
                        </button>
                      </div>
                    )}
                    {((categoryFilter === 'out_for_delivery' && selectedTx.fulfillmentStatus === 'Out for Delivery') ||
                      (selectedTx.deliveryMethod === 'campus_pickup' && selectedTx.fulfillmentStatus === 'Ready for pickup')) && (
                      <div className="mt-4 space-y-3 border-t border-blue-200 pt-4">
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">
                            {selectedTx.deliveryMethod === 'campus_pickup' ? 'Confirm campus pickup' : 'Confirm delivery'}
                          </h5>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {selectedTx.deliveryMethod === 'campus_pickup'
                              ? 'After handing the order to the buyer, upload proof of pickup and mark the order completed.'
                              : 'After confirming the parcel was delivered, upload proof of delivery and mark the order completed.'}
                          </p>
                        </div>
                        {proofOfDeliveryImage ? (
                          <div className="space-y-2">
                            <img src={proofOfDeliveryImage} alt="Proof of delivery" className="max-h-80 w-full rounded-xl border border-neutral-200 object-contain bg-neutral-50" />
                            <button
                              type="button"
                              onClick={() => setProofOfDeliveryImage('')}
                              className="text-xs font-semibold text-red-700 underline"
                            >
                              Remove proof image
                            </button>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-white px-4 py-5 text-sm font-semibold text-blue-900 hover:bg-blue-50">
                            <ImagePlus className="h-5 w-5" />
                            {selectedTx.deliveryMethod === 'campus_pickup'
                              ? 'Upload proof of pickup'
                              : 'Upload proof of delivery image'}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleProofImageChange}
                              className="sr-only"
                            />
                          </label>
                        )}
                        <p className="text-[11px] leading-4 text-neutral-500">
                          Images are resized before saving in this browser. Maximum upload size: 8 MB.
                        </p>
                        {proofImageError && <p role="alert" className="text-xs font-semibold text-red-700">{proofImageError}</p>}
                        {proofOfDeliveryImage && (
                          <button
                            type="button"
                            onClick={handleCompleteDelivery}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8e1b24] px-4 py-3 text-sm font-bold text-white hover:bg-[#74151c]"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {selectedTx.deliveryMethod === 'campus_pickup'
                              ? 'Mark pickup completed'
                              : 'Mark as completed'}
                          </button>
                        )}
                      </div>
                    )}
                    {selectedTx.proofOfDeliveryImage && selectedTx.status === 'Completed' && (
                      <div className="mt-4 border-t border-blue-200 pt-4">
                        <p className="mb-2 text-sm font-bold text-slate-900">Proof of delivery</p>
                        <img src={selectedTx.proofOfDeliveryImage} alt="Proof of delivery" className="max-h-52 w-full rounded-xl border border-neutral-200 object-contain bg-white" />
                        {selectedTx.completedAt && (
                          <p className="mt-2 text-xs text-neutral-500">Marked completed: {new Date(selectedTx.completedAt).toLocaleString()}</p>
                        )}
                      </div>
                    )}
                    {selectedTx.deliveryMethod && selectedTx.fulfillmentStatus === 'Processing' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowToShipView(true);
                        }}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                      >
                        <Truck className="h-4 w-4" />
                        Open fulfillment page
                      </button>
                    )}
                  </div>
                </div>
              </section>

            </div>
              </div>
            </section>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};
