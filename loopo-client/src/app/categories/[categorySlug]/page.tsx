'use client';

import React, { use, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/ui/ProductCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchProductsThunk } from '@/redux/slices/productsSlice';
import { useCategories } from '@/hooks/useCategories';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/routes/routes';

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

export default function CategoryDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const categorySlug = resolvedParams.categorySlug;
  const dispatch = useAppDispatch();

  const { categories, loading: categoriesLoading } = useCategories();
  const matchedCategory = categories.find((c) => c.slug === categorySlug);
  const categoryName = matchedCategory ? matchedCategory.name : categorySlug.replace(/-/g, ' ');

  const products = useAppSelector((state) => state.products.items);
  const productsLoading = useAppSelector((state) => state.products.loading);

  useEffect(() => {
    if (matchedCategory) {
      dispatch(fetchProductsThunk({ categoryId: matchedCategory.id }));
    }
  }, [matchedCategory, dispatch]);

  const loading = categoriesLoading || productsLoading;
  // Products in store are already scoped to this category by the fetch
  // above (server-side filter by real categoryId) - no client-side
  // name-matching needed.
  const filteredProducts = matchedCategory ? products : [];


  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Category Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <Link
            href={ROUTES.CATEGORIES}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Categories</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 capitalize">{categoryName}</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Showing {filteredProducts.length} verified listings in {categoryName}
              </p>
            </div>

          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading listings…
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
            No products currently found in <span className="font-bold capitalize">{categoryName}</span>.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
