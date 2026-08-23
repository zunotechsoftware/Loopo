'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MessagesView from '@/components/views/MessagesView';

export default function ChatsPage() {
  return (
    <MainLayout>
      <MessagesView />
    </MainLayout>
  );
}
