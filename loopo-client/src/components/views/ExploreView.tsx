'use client';

import React from 'react';
import ProductCard from '../ui/ProductCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setSearchQuery, setCategoryFilter } from '@/redux/slices/productsSlice';

export default function ExploreView() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const filters = useAppSelector((state) => state.products.filters);

  const filtered = products.filter((p) => {
    const matchesSearch =
      !filters.searchQuery ||
      p.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(filters.searchQuery.toLowerCase());

    const matchesCategory =
      filters.category === 'All Categories' ||
      p.category.toLowerCase() === filters.category.toLowerCase();

    const matchesPrice =
      p.price >= filters.minPrice && p.price <= filters.maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Explore Marketplace</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Showing {filtered.length} items in{' '}
            <span className="text-emerald-600 font-bold">{filters.category}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter explore items..."
            value={filters.searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl outline-none focus:border-emerald-500 w-full sm:w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
          <div className="text-slate-400 font-medium text-sm">No items match your criteria.</div>
          <button
            onClick={() => {
              dispatch(setSearchQuery(''));
              dispatch(setCategoryFilter('All Categories'));
            }}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
