'use client';

import React, { use } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import PendingRatingsView from '@/components/views/PendingRatingsView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PendingRatingDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <MainLayout>
        <PendingRatingsView autoOpenId={id} />
      </MainLayout>
    </ProtectedRoute>
  );
}
