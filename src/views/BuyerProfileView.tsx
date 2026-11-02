import React, { useEffect, useRef, useState } from 'react';
import {
  Package,
  MapPin,
  Truck,
  MessageSquare,
  Shield,
  KeyRound,
  CreditCard,
  LogOut,
  Edit3,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Paperclip,
  Send,
  Copy,
  Mail,
  Check,
  Star,
  PanelLeftOpen,
  PanelLeftClose,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  ImagePlus,
  X,
} from 'lucide-react';
import { BuyerAddress, BuyerTab, OrderItem, Conversation, RefundRequest } from '../types';
import { loadArtworkReviews, saveArtworkReview } from '../data/artworkReviewStorage';
import { loadRefundRequests, saveRefundRequest } from '../data/refundRequestStorage';

const REFUND_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

const getReturnDeadline = (order: OrderItem): number | undefined => {
  const completedAt = order.completedAt ? Date.parse(order.completedAt) : Number.NaN;
  if (!Number.isNaN(completedAt)) return completedAt + REFUND_WINDOW_MS;

  const deliveredDate = order.dateInfo.match(/Delivered\s+([^·]+)/i)?.[1]?.trim();
  if (deliveredDate) {
    const parsedDeliveredDate = new Date(deliveredDate);
    if (!Number.isNaN(parsedDeliveredDate.getTime())) {
      parsedDeliveredDate.setHours(23, 59, 59, 999);
      return parsedDeliveredDate.getTime() + REFUND_WINDOW_MS;
    }
  }

  const savedDeadline = order.returnDueAt ? Date.parse(order.returnDueAt) : Number.NaN;
  return Number.isNaN(savedDeadline) ? undefined : savedDeadline;
};

const prepareRefundEvidence = async (file: File): Promise<string> => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image as evidence.');
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
      image.onerror = () => reject(new Error('The selected evidence image could not be read.'));
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

