'use client';

import React, { use } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/ui/ProductCard';
import { useAppSelector } from '@/redux/hooks';
import { MOCK_CATEGORIES } from '@/mockData/categories';
import { Smartphone, Car, Bike, Tv, Sofa, Shirt, BookOpen, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/routes/routes';

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

export default function CategoryDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const categorySlug = resolvedParams.categorySlug;

  const products = useAppSelector((state) => state.products.items);

  // Match category by slug or name
  const matchedCategory = MOCK_CATEGORIES.find(
    (c) => c.name.toLowerCase().replace(/\s+/g, '-') === categorySlug.toLowerCase()
  );
  const categoryName = matchedCategory ? matchedCategory.name : categorySlug.replace(/-/g, ' ');

  const filteredProducts = products.filter(
    (p) => p.category.toLowerCase() === categoryName.toLowerCase()
  );

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

            {matchedCategory && (
              <div className="flex flex-wrap gap-1.5">
                {matchedCategory.subcategories.map((sub) => (
                  <span
                    key={sub}
                    className="text-[11px] font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {filteredProducts.length === 0 ? (
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
