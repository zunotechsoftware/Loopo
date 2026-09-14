'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid2 as Grid, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, InputAdornment, Button, CircularProgress, Alert
} from '@mui/material';
import {
  Search, AttachMoney, TrendingUp, CreditCard, AssignmentReturn
} from '@mui/icons-material';
import { paymentsService, analyticsService } from '@/services/admin.service';

const paymentStatusColor: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  SUCCESS: 'success', PENDING: 'warning', PROCESSING: 'info', FAILED: 'error',
  CANCELLED: 'default', REFUNDED: 'default', PARTIALLY_REFUNDED: 'warning', EXPIRED: 'error',
};

const subStatusColor: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  ACTIVE: 'success', CANCELLED: 'error', EXPIRED: 'warning', PAST_DUE: 'error',
};

const refundStatusColor: Record<string, 'success' | 'warning' | 'error'> = {
  SUCCESS: 'success', PENDING: 'warning', FAILED: 'error',
};

function fullName(u: any) {
  if (!u) return 'Unknown';
  return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown';
}

function formatMoney(amount: number, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount || 0);
  } catch {
    return `${currency} ${(amount || 0).toFixed(2)}`;
  }
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Triggers a browser download of `rows` as a CSV file - real client-side
 * export from whatever's currently loaded, not a decorative stub. */
function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function PaymentsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [payments, setPayments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsRes, subsRes, refundsRes, summaryRes] = await Promise.all([
        paymentsService.getPayments({ take: 50 }),
        paymentsService.getSubscriptions({ take: 50 }),
        paymentsService.getRefunds({ take: 50 }),
        analyticsService.getSummary({}),
      ]);
      setPayments(Array.isArray(paymentsRes.data?.data) ? paymentsRes.data.data : []);
      setSubscriptions(Array.isArray(subsRes.data?.data) ? subsRes.data.data : []);
      setRefunds(Array.isArray(refundsRes.data?.data) ? refundsRes.data.data : []);
      setMonthlyRevenue(summaryRes.data?.data?.monthlyRevenue ?? 0);
    } catch (err) {
      console.error('Failed to load payments data', err);
      setError('Could not load payments data. Is the backend reachable?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalRevenue = useMemo(
    () => payments.filter((p) => p.status === 'SUCCESS' || p.status === 'PARTIALLY_REFUNDED').reduce((s, p) => s + (p.netAmount ?? p.amount ?? 0), 0),
    [payments]
  );
  const activeSubscriptions = useMemo(() => subscriptions.filter((s) => s.status === 'ACTIVE').length, [subscriptions]);
  const pendingRefunds = useMemo(() => refunds.filter((r) => r.status === 'PENDING').length, [refunds]);

  const filteredPayments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) =>
      [p.id, fullName(p.user), p.user?.email, p.provider?.name, p.status].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [payments, searchTerm]);

  const filteredSubscriptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter((s) =>
      [fullName(s.user), s.user?.email, s.plan?.name, s.status].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [subscriptions, searchTerm]);

  const filteredRefunds = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return refunds;
    return refunds.filter((r) =>
      [r.id, fullName(r.payment?.user), r.payment?.user?.email, r.reason, r.status].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [refunds, searchTerm]);

  const handleExport = () => {
    if (tabValue === 0) {
      downloadCsv('payments.csv', filteredPayments.map((p) => ({
        id: p.id, buyer: fullName(p.user), email: p.user?.email, provider: p.provider?.name,
        amount: p.amount, currency: p.currency, status: p.status, date: p.createdAt,
      })));
    } else if (tabValue === 1) {
      downloadCsv('subscriptions.csv', filteredSubscriptions.map((s) => ({
        id: s.id, user: fullName(s.user), email: s.user?.email, plan: s.plan?.name,
        price: s.plan?.price, status: s.status, currentPeriodEnd: s.currentPeriodEnd,
      })));
    } else {
      downloadCsv('refunds.csv', filteredRefunds.map((r) => ({
        id: r.id, paymentId: r.paymentId, buyer: fullName(r.payment?.user), amount: r.amount,
        reason: r.reason, status: r.status, date: r.createdAt,
      })));
    }
  };

  const STATS = [
    { title: 'Total Revenue (shown)', value: formatMoney(totalRevenue), icon: <AttachMoney color="primary" />, color: 'primary.light' },
    { title: 'Monthly Revenue', value: formatMoney(monthlyRevenue), icon: <TrendingUp sx={{ color: 'success.main' }} />, color: '#d1fae5' },
    { title: 'Active Subscriptions', value: String(activeSubscriptions), icon: <CreditCard color="secondary" />, color: '#ede9fe' },
    { title: 'Pending Refunds', value: String(pendingRefunds), icon: <AssignmentReturn color="warning" />, color: '#fef3c7' },
  ];

  if (loading && payments.length === 0 && subscriptions.length === 0 && refunds.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Payments & Revenue</Typography>

      {error && <Alert severity="warning">{error}</Alert>}

      {/* Stats - "Total Revenue (shown)" is a sum over the up-to-50 most
          recent payments loaded below, not an all-time total; Monthly
          Revenue reuses the same real figure the Dashboard shows. */}
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
          <Tab label={`Payments (${payments.length})`} />
          <Tab label={`Subscriptions (${subscriptions.length})`} />
          <Tab label={`Refunds (${refunds.length})`} />
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
          <Button variant="outlined" size="small" onClick={handleExport}>Export CSV</Button>
        </Box>

        {tabValue === 0 && (
          <TableContainer sx={{ pb: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Payment ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Buyer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No payments found.</TableCell></TableRow>
                ) : filteredPayments.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.id.slice(0, 8)}…</TableCell>
                    <TableCell>{fullName(p.user)}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{formatMoney(p.netAmount ?? p.amount, p.currency)}</TableCell>
                    <TableCell>{p.provider?.name || '—'}</TableCell>
                    <TableCell>
                      <Chip label={p.status} size="small" color={paymentStatusColor[p.status] || 'default'} />
                    </TableCell>
                    <TableCell>{formatDate(p.createdAt)}</TableCell>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Current Period Ends</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubscriptions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No subscriptions found.</TableCell></TableRow>
                ) : filteredSubscriptions.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontWeight: 'medium' }}>{fullName(s.user)}</TableCell>
                    <TableCell>{s.plan?.name || '—'}</TableCell>
                    <TableCell>{formatMoney(s.plan?.price, s.plan?.currency)}</TableCell>
                    <TableCell>
                      <Chip label={s.status} size="small" color={subStatusColor[s.status] || 'default'} />
                    </TableCell>
                    <TableCell>{formatDate(s.currentPeriodEnd)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 2 && (
          <TableContainer sx={{ pb: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Buyer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRefunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      <AssignmentReturn sx={{ fontSize: 40, mb: 1, opacity: 0.4, display: 'block', mx: 'auto' }} />
                      No refunds found.
                    </TableCell>
                  </TableRow>
                ) : filteredRefunds.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{fullName(r.payment?.user)}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{formatMoney(r.amount, r.payment?.currency)}</TableCell>
                    <TableCell>{r.reason || '—'}</TableCell>
                    <TableCell>
                      <Chip label={r.status} size="small" color={refundStatusColor[r.status] || 'default'} />
                    </TableCell>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
