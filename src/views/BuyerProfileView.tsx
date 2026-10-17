import React, { useState } from 'react';
import {
  Package,
  MapPin,
  MessageSquare,
  Shield,
  KeyRound,
  CreditCard,
  LogOut,
  Edit3,
  RotateCcw,
  CheckCircle2,
  Heart,
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
  PanelLeftOpen,
  PanelLeftClose,
  Smartphone,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { BuyerTab, OrderItem, Conversation } from '../types';

interface BuyerProfileViewProps {
  currentTab: BuyerTab;
  onSelectTab: (tab: BuyerTab) => void;
  orders: OrderItem[];
  conversations: Conversation[];
  onSendMessage: (conversationId: string, text: string) => void;
  onNavigateToHearts: () => void;
  onSignOut: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

export const BuyerProfileView: React.FC<BuyerProfileViewProps> = ({
  currentTab,
  onSelectTab,
  orders,
  conversations,
  onSendMessage,
  onNavigateToHearts,
  onSignOut,
  onShowToast,
}) => {
  const [isNavRetracted, setIsNavRetracted] = useState<boolean>(false);
  const [securityOpen, setSecurityOpen] = useState(true);
  const [orderFilter, setOrderFilter] = useState<'all' | 'in_progress' | 'returns' | 'completed'>('all');
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-2');
  const [chatInput, setChatInput] = useState<string>('');
  const [convListFilter, setConvListFilter] = useState<'all' | 'unread'>('all');
  const [convSearch, setConvSearch] = useState<string>('');
  const [showEditAddressModal, setShowEditAddressModal] = useState<boolean>(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);

  // Address state
  const [addressData, setAddressData] = useState({
    name: 'Ana R.',
    line1: 'Unit 402, J. P. Rizal St., Brgy. Diliman',
    city: 'Quezon City, Metro Manila 1101',
    phone: '+63 917 842 4821',
  });

  const selectedConversation =
    conversations.find((c) => c.id === selectedConvId) || conversations[1];

  const handleSendChatMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;
    onSendMessage(selectedConvId, text);
    setChatInput('');
    onShowToast('Message Sent', 'Your reply has been delivered to ' + selectedConversation.name, 'success');
  };

  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'in_progress') return order.status === 'In transit';
    if (orderFilter === 'returns') return order.status === 'Return eligible';
    if (orderFilter === 'completed') return order.status === 'Completed';
    return true;
  });

  const filteredConversations = conversations.filter((c) => {
    if (convListFilter === 'unread' && !c.unread) return false;
    if (convSearch && !c.name.toLowerCase().includes(convSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full bg-[#FAF9F6]/40 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-2.5 border-2 border-red-100 shadow-2xs bg-neutral-100">
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
                        alt="Ana Reyes"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">Ana Reyes</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Buyer since 2024</p>
                    <button
                      onClick={() => setShowEditProfileModal(true)}
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

                <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200 my-1">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
                    alt="Ana Reyes"
                    className="w-full h-full object-cover"
                  />
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
                    title="Messages (2 unread)"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
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
              <div className="space-y-6">
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Card 1: In transit */}
                  <div className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-xs space-y-2">
                    <div className="w-7 h-7 text-red-600">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">1</div>
                    <div className="text-xs text-neutral-500">In transit</div>
                    <button
                      onClick={() => setOrderFilter('in_progress')}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>Track order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 2: Return window */}
                  <div className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-xs space-y-2">
                    <div className="w-7 h-7 text-red-600">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">1</div>
                    <div className="text-xs text-neutral-500">Return window</div>
                    <button
                      onClick={() => setOrderFilter('returns')}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>Review return</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 3: Completed */}
                  <div className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-xs space-y-2">
                    <div className="w-7 h-7 text-red-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">12</div>
                    <div className="text-xs text-neutral-500">Completed</div>
                    <button
                      onClick={() => setOrderFilter('completed')}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>View history</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 4: Saved artworks */}
                  <div className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-xs space-y-2">
                    <div className="w-7 h-7 text-red-600">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">6</div>
                    <div className="text-xs text-neutral-500">Saved artworks</div>
                    <button
                      onClick={onNavigateToHearts}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>Open hearts</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Recent Orders Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
                  <h3 className="text-lg font-extrabold text-slate-900">Recent orders</h3>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-neutral-500 border-b border-neutral-100 pb-3">
                    <button
                      onClick={() => setOrderFilter('all')}
                      className={`cursor-pointer ${orderFilter === 'all' ? 'text-red-600 font-bold' : 'hover:text-slate-900'}`}
                    >
                      All orders
                    </button>
                    <button
                      onClick={() => setOrderFilter('in_progress')}
                      className={`cursor-pointer ${orderFilter === 'in_progress' ? 'text-red-600 font-bold' : 'hover:text-slate-900'}`}
                    >
                      In progress
                    </button>
                    <button
                      onClick={() => setOrderFilter('returns')}
                      className={`cursor-pointer ${orderFilter === 'returns' ? 'text-red-600 font-bold' : 'hover:text-slate-900'}`}
                    >
                      Returns
                    </button>
                    <button
                      onClick={() => setOrderFilter('completed')}
                      className={`cursor-pointer ${orderFilter === 'completed' ? 'text-red-600 font-bold' : 'hover:text-slate-900'}`}
                    >
                      Completed
                    </button>
                  </div>

                  {/* Orders List */}
                  <div className="divide-y divide-neutral-100 space-y-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={order.image}
                            alt={order.title}
                            className="w-16 h-16 rounded-2xl object-cover bg-neutral-100 shrink-0 shadow-xs"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-900">{order.title}</h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  order.status === 'In transit'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : order.status === 'Return eligible'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {order.artist} · {order.medium}
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {order.orderNumber} · {order.dateInfo}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900">
                            ₱{order.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ADDRESSES (Exact match to Buyer Profile address.png) */}
            {currentTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-slate-900">Saved addresses</h3>
                </div>

                <div className="p-6 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Default
                    </span>
                    <button
                      onClick={() => setShowEditAddressModal(true)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      Edit address
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{addressData.name}</h4>
                    <p className="text-xs text-neutral-600 mt-1">{addressData.line1}</p>
                    <p className="text-xs text-neutral-600">{addressData.city}</p>
                    <p className="text-xs text-neutral-600 mt-1">{addressData.phone}</p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setShowEditAddressModal(true)}
                      className="px-5 py-2 rounded-full border border-neutral-800 text-slate-900 text-xs font-bold hover:bg-neutral-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Manage addresses</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MESSAGES (Exact match to profile Messaages.png) */}
            {currentTab === 'messages' && (
              <div className="space-y-4">
                {/* Quick filter pills from screenshot: All, Unread (1), Donation, Discerner */}
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
                    Unread (1)
                  </button>
                  <button className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-neutral-200 text-neutral-600">
                    Donation
                  </button>
                  <button className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-neutral-200 text-neutral-600">
                    Discerner
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

                    <div className="flex items-center gap-2 mb-2 text-[11px] font-bold">
                      <span className="bg-slate-900 text-white px-2 py-0.5 rounded-full">All</span>
                      <span className="text-neutral-500">Unread (1)</span>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 space-y-1">
                      {filteredConversations.map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => setSelectedConvId(conv.id)}
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
                            {selectedConversation.name}
                          </h4>
                          <p className="text-[11px] text-neutral-400">
                            {selectedConversation.email} · Yesterday at 3:45 PM
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <button
                          onClick={() => onShowToast('Email copied', selectedConversation.email, 'info')}
                          className="flex items-center gap-1 hover:text-slate-800 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => onShowToast('Marked unread', '', 'info')}
                          className="flex items-center gap-1 hover:text-slate-800 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Unread</span>
                        </button>
                      </div>
                    </div>

                    {/* SUBJECT Banner (from screenshot: SUBJECT: Loss Item) */}
                    <div className="px-6 py-2 bg-amber-50/80 border-b border-amber-200/60 text-xs font-bold text-amber-900 flex items-center gap-2">
                      <span className="uppercase text-[10px] text-amber-700 tracking-wider">
                        Subject:
                      </span>
                      <span>{selectedConversation.subject}</span>
                    </div>

                    {/* Chat Messages Stream */}
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                      <div className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400 my-2">
                        CONVERSATION STARTED · YESTERDAY AT 3:45 PM
                      </div>

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
                            <p>{msg.text}</p>
                          </div>
                          <span className="text-[10px] text-neutral-400 mt-1 px-1">
                            {msg.time}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Quick suggestion reply pills (Apologies, wow thats nice) */}
                    <div className="px-6 pt-2 flex items-center gap-2">
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
                    </div>

                    {/* Message Input Bar */}
                    <div className="p-4 border-t border-neutral-100 flex items-center gap-2">
                      <button
                        onClick={() => onShowToast('Attachment', 'Select image or PDF proof', 'info')}
                        className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        placeholder={`Reply to ${selectedConversation.name}... (Press Enter to send)`}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendChatMessage();
                        }}
                        className="flex-1 py-2 px-4 text-xs bg-neutral-100 rounded-full border border-transparent focus:bg-white focus:border-red-400 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSendChatMessage()}
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
                  <p className="text-xs text-neutral-500 mt-1">Manage your account authentication, trusted sessions, and privacy preferences.</p>
                </div>

                {/* 2FA Card */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E52535] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Two-Factor Authentication (2FA)</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Secure your artwork purchases with SMS & Authenticator App verification.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                    Active
                  </span>
                </div>

                {/* Active Sessions */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider text-neutral-400">Active Login Sessions</h4>
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-slate-700 font-mono text-sm">
                          💻
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Chrome on macOS (Current)</div>
                          <div className="text-[11px] text-neutral-500">Quezon City, Philippines · IP 112.198.xxx.xx</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Online</span>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-slate-700">
                          <Smartphone className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Safari on iPhone 15 Pro</div>
                          <div className="text-[11px] text-neutral-500">Quezon City, Philippines · Active 2 hours ago</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onShowToast('Session revoked', 'Device has been logged out.', 'info')}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>

                {/* Privacy Preferences */}
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider text-neutral-400">Privacy Controls</h4>
                  <div className="space-y-2.5 text-xs">
                    <label className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                      <div>
                        <div className="font-bold text-slate-900">Display collection on student patron directory</div>
                        <div className="text-[11px] text-neutral-500">Allow artists to view your art collection history</div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-red-600" />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                      <div>
                        <div className="font-bold text-slate-900">CAFA Fine Arts Spring Exhibition invitations</div>
                        <div className="text-[11px] text-neutral-500">Receive priority collector early access notifications</div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-red-600" />
                    </label>
                  </div>
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
                      placeholder="••••••••••••"
                      className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="At least 8 characters"
                      className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <button
                    onClick={() => onShowToast('Password updated', 'Your account credentials have been secured.', 'success')}
                    className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Update Password
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
                      <CreditCard className="w-6 h-6 text-slate-700" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">Mastercard ending in 4242</h4>
                        <p className="text-[11px] text-neutral-500">Expires 12/28 · Default</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      Verified
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">
                        G
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">GCash E-Wallet</h4>
                        <p className="text-[11px] text-neutral-500">+63 917 *** 4821</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                      Linked
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
            <h3 className="text-base font-extrabold text-slate-900">Edit Delivery Address</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={addressData.name}
                  onChange={(e) => setAddressData({ ...addressData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Address Line</label>
                <input
                  type="text"
                  value={addressData.line1}
                  onChange={(e) => setAddressData({ ...addressData, line1: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">City & Postal</label>
                <input
                  type="text"
                  value={addressData.city}
                  onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={addressData.phone}
                  onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEditAddressModal(false)}
                className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditAddressModal(false);
                  onShowToast('Address updated', 'Your default shipping address was saved.', 'success');
                }}
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
                  defaultValue="Ana Reyes"
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="ana.reyes@lifestyle.ph"
                  className="w-full p-2.5 rounded-xl border border-neutral-200"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditProfileModal(false);
                  onShowToast('Profile saved', 'Your profile details have been updated.', 'success');
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
