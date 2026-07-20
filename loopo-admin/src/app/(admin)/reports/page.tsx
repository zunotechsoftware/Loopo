'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Button, TextField, InputAdornment, Menu, MenuItem
} from '@mui/material';
import {
  Search, MoreVert, AssignmentInd, CheckCircle,
  Cancel, Warning, Visibility
} from '@mui/icons-material';
import { Report } from '@/types';

const MOCK_REPORTS: Report[] = [
  { id: '1', type: 'Product', targetId: 'p1', targetTitle: 'Fake iPhone 15', reason: 'Counterfeit', description: 'This product is a counterfeit', reportedBy: 'John Doe', status: 'Open', createdAt: '2026-07-18' },
  { id: '2', type: 'User', targetId: 'u2', targetTitle: 'BadSeller99', reason: 'Scam', description: 'User attempted to scam me', reportedBy: 'Alice Brown', status: 'Assigned', assignedTo: 'Admin A', createdAt: '2026-07-17' },
  { id: '3', type: 'Review', targetId: 'r3', targetTitle: 'Review for Laptop X', reason: 'Fake review', description: 'Clearly fake 5 star review', reportedBy: 'Jane Smith', status: 'Resolved', createdAt: '2026-07-15', resolvedAt: '2026-07-16' },
  { id: '4', type: 'Product', targetId: 'p4', targetTitle: 'Illegal Chemical', reason: 'Prohibited item', description: 'This item is not allowed on the platform', reportedBy: 'Bob Wilson', status: 'Escalated', createdAt: '2026-07-19' },
  { id: '5', type: 'User', targetId: 'u5', targetTitle: 'SpamVendor', reason: 'Spam', description: 'Sending spam messages', reportedBy: 'Charlie Davis', status: 'Rejected', createdAt: '2026-07-10' },
];

const statusColor: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  Open: 'warning', Assigned: 'info', Resolved: 'success', Rejected: 'default', Escalated: 'error',
};

const typeColor: Record<string, 'default' | 'primary' | 'secondary' | 'error'> = {
  Product: 'primary', User: 'secondary', Review: 'default',
};

export default function ReportsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const tabs = ['All', 'Open', 'Assigned', 'Escalated', 'Resolved'];

  let filtered = MOCK_REPORTS.filter(r =>
    r.targetTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (tabValue > 0) {
    filtered = filtered.filter(r => r.status === tabs[tabValue]);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Reports & Moderation</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip icon={<Warning />} label={`${MOCK_REPORTS.filter(r => r.status === 'Open').length} Open`} color="warning" />
          <Chip icon={<Warning />} label={`${MOCK_REPORTS.filter(r => r.status === 'Escalated').length} Escalated`} color="error" />
        </Box>
      </Box>

      <Card sx={{ pt: 2, px: 2, pb: 0 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          {tabs.map(t => <Tab key={t} label={t} />)}
        </Tabs>

        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search reports..."
            size="small"
            sx={{ width: 400 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{ input: { 
              startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>
             } }}
          />
        </Box>

        <TableContainer sx={{ pb: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Target</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reported By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(report => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    <Chip label={report.type} size="small" color={typeColor[report.type]} variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{report.targetTitle}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>{report.reportedBy}</TableCell>
                  <TableCell>
                    <Chip label={report.status} size="small" color={statusColor[report.status]} />
                  </TableCell>
                  <TableCell>{report.createdAt}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, report.id)}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose}><Visibility fontSize="small" sx={{ mr: 1 }} color="info" />View Details</MenuItem>
          <MenuItem onClick={handleMenuClose}><AssignmentInd fontSize="small" sx={{ mr: 1 }} color="primary" />Assign</MenuItem>
          <MenuItem onClick={handleMenuClose}><CheckCircle fontSize="small" sx={{ mr: 1 }} color="success" />Resolve</MenuItem>
          <MenuItem onClick={handleMenuClose}><Warning fontSize="small" sx={{ mr: 1 }} color="warning" />Escalate</MenuItem>
          <MenuItem onClick={handleMenuClose}><Cancel fontSize="small" sx={{ mr: 1 }} color="error" />Reject</MenuItem>
        </Menu>
      </Card>
    </Box>
  );
}
