'use client';

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Divider,
  Paper,
  InputAdornment,
  ImageList,
  ImageListItem,
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Conversation } from './mockData';

interface ChatAreaProps {
  conversation: Conversation | null;
}

export default function ChatArea({ conversation }: ChatAreaProps) {
  if (!conversation) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'grey.50' }}>
        <Typography variant="body1" color="text.secondary">Select a conversation to start messaging</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#F8F9FA' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Avatar src={conversation.user.avatar} sx={{ mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {conversation.user.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', display: 'inline-block' }} />
            {conversation.user.isOnline ? 'Online' : 'Offline'}
          </Typography>
        </Box>
        <Box>
          <IconButton size="small"><StarBorderIcon /></IconButton>
          <IconButton size="small"><DeleteOutlineIcon /></IconButton>
          <IconButton size="small"><MoreHorizIcon /></IconButton>
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="caption" align="center" color="text.secondary" sx={{ mb: 2 }}>
          Today
        </Typography>

        {conversation.messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.isSentByMe ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.images && msg.images.length > 0 && (
               <Paper
                 elevation={0}
                 sx={{
                   p: 1,
                   mb: 1,
                   bgcolor: msg.isSentByMe ? 'primary.main' : 'background.paper',
                   borderRadius: msg.isSentByMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                 }}
               >
                 <ImageList sx={{ m: 0, overflow: 'hidden', borderRadius: 1 }} cols={msg.images.length} gap={4}>
                    {msg.images.map((img, index) => (
                      <ImageListItem key={index} sx={{ width: 80, height: 80 }}>
                        <img src={img} alt="attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </ImageListItem>
                    ))}
                 </ImageList>
               </Paper>
            )}
            
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                maxWidth: '70%',
                bgcolor: msg.isSentByMe ? 'primary.main' : 'background.paper',
                color: msg.isSentByMe ? 'primary.contrastText' : 'text.primary',
                borderRadius: msg.isSentByMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                border: msg.isSentByMe ? 'none' : '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2">{msg.text}</Typography>
            </Paper>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {msg.timestamp}
              </Typography>
              {msg.isSentByMe && (
                <DoneAllIcon sx={{ fontSize: '0.9rem', color: msg.status === 'read' ? 'primary.main' : 'text.disabled' }} />
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          placeholder="Type a message..."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              bgcolor: 'grey.50',
              pr: 1
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton edge="start"><AttachFileIcon /></IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton><SentimentSatisfiedAltIcon /></IconButton>
                <IconButton color="primary" sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, ml: 1 }}>
                  <SendIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
    </Box>
  );
}
