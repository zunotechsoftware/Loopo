'use client';

import React from 'react';

/*
 * NOTE: Explore feature has been commented out as requested.
 *
import ProductCard from '../ui/ProductCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setSearchQuery, setCategoryFilter } from '@/redux/slices/productsSlice';
*/

export default function ExploreView() {
  /*
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
  */

  return (
    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
      <div className="text-slate-500 font-bold text-base">Explore Section Disabled</div>
      <p className="text-xs text-slate-400 font-medium">The Explore marketplace view has been commented out.</p>
    </div>
  );
}