interface BuyerProfileViewProps {
  currentTab: BuyerTab;
  onSelectTab: (tab: BuyerTab) => void;
  orders: OrderItem[];
  userName: string;
  userEmail: string;
  addressData: BuyerAddress;
  addresses: BuyerAddress[];
  onUpdateAddresses: (addresses: BuyerAddress[]) => void;
  onUpdateProfile: (name: string) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  createdAt?: string;
  conversations: Conversation[];
  initialConversationId?: string;
  onSendMessage: (conversationId: string, text: string) => void;
  onMarkConversationRead: (conversationId: string) => void;
  onMarkConversationUnread: (conversationId: string) => void;
  onContactSeller: (sellerName: string) => void;
  onRefundRequestMessage: (request: RefundRequest, status: 'submitted' | 'approved' | 'declined') => void;
  onSignOut: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

export const BuyerProfileView: React.FC<BuyerProfileViewProps> = ({
  currentTab,
  onSelectTab,
  orders,
  userName,
  userEmail,
  addressData,
  addresses,
  onUpdateAddresses,
  onUpdateProfile,
  onChangePassword,
  createdAt,
  conversations,
  initialConversationId,
  onSendMessage,
  onMarkConversationRead,
  onMarkConversationUnread,
  onContactSeller,
  onRefundRequestMessage,
  onSignOut,
  onShowToast,
}) => {
  const [isNavRetracted, setIsNavRetracted] = useState<boolean>(false);
  const [securityOpen, setSecurityOpen] = useState(true);
  const [orderFilter, setOrderFilter] = useState<'all' | 'to_ship' | 'shipped' | 'completed' | 'review'>('all');
  const [trackingDetailsOrderId, setTrackingDetailsOrderId] = useState<string | null>(null);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundStep, setRefundStep] = useState<'issue' | 'reason' | 'details'>('issue');
  const [refundIssueType, setRefundIssueType] = useState<RefundRequest['issueType'] | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundDetails, setRefundDetails] = useState('');
  const [refundEvidence, setRefundEvidence] = useState('');
  const [refundError, setRefundError] = useState('');
  const [reviewRatings, setReviewRatings] = useState<Record<string, number>>({});
  const [submittedReviews, setSubmittedReviews] = useState<Record<string, boolean>>({});
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [reviewDraft, setReviewDraft] = useState('');
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [convListFilter, setConvListFilter] = useState<'all' | 'unread'>('all');
  const [convSearch, setConvSearch] = useState<string>('');
  const [showEditAddressModal, setShowEditAddressModal] = useState<boolean>(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [addressDraft, setAddressDraft] = useState(addressData);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [profileDraftName, setProfileDraftName] = useState(userName);
  const [profileError, setProfileError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const lastReadSelectionRef = useRef('');

  useEffect(() => {
    if (initialConversationId && conversations.some((conversation) => conversation.id === initialConversationId)) {
      setSelectedConvId(initialConversationId);
    }
  }, [initialConversationId]);

  useEffect(() => {
    if (!conversations.some((conversation) => conversation.id === selectedConvId)) {
      setSelectedConvId(conversations[0]?.id ?? '');
    }
  }, [conversations, selectedConvId]);

  useEffect(() => {
    if (!selectedConvId || lastReadSelectionRef.current === selectedConvId) return;
    lastReadSelectionRef.current = selectedConvId;
    const selected = conversations.find((conversation) => conversation.id === selectedConvId);
    if (selected?.unread) onMarkConversationRead(selectedConvId);
  }, [selectedConvId, conversations, onMarkConversationRead]);

  useEffect(() => {
    const refreshRefundRequests = () => {
      try {
        const buyerRequests = loadRefundRequests().filter(
          (request) => request.buyerEmail.toLowerCase() === userEmail.toLowerCase()
        );
        setRefundRequests(buyerRequests);
        if (
          refundOrderId &&
          buyerRequests.some((request) => (
            request.orderId === refundOrderId && request.status === 'approved'
          ))
        ) {
          setRefundOrderId(null);
        }
      } catch (error) {
        console.error('Unable to load refund requests.', error);
        onShowToast(
          'Refund requests could not be loaded',
          error instanceof Error ? error.message : 'Saved refund requests are unreadable.',
          'error'
        );
      }
    };
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'red-nexus-refund-requests') refreshRefundRequests();
    };

    refreshRefundRequests();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userEmail, refundOrderId]);

  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    const refreshReviews = () => {
      try {
        const buyerReviews = loadArtworkReviews().filter(
          (review) => review.buyerEmail.toLowerCase() === userEmail.toLowerCase()
        );
        setSubmittedReviews(Object.fromEntries(buyerReviews.map((review) => [review.orderId, true])));
      } catch (error) {
        console.error('Unable to load saved buyer reviews.', error);
        onShowToast(
          'Reviews could not be loaded',
          error instanceof Error ? error.message : 'Saved review data is unreadable.',
          'error'
        );
        setSubmittedReviews({});
      }
    };
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'red-nexus-artwork-reviews') refreshReviews();
    };

    refreshReviews();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userEmail]);

  useEffect(() => {
    if (trackingDetailsOrderId) window.scrollTo(0, 0);
  }, [trackingDetailsOrderId]);

  const openEditAddress = (address?: BuyerAddress) => {
    setEditingAddressId(address?.id ?? null);
    setAddressDraft(address
      ? { ...address }
      : {
          id: `address-${Date.now()}`,
          label: '',
          name: userName,
          line1: '',
          city: '',
          phone: '',
          isDefault: addresses.length === 0,
        });
    setShowEditAddressModal(true);
  };

  const persistAddresses = (updatedAddresses: BuyerAddress[]) => {
    try {
      onUpdateAddresses(updatedAddresses);
      return true;
    } catch (error) {
      onShowToast(
        'Addresses not saved',
        error instanceof Error ? error.message : 'Unable to save addresses in this browser.',
        'error'
      );
      return false;
    }
  };

  const saveAddressDraft = () => {
    if (!addressDraft.label.trim() || !addressDraft.name.trim() || !addressDraft.line1.trim() ||
      !addressDraft.city.trim() || !addressDraft.phone.trim()) {
      onShowToast('Address not saved', 'Complete the label, recipient, address, city, and phone number.', 'error');
      return;
    }

    const updatedAddresses = editingAddressId
      ? addresses.map((address) => address.id === editingAddressId ? { ...addressDraft } : address)
      : [...addresses, { ...addressDraft }];
    const normalizedAddresses = updatedAddresses.map((address) => ({
      ...address,
      isDefault: address.id === addressDraft.id
        ? addressDraft.isDefault
        : addressDraft.isDefault
          ? false
          : address.isDefault,
    }));
    if (!normalizedAddresses.some((address) => address.isDefault) && normalizedAddresses.length > 0) {
      normalizedAddresses[0].isDefault = true;
    }
    if (persistAddresses(normalizedAddresses)) setShowEditAddressModal(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Complete all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Choose a new password with at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The new passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onShowToast('Password updated', 'Your local account password has been changed.', 'success');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Unable to change the password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const unreadConversationCount = conversations.filter((conversation) => conversation.unread).length;
  const buyerInitials = userName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const buyerSinceYear = createdAt && !Number.isNaN(Date.parse(createdAt))
    ? new Date(createdAt).getFullYear()
    : null;
  const currentBrowser = typeof navigator === 'undefined'
    ? 'This browser'
    : /Edg\//.test(navigator.userAgent)
      ? 'Microsoft Edge'
      : /Firefox\//.test(navigator.userAgent)
        ? 'Firefox'
        : /Chrome\//.test(navigator.userAgent)
          ? 'Chrome'
          : /Safari\//.test(navigator.userAgent)
            ? 'Safari'
            : 'This browser';

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConvId)
    ?? conversations[0]
    ?? {
      id: '',
      name: '',
      email: '',
      lastMessage: '',
      time: '',
      unread: false,
      avatarBg: 'bg-neutral-100',
      avatarInitials: '',
      subject: '',
      messages: [],
    };

  const handleSendChatMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || !selectedConversation.id) return;
    onSendMessage(selectedConversation.id, text);
    setChatInput('');
    onShowToast('Message Sent', 'Your reply has been delivered to ' + selectedConversation.name, 'success');
  };

  const handleCopyTrackingNumber = async (trackingNumber: string) => {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      onShowToast('Tracking number copied', trackingNumber, 'success');
    } catch (error) {
      onShowToast(
        'Could not copy tracking number',
        error instanceof Error ? error.message : 'Copying is not available in this browser.',
        'error'
      );
    }
  };

  const getTrackingUrl = (order: OrderItem) => {
    if (order.trackingUrl) return order.trackingUrl;
    if (order.shippingProvider && /j\s*&\s*t|jnt/i.test(order.shippingProvider) && order.trackingNumber) {
      const url = new URL('https://www.jtexpress.ph/trajectoryQuery');
      url.searchParams.set('billcode', order.trackingNumber);
      return url.toString();
    }
    return null;
  };

  const isReturnWindowOpen = (order: OrderItem) => {
    const deadline = getReturnDeadline(order);
    return deadline === undefined || currentTime <= deadline;
  };

  const openRefundRequest = (order: OrderItem) => {
    if (!isReturnWindowOpen(order)) {
      onShowToast('Refund window closed', 'The 3-day refund period for this order has ended.', 'info');
      return;
    }
    setRefundOrderId(order.id);
    setRefundStep('issue');
    setRefundIssueType(null);
    setRefundReason('');
    setRefundDetails('');
    setRefundEvidence('');
    setRefundError('');
  };

  const reviewableOrders = orders.filter((order) => {
    return order.status === 'Completed' && submittedReviews[order.id] !== true;
  });
  const reviewableOrderIds = new Set(reviewableOrders.map((order) => order.id));
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'to_ship') return ['Processing', 'Ready for pickup'].includes(order.status);
    if (orderFilter === 'shipped') return order.status === 'In transit';
    if (orderFilter === 'completed') return order.status === 'Completed';
    if (orderFilter === 'review') return reviewableOrderIds.has(order.id);
    return true;
  });
  const reviewingOrder = orders.find((order) => order.id === reviewingOrderId);
  const refundOrder = orders.find((order) => order.id === refundOrderId);
  const existingRefundRequest = refundOrderId
    ? refundRequests.find((request) => request.orderId === refundOrderId)
    : undefined;
  const trackingDetailsOrder = trackingDetailsOrderId
    ? orders.find((order) => order.id === trackingDetailsOrderId)
    : undefined;
  const showShippingDetails = ['to_ship', 'shipped', 'completed'].includes(orderFilter);
  const toShipCount = orders.filter((order) => ['Processing', 'Ready for pickup'].includes(order.status)).length;
  const shippedCount = orders.filter((order) => order.status === 'In transit').length;
  const completedCount = orders.filter((order) => order.status === 'Completed').length;
  const reviewCount = reviewableOrders.length;

  const filteredConversations = conversations.filter((c) => {
    if (convListFilter === 'unread' && !c.unread) return false;
    if (convSearch && !c.name.toLowerCase().includes(convSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full bg-[#FAF9F6]/40 min-h-screen py-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1800px] px-3 sm:px-5 lg:px-8 2xl:px-10">
        <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-12 xl:gap-8">
          {/* ================= RETRACTABLE SEAMLESS NAVIGATION BAR ================= */}
          {!isNavRetracted ? (
            <aside className="lg:col-span-3 transition-all duration-300">
              <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs overflow-hidden">
                {/* Seamless Connected Header: User Profile with Retract Toggle */}
                <div className="p-5 border-b border-neutral-100 bg-neutral-50/40 relative">
                  <button
                    onClick={() => setIsNavRetracted(true)}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-slate-900 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                    title="Retract navigation bar"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full mb-2.5 border-2 border-red-100 shadow-2xs bg-red-50 text-red-700 flex items-center justify-center font-bold text-lg">
                      {buyerInitials}
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">{userName}</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {buyerSinceYear ? `Buyer since ${buyerSinceYear}` : 'Buyer account'}
                    </p>
                    <button
                      onClick={() => {
                        setProfileDraftName(userName);
                        setProfileError('');
                        setShowEditProfileModal(true);
                      }}
                      className="mt-3 px-3.5 py-1 rounded-full border border-neutral-300 text-slate-700 text-[11px] font-bold hover:bg-neutral-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit profile</span>
                    </button>
                  </div>
                </div>

                {/* The ONLY navigation buttons on the page */}
                <div className="p-2.5 space-y-1 text-xs font-semibold">
                  {/* 1. Orders */}
                  <button
                    onClick={() => onSelectTab('orders')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-colors text-left cursor-pointer ${
                      currentTab === 'orders'
                        ? 'bg-neutral-100 text-slate-900 font-bold'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-slate-900'
                    }`}
                  >
                    <Package className="w-4 h-4 text-neutral-500" />
                    <span>Orders</span>
                  </button>

                  {/* 2. Addresses */}
                  <button
                    onClick={() => onSelectTab('addresses')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-colors text-left cursor-pointer ${
                      currentTab === 'addresses'
                        ? 'bg-neutral-100 text-slate-900 font-bold'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-slate-900'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <span>Addresses</span>
                  </button>

                  {/* 3. Messages */}
                  <button
                    onClick={() => onSelectTab('messages')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-colors text-left cursor-pointer ${
                      currentTab === 'messages'
                        ? 'bg-neutral-100 text-slate-900 font-bold'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-neutral-500" />
                      <span>Messages</span>
                    </div>
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      2
                    </span>
                  </button>

                  {/* 4. Security & privacy */}
                  <button
                    onClick={() => onSelectTab('security')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-colors text-left cursor-pointer ${
                      currentTab === 'security'
                        ? 'bg-neutral-100 text-slate-900 font-bold'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-slate-900'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-neutral-500" />
                    <span>Security & privacy</span>
                  </button>

                  {/* 5. Password */}
                  <button
                    onClick={() => onSelectTab('password')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-colors text-left cursor-pointer ${
                      currentTab === 'password'
                        ? 'bg-neutral-100 text-slate-900 font-bold'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-slate-900'
                    }`}
                  >
                    <KeyRound className="w-4 h-4 text-neutral-500" />
                    <span>Password</span>
                  </button>

                  {/* 6. Payment methods */}
                  <button
                    onClick={() => onSelectTab('payments')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-colors text-left cursor-pointer ${
                      currentTab === 'payments'
                        ? 'bg-neutral-100 text-slate-900 font-bold'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-neutral-500" />
                    <span>Payment methods</span>
                  </button>

                  {/* 7. Sign out */}
                  <div className="pt-2 border-t border-neutral-100">
                    <button
                      onClick={onSignOut}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer font-bold"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          ) : (
            /* Retracted Slim Seamless Icon Rail */
            <aside className="lg:col-span-1 transition-all duration-300">
              <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs p-2 flex flex-col items-center space-y-2">
                <button
                  onClick={() => setIsNavRetracted(false)}
                  className="w-10 h-10 rounded-2xl bg-neutral-100 hover:bg-slate-900 text-slate-700 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Expand navigation bar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="w-8 h-8 rounded-full border border-red-100 my-1 bg-red-50 text-red-700 flex items-center justify-center text-[10px] font-bold">
                {buyerInitials}
                </div>

                <div className="w-full border-t border-neutral-100 pt-2 flex flex-col items-center space-y-1.5">
                  <button
                    onClick={() => onSelectTab('orders')}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                      currentTab === 'orders' ? 'bg-red-50 text-red-600 font-bold' : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                    title="Orders"
                  >
                    <Package className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectTab('addresses')}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                      currentTab === 'addresses' ? 'bg-red-50 text-red-600 font-bold' : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                    title="Addresses"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectTab('messages')}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer relative ${
                      currentTab === 'messages' ? 'bg-red-50 text-red-600 font-bold' : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                    title={`Messages (${unreadConversationCount} unread)`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {unreadConversationCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </button>

                  <button
                    onClick={() => onSelectTab('security')}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                      currentTab === 'security' ? 'bg-red-50 text-red-600 font-bold' : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                    title="Security & privacy"
                  >
                    <Shield className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectTab('password')}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                      currentTab === 'password' ? 'bg-red-50 text-red-600 font-bold' : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                    title="Password"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectTab('payments')}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                      currentTab === 'payments' ? 'bg-red-50 text-red-600 font-bold' : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                    title="Payment methods"
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onSignOut}
                    className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer pt-2"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* ================= RIGHT MAIN CONTENT ================= */}
          <div className={`${isNavRetracted ? 'lg:col-span-11' : 'lg:col-span-9'} space-y-6 transition-all duration-300`}>
            {/* TAB 1: ORDERS (Exact match to Buyer Profile order.png) */}
            {currentTab === 'orders' && (
              trackingDetailsOrder ? (
                <div className="space-y-6">
                  <button
                    type="button"
                    onClick={() => setTrackingDetailsOrderId(null)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-900"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to orders
                  </button>
                  <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <img
                        src={trackingDetailsOrder.image}
                        alt={trackingDetailsOrder.title}
                        className="h-20 w-20 shrink-0 rounded-2xl bg-neutral-100 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-extrabold text-slate-900">{trackingDetailsOrder.title}</h2>
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                            {trackingDetailsOrder.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                          Artist: {trackingDetailsOrder.artist} · {trackingDetailsOrder.medium}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          Order ID: {trackingDetailsOrder.orderNumber} · {trackingDetailsOrder.dateInfo}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-6">
                      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
                        {trackingDetailsOrder.shippingProvider && trackingDetailsOrder.trackingNumber ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-900">
                              <Truck className="h-4 w-4 text-red-600" />
                              Courier: {trackingDetailsOrder.shippingProvider}
                            </span>
                            <button
                              type="button"
                              onClick={() => trackingDetailsOrder.trackingNumber &&
                                void handleCopyTrackingNumber(trackingDetailsOrder.trackingNumber)}
                              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 hover:border-neutral-300"
                              aria-label={`Copy tracking number ${trackingDetailsOrder.trackingNumber}`}
                            >
                              <span>Tracking #:</span>
                              <strong className="font-mono font-extrabold tracking-wide text-slate-900">
                                {trackingDetailsOrder.trackingNumber}
                              </strong>
                              <Copy className="h-4 w-4 text-neutral-400" />
                            </button>
                            {getTrackingUrl(trackingDetailsOrder) && (
                              <a
                                href={getTrackingUrl(trackingDetailsOrder)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-red-700"
                              >
                                Track on {trackingDetailsOrder.shippingProvider}
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-sm leading-6 text-neutral-600">
                              The seller has not entered the carrier and tracking reference yet.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5">
                        <h3 className="text-lg font-extrabold text-slate-900">Package transit timeline</h3>
                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          This timeline shows order milestones. For live courier scans, use the carrier tracking page.
                        </p>
                        <ol className="mt-6 space-y-0">
                          {[
                            {
                              title: 'To ship',
                              detail: trackingDetailsOrder.status === 'Processing' ||
                                trackingDetailsOrder.status === 'Ready for pickup'
                                ? 'The seller is preparing your order for shipment.'
                                : 'Your order has been prepared for shipment.',
                              complete: trackingDetailsOrder.status === 'In transit' ||
                                trackingDetailsOrder.fulfillmentStatus === 'Out for Delivery' ||
                                trackingDetailsOrder.status === 'Completed',
                              current: trackingDetailsOrder.status === 'Processing' ||
                                trackingDetailsOrder.status === 'Ready for pickup',
                            },
                            {
                              title: 'Shipped',
                              detail: trackingDetailsOrder.trackingNumber
                                ? 'The seller added the shipment tracking details.'
                                : 'Shipment details will appear once the seller adds them.',
                              complete: trackingDetailsOrder.status === 'Completed' ||
                                trackingDetailsOrder.fulfillmentStatus === 'Out for Delivery',
                              current: trackingDetailsOrder.status === 'In transit' &&
                                trackingDetailsOrder.fulfillmentStatus !== 'Out for Delivery',
                            },
                            {
                              title: 'Out for delivery',
                              detail: trackingDetailsOrder.fulfillmentStatus === 'Out for Delivery'
                                ? 'The seller marked this parcel as out for delivery.'
                                : 'This step updates when the courier reports the package is out for delivery.',
                              complete: trackingDetailsOrder.status === 'Completed',
                              current: trackingDetailsOrder.fulfillmentStatus === 'Out for Delivery',
                            },
                            {
                              title: 'Delivered',
                              detail: trackingDetailsOrder.completedAt
                                ? `Completed ${new Date(trackingDetailsOrder.completedAt).toLocaleString()}`
                                : 'Signature or secure handoff required.',
                              complete: trackingDetailsOrder.status === 'Completed',
                              current: false,
                            },
                          ].map((step, index, steps) => (
                            <li key={step.title} className="relative flex gap-3 pb-6 last:pb-0">
                              {index < steps.length - 1 && (
                                <span
                                  className={`absolute left-[9px] top-5 h-full w-0.5 ${
                                    step.complete ? 'bg-slate-800' : 'bg-slate-200'
                                  }`}
                                  aria-hidden="true"
                                />
                              )}
                              <span
                                className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                  step.complete
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : step.current
                                      ? 'border-red-600 bg-red-50'
                                      : 'border-slate-200 bg-white'
                                }`}
                                aria-hidden="true"
                              >
                                {step.complete ? <Check className="h-3 w-3" /> : step.current ? <span className="h-2 w-2 rounded-full bg-red-600" /> : null}
                              </span>
                              <div className="min-w-0">
                                <p className={`font-bold ${step.current ? 'text-red-700' : step.complete ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {step.title}
                                </p>
                                <p className="mt-0.5 text-sm text-neutral-500">{step.detail}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {trackingDetailsOrder.proofOfDeliveryImage && (
                        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
                          <h3 className="text-lg font-extrabold text-slate-900">Proof of delivery</h3>
                          {(trackingDetailsOrder.deliveryRiderName || trackingDetailsOrder.deliveryRiderPhone) && (
                            <div className="mt-2 space-y-1 text-sm text-neutral-600">
                              {trackingDetailsOrder.deliveryRiderName && (
                                <p>Rider: <strong>{trackingDetailsOrder.deliveryRiderName}</strong></p>
                              )}
                              {trackingDetailsOrder.deliveryRiderPhone && (
                                <p>Rider phone: <strong>{trackingDetailsOrder.deliveryRiderPhone}</strong></p>
                              )}
                            </div>
                          )}
                          <img
                            src={trackingDetailsOrder.proofOfDeliveryImage}
                            alt={`Proof of delivery for ${trackingDetailsOrder.title}`}
                            className="mt-3 max-h-[28rem] w-full rounded-xl border border-neutral-200 bg-neutral-50 object-contain"
                          />
                          {trackingDetailsOrder.completedAt && (
                            <p className="mt-2 text-xs text-neutral-500">
                              Completed {new Date(trackingDetailsOrder.completedAt).toLocaleString()}
                            </p>
                          )}
                        </section>
                      )}

                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => onContactSeller(trackingDetailsOrder.artist)}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-neutral-50"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Contact seller
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
              <div className="space-y-6">
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4 xl:gap-4">
                  {/* Card 1: To ship */}
                  <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-xs sm:gap-4 sm:p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-xl font-black leading-none text-slate-900">{toShipCount}</span>
                        <span className="text-xs text-neutral-500">To ship</span>
                      </div>
                      <button
                        onClick={() => setOrderFilter('to_ship')}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        View orders <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Shipped */}
                  <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-xs sm:gap-4 sm:p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-xl font-black leading-none text-slate-900">{shippedCount}</span>
                        <span className="text-xs text-neutral-500">Shipped</span>
                      </div>
                      <button
                        onClick={() => setOrderFilter('shipped')}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Track order <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Completed */}
                  <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-xs sm:gap-4 sm:p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-xl font-black leading-none text-slate-900">{completedCount}</span>
                        <span className="text-xs text-neutral-500">Completed</span>
                      </div>
                      <button
                        onClick={() => setOrderFilter('completed')}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        View history <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card 4: Orders ready for review */}
                  <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-xs sm:gap-4 sm:p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-xl font-black leading-none text-slate-900">{reviewCount}</span>
                        <span className="text-xs text-neutral-500">Review</span>
                      </div>
                      <button
                        onClick={() => setOrderFilter('review')}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Review orders <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
                  <h3 className="text-lg font-extrabold text-slate-900">Recent orders</h3>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-5 overflow-x-auto text-xs font-semibold text-neutral-500 border-b border-neutral-100 pb-3">
                    <button
                      onClick={() => setOrderFilter('all')}
                      className={`shrink-0 cursor-pointer ${orderFilter === 'all' ? 'text-red-600 font-bold' : 'hover:text-slate-900'}`}
                    >
                      All orders
                    </button>
                    <button
                      onClick={() => setOrderFilter('to_ship')}
                      className={`shrink-0 cursor-pointer ${orderFilter === 'to_ship' ? 'text-red-600 font-bold' : 'hover:text-slate-900'}`}
                    >
                      To ship
                    </button>
                    <button
                      onClick={() => setOrderFilter('shipped')}
                      className={`shrink-0 cursor-pointer ${orderFilter === 'shipped' ? 'text-red-600 font-bold' : 'hover:text-slate-900'}`}
                    >
                      Shipped
                    </button>
                    <button
                      onClick={() => setOrderFilter('completed')}
                      className={`shrink-0 cursor-pointer ${orderFilter === 'completed' ? 'text-red-600 font-bold' : 'hover:text-slate-900'}`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => setOrderFilter('review')}
                      className={`shrink-0 cursor-pointer ${orderFilter === 'review' ? 'text-red-600 font-bold' : 'hover:text-slate-900'}`}
                    >
                      Review
                    </button>
                  </div>

                  {/* Orders List */}
                  {orderFilter === 'review' ? (
                    <ul aria-label="Orders to review" className="space-y-4">
                      {filteredOrders.map((order) => {
                        const deliveredDate = order.dateInfo.match(/Delivered\s+([^·]+)/i)?.[1]?.trim();
                        const rating = reviewRatings[order.id] ?? 0;
                        return (
                          <li key={order.id} className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-900">Art Shop</span>
                              <span className="max-w-48 truncate font-semibold text-slate-800">{order.artist}</span>
                              <ChevronRight className="h-4 w-4 text-neutral-400" />
                              <span className="font-bold text-slate-900">Order delivered</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setTrackingDetailsOrderId(order.id)}
                              aria-label={`View tracking details for ${order.title}`}
                              className="mt-4 flex w-full items-center gap-3 rounded-xl bg-neutral-100 px-4 py-3 text-left transition hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            >
                              <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 shrink-0 text-neutral-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-slate-800">
                                    {deliveredDate ? `${deliveredDate} Delivered` : 'Order delivered'}
                                  </p>
                                  <p className="truncate text-sm text-neutral-500">Your package has been delivered.</p>
                                </div>
                                <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400" />
                              </div>
                            </button>

                            <div className="mt-4 flex items-center gap-3">
                              <img
                                src={order.image}
                                alt={order.title}
                                className="h-16 w-16 shrink-0 rounded-xl bg-neutral-100 object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-slate-800">{order.title}</p>
                                <p className="truncate text-sm text-neutral-500">{order.medium}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="font-semibold text-slate-900">₱{order.price.toLocaleString()}</p>
                                <p className="text-sm text-neutral-500">x{order.quantity ?? 1}</p>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-slate-700">
                                Total: <strong className="text-base text-slate-900">₱{order.price.toLocaleString()}</strong>
                              </span>
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReviewDraft('');
                                    setReviewingOrderId(order.id);
                                  }}
                                  className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-600"
                                >
                                  {submittedReviews[order.id] ? 'Edit review' : 'Write review'}
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-100 px-4 py-3">
                              <span className="text-sm font-bold text-slate-800">Quick review</span>
                              <div className="flex items-center gap-1" role="group" aria-label={`Quick review for ${order.title}`}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    aria-label={`${star} star${star === 1 ? '' : 's'}`}
                                    aria-pressed={rating === star}
                                    onClick={() => setReviewRatings((previous) => ({ ...previous, [order.id]: star }))}
                                    className="rounded p-0.5 text-neutral-400 transition hover:text-amber-500"
                                  >
                                    <Star className={`h-7 w-7 ${star <= rating ? 'fill-amber-400 text-amber-500' : ''}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                  <ul aria-label="Orders" className="space-y-4">
                    {filteredOrders.map((order) => (
                      <li
                        key={order.id}
                        className="rounded-3xl border border-neutral-200 bg-white p-4 sm:p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-4">
                            <img
                              src={order.image}
                              alt={order.title}
                              className="h-20 w-20 shrink-0 rounded-2xl bg-neutral-100 object-cover shadow-xs"
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-base font-extrabold text-slate-900">{order.title}</h4>
                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                                    order.status === 'In transit' || order.status === 'Processing'
                                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                                    : order.status === 'Ready for pickup'
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : order.status === 'Return eligible'
                                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm text-neutral-500">
                                Artist: {order.artist} · {order.medium}
                              </p>
                              <p className="mt-0.5 text-[11px] text-neutral-400">
                                Order ID: {order.orderNumber} · {order.dateInfo}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-left sm:text-right">
                            <span className="text-sm font-extrabold text-slate-900 sm:text-base">
                              ₱{order.price.toLocaleString()}
                            </span>
                            <p className="mt-0.5 text-[11px] text-neutral-500">Direct Student Purchase</p>
                          </div>
                        </div>

                        {showShippingDetails && (order.deliveryMethod === 'door_to_door' ||
                          (!order.deliveryMethod && ['Processing', 'In transit'].includes(order.status))) && (
                          <div className="mt-4 rounded-3xl border border-neutral-200 bg-neutral-50/70 p-3 sm:px-4">
                            {order.shippingProvider && order.trackingNumber ? (
                              <>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-neutral-200 bg-white px-2 py-2 text-xs font-extrabold text-slate-900">
                                      <Truck className="h-4 w-4 text-red-600" />
                                      Courier: {order.shippingProvider}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => order.trackingNumber && void handleCopyTrackingNumber(order.trackingNumber)}
                                      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-neutral-200 bg-white px-2 py-2 text-xs text-neutral-600 hover:border-neutral-300"
                                      aria-label={`Copy tracking number ${order.trackingNumber}`}
                                    >
                                      <span>Tracking #:</span>
                                      <strong className="font-mono font-extrabold tracking-wide text-slate-900">{order.trackingNumber}</strong>
                                      <Copy className="h-4 w-4 text-neutral-400" />
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {getTrackingUrl(order) && (
                                      <a
                                        href={getTrackingUrl(order)!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-red-600 px-2 py-2 text-xs font-extrabold text-white transition hover:bg-red-700"
                                      >
                                        Track on {order.shippingProvider}
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setTrackingDetailsOrderId(order.id)}
                                      className="inline-flex min-h-9 items-center justify-center rounded-full border border-neutral-300 bg-white px-2 py-2 text-xs font-semibold text-slate-800 transition hover:bg-neutral-50"
                                    >
                                      Tracking Details
                                    </button>
                                  </div>
                                </div>

                              </>
                            ) : (
                              <div className="text-xs text-blue-950">
                                <p className="text-blue-800">
                                  The seller has not entered the carrier and tracking reference yet. This app does not display live parcel location.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setTrackingDetailsOrderId(order.id)}
                                  className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2 font-semibold text-slate-800 transition hover:bg-neutral-50"
                                >
                                  Tracking Details
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {showShippingDetails && order.deliveryMethod === 'campus_pickup' && (
                          <div className="mt-4 rounded-3xl border border-neutral-200 bg-neutral-50/70 p-4 text-xs text-slate-800">
                            <p className="font-bold">Campus pickup · CAFA Main Campus Pickup Desk</p>
                            <p className="mt-1 text-neutral-600">
                              {order.status === 'Ready for pickup'
                                ? 'Your artwork is ready. Coordinate your pickup with the seller.'
                                : 'The seller will update this order when it is ready for pickup.'}
                            </p>
                          </div>
                        )}
                        {order.status === 'Completed' &&
                          refundRequests.find((request) => request.orderId === order.id)?.status !== 'approved' &&
                          refundRequests.find((request) => request.orderId === order.id)?.status !== 'pending' &&
                          isReturnWindowOpen(order) && (
                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              onClick={() => openRefundRequest(order)}
                              className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-neutral-200"
                            >
                              {refundRequests.find((request) => request.orderId === order.id)?.status === 'declined'
                                ? 'Request return again'
                                : 'Request return or refund'}
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  )}

                  {reviewingOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          const rating = reviewRatings[reviewingOrder.id] ?? 0;
                          if (rating === 0 || !reviewDraft.trim()) {
                            onShowToast('Review incomplete', 'Choose a star rating and enter your review.', 'error');
                            return;
                          }
                          try {
                            saveArtworkReview({
                              orderId: reviewingOrder.id,
                              artworkId: reviewingOrder.artworkId,
                              artworkTitle: reviewingOrder.title,
                              artist: reviewingOrder.artist,
                              buyerEmail: userEmail,
                              buyerName: userName,
                              rating,
                              text: reviewDraft.trim(),
                              createdAt: new Date().toISOString(),
                            });
                          } catch (error) {
                            onShowToast(
                              'Review could not be saved',
                              error instanceof Error ? error.message : 'Unable to save your review in this browser.',
                              'error'
                            );
                            return;
                          }
                          const nextSubmittedReviews = { ...submittedReviews, [reviewingOrder.id]: true };
                          setSubmittedReviews(nextSubmittedReviews);
                          setReviewingOrderId(null);
                          setReviewDraft('');
                          setOrderFilter('completed');
                          onShowToast('Review saved', `Your review for ${reviewingOrder.title} has been saved.`, 'success');
                        }}
                        className="w-full max-w-lg space-y-5 rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
                      >
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900">Review your purchase</h3>
                          <p className="mt-1 text-sm text-neutral-500">{reviewingOrder.title} · {reviewingOrder.artist}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Your rating</p>
                          <div className="mt-2 flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                aria-label={`${star} star${star === 1 ? '' : 's'}`}
                                aria-pressed={(reviewRatings[reviewingOrder.id] ?? 0) === star}
                                onClick={() => setReviewRatings((previous) => ({ ...previous, [reviewingOrder.id]: star }))}
                                className="rounded p-1 text-neutral-400 hover:text-amber-500"
                              >
                                <Star className={`h-8 w-8 ${star <= (reviewRatings[reviewingOrder.id] ?? 0) ? 'fill-amber-400 text-amber-500' : ''}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <label className="block text-sm font-bold text-slate-800">
                          Your review
                          <textarea
                            value={reviewDraft}
                            onChange={(event) => setReviewDraft(event.target.value)}
                            rows={4}
                            required
                            placeholder="Share what you think about this artwork..."
                            className="mt-2 w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                          />
                        </label>
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setReviewingOrderId(null)}
                            className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-neutral-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-full bg-rose-500 px-5 py-2 text-sm font-bold text-white hover:bg-rose-600"
                          >
                            Submit review
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {refundOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
                      <section
                        aria-labelledby="refund-request-title"
                        className="my-auto w-full max-w-xl space-y-5 rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 id="refund-request-title" className="text-xl font-extrabold text-slate-900">
                              {existingRefundRequest?.status === 'pending' || existingRefundRequest?.status === 'approved'
                                ? 'Refund request status'
                                : refundStep === 'issue'
                                  ? 'Tell us what happened'
                                  : refundStep === 'reason'
                                    ? 'Select a reason'
                                    : 'Add details and evidence'}
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500">
                              {refundOrder.title} · Order {refundOrder.orderNumber}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRefundOrderId(null)}
                            aria-label="Close refund request"
                            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-slate-900"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        {(existingRefundRequest?.status === 'pending' || existingRefundRequest?.status === 'approved') ? (
                          <div className="space-y-4">
                            <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                              existingRefundRequest.status === 'pending'
                                ? 'bg-amber-50 text-amber-900'
                                : 'bg-emerald-50 text-emerald-900'
                            }`}>
                              {existingRefundRequest.status === 'pending'
                                ? 'Your request and evidence were sent to the seller. It is awaiting review.'
                                : 'The seller approved your request. Please contact the seller to coordinate the refund.'}
                            </p>
                            <div className="rounded-xl border border-neutral-200 p-4 text-sm">
                              <p className="font-bold text-slate-900">{existingRefundRequest.reason}</p>
                              <p className="mt-2 whitespace-pre-wrap text-neutral-600">{existingRefundRequest.details}</p>
                              <img
                                src={existingRefundRequest.evidenceImage}
                                alt="Evidence attached to refund request"
                                className="mt-3 max-h-64 w-full rounded-lg border border-neutral-200 object-contain"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setRefundOrderId(null)}
                              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
                            >
                              Done
                            </button>
                          </div>
                        ) : refundStep === 'issue' ? (
                          <div className="space-y-3">
                            {existingRefundRequest?.status === 'declined' && (
                              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                                Your previous request was declined. You can submit a new request with updated details and evidence.
                              </p>
                            )}
                            <p className="text-sm text-neutral-600">Choose the option that best describes your order:</p>
                            {([
                              ['received_with_issues', 'I received all the items, but there are issues.'],
                              ['not_received', "I didn't receive my item."],
                            ] as const).map(([issueType, label]) => (
                              <button
                                key={issueType}
                                type="button"
                                onClick={() => {
                                  setRefundIssueType(issueType);
                                  setRefundReason('');
                                  setRefundStep('reason');
                                }}
                                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 px-4 py-4 text-left text-sm font-semibold text-slate-800 transition hover:border-red-300 hover:bg-red-50"
                              >
                                {label}
                                <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400" />
                              </button>
                            ))}
                          </div>
                        ) : refundStep === 'reason' ? (
                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={() => setRefundStep('issue')}
                              className="text-sm font-semibold text-red-700 hover:underline"
                            >
                              Back to issue type
                            </button>
                            {(refundIssueType === 'received_with_issues'
                              ? [
                                  "Product doesn't match description",
                                  'Wrong product sent',
                                  'Product is defective',
                                  'Package is damaged',
                                ]
                              : ['Did not receive package', 'But some items were missing.']
                            ).map((reason) => (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => {
                                  setRefundReason(reason);
                                  setRefundStep('details');
                                  setRefundError('');
                                }}
                                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 px-4 py-4 text-left text-sm font-semibold text-slate-800 transition hover:border-red-300 hover:bg-red-50"
                              >
                                {reason}
                                <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <form
                            onSubmit={(event) => {
                              event.preventDefault();
                              if (!refundIssueType || !refundReason || !refundEvidence) {
                                setRefundError('Choose a reason and upload an evidence image before submitting.');
                                return;
                              }
                              const now = new Date().toISOString();
                              const request: RefundRequest = {
                                id: existingRefundRequest?.id ?? `refund-${refundOrder.id}`,
                                orderId: refundOrder.id,
                                orderNumber: refundOrder.orderNumber,
                                artworkTitle: refundOrder.title,
                                artist: refundOrder.artist,
                                buyerName: userName,
                                buyerEmail: userEmail,
                                issueType: refundIssueType,
                                reason: refundReason,
                                details: refundDetails.trim(),
                                evidenceImage: refundEvidence,
                                status: 'pending',
                                createdAt: existingRefundRequest?.createdAt ?? now,
                                updatedAt: now,
                              };
                              try {
                                saveRefundRequest(request);
                                onRefundRequestMessage(request, 'submitted');
                                setRefundRequests((previous) => [
                                  ...previous.filter((item) => item.orderId !== request.orderId),
                                  request,
                                ]);
                                setRefundOrderId(null);
                                onShowToast(
                                  'Refund request sent',
                                  'Your seller can now review your reason and evidence in Manage Orders.',
                                  'success'
                                );
                              } catch (error) {
                                setRefundError(error instanceof Error
                                  ? error.message
                                  : 'Unable to save the refund request in this browser.');
                              }
                            }}
                            className="space-y-4"
                          >
                            <div className="rounded-xl bg-neutral-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Selected reason</p>
                              <p className="mt-1 font-bold text-slate-900">{refundReason}</p>
                            </div>
                            <label className="block text-sm font-bold text-slate-800">
                              Tell the seller more
                              <textarea
                                value={refundDetails}
                                onChange={(event) => setRefundDetails(event.target.value)}
                                rows={4}
                                required
                                placeholder="Describe the issue and the resolution you are requesting."
                                className="mt-2 w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                              />
                            </label>
                            <div>
                              <p className="text-sm font-bold text-slate-800">Upload evidence <span className="text-red-600">*</span></p>
                              <p className="mt-1 text-xs text-neutral-500">Add a photo that helps show the issue. JPG, PNG, or WebP; maximum file size 8 MB.</p>
                              {refundEvidence ? (
                                <div className="mt-3 space-y-2">
                                  <img src={refundEvidence} alt="Refund evidence preview" className="max-h-56 w-full rounded-xl border border-neutral-200 object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => setRefundEvidence('')}
                                    className="text-xs font-semibold text-red-700 hover:underline"
                                  >
                                    Remove evidence image
                                  </button>
                                </div>
                              ) : (
                                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-5 text-sm font-semibold text-slate-700 hover:border-red-300 hover:bg-red-50">
                                  <ImagePlus className="h-5 w-5" />
                                  Choose evidence image
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="sr-only"
                                    onChange={async (event) => {
                                      const file = event.target.files?.[0];
                                      event.target.value = '';
                                      if (!file) return;
                                      try {
                                        setRefundEvidence(await prepareRefundEvidence(file));
                                        setRefundError('');
                                      } catch (error) {
                                        setRefundError(error instanceof Error
                                          ? error.message
                                          : 'The evidence image could not be prepared.');
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                            {refundError && <p role="alert" className="text-sm font-semibold text-red-700">{refundError}</p>}
                            <div className="flex justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => setRefundStep('reason')}
                                className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-neutral-50"
                              >
                                Back
                              </button>
                              <button
                                type="submit"
                                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
                              >
                                Submit refund request
                              </button>
                            </div>
                          </form>
                        )}
                      </section>
                    </div>
                  )}
                </div>
              </div>
              )
            )}

            {/* TAB 2: ADDRESSES (Exact match to Buyer Profile address.png) */}
            {currentTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-slate-900">Saved addresses</h3>
                  <button
                    onClick={() => openEditAddress()}
                    className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Add address
                  </button>
                </div>

                {addresses.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
                    No saved addresses yet. Add one to use it for checkout.
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-5 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{address.label}</span>
                          {address.isDefault && (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Default
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => openEditAddress(address)}
                          className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{address.name}</h4>
                        <p className="text-xs text-neutral-600 mt-1">{address.line1}</p>
                        <p className="text-xs text-neutral-600">{address.city}</p>
                        <p className="text-xs text-neutral-600 mt-1">{address.phone}</p>
                      </div>
                      {!address.isDefault && (
                        <button
                          onClick={() => persistAddresses(addresses.map((savedAddress) => ({
                            ...savedAddress,
                            isDefault: savedAddress.id === address.id,
                          })))}
                          className="text-xs font-bold text-slate-700 hover:text-red-600 cursor-pointer"
                        >
                          Set as default
                        </button>
                      )}
                      {addresses.length > 1 && (
                        <button
                          onClick={() => {
                            const remaining = addresses.filter((savedAddress) => savedAddress.id !== address.id);
                            if (!remaining.some((savedAddress) => savedAddress.isDefault)) {
                              remaining[0] = { ...remaining[0], isDefault: true };
                            }
                            persistAddresses(remaining);
                          }}
                          className="ml-4 text-xs font-semibold text-neutral-500 hover:text-red-600 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MESSAGES (Exact match to profile Messaages.png) */}
            {currentTab === 'messages' && (
              <div className="space-y-4">
                {/* Conversation filters */}
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className="text-neutral-400">Quick filter:</span>
                  <button
                    onClick={() => setConvListFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                      convListFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-neutral-200 text-neutral-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setConvListFilter('unread')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                      convListFilter === 'unread'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-neutral-200 text-neutral-600'
                    }`}
                  >
                    Unread ({unreadConversationCount})
                  </button>
                </div>

                {/* Split Screen Chat Card */}
                <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
                  {/* Left Column: Conversations List */}
                  <div className="md:col-span-5 border-r border-neutral-200 p-4 flex flex-col">
                    <div className="relative mb-3">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={convSearch}
                        onChange={(e) => setConvSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-100 rounded-full focus:bg-white focus:outline-none border border-transparent focus:border-red-400"
                      />
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 space-y-1">
                      {filteredConversations.map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => {
                            setSelectedConvId(conv.id);
                            if (conv.unread) onMarkConversationRead(conv.id);
                          }}
                          className={`p-3 rounded-2xl cursor-pointer transition-colors flex items-start gap-3 ${
                            selectedConvId === conv.id ? 'bg-neutral-100' : 'hover:bg-neutral-50'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-full ${conv.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}
                          >
                            {conv.avatarInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-slate-900 truncate">{conv.name}</h4>
                              <span className="text-[10px] text-neutral-400">{conv.time}</span>
                            </div>
                            <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                              {conv.lastMessage}
                            </p>
                          </div>
                          {conv.unread && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))}
                      {filteredConversations.length === 0 && (
                        <p className="px-3 py-8 text-center text-xs leading-5 text-neutral-500">
                          No conversations yet. Contact a seller from an artwork page to start a conversation.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Chat History & Thread (Exact match to profile Messaages.png) */}
                  <div className="md:col-span-7 flex flex-col justify-between">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${selectedConversation.avatarBg} text-white font-bold text-xs flex items-center justify-center`}
                        >
                          {selectedConversation.avatarInitials}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">
                            {selectedConversation.name || 'Select a conversation'}
                          </h4>
                          {selectedConversation.id && (
                            <p className="text-[11px] text-neutral-400">{selectedConversation.email}</p>
                          )}
                        </div>
                      </div>

                      {selectedConversation.id && <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <button
                          onClick={() => onShowToast('Email copied', selectedConversation.email, 'info')}
                          className="flex items-center gap-1 hover:text-slate-800 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => onMarkConversationUnread(selectedConversation.id)}
                          className="flex items-center gap-1 hover:text-slate-800 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Mark unread</span>
                        </button>
                      </div>}
                    </div>

                    {/* SUBJECT Banner (from screenshot: SUBJECT: Loss Item) */}
                    {selectedConversation.id && (
                      <div className="px-6 py-2 bg-amber-50/80 border-b border-amber-200/60 text-xs font-bold text-amber-900 flex items-center gap-2">
                        <span className="uppercase text-[10px] text-amber-700 tracking-wider">Subject:</span>
                        <span>{selectedConversation.subject}</span>
                      </div>
                    )}

                    {/* Chat Messages Stream */}
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                      {selectedConversation.messages.length === 0 && (
                        <p className="py-12 text-center text-xs text-neutral-500">
                          {selectedConversation.id ? 'No messages in this conversation yet.' : 'Your conversations with sellers will appear here.'}
                        </p>
                      )}
                      {selectedConversation.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            msg.sender === 'seller' ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs ${
                              msg.sender === 'seller'
                                ? 'bg-[#2E1A18] text-white rounded-br-none shadow-xs'
                                : 'bg-neutral-100 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            <p className={msg.refundRequestId ? 'whitespace-pre-line leading-5' : undefined}>{msg.text}</p>
                          </div>
                          <span className="text-[10px] text-neutral-400 mt-1 px-1">
                            {msg.time}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Quick suggestion reply pills (Apologies, wow thats nice) */}
                    {selectedConversation.id && <div className="px-6 pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleSendChatMessage('Apologies')}
                        className="px-4 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Apologies
                      </button>
                      <button
                        onClick={() => handleSendChatMessage('wow thats nice')}
                        className="px-4 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        wow thats nice
                      </button>
                    </div>}

                    {/* Message Input Bar */}
                    <div className="p-4 border-t border-neutral-100 flex items-center gap-2">
                      {selectedConversation.id && <button
                        onClick={() => onShowToast('Attachment', 'Select image or PDF proof', 'info')}
                        className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>}
                      <input
                        type="text"
                        placeholder={selectedConversation.id ? `Reply to ${selectedConversation.name}... (Press Enter to send)` : 'Select a conversation to send a message'}
                        value={chatInput}
                        disabled={!selectedConversation.id}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendChatMessage();
                        }}
                        className="flex-1 py-2 px-4 text-xs bg-neutral-100 rounded-full border border-transparent focus:bg-white focus:border-red-400 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSendChatMessage()}
                        disabled={!selectedConversation.id}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer shadow-xs"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY & PRIVACY */}
            {currentTab === 'security' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Security & Privacy</h3>
                  <p className="text-xs text-neutral-500 mt-1">Manage local privacy preferences and your current browser session.</p>
                </div>

                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-amber-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Two-Factor Authentication (2FA)</h4>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        Not available in this browser-only prototype. Real verification requires a secure backend.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 bg-white text-amber-800 rounded-full shrink-0">
                    Unavailable
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider text-neutral-400">Current Session</h4>
                  <div className="p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-slate-700">
                        <Smartphone className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{currentBrowser} · Signed in here</div>
                        <div className="text-[11px] text-neutral-500">Local prototype session; other devices cannot be managed here.</div>
                      </div>
                    </div>
                    <button
                      onClick={onSignOut}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider text-neutral-400">Privacy Controls</h4>
                  <p className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-[11px] leading-5 text-neutral-600">
                    Buyer directory visibility and exhibition invitations are not supported in this prototype, so there are no active privacy settings for those features.
                  </p>
                </div>

                {/* Password Shortcut Link */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Need to update your account password?</span>
                  <button
                    onClick={() => onSelectTab('password')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-300 hover:border-slate-900 text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: PASSWORD */}
            {currentTab === 'password' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6 max-w-xl">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Change Password</h3>
                  <p className="text-xs text-neutral-500 mt-1">Ensure your account is using a strong password with at least 8 characters.</p>
                </div>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Current Password</label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">New Password</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  {passwordError && <p role="alert" className="text-xs font-semibold text-red-700">{passwordError}</p>}
                  <button
                    type="button"
                    onClick={() => void handleChangePassword()}
                    disabled={isChangingPassword}
                    className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-60"
                  >
                    {isChangingPassword ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: PAYMENT METHODS */}
            {currentTab === 'payments' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
                <h3 className="text-lg font-extrabold text-slate-900">Payment Methods</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                        M
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">Maya Wallet</h4>
                        <p className="text-[11px] text-neutral-500">Online payment · Coordinate with seller</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      Available
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">
                        G
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">GCash E-Wallet</h4>
                        <p className="text-[11px] text-neutral-500">Online payment · Coordinate with seller</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                      Available
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Address Modal */}
      {showEditAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingAddressId ? 'Edit Delivery Address' : 'Add Delivery Address'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Address label</label>
                <input
                  type="text"
                  placeholder="Home, studio, or work"
                  value={addressDraft.label}
                  onChange={(e) => setAddressDraft({ ...addressDraft, label: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={addressDraft.name}
                  onChange={(e) => setAddressDraft({ ...addressDraft, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Address Line</label>
                <input
                  type="text"
                  value={addressDraft.line1}
                  onChange={(e) => setAddressDraft({ ...addressDraft, line1: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">City & Postal</label>
                <input
                  type="text"
                  value={addressDraft.city}
                  onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={addressDraft.phone}
                  onChange={(e) => setAddressDraft({ ...addressDraft, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={addressDraft.isDefault}
                onChange={(e) => setAddressDraft({ ...addressDraft, isDefault: e.target.checked })}
                className="w-4 h-4 accent-red-600"
              />
              Use as default checkout address
            </label>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEditAddressModal(false)}
                className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveAddressDraft}
                className="px-5 py-2 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Edit Profile</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={profileDraftName}
                  onChange={(event) => {
                    setProfileDraftName(event.target.value);
                    setProfileError('');
                  }}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  className="w-full p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500"
                />
                <p className="mt-1 text-[11px] text-neutral-500">Your email is your sign-in address and cannot be changed here.</p>
              </div>
            </div>
            {profileError && <p role="alert" className="text-xs font-semibold text-red-700">{profileError}</p>}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  try {
                    onUpdateProfile(profileDraftName);
                    setShowEditProfileModal(false);
                    onShowToast('Profile saved', 'Your display name has been updated.', 'success');
                  } catch (error) {
                    setProfileError(error instanceof Error ? error.message : 'Unable to save your profile.');
                  }
                }}
                className="px-5 py-2 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
