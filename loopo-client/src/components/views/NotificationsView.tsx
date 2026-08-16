'use client';

import React, { useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Tag,
  MessageSquare,
  TrendingDown,
  ShieldCheck,
  Rocket,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setNotificationsFilterTab,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  fetchNotificationsThunk,
} from '@/redux/slices/notificationsSlice';
import { setActiveTab } from '@/redux/slices/navigationSlice';
import { setActiveConversation } from '@/redux/slices/chatSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { NotificationType } from '@/mockData/notifications';

export default function NotificationsView() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);
  const filterTab = useAppSelector((state) => state.notifications.filterTab);

  // Fetch real notifications from API on mount
  useEffect(() => {
    dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === 'unread') return !n.isRead;
    if (filterTab === 'offers') return n.type === 'offer' || n.type === 'price_drop';
    if (filterTab === 'chats') return n.type === 'chat';
    if (filterTab === 'system') return n.type === 'kyc' || n.type === 'ad_boost' || n.type === 'security';
    return true; // 'all'
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'offer':
        return { Icon: Tag, bg: 'bg-emerald-100 text-emerald-600' };
      case 'chat':
        return { Icon: MessageSquare, bg: 'bg-blue-100 text-blue-600' };
      case 'price_drop':
        return { Icon: TrendingDown, bg: 'bg-amber-100 text-amber-700' };
      case 'kyc':
        return { Icon: ShieldCheck, bg: 'bg-emerald-100 text-emerald-700' };
      case 'ad_boost':
        return { Icon: Rocket, bg: 'bg-purple-100 text-purple-600' };
      case 'security':
        return { Icon: Lock, bg: 'bg-indigo-100 text-indigo-600' };
      default:
        return { Icon: Bell, bg: 'bg-slate-100 text-slate-600' };
    }
  };

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    dispatch(markAsRead(notif.id));
    if (notif.targetTab === 'messages' && notif.targetId) {
      dispatch(setActiveConversation(notif.targetId));
      dispatch(setActiveTab('messages'));
    } else if (notif.targetTab) {
      dispatch(setActiveTab(notif.targetTab));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Container */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Notifications Center</h1>
            {unreadCount > 0 && (
              <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500">
            Stay updated with price offers, chat messages, ad boosts, and safety alerts.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => {
                dispatch(markAllAsRead());
                dispatch(showToast('All notifications marked as read!'));
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3.5 py-2 rounded-xl transition-colors border border-emerald-200"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => {
                dispatch(clearAllNotifications());
                dispatch(showToast('Notifications cleared'));
              }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'all', label: 'All Notifications' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'offers', label: 'Offers & Price Drops' },
          { id: 'chats', label: 'Chats' },
          { id: 'system', label: 'Account & Safety' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => dispatch(setNotificationsFilterTab(tab.id as any))}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <div className="text-slate-500 font-bold text-sm">No notifications found</div>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
              You're all caught up! Updates regarding your ads, chats, and offers will show up here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const { Icon, bg } = getNotificationIcon(notif.type);
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`group bg-white p-4 rounded-3xl border transition-all cursor-pointer flex items-start gap-4 ${
                  !notif.isRead
                    ? 'border-emerald-500/40 bg-emerald-50/20 shadow-sm'
                    : 'border-slate-100 shadow-sm hover:border-slate-200'
                }`}
              >
                {/* Notification Type Icon */}
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {notif.description}
                  </p>

                  {/* Optional Action Prompt */}
                  {notif.targetTab && (
                    <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600 group-hover:underline">
                      <span>Open & View Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Optional Item Thumbnail */}
                {notif.image && (
                  <img
                    src={notif.image}
                    alt="Item Thumbnail"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0 hidden sm:block"
                  />
                )}

                {/* Context Menu Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(deleteNotification(notif.id));
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 transition-opacity shrink-0"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
