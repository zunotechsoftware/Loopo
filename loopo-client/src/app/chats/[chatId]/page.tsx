'use client';

import React, { use, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import MessagesView from '@/components/views/MessagesView';
import { useAppDispatch } from '@/redux/hooks';
import { setActiveConversation } from '@/redux/slices/chatSlice';

interface PageProps {
  params: Promise<{ chatId: string }>;
}

export default function ChatDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const chatId = resolvedParams.chatId;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (chatId) {
      dispatch(setActiveConversation(chatId));
    }
  }, [chatId, dispatch]);

  return (
    <ProtectedRoute>
      <MainLayout>
        <MessagesView />
      </MainLayout>
    </ProtectedRoute>
  );
}
