'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import SettingsView from '@/components/views/SettingsView';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <SettingsView />
      </MainLayout>
    </ProtectedRoute>
  );
}
