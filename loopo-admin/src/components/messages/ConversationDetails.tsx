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
  ListItemText,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BlockIcon from '@mui/icons-material/Block';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { Conversation } from './mockData';

interface ConversationDetailsProps {
  conversation: Conversation | null;
}

export default function ConversationDetails({ conversation }: ConversationDetailsProps) {
  if (!conversation) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'background.paper', borderLeft: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">No details</Typography>
      </Box>
    );
  }

  const { user, orderInfo } = conversation;

  return (
    <Box sx={{ height: '100%', bgcolor: 'background.paper', borderLeft: 1, borderColor: 'divider', overflowY: 'auto' }}>
      {/* User Details */}
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
          User Details
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar src={user.avatar} sx={{ width: 48, height: 48 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{user.name}</Typography>
            <Typography variant="caption" sx={{ color: 'success.main' }}>{user.isOnline ? 'Online' : 'Offline'}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">User ID</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{user.id}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Phone</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{user.phone}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{user.email}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Member Since</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{user.memberSince}</Typography>
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
          {orderInfo && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Order ID</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{orderInfo.orderId}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Listing</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{orderInfo.listing}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{orderInfo.status}</Typography>
              </Box>
            </>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Messages</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{conversation.messages.length}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Last Message</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium', textAlign: 'right' }}>
              {conversation.lastMessageTime}
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
