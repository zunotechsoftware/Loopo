'use client';

import React, { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import SellFlowView from '@/components/views/SellFlowView';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateSellForm } from '@/redux/slices/sellSlice';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/routes/routes';

interface PageProps {
  params: Promise<{ listingId: string }>;
}

export default function EditListingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.listingId;
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);

  const product = products.find((p) => p.id === listingId);

  useEffect(() => {
    if (product) {
      dispatch(
        updateSellForm({
          title: product.title,
          category: product.category,
          price: product.price.toString(),
          condition: product.condition as any,
          description: product.description,
          location: product.location,
          images: product.images,
        })
      );
    }
  }, [product, dispatch]);

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

          <SellFlowView />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
