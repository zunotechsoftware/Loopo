'use client';

import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Search, HelpCircle, ChevronRight, MessageSquare, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function HelpPage() {
  const articles = [
    { title: 'How to post a successful listing on Loopo', slug: 'how-to-sell-on-loopo' },
    { title: 'Safety guidelines for buying & meeting sellers', slug: 'safety-tips-for-buyers' },
    { title: 'Editing, renewing or marking item as sold', slug: 'managing-your-listings' },
    { title: 'Understanding seller verification & badges', slug: 'seller-verification-guide' },
    { title: 'Reporting scams, fraud or prohibited items', slug: 'reporting-scams' },
  ];

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Loopo Help Center</h1>
              <p className="text-xs text-slate-500 font-medium">Frequently asked questions and guides</p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Popular Help Articles</h3>
            {articles.map((art) => (
              <Link
                key={art.slug}
                href={ROUTES.HELP_ARTICLE(art.slug)}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-xs font-bold text-slate-800"
              >
                <span>{art.title}</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
            ))}
          </div>

          <div className="pt-4 flex gap-3">
            <Link
              href={ROUTES.CONTACT_SUPPORT}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Support</span>
            </Link>

            <Link
              href={ROUTES.SAFETY}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety Tips</span>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
