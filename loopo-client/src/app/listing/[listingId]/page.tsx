'use client';

import React, { use } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductDetailView from '@/components/views/ProductDetailView';
import { useAppDispatch } from '@/redux/hooks';
import { openProductDetail } from '@/redux/slices/navigationSlice';

interface PageProps {
  params: Promise<{ listingId: string }>;
}

export default function ListingDetailPage({ params }: PageProps) {
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
      <ProductDetailView />
    </MainLayout>
  );
}
