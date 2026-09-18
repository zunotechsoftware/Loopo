import React, { useState, useEffect, useRef } from 'react';
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
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { usersService } from '@/services/admin.service';

interface UserOption {
  id: string;
  label: string;
}

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
  onSubmit: (notif: { title: string; body: string; type: string; category: string; targetUserIds?: string[] }) => void;
  notification?: any;
}

export default function NotificationDialog({ open, onClose, onSubmit, notification }: NotificationDialogProps) {
  const [newNotif, setNewNotif] = useState({ title: '', body: '', type: 'All', category: 'PROMOTION' });
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setSelectedUsers([]);
    setUserSearch('');
  }, [notification, open]);

  // Debounced search against the real user directory - only fetched while
  // "Segmented Users" is selected, since that's the only audience that
  // needs it.
  useEffect(() => {
    if (newNotif.type !== 'Segmented Users') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSearchingUsers(true);
        const res = await usersService.getAll({ search: userSearch, take: 20 });
        const users = res.data?.data?.data || res.data?.data || [];
        setUserOptions(
          users.map((u: any) => ({
            id: u.id,
            label: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || u.id,
          })),
        );
      } catch (err) {
        console.error('Failed to search users', err);
      } finally {
        setSearchingUsers(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [userSearch, newNotif.type]);

  const handleSubmitAction = () => {
    onSubmit({
      ...newNotif,
      targetUserIds: newNotif.type === 'Segmented Users' ? selectedUsers.map((u) => u.id) : undefined,
    });
    setNewNotif({ title: '', body: '', type: 'All', category: 'PROMOTION' });
    setSelectedUsers([]);
    onClose();
  };

  const isSegmented = newNotif.type === 'Segmented Users';
  const canSubmit = Boolean(newNotif.title && newNotif.body && (!isSegmented || selectedUsers.length > 0));

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
        {isSegmented && (
          <Autocomplete
            multiple
            options={userOptions}
            value={selectedUsers}
            loading={searchingUsers}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, value) => setSelectedUsers(value)}
            onInputChange={(_, value) => setUserSearch(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select recipients"
                placeholder="Search users by name or email..."
                helperText={selectedUsers.length === 0 ? 'Pick at least one user to send to' : `${selectedUsers.length} recipient(s) selected`}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchingUsers ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        )}
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
          disabled={!canSubmit}
        >
          {notification ? 'Save Changes' : 'Send Now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
