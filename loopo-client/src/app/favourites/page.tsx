'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import ProductCard from '@/components/ui/ProductCard';
import { useAppSelector } from '@/redux/hooks';
import { Heart } from 'lucide-react';

export default function FavouritesPage() {
  const favorites = useAppSelector((state) => state.products.favorites);
  const products = useAppSelector((state) => state.products.items);

  const favProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
                <Heart className="w-5 h-5 fill-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Saved Favourites</h1>
                <p className="text-xs text-slate-500 font-medium">Quick access to listings you are interested in.</p>
              </div>
            </div>

            <span className="text-xs font-extrabold bg-red-100 text-red-700 px-3.5 py-1.5 rounded-full">
              {favProducts.length} items
            </span>
          </div>

          {favProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm space-y-2">
              <Heart className="w-10 h-10 text-slate-200 mx-auto" />
              <div>Your favourites list is currently empty.</div>
              <p className="text-xs text-slate-400">Click the heart icon on any listing card to save it here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {favProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
