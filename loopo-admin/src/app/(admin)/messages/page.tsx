'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Breadcrumbs, Link, Grid2, CircularProgress } from '@mui/material';
import ConversationsSidebar from '@/components/messages/ConversationsSidebar';
import ChatArea from '@/components/messages/ChatArea';
import ConversationDetails from '@/components/messages/ConversationDetails';
import { chatService } from '@/services/chat.service';
import { usersService } from '@/services/admin.service';
import { useChatSocket } from '@/hooks/useChatSocket';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial conversations and users
  const fetchData = async () => {
    try {
      setLoading(true);
      const [convRes, userRes] = await Promise.all([
        chatService.getConversations(),
        usersService.getAll({ take: 50 })
      ]);
      const convList = convRes.data?.data || convRes.data || [];
      const userList = userRes.data?.data?.data || userRes.data?.data || [];
      
      setConversations(Array.isArray(convList) ? convList : []);
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-select first item
  useEffect(() => {
    if (!selectedConversation) {
      if (conversations.length > 0) {
        handleSelectConversation(conversations[0]);
      } else if (users.length > 0) {
        // Create a mock conversation object for a user
        handleSelectConversation({
          id: null,
          isUserOnly: true,
          participants: [{ user: users[0] }]
        });
      }
    }
  }, [conversations, users, selectedConversation]);

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
  };

  const handleConversationUpdated = useCallback((updatedConv: any) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedConv.id);
      if (idx !== -1) {
        const newConvs = [...prev];
        newConvs[idx] = { ...newConvs[idx], ...updatedConv };
        return newConvs;
      }
      return [updatedConv, ...prev];
    });
    
    // Update selected if it's the current one
    setSelectedConversation((prev: any) => {
      if (prev && prev.id === updatedConv.id) {
        return { ...prev, ...updatedConv };
      }
      return prev;
    });
  }, []);

  const handleConversationCreated = useCallback((newConv: any) => {
    setConversations((prev) => {
      // Check if it already exists
      if (prev.find(c => c.id === newConv.id)) return prev;
      return [newConv, ...prev];
    });
    setSelectedConversation(newConv);
  }, []);

  useChatSocket({
    onConversationUpdated: handleConversationUpdated,
  });

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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
              <ConversationsSidebar
                conversations={conversations}
                users={users}
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.id || selectedConversation?.participants?.[0]?.user?.id}
              />
            )}
          </Grid2>
          
          {/* Middle: Chat Area */}
          <Grid2 size={{ xs: 12, md: 8, lg: 6 }} sx={{ height: '100%' }}>
            <ChatArea 
              conversation={selectedConversation} 
              onConversationCreated={handleConversationCreated} 
            />
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
