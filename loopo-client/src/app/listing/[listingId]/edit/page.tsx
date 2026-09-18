'use client';

import React, { use, useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import SellFlowView from '@/components/views/SellFlowView';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchProductByIdThunk } from '@/redux/slices/productsSlice';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/routes/routes';
import { Product } from '@/types';

interface PageProps {
  params: Promise<{ listingId: string }>;
}

export default function EditListingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.listingId;
  const dispatch = useAppDispatch();
  const productInStore = useAppSelector((state) => state.products.items.find((p) => p.id === listingId));

  // undefined = still resolving, null = confirmed not found/inaccessible, Product = loaded.
  // SellFlowView reads this tri-state to show a loading/not-found view instead
  // of silently rendering a blank "create new" form.
  const [product, setProduct] = useState<Product | null | undefined>(productInStore);

  useEffect(() => {
    if (productInStore) {
      setProduct(productInStore);
      return;
    }

    // Not already loaded into the store (fresh page load / direct link) -
    // fetch it by id instead of leaving the form stuck blank forever.
    let cancelled = false;
    dispatch(fetchProductByIdThunk(listingId))
      .unwrap()
      .then((p) => {
        if (!cancelled) setProduct(p);
      })
      .catch(() => {
        if (!cancelled) setProduct(null);
      });
    return () => {
      cancelled = true;
    };
    // productInStore intentionally excluded - handled by the effect below so
    // this one only ever fires the fetch once per listingId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, dispatch]);

  // If the store's copy changes later (e.g. right after a successful save),
  // stay in sync with it.
  useEffect(() => {
    if (productInStore) setProduct(productInStore);
  }, [productInStore]);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <Link href={ROUTES.LISTING_DETAIL(listingId)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl font-black text-slate-900">Edit Listing #{listingId}</h1>
                <p className="text-xs text-slate-500 font-medium">Update listing details, pricing, or photos</p>
              </div>
            </div>
          </div>

          <SellFlowView listingId={listingId} initialProduct={product} />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
