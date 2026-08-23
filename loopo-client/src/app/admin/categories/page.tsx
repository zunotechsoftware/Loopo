'use client';

import React from 'react';
import Link from 'next/link';
import { FolderTree, Edit3, Plus } from 'lucide-react';
import { MOCK_CATEGORIES } from '@/mockData/categories';
import { ROUTES } from '@/routes/routes';

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Category Management</h1>
          <p className="text-xs text-slate-400 font-medium">Manage marketplace category taxonomy, subcategories & icons.</p>
        </div>

        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md">
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_CATEGORIES.map((cat) => (
          <div key={cat.id} className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base">{cat.name}</h3>
              <Link
                href={ROUTES.ADMIN_CATEGORY_DETAIL(cat.id)}
                className="p-2 text-purple-400 hover:bg-slate-900 rounded-xl"
              >
                <Edit3 className="w-4 h-4" />
              </Link>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Subcategories: {cat.subcategories.join(', ')}
            </div>
            <div className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2.5 py-1 rounded-full inline-block">
              {cat.itemCount} items listed
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
