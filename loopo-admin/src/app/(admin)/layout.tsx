import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import AuthGuard from '@/components/AuthGuard';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AuthGuard>
  );
}
