'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/ui/ProductCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { searchProductsThunk, setNearbyOnly } from '@/redux/slices/productsSlice';
import { Search, SlidersHorizontal, MapPin, ArrowUpDown, Filter, X, Check, Loader2, Navigation } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

/** Maps the drawer's display labels to the backend's real ProductCondition
 * enum (NEW/LIKE_NEW/GOOD/FAIR/POOR) - sending the label string itself
 * would just get silently stripped by the whitelist validation pipe. */
function conditionToEnum(label: string): string | undefined {
  const norm = label.toLowerCase();
  if (norm.includes('brand') || norm === 'new') return 'NEW';
  if (norm.includes('like')) return 'LIKE_NEW';
  if (norm.includes('good')) return 'GOOD';
  if (norm.includes('fair')) return 'FAIR';
  return undefined;
}

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
  const filtered = useAppSelector((state) => state.products.searchResults);
  const searchTotal = useAppSelector((state) => state.products.searchTotal);
  const isLoading = useAppSelector((state) => state.products.searchLoading);
  const nearbyOnly = useAppSelector((state) => state.products.filters.nearbyOnly);
  const locationData = useAppSelector((state) => state.ui.locationData);
  const { categories } = useCategories();

  const [searchQuery, setSearchQueryState] = useState(q);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [condition, setCondition] = useState(conditionParam);
  const [sortOption, setSortOption] = useState(sortParam);
  const [showMobileFilterDrawer, setShowMobileFilterDrawer] = useState(false);

  // The URL keeps a human-readable category *name* (?category=Mobiles) for
  // shareable/bookmarkable links, resolved to the real categoryId the
  // backend actually filters on before fetching.
  const categoryId = categories.find(
    (c) => c.name.toLowerCase() === categoryParam.toLowerCase()
  )?.id;

  const hasCoords = locationData.latitude !== undefined && locationData.longitude !== undefined;

  // Real GET /search: price range, condition, and sort are now applied
  // server-side (previously fetched an unfiltered/unsorted page from
  // /products and filtered *that* client-side, which only ever operated on
  // whatever page happened to already be loaded). "Near me" plugs the
  // browsing location set on /location or the header into a real geo-radius
  // query instead of doing nothing, which is all it did before.
  useEffect(() => {
    dispatch(searchProductsThunk({
      query: q || undefined,
      categoryId,
      minPrice: minPriceParam ? Number(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
      condition: conditionParam ? conditionToEnum(conditionParam) as any : undefined,
      sortBy: sortParam === 'price-low' || sortParam === 'price-high' ? 'price' : 'createdAt',
      sortOrder: sortParam === 'price-low' ? 'asc' : 'desc',
      ...(nearbyOnly && hasCoords
        ? { latitude: locationData.latitude, longitude: locationData.longitude, radiusKm: locationData.radiusKm || 15 }
        : {}),
    }));
  }, [q, categoryId, minPriceParam, maxPriceParam, conditionParam, sortParam, nearbyOnly, hasCoords, locationData.latitude, locationData.longitude, locationData.radiusKm, dispatch]);

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
              {isLoading ? 'Searching…' : `Showing ${filtered.length} of ${searchTotal} products`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch(setNearbyOnly(!nearbyOnly))}
              disabled={!hasCoords}
              title={hasCoords ? undefined : 'Set your location first (top-right, or /location) to search nearby'}
              className={`flex items-center gap-2 font-bold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                nearbyOnly && hasCoords
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Near me{hasCoords ? ` (${locationData.radiusKm || 15} km)` : ''}</span>
            </button>
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
          {nearbyOnly && hasCoords && (
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Within {locationData.radiusKm || 15} km of {locationData.city || locationData.displayName}
              <X className="w-3 h-3 cursor-pointer" onClick={() => dispatch(setNearbyOnly(false))} />
            </span>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {isLoading && filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Searching…
        </div>
      ) : filtered.length === 0 ? (
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
                {categories.map((c) => (
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
