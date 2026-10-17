import React, { useState } from 'react';
import { MessageSquare, Send, User, Check, Clock } from 'lucide-react';

interface SellerMessagesViewProps {
  onShowToast: (title: string, msg?: string, type?: 'success' | 'info' | 'error') => void;
}

export const SellerMessagesView: React.FC<SellerMessagesViewProps> = ({ onShowToast }) => {
  const [activeThreadId, setActiveThreadId] = useState('t-1');
  const [inputText, setInputText] = useState('');

  const [threads, setThreads] = useState([
    {
      id: 't-1',
      buyerName: 'Maria Santos',
      artworkTitle: 'Abstract Horizons',
      lastMessage: 'Thank you Malia! The canvas arrived in pristine condition.',
      time: '10:45 AM',
      unread: false,
      messages: [
        { sender: 'buyer', text: 'Hi Malia! Is this piece ready for gallery-standard framing?', time: 'Aug 27, 2:10 PM' },
        { sender: 'seller', text: 'Hello Maria! Yes, it has 4cm gallery-wrap edges and is ready to hang or box frame.', time: 'Aug 27, 2:15 PM' },
        { sender: 'buyer', text: 'Thank you Malia! The canvas arrived in pristine condition.', time: 'Today, 10:45 AM' },
      ],
    },
    {
      id: 't-2',
      buyerName: 'Arthur Pendelton',
      artworkTitle: 'Urban Reflections',
      lastMessage: 'Does it come with an authenticity certificate from the department?',
      time: 'Yesterday',
      unread: true,
      messages: [
        { sender: 'buyer', text: 'Does it come with an authenticity certificate from the department?', time: 'Yesterday, 4:20 PM' },
      ],
    },
    {
      id: 't-3',
      buyerName: 'Carla Espiritu',
      artworkTitle: 'Brutalist Pavilions',
      lastMessage: 'Loved your brushwork during the spring exhibition preview!',
      time: 'Sep 01',
      unread: false,
      messages: [
        { sender: 'buyer', text: 'Loved your brushwork during the spring exhibition preview! So excited to have acquired this piece.', time: 'Sep 01, 6:00 PM' },
        { sender: 'seller', text: 'Thank you so much Carla! Your support truly empowers my final year thesis work.', time: 'Sep 01, 6:30 PM' },
      ],
    },
  ]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      sender: 'seller',
      text: inputText,
      time: 'Just now',
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              messages: [...t.messages, newMessage],
              lastMessage: inputText,
              time: 'Just now',
            }
          : t
      )
    );

    setInputText('');
    onShowToast('Message Sent', 'Sent to ' + activeThread.buyerName, 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden h-[600px] flex flex-col md:flex-row">
      {/* Left Column: Conversations List */}
      <div className="w-full md:w-80 border-r border-neutral-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-slate-900">Buyer Inquiries</h3>
          </div>
          <span className="text-[11px] font-semibold text-neutral-400">{threads.length} chats</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThreadId(t.id)}
              className={`w-full p-4 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                activeThreadId === t.id ? 'bg-neutral-50' : 'hover:bg-neutral-50/50'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-neutral-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                {t.buyerName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-xs text-slate-900 truncate">{t.buyerName}</p>
                  <span className="text-[10px] text-neutral-400 shrink-0">{t.time}</span>
                </div>
                <p className="text-[11px] text-red-600 font-medium truncate">{t.artworkTitle}</p>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">{t.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Chat Box */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">{activeThread.buyerName}</h4>
            <p className="text-xs text-neutral-500">Subject: <span className="font-medium text-red-600">{activeThread.artworkTitle}</span></p>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            Verified Acquisition Buyer
          </span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF9F6]/40 text-xs">
          {activeThread.messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'seller' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-md px-4 py-2.5 rounded-2xl ${
                  m.sender === 'seller'
                    ? 'bg-[#8E1B24] text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-neutral-200/80 rounded-bl-xs shadow-2xs'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-100 bg-white flex gap-2">
          <input
            type="text"
            placeholder={`Reply to ${activeThread.buyerName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2 border border-neutral-200 rounded-full text-xs focus:outline-none focus:border-red-400 text-slate-800"
          />
          <button
            type="submit"
            className="p-2.5 bg-[#8E1B24] hover:bg-[#73151D] text-white rounded-full transition-colors cursor-pointer shrink-0"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
