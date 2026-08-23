'use client';

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BlockIcon from '@mui/icons-material/Block';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

interface ConversationDetailsProps {
  conversation: any | null;
}

export default function ConversationDetails({ conversation }: ConversationDetailsProps) {
  if (!conversation) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'background.paper', borderLeft: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">No details</Typography>
      </Box>
    );
  }

  const getRecipientUser = (conv: any) => {
    const recipient = conv.participants?.length > 1 ? conv.participants[1].user : conv.participants?.[0]?.user;
    return recipient || {};
  };

  const user = getRecipientUser(conversation);
  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User';

  return (
    <Box sx={{ height: '100%', bgcolor: 'background.paper', borderLeft: 1, borderColor: 'divider', overflowY: 'auto' }}>
      {/* User Details */}
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
          User Details
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar src={user.profileImage} sx={{ width: 48, height: 48 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{displayName}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">User ID</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{user.id ? user.id.slice(0, 8) + '...' : 'N/A'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Phone</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{user.phone || 'N/A'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Joined</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          endIcon={<OpenInNewIcon fontSize="small" />}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
        >
          View Profile
        </Button>
      </Box>

      <Divider />

      {/* Conversation Info */}
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
          Conversation Info
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {conversation.product && (
             <>
               <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                 <Typography variant="body2" color="text.secondary">Product</Typography>
                 <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{conversation.product.title}</Typography>
               </Box>
             </>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}>
              {conversation.status?.toLowerCase() || 'Active'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Last Message</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium', textAlign: 'right' }}>
              {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleString() : 'N/A'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Quick Actions */}
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Quick Actions
        </Typography>
        <List sx={{ p: 0 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <Button startIcon={<StorefrontIcon />} sx={{ textTransform: 'none', color: 'text.primary', justifyContent: 'flex-start', width: '100%', px: 1, '&:hover': { bgcolor: 'action.hover' } }}>
              View Listing
            </Button>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <Button startIcon={<ReceiptIcon />} sx={{ textTransform: 'none', color: 'text.primary', justifyContent: 'flex-start', width: '100%', px: 1, '&:hover': { bgcolor: 'action.hover' } }}>
              View Order
            </Button>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <Button startIcon={<BlockIcon />} sx={{ textTransform: 'none', color: 'error.main', justifyContent: 'flex-start', width: '100%', px: 1, '&:hover': { bgcolor: 'error.lighter' } }}>
              Block User
            </Button>
          </ListItem>
          <ListItem disablePadding>
            <Button startIcon={<ReportProblemIcon />} sx={{ textTransform: 'none', color: 'warning.main', justifyContent: 'flex-start', width: '100%', px: 1, '&:hover': { bgcolor: 'warning.lighter' } }}>
              Report User
            </Button>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}
