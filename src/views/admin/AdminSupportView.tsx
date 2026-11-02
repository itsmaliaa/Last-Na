import React, { useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Conversation } from '../../types';

interface AdminSupportViewProps {
  conversations: Conversation[];
  onSendMessage: (conversationId: string, text: string) => void;
  onMarkConversationRead: (conversationId: string) => void;
}

export const AdminSupportView: React.FC<AdminSupportViewProps> = ({
  conversations,
  onSendMessage,
  onMarkConversationRead,
}) => {
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [reply, setReply] = useState('');
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId)
    ?? conversations[0];

  useEffect(() => {
    if (!selectedConversationId && conversations[0]) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
    if (conversation.unread) onMarkConversationRead(conversation.id);
  };

  const handleSendReply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedConversation || !reply.trim()) return;
    onSendMessage(selectedConversation.id, reply.trim());
    setReply('');
  };

  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Buyer care</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">Help &amp; Support Inbox</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Answer customer questions from the Help &amp; Support page. Replies appear in the buyer’s support chat.
        </p>
      </header>

      <div className="grid min-h-[560px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex max-h-64 flex-col border-b border-neutral-200 md:max-h-none md:border-b-0 md:border-r">
          <div className="flex items-center justify-between border-b border-neutral-100 p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-red-600" />
              <h2 className="text-sm font-bold text-slate-900">Support requests</h2>
            </div>
            <span className="text-[11px] font-semibold text-neutral-400">{conversations.length}</span>
          </div>
          <div className="flex-1 divide-y divide-neutral-100 overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => selectConversation(conversation)}
                className={`w-full p-4 text-left transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-red-50' : 'hover:bg-neutral-50'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold text-slate-900">{conversation.buyerName || conversation.name}</span>
                  {conversation.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" />}
                </span>
                <span className="mt-1 block truncate text-[11px] font-semibold text-red-700">{conversation.subject}</span>
                <span className="mt-1 block truncate text-[11px] text-neutral-500">{conversation.lastMessage}</span>
                <span className="mt-2 block text-[10px] text-neutral-400">{conversation.time}</span>
              </button>
            ))}
            {conversations.length === 0 && (
              <p className="p-6 text-center text-xs leading-5 text-neutral-500">
                No support requests yet. New buyer chats will appear here.
              </p>
            )}
          </div>
        </aside>

        <div className="flex min-h-[420px] min-w-0 flex-col">
          {selectedConversation ? (
            <>
              <header className="border-b border-neutral-100 p-4">
                <h2 className="text-sm font-bold text-slate-900">{selectedConversation.buyerName || selectedConversation.name}</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {selectedConversation.email} · {selectedConversation.subject}
                </p>
              </header>
              <div className="flex-1 space-y-3 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6">
                {selectedConversation.messages.map((message) => {
                  const isAdminReply = message.sender === 'support';
                  return (
                    <div key={message.id} className={`flex flex-col ${isAdminReply ? 'items-end' : 'items-start'}`}>
                      <span className="mb-1 px-1 text-[10px] font-semibold text-neutral-500">
                        {isAdminReply ? 'Red Nexus Support' : selectedConversation.buyerName || selectedConversation.name} · {message.time}
                      </span>
                      <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-xs leading-5 ${
                        isAdminReply ? 'rounded-br-sm bg-[#8E1B24] text-white' : 'rounded-bl-sm border border-neutral-200 bg-white text-slate-800'
                      }`}>
                        {message.text}
                      </p>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleSendReply} className="flex items-center gap-2 border-t border-neutral-100 p-3 sm:p-4">
                <input
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  maxLength={2000}
                  aria-label="Reply to buyer"
                  placeholder="Reply to this customer..."
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
              <MessageSquare className="h-9 w-9 text-neutral-300" />
              <p className="mt-3 text-sm font-bold text-slate-800">No customer support chats yet</p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-neutral-500">
                New questions sent from the buyer Help &amp; Support page will be listed here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
