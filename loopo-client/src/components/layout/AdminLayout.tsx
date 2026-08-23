'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  PackageCheck,
  ShieldAlert,
  BadgeCheck,
  FolderTree,
  Sliders,
  LogOut,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import AdminRoute from '@/routes/AdminRoute';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const adminNav = [
    { label: 'Overview', href: ROUTES.ADMIN, icon: LayoutDashboard },
    { label: 'User Management', href: ROUTES.ADMIN_USERS, icon: Users },
    { label: 'Listing Moderation', href: ROUTES.ADMIN_LISTINGS, icon: PackageCheck },
    { label: 'Report Management', href: ROUTES.ADMIN_REPORTS, icon: ShieldAlert },
    { label: 'Seller Verifications', href: ROUTES.ADMIN_VERIFICATIONS, icon: BadgeCheck },
    { label: 'Category Management', href: ROUTES.ADMIN_CATEGORIES, icon: FolderTree },
    { label: 'Marketplace Settings', href: ROUTES.ADMIN_SETTINGS, icon: Sliders },
  ];

  return (
    <AdminRoute>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans selection:bg-purple-500 selection:text-white">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4 sticky top-0 h-screen shrink-0 hidden md:flex">
          <div className="space-y-6">
            {/* Header / Logo */}
            <div className="flex items-center justify-between px-2 pt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 font-black text-lg">
                  L
                </div>
                <div>
                  <h1 className="font-black text-sm text-white tracking-wide">LOOPO ADMIN</h1>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                    Moderation Suite
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === ROUTES.ADMIN
                    ? pathname === ROUTES.ADMIN
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Back Link */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <Link
              href={ROUTES.HOME}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>Return to Loopo</span>
              </div>
            </Link>
          </div>
        </aside>

        {/* Main Admin Body */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-purple-400 bg-purple-950/80 border border-purple-800/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Admin Environment
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
              <Link href={ROUTES.HOME} className="hover:text-emerald-400 flex items-center gap-1">
                <span>Loopo Main App</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminRoute>
  );
}
