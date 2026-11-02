import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Image as ImageIcon, MessageSquare, Send, Star } from 'lucide-react';
import {
  ArtworkReview,
  ChatMessage,
  Conversation,
  OrderItem,
  RefundRequest,
  RefundRequestStatus,
} from '../../types';
import { loadArtworkReviews, saveArtworkReviewReply } from '../../data/artworkReviewStorage';

type CustomerServiceFilter = 'all' | 'messages' | 'refunds' | 'reviews' | 'custom_digital';

interface CustomerServiceThread {
  id: string;
  kind: 'message' | 'refund' | 'custom_digital' | 'review';
  conversation?: Conversation;
  review?: ArtworkReview;
  buyerName: string;
  artworkTitle: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: ChatMessage[];
}

interface SellerMessagesViewProps {
  sellerName: string;
  conversations: Conversation[];
  orders: OrderItem[];
  refundRequests: RefundRequest[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onMarkConversationRead: (conversationId: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onRefundDecision: (requestId: string, status: Extract<RefundRequestStatus, 'approved' | 'declined'>) => void;
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
}

export const SellerMessagesView: React.FC<SellerMessagesViewProps> = ({
  sellerName,
  conversations,
  orders,
  refundRequests,
  activeConversationId,
  onSelectConversation,
  onMarkConversationRead,
  onSendMessage,
  onRefundDecision,
  onShowToast,
}) => {
  const [selectedThreadId, setSelectedThreadId] = useState(activeConversationId ?? '');
  const [inputText, setInputText] = useState('');
  const [reviewReplyText, setReviewReplyText] = useState('');
  const [filter, setFilter] = useState<CustomerServiceFilter>('all');
  const [reviews, setReviews] = useState<ArtworkReview[]>([]);

  useEffect(() => {
    setSelectedThreadId(activeConversationId ?? '');
  }, [activeConversationId]);

  useEffect(() => {
    const loadSellerReviews = () => {
      try {
        setReviews(loadArtworkReviews().filter((review) => (
          review.artist.toLowerCase() === sellerName.toLowerCase()
        )));
      } catch (error) {
        console.error('Unable to load customer reviews for seller service.', error);
        onShowToast(
          'Customer reviews could not be loaded',
          error instanceof Error ? error.message : 'Saved customer reviews are unreadable.',
          'error'
        );
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage && event.key === 'red-nexus-artwork-reviews') {
        loadSellerReviews();
      }
    };

    loadSellerReviews();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [sellerName]);

  const threads = useMemo<CustomerServiceThread[]>(() => {
    const conversationThreads = conversations.map((conversation): CustomerServiceThread => {
      const isRefund = conversation.messages.some((message) => message.refundRequestId);
      const isCustomDigital = Boolean(conversation.orderId);
      const linkedRefundRequest = conversation.messages
        .map((message) => message.refundRequestId
          ? refundRequests.find((request) => request.id === message.refundRequestId)
          : undefined)
        .find((request): request is RefundRequest => Boolean(request));
      return {
        id: conversation.id,
        kind: isRefund ? 'refund' : isCustomDigital ? 'custom_digital' : 'message',
        conversation,
        buyerName: conversation.buyerName || linkedRefundRequest?.buyerName || conversation.name,
        artworkTitle: conversation.subject,
        lastMessage: conversation.lastMessage,
        time: conversation.time,
        unread: conversation.unread,
        messages: conversation.messages,
      };
    });

    const reviewThreads = reviews.map((review): CustomerServiceThread => ({
      id: `review-${review.orderId}`,
      kind: 'review',
      review,
      buyerName: review.buyerName,
      artworkTitle: review.artworkTitle,
      lastMessage: `Customer review · ${review.rating}/5 · ${review.text}`,
      time: new Date(review.createdAt).toLocaleDateString(),
      unread: false,
      messages: [{
        id: `review-message-${review.orderId}`,
        sender: 'buyer',
        text: review.text,
        time: new Date(review.createdAt).toLocaleDateString(),
      }],
    }));

    const orderMessageThreads = orders
      .filter((order) => (
        (order.productType === 'custom_made' || order.productType === 'digital') &&
        order.buyerNote &&
        !conversations.some((conversation) => conversation.orderId === order.id)
      ))
      .map((order): CustomerServiceThread => {
        const buyerName = order.buyerEmail || 'Buyer';
        const text = [
          `${order.productType === 'custom_made' ? 'Custom-made order message' : 'Digital order message'}`,
          `Order: ${order.orderNumber} · ${order.title}`,
          order.buyerNote,
        ].join('\n');
        return {
          id: `order-${order.id}`,
          kind: 'custom_digital',
          buyerName,
          artworkTitle: `${order.productType === 'custom_made' ? 'Custom-made' : 'Digital'} · ${order.title}`,
          lastMessage: text,
          time: order.dateInfo,
          unread: true,
          messages: [{
            id: `order-note-${order.id}`,
            sender: 'buyer',
            text,
            time: order.dateInfo,
          }],
        };
      });

    return [...conversationThreads, ...orderMessageThreads, ...reviewThreads]
      .sort((first, second) => Number(second.unread) - Number(first.unread));
  }, [conversations, orders, refundRequests, reviews]);

  const visibleThreads = threads.filter((thread) => {
    if (filter === 'messages') return thread.kind === 'message';
    if (filter === 'refunds') return thread.kind === 'refund';
    if (filter === 'reviews') return thread.kind === 'review';
    if (filter === 'custom_digital') return thread.kind === 'custom_digital';
    return true;
  });
  const activeThread = visibleThreads.find((thread) => thread.id === selectedThreadId) ?? visibleThreads[0];
  const activeRefundRequest = activeThread?.messages
    .map((message) => message.refundRequestId
      ? refundRequests.find((request) => request.id === message.refundRequestId)
      : undefined)
    .find((request): request is RefundRequest => Boolean(request));

  useEffect(() => {
    if (activeThread?.conversation?.unread) {
      onMarkConversationRead(activeThread.conversation.id);
    }
  }, [activeThread?.conversation?.id, activeThread?.conversation?.unread]);

  const handleSelectThread = (thread: CustomerServiceThread) => {
    setSelectedThreadId(thread.id);
    setInputText('');
    setReviewReplyText(thread.review?.sellerReply ?? '');
    if (thread.conversation) {
      onSelectConversation(thread.conversation.id);
      if (thread.conversation.unread) onMarkConversationRead(thread.conversation.id);
    }
  };

  const handleSendReviewReply = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeThread?.review || !reviewReplyText.trim()) return;
    try {
      const updatedReview = saveArtworkReviewReply(activeThread.review.orderId, reviewReplyText.trim());
      setReviews((previous) => previous.map((review) => (
        review.orderId === updatedReview.orderId ? updatedReview : review
      )));
      setReviewReplyText(updatedReview.sellerReply ?? '');
      onShowToast('Review reply saved', 'Your reply is now visible with the customer review.', 'success');
    } catch (error) {
      onShowToast(
        'Review reply could not be saved',
        error instanceof Error ? error.message : 'Unable to save this reply.',
        'error'
      );
    }
  };

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeThread?.conversation || !inputText.trim()) return;
    onSendMessage(activeThread.conversation.id, inputText.trim());
    setInputText('');
    onShowToast('Message sent', `Sent to ${activeThread.buyerName}.`, 'success');
  };

  const filterOptions: { id: CustomerServiceFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'messages', label: 'Messages' },
    { id: 'refunds', label: 'Refund requests' },
    { id: 'custom_digital', label: 'Custom & digital' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="flex h-[min(760px,calc(100vh-180px))] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs md:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-neutral-200 md:w-80 md:border-b-0 md:border-r">
        <div className="border-b border-neutral-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-red-600" />
              <h2 className="text-sm font-bold text-slate-900">Customer Service</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-neutral-400">{threads.length} items</span>
              <button
                type="button"
                aria-pressed={filter === 'reviews'}
                onClick={() => {
                  setFilter('reviews');
                  setSelectedThreadId('');
                }}
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                  filter === 'reviews'
                    ? 'bg-slate-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Reviews
              </button>
            </div>
          </div>
          <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
            {filterOptions.filter((option) => option.id !== 'reviews').map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
                className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-bold ${
                  filter === option.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 divide-y divide-neutral-100 overflow-y-auto">
          {visibleThreads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => handleSelectThread(thread)}
              className={`flex w-full items-start gap-3 p-4 text-left transition-colors ${
                activeThread?.id === thread.id ? 'bg-neutral-100' : 'hover:bg-neutral-50'
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-slate-700">
                {thread.kind === 'review' ? <Star className="h-4 w-4 fill-amber-400 text-amber-500" /> : thread.buyerName.charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold text-slate-900">{thread.buyerName}</span>
                  <span className="shrink-0 text-[10px] text-neutral-400">{thread.time}</span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] font-medium text-red-600">{thread.artworkTitle}</span>
                <span className="mt-0.5 block truncate text-[11px] text-neutral-500">{thread.lastMessage}</span>
                <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  thread.kind === 'refund'
                    ? 'bg-amber-100 text-amber-900'
                    : thread.kind === 'review'
                      ? 'bg-violet-100 text-violet-800'
                      : thread.kind === 'custom_digital'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {thread.kind === 'refund'
                    ? 'Refund request'
                    : thread.kind === 'review'
                      ? 'Customer review'
                      : thread.kind === 'custom_digital'
                        ? 'Custom / digital order'
                        : thread.unread ? 'Unread message' : 'Message'}
                </span>
              </span>
              {thread.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />}
            </button>
          ))}
          {visibleThreads.length === 0 && (
            <p className="p-6 text-center text-sm text-neutral-500">No customer service items in this filter.</p>
          )}
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        {activeThread ? (
          <>
            <header className="flex items-center justify-between gap-4 border-b border-neutral-100 p-4">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-900">{activeThread.buyerName}</h3>
                <p className="truncate text-xs text-neutral-500">
                  {activeThread.review ? 'Customer review' : 'Subject: '}
                  <span className="font-medium text-red-600">{activeThread.artworkTitle}</span>
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                Customer Service
              </span>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[#FAF9F6]/40 p-4 text-xs sm:p-6">
              {activeThread.review && (
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                  <p className="font-bold text-slate-900">Customer review · {activeThread.review.rating}/5</p>
                  <p className="mt-1 text-neutral-600">
                    Order: {activeThread.review.orderId}
                  </p>
                </div>
              )}
              {activeThread.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.sender === 'seller' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-2xl whitespace-pre-line rounded-2xl px-4 py-3 leading-relaxed ${
                    message.sender === 'seller'
                      ? 'rounded-br-sm bg-[#8E1B24] text-white'
                      : 'rounded-bl-sm border border-neutral-200/80 bg-white text-slate-800 shadow-2xs'
                  }`}>
                    {message.text}
                  </div>
                  <span className="mt-1 px-1 text-[10px] text-neutral-400">{message.time}</span>
                </div>
              ))}
              {activeThread.review?.sellerReply && (
                <div className="ml-auto w-full max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-red-700">Seller reply</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                    {activeThread.review.sellerReply}
                  </p>
                  {activeThread.review.sellerReplyAt && (
                    <time className="mt-2 block text-[10px] text-neutral-500" dateTime={activeThread.review.sellerReplyAt}>
                      {new Date(activeThread.review.sellerReplyAt).toLocaleString()}
                    </time>
                  )}
                </div>
              )}

              {activeRefundRequest && (
                <div className="ml-auto w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-700" />
                    <h4 className="font-bold text-slate-900">Refund request · {activeRefundRequest.status}</h4>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{activeRefundRequest.reason}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-neutral-700">
                    {activeRefundRequest.details || 'No additional details provided.'}
                  </p>
                  <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-white p-3">
                    <img
                      src={activeRefundRequest.evidenceImage}
                      alt="Refund evidence"
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="text-xs text-neutral-600">
                      <p className="font-bold text-slate-900">Evidence attached</p>
                      <p className="mt-1">{activeRefundRequest.artworkTitle}</p>
                      <p>Order {activeRefundRequest.orderNumber}</p>
                    </div>
                  </div>
                  {activeRefundRequest.status === 'pending' && (
                    <>
                      <p className="mt-3 text-xs leading-5 text-amber-950">
                        Approving records your decision. Coordinate the actual payment refund directly with the buyer; payment processing is not connected.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onRefundDecision(activeRefundRequest.id, 'approved')}
                          className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                        >
                          Approve refund request
                        </button>
                        <button
                          type="button"
                          onClick={() => onRefundDecision(activeRefundRequest.id, 'declined')}
                          className="rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                        >
                          Reject refund request
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {activeThread.conversation ? (
              <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-neutral-100 bg-white p-3">
                <input
                  type="text"
                  placeholder={`Reply to ${activeThread.buyerName}...`}
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  className="min-w-0 flex-1 rounded-full border border-neutral-200 px-4 py-2.5 text-xs text-slate-800 focus:border-red-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="shrink-0 rounded-full bg-[#8E1B24] p-2.5 text-white transition-colors hover:bg-[#73151D] disabled:opacity-40"
                  title="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            ) : activeThread.kind === 'review' ? (
              <form onSubmit={handleSendReviewReply} className="flex gap-2 border-t border-neutral-100 bg-white p-3">
                <input
                  type="text"
                  placeholder="Reply to this customer review..."
                  value={reviewReplyText}
                  onChange={(event) => setReviewReplyText(event.target.value)}
                  className="min-w-0 flex-1 rounded-full border border-neutral-200 px-4 py-2.5 text-xs text-slate-800 focus:border-red-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!reviewReplyText.trim()}
                  className="shrink-0 rounded-full bg-[#8E1B24] p-2.5 text-white transition-colors hover:bg-[#73151D] disabled:opacity-40"
                  title="Save review reply"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 border-t border-neutral-100 bg-white p-3 text-xs text-neutral-500">
                <ImageIcon className="h-4 w-4" />
                This order message can be viewed here. The buyer conversation is not available for replies.
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-neutral-500">
            <MessageSquare className="h-9 w-9 text-neutral-300" />
            <p className="mt-3 font-semibold text-slate-700">Select a customer service item</p>
            <p className="mt-1 text-xs">Buyer messages, custom and digital order notes, reviews, and refund requests appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
};
