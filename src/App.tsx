/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  getLocalAccounts,
  getLocalAccountByEmail,
  LocalAuthSession,
  removeLocalAccount,
  updateLocalAccountAccess,
  updateLocalBuyerAddresses,
  updateLocalBuyerProfile,
  changeLocalBuyerPassword,
} from './auth/localAuth';
import {
  ViewMode,
  MarketplaceTab,
  BuyerTab,
  AdminTab,
  Artwork,
  RankedArtist,
  OrderItem,
  Conversation,
  AdminUser,
  StudentUser,
  CustomerUser,
  StrikeUser,
  AuditLogItem,
  CartItem,
  ArtistDirectoryItem,
  SellerTab,
  SellerOrderTransaction,
  VoucherItem,
  SellerAnnouncement,
  CheckoutDetails,
  ManualFulfillmentStatus,
  ShipmentDetails,
  DeliveryCompletionDetails,
  BuyerAddress,
  RefundRequest,
  RefundRequestStatus,
  HomePromotion,
} from './types';
import {
  initialArtworks,
  initialRankedArtists,
  initialConversations,
  initialAdmins,
  initialStudents,
  initialStrikes,
  initialAuditLogs,
  initialArtistsDirectory,
  initialSellerAnnouncements,
} from './data/mockData';
import { loadOrderData, saveOrderData } from './data/orderStorage';
import { loadArtworkData, saveArtworkData } from './data/artworkStorage';
import { loadConversationData, saveConversationData } from './data/conversationStorage';
import { loadRefundRequests, updateRefundRequestStatus } from './data/refundRequestStorage';
import { loadHomePromotions, saveHomePromotions } from './data/homePromotionStorage';
import { loadVoucherData, saveVoucherData } from './data/voucherStorage';
import { allocateVoucherDiscounts, evaluateVoucher } from './utils/vouchers';

const loadManagedSellerAccounts = (): StudentUser[] => {
  try {
    return initialStudents.flatMap((student) => {
      const account = getLocalAccountByEmail(student.email);
      if (account?.role !== 'seller') return [];
      return [{
        ...student,
        status: account.sellerStatus ?? student.status,
        isSuspended: account.isSuspended ?? false,
      }];
    });
  } catch (error) {
    console.error('Unable to load seller account access status.', error);
    return initialStudents;
  }
};

const loadManagedStrikeAccounts = (): StrikeUser[] => {
  try {
    return initialStrikes.flatMap((strike) => {
      const account = getLocalAccountByEmail(strike.email);
      if (!account) return [];
      return [{
        ...strike,
        strikes: account.strikeCount ?? strike.strikes,
        status: account.isBanned ? 'Banned' : 'Active',
      }];
    });
  } catch (error) {
    console.error('Unable to load account strike status.', error);
    return initialStrikes;
  }
};

const loadManagedCustomers = (): CustomerUser[] => {
  try {
    const buyers = getLocalAccounts().filter((account) => account.role === 'buyer');
    return buyers.map((buyer) => ({
      id: buyer.email.toLowerCase(),
      name: buyer.name,
      handle: `@${buyer.name.replace(/[^a-zA-Z0-9]/g, '')}`,
      email: buyer.email,
      role: 'Customer',
      isSuspended: buyer.isSuspended ?? false,
    }));
  } catch (error) {
    console.error('Unable to load registered buyer accounts.', error);
    return [];
  }
};

const loadSavedVouchers = (): VoucherItem[] => {
  try {
    return loadVoucherData();
  } catch (error) {
    console.error('Unable to load saved vouchers.', error);
    return [];
  }
};

// Public Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ArtworkDetailModal } from './components/ArtworkDetailModal';
import { ToastContainer, ToastMessage } from './components/Toast';

// Admin Components
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';

// Seller Components
import { SellerSidebar } from './components/seller/SellerSidebar';
import { SellerHeader } from './components/seller/SellerHeader';

// Marketplace Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { GalleryView } from './views/GalleryView';
import { ArtistProfileView } from './views/ArtistProfileView';
import { ArtistsDirectoryView } from './views/ArtistsDirectoryView';
import { HeartsView } from './views/HeartsView';
import { CartCheckoutView } from './views/CartCheckoutView';
import { LocalAuthView } from './views/LocalAuthView';
import { HelpSupportView } from './views/HelpSupportView';

// Buyer Views
import { BuyerProfileView } from './views/BuyerProfileView';

// Seller Views
import { SellerOrderView } from './views/seller/SellerOrderView';
import { SellerFulfillmentView } from './views/seller/SellerFulfillmentView';
import { SellerDashboardView } from './views/seller/SellerDashboardView';
import { SellerArtVerificationView } from './views/seller/SellerArtVerificationView';
import { SellerFinanceView } from './views/seller/SellerFinanceView';
import { SellerMessagesView } from './views/seller/SellerMessagesView';
import { SellerGalleryView } from './views/seller/SellerGalleryView';
import { SellerVoucherGeneratorView } from './views/seller/SellerVoucherGeneratorView';
import { SellerLogsView } from './views/seller/SellerLogsView';
import { SellerStockView } from './views/seller/SellerStockView';
import { SellerCertificateView } from './views/seller/SellerCertificateView';
import { ArtworkAuthenticityView } from './views/ArtworkAuthenticityView';
import { CertificateVerificationView } from './views/CertificateVerificationView';

// Admin Views
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminSalesView } from './views/admin/AdminSalesView';
import { AdminBankAccountView } from './views/admin/AdminBankAccountView';
import { AdminArtVerificationView } from './views/admin/AdminArtVerificationView';
import { AdminUsersAdminsView } from './views/admin/AdminUsersAdminsView';
import { AdminUsersStudentsView } from './views/admin/AdminUsersStudentsView';
import { AdminUsersCustomersView } from './views/admin/AdminUsersCustomersView';
import { AdminStrikesBansView } from './views/admin/AdminStrikesBansView';
import { AdminAuditLogsView } from './views/admin/AdminAuditLogsView';
import { AdminMarketingView } from './views/admin/AdminMarketingView';
import { AdminSupportView } from './views/admin/AdminSupportView';

