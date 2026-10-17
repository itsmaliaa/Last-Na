/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
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
} from './types';
import {
  initialArtworks,
  initialRankedArtists,
  initialOrders,
  initialConversations,
  initialAdmins,
  initialStudents,
  initialCustomers,
  initialStrikes,
  initialAuditLogs,
  initialArtistsDirectory,
  initialSellerTransactions,
  initialVouchers,
  initialSellerAnnouncements,
} from './data/mockData';

// Public Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
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

// Buyer Views
import { BuyerProfileView } from './views/BuyerProfileView';

// Seller Views
import { SellerOrderView } from './views/seller/SellerOrderView';
import { SellerDashboardView } from './views/seller/SellerDashboardView';
import { SellerArtVerificationView } from './views/seller/SellerArtVerificationView';
import { SellerMarketingView } from './views/seller/SellerMarketingView';
import { SellerFinanceView } from './views/seller/SellerFinanceView';
import { SellerMessagesView } from './views/seller/SellerMessagesView';
import { SellerGalleryView } from './views/seller/SellerGalleryView';
import { SellerVoucherGeneratorView } from './views/seller/SellerVoucherGeneratorView';
import { SellerLogsView } from './views/seller/SellerLogsView';
import { SellerStockView } from './views/seller/SellerStockView';

// Admin Views
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminSalesView } from './views/admin/AdminSalesView';
import { AdminArtVerificationView } from './views/admin/AdminArtVerificationView';
import { AdminUsersAdminsView } from './views/admin/AdminUsersAdminsView';
import { AdminUsersStudentsView } from './views/admin/AdminUsersStudentsView';
import { AdminUsersCustomersView } from './views/admin/AdminUsersCustomersView';
import { AdminStrikesBansView } from './views/admin/AdminStrikesBansView';
import { AdminAuditLogsView } from './views/admin/AdminAuditLogsView';

export default function App() {
  // Navigation & View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>('marketplace');
  const [marketplaceTab, setMarketplaceTab] = useState<MarketplaceTab>('home');
  const [buyerTab, setBuyerTab] = useState<BuyerTab>('orders');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [sellerTab, setSellerTab] = useState<SellerTab>('order');

  // Core Data States
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  const [rankedArtists, setRankedArtists] = useState<RankedArtist[]>(initialRankedArtists);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
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
  const [sellerTransactions, setSellerTransactions] = useState<SellerOrderTransaction[]>(initialSellerTransactions);
  const [vouchers, setVouchers] = useState<VoucherItem[]>(initialVouchers);
  const [announcements, setAnnouncements] = useState<SellerAnnouncement[]>(initialSellerAnnouncements);
  const [sellerSearch, setSellerSearch] = useState('');

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

  // Cart State (Initialized with 2 items to match the badge 2 in the screenshots!)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { artwork: initialArtworks[6], quantity: 1 }, // Golden Hour Reflections
    { artwork: initialArtworks[3], quantity: 1 }, // Clay & Void Study
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
  const handleCheckout = () => {
    setIsCartOpen(false);
    // Add new order to orders list
    const newOrder: OrderItem = {
      id: `order-${Date.now()}`,
      orderNumber: `RN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      title: cartItems[0]?.artwork.title || 'CAFA Fine Art Acquisition',
      artist: cartItems[0]?.artwork.artist || 'CAFA Student Artist',
      medium: cartItems[0]?.artwork.category || 'Original Artwork',
      status: 'In transit',
      dateInfo: 'Est. 3-5 business days',
      price: cartItems.reduce((acc, c) => acc + c.artwork.price * c.quantity, 0),
      image: cartItems[0]?.artwork.image || '',
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    showToast(
      'Acquisition Confirmed!',
      'Your order has been recorded. 100% funds escrowed to student artist.',
      'success'
    );
    setViewMode('buyer_profile');
    setBuyerTab('orders');
  };

  // Verify Artwork (Admin)
  const handleVerifyArtwork = (id: string) => {
    setArtworks((prev) =>
      prev.map((art) => (art.id === id ? { ...art, status: 'approved' } : art))
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

  return (
    <div className="min-h-screen bg-[#FAF9F6]/40 flex flex-col antialiased selection:bg-red-500 selection:text-white">
      {/* 1. If in ADMIN PORTAL View */}
      {viewMode === 'admin_portal' ? (
        <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
          {/* Admin Header */}
          <AdminHeader
            searchQuery={adminSearch}
            onSearchChange={setAdminSearch}
            currentViewMode={viewMode}
            onChangeViewMode={setViewMode}
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

              {adminTab === 'art_verification' && (
                <AdminArtVerificationView
                  artworks={artworks}
                  onVerifyArtwork={handleVerifyArtwork}
                  onRejectArtwork={handleRejectArtwork}
                  onShowToast={showToast}
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
        <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
          {/* Seller Header */}
          <SellerHeader
            searchQuery={sellerSearch}
            onSearchChange={setSellerSearch}
            currentViewMode={viewMode}
            onChangeViewMode={setViewMode}
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
                  onShowToast={showToast}
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
            onOpenCart={() => setIsCartOpen(true)}
            currentViewMode={viewMode}
            onChangeViewMode={(mode) => {
              setSelectedArtistProfile(null);
              setViewMode(mode);
            }}
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
            onSignOut={() => {
              setViewMode('marketplace');
              setMarketplaceTab('home');
              showToast('Signed Out', 'You have safely signed out of Ana Reyes profile.', 'info');
            }}
          />

          {/* Body Content */}
          <div className="flex-1">
            {viewMode === 'buyer_profile' ? (
              <BuyerProfileView
                currentTab={buyerTab}
                onSelectTab={setBuyerTab}
                orders={orders}
                conversations={conversations}
                onSendMessage={handleSendChatMessage}
                onNavigateToHearts={() => {
                  setViewMode('marketplace');
                  setMarketplaceTab('hearts');
                }}
                onSignOut={() => {
                  setViewMode('marketplace');
                  setMarketplaceTab('home');
                  showToast('Signed Out', 'You have safely signed out of Ana Reyes profile.', 'info');
                }}
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

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

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
