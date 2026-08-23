'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Paper,
  InputAdornment,
  CircularProgress,
  Popover,
} from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { chatService } from '@/services/chat.service';
import { useChatSocket } from '@/hooks/useChatSocket';

interface ChatAreaProps {
  conversation: any | null;
  onConversationCreated?: (newConv: any) => void;
}

export default function ChatArea({ conversation, onConversationCreated }: ChatAreaProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (convId: string) => {
    try {
      setLoading(true);
      const res = await chatService.getMessages(convId);
      const list = res.data?.data || res.data || [];
      setMessages(Array.isArray(list) ? list.reverse() : []); // Reverse to show oldest first if API returns newest first
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleReceiveMessage = useCallback((message: any) => {
    if (message.conversationId === conversation?.id) {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    }
  }, [conversation?.id]);

  const handleMessageEdited = useCallback((data: { conversationId: string; message: any }) => {
    if (data.conversationId === conversation?.id) {
      setMessages((prev) => prev.map((m) => m.id === data.message.id ? data.message : m));
    }
  }, [conversation?.id]);

  const handleMessageDeleted = useCallback((data: { conversationId: string; messageId: string }) => {
    if (data.conversationId === conversation?.id) {
      setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
    }
  }, [conversation?.id]);

  const handleMessageReaction = useCallback((data: { conversationId: string; messageId: string; userId: string; emoji: string; action: 'added' | 'removed' }) => {
    if (data.conversationId === conversation?.id) {
      setMessages((prev) => prev.map((m) => {
        if (m.id === data.messageId) {
          const reactions = m.reactions || [];
          if (data.action === 'added') {
            return { ...m, reactions: [...reactions, { emoji: data.emoji, userId: data.userId }] };
          } else {
            return { ...m, reactions: reactions.filter((r: any) => !(r.emoji === data.emoji && r.userId === data.userId)) };
          }
        }
        return m;
      }));
    }
  }, [conversation?.id]);

  const { joinConversation, leaveConversation, markMessageRead } = useChatSocket({
    onReceiveMessage: handleReceiveMessage,
    onMessageEdited: handleMessageEdited,
    onMessageDeleted: handleMessageDeleted,
    onMessageReaction: handleMessageReaction,
  });

  useEffect(() => {
    if (conversation?.id) {
      fetchMessages(conversation.id);
      joinConversation(conversation.id);
      return () => {
        leaveConversation(conversation.id);
      };
    } else {
      setMessages([]);
    }
  }, [conversation?.id, joinConversation, leaveConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    let targetConvId = conversation?.id;

    try {
      // If there is no conversation ID, we must create one first
      if (!targetConvId && conversation?.isUserOnly) {
        const recipient = getRecipientUser(conversation);
        const resConv = await chatService.createConversation({ participantId: recipient.id });
        const newConv = resConv.data?.data || resConv.data;
        targetConvId = newConv.id;
        
        if (onConversationCreated) {
          onConversationCreated(newConv);
        }
      }

      if (!targetConvId) return;

      let attachments: any[] = [];
      if (selectedFile) {
        try {
          // Get presigned URL from backend
          const uploadRes = await chatService.getUploadUrl({
            fileName: selectedFile.name,
            fileType: selectedFile.type,
          });
          
          const { uploadUrl, fileUrl } = uploadRes.data.data;

          // Upload file directly to S3
          await fetch(uploadUrl, {
            method: 'PUT',
            body: selectedFile,
            headers: {
              'Content-Type': selectedFile.type,
            },
          });

          attachments = [{ originalUrl: fileUrl, mimeType: selectedFile.type, fileSize: selectedFile.size }];
        } catch (uploadErr) {
          console.error('Failed to upload file to S3', uploadErr);
          return; // Stop sending if upload fails
        }
      }

      if (!newMessage.trim() && !selectedFile) return;

      const payload = {
        conversationId: targetConvId,
        content: newMessage,
        type: selectedFile ? (selectedFile.type.startsWith('image/') ? 'IMAGE' : 'FILE') : 'TEXT',
        attachments: attachments.length ? attachments : undefined,
      };
      const res = await chatService.sendMessage(payload);
      // Socket might broadcast it back to us, but we can optimistically append
      setNewMessage('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'grey.50' }}>
        <Typography variant="body1" color="text.secondary">Select a conversation to start messaging</Typography>
      </Box>
    );
  }

  const getRecipientUser = (conv: any) => {
    const recipient = conv.participants?.length > 1 ? conv.participants[1].user : conv.participants?.[0]?.user;
    return recipient || {};
  };

  const recipient = getRecipientUser(conversation);
  const displayName = `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || recipient.email || 'Unknown User';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#F8F9FA' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Avatar src={recipient.profileImage} sx={{ mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {displayName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {recipient.email}
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          messages.map((msg: any) => {
            const isSentByMe = msg.senderId !== recipient.id; // Basic check
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isSentByMe ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: isSentByMe ? 'primary.main' : 'background.paper',
                    color: isSentByMe ? 'primary.contrastText' : 'text.primary',
                    borderRadius: isSentByMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                    border: isSentByMe ? 'none' : '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {msg.replyTo && (
                    <Box sx={{ pl: 1, borderLeft: '3px solid', borderColor: isSentByMe ? 'primary.light' : 'grey.300', mb: 1, opacity: 0.8 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Replying to message</Typography>
                      <Typography variant="body2" noWrap sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>{msg.replyTo.content}</Typography>
                    </Box>
                  )}
                  {msg.attachments?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: msg.content ? 1 : 0 }}>
                      {msg.attachments.map((att: any) => (
                        <Box key={att.id} component="img" src={att.originalUrl} sx={{ maxWidth: '100%', borderRadius: 1, maxHeight: 200, objectFit: 'contain' }} />
                      ))}
                    </Box>
                  )}
                  {msg.content && <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>}
                  {msg.reactions?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                      {Array.from(new Set(msg.reactions.map((r: any) => r.emoji))).map((emoji: any) => {
                        const count = msg.reactions.filter((r: any) => r.emoji === emoji).length;
                        return (
                          <Box key={emoji} sx={{ bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2, px: 0.8, py: 0.2, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => chatService.reactToMessage(msg.id, emoji)}>
                            <span>{emoji}</span><span>{count}</span>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Paper>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                    {msg.isEdited && ' • Edited'}
                  </Typography>
                  {isSentByMe && (
                    <DoneAllIcon sx={{ fontSize: '0.9rem', color: msg.readAt ? 'primary.main' : 'text.disabled' }} />
                  )}
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        {selectedFile && (
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, width: 'fit-content' }}>
            <Typography variant="caption" noWrap sx={{ maxWidth: 200 }}>{selectedFile.name}</Typography>
            <IconButton size="small" onClick={() => setSelectedFile(null)}><DeleteOutlineIcon fontSize="small" /></IconButton>
          </Box>
        )}
        <TextField
          fullWidth
          placeholder="Type a message..."
          variant="outlined"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={!conversation.id && !conversation.isUserOnly}
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
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                <IconButton edge="start" onClick={() => fileInputRef.current?.click()}><AttachFileIcon /></IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={(e) => setEmojiAnchorEl(e.currentTarget)}>
                  <SentimentSatisfiedAltIcon />
                </IconButton>
                <Popover
                  open={Boolean(emojiAnchorEl)}
                  anchorEl={emojiAnchorEl}
                  onClose={() => setEmojiAnchorEl(null)}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                  <EmojiPicker
                    onEmojiClick={(emojiData) => setNewMessage((prev) => prev + emojiData.emoji)}
                  />
                </Popover>
                <IconButton 
                  color="primary" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && !selectedFile}
                  sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, ml: 1, '&.Mui-disabled': { bgcolor: 'grey.300' } }}
                >
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
