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
  const total = useAppSelector((state) => state.products.total);
  const productsLoading = useAppSelector((state) => state.products.loading);

  useEffect(() => {
    if (matchedCategory) {
      // A larger limit than the default page size (20) so a category with
      // more listings than one page still shows all of them here - this
      // page has no pagination UI, so a capped fetch would silently hide
      // the rest regardless of what the displayed count said.
      dispatch(fetchProductsThunk({ categoryId: matchedCategory.id, limit: 100 }));
    }
  }, [matchedCategory, dispatch]);

  const loading = categoriesLoading || productsLoading;
  // `products` is a shared, cross-fetch cache (home feed, other category
  // pages, seller profiles, etc. all merge into the same array) - the
  // backend's categoryId filter only scopes what THIS fetch added, not
  // what's already sitting in the store from an earlier fetch. Re-filter
  // by the category name defensively, the same pattern the seller-profile
  // page already uses to scope the same shared list to its own owner.
  const filteredProducts = matchedCategory
    ? products.filter((p) => p.category === matchedCategory.name)
    : [];
  // The real total for this category from the backend, not the length of
  // whatever page of items happened to load - correct even before/without
  // a full pagination UI, and unaffected by the shared-cache filtering above.
  const displayCount = matchedCategory ? total : 0;


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
                Showing {displayCount} verified listings in {categoryName}
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
