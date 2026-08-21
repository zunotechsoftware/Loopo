'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  IconButton,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

interface ConversationsSidebarProps {
  conversations: any[];
  users?: any[];
  onSelectConversation: (conversation: any) => void;
  selectedConversationId?: string;
}

export default function ConversationsSidebar({
  conversations,
  users = [],
  onSelectConversation,
  selectedConversationId,
}: ConversationsSidebarProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const getRecipientUser = (conv: any) => {
    if (conv.isUserOnly) {
      return conv.participants[0].user;
    }
    const recipient = conv.participants?.length > 1 ? conv.participants[1].user : conv.participants?.[0]?.user;
    return recipient || {};
  };

  // When 'Users' tab is selected, we map users to mock conversations
  const itemsToList = tabIndex === 3 ? users.map(u => ({
    id: null,
    isUserOnly: true,
    participants: [{ user: u }],
    lastMessageAt: u.createdAt,
    lastMessage: { content: 'User Profile' }
  })) : conversations;

  const filteredItems = itemsToList.filter(item => {
    if (!searchTerm) return true;
    const recipient = getRecipientUser(item);
    const searchLower = searchTerm.toLowerCase();
    return (
      recipient?.firstName?.toLowerCase().includes(searchLower) ||
      recipient?.lastName?.toLowerCase().includes(searchLower) ||
      recipient?.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: 1, borderColor: 'divider' }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            Conversations
          </Typography>
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: '12px', px: 1, py: 0.5, typography: 'caption', fontWeight: 'bold' }}>
            {itemsToList.length}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Search..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: 'grey.50' }
            }}
          />
          <IconButton size="small" sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <FilterListIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" aria-label="conversation tabs" sx={{ px: 2 }}>
          <Tab label="All" sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: 'auto', mr: 1 }} />
          <Tab label="Unread" sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: 'auto', mr: 1 }} />
          <Tab label="Starred" sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: 'auto', mr: 1 }} />
          <Tab label="Users" sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: 'auto' }} />
        </Tabs>
      </Box>

      <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
        {filteredItems.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No items found.</Typography>
          </Box>
        ) : filteredItems.map((item, index) => {
          const recipient = getRecipientUser(item);
          const displayName = `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || recipient.email || 'Unknown User';
          // Use user ID if it's a mock conversation, else conversation ID
          const itemId = item.isUserOnly ? recipient.id : item.id;
          
          return (
            <React.Fragment key={itemId}>
              <ListItem
                alignItems="flex-start"
                onClick={() => onSelectConversation(item)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedConversationId === itemId ? 'action.selected' : 'inherit',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color="success"
                    invisible={true}
                  >
                    <Avatar alt={displayName} src={recipient.profileImage} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        {displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleDateString() : ''}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.lastMessage?.content || (item.isUserOnly ? 'Start a conversation' : 'No messages yet')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < filteredItems.length - 1 && <Divider component="li" />}
            </React.Fragment>
          );
        })}
      </List>
      
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="button" color="primary" sx={{ cursor: 'pointer', textTransform: 'none', fontWeight: 'bold' }}>
          Load more
        </Typography>
      </Box>
    </Box>
  );
}
