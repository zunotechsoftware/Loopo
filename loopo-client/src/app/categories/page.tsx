'use client';

import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { MOCK_CATEGORIES } from '@/mockData/categories';
import { Smartphone, Car, Bike, Tv, Sofa, Shirt, BookOpen, Home, ChevronRight, Grid } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function CategoriesPage() {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return Smartphone;
      case 'Car':
        return Car;
      case 'Bike':
        return Bike;
      case 'Tv':
        return Tv;
      case 'Sofa':
        return Sofa;
      case 'Shirt':
        return Shirt;
      case 'BookOpen':
        return BookOpen;
      default:
        return Home;
    }
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            const slug = cat.name.toLowerCase().replace(/\s+/g, '-');

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

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium">
                    {cat.subcategories.join(' • ')}
                  </p>
                </div>

                <Link
                  href={ROUTES.CATEGORY_DETAIL(slug)}
                  className="w-full py-2.5 bg-slate-50 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Browse {cat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
