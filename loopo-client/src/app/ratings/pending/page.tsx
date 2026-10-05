'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import PendingRatingsView from '@/components/views/PendingRatingsView';

export default function PendingRatingsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <PendingRatingsView />
      </MainLayout>
    </ProtectedRoute>
  );
}
