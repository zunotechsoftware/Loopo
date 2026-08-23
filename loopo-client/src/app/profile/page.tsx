'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import ProfileView from '@/components/views/ProfileView';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ProfileView />
      </MainLayout>
    </ProtectedRoute>
  );
}
