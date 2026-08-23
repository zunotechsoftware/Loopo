'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppSelector } from '@/redux/hooks';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const conversations = useAppSelector((state) => state.chat.conversations);
  const unreadChats = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Hide bottom nav on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const items = [
    { label: 'Home', href: ROUTES.HOME, icon: Home },
    { label: 'Search', href: ROUTES.SEARCH, icon: Search },
    { label: 'Sell', href: ROUTES.SELL, icon: PlusCircle, isSell: true },
    { label: 'Chat', href: ROUTES.CHATS, icon: MessageSquare, badge: unreadChats },
    { label: 'Profile', href: ROUTES.PROFILE, icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 py-2 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          if (item.isSell) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-4 ring-white active:scale-95 transition-all">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 mt-1">Sell</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
