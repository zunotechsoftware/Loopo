'use client';

import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryIcon } from '@/utils/categoryIcon';
import { ChevronRight, Grid, Loader2 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function CategoriesPage() {
  const { categories, loading, error } = useCategories();

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Explore Marketplace Categories</h1>
              <p className="text-xs text-slate-500 font-medium">Browse verified listings by category and subcategory</p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading categories…
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-12">{error}</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.name);

              return (
                <div
                  key={cat.id}
                  className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                        {cat.itemCount} items
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base mb-1 group-hover:text-emerald-600 transition-colors">
                      {cat.name}
                    </h3>
                  </div>

                  <Link
                    href={ROUTES.CATEGORY_DETAIL(cat.slug)}
                    className="w-full py-2.5 bg-slate-50 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Browse {cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
