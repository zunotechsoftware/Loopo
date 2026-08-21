'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Breadcrumbs, Link, Grid2 } from '@mui/material';
import ConversationsSidebar from '@/components/messages/ConversationsSidebar';
import ChatArea from '@/components/messages/ChatArea';
import ConversationDetails from '@/components/messages/ConversationDetails';
import { mockConversations, Conversation } from '@/components/messages/mockData';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Auto-select first conversation
  useEffect(() => {
    if (mockConversations.length > 0 && !selectedConversation) {
      setSelectedConversation(mockConversations[0]);
    }
  }, [selectedConversation]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          Messages
        </Typography>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Messages</Typography>
          <Typography color="text.secondary">All Messages</Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Content Area - Grid */}
      <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider', display: 'flex' }}>
        <Grid2 container sx={{ flexGrow: 1 }}>
          
          {/* Left: Conversations List */}
          <Grid2 size={{ xs: 12, md: 4, lg: 3 }} sx={{ height: '100%', borderRight: 1, borderColor: 'divider' }}>
            <ConversationsSidebar
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </Grid2>
          
          {/* Middle: Chat Area */}
          <Grid2 size={{ xs: 12, md: 8, lg: 6 }} sx={{ height: '100%' }}>
            <ChatArea conversation={selectedConversation} />
          </Grid2>
          
          {/* Right: User Details */}
          <Grid2 size={{ xs: 0, lg: 3 }} sx={{ height: '100%', display: { xs: 'none', lg: 'block' } }}>
            <ConversationDetails conversation={selectedConversation} />
          </Grid2>

        </Grid2>
      </Box>
    </Box>
  );
}
