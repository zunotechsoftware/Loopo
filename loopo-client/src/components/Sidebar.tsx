'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Grid,
  MapPin,
  MessageSquare,
  Bell,
  Package,
  Heart,
  PlusCircle,
  HelpCircle,
  Settings,
  ShieldCheck,
  Bookmark,
  DollarSign,
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { ROUTES } from '@/routes/routes';

export default function Sidebar() {
  const pathname = usePathname();
  const conversations = useAppSelector((state) => state.chat.conversations);
  const favorites = useAppSelector((state) => state.products.favorites);
  const notifications = useAppSelector((state) => state.notifications.items);

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    { label: 'Home', href: ROUTES.HOME, icon: Home },
    { label: 'Categories', href: ROUTES.CATEGORIES, icon: Grid },
    { label: 'Location', href: ROUTES.LOCATION, icon: MapPin },
    { label: 'Messages', href: ROUTES.CHATS, icon: MessageSquare, badge: totalUnread },
    { label: 'Offers', href: ROUTES.OFFERS, icon: DollarSign },
    { label: 'Notifications', href: ROUTES.NOTIFICATIONS, icon: Bell, badge: unreadNotifs },
    { label: 'My Listings', href: ROUTES.MY_LISTINGS, icon: Package },
    { label: 'Favourites', href: ROUTES.FAVOURITES, icon: Heart, badge: favorites.length },
    { label: 'Saved Searches', href: ROUTES.SAVED_SEARCHES, icon: Bookmark },
    { label: 'Seller Verification', href: ROUTES.VERIFICATION, icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)] shrink-0 hidden md:flex overflow-y-auto">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
            </Link>
          );
        })}

        {/* Primary CTA: Sell on Loopo */}
        <div className="pt-3 pb-2">
          <Link
            href={ROUTES.SELL}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm px-4 py-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Sell on Loopo</span>
          </Link>
        </div>
      </div>

      {/* Footer Navigation Items */}
      <div className="space-y-1 pt-4 border-t border-slate-100">
        <Link
          href={ROUTES.HELP}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            pathname.startsWith(ROUTES.HELP) ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help & Support</span>
        </Link>

        <Link
          href={ROUTES.SETTINGS}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            pathname.startsWith(ROUTES.SETTINGS) ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
