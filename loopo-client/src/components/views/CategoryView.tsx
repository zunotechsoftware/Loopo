'use client';

import React from 'react';
import { MOCK_CATEGORIES } from '@/mockData/categories';
import ProductCard from '../ui/ProductCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCategoryFilter } from '@/redux/slices/productsSlice';

export default function CategoryView() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const selectedCategory = useAppSelector((state) => state.products.filters.category);

  const activeCategory = selectedCategory === 'All Categories' ? 'Electronics' : selectedCategory;
  const filtered = products.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Category Pills Header */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <h2 className="text-lg font-black text-slate-900 px-2">Category Directory</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none px-2">
          {MOCK_CATEGORIES.map((cat) => {
            const isSel = activeCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => dispatch(setCategoryFilter(cat.name))}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Listings Grid */}
      <div className="space-y-4">
        <h3 className="text-md font-bold text-slate-800">
          Showing items in <span className="text-emerald-600">{activeCategory}</span> ({filtered.length})
        </h3>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
            No products currently available in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
