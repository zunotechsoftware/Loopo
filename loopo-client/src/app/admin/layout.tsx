'use client';

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

interface AdminRootLayoutProps {
  children: React.ReactNode;
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
