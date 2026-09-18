'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateSellForm } from '@/redux/slices/sellSlice';
import { useCategories } from '@/hooks/useCategories';
import { ROUTES } from '@/routes/routes';
import { ArrowRight, Grid, Check, Loader2 } from 'lucide-react';

// Generic fallback subcategories, since the backend's real categories don't
// carry the same hand-picked subcategory lists the old hardcoded CATEGORIES
// constant did. subcategoryId is optional on the backend, so this is
// cosmetic only - it doesn't block publishing.
const GENERIC_SUBCATEGORIES = ['General', 'Accessories', 'Parts', 'Other'];

export default function SellCategoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { category, categoryId, subcategory } = useAppSelector((state) => state.sell.formData);
  const { categories, loading, error } = useCategories();

  // Default to the first real category once loaded, if nothing picked yet.
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      dispatch(
        updateSellForm({
          category: categories[0].name,
          categoryId: categories[0].id,
          subcategory: GENERIC_SUBCATEGORIES[0],
        })
      );
    }
  }, [categories, categoryId, dispatch]);

  const handleSelectCat = (catId: string, catName: string) => {
    dispatch(
      updateSellForm({
        category: catName,
        categoryId: catId,
        subcategory: GENERIC_SUBCATEGORIES[0],
      })
    );
  };

  const handleSelectSub = (subName: string) => {
    dispatch(updateSellForm({ subcategory: subName }));
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-black text-slate-900">Step 1: Select Category & Subcategory</h2>
        <p className="text-xs text-slate-500 font-medium">Choose the appropriate category for your item.</p>
      </div>

      {/* Main Categories */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700">Category</label>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading categories…
          </div>
        ) : error ? (
          <p className="text-xs text-red-600 py-2">{error}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCat(cat.id, cat.name)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
                  }`}
                >
                  <span className="text-xs">{cat.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Subcategories */}
      <div className="space-y-2 pt-2">
        <label className="text-xs font-bold text-slate-700">Subcategory in {category}</label>
        <div className="flex flex-wrap gap-2">
          {GENERIC_SUBCATEGORIES.map((sub) => {
            const isSelected = subcategory === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => handleSelectSub(sub)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue CTA */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          disabled={!categoryId}
          onClick={() => router.push(ROUTES.SELL_DETAILS)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
        >
          <span>Next: Product Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
