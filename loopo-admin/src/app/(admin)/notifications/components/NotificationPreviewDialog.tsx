import React from 'react';
import { Dialog, DialogContent, Box, Typography, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface NotificationPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  notification: any;
}

export default function NotificationPreviewDialog({ open, onClose, notification }: NotificationPreviewDialogProps) {
  if (!notification) return null;

  // Format current date nicely for phone screen
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', overflow: 'visible', display: 'flex', justifyContent: 'center' }}>
        {/* Close Button on top of phone */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: -50,
            right: 0,
            color: 'white',
            bgcolor: 'rgba(15, 23, 42, 0.6)',
            '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.8)' },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Outer Phone Bezel */}
        <Box
          sx={{
            width: 320,
            height: 640,
            bgcolor: '#1e293b',
            borderRadius: '40px',
            p: 1.5,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px #475569',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Speaker / Camera Notch */}
          <Box
            sx={{
              position: 'absolute',
              top: 18,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 110,
              height: 25,
              bgcolor: '#1e293b',
              borderRadius: '0 0 16px 16px',
              zIndex: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Camera dot */}
            <Box sx={{ width: 6, height: 6, bgcolor: '#0f172a', borderRadius: '50%', mr: 1 }} />
            {/* Speaker line */}
            <Box sx={{ width: 40, height: 3, bgcolor: '#334155', borderRadius: 2 }} />
          </Box>

          {/* Screen Content (Wallpaper) */}
          <Box
            sx={{
              flex: 1,
              width: '100%',
              borderRadius: '28px',
              overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: 7,
              px: 2.5,
            }}
          >
            {/* Phone Lock Status */}
            <Box sx={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              🔒 Locked
            </Box>

            {/* Time */}
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'white', letterSpacing: -1, lineHeight: 1 }}>
              09:41
            </Typography>

            {/* Date */}
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, mt: 1, mb: 4 }}>
              {formattedDate}
            </Typography>

            {/* Glassmorphism Notification Banner */}
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(25px)',
                webkitBackdropFilter: 'blur(25px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                p: 2,
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                display: 'flex',
                gap: 1.5,
                animation: 'slideDown 0.5s ease-out',
                '@keyframes slideDown': {
                  '0%': { transform: 'translateY(-20px)', opacity: 0 },
                  '100%': { transform: 'translateY(0)', opacity: 1 },
                },
              }}
            >
              {/* App Icon */}
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
                  flexShrink: 0,
                }}
              >
                <NotificationsActiveIcon fontSize="small" />
              </Box>

              {/* Notification Details */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'white', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                    Loopo
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.65rem' }}>
                    now
                  </Typography>
                </Box>
                {/* Title */}
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'white', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                  {notification.title}
                </Typography>
                {/* Body */}
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {notification.message}
                </Typography>
              </Box>
            </Paper>

            {/* Bottom Swipe Bar */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                width: 120,
                height: 5,
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: 2,
              }}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
