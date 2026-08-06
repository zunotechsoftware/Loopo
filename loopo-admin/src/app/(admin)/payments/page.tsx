'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, InputAdornment, Button
} from '@mui/material';
import {
  Search, AttachMoney, TrendingUp, CreditCard, AssignmentReturn
} from '@mui/icons-material';
import { Transaction, Subscription } from '@/types';

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', orderId: 'ORD-001', amount: 129.99, currency: 'USD', status: 'Success', gateway: 'Stripe', buyerName: 'John Doe', sellerName: 'TechGear', createdAt: '2026-07-19' },
  { id: 't2', orderId: 'ORD-002', amount: 49.99, currency: 'USD', status: 'Pending', gateway: 'PayPal', buyerName: 'Jane Smith', sellerName: 'FashionHub', createdAt: '2026-07-19' },
  { id: 't3', orderId: 'ORD-003', amount: 299.00, currency: 'USD', status: 'Refunded', gateway: 'Stripe', buyerName: 'Bob Wilson', sellerName: 'OfficePlus', createdAt: '2026-07-18' },
  { id: 't4', orderId: 'ORD-004', amount: 19.99, currency: 'USD', status: 'Failed', gateway: 'Stripe', buyerName: 'Alice Brown', sellerName: 'BookWorld', createdAt: '2026-07-17' },
];

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', userId: 'u1', userName: 'TechGear Store', planName: 'Pro Vendor', price: 49.99, billingCycle: 'Monthly', status: 'Active', startDate: '2026-07-01', endDate: '2026-07-31' },
  { id: 's2', userId: 'u2', userName: 'FashionHub', planName: 'Enterprise', price: 199.99, billingCycle: 'Yearly', status: 'Active', startDate: '2026-01-01', endDate: '2026-12-31' },
  { id: 's3', userId: 'u3', userName: 'OldStore', planName: 'Basic', price: 9.99, billingCycle: 'Monthly', status: 'Cancelled', startDate: '2026-06-01', endDate: '2026-06-30' },
];

const STATS = [
  { title: 'Total Revenue', value: '$124,500', icon: <AttachMoney color="primary" />, color: 'primary.light' },
  { title: 'Monthly Revenue', value: '$18,200', icon: <TrendingUp sx={{ color: 'success.main' }} />, color: '#d1fae5' },
  { title: 'Active Subscriptions', value: '342', icon: <CreditCard color="secondary" />, color: '#ede9fe' },
  { title: 'Pending Refunds', value: '7', icon: <AssignmentReturn color="warning" />, color: '#fef3c7' },
];

const txStatusColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  Success: 'success', Pending: 'warning', Failed: 'error', Refunded: 'default',
};

const subStatusColor: Record<string, 'success' | 'error' | 'warning'> = {
  Active: 'success', Cancelled: 'error', Expired: 'warning',
};

export default function PaymentsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Payments & Revenue</Typography>

      {/* Stats */}
      <Grid container spacing={3}>
        {STATS.map((stat, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: stat.color }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stat.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ pt: 2, px: 2, pb: 0 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tab label="Transactions" />
          <Tab label="Subscriptions" />
          <Tab label="Refunds" />
        </Tabs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            placeholder="Search..."
            size="small"
            sx={{ width: 350 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{ input: { 
              startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>
             } }}
          />
          <Button variant="outlined" size="small">Export CSV</Button>
        </Box>

        {tabValue === 0 && (
          <TableContainer sx={{ pb: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Buyer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Seller</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Gateway</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_TRANSACTIONS.map(tx => (
                  <TableRow key={tx.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>{tx.orderId}</TableCell>
                    <TableCell>{tx.buyerName}</TableCell>
                    <TableCell>{tx.sellerName}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>${tx.amount.toFixed(2)}</TableCell>
                    <TableCell>{tx.gateway}</TableCell>
                    <TableCell>
                      <Chip label={tx.status} size="small" color={txStatusColor[tx.status]} />
                    </TableCell>
                    <TableCell>{tx.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 1 && (
          <TableContainer sx={{ pb: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Vendor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cycle</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_SUBSCRIPTIONS.map(sub => (
                  <TableRow key={sub.id} hover>
                    <TableCell sx={{ fontWeight: 'medium' }}>{sub.userName}</TableCell>
                    <TableCell>{sub.planName}</TableCell>
                    <TableCell>${sub.price}/mo</TableCell>
                    <TableCell>{sub.billingCycle}</TableCell>
                    <TableCell>
                      <Chip label={sub.status} size="small" color={subStatusColor[sub.status]} />
                    </TableCell>
                    <TableCell>{sub.startDate}</TableCell>
                    <TableCell>{sub.endDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 2 && (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <AssignmentReturn sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
            <Typography variant="h6" gutterBottom>No Pending Refunds</Typography>
            <Typography variant="body2">All refund requests have been processed.</Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}
