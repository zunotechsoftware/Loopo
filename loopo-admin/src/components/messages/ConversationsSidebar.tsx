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
import { mockConversations, Conversation } from './mockData';

interface ConversationsSidebarProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export default function ConversationsSidebar({
  onSelectConversation,
  selectedConversationId,
}: ConversationsSidebarProps) {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: 1, borderColor: 'divider' }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            Conversations
          </Typography>
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: '12px', px: 1, py: 0.5, typography: 'caption', fontWeight: 'bold' }}>
            24
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Search conversations..."
            variant="outlined"
            size="small"
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
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="conversation tabs" sx={{ px: 2 }}>
          <Tab label="All" sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: 'auto', mr: 2 }} />
          <Tab label="Unread" sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: 'auto', mr: 2 }} />
          <Tab label="Starred" sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: 'auto' }} />
        </Tabs>
      </Box>

      <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
        {mockConversations.map((conv, index) => (
          <React.Fragment key={conv.id}>
            <ListItem
              alignItems="flex-start"
              onClick={() => onSelectConversation(conv)}
              sx={{
                cursor: 'pointer',
                bgcolor: selectedConversationId === conv.id ? 'action.selected' : 'inherit',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  color="success"
                  invisible={!conv.user.isOnline}
                >
                  <Avatar alt={conv.user.name} src={conv.user.avatar} />
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      {conv.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {conv.lastMessageTime}
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
                        fontWeight: conv.unreadCount > 0 ? 'bold' : 'normal',
                      }}
                    >
                      {conv.lastMessage}
                    </Typography>
                    {conv.unreadCount > 0 && (
                      <Badge badgeContent={conv.unreadCount} color="primary" sx={{ ml: 1, '& .MuiBadge-badge': { fontSize: '0.65rem', height: 18, minWidth: 18 } }} />
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < mockConversations.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
      
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="button" color="primary" sx={{ cursor: 'pointer', textTransform: 'none', fontWeight: 'bold' }}>
          Load more conversations
        </Typography>
      </Box>
    </Box>
  );
}
