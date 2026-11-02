import React, { useState } from 'react';
import { ChevronDown, Headphones, MessageCircle, Send } from 'lucide-react';
import { Conversation } from '../types';

interface HelpSupportViewProps {
  userName: string;
  userEmail: string;
  conversations: Conversation[];
  onStartSupportConversation: (subject: string, message: string) => string;
  onSendMessage: (conversationId: string, text: string) => void;
  onMarkConversationRead: (conversationId: string) => void;
}

const faqItems = [
  {
    question: 'How do I place an order?',
    answer: 'Open an artwork, choose any required size or color options, then add it to your cart. Review your items and delivery details at checkout, and submit the order to save it to your Orders page.',
  },
  {
    question: 'How can I check my order status?',
    answer: 'Open your buyer profile and choose Orders. Orders are grouped into To Ship, Shipped, Completed, and Review. Open an order to view its saved tracking details when the seller has provided them.',
  },
  {
    question: 'How do payment and delivery work?',
    answer: 'This prototype records orders in this browser; it does not process a real payment or book a carrier. Follow the payment and delivery instructions shown at checkout and coordinate with the seller. Never share passwords or verification codes in messages.',
  },
  {
    question: 'How do I request help with an order?',
    answer: 'Open Orders, select the relevant completed order, and use its refund or issue request if available. You can also start a support chat here and include your order number and a short description—do not include sensitive payment information.',
  },
  {
    question: 'How do I contact an artist?',
    answer: 'Open the artwork or artist profile and choose the contact or message option. Messages to artists appear in your buyer Messages inbox. For account, checkout, or marketplace questions, start a Red Nexus Support chat on this page.',
  },
  {
    question: 'Where can I update my delivery address?',
    answer: 'Open your buyer profile and choose Addresses. Add or edit a saved address, then set the address you want to use as the default for checkout.',
  },
];

export const HelpSupportView: React.FC<HelpSupportViewProps> = ({
  userName,
  userEmail,
  conversations,
  onStartSupportConversation,
  onSendMessage,
  onMarkConversationRead,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [reply, setReply] = useState('');
  const [formError, setFormError] = useState('');

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId)
    ?? conversations[0];

  const handleStartSupportChat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) {
      setFormError('Add a topic and describe how we can help.');
      return;
    }

    const conversationId = onStartSupportConversation(subject.trim(), initialMessage.trim());
    setSelectedConversationId(conversationId);
    setSubject('');
    setInitialMessage('');
    setFormError('');
    setShowNewRequest(false);
  };

  const handleSendReply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedConversation || !reply.trim()) return;
    onSendMessage(selectedConversation.id, reply.trim());
    setReply('');
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl bg-[#8E1B24] p-6 text-white shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Red Nexus buyer care</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Help &amp; Support</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
              Hi {userName}, find quick answers below or chat with the admin support team.
            </p>
          </div>
        </div>
      </header>

      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-900">Frequently asked questions</h2>
            <p className="mt-1 text-xs text-neutral-500">Answers to common shopping and account questions.</p>
          </div>
          <div className="divide-y divide-neutral-100">
            {faqItems.map((item, index) => (
              <div key={item.question}>
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  onClick={() => setOpenFaq((current) => current === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold text-slate-800"
                >
                  {item.question}
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <p className="max-w-3xl pb-4 text-sm leading-6 text-neutral-600">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Chat with support</h2>
                <p className="text-[11px] text-neutral-500">A Red Nexus admin will reply in this chat.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowNewRequest((visible) => !visible)}
              className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              New question
            </button>
          </div>

          {showNewRequest && (
            <form onSubmit={handleStartSupportChat} className="space-y-3 border-b border-neutral-100 bg-neutral-50/70 p-5">
              <label className="block text-xs font-bold text-slate-700">
                Topic
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  maxLength={100}
                  placeholder="Order, account, checkout..."
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-red-400"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                How can we help?
                <textarea
                  value={initialMessage}
                  onChange={(event) => setInitialMessage(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Describe your concern. Include an order number if relevant."
                  className="mt-1.5 w-full resize-y rounded-xl border border-neutral-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-red-400"
                />
              </label>
              {formError && <p role="alert" className="text-xs font-semibold text-red-700">{formError}</p>}
              <p className="text-[11px] text-neutral-500">
                Signed in as {userEmail}. Do not send passwords, verification codes, or full payment details.
              </p>
              <button type="submit" className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700">
                Start chat
              </button>
            </form>
          )}

          <div className="grid min-h-[420px] grid-cols-1 md:grid-cols-[150px_minmax(0,1fr)]">
            <div className="max-h-48 divide-y divide-neutral-100 overflow-y-auto border-b border-neutral-100 md:max-h-[480px] md:border-b-0 md:border-r">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    setSelectedConversationId(conversation.id);
                    if (conversation.unread) onMarkConversationRead(conversation.id);
                  }}
                  className={`w-full px-4 py-3 text-left ${selectedConversation?.id === conversation.id ? 'bg-red-50' : 'hover:bg-neutral-50'}`}
                >
                  <span className="block truncate text-xs font-bold text-slate-900">{conversation.subject}</span>
                  <span className="mt-1 block truncate text-[11px] text-neutral-500">{conversation.lastMessage}</span>
                  {conversation.unread && <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700">Reply received</span>}
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="p-4 text-xs leading-5 text-neutral-500">Your support chats will appear here.</p>
              )}
            </div>

            <div className="flex min-h-[420px] min-w-0 flex-col">
              {selectedConversation ? (
                <>
                  <div className="border-b border-neutral-100 px-4 py-3">
                    <p className="text-xs font-bold text-slate-900">{selectedConversation.subject}</p>
                    <p className="mt-1 text-[10px] text-neutral-500">Red Nexus Support · Admin response</p>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto bg-[#FAF9F6]/50 p-4">
                    {selectedConversation.messages.map((message) => {
                      const isBuyerMessage = message.sender === 'buyer';
                      return (
                        <div key={message.id} className={`flex flex-col ${isBuyerMessage ? 'items-end' : 'items-start'}`}>
                          <span className="mb-1 px-1 text-[10px] font-semibold text-neutral-500">
                            {isBuyerMessage ? 'You' : 'Red Nexus Support'} · {message.time}
                          </span>
                          <p className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                            isBuyerMessage ? 'rounded-br-sm bg-[#8E1B24] text-white' : 'rounded-bl-sm border border-neutral-200 bg-white text-slate-800'
                          }`}>
                            {message.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <form onSubmit={handleSendReply} className="flex items-center gap-2 border-t border-neutral-100 p-3">
                    <input
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      maxLength={2000}
                      aria-label="Message Red Nexus Support"
                      placeholder="Write a reply..."
                      className="min-w-0 flex-1 rounded-full border border-neutral-200 px-4 py-2.5 text-xs outline-none focus:border-red-400"
                    />
                    <button
                      type="submit"
                      disabled={!reply.trim()}
                      aria-label="Send reply"
                      className="rounded-full bg-red-600 p-2.5 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <MessageCircle className="h-8 w-8 text-neutral-300" />
                  <p className="mt-3 text-sm font-bold text-slate-800">Need more help?</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-500">
                    Start a chat and an admin can respond to your question here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowNewRequest(true)}
                    className="mt-4 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                  >
                    Contact support
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};
