'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Divider, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Alert
} from '@mui/material';
import { Send, Add, Close, Notifications } from '@mui/icons-material';
import { Notification } from '@/types';

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'System Maintenance Notice', body: 'Scheduled maintenance on July 20th 2am-4am UTC.', type: 'All', sentAt: '2026-07-18 09:00', status: 'Sent' },
  { id: 'n2', title: 'New Feature: Flash Deals', body: 'Vendors can now create flash deals from their dashboard!', type: 'Vendors', sentAt: '2026-07-15 14:30', status: 'Sent' },
  { id: 'n3', title: 'Weekend Sale Reminder', body: 'Don\'t forget — major sale starts tomorrow!', type: 'Buyers', sentAt: '', status: 'Draft' },
];

const statusColor: Record<string, 'success' | 'warning' | 'info'> = {
  Sent: 'success', Draft: 'warning', Scheduled: 'info',
};

export default function NotificationsPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [newNotif, setNewNotif] = useState({ title: '', body: '', type: 'All' });
  const [success, setSuccess] = useState(false);

  const handleSend = () => {
    // Call notificationsService.send(newNotif) in production
    setOpenDialog(false);
    setSuccess(true);
    setNewNotif({ title: '', body: '', type: 'All' });
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
        <Button variant="contained" startIcon={<Send />} onClick={() => setOpenDialog(true)}>
          Send Notification
        </Button>
      </Box>

      {success && <Alert severity="success">Notification sent successfully!</Alert>}

      {/* Stats */}
      <Grid container spacing={2}>
        {[
          { label: 'Total Sent', value: '247', color: 'primary.light' },
          { label: 'To All Users', value: '45', color: '#d1fae5' },
          { label: 'To Vendors', value: '128', color: '#ede9fe' },
          { label: 'To Buyers', value: '74', color: '#fef3c7' },
        ].map((stat, idx) => (
          <Grid size={{ xs: 6, md: 3 }} key={idx}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Notification History */}
      <Card>
        <CardContent sx={{ pb: '16px !important' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>Notification History</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Audience</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sent At</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_NOTIFICATIONS.map(notif => (
                  <TableRow key={notif.id} hover>
                    <TableCell sx={{ fontWeight: 'medium' }}>{notif.title}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap>{notif.body}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={notif.type} size="small" variant="outlined" color={notif.type === 'All' ? 'primary' : notif.type === 'Vendors' ? 'secondary' : 'default'} />
                    </TableCell>
                    <TableCell>{notif.sentAt || '—'}</TableCell>
                    <TableCell>
                      <Chip label={notif.status} size="small" color={statusColor[notif.status]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Send Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Notifications color="primary" />
            Send Notification
          </Box>
          <IconButton onClick={() => setOpenDialog(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          <TextField
            label="Notification Title"
            fullWidth required
            value={newNotif.title}
            onChange={(e) => setNewNotif(prev => ({ ...prev, title: e.target.value }))}
          />
          <TextField
            label="Message Body"
            fullWidth required
            multiline rows={4}
            value={newNotif.body}
            onChange={(e) => setNewNotif(prev => ({ ...prev, body: e.target.value }))}
          />
          <FormControl fullWidth>
            <InputLabel>Target Audience</InputLabel>
            <Select
              value={newNotif.type}
              label="Target Audience"
              onChange={(e) => setNewNotif(prev => ({ ...prev, type: e.target.value }))}
            >
              <MenuItem value="All">All Users</MenuItem>
              <MenuItem value="Vendors">Vendors Only</MenuItem>
              <MenuItem value="Buyers">Buyers Only</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleSend} variant="contained" startIcon={<Send />} disabled={!newNotif.title || !newNotif.body}>
            Send Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
