'use client';

import React, { use } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductDetailView from '@/components/views/ProductDetailView';
import { useAppDispatch } from '@/redux/hooks';
import { openProductDetail } from '@/redux/slices/navigationSlice';
import { Eye, CheckCircle2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ listingId: string }>;
}

export default function ListingPreviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.listingId;
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (listingId) {
      dispatch(openProductDetail(listingId));
    }
  }, [listingId, dispatch]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-sm font-bold text-amber-900">Listing Preview Mode</h2>
              <p className="text-xs text-amber-700 font-medium">This is how buyers will see your listing once published.</p>
            </div>
          </div>
        </div>

        <ProductDetailView />
      </div>
    </MainLayout>
  );
}
