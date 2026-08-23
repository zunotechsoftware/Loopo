'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

export default function AdminCategoryDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const categoryId = resolvedParams.categoryId;
  const dispatch = useAppDispatch();

  const [name, setName] = useState('Mobiles');
  const [subs, setSubs] = useState('Smartphones, Tablets, Accessories');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(showToast(`Category ${name} updated successfully!`));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.ADMIN_CATEGORIES} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">Edit Category #{categoryId}</h1>
          <p className="text-xs text-slate-400 font-medium">Update category taxonomy details</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 max-w-xl">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400">Subcategories (comma separated)</label>
          <input
            type="text"
            value={subs}
            onChange={(e) => setSubs(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 outline-none"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Category Changes
        </button>
      </form>
    </div>
  );
}
