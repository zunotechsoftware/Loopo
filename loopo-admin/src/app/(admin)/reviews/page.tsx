'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Rating,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, TextField, InputAdornment, Menu, MenuItem, Tabs, Tab
} from '@mui/material';
import { Search, MoreVert, Visibility, VisibilityOff, Delete } from '@mui/icons-material';
import { Review } from '@/types';

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', productId: 'p1', productTitle: 'Wireless Headphones', userId: 'u1', userName: 'John Doe', rating: 5, comment: 'Excellent sound quality! Best purchase ever.', status: 'Published', createdAt: '2026-07-18' },
  { id: 'r2', productId: 'p2', productTitle: 'Ergonomic Chair', userId: 'u2', userName: 'Jane Smith', rating: 3, comment: 'Good but delivery was slow.', status: 'Published', createdAt: '2026-07-17' },
  { id: 'r3', productId: 'p1', productTitle: 'Wireless Headphones', userId: 'u3', userName: 'Bob Wilson', rating: 1, comment: 'FAKE PRODUCT!!! DO NOT BUY', status: 'Flagged', createdAt: '2026-07-16' },
  { id: 'r4', productId: 'p3', productTitle: 'Running Shoes', userId: 'u4', userName: 'Alice Brown', rating: 4, comment: 'Very comfortable. Highly recommend.', status: 'Hidden', createdAt: '2026-07-15' },
];

const statusColor: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  Published: 'success', Flagged: 'error', Hidden: 'default',
};

export default function ReviewsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tabs = ['All', 'Published', 'Flagged', 'Hidden'];

  let filtered = MOCK_REVIEWS.filter(r =>
    r.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (tabValue > 0) filtered = filtered.filter(r => r.status === tabs[tabValue]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Reviews Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={`${MOCK_REVIEWS.filter(r => r.status === 'Flagged').length} Flagged`} color="error" />
        </Box>
      </Box>

      <Card sx={{ pt: 2, px: 2, pb: 0 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          {tabs.map(t => <Tab key={t} label={t} />)}
        </Tabs>
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search reviews..."
            size="small"
            sx={{ width: 400 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{ input: {  startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>  } }}
          />
        </Box>
        <TableContainer sx={{ pb: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reviewer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(review => (
                <TableRow key={review.id} hover>
                  <TableCell sx={{ fontWeight: 'medium' }}>{review.productTitle}</TableCell>
                  <TableCell>{review.userName}</TableCell>
                  <TableCell>
                    <Rating value={review.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 250 }}>
                    <Typography variant="body2" noWrap>{review.comment}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={review.status} size="small" color={statusColor[review.status]} />
                  </TableCell>
                  <TableCell>{review.createdAt}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedId(review.id); }}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => { setAnchorEl(null); setSelectedId(null); }}>
          <MenuItem onClick={() => setAnchorEl(null)}><Visibility fontSize="small" sx={{ mr: 1 }} color="success" />Publish</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}><VisibilityOff fontSize="small" sx={{ mr: 1 }} color="warning" />Hide</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}><Delete fontSize="small" sx={{ mr: 1 }} color="error" />Delete</MenuItem>
        </Menu>
      </Card>
    </Box>
  );
}
