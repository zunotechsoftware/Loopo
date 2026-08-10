'use client';

import React, { useState } from 'react';
import { Send, Phone, MoreVertical, Image, ShieldCheck, CheckCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveConversation, sendMessage } from '@/redux/slices/chatSlice';
import { showToast } from '@/redux/slices/uiSlice';

export default function MessagesView() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.chat.conversations);
  const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const [textInput, setTextInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    dispatch(sendMessage({ conversationId: activeConv.id, text: textInput }));
    setTextInput('');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[calc(100vh-7rem)] flex animate-in fade-in duration-300">
      {/* Left Column: Conversations List */}
      <div className="w-80 border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 font-extrabold text-slate-900 text-base">
          Messages & Chats
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {conversations.map((conv) => {
            const isSel = conv.id === activeConv.id;
            return (
              <div
                key={conv.id}
                onClick={() => dispatch(setActiveConversation(conv.id))}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                  isSel ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.sellerAvatar}
                    alt={conv.sellerName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">{conv.sellerName}</span>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0">{conv.lastTime}</span>
                  </div>

                  <div className="text-[11px] font-bold text-emerald-600 truncate">{conv.itemTitle}</div>
                  <div className="text-[11px] font-medium text-slate-500 truncate">{conv.lastMessage}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Conversation */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50/30">
        {/* Chat Header */}
        <div className="bg-white p-3.5 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={activeConv.itemImage}
              alt={activeConv.itemTitle}
              className="w-10 h-10 rounded-xl object-cover border border-slate-100"
            />
            <div>
              <div className="font-extrabold text-xs text-slate-900">{activeConv.itemTitle}</div>
              <div className="text-[11px] font-bold text-emerald-600">{activeConv.itemPrice}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(showToast(`Calling ${activeConv.sellerName}...`))}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Bubbles */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {activeConv.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] font-medium text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 bg-white border-t border-slate-100/60 flex items-center gap-2 overflow-x-auto">
          {['Is this still available?', 'What is your final price?', 'Can I inspect today?'].map((chip) => (
            <button
              key={chip}
              onClick={() => dispatch(sendMessage({ conversationId: activeConv.id, text: chip }))}
              className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[11px] font-semibold text-slate-600 rounded-full whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(showToast('Attach image clicked'))}
            className="p-2 text-slate-400 hover:text-slate-600"
          >
            <Image className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
