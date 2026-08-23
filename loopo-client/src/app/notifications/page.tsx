'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import NotificationsView from '@/components/views/NotificationsView';

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <NotificationsView />
      </MainLayout>
    </ProtectedRoute>
  );
}
