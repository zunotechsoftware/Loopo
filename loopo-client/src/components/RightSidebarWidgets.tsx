'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, SlidersHorizontal, Rocket, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setCategoryFilter,
  setConditionFilter,
  setNearbyOnly,
  setPriceRange,
  resetFilters,
} from '@/redux/slices/productsSlice';
import { openProductDetail } from '@/redux/slices/navigationSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { ROUTES } from '@/routes/routes';

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

export default function RightSidebarWidgets() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const filters = useAppSelector((state) => state.products.filters);
  const nearbyResults = useAppSelector((state) => state.products.searchResults);
  const locationData = useAppSelector((state) => state.ui.locationData);
  const hasCoords = locationData.latitude !== undefined && locationData.longitude !== undefined;

  const [minInput, setMinInput] = useState(filters.minPrice === 0 ? '' : filters.minPrice.toString());
  const [maxInput, setMaxInput] = useState(filters.maxPrice === 500000 ? '' : filters.maxPrice.toString());

  // Real nearby locations, derived from the same geo-radius search Home
  // already runs for its own "Near You" section - previously this was four
  // hardcoded Bangalore neighbourhoods shown to every visitor regardless of
  // where they actually were (or whether this marketplace has any real
  // listings near them at all). Deduped by area/city since most seeded
  // listings don't have a locality-level area set, keeping the closest
  // (first, since results already arrive sorted by distance) for each.
  const nearLocations: { id: string; name: string; distanceKm: number }[] = [];
  const seenNames = new Set<string>();
  for (const product of nearbyResults) {
    if (typeof product.distance !== 'number') continue;
    const name = product.area || product.location;
    if (!name || seenNames.has(name)) continue;
    seenNames.add(name);
    nearLocations.push({ id: product.id, name, distanceKm: product.distance });
    if (nearLocations.length >= 4) break;
  }

  const handleApplyFilters = () => {
    const min = minInput ? parseInt(minInput, 10) : 0;
    const max = maxInput ? parseInt(maxInput, 10) : 500000;
    dispatch(setPriceRange({ min, max }));
    dispatch(showToast('Filters applied!'));
  };

  return (
    <aside className="w-80 space-y-6 hidden xl:block shrink-0">
      {/* Widget 1: Near You Locations - real, from the same geo-radius
          search Home runs, not a fixed Bangalore neighbourhood list. */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Near you</span>
          </div>
          {hasCoords && nearLocations.length > 0 && (
            <button
              onClick={() => {
                dispatch(setNearbyOnly(true));
                router.push(ROUTES.SEARCH);
              }}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              View all
            </button>
          )}
        </div>

        {!hasCoords ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-xs text-slate-400 font-medium">Set your location to see what's nearby.</p>
            <button
              onClick={() => router.push(ROUTES.LOCATION)}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Set location
            </button>
          </div>
        ) : nearLocations.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium text-center py-4">
            No listings near {locationData.city || locationData.displayName} yet.
          </p>
        ) : (
          <div className="space-y-3">
            {nearLocations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => {
                  dispatch(openProductDetail(loc.id));
                  router.push(`/listing/${loc.id}`);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{loc.name}</div>
                    <div className="text-[10px] font-medium text-slate-400">{formatDistance(loc.distanceKm)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget 2: Filters Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filters</span>
          </div>
          <button
            onClick={() => {
              dispatch(resetFilters());
              setMinInput('');
              setMaxInput('');
            }}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Clear all
          </button>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500"
          >
            <option>All Categories</option>
            <option>Mobiles</option>
            <option>Cars</option>
            <option>Bikes</option>
            <option>Electronics</option>
            <option>Furniture</option>
            <option>Fashion</option>
            <option>Books</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Price Range
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
              <input
                type="number"
                placeholder="Min"
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-6 pr-2 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
            <span className="text-slate-300 text-xs">-</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
              <input
                type="number"
                placeholder="Max"
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-6 pr-2 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Condition Dropdown */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Condition
          </label>
          <select
            value={filters.condition}
            onChange={(e) => dispatch(setConditionFilter(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500"
          >
            <option>All Condition</option>
            <option>Brand New</option>
            <option>Like New</option>
            <option>Good</option>
            <option>Fair</option>
          </select>
        </div>

        {/* Nearby Only Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none py-1">
          <div
            onClick={() => dispatch(setNearbyOnly(!filters.nearbyOnly))}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              filters.nearbyOnly
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 bg-white'
            }`}
          >
            {filters.nearbyOnly && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span className="text-xs font-semibold text-slate-700">Nearby only</span>
        </label>

        {/* Apply Filters Button */}
        <button
          onClick={handleApplyFilters}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-200"
        >
          Apply Filters
        </button>
      </div>

      {/* Widget 3: Get More Visibility Rocket Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 p-5 border border-emerald-100/80 shadow-sm">
        <div className="relative z-10 space-y-2 max-w-[180px]">
          <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
            Get more visibility
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Boost your ad and sell <span className="font-bold text-emerald-700">3x faster</span>.
          </p>
          <div className="pt-2">
            <button
              onClick={() => dispatch(showToast('Boost Ad selected'))}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all duration-200"
            >
              Boost Ad
            </button>
          </div>
        </div>

        <div className="absolute right-2 bottom-2 text-emerald-500/40 transform rotate-12">
          <Rocket className="w-24 h-24 stroke-[1.5]" />
        </div>
      </div>
    </aside>
  );
}
