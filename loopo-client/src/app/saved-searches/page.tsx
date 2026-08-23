'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Bookmark, Bell, Trash2, ExternalLink } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

export default function SavedSearchesPage() {
  const dispatch = useAppDispatch();

  const [savedSearches, setSavedSearches] = useState([
    { id: 'ss-1', query: 'iPhone 15 Pro', category: 'Mobiles', location: 'Bangalore', notifications: true, date: '2 days ago' },
    { id: 'ss-2', query: 'Maruti Swift Automatic', category: 'Cars', location: 'Mumbai', notifications: false, date: '1 week ago' },
    { id: 'ss-3', query: 'L-Shaped Sofa Set', category: 'Furniture', location: 'Bangalore', notifications: true, date: '2 weeks ago' },
  ]);

  const toggleNotif = (id: string) => {
    setSavedSearches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, notifications: !s.notifications } : s))
    );
    dispatch(showToast('Updated notification preferences'));
  };

  const removeSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    dispatch(showToast('Removed saved search'));
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Saved Searches</h1>
                <p className="text-xs text-slate-500 font-medium">Get notified when new listings match your saved filters.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {savedSearches.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
                No saved searches found.
              </div>
            ) : (
              savedSearches.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">&quot;{item.query}&quot;</h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      Location: {item.location} • Saved {item.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleNotif(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        item.notifications
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{item.notifications ? 'Alerts ON' : 'Alerts OFF'}</span>
                    </button>

                    <Link
                      href={`${ROUTES.SEARCH}?q=${encodeURIComponent(item.query)}&category=${encodeURIComponent(item.category)}`}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                      title="Run Search"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => removeSearch(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
