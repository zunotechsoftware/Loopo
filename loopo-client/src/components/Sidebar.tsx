'use client';

import React from 'react';
import {
  Home,
  Compass,
  Grid,
  MapPin,
  MessageSquare,
  Bell,
  Package,
  Heart,
  ShoppingBag,
  Wallet,
  PlusCircle,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveTab, ActiveTab } from '@/redux/slices/navigationSlice';
import { setSellModalOpen } from '@/redux/slices/uiSlice';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.navigation.activeTab);
  const isSellModalOpen = useAppSelector((state) => state.ui.isSellModalOpen);
  const conversations = useAppSelector((state) => state.chat.conversations);
  const favorites = useAppSelector((state) => state.products.favorites);
  const notifications = useAppSelector((state) => state.notifications.items);

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: Home },
    // { id: 'explore', label: 'Explore', icon: Compass }, // Commented as requested
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'near-you', label: 'Near You', icon: MapPin },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: totalUnread },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs },
    { id: 'my-ads', label: 'My Ads', icon: Package },
    { id: 'saved', label: 'Saved Items', icon: Heart, badge: favorites.length },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    dispatch(setSellModalOpen(false));
    dispatch(setActiveTab(tabId));
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)] shrink-0 hidden md:flex">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && !isSellModalOpen;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Primary CTA: Sell on Loopo */}
        <div className="pt-3 pb-2">
          <button
            onClick={() => {
              dispatch(setActiveTab('sell'));
              dispatch(setSellModalOpen(true));
            }}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm px-4 py-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Sell on Loopo</span>
          </button>
        </div>
      </div>

      {/* Footer Navigation Items */}
      <div className="space-y-1 pt-4 border-t border-slate-100">
        <button
          onClick={() => handleNavClick('help')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'help' && !isSellModalOpen ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help & Support</span>
        </button>

        <button
          onClick={() => handleNavClick('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'settings' && !isSellModalOpen ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
