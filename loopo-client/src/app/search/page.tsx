'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/ui/ProductCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchProductsThunk } from '@/redux/slices/productsSlice';
import { Search, SlidersHorizontal, MapPin, ArrowUpDown, Filter, X, Check, Loader2 } from 'lucide-react';
import { MOCK_CATEGORIES } from '@/mockData/categories';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const conditionParam = searchParams.get('condition') || '';
  const locationParam = searchParams.get('location') || '';
  const sortParam = searchParams.get('sort') || 'newest';

  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const isLoading = useAppSelector((state) => state.products.loading);

  const [searchQuery, setSearchQueryState] = useState(q);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [condition, setCondition] = useState(conditionParam);
  const [sortOption, setSortOption] = useState(sortParam);
  const [showMobileFilterDrawer, setShowMobileFilterDrawer] = useState(false);

  useEffect(() => {
    dispatch(fetchProductsThunk({ query: q, category: categoryParam }));
  }, [q, categoryParam, dispatch]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (condition) params.set('condition', condition);
    if (sortOption) params.set('sort', sortOption);
    if (locationParam) params.set('location', locationParam);

    router.push(`/search?${params.toString()}`);
    setShowMobileFilterDrawer(false);
  };

  // Filter products locally
  let filtered = products.filter((p) => {
    const matchesQ = !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase());
    const matchesCat = !categoryParam || p.category.toLowerCase() === categoryParam.toLowerCase();
    const matchesMin = !minPriceParam || p.price >= Number(minPriceParam);
    const matchesMax = !maxPriceParam || p.price <= Number(maxPriceParam);
    const matchesCond = !conditionParam || p.condition.toLowerCase() === conditionParam.toLowerCase();
    return matchesQ && matchesCat && matchesMin && matchesMax && matchesCond;
  });

  if (sortParam === 'price-low') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortParam === 'price-high') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Search & Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {q ? `Results for "${q}"` : 'Marketplace Search'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Showing {filtered.length} products
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilterDrawer(true)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filters & Sorting</span>
            </button>
          </div>
        </div>

        {/* Applied Filter Tags */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {categoryParam && (
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
              Category: {categoryParam}
              <X className="w-3 h-3 cursor-pointer" onClick={() => { setSelectedCategory(''); applyFilters(); }} />
            </span>
          )}
          {minPriceParam && (
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
              Min: ₹{minPriceParam}
            </span>
          )}
          {maxPriceParam && (
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
              Max: ₹{maxPriceParam}
            </span>
          )}
          {conditionParam && (
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
              Condition: {conditionParam}
            </span>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
          No products found matching your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Filter Drawer Overlay */}
      {showMobileFilterDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full p-6 shadow-2xl overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">Filter & Sort Search</h2>
              <button onClick={() => setShowMobileFilterDrawer(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              >
                <option value="">All Categories</option>
                {MOCK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                />
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              >
                <option value="">Any Condition</option>
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setMinPrice('');
                  setMaxPrice('');
                  setCondition('');
                  setSortOption('newest');
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Searching...</div>}>
        <SearchContent />
      </Suspense>
    </MainLayout>
  );
}
