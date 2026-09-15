import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';

// Real NotificationType enum values (Prisma schema) - the dialog used to
// have no way to set this at all, so every notification silently landed on
// the DTO's default (PROMOTION) regardless of what it actually announced.
const NOTIFICATION_TYPES = [
  { value: 'PROMOTION', label: 'Promotion' },
  { value: 'ORDER_UPDATE', label: 'Order Update' },
  { value: 'ENGAGEMENT', label: 'Engagement' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'CART_REMINDER', label: 'Cart Reminder' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'ONBOARDING', label: 'Onboarding' },
];

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (notif: { title: string; body: string; type: string; category: string }) => void;
  notification?: any;
}

export default function NotificationDialog({ open, onClose, onSubmit, notification }: NotificationDialogProps) {
  const [newNotif, setNewNotif] = useState({ title: '', body: '', type: 'All', category: 'PROMOTION' });

  useEffect(() => {
    if (notification) {
      setNewNotif({
        title: notification.title || '',
        body: notification.message || '',
        type: notification.audience || 'All',
        category: notification.type || 'PROMOTION',
      });
    } else {
      setNewNotif({ title: '', body: '', type: 'All', category: 'PROMOTION' });
    }
  }, [notification, open]);

  const handleSubmitAction = () => {
    onSubmit(newNotif);
    setNewNotif({ title: '', body: '', type: 'All', category: 'PROMOTION' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon color="primary" />
          {notification ? 'Edit Notification' : 'Send Notification'}
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
        <TextField
          label="Notification Title"
          fullWidth
          required
          value={newNotif.title}
          onChange={(e) => setNewNotif((prev) => ({ ...prev, title: e.target.value }))}
        />
        <TextField
          label="Message Body"
          fullWidth
          required
          multiline
          rows={4}
          value={newNotif.body}
          onChange={(e) => setNewNotif((prev) => ({ ...prev, body: e.target.value }))}
        />
        <FormControl fullWidth>
          <InputLabel id="notification-category-label">Notification Type</InputLabel>
          <Select
            labelId="notification-category-label"
            value={newNotif.category}
            label="Notification Type"
            onChange={(e) => setNewNotif((prev) => ({ ...prev, category: e.target.value }))}
          >
            {NOTIFICATION_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="target-audience-label">Target Audience</InputLabel>
          <Select
            labelId="target-audience-label"
            value={newNotif.type}
            label="Target Audience"
            onChange={(e) => setNewNotif((prev) => ({ ...prev, type: e.target.value }))}
          >
            <MenuItem value="All">All Users</MenuItem>
            <MenuItem value="Segmented Users">Segmented Users</MenuItem>
            <MenuItem value="Buyers">Buyers Only</MenuItem>
            <MenuItem value="Sellers">Sellers Only</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmitAction}
          variant="contained"
          startIcon={notification ? <SaveIcon /> : <SendIcon />}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          disabled={!newNotif.title || !newNotif.body}
        >
          {notification ? 'Save Changes' : 'Send Now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
