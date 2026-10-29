/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { LocalAuthSession, updateLocalBuyerAddress } from './auth/localAuth';
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
} from './types';
import {
  initialArtworks,
  initialRankedArtists,
  initialConversations,
  initialAdmins,
  initialStudents,
  initialCustomers,
  initialStrikes,
  initialAuditLogs,
  initialArtistsDirectory,
  initialVouchers,
  initialSellerAnnouncements,
} from './data/mockData';
import { loadOrderData, saveOrderData } from './data/orderStorage';

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

// Buyer Views
import { BuyerProfileView } from './views/BuyerProfileView';

// Seller Views
import { SellerOrderView } from './views/seller/SellerOrderView';
import { SellerFulfillmentView } from './views/seller/SellerFulfillmentView';
import { SellerDashboardView } from './views/seller/SellerDashboardView';
import { SellerArtVerificationView } from './views/seller/SellerArtVerificationView';
import { SellerMarketingView } from './views/seller/SellerMarketingView';
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
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [sellerTab, setSellerTab] = useState<SellerTab>('order');

  // Core Data States
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  const [rankedArtists, setRankedArtists] = useState<RankedArtist[]>(initialRankedArtists);
  const [orderData, setOrderData] = useState(loadOrderData);
  const { orders, sellerTransactions } = orderData;
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [students, setStudents] = useState<StudentUser[]>(initialStudents);
  const [customers, setCustomers] = useState<CustomerUser[]>(initialCustomers);
  const [strikes, setStrikes] = useState<StrikeUser[]>(initialStrikes);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [artistsDirectory, setArtistsDirectory] = useState<ArtistDirectoryItem[]>(initialArtistsDirectory);
  const [selectedArtistProfile, setSelectedArtistProfile] = useState<ArtistDirectoryItem | null>(null);
  const [directoryArtType, setDirectoryArtType] = useState<string>('All');
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState<boolean>(false);
  // Seller Portal State
  const [vouchers, setVouchers] = useState<VoucherItem[]>(initialVouchers);
  const [announcements, setAnnouncements] = useState<SellerAnnouncement[]>(initialSellerAnnouncements);
  const [sellerSearch, setSellerSearch] = useState('');

  useEffect(() => {
    saveOrderData(orderData);
  }, [orderData]);

  const handleAddAnnouncement = (newAnn: SellerAnnouncement) => {
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    showToast('Announcement Removed', 'The announcement was removed from your profile.', 'info');
  };

  const handleUpdateArtworkStock = (artworkId: string, newStock: number) => {
    setArtworks((prev) =>
      prev.map((art) => (art.id === artworkId ? { ...art, stock: newStock } : art))
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

  // Cart State (Initialized with 2 items to match the badge 2 in the screenshots!)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { artwork: initialArtworks[6], quantity: 1 }, // Golden Hour Reflections
    { artwork: initialArtworks[3], quantity: 1 }, // Clay & Void Study
  ]);
  // Modals & Details
  const [selectedArtworkModal, setSelectedArtworkModal] = useState<Artwork | null>(null);

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [adminSearch, setAdminSearch] = useState('');

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
  const handleAddToCart = (artwork: Artwork) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.artwork.id === artwork.id);
      if (exists) {
        showToast('Cart Updated', `Increased quantity of ${artwork.title}`, 'info');
        return prev.map((item) =>
          item.artwork.id === artwork.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      showToast('Added to Acquisition Cart', artwork.title, 'success');
      return [...prev, { artwork, quantity: 1 }];
    });
  };

  // Remove from Cart
  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.artwork.id !== id));
    showToast('Item Removed', 'The artwork was removed from your cart.', 'info');
  };

  // Checkout
  const handleCheckout = (details: CheckoutDetails) => {
    if (cartItems.length === 0) return;

    const timestamp = Date.now();
    const orderNumber = `RN-${timestamp.toString().slice(-8)}`;
    const orderIds = cartItems.map((_, index) => `order-${timestamp}-${index}`);
    const deliveryAddress = details.deliveryMethod === 'door_to_door'
      ? `${details.recipientName} · ${details.phone} · ${details.deliveryAddress}`
      : `${details.recipientName} · ${details.phone} · CAFA Main Campus Pickup Desk`;
    const newOrders: OrderItem[] = cartItems.map(({ artwork, quantity }, index) => ({
      id: orderIds[index],
      orderNumber,
      title: artwork.title,
      artist: artwork.artist,
      buyerEmail: authSession?.email,
      medium: artwork.mediumsUsed?.split(',')[0] || artwork.category,
      status: 'Processing',
      dateInfo: 'Awaiting seller confirmation',
      price: artwork.price * quantity,
      image: artwork.image,
      deliveryMethod: details.deliveryMethod,
      paymentMethod: details.paymentMethod,
      deliveryAddress,
    }));
    const newTransactions: SellerOrderTransaction[] = cartItems.map(({ artwork, quantity }, index) => ({
      id: orderIds[index],
      orderNumber,
      artwork: artwork.title,
      artist: artwork.artist,
      buyer: details.recipientName,
      buyerEmail: authSession?.email,
      date: new Date(timestamp).toLocaleDateString(),
      grossAmount: artwork.price * quantity,
      platformTakeRate: 0,
      platformTakeAmount: 0,
      netStudentPayout: artwork.price * quantity,
      status: 'Pending',
      escrowStatus: 'Awaiting payment',
      fulfillmentStatus: 'Processing',
      deliveryMethod: details.deliveryMethod,
      paymentMethod: details.paymentMethod,
      deliveryAddress,
    }));

    setOrderData((previous) => ({
      orders: [...newOrders, ...previous.orders],
      sellerTransactions: [...newTransactions, ...previous.sellerTransactions],
    }));
    setCartItems([]);
    showToast(
      'Order request received',
      'The seller will confirm any delivery fee and coordinate payment and delivery updates with you.',
      'success'
    );
    setViewMode('buyer_profile');
    setBuyerTab('orders');
  };

  const handleUpdateShipping = (
    id: string,
    fulfillmentStatus: ManualFulfillmentStatus,
    shipment?: ShipmentDetails
  ) => {
    setOrderData((previous) => ({
      sellerTransactions: previous.sellerTransactions.map((transaction) => (
        transaction.id === id
          ? {
              ...transaction,
              fulfillmentStatus,
              status: fulfillmentStatus === 'Shipped' ? 'Shipped' : 'Pending',
              ...(shipment ?? {}),
            }
          : transaction
      )),
      orders: previous.orders.map((order) => (
        order.id === id
          ? {
              ...order,
              status: fulfillmentStatus === 'Shipped' ? 'In transit' : 'Ready for pickup',
              ...(shipment ?? {}),
              dateInfo: fulfillmentStatus === 'Shipped' ? 'Shipped by seller' : 'Ready for campus pickup',
            }
          : order
      )),
    }));
    showToast(
      fulfillmentStatus === 'Shipped' ? 'Shipping details saved' : 'Order ready for pickup',
      fulfillmentStatus === 'Shipped'
        ? 'The buyer can now see the parcel dimensions, weight, and carrier tracking link.'
        : 'The buyer can now see that their order is ready at the campus pickup desk.',
      'success'
    );
  };

  const handleMarkOnTheWay = (id: string, shipment: ShipmentDetails) => {
    setOrderData((previous) => ({
      sellerTransactions: previous.sellerTransactions.map((transaction) => (
        transaction.id === id
          ? { ...transaction, ...shipment, fulfillmentStatus: 'On the way' }
          : transaction
      )),
      orders: previous.orders.map((order) => (
        order.id === id ? { ...order, ...shipment } : order
      )),
    }));
    showToast('Order is on the way', 'Tracking and rider details have been saved.', 'success');
  };

  const handleCompleteDelivery = (id: string, details: DeliveryCompletionDetails) => {
    const completedAt = new Date().toISOString();
    setOrderData((previous) => ({
      sellerTransactions: previous.sellerTransactions.map((transaction) => (
        transaction.id === id
          ? { ...transaction, status: 'Completed', fulfillmentStatus: 'Delivered', ...details, completedAt }
          : transaction
      )),
      orders: previous.orders.map((order) => (
        order.id === id
          ? { ...order, status: 'Completed', ...details, completedAt, dateInfo: 'Delivered and confirmed by seller' }
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
      prev.map((art) => (art.id === id ? { ...art, status: 'approved', isActive: false } : art))
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
      id: `art-${Date.now()}`,
      title: newArtwork.title ?? '',
      artist: authSession?.name ?? '',
      image: newArtwork.image ?? '',
      price: newArtwork.price ?? 0,
      size: newArtwork.size ?? '',
      status: 'pending',
      category: newArtwork.category ?? 'painting',
      description: newArtwork.description,
      mediumsUsed: newArtwork.mediumsUsed,
      isActive: false,
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
  const handleRejectArtwork = (id: string) => {
    setArtworks((prev) =>
      prev.map((art) => (art.id === id ? { ...art, status: 'rejected' } : art))
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

  // Approve Student (Admin)
  const handleApproveStudent = (id: string) => {
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
      information: `Student accreditation approved for ID ${id}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Reject Student (Admin)
  const handleRejectStudent = (id: string) => {
    setStudents((prev) =>
      prev.map((stu) => (stu.id === id ? { ...stu, status: 'Rejected' } : stu))
    );
  };

  // Add Strike (Admin)
  const handleAddStrike = (id: string) => {
    setStrikes((prev) =>
      prev.map((st) => {
        if (st.id === id) {
          const newStrikes = Math.min(3, st.strikes + 1);
          const newStatus = newStrikes >= 3 ? 'Banned' : st.status;
          return { ...st, strikes: newStrikes, status: newStatus };
        }
        return st;
      })
    );
  };

  // Clear Strikes (Admin)
  const handleClearStrikes = (id: string) => {
    setStrikes((prev) =>
      prev.map((st) => (st.id === id ? { ...st, strikes: 0 } : st))
    );
  };

  // Toggle Ban (Admin)
  const handleToggleBan = (id: string) => {
    setStrikes((prev) =>
      prev.map((st) => {
        if (st.id === id) {
          const newStatus = st.status === 'Active' ? 'Banned' : 'Active';
          return { ...st, status: newStatus };
        }
        return st;
      })
    );
  };

  // Send Buyer Chat Message
  const handleSendChatMessage = (conversationId: string, text: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const newMsg = {
            id: `msg-${Date.now()}`,
            sender: 'seller' as const,
            text,
            time: 'Just now',
          };
          return {
            ...conv,
            lastMessage: `You: ${text}`,
            time: 'Just now',
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );
  };

  // Counts
  const favoritesCount = artworks.filter((a) => a.isFavorited).length;
  const cartCount = cartItems.reduce((acc, c) => acc + c.quantity, 0);
  const pendingArtsCount = artworks.filter((a) => a.status === 'pending').length;
  const pendingStudentsCount = students.filter((s) => s.status === 'Pending').length;
  const verificationParams = new URLSearchParams(window.location.search);
  const verificationArtworkId = verificationParams.get('verify');

  const handleAuthenticated = (session: LocalAuthSession) => {
    setAuthSession(session);
    setViewMode(
      session.role === 'seller'
        ? 'seller_portal'
        : session.role === 'admin'
        ? 'admin_portal'
        : 'marketplace'
    );
    if (session.role === 'buyer') {
      setBuyerAddress(session.address
        ? { ...session.address }
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

  const handleUpdateBuyerAddress = (address: BuyerAddress) => {
    if (!authSession || authSession.role !== 'buyer') {
      showToast('Address not saved', 'Only a signed-in buyer can update a saved address.', 'error');
      return;
    }

    try {
      updateLocalBuyerAddress(authSession.email, address);
      setBuyerAddress(address);
      showToast('Address saved', 'Your saved delivery address is ready for checkout.', 'success');
    } catch (error) {
      showToast(
        'Address not saved',
        error instanceof Error ? error.message : 'Unable to save the address in this browser.',
        'error'
      );
    }
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
        certificateNumber={verificationParams.get('certificate') ?? ''}
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
            searchQuery={adminSearch}
            onSearchChange={setAdminSearch}
            userName={authSession.name}
            onSignOut={handleSignOut}
          />

          <div className="flex flex-1">
            {/* Admin Burgundy Sidebar */}
            <AdminSidebar
              currentTab={adminTab}
              onSelectTab={setAdminTab}
              pendingArtsCount={pendingArtsCount}
              pendingStudentsCount={pendingStudentsCount}
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
                  onExport={() =>
                    showToast('Ledger Exported', 'Complete student payouts ledger downloaded.', 'success')
                  }
                  onShowToast={showToast}
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
                  onShowToast={showToast}
                />
              )}

              {adminTab === 'student_verification_pending' && (
                <AdminUsersStudentsView
                  students={students}
                  filterStatus="Pending"
                  onApproveStudent={handleApproveStudent}
                  onRejectStudent={handleRejectStudent}
                  onShowToast={showToast}
                />
              )}

              {adminTab === 'student_verification_verified' && (
                <AdminUsersStudentsView
                  students={students}
                  filterStatus="Verified"
                  onApproveStudent={handleApproveStudent}
                  onRejectStudent={handleRejectStudent}
                  onShowToast={showToast}
                />
              )}

              {adminTab === 'users_customers' && (
                <AdminUsersCustomersView
                  customers={customers}
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
            searchQuery={sellerSearch}
            onSearchChange={setSellerSearch}
            userName={authSession.name}
            onSignOut={handleSignOut}
            onOpenSettings={() => setSellerTab('finance')}
          />

          {/* Seller Layout: Curved Burgundy Sidebar & Routed Views */}
          <div className="flex flex-1">
            <SellerSidebar
              currentTab={sellerTab}
              onSelectTab={setSellerTab}
              unreadMessagesCount={1}
              pendingVerificationCount={1}
            />

            {/* Seller Main Content */}
            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full min-w-0">
              {sellerTab === 'order' && (
                <SellerOrderView
                  transactions={sellerTransactions}
                  onShowToast={showToast}
                  onNavigateTab={setSellerTab}
                  onCompleteDelivery={handleCompleteDelivery}
                  onMarkOnTheWay={handleMarkOnTheWay}
                />
              )}

              {sellerTab === 'shipping_fulfillment' && (
                <SellerFulfillmentView
                  transactions={sellerTransactions}
                  onBackToOrders={() => setSellerTab('order')}
                  onUpdateShipping={handleUpdateShipping}
                />
              )}

              {sellerTab === 'dashboard' && (
                <SellerDashboardView
                  onNavigateTab={setSellerTab}
                  artworks={artworks}
                  transactions={sellerTransactions}
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

              {(sellerTab === 'marketing' || sellerTab === 'promotions') && (
                <SellerMarketingView
                  announcements={announcements}
                  onAddAnnouncement={handleAddAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  onShowToast={showToast}
                />
              )}

              {sellerTab === 'finance' && (
                <SellerFinanceView
                  transactions={sellerTransactions}
                  onShowToast={showToast}
                />
              )}

              {sellerTab === 'messages' && (
                <SellerMessagesView
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
                  onNavigateToVerification={() => setSellerTab('art_verification')}
                />
              )}

              {sellerTab === 'voucher_generator' && (
                <SellerVoucherGeneratorView
                  initialVouchers={vouchers}
                  onShowToast={showToast}
                  mode="voucher"
                />
              )}

              {sellerTab === 'discount_code' && (
                <SellerVoucherGeneratorView
                  initialVouchers={vouchers}
                  onShowToast={showToast}
                  mode="discount"
                />
              )}

              {sellerTab === 'stock' && (
                <SellerStockView
                  artworks={artworks}
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
                  orders={orders}
                  transactions={sellerTransactions}
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
                addressData={buyerAddress}
                onUpdateAddress={handleUpdateBuyerAddress}
                conversations={conversations}
                onSendMessage={handleSendChatMessage}
                onNavigateToHearts={() => {
                  setViewMode('marketplace');
                  setMarketplaceTab('hearts');
                }}
                onSignOut={handleSignOut}
                onShowToast={showToast}
              />
            ) : (
              <>
                {marketplaceTab === 'home' && (
                  <HomeView
                    artworks={artworks}
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
                    items={cartItems}
                    savedAddresses={[buyerAddress]}
                    onRemoveItem={handleRemoveFromCart}
                    onContinueShopping={() => handleSelectMarketplaceTab('shop')}
                    onPlaceOrder={handleCheckout}
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
          <Footer variant={viewMode === 'buyer_profile' ? 'buyer' : 'cafa'} />
        </div>
      )}

      {/* Artwork Detail Modal */}
      <ArtworkDetailModal
        artwork={selectedArtworkModal}
        onClose={() => setSelectedArtworkModal(null)}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Real-time Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
