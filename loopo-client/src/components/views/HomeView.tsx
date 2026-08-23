'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  Car,
  Bike,
  Tv,
  Sofa,
  Shirt,
  BookOpen,
  Home,
  ShieldCheck,
  Users,
  Zap,
  Leaf,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { MOCK_CATEGORIES } from '@/mockData/categories';
import ProductCard from '../ui/ProductCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveTab } from '@/redux/slices/navigationSlice';
import { setCategoryFilter, fetchProductsThunk } from '@/redux/slices/productsSlice';
import { ROUTES } from '@/routes/routes';

export default function HomeView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const products = useAppSelector((state) => state.products.items);
  const filters = useAppSelector((state) => state.products.filters);
  const isLoading = useAppSelector((state) => state.products.loading);

  // Fetch real products from API on mount
  useEffect(() => {
    dispatch(fetchProductsThunk({}));
  }, [dispatch]);

  // Filter products based on search or category if set
  const filteredProducts = products.filter((p) => {
    if (!p) return false;
    const titleStr = (p.title || '').toLowerCase();
    const catStr = (p.category || '').toLowerCase();
    const queryStr = (filters.searchQuery || '').toLowerCase();

    const matchesSearch =
      !queryStr ||
      titleStr.includes(queryStr) ||
      catStr.includes(queryStr);

    const matchesCategory =
      filters.category === 'All Categories' ||
      catStr === (filters.category || '').toLowerCase();

    return matchesSearch && matchesCategory;
  });

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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-100/50 p-6 md:p-10 border border-emerald-100 shadow-sm">
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>India&apos;s #1 Sustainable Marketplace</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            Buy. <span className="text-emerald-600">Sell.</span> Reuse. Repeat.
          </h1>

          <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
            Join millions of people on Loopo to buy, sell and give items a second life.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                dispatch(setActiveTab('categories'));
                router.push(ROUTES.CATEGORIES);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md shadow-emerald-500/20 transition-all duration-200"
            >
              Browse Categories
            </button>
            <button
              onClick={() => {
                router.push('/sell/category');
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm px-6 py-3 rounded-2xl transition-all duration-200"
            >
              Sell Your Item
            </button>
          </div>
        </div>

        {/* Decorative Product Illustration / Graphic */}
        <div className="absolute right-4 bottom-0 hidden lg:block w-96 h-full pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop"
            alt="Hero Banner Decor"
            className="w-80 h-48 object-cover rounded-2xl shadow-2xl transform rotate-3 translate-y-6 border-4 border-white"
          />
        </div>
      </div>

      {/* Browse by Category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-lg tracking-tight">Browse by Category</h2>
          <button
            onClick={() => {
              dispatch(setActiveTab('categories'));
              router.push(ROUTES.CATEGORIES);
            }}
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {MOCK_CATEGORIES.map((cat) => {
            const IconComponent = getCategoryIcon(cat.iconName);
            const slug = (cat as any).slug || cat.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <div
                key={cat.id}
                onClick={() => {
                  dispatch(setCategoryFilter(cat.name));
                  dispatch(setActiveTab('categories'));
                  router.push(`/categories/${encodeURIComponent(slug)}`);
                }}
                className="group bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 text-center cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}
                >
                  <IconComponent className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="font-bold text-xs text-slate-900 line-clamp-1">{cat.name}</div>
                <div className="text-[10px] font-medium text-slate-400">{cat.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended for You Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg tracking-tight">Fresh Recommendations</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Handpicked items near your location</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Showing verified ads</span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto font-bold text-lg">
              ?
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">No listings found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find any products matching your current search or category filter. Try clearing your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Trust & Features Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 text-sm">Verified Sellers</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every seller undergoes government ID & phone verification before posting ads.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 text-sm">Direct Local Inquiries</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Chat directly with nearby buyers & sellers with built-in offer price negotiation.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 text-sm">Instant Ad Publishing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Post your unused items in under 60 seconds with instant photo upload and location lookup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
