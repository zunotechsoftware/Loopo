'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  Phone,
  MoreVertical,
  Image,
  ShieldCheck,
  Tag,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Package,
  Flag,
  MapPin,
  Ban,
  Loader2,
  X,
} from 'lucide-react';
import { userApi } from '@/services/userApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setChatFilterTab,
  setActiveConversation,
  addOptimisticMessage,
  sendMessageThunk,
  receiveMessage,
  applyConversationUpdate,
  removeMessage,
  updateOfferStatus,
  fetchConversationsThunk,
  fetchMessagesThunk,
} from '@/redux/slices/chatSlice';
import {
  setOfferModalOpen,
  openReportModal,
  setReviewModalOpen,
  showToast,
} from '@/redux/slices/uiSlice';
import { useChatSocket } from '@/hooks/useChatSocket';

export default function MessagesView() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.chat.conversations);
  const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);
  const chatFilterTab = useAppSelector((state) => state.chat.chatFilterTab);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  // Fetch real conversations from API on mount
  useEffect(() => {
    dispatch(fetchConversationsThunk());
  }, [dispatch]);

  // Real-time: messages/conversation updates arrive over the same
  // Socket.IO gateway already used by loopo-admin - joining a
  // conversation's room (below) is what makes the backend start pushing
  // these events for it.
  const { joinConversation, leaveConversation, isConnected } = useChatSocket({
    onReceiveMessage: (message) => {
      if (message?.conversationId) {
        dispatch(receiveMessage({ conversationId: message.conversationId, message, currentUserId }));
      }
    },
    onConversationUpdated: (data) => {
      if (!data?.conversationId) return;
      const known = conversations.some((c) => c.id === data.conversationId);
      if (known) {
        dispatch(applyConversationUpdate({ conversationId: data.conversationId, lastMessage: data.lastMessage }));
      } else {
        // A brand-new conversation (or one we haven't loaded into this
        // session yet) - pull the real list rather than trying to
        // reconstruct a full Conversation object from a bare message event.
        dispatch(fetchConversationsThunk());
      }
    },
  });

  // Join the active conversation's room (so we receive its live events and
  // the backend marks its messages read/delivered for us), load its full
  // history the first time it's opened, and leave the room when switching
  // away or unmounting.
  useEffect(() => {
    // Also re-run once the socket finishes connecting: joining before it's
    // connected is a silent no-op (see joinConversation), and the initial
    // connection is asynchronous - without this, whichever conversation
    // was already active before the socket connected never actually gets
    // joined, so it never receives live events until switched away from
    // and back to.
    if (!activeConversationId || !isConnected) return;
    joinConversation(activeConversationId);
    const conv = conversations.find((c) => c.id === activeConversationId);
    if (conv && !conv.messagesLoaded) {
      dispatch(fetchMessagesThunk(activeConversationId));
    }
    return () => {
      leaveConversation(activeConversationId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, isConnected]);

  // Compute total unread counts for Buying & Selling
  const buyingUnread = conversations
    .filter((c) => c.type === 'buying')
    .reduce((acc, c) => acc + c.unreadCount, 0);

  const sellingUnread = conversations
    .filter((c) => c.type === 'selling')
    .reduce((acc, c) => acc + c.unreadCount, 0);

  // Filter conversations according to selected tab
  const filteredConversations = conversations.filter((c) => {
    if (chatFilterTab === 'all') return true;
    return c.type === chatFilterTab;
  });

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) ||
    filteredConversations[0] ||
    conversations[0];

  const [textInput, setTextInput] = useState('');

  // --- Block / Unblock ---
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [blockActionLoading, setBlockActionLoading] = useState(false);
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);

  const refreshBlockedList = () => {
    userApi.getBlockedUsers().then((res) => {
      if (res.success && res.data) {
        setBlockedUserIds(new Set(res.data.map((u) => u.id)));
      }
    });
  };

  useEffect(() => {
    refreshBlockedList();
  }, []);

  const isActivePartyBlocked = !!activeConv && blockedUserIds.has(activeConv.otherPartyId);

  const handleConfirmBlockToggle = async () => {
    if (!activeConv) return;
    setBlockActionLoading(true);
    try {
      const res = isActivePartyBlocked
        ? await userApi.unblockUser(activeConv.otherPartyId)
        : await userApi.blockUser(activeConv.otherPartyId);
      if (res.success) {
        refreshBlockedList();
        dispatch(showToast(isActivePartyBlocked ? `Unblocked ${activeConv.otherPartyName}` : `Blocked ${activeConv.otherPartyName}`));
        setConfirmBlockOpen(false);
      } else {
        dispatch(showToast(res.error || 'Failed to update block status'));
      }
    } finally {
      setBlockActionLoading(false);
    }
  };

  // Optimistic-then-reconcile send: append immediately (feels instant),
  // then persist for real - see sendMessageThunk/addOptimisticMessage for
  // how the temporary and real copies get reconciled without duplicating.
  const sendChatMessage = (text: string) => {
    if (!text.trim() || !activeConv) return;
    if (isActivePartyBlocked) {
      dispatch(showToast('Unblock this user to send messages.'));
      return;
    }
    const tempId = `optimistic-${Date.now()}`;
    dispatch(addOptimisticMessage({ conversationId: activeConv.id, tempId, text }));
    dispatch(sendMessageThunk({ conversationId: activeConv.id, text, tempId }));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sendChatMessage(textInput);
    setTextInput('');
  };

  const isBuyingTab = activeConv?.type === 'buying';

  const quickChips = isBuyingTab
    ? ['Is this still available?', 'What is your final price?', 'Can I inspect today?', 'Share current location']
    : ['Yes, it is available!', 'Price is non-negotiable.', 'Self pickup at Indiranagar.', 'Available for inspection tomorrow'];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[calc(100vh-7rem)] flex flex-col md:flex-row animate-in fade-in duration-300">
      {/* Left Column: Conversations & OLX Tab Switcher */}
      <div className="w-full md:w-80 border-r border-slate-100 flex flex-col shrink-0">
        {/* Header & Buying / Selling Tab Switcher (OLX Style) */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h1 className="font-black text-slate-900 text-base">Inbox & Chats</h1>
            <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              OLX Mode
            </span>
          </div>

          {/* OLX Buying & Selling Segmented Control */}
          <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => dispatch(setChatFilterTab('buying'))}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                chatFilterTab === 'buying'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buying</span>
              {buyingUnread > 0 && (
                <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black ml-0.5">
                  {buyingUnread}
                </span>
              )}
            </button>

            <button
              onClick={() => dispatch(setChatFilterTab('selling'))}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                chatFilterTab === 'selling'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Selling</span>
              {sellingUnread > 0 && (
                <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black ml-0.5">
                  {sellingUnread}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-1">
              <div>No {chatFilterTab} conversations.</div>
              <div className="text-[11px] text-slate-300">Inquiries will appear here when buyers or sellers chat.</div>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSel = conv.id === activeConv?.id;
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
                      src={conv.otherPartyAvatar}
                      alt={conv.otherPartyName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {conv.otherPartyName}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                            conv.type === 'buying'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {conv.otherPartyRole}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        {conv.lastTime}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-emerald-600 truncate mt-0.5">
                      {conv.itemTitle} • {conv.itemPrice}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 truncate">
                      {conv.lastMessage}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Conversation Window */}
      {activeConv ? (
        <div className="flex-1 flex flex-col justify-between bg-slate-50/30 min-w-0">
          {/* Chat Top Banner Header */}
          <div className="bg-white p-3.5 px-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={activeConv.itemImage}
                alt={activeConv.itemTitle}
                className="w-11 h-11 rounded-xl object-cover border border-slate-100 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-extrabold text-xs text-slate-900 truncate">
                  {activeConv.itemTitle}
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-black text-emerald-600">{activeConv.itemPrice}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400 font-medium flex items-center gap-0.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {activeConv.itemLocation}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => dispatch(showToast('Calling isn\'t available yet - message the seller instead.'))}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Call</span>
              </button>

              <button
                onClick={() => dispatch(setOfferModalOpen(true))}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
              >
                <Tag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Make Offer</span>
              </button>

              <button
                onClick={() => dispatch(openReportModal({ targetType: 'USER', targetId: activeConv.otherPartyId, label: activeConv.otherPartyName }))}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                title="Report User"
              >
                <Flag className="w-4 h-4 text-slate-400 hover:text-red-500" />
              </button>

              <button
                onClick={() => setConfirmBlockOpen(true)}
                className={`p-2 rounded-xl transition-colors ${isActivePartyBlocked ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:bg-slate-100'}`}
                title={isActivePartyBlocked ? 'Unblock User' : 'Block User'}
              >
                <Ban className={`w-4 h-4 ${isActivePartyBlocked ? '' : 'hover:text-red-500'}`} />
              </button>
            </div>
          </div>

          {/* Blocked-state banner */}
          {isActivePartyBlocked && (
            <div className="bg-red-50 border-b border-red-100 px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
              <span className="text-red-700 font-semibold">
                You've blocked {activeConv.otherPartyName}. They can't message you, and you can't message them.
              </span>
              <button
                onClick={() => setConfirmBlockOpen(true)}
                className="text-red-700 font-extrabold underline shrink-0"
              >
                Unblock
              </button>
            </div>
          )}

          {/* Messages Feed Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {/* Safety Tips Card */}
            <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-2xl text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Safety Tip:</strong> Inspect item in person before making payment. Never transfer money online in advance.
                </span>
              </div>
              <button
                onClick={() => dispatch(setReviewModalOpen(true))}
                className="text-[11px] font-extrabold text-emerald-700 underline shrink-0 ml-2"
              >
                Rate Seller
              </button>
            </div>

            {/* Render Messages */}
            {(activeConv?.messages || []).map((msg) => {
              const isUser = msg.sender === 'user';

              if (msg.isOffer) {
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="bg-white border-2 border-emerald-500 rounded-3xl p-4 max-w-sm shadow-md space-y-3">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                          <Tag className="w-4 h-4 text-emerald-600" />
                          <span>Price Offer</span>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            msg.offerStatus === 'Accepted'
                              ? 'bg-emerald-100 text-emerald-700'
                              : msg.offerStatus === 'Declined'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {msg.offerStatus}
                        </span>
                      </div>

                      <div className="text-center py-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Offered Price
                        </div>
                        <div className="text-2xl font-black text-emerald-600">{msg.offerAmount}</div>
                      </div>

                      {/* Interactive Buttons for Seller when offer is Pending */}
                      {!isUser && activeConv.type === 'selling' && msg.offerStatus === 'Pending' && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => {
                              dispatch(
                                updateOfferStatus({
                                  conversationId: activeConv.id,
                                  messageId: msg.id,
                                  status: 'Accepted',
                                })
                              );
                              dispatch(showToast('Offer Accepted! 🎉'));
                            }}
                            className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>

                          <button
                            onClick={() => {
                              dispatch(
                                updateOfferStatus({
                                  conversationId: activeConv.id,
                                  messageId: msg.id,
                                  status: 'Declined',
                                })
                              );
                              dispatch(showToast('Offer Declined'));
                            }}
                            className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-medium text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${
                      msg.failed
                        ? 'bg-red-50 text-red-700 border border-red-200 rounded-br-none'
                        : isUser
                        ? `bg-emerald-600 text-white rounded-br-none ${msg.pending ? 'opacity-60' : ''}`
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-medium mt-1 px-1 flex items-center gap-1">
                    {msg.failed ? (
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(removeMessage({ conversationId: activeConv.id, messageId: msg.id }));
                          sendChatMessage(msg.text);
                        }}
                        className="text-red-500 font-bold underline"
                      >
                        Failed - tap to retry
                      </button>
                    ) : (
                      <span className="text-slate-400">{msg.pending ? 'Sending...' : msg.time}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-6 py-2 bg-white border-t border-slate-100/60 flex items-center gap-2 overflow-x-auto">
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => sendChatMessage(chip)}
                className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[11px] font-semibold text-slate-600 rounded-full whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input Footer Bar */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              disabled={isActivePartyBlocked}
              onClick={() => dispatch(showToast('Photo attachment clicked'))}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Attach Photo"
            >
              <Image className="w-5 h-5" />
            </button>
            <input
              type="text"
              disabled={isActivePartyBlocked}
              placeholder={isActivePartyBlocked ? 'Unblock to send a message...' : `Message ${activeConv.otherPartyName}...`}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isActivePartyBlocked}
              className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-slate-400 font-medium text-sm">
          Select a conversation to start chatting.
        </div>
      )}

      {/* Block / Unblock Confirmation Dialog */}
      {confirmBlockOpen && activeConv && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-slate-900 text-base">
                <Ban className="w-5 h-5 text-red-500" />
                <span>{isActivePartyBlocked ? 'Unblock' : 'Block'} {activeConv.otherPartyName}?</span>
              </div>
              <button onClick={() => setConfirmBlockOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {isActivePartyBlocked
                ? 'They will be able to message you again, and you can message them.'
                : "They won't be able to send you messages, and you won't be able to message them, until you unblock."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBlockOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBlockToggle}
                disabled={blockActionLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {blockActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                <span>{isActivePartyBlocked ? 'Unblock' : 'Block'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