export default function App() {
  // Navigation & View Mode State
  const [authSession, setAuthSession] = useState<LocalAuthSession | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('marketplace');
  const [marketplaceTab, setMarketplaceTab] = useState<MarketplaceTab>('home');
  const [buyerTab, setBuyerTab] = useState<BuyerTab>('orders');
  const [buyerAddress, setBuyerAddress] = useState<BuyerAddress>({
    id: 'address-home',
    label: 'Home',
    name: 'Ana R.',
    line1: 'Unit 402, J. P. Rizal St., Brgy. Diliman',
    city: 'Quezon City, Metro Manila 1101',
    phone: '+63 917 842 4821',
    isDefault: true,
  });
  const [buyerAddresses, setBuyerAddresses] = useState<BuyerAddress[]>([]);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [sellerTab, setSellerTab] = useState<SellerTab>('order');
  const [activeSellerConversationId, setActiveSellerConversationId] = useState<string | undefined>();

  // Core Data States
  const [artworks, setArtworks] = useState<Artwork[]>(loadArtworkData);
  const [rankedArtists, setRankedArtists] = useState<RankedArtist[]>(initialRankedArtists);
  const [orderData, setOrderData] = useState(loadOrderData);
  const { orders, sellerTransactions } = orderData;
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      return loadConversationData();
    } catch (error) {
      console.error('Unable to load saved conversations.', error);
      return initialConversations;
    }
  });
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(() => {
    try {
      return loadRefundRequests();
    } catch (error) {
      console.error('Unable to load refund requests.', error);
      return [];
    }
  });
  const [activeBuyerConversationId, setActiveBuyerConversationId] = useState('conv-2');
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [students, setStudents] = useState<StudentUser[]>(loadManagedSellerAccounts);
  const [customers, setCustomers] = useState<CustomerUser[]>(loadManagedCustomers);
  const [strikes, setStrikes] = useState<StrikeUser[]>(loadManagedStrikeAccounts);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [artistsDirectory, setArtistsDirectory] = useState<ArtistDirectoryItem[]>(initialArtistsDirectory);
  const [selectedArtistProfile, setSelectedArtistProfile] = useState<ArtistDirectoryItem | null>(null);
  const [directoryArtType, setDirectoryArtType] = useState<string>('All');
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState<boolean>(false);
  // Seller Portal State
  const [vouchers, setVouchers] = useState<VoucherItem[]>(loadSavedVouchers);
  const [announcements, setAnnouncements] = useState<SellerAnnouncement[]>(initialSellerAnnouncements);
  const [homePromotions, setHomePromotions] = useState<HomePromotion[]>(() => {
    try {
      return loadHomePromotions();
    } catch (error) {
      console.error('Unable to load homepage promotions.', error);
      return [];
    }
  });
  const signedInSellerName = authSession?.role === 'seller' ? authSession.name.toLowerCase() : '';
  const sellerArtworksForUser = signedInSellerName
    ? artworks.filter((artwork) => (
      artwork.artist.toLowerCase() === signedInSellerName &&
      artwork.status === 'approved'
    ))
    : [];
  const signedInBuyerEmail = authSession?.role === 'buyer' ? authSession.email.toLowerCase() : '';
  const buyerOrderIds = new Set(orders.filter((order) => (
    order.buyerEmail?.toLowerCase() === signedInBuyerEmail
  )).map((order) => order.id));
  const buyerConversationsForUser = conversations.filter((conversation) => (
    conversation.buyerEmail?.toLowerCase() === signedInBuyerEmail ||
    (!conversation.buyerEmail && conversation.email.toLowerCase() === signedInBuyerEmail) ||
    (conversation.orderId !== undefined && buyerOrderIds.has(conversation.orderId))
  )).map((conversation) => ({
    ...conversation,
    unread: conversation.buyerUnread ?? false,
  }));
  const sellerTransactionsForUser = signedInSellerName
    ? sellerTransactions.filter((transaction) => transaction.artist.toLowerCase() === signedInSellerName)
    : [];
  const sellerOrderIds = new Set(sellerTransactionsForUser.map((transaction) => transaction.id));
  const sellerOrdersForUser = orders.filter((order) => (
    sellerOrderIds.has(order.id) || order.artist.toLowerCase() === signedInSellerName
  ));
  const sellerRefundRequestsForUser = refundRequests.filter((request) => (
    request.artist.toLowerCase() === signedInSellerName &&
    sellerOrderIds.has(request.orderId)
  ));
  const sellerConversationsForUser = conversations.filter((conversation) => (
    conversation.sellerName?.toLowerCase() === signedInSellerName ||
    (conversation.orderId !== undefined && sellerOrderIds.has(conversation.orderId))
  )).map((conversation) => ({
    ...conversation,
    unread: conversation.sellerUnread ?? conversation.unread,
  }));
  const supportConversations = conversations
    .filter((conversation) => conversation.isSupport)
    .map((conversation) => ({
      ...conversation,
      unread: conversation.adminUnread ?? false,
    }));

  useEffect(() => {
    saveOrderData(orderData);
  }, [orderData]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      try {
        if (event.key === 'red-nexus-orders') setOrderData(loadOrderData());
        if (event.key === 'red-nexus-artworks') setArtworks(loadArtworkData());
        if (event.key === 'red-nexus-conversations') setConversations(loadConversationData());
        if (event.key === 'red-nexus-refund-requests') setRefundRequests(loadRefundRequests());
        if (event.key === 'red-nexus-home-promotions') setHomePromotions(loadHomePromotions());
        if (event.key === 'red-nexus-vouchers') setVouchers(loadSavedVouchers());
        if (event.key === 'red-nexus-local-accounts') {
          setStudents(loadManagedSellerAccounts());
          setCustomers(loadManagedCustomers());
          setStrikes(loadManagedStrikeAccounts());
          if (authSession) {
            const account = getLocalAccountByEmail(authSession.email);
            if (!account || account.isBanned || account.isSuspended || (
              account.role === 'seller' && account.sellerStatus !== 'Verified'
            )) {
              setAuthSession(null);
              setViewMode('marketplace');
              showToast('Account access revoked', 'Your account no longer has permission to sign in.', 'error');
            } else {
              setAuthSession({
                ...authSession,
                name: account.name,
                address: account.address,
                addresses: account.addresses ?? (account.address ? [account.address] : []),
                createdAt: account.createdAt,
              });
              if (account.role === 'buyer') {
                const updatedAddresses = account.addresses ?? (account.address ? [account.address] : []);
                const defaultAddress = updatedAddresses.find((address) => address.isDefault) ?? updatedAddresses[0];
                if (defaultAddress) {
                  setBuyerAddresses(updatedAddresses);
                  setBuyerAddress(defaultAddress);
                }
              }
            }
          }
        }
      } catch (error) {
        showToast(
          'Shared updates could not be loaded',
          error instanceof Error ? error.message : 'A change from another tab could not be read.',
          'error'
        );
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [authSession]);

  useEffect(() => {
    try {
      saveHomePromotions(homePromotions);
    } catch (error) {
      console.error('Unable to save homepage promotions.', error);
    }
  }, [homePromotions]);

  useEffect(() => {
    try {
      saveConversationData(conversations);
    } catch (error) {
      console.error('Unable to save conversation messages.', error);
    }
  }, [conversations]);

  useEffect(() => {
    const serviceOrders = orders.filter((order) => (
      order.productType === 'custom_made' || order.productType === 'digital'
    ));
    setConversations((previous) => {
      const missingConversations = serviceOrders.filter((order) => (
        !previous.some((conversation) => conversation.orderId === order.id)
      ));
      if (missingConversations.length === 0) return previous;

      const generatedConversations = missingConversations.map((order): Conversation => {
        const buyerName = sellerTransactions.find((transaction) => transaction.id === order.id)?.buyer
          || authSession?.name
          || 'Buyer';
        const messageTime = new Date();
        const messageText = [
          `${order.productType === 'custom_made' ? 'Custom-made order request' : 'Digital artwork order message'}`,
          `Order: ${order.orderNumber} · ${order.title}`,
          order.selectedSize ? `Size: ${order.selectedSize}` : '',
          order.selectedColor ? `Color: ${order.selectedColor}` : '',
          order.designChoice ? `Design: ${order.designChoice}` : '',
          order.buyerNote ? `Customer message: ${order.buyerNote}` : 'Customer message: Please coordinate delivery details for this order.',
        ].filter(Boolean).join('\n');
        return {
          id: `order-${order.buyerEmail?.toLowerCase() || 'guest'}-${order.id}`,
          orderId: order.id,
          name: order.artist,
          buyerName,
          buyerEmail: order.buyerEmail,
          sellerName: order.artist,
          email: order.buyerEmail || '',
          lastMessage: messageText.split('\n')[0],
          time: messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          unread: true,
          avatarBg: '#FEE2E2',
          avatarInitials: buyerName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
          subject: `${order.productType === 'custom_made' ? 'Custom-made request' : 'Digital order'} · ${order.orderNumber}`,
          messages: [{
            id: `order-message-${order.id}`,
            sender: 'buyer',
            text: messageText,
            time: messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          }],
        };
      });
      return [...generatedConversations, ...previous];
    });
  }, [orders, sellerTransactions, authSession?.name]);

  useEffect(() => {
    setConversations((previous) => {
      const missingRequests = refundRequests.filter((request) => (
        !previous.some((conversation) => (
          conversation.id === `refund-${request.buyerEmail.toLowerCase()}-${request.orderId}`
        ))
      ));
      if (missingRequests.length === 0) return previous;

      const generatedConversations = missingRequests.map((request): Conversation => {
        const statusLabel = request.status === 'pending'
          ? 'Refund request submitted'
          : request.status === 'approved' ? 'Refund request approved' : 'Refund request declined';
        const messageText = [
          statusLabel,
          `Order: ${request.orderNumber} · ${request.artworkTitle}`,
          `Reason: ${request.reason}`,
          `Details: ${request.details || 'No additional details provided.'}`,
          'Evidence image: attached to the refund request.',
        ].join('\n');
        const messageTime = new Date(request.updatedAt);
        const conversationId = `refund-${request.buyerEmail.toLowerCase()}-${request.orderId}`;
        return {
          id: conversationId,
          orderId: request.orderId,
          buyerName: request.buyerName,
          buyerEmail: request.buyerEmail,
          sellerName: request.artist,
          name: request.artist,
          email: request.buyerEmail,
          lastMessage: statusLabel,
          time: messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          unread: request.status === 'pending',
          avatarBg: '#FEE2E2',
          avatarInitials: request.artist.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
          subject: `Refund request · ${request.orderNumber}`,
          messages: [{
            id: `refund-${request.id}-${request.status === 'pending' ? 'submitted' : request.status}`,
            sender: request.status === 'pending' ? 'buyer' : 'seller',
            text: messageText,
            time: messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            refundRequestId: request.id,
          }],
        };
      });
      return [...generatedConversations, ...previous];
    });
  }, [refundRequests]);

  useEffect(() => {
    try {
      saveArtworkData(artworks);
    } catch (error) {
      showToast(
        'Artwork changes could not be saved',
        error instanceof Error ? error.message : 'Unable to save artwork in this browser.',
        'error'
      );
    }
  }, [artworks]);

  const handleAddAnnouncement = (newAnn: SellerAnnouncement) => {
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const handleSaveHomePromotion = (promotion: HomePromotion) => {
    setHomePromotions((previous) => [promotion, ...previous]);
  };

  const handleDeleteHomePromotion = (id: string) => {
    setHomePromotions((previous) => previous.filter((promotion) => promotion.id !== id));
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    showToast('Announcement Removed', 'The announcement was removed from your profile.', 'info');
  };

  const handleUpdateArtworkStock = (artworkId: string, newStock: number) => {
    setArtworks((prev) =>
      prev.map((art) => (
        art.id === artworkId &&
        authSession?.role === 'seller' &&
        art.artist.toLowerCase() === authSession.name.toLowerCase() &&
        art.status === 'approved'
          ? { ...art, stock: newStock }
          : art
      ))
    );
  };

  const handleUpdateArtwork = (updatedArtwork: Artwork) => {
    setArtworks((prev) =>
      prev.map((artwork) => (artwork.id === updatedArtwork.id ? updatedArtwork : artwork))
    );
  };

  const handleUpdateArtistProfile = (updatedArtist: ArtistDirectoryItem) => {
    setArtistsDirectory((prev) =>
      prev.map((artist) => (artist.id === updatedArtist.id ? updatedArtist : artist))
    );
  };

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [directCheckoutItems, setDirectCheckoutItems] = useState<CartItem[] | null>(null);
  // Modals & Details
  const [selectedArtworkModal, setSelectedArtworkModal] = useState<Artwork | null>(null);

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'info' | 'error' = 'success'
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Actions & Handlers ---

  // Clean Tab Switcher (Ensures artist profile doesn't stick when clicking other pages or Artists)
  const handleSelectMarketplaceTab = (tab: MarketplaceTab) => {
    setSelectedArtistProfile(null);
    setMarketplaceTab(tab);
    if (viewMode !== 'marketplace') setViewMode('marketplace');
  };

  // Navigate to Artists Directory (e.g. from Shop when clicking an artist or art type)
  const handleNavigateToArtistsDirectory = (artType?: string) => {
    setSelectedArtistProfile(null);
    setDirectoryArtType(artType || 'All');
    setMarketplaceTab('artists');
    if (viewMode !== 'marketplace') setViewMode('marketplace');
  };

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Open All Categories Slide-Down Bar (Immediately upon touching/holding/hovering)
  const handleOpenAllCategories = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (marketplaceTab !== 'home' || viewMode !== 'marketplace') {
      setViewMode('marketplace');
      setSelectedArtistProfile(null);
      setMarketplaceTab('home');
    }
    setIsAllCategoriesOpen(true);
  };

  // Close All Categories (Retract back upon release or mouse leave)
  const handleCloseAllCategories = (immediate = false) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (immediate) {
      setIsAllCategoriesOpen(false);
    } else {
      closeTimeoutRef.current = setTimeout(() => {
        setIsAllCategoriesOpen(false);
      }, 250);
    }
  };

  // Toggle All Categories Slide-Down Bar
  const handleToggleAllCategories = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (!isAllCategoriesOpen) {
      handleOpenAllCategories();
    } else {
      setIsAllCategoriesOpen(false);
    }
  };

  // Toggle Favorite & Dynamically Update Hearts Count
  const handleToggleFavorite = (id: string) => {
    setArtworks((prev) =>
      prev.map((art) => {
        if (art.id === id) {
          const newState = !art.isFavorited;
          const currentHearts = art.heartsCount ?? 350;
          const newHearts = newState ? currentHearts + 1 : Math.max(0, currentHearts - 1);
          showToast(
            newState ? 'Added to Hearts' : 'Removed from Hearts',
            art.title,
            newState ? 'success' : 'info'
          );
          return { ...art, isFavorited: newState, heartsCount: newHearts };
        }
        return art;
      })
    );
  };

  // Toggle Follow Artist
  const handleToggleFollowArtist = (id: string) => {
    setRankedArtists((prev) =>
      prev.map((art) => {
        if (art.id === id) {
          const newState = !art.isFollowed;
          showToast(
            newState ? 'Artist Followed' : 'Artist Unfollowed',
            `You are now following ${art.name}`,
            'success'
          );
          return { ...art, isFollowed: newState };
        }
        return art;
      })
    );
  };

  // View Artist Profile (explicitly triggered by clicking "View Profile" / "View artist")
  const handleViewArtistProfile = (artistOrName?: string | ArtistDirectoryItem) => {
    if (typeof artistOrName === 'object' && artistOrName !== null) {
      setSelectedArtistProfile(artistOrName);
    } else if (typeof artistOrName === 'string') {
      const found = artistsDirectory.find(
        (a) =>
          a.name.toLowerCase() === artistOrName.toLowerCase() ||
          a.id.toLowerCase() === artistOrName.toLowerCase()
      );
      setSelectedArtistProfile(found || artistsDirectory[0]);
    } else {
      setSelectedArtistProfile(artistsDirectory[0]);
    }
    setViewMode('marketplace');
    setMarketplaceTab('artist_profile');
  };

  // Toggle Follow in Directory
  const handleToggleFollowDirectoryArtist = (id: string) => {
    setArtistsDirectory((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const next = !a.isFollowed;
          showToast(
            next ? 'Following Artist' : 'Unfollowed Artist',
            `You are now following ${a.name}`,
            'info'
          );
          return { ...a, isFollowed: next };
        }
        return a;
      })
    );
  };

  // Add to Cart
  const handleAddToCart = (
    artwork: Artwork,
    selection: Omit<CartItem, 'artwork'> = { quantity: 1 }
  ) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => (
        item.artwork.id === artwork.id &&
        item.selectedSize === selection.selectedSize &&
        item.designChoice === selection.designChoice &&
        item.selectedColor === selection.selectedColor &&
        JSON.stringify(item.selectedOptions ?? {}) === JSON.stringify(selection.selectedOptions ?? {}) &&
        item.buyerNote === selection.buyerNote
      ));
      if (exists) {
        showToast('Cart Updated', `Updated quantity of ${artwork.title}`, 'info');
        return prev.map((item) =>
          item.artwork.id === artwork.id
            && item.lineId === exists.lineId
            ? { ...item, quantity: item.quantity + selection.quantity }
            : item
        );
      }
      showToast('Added to Acquisition Cart', artwork.title, 'success');
      return [...prev, {
        ...selection,
        lineId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        artwork,
      }];
    });
  };

  // Remove from Cart
  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => (item.lineId ?? item.artwork.id) !== id));
    showToast('Item Removed', 'The artwork was removed from your cart.', 'info');
  };

  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    setCartItems((previous) => previous.map((item) => (
      (item.lineId ?? item.artwork.id) === id
        ? { ...item, quantity: Math.max(1, Math.min(quantity, item.artwork.stock ?? quantity)) }
        : item
    )));
  };

  const handleCreateSellerVoucher = (voucher: VoucherItem): boolean => {
    if (vouchers.some((existing) => existing.code.trim().toLowerCase() === voucher.code.trim().toLowerCase())) {
      showToast('Voucher code already exists', 'Choose a unique code and try again.', 'error');
      return false;
    }

    const updatedVouchers = [voucher, ...vouchers];
    try {
      saveVoucherData(updatedVouchers);
      setVouchers(updatedVouchers);
      return true;
    } catch (error) {
      showToast(
        'Voucher could not be saved',
        error instanceof Error ? error.message : 'Unable to save voucher data in this browser.',
        'error'
      );
      return false;
    }
  };

  const handleDeactivateSellerVoucher = (id: string, sellerName: string): boolean => {
    const voucher = vouchers.find((candidate) => (
      candidate.id === id && candidate.sellerName?.toLowerCase() === sellerName.toLowerCase()
    ));
    if (!voucher) {
      showToast('Voucher could not be updated', 'This voucher no longer belongs to the active seller.', 'error');
      return false;
    }

    const updatedVouchers = vouchers.map((candidate) => (
      candidate.id === id ? { ...candidate, status: 'Draft' as const } : candidate
    ));
    try {
      saveVoucherData(updatedVouchers);
      setVouchers(updatedVouchers);
      return true;
    } catch (error) {
      showToast(
        'Voucher could not be deactivated',
        error instanceof Error ? error.message : 'Unable to save voucher data in this browser.',
        'error'
      );
      return false;
    }
  };

  // Checkout
  const handleCheckoutWithoutLock = (details: CheckoutDetails): string | undefined => {
    const requestedItems = directCheckoutItems ?? cartItems;
    if (requestedItems.length === 0) return undefined;

    let availableArtworks: Artwork[];
    let currentOrderData: ReturnType<typeof loadOrderData>;
    try {
      availableArtworks = loadArtworkData();
      currentOrderData = loadOrderData();
    } catch (error) {
      showToast(
        'Order could not be submitted',
        error instanceof Error ? error.message : 'Unable to load current inventory and orders.',
        'error'
      );
      return undefined;
    }

    const requestedQuantities = new Map<string, number>();
    for (const item of requestedItems) {
      if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
        showToast('Invalid quantity', `Check the quantity for ${item.artwork.title} and try again.`, 'error');
        return undefined;
      }
      const requestedQuantity = (requestedQuantities.get(item.artwork.id) ?? 0) + item.quantity;
      if (!Number.isSafeInteger(requestedQuantity)) {
        showToast('Invalid quantity', `The requested quantity for ${item.artwork.title} is too large.`, 'error');
        return undefined;
      }
      requestedQuantities.set(item.artwork.id, requestedQuantity);
    }

    const inventoryUpdates = new Map<string, number>();
    const artworkById = new Map(availableArtworks.map((artwork) => [artwork.id, artwork]));
    for (const [artworkId, requestedQuantity] of requestedQuantities) {
      const artwork = artworkById.get(artworkId);
      if (!artwork || artwork.status !== 'approved') {
        showToast(
          'Artwork unavailable',
          'One or more items in your cart are no longer approved for sale. Remove them and try again.',
          'error'
        );
        return undefined;
      }
      if (
        !Number.isSafeInteger(artwork.stock) ||
        artwork.stock === undefined ||
        artwork.stock < 0 ||
        artwork.stock < requestedQuantity
      ) {
        const remaining = Number.isSafeInteger(artwork.stock) ? artwork.stock : 0;
        showToast(
          'Not enough stock',
          `${artwork.title} has ${remaining} available; your order needs ${requestedQuantity}.`,
          'error'
        );
        return undefined;
      }
      inventoryUpdates.set(artworkId, artwork.stock - requestedQuantity);
    }

    const checkoutItems: CartItem[] = [];
    for (const item of requestedItems) {
      const artwork = artworkById.get(item.artwork.id);
      if (!artwork) {
        showToast('Artwork unavailable', 'An item in your cart could not be found in current inventory.', 'error');
        return undefined;
      }
      checkoutItems.push({ ...item, artwork });
    }

    let voucherDiscounts = checkoutItems.map(() => 0);
    let originalVoucherData: VoucherItem[] | undefined;
    let updatedVoucherData: VoucherItem[] | undefined;
    if (details.voucherCode?.trim()) {
      let currentVouchers: VoucherItem[];
      try {
        currentVouchers = loadVoucherData();
      } catch (error) {
        showToast(
          'Voucher could not be checked',
          error instanceof Error ? error.message : 'Unable to load current vouchers.',
          'error'
        );
        return undefined;
      }

      const voucherResult = evaluateVoucher(details.voucherCode, checkoutItems, currentVouchers);
      if (typeof voucherResult === 'string') {
        showToast('Voucher could not be applied', voucherResult, 'error');
        return undefined;
      }

      voucherDiscounts = allocateVoucherDiscounts(
        checkoutItems,
        voucherResult.voucher,
        voucherResult.discountAmount
      );
      originalVoucherData = currentVouchers;
      updatedVoucherData = currentVouchers.map((voucher) => (
        voucher.id === voucherResult.voucher.id
          ? { ...voucher, usedCount: voucher.usedCount + 1 }
          : voucher
      ));
    }

    const timestamp = Date.now();
    const orderNumber = `RN-${timestamp.toString().slice(-8)}`;
    const orderIds = checkoutItems.map((_, index) => `order-${timestamp}-${index}`);
    const hasPhysicalItem = checkoutItems.some(({ artwork }) => (
      (artwork.productType ?? 'pre_made') !== 'digital' &&
      (artwork.fulfillmentType ?? 'physical') === 'physical'
    ));
    const deliveryAddress = !hasPhysicalItem
      ? 'Digital delivery through seller messages'
      : details.deliveryMethod === 'door_to_door'
      ? `${details.recipientName} · ${details.phone} · ${details.deliveryAddress}`
      : `${details.recipientName} · ${details.phone} · CAFA Main Campus Pickup Desk`;
    const newOrders: OrderItem[] = checkoutItems.map(({ artwork, quantity, selectedSize, designChoice, buyerNote, selectedColor, selectedOptions }, index) => {
      const discountAmount = voucherDiscounts[index];
      return {
        id: orderIds[index],
        artworkId: checkoutItems[index].artwork.id,
        orderNumber,
        title: artwork.title,
        artist: artwork.artist,
        buyerEmail: authSession?.email,
        medium: artwork.mediumsUsed?.split(',')[0] || artwork.category,
        status: 'Processing',
        dateInfo: 'Awaiting seller confirmation',
        price: Math.max(0, artwork.price * quantity - discountAmount),
        voucherCode: details.voucherCode?.trim().toUpperCase() || undefined,
        discountAmount: discountAmount || undefined,
        image: artwork.image,
        deliveryMethod: hasPhysicalItem ? details.deliveryMethod : 'campus_pickup',
        paymentMethod: details.paymentMethod,
        deliveryAddress,
        quantity,
        selectedSize: selectedSize || artwork.size,
        designChoice,
        selectedColor,
        selectedOptions,
        buyerNote: [buyerNote, details.buyerNote].filter(Boolean).join('\n') || undefined,
        productType: artwork.productType ?? 'pre_made',
      };
    });
    const newTransactions: SellerOrderTransaction[] = checkoutItems.map(({ artwork, quantity, selectedSize, designChoice, buyerNote, selectedColor, selectedOptions }, index) => {
      const discountAmount = voucherDiscounts[index];
      const netAmount = Math.max(0, artwork.price * quantity - discountAmount);
      return {
        id: orderIds[index],
        orderNumber,
        artwork: artwork.title,
        artist: artwork.artist,
        buyer: details.recipientName,
        buyerEmail: authSession?.email,
        date: new Date(timestamp).toLocaleDateString(),
        grossAmount: netAmount,
        platformTakeRate: 0,
        platformTakeAmount: 0,
        netStudentPayout: netAmount,
        voucherCode: details.voucherCode?.trim().toUpperCase() || undefined,
        discountAmount: discountAmount || undefined,
        status: 'Pending',
        escrowStatus: 'Awaiting payment',
        fulfillmentStatus: 'Processing',
        deliveryMethod: hasPhysicalItem ? details.deliveryMethod : 'campus_pickup',
        paymentMethod: details.paymentMethod,
        quantity,
        selectedSize: selectedSize || artwork.size,
        designChoice,
        selectedColor,
        selectedOptions,
        buyerNote: [buyerNote, details.buyerNote].filter(Boolean).join('\n') || undefined,
        productType: artwork.productType ?? 'pre_made',
        deliveryAddress,
        receiptDetails: {
          buyerName: details.recipientName,
          buyerAddress: !hasPhysicalItem
            ? ''
            : details.deliveryMethod === 'door_to_door'
            ? details.deliveryAddress
            : 'CAFA Main Campus Pickup Desk',
          buyerPhone: details.phone || undefined,
          sellerName: artwork.shopName || artwork.artist,
          sellerAddress: artwork.shopAddress || '',
          itemTitle: artwork.title,
          quantity,
          weight: artwork.weightKg ? `${artwork.weightKg} kg` : undefined,
          size: selectedSize || artwork.size,
        },
      };
    });

    const updatedArtworks = availableArtworks.map((artwork) => (
      inventoryUpdates.has(artwork.id)
        ? { ...artwork, stock: inventoryUpdates.get(artwork.id) }
        : artwork
    ));
    const updatedOrderData = {
      orders: [...newOrders, ...currentOrderData.orders],
      sellerTransactions: [...newTransactions, ...currentOrderData.sellerTransactions],
    };

    let artworkSaved = false;
    let vouchersSaved = false;
    try {
      saveArtworkData(updatedArtworks);
      artworkSaved = true;
      if (updatedVoucherData) {
        saveVoucherData(updatedVoucherData);
        vouchersSaved = true;
      }
      saveOrderData(updatedOrderData);
    } catch (error) {
      const rollbackErrors: string[] = [];
      if (artworkSaved) {
        try {
          saveArtworkData(availableArtworks);
        } catch (rollbackError) {
          rollbackErrors.push(
            `Inventory rollback failed: ${rollbackError instanceof Error ? rollbackError.message : 'Unable to restore stock.'}`
          );
        }
      }
      if (vouchersSaved && originalVoucherData) {
        try {
          saveVoucherData(originalVoucherData);
        } catch (rollbackError) {
          rollbackErrors.push(
            `Voucher rollback failed: ${rollbackError instanceof Error ? rollbackError.message : 'Unable to restore voucher usage.'}`
          );
        }
      }
      showToast(
        'Order could not be saved',
        [
          error instanceof Error ? error.message : 'Unable to reserve inventory and save the order.',
          ...rollbackErrors,
        ].join(' '),
        'error'
      );
      return undefined;
    }

    setArtworks(updatedArtworks);
    if (updatedVoucherData) setVouchers(updatedVoucherData);
    setOrderData(updatedOrderData);
    if (directCheckoutItems) {
      setDirectCheckoutItems(null);
    } else {
      setCartItems([]);
    }
    showToast(
      'Order request received',
      'The seller will confirm any delivery fee and coordinate payment and delivery updates with you.',
      'success'
    );
    return orderNumber;
  };

  const handleCheckout = async (details: CheckoutDetails): Promise<string | undefined> => {
    if (!navigator.locks) {
      showToast(
        'Checkout is unavailable',
        'This browser cannot safely reserve stock across tabs. Use an up-to-date browser and try again.',
        'error'
      );
      return undefined;
    }

    try {
      return await navigator.locks.request('red-nexus-checkout', () => handleCheckoutWithoutLock(details));
    } catch (error) {
      showToast(
        'Checkout is unavailable',
        error instanceof Error ? error.message : 'Unable to acquire the checkout reservation lock.',
        'error'
      );
      return undefined;
    }
  };

  const handleContactSeller = (sellerName: string) => {
    const buyerEmail = authSession?.role === 'buyer' ? authSession.email.toLowerCase() : '';
    const existing = conversations.find((conversation) => (
      conversation.sellerName?.toLowerCase() === sellerName.toLowerCase() &&
      (conversation.buyerEmail?.toLowerCase() === buyerEmail ||
        (!conversation.buyerEmail && conversation.email.toLowerCase() === buyerEmail))
    ));
    if (existing) {
      setActiveBuyerConversationId(existing.id);
    } else {
      const initials = sellerName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
      const conversation: Conversation = {
        id: `conv-${Date.now()}`,
        name: sellerName,
        buyerName: authSession?.name,
        buyerEmail: authSession?.email,
        sellerName,
        email: '',
        lastMessage: 'Start a conversation about your order',
        time: 'Just now',
        unread: false,
        avatarBg: '#FEE2E2',
        avatarInitials: initials,
        subject: 'Order question',
        messages: [],
      };
      setConversations((previous) => [conversation, ...previous]);
      setActiveBuyerConversationId(conversation.id);
    }
    setViewMode('buyer_profile');
    setBuyerTab('messages');
  };

  const handleRefundRequestMessage = (
    request: RefundRequest,
    status: 'submitted' | Extract<RefundRequestStatus, 'approved' | 'declined'>
  ) => {
    setRefundRequests((previous) => [
      ...previous.filter((item) => item.id !== request.id),
      request,
    ]);
    const conversationId = `refund-${request.buyerEmail.toLowerCase()}-${request.orderId}`;
    const conversationSubject = `Refund request · ${request.orderNumber}`;
    const now = new Date();
    const issueType = request.issueType === 'received_with_issues'
      ? 'Received all items, but there are issues'
      : "Didn't receive the item";
    const statusLabel = status === 'submitted'
      ? 'Refund request submitted'
      : status === 'approved' ? 'Refund request approved' : 'Refund request declined';
    const messageText = [
      statusLabel,
      `Order: ${request.orderNumber} · ${request.artworkTitle}`,
      `Issue: ${issueType}`,
      `Reason: ${request.reason}`,
      `Details: ${request.details || 'No additional details provided.'}`,
      'Evidence image: attached to the refund request.',
      status === 'approved'
        ? 'Please contact the seller to coordinate the actual refund. Payment processing is not connected.'
        : status === 'declined'
          ? 'Please review the seller’s decision in your refund request details.'
          : 'Your request and evidence are waiting for the seller to review.',
    ].join('\n');
    const newMessage = {
      id: `refund-${request.id}-${status}`,
      sender: status === 'submitted' ? 'buyer' as const : 'seller' as const,
      text: messageText,
      time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      refundRequestId: request.id,
    };

    setConversations((previous) => {
      const existing = previous.find((conversation) => conversation.id === conversationId);
      const baseConversation: Conversation = existing ?? {
        id: conversationId,
        orderId: request.orderId,
        buyerName: request.buyerName,
        buyerEmail: request.buyerEmail,
        sellerName: request.artist,
        name: request.artist,
        email: request.buyerEmail,
        lastMessage: messageText.split('\n')[0],
        time: 'Just now',
        unread: false,
        avatarBg: '#FEE2E2',
        avatarInitials: request.artist.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
        subject: conversationSubject,
        messages: [],
      };
      const messages = [
        ...baseConversation.messages.filter((message) => message.id !== newMessage.id),
        newMessage,
      ];
      const updatedConversation: Conversation = {
        ...baseConversation,
        orderId: request.orderId,
        buyerName: request.buyerName,
        buyerEmail: request.buyerEmail,
        sellerName: request.artist,
        subject: conversationSubject,
        lastMessage: `${newMessage.sender === 'buyer' ? 'You: ' : ''}${newMessage.text.split('\n')[0]}`,
        time: 'Just now',
        unread: status === 'submitted',
        messages,
      };
      return existing
        ? previous.map((conversation) => conversation.id === conversationId ? updatedConversation : conversation)
        : [updatedConversation, ...previous];
    });
    setActiveBuyerConversationId(conversationId);
    setActiveSellerConversationId(conversationId);
  };

  const handleSellerRefundDecision = (
    requestId: string,
    status: Extract<RefundRequestStatus, 'approved' | 'declined'>
  ) => {
    try {
      const request = updateRefundRequestStatus(requestId, status);
      handleRefundRequestMessage(request, status);
      showToast(
        status === 'approved' ? 'Refund request approved' : 'Refund request rejected',
        status === 'approved'
          ? 'The buyer can see your approval and refund details in Messages.'
          : 'The buyer can see your decision in Messages.',
        status === 'approved' ? 'success' : 'info'
      );
    } catch (error) {
      showToast(
        'Refund decision could not be saved',
        error instanceof Error ? error.message : 'Unable to save the refund decision.',
        'error'
      );
    }
  };

  const handleProceedToCheckout = (artwork: Artwork, selection: Omit<CartItem, 'artwork'>) => {
    setDirectCheckoutItems([{
      ...selection,
      lineId: `direct-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      artwork,
    }]);
    setSelectedArtworkModal(null);
    setMarketplaceTab('cart');
  };

  const handleUpdateShipping = (
    id: string,
    fulfillmentStatus: ManualFulfillmentStatus,
    shipment?: Partial<ShipmentDetails>
  ) => {
    setOrderData((previous) => ({
      sellerTransactions: previous.sellerTransactions.map((transaction) => (
        transaction.id === id
          ? {
              ...transaction,
              fulfillmentStatus,
              status: fulfillmentStatus === 'Shipped' || fulfillmentStatus === 'Out for Delivery' ? 'Shipped' : 'Pending',
              ...(shipment ?? {}),
            }
          : transaction
      )),
      orders: previous.orders.map((order) => (
        order.id === id
          ? {
              ...order,
              fulfillmentStatus,
              status: fulfillmentStatus === 'Shipped' || fulfillmentStatus === 'Out for Delivery' ? 'In transit' : 'Ready for pickup',
              ...(shipment ?? {}),
              dateInfo: fulfillmentStatus === 'Out for Delivery'
                ? 'Out for delivery'
                : fulfillmentStatus === 'Shipped'
                ? 'Shipped by seller'
                : 'Ready for campus pickup',
            }
          : order
      )),
    }));
    showToast(
      fulfillmentStatus === 'Out for Delivery'
        ? 'Order is out for delivery'
        : fulfillmentStatus === 'Shipped'
        ? 'Order marked shipped'
        : 'Order ready for pickup',
      fulfillmentStatus === 'Out for Delivery'
        ? 'Upload proof of delivery under Out for Delivery when the parcel arrives.'
        : fulfillmentStatus === 'Shipped'
        ? 'Add tracking and rider details in Manage Orders under Shipped.'
        : 'The buyer can now see that their order is ready at the campus pickup desk.',
      'success'
    );
  };

  const handleUpdateShippedDetails = (id: string, shipment: ShipmentDetails) => {
    setOrderData((previous) => ({
      sellerTransactions: previous.sellerTransactions.map((transaction) => (
        transaction.id === id
          ? { ...transaction, ...shipment, status: 'Shipped', fulfillmentStatus: 'Shipped' }
          : transaction
      )),
      orders: previous.orders.map((order) => (
        order.id === id
          ? { ...order, ...shipment, status: 'In transit', fulfillmentStatus: 'Shipped', dateInfo: 'Shipped by seller' }
          : order
      )),
    }));
  };

  const handleCompleteDelivery = (id: string, details: DeliveryCompletionDetails) => {
    const completedAt = new Date().toISOString();
    const returnDueAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    setOrderData((previous) => ({
      sellerTransactions: previous.sellerTransactions.map((transaction) => (
        transaction.id === id
          ? { ...transaction, status: 'Completed', fulfillmentStatus: 'Delivered', ...details, completedAt }
          : transaction
      )),
      orders: previous.orders.map((order) => (
        order.id === id
          ? {
              ...order,
              status: 'Completed',
              fulfillmentStatus: 'Delivered',
              ...details,
              completedAt,
              returnDueAt,
              dateInfo: 'Delivered and confirmed by seller',
            }
          : order
      )),
    }));
    showToast('Order completed', 'The delivery proof has been saved and the buyer can view it in their order details.', 'success');
  };

  const handleUpdateEscrowStatus = (
    id: string,
    escrowStatus: NonNullable<SellerOrderTransaction['escrowStatus']>
  ) => {
    setOrderData((previous) => ({
      ...previous,
      sellerTransactions: previous.sellerTransactions.map((transaction) => (
        transaction.id === id ? { ...transaction, escrowStatus } : transaction
      )),
    }));
  };

  // Verify Artwork (Admin)
  const handleVerifyArtwork = (id: string) => {
    setArtworks((prev) =>
      prev.map((art) => (art.id === id ? { ...art, status: 'approved', isActive: true, reviewNotes: undefined } : art))
    );
    // Add audit log
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      datetime: new Date().toLocaleString(),
      action: 'Verification',
      actor: 'Admin',
      role: 'Super Admin',
      status: 'Success',
      information: `Artwork ${id} verified and approved for catalog`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleSubmitSellerArtwork = (newArtwork: Partial<Artwork>) => {
    const artwork: Artwork = {
      id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: newArtwork.title ?? '',
      artist: authSession?.name ?? '',
      image: newArtwork.image ?? '',
      video: newArtwork.video,
      price: newArtwork.price ?? 0,
      size: newArtwork.size ?? '',
      status: 'pending',
      category: newArtwork.category ?? 'painting',
      genre: newArtwork.genre,
      style: newArtwork.style,
      description: newArtwork.description,
      mediumsUsed: newArtwork.mediumsUsed,
      postedDate: new Date().toLocaleDateString(),
      isActive: false,
      productType: newArtwork.productType,
      fulfillmentType: newArtwork.fulfillmentType,
      availablePayments: newArtwork.availablePayments,
      weightKg: newArtwork.weightKg,
      designOptions: newArtwork.designOptions,
      sizeOptions: newArtwork.sizeOptions,
      colorOptions: newArtwork.colorOptions,
      optionGroups: newArtwork.optionGroups,
      colors: newArtwork.colors,
      shopName: newArtwork.shopName,
      shopAddress: newArtwork.shopAddress,
      stock: newArtwork.stock ?? 0,
    };
    setArtworks((previous) => [artwork, ...previous]);
  };

  const handleActivateSellerArtwork = (id: string) => {
    setArtworks((previous) =>
      previous.map((artwork) => (artwork.id === id ? { ...artwork, isActive: true } : artwork))
    );
    showToast('Product is active', 'The approved artwork has been added to your active product list.', 'success');
  };

  // Reject Artwork (Admin)
  const handleRejectArtwork = (id: string, reviewNotes: string) => {
    setArtworks((prev) =>
      prev.map((art) => (art.id === id ? { ...art, status: 'rejected', isActive: false, reviewNotes } : art))
    );
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      datetime: new Date().toLocaleString(),
      action: 'Verification',
      actor: 'Admin',
      role: 'Super Admin',
      status: 'Warning',
      information: `Artwork ${id} rejected with revisions requested`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleToggleAccountSuspension = (email: string, role: 'buyer' | 'seller'): boolean => {
    try {
      const account = getLocalAccountByEmail(email);
      if (account?.role !== role) {
        showToast('Account not found', 'The selected account could not be found in local account storage.', 'error');
        return false;
      }
      if (!updateLocalAccountAccess(email, {
        sellerStatus: account.sellerStatus,
        isBanned: account.isBanned ?? false,
        isSuspended: !account.isSuspended,
        strikeCount: account.strikeCount ?? 0,
      })) {
        showToast('Account status could not be changed', 'The selected account could not be updated.', 'error');
        return false;
      }

      setStudents(loadManagedSellerAccounts());
      setCustomers(loadManagedCustomers());
      setStrikes(loadManagedStrikeAccounts());
      setAuditLogs((previous) => [{
        id: `log-${Date.now()}`,
        datetime: new Date().toLocaleString(),
        action: 'Information',
        actor: 'Admin',
        role: 'Super Admin',
        status: 'Warning',
        information: `${role === 'seller' ? 'Seller' : 'Customer'} account ${email} ${account.isSuspended ? 'reactivated' : 'suspended'}`,
      }, ...previous]);
      return true;
    } catch (error) {
      showToast(
        'Account status could not be changed',
        error instanceof Error ? error.message : 'Unable to save account status.',
        'error'
      );
      return false;
    }
  };

  const handleRemoveManagedAccount = (email: string, role: 'buyer' | 'seller'): boolean => {
    try {
      if (!removeLocalAccount(email, role)) {
        showToast('Account not found', 'The selected account could not be found in local account storage.', 'error');
        return false;
      }

      setStudents(loadManagedSellerAccounts());
      setCustomers(loadManagedCustomers());
      setStrikes(loadManagedStrikeAccounts().filter((strike) => (
        strike.email.toLowerCase() !== email.toLowerCase()
      )));
      setAuditLogs((previous) => [{
        id: `log-${Date.now()}`,
        datetime: new Date().toLocaleString(),
        action: 'Information',
        actor: 'Admin',
        role: 'Super Admin',
        status: 'Warning',
        information: `${role === 'seller' ? 'Seller' : 'Customer'} account ${email} removed`,
      }, ...previous]);
      return true;
    } catch (error) {
      showToast(
        'Account could not be removed',
        error instanceof Error ? error.message : 'Unable to remove the selected account.',
        'error'
      );
      return false;
    }
  };

  // Approve seller account (Admin)
  const handleApproveStudent = (id: string): boolean => {
    const student = students.find((item) => item.id === id);
    if (!student) return false;
    try {
      const account = getLocalAccountByEmail(student.email);
      if (account?.role !== 'seller' || !updateLocalAccountAccess(student.email, {
        sellerStatus: 'Verified',
        isBanned: account.isBanned ?? false,
        strikeCount: account.strikeCount ?? 0,
      })) {
        showToast('Seller account not found', 'Only pre-made seller accounts can be approved for sign-in.', 'error');
        return false;
      }
    } catch (error) {
      showToast(
        'Seller account approval failed',
        error instanceof Error ? error.message : 'Unable to save seller account access.',
        'error'
      );
      return false;
    }

    setStudents((prev) =>
      prev.map((stu) => (stu.id === id ? { ...stu, status: 'Verified' } : stu))
    );
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      datetime: new Date().toLocaleString(),
      action: 'Information',
      actor: 'Admin',
      role: 'Super Admin',
      status: 'Success',
      information: `Seller account accreditation approved for ID ${id}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    return true;
  };

  // Reject seller account (Admin)
  const handleRejectStudent = (id: string): boolean => {
    const student = students.find((item) => item.id === id);
    if (!student) return false;
    try {
      const account = getLocalAccountByEmail(student.email);
      if (account?.role !== 'seller' || !updateLocalAccountAccess(student.email, {
        sellerStatus: 'Rejected',
        isBanned: account.isBanned ?? false,
        strikeCount: account.strikeCount ?? 0,
      })) {
        showToast('Seller account not found', 'Only pre-made seller accounts can be rejected for sign-in.', 'error');
        return false;
      }
    } catch (error) {
      showToast(
        'Seller account rejection failed',
        error instanceof Error ? error.message : 'Unable to save seller account access.',
        'error'
      );
      return false;
    }

    setStudents((prev) =>
      prev.map((stu) => (stu.id === id ? { ...stu, status: 'Rejected' } : stu))
    );
    return true;
  };

  // Add Strike (Admin)
  const handleAddStrike = (id: string): boolean => {
    const strike = strikes.find((item) => item.id === id);
    if (!strike) return false;
    try {
      const account = getLocalAccountByEmail(strike.email);
      if (!account) {
        showToast('Account not found', 'This account has no pre-made sign-in record to update.', 'error');
        return false;
      }
      const newStrikes = Math.min(3, strike.strikes + 1);
      const isBanned = newStrikes >= 3 || account.isBanned === true;
      if (!updateLocalAccountAccess(strike.email, {
        sellerStatus: account.sellerStatus,
        isBanned,
        strikeCount: newStrikes,
      })) return false;

      setStrikes((prev) =>
        prev.map((st) => {
          if (st.id === id) {
            return { ...st, strikes: newStrikes, status: isBanned ? 'Banned' : 'Active' };
          }
          return st;
        })
      );
      return true;
    } catch (error) {
      showToast(
        'Strike could not be saved',
        error instanceof Error ? error.message : 'Unable to update account access.',
        'error'
      );
      return false;
    }
  };

  // Clear Strikes (Admin)
  const handleClearStrikes = (id: string): boolean => {
    const strike = strikes.find((item) => item.id === id);
    if (!strike) return false;
    try {
      const account = getLocalAccountByEmail(strike.email);
      if (!account) {
        showToast('Account not found', 'This account has no pre-made sign-in record to update.', 'error');
        return false;
      }
      if (!updateLocalAccountAccess(strike.email, {
        sellerStatus: account.sellerStatus,
        isBanned: account.isBanned ?? false,
        strikeCount: 0,
      })) {
        showToast('Strikes could not be cleared', 'This account has no pre-made sign-in record to update.', 'error');
        return false;
      }

      setStrikes((prev) =>
        prev.map((st) => (st.id === id ? { ...st, strikes: 0 } : st))
      );
      return true;
    } catch (error) {
      showToast(
        'Strikes could not be cleared',
        error instanceof Error ? error.message : 'Unable to update account access.',
        'error'
      );
      return false;
    }
  };

  // Toggle Ban (Admin)
  const handleToggleBan = (id: string): boolean => {
    const strike = strikes.find((item) => item.id === id);
    if (!strike) return false;
    try {
      const account = getLocalAccountByEmail(strike.email);
      if (!account) {
        showToast('Account not found', 'This account has no pre-made sign-in record to update.', 'error');
        return false;
      }
      const isBanned = strike.status !== 'Active';
      if (!updateLocalAccountAccess(strike.email, {
        sellerStatus: account.sellerStatus,
        isBanned,
        strikeCount: account.strikeCount ?? strike.strikes,
      })) {
        showToast('Account status could not be changed', 'This account has no pre-made sign-in record to update.', 'error');
        return false;
      }

      setStrikes((prev) =>
        prev.map((st) => {
          if (st.id === id) {
            return { ...st, status: isBanned ? 'Banned' : 'Active' };
          }
          return st;
        })
      );
      return true;
    } catch (error) {
      showToast(
        'Account status could not be changed',
        error instanceof Error ? error.message : 'Unable to update account access.',
        'error'
      );
      return false;
    }
  };

  // Send Buyer Chat Message
  const handleSendChatMessage = (conversationId: string, text: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const sender = authSession?.role === 'buyer'
            ? 'buyer' as const
            : authSession?.role === 'admin'
              ? 'support' as const
              : 'seller' as const;
          const newMsg = {
            id: `msg-${Date.now()}`,
            sender,
            text,
            time: 'Just now',
          };
          return {
            ...conv,
            lastMessage: sender === 'buyer' ? `You: ${text}` : text,
            time: 'Just now',
            unread: sender === 'buyer',
            buyerUnread: conv.isSupport
              ? sender === 'support'
              : sender === 'seller',
            sellerUnread: sender === 'buyer',
            adminUnread: conv.isSupport && sender === 'buyer',
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );
  };

  const handleMarkConversationRead = (conversationId: string, role: 'buyer' | 'seller' | 'admin') => {
    setConversations((previous) => previous.map((conversation) => (
      conversation.id === conversationId
        ? role === 'buyer'
          ? { ...conversation, buyerUnread: false }
          : role === 'admin'
            ? { ...conversation, adminUnread: false }
          : { ...conversation, sellerUnread: false, unread: false }
        : conversation
    )));
  };

  const handleMarkBuyerConversationUnread = (conversationId: string) => {
    setConversations((previous) => previous.map((conversation) => (
      conversation.id === conversationId
        ? { ...conversation, buyerUnread: true }
        : conversation
    )));
  };

  const handleStartSupportConversation = (subject: string, text: string) => {
    if (!authSession || authSession.role !== 'buyer') {
      throw new Error('Sign in with a buyer account to contact support.');
    }

    const now = new Date();
    const conversationId = `support-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
    const conversation: Conversation = {
      id: conversationId,
      isSupport: true,
      buyerName: authSession.name,
      buyerEmail: authSession.email,
      name: 'Red Nexus Support',
      email: 'support@rednexus.local',
      lastMessage: `You: ${text}`,
      time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      unread: false,
      buyerUnread: false,
      adminUnread: true,
      avatarBg: 'bg-red-700',
      avatarInitials: 'RN',
      subject,
      messages: [{
        id: `message-${now.getTime()}`,
        sender: 'buyer',
        text,
        time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      }],
    };
    setConversations((previous) => [...previous, conversation]);
    return conversationId;
  };

  // Counts
  const favoritesCount = artworks.filter((a) => a.isFavorited).length;
  const cartCount = cartItems.reduce((acc, c) => acc + c.quantity, 0);
  const pendingArtsCount = artworks.filter((a) => a.status === 'pending').length;
  const verificationParams = new URLSearchParams(window.location.search);
  const verificationArtworkId = verificationParams.get('verify');

  const handleAuthenticated = (session: LocalAuthSession) => {
    setAuthSession(session);
    setCustomers(loadManagedCustomers());
    setViewMode(
      session.role === 'seller'
        ? 'seller_portal'
        : session.role === 'admin'
        ? 'admin_portal'
        : 'marketplace'
    );
    if (session.role === 'buyer') {
      const savedAddresses = session.addresses?.length
        ? session.addresses
        : session.address
          ? [session.address]
          : [];
      const addresses = savedAddresses.length > 0
        ? savedAddresses.map((address) => ({ ...address }))
        : [{
            id: 'address-home',
            label: 'Home',
            name: session.name,
            line1: '',
            city: '',
            phone: '',
            isDefault: true,
          }];
      const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
      setBuyerAddresses(addresses);
      setBuyerAddress(defaultAddress
        ? { ...defaultAddress, isDefault: true }
        : {
            id: 'address-home',
            label: 'Home',
            name: session.name,
            line1: '',
            city: '',
            phone: '',
            isDefault: true,
          });
      setMarketplaceTab('home');
    }
  };

  const handleUpdateBuyerAddresses = (addresses: BuyerAddress[]) => {
    if (!authSession || authSession.role !== 'buyer') {
      throw new Error('Only a signed-in buyer can manage saved addresses.');
    }

    const normalizedAddresses = addresses.map((address) => ({ ...address }));
    const defaultAddress = normalizedAddresses.find((address) => address.isDefault);
    if (!defaultAddress) throw new Error('Choose a default delivery address.');
    updateLocalBuyerAddresses(authSession.email, normalizedAddresses);
    setBuyerAddresses(normalizedAddresses);
    setBuyerAddress(defaultAddress);
    setAuthSession({
      ...authSession,
      addresses: normalizedAddresses,
      address: defaultAddress,
    });
  };

  const handleUpdateBuyerProfile = (name: string) => {
    if (!authSession || authSession.role !== 'buyer') {
      throw new Error('Only a signed-in buyer can update this profile.');
    }

    updateLocalBuyerProfile(authSession.email, name);
    setAuthSession({ ...authSession, name: name.trim() });
    setCustomers(loadManagedCustomers());
  };

  const handleChangeBuyerPassword = async (currentPassword: string, newPassword: string) => {
    if (!authSession || authSession.role !== 'buyer') {
      throw new Error('Only a signed-in buyer can change this password.');
    }
    await changeLocalBuyerPassword(authSession.email, currentPassword, newPassword);
  };

  const handleSignOut = () => {
    setAuthSession(null);
    setViewMode('marketplace');
    setMarketplaceTab('home');
    setBuyerTab('orders');
    setSellerTab('order');
    setAdminTab('dashboard');
  };

  if (verificationArtworkId !== null) {
    return (
      <CertificateVerificationView
        artwork={artworks.find((artwork) => artwork.id === verificationArtworkId)}
      />
    );
  }

  if (!authSession) {
    return <LocalAuthView onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]/40 flex flex-col antialiased selection:bg-red-500 selection:text-white">
      {/* 1. If in ADMIN PORTAL View */}
      {viewMode === 'admin_portal' ? (
        <div className="admin-panel flex min-h-screen flex-col bg-[#F8FAFC]">
          {/* Admin Header */}
          <AdminHeader
            userName={authSession.name}
            onSignOut={handleSignOut}
          />

          <div className="flex flex-1 flex-col md:flex-row">
            {/* Admin Burgundy Sidebar */}
            <AdminSidebar
              currentTab={adminTab}
              onSelectTab={setAdminTab}
              pendingArtsCount={pendingArtsCount}
              supportCount={supportConversations.filter((conversation) => conversation.unread).length}
            />

            {/* Admin Main Body */}
            <div className="flex-1 flex flex-col min-w-0">

            {/* Admin Views Routed Content */}
            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
              {adminTab === 'dashboard' && (
                <AdminDashboardView
                  artworks={artworks}
                  onNavigateTab={setAdminTab}
                  onSelectArtwork={(art) => setSelectedArtworkModal(art)}
                  onExportData={() =>
                    showToast('Report Exported', 'CAFA Q3 Audit & Sales metrics saved to CSV.', 'success')
                  }
                />
              )}

              {adminTab === 'sales' && (
                <AdminSalesView
                  transactions={sellerTransactions}
                  onExport={() =>
                    showToast('Ledger Exported', 'Complete student payouts ledger downloaded.', 'success')
                  }
                  onShowToast={showToast}
                />
              )}

              {adminTab === 'marketing' && (
                <AdminMarketingView
                  homePromotions={homePromotions}
                  onSaveHomePromotion={handleSaveHomePromotion}
                  onDeleteHomePromotion={handleDeleteHomePromotion}
                  onShowToast={showToast}
                />
              )}

              {adminTab === 'customer_service' && (
                <AdminSupportView
                  conversations={supportConversations}
                  onSendMessage={handleSendChatMessage}
                  onMarkConversationRead={(conversationId) => handleMarkConversationRead(conversationId, 'admin')}
                />
              )}

              {adminTab === 'bank_account' && (
                <AdminBankAccountView
                  transactions={sellerTransactions}
                  onUpdateEscrowStatus={handleUpdateEscrowStatus}
                  onShowToast={showToast}
                />
              )}

              {adminTab === 'art_verification' && (
                <AdminArtVerificationView
                  artworks={artworks}
                  onVerifyArtwork={handleVerifyArtwork}
                  onRejectArtwork={handleRejectArtwork}
                  onShowToast={showToast}
                />
              )}

              {adminTab === 'authenticity_check' && (
                <ArtworkAuthenticityView
                  artworks={artworks}
                  orders={orders}
                  transactions={sellerTransactions}
                />
              )}

              {adminTab === 'users_admins' && (
                <AdminUsersAdminsView
                  admins={admins}
                  onShowToast={showToast}
                />
              )}

              {adminTab === 'users_students' && (
                <AdminUsersStudentsView
                  students={students}
                  filterStatus="All"
                  onApproveStudent={handleApproveStudent}
                  onRejectStudent={handleRejectStudent}
                  onToggleSuspended={(student) => handleToggleAccountSuspension(student.email, 'seller')}
                  onRemoveAccount={(student) => handleRemoveManagedAccount(student.email, 'seller')}
                  onShowToast={showToast}
                />
              )}

              {adminTab === 'users_customers' && (
                <AdminUsersCustomersView
                  customers={customers.map((customer) => ({
                    ...customer,
                    completedPurchases: sellerTransactions.filter((transaction) => (
                      transaction.buyerEmail?.toLowerCase() === customer.email.toLowerCase() &&
                      transaction.status === 'Completed'
                    )).length,
                  }))}
                  onToggleSuspended={(customer) => handleToggleAccountSuspension(customer.email, 'buyer')}
                  onRemoveAccount={(customer) => handleRemoveManagedAccount(customer.email, 'buyer')}
                  onShowToast={showToast}
                />
              )}

              {adminTab === 'strikes_bans' && (
                <AdminStrikesBansView
                  strikes={strikes}
                  onAddStrike={handleAddStrike}
                  onClearStrikes={handleClearStrikes}
                  onToggleBan={handleToggleBan}
                  onShowToast={showToast}
                />
              )}

              {adminTab === 'audit_logs' && (
                <AdminAuditLogsView logs={auditLogs} />
              )}
              </main>
            </div>
          </div>
        </div>
      ) : viewMode === 'seller_portal' ? (
        /* 2. SELLER PORTAL (STUDENT ARTIST) - Matches Seller Navigation bar.png design */
        <div className="seller-panel flex flex-col min-h-screen bg-[#F8FAFC]">
          {/* Seller Header */}
          <SellerHeader
            userName={authSession.name}
            onSignOut={handleSignOut}
            onOpenSettings={() => setSellerTab('finance')}
          />

          {/* Seller Layout: Curved Burgundy Sidebar & Routed Views */}
          <div className="flex flex-1">
            <SellerSidebar
              currentTab={sellerTab}
              onSelectTab={setSellerTab}
              unreadMessagesCount={
                sellerConversationsForUser.filter((conversation) => conversation.unread).length +
                sellerRefundRequestsForUser.filter((request) => request.status === 'pending').length
              }
              pendingVerificationCount={1}
            />

            {/* Seller Main Content */}
            <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full min-w-0">
              {sellerTab === 'order' && (
                <SellerOrderView
                  transactions={sellerTransactionsForUser}
                  onShowToast={showToast}
                  onNavigateTab={setSellerTab}
                  renderToShipView={(onBack) => (
                    <SellerFulfillmentView
                      transactions={sellerTransactionsForUser}
                      sellerName={authSession.name}
                      onBackToOrders={onBack}
                      onUpdateShipping={handleUpdateShipping}
                    />
                  )}
                  onCompleteDelivery={handleCompleteDelivery}
                  onUpdateShippedDetails={handleUpdateShippedDetails}
                  onUpdateShipping={handleUpdateShipping}
                  refundRequests={sellerRefundRequestsForUser}
                  conversations={sellerConversationsForUser}
                  onRefundRequestDecision={handleSellerRefundDecision}
                  onNavigateToCustomerService={(conversationId) => {
                    setActiveSellerConversationId(conversationId);
                    setSellerTab('messages');
                  }}
                />
              )}

              {sellerTab === 'shipping_fulfillment' && (
                <SellerFulfillmentView
                  transactions={sellerTransactionsForUser}
                  sellerName={authSession.name}
                  onBackToOrders={() => setSellerTab('order')}
                  onUpdateShipping={handleUpdateShipping}
                />
              )}

              {sellerTab === 'dashboard' && (
                <SellerDashboardView
                  onNavigateTab={setSellerTab}
                  artworks={artworks}
                  transactions={sellerTransactionsForUser}
                  announcements={announcements}
                  onAddAnnouncement={handleAddAnnouncement}
                  onShowToast={showToast}
                />
              )}

              {sellerTab === 'art_verification' && (
                <SellerArtVerificationView
                  artworks={artworks}
                  sellerName={authSession.name}
                  onShowToast={showToast}
                  onSubmitArtwork={handleSubmitSellerArtwork}
                  onActivateArtwork={handleActivateSellerArtwork}
                />
              )}

              {sellerTab === 'finance' && (
                <SellerFinanceView
                  transactions={sellerTransactionsForUser}
                  onShowToast={showToast}
                />
              )}

              {sellerTab === 'messages' && (
                <SellerMessagesView
                  sellerName={authSession.name}
                  conversations={sellerConversationsForUser}
                  orders={sellerOrdersForUser}
                  refundRequests={sellerRefundRequestsForUser}
                  activeConversationId={activeSellerConversationId}
                  onSelectConversation={setActiveSellerConversationId}
                  onMarkConversationRead={(conversationId) => handleMarkConversationRead(conversationId, 'seller')}
                  onSendMessage={handleSendChatMessage}
                  onRefundDecision={handleSellerRefundDecision}
                  onShowToast={showToast}
                />
              )}

              {sellerTab === 'artist_gallery' && (
                <SellerGalleryView
                  artworks={artworks}
                  artist={
                    artistsDirectory.find(
                      (artist) => artist.name.toLowerCase() === authSession?.name.toLowerCase()
                    ) ?? artistsDirectory[0]
                  }
                  sellerName={authSession?.name ?? ''}
                  onUpdateArtist={handleUpdateArtistProfile}
                  onUpdateArtwork={handleUpdateArtwork}
                  onSelectArtwork={(art) => setSelectedArtworkModal(art)}
                  onShowToast={showToast}
                />
              )}

              {sellerTab === 'voucher_generator' && (
                <SellerVoucherGeneratorView
                  vouchers={vouchers}
                  sellerName={authSession.name}
                  onCreateVoucher={handleCreateSellerVoucher}
                  onDeactivateVoucher={handleDeactivateSellerVoucher}
                  onShowToast={showToast}
                  mode="voucher"
                />
              )}

              {sellerTab === 'discount_code' && (
                <SellerVoucherGeneratorView
                  vouchers={vouchers}
                  sellerName={authSession.name}
                  onCreateVoucher={handleCreateSellerVoucher}
                  onDeactivateVoucher={handleDeactivateSellerVoucher}
                  onShowToast={showToast}
                  mode="discount"
                />
              )}

              {sellerTab === 'stock' && (
                <SellerStockView
                  artworks={sellerArtworksForUser}
                  sellerName={authSession.name}
                  onUpdateArtworkStock={handleUpdateArtworkStock}
                  onShowToast={showToast}
                  onNavigateToGallery={() => setSellerTab('artist_gallery')}
                />
              )}

              {sellerTab === 'certificate' && (
                <SellerCertificateView
                  artworks={artworks}
                  artistName={authSession.name}
                  onShowToast={showToast}
                />
              )}

              {sellerTab === 'authenticity_check' && (
                <ArtworkAuthenticityView
                  artworks={artworks}
                  orders={sellerOrdersForUser}
                  transactions={sellerTransactionsForUser}
                />
              )}

              {sellerTab === 'logs' && (
                <SellerLogsView
                  onShowToast={showToast}
                />
              )}
            </main>
          </div>
        </div>
      ) : (
        /* 3. MARKETPLACE & BUYER PROFILE Views */
        <div className="flex-1 flex flex-col">
          {/* Public Top Navbar */}
          <Navbar
            currentTab={marketplaceTab}
            onSelectTab={handleSelectMarketplaceTab}
            favoritesCount={favoritesCount}
            cartCount={cartCount}
            unreadMessagesCount={buyerConversationsForUser.filter((conversation) => conversation.unread).length}
            onOpenCart={() => handleSelectMarketplaceTab('cart')}
            isBuyerProfile={viewMode === 'buyer_profile'}
            userName={authSession.name}
            searchQuery={globalSearch}
            onSearchChange={setGlobalSearch}
            isAllCategoriesOpen={isAllCategoriesOpen}
            onToggleAllCategories={handleToggleAllCategories}
            onOpenAllCategories={handleOpenAllCategories}
            onCloseAllCategories={handleCloseAllCategories}
            onNavigateToBuyerTab={(tab) => {
              setSelectedArtistProfile(null);
              setViewMode('buyer_profile');
              setBuyerTab(tab);
            }}
            onSignOut={handleSignOut}
          />

          {/* Body Content */}
          <div className="flex-1">
            {viewMode === 'buyer_profile' ? (
              <BuyerProfileView
                currentTab={buyerTab}
                onSelectTab={setBuyerTab}
                orders={orders.filter((order) => (
                  !order.buyerEmail ||
                  (authSession?.role === 'buyer' &&
                    order.buyerEmail.toLowerCase() === authSession.email.toLowerCase())
                ))}
                userName={authSession.name}
                userEmail={authSession.email}
                addressData={buyerAddress}
                addresses={buyerAddresses}
                onUpdateAddresses={handleUpdateBuyerAddresses}
                onUpdateProfile={handleUpdateBuyerProfile}
                onChangePassword={handleChangeBuyerPassword}
                createdAt={authSession.createdAt}
                conversations={buyerConversationsForUser}
                initialConversationId={activeBuyerConversationId}
                onSendMessage={handleSendChatMessage}
                onMarkConversationRead={(conversationId) => handleMarkConversationRead(conversationId, 'buyer')}
                onMarkConversationUnread={handleMarkBuyerConversationUnread}
                onContactSeller={handleContactSeller}
                onRefundRequestMessage={handleRefundRequestMessage}
                onSignOut={handleSignOut}
                onShowToast={showToast}
              />
            ) : selectedArtworkModal ? (
              <ArtworkDetailModal
                artwork={selectedArtworkModal}
                artworks={artworks}
                onClose={() => setSelectedArtworkModal(null)}
                onAddToCart={handleAddToCart}
                onProceedToCheckout={handleProceedToCheckout}
                onToggleFavorite={handleToggleFavorite}
                onSelectArtwork={setSelectedArtworkModal}
              />
            ) : (
              <>
                {marketplaceTab === 'help' && (
                  <HelpSupportView
                    userName={authSession.name}
                    userEmail={authSession.email}
                    conversations={buyerConversationsForUser.filter((conversation) => conversation.isSupport)}
                    onStartSupportConversation={handleStartSupportConversation}
                    onSendMessage={handleSendChatMessage}
                    onMarkConversationRead={(conversationId) => handleMarkConversationRead(conversationId, 'buyer')}
                  />
                )}

                {marketplaceTab === 'home' && (
                  <HomeView
                    artworks={artworks}
                    homePromotions={homePromotions}
                    rankedArtists={rankedArtists}
                    onToggleFollowArtist={handleToggleFollowArtist}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToCart={handleAddToCart}
                    onNavigateToShop={() => setMarketplaceTab('shop')}
                    onNavigateToGallery={() => setMarketplaceTab('gallery')}
                    onNavigateToArtist={() => handleViewArtistProfile('Wang Yue')}
                    onSelectArtwork={(artwork) => setSelectedArtworkModal(artwork)}
                    isAllCategoriesOpen={isAllCategoriesOpen}
                    onToggleAllCategories={handleToggleAllCategories}
                    onOpenAllCategories={handleOpenAllCategories}
                    onCloseAllCategories={handleCloseAllCategories}
                  />
                )}

                {marketplaceTab === 'shop' && (
                  <ShopView
                    artworks={artworks}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToCart={handleAddToCart}
                    onSelectArtwork={(artwork) => setSelectedArtworkModal(artwork)}
                    onNavigateToBuyerTab={(tab) => {
                      setViewMode('buyer_profile');
                      setBuyerTab(tab);
                    }}
                    onNavigateToArtists={handleNavigateToArtistsDirectory}
                  />
                )}

                {marketplaceTab === 'cart' && (
                  <CartCheckoutView
                    items={directCheckoutItems ?? cartItems}
                    vouchers={vouchers}
                    startAtPayment={Boolean(directCheckoutItems)}
                    savedAddresses={[buyerAddress]}
                    onRemoveItem={directCheckoutItems
                      ? (id) => setDirectCheckoutItems((items) => items?.filter(
                        (item) => (item.lineId ?? item.artwork.id) !== id
                      ) ?? null)
                      : handleRemoveFromCart}
                    onUpdateQuantity={directCheckoutItems
                      ? (id, quantity) => setDirectCheckoutItems((items) => items?.map((item) => (
                        (item.lineId ?? item.artwork.id) === id
                          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.artwork.stock ?? quantity)) }
                          : item
                      )) ?? null)
                      : handleUpdateCartQuantity}
                    onContinueShopping={() => {
                      setDirectCheckoutItems(null);
                      handleSelectMarketplaceTab('shop');
                    }}
                    onPlaceOrder={handleCheckout}
                    onContactSeller={handleContactSeller}
                    onViewOrders={() => {
                      setDirectCheckoutItems(null);
                      setViewMode('buyer_profile');
                      setBuyerTab('orders');
                    }}
                    recommendations={artworks.filter((artwork) => (
                      artwork.status === 'approved' && !(directCheckoutItems ?? cartItems).some((item) => item.artwork.id === artwork.id)
                    )).slice(0, 4)}
                    onAddRecommendation={(artwork) => handleAddToCart(artwork)}
                    onSelectArtwork={setSelectedArtworkModal}
                  />
                )}

                {marketplaceTab === 'gallery' && (
                  <GalleryView
                    artworks={artworks}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectArtwork={(artwork) => setSelectedArtworkModal(artwork)}
                    onNavigateToArtist={(name) => handleViewArtistProfile(name)}
                  />
                )}

                {marketplaceTab === 'artists' && (
                  <ArtistsDirectoryView
                    artists={artistsDirectory}
                    initialArtType={directoryArtType}
                    onSelectArtist={(artist) => handleViewArtistProfile(artist)}
                    onToggleFollow={handleToggleFollowDirectoryArtist}
                  />
                )}

                {marketplaceTab === 'artist_profile' && (
                  <ArtistProfileView
                    artworks={artworks}
                    artist={selectedArtistProfile}
                    onBackToArtists={() => {
                      setSelectedArtistProfile(null);
                      setMarketplaceTab('artists');
                    }}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToCart={(artwork) => handleAddToCart(artwork)}
                    onSelectArtwork={(artwork) => setSelectedArtworkModal(artwork)}
                    onNavigateToBuyerMessages={() => {
                      setViewMode('buyer_profile');
                      setBuyerTab('messages');
                    }}
                  />
                )}

                {marketplaceTab === 'hearts' && (
                  <HeartsView
                    artworks={artworks}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectArtwork={(artwork) => setSelectedArtworkModal(artwork)}
                    onNavigateToGallery={() => setMarketplaceTab('gallery')}
                    onShare={() =>
                      showToast('Favorites Link Copied', 'Shareable curation link copied to clipboard.', 'success')
                    }
                  />
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <Footer
            variant={viewMode === 'buyer_profile' ? 'buyer' : 'cafa'}
            onNavigateToHelp={() => handleSelectMarketplaceTab('help')}
          />
        </div>
      )}

      {viewMode === 'admin_portal' && selectedArtworkModal && (
        <ArtworkDetailModal
          artwork={selectedArtworkModal}
          artworks={artworks}
          onClose={() => setSelectedArtworkModal(null)}
          onAddToCart={handleAddToCart}
          onProceedToCheckout={handleProceedToCheckout}
          onToggleFavorite={handleToggleFavorite}
          onSelectArtwork={setSelectedArtworkModal}
        />
      )}

      {/* Real-time Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
