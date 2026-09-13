'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid2 as Grid, Tabs, Tab, FormControl,
  InputLabel, Select, MenuItem, Chip, Skeleton, Alert, Button
} from '@mui/material';
import {
  PeopleAlt, Inventory2, MonetizationOn, Category, ManageSearch,
  Gavel, Refresh
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { analyticsService } from '@/services/admin.service';

interface SummaryData {
  totalUsers: number;
  activeListings: number;
  monthlyRevenue: number;
  avgOrderValue: number;
  searchQueries: number;
  moderationRate: number;
}

interface UserGrowthPoint {
  date: string;
  newUsers: number;
  totalUsers: number;
}

const REVENUE_DATA = [
  { month: 'Jan', revenue: 12000, commission: 1800, subscriptions: 2400 },
  { month: 'Feb', revenue: 14500, commission: 2175, subscriptions: 2600 },
  { month: 'Mar', revenue: 13200, commission: 1980, subscriptions: 2800 },
  { month: 'Apr', revenue: 17800, commission: 2670, subscriptions: 3000 },
  { month: 'May', revenue: 16400, commission: 2460, subscriptions: 3200 },
  { month: 'Jun', revenue: 19200, commission: 2880, subscriptions: 3400 },
  { month: 'Jul', revenue: 22500, commission: 3375, subscriptions: 3600 },
];

const CATEGORY_DIST = [
  { name: 'Electronics', value: 38 },
  { name: 'Clothing', value: 22 },
  { name: 'Home & Garden', value: 15 },
  { name: 'Sports', value: 12 },
  { name: 'Books', value: 8 },
  { name: 'Others', value: 5 },
];

const PIE_COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const MODERATION_DATA = [
  { month: 'Jan', reports: 45, resolved: 38, escalated: 7 },
  { month: 'Feb', reports: 52, resolved: 48, escalated: 4 },
  { month: 'Mar', reports: 61, resolved: 55, escalated: 6 },
  { month: 'Apr', reports: 38, resolved: 35, escalated: 3 },
  { month: 'May', reports: 70, resolved: 60, escalated: 10 },
  { month: 'Jun', reports: 43, resolved: 40, escalated: 3 },
  { month: 'Jul', reports: 58, resolved: 52, escalated: 6 },
];

function buildSummaryCards(s: SummaryData) {
  return [
    { label: 'Total Users', value: s.totalUsers.toLocaleString(), icon: <PeopleAlt color="primary" /> },
    { label: 'Active Listings', value: s.activeListings.toLocaleString(), icon: <Inventory2 color="success" /> },
    { label: 'Monthly Revenue', value: `$${s.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: <MonetizationOn color="warning" /> },
    { label: 'Avg. Order Value', value: `$${s.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: <Category color="secondary" /> },
    { label: 'Search Queries', value: s.searchQueries.toLocaleString(), icon: <ManageSearch color="info" /> },
    { label: 'Moderation Rate', value: `${s.moderationRate.toFixed(1)}%`, icon: <Gavel color="error" /> },
  ];
}

const ANALYTICS_TABS = ['Users', 'Revenue', 'Products', 'Moderation'];

/** Small honesty label: Revenue/Products/Moderation tabs aren't wired to real
 * data yet (see agents/01-context/known-issues.md) - showing this instead of
 * quietly rendering fake numbers as if they were live. */
function DemoDataChip() {
  return <Chip label="Demo data — not yet connected to live data" size="small" color="warning" variant="outlined" sx={{ mb: 2 }} />;
}

export default function AnalyticsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [period, setPeriod] = useState('7months');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [growth, setGrowth] = useState<UserGrowthPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeframeForPeriod = (p: string) => {
    switch (p) {
      case '7days': return 'WEEK';
      case '30days': return 'MONTH';
      case '12months': return 'YEAR';
      default: return 'ALL';
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const timeframe = timeframeForPeriod(period);
      const [summaryRes, growthRes] = await Promise.all([
        analyticsService.getSummary({ timeframe }),
        analyticsService.getUserMetrics({ timeframe }),
      ]);
      setSummary(summaryRes.data?.data ?? null);
      setGrowth(growthRes.data?.data?.series ?? []);
    } catch (err) {
      console.error('Failed to load analytics', err);
      setError('Could not load analytics data. Is the backend reachable?');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ width: 180 }}>
            <InputLabel>Period</InputLabel>
            <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="7months">Last 7 Months</MenuItem>
              <MenuItem value="12months">Last 12 Months</MenuItem>
            </Select>
          </FormControl>
          <Button size="small" startIcon={<Refresh />} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadData}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2}>
        {loading && !summary
          ? Array.from({ length: 6 }).map((_, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={idx}>
                <Card sx={{ height: '100%' }}><CardContent sx={{ p: 2 }}><Skeleton variant="rectangular" height={70} /></CardContent></Card>
              </Grid>
            ))
          : summary && buildSummaryCards(summary).map((metric, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={idx}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {metric.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>{metric.value}</Typography>
                <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Card sx={{ pt: 2, px: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          {ANALYTICS_TABS.map(t => <Tab key={t} label={t} />)}
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>User Growth Over Time</Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={320} sx={{ mt: 2, mb: 3 }} />
            ) : growth.length === 0 ? (
              <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, mb: 3 }}>
                <Typography color="text.secondary">No signups in this period yet.</Typography>
              </Box>
            ) : (
              <Box sx={{ height: 320, width: '100%', mt: 2, mb: 3 }}>
                <ResponsiveContainer>
                  <AreaChart data={growth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="totalUsers" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} name="Total Users" />
                    <Area type="monotone" dataKey="newUsers" stroke="#10b981" fill="#d1fae5" strokeWidth={2} name="New Signups" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}><DemoDataChip /></Grid>
            <Grid size={{ xs: 12, md: 8 }} >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>Revenue Breakdown</Typography>
              <Box sx={{ height: 320, width: '100%', mt: 2 }}>
                <ResponsiveContainer>
                  <BarChart data={REVENUE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: any) => [`$${v.toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#2563eb" name="Total Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="commission" fill="#7c3aed" name="Commission" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="subscriptions" fill="#10b981" name="Subscriptions" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>Revenue by Category</Typography>
              <Box sx={{ height: 320, mt: 2 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={CATEGORY_DIST} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                      {CATEGORY_DIST.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        )}

        {tabValue === 2 && (
          <Box>
            <DemoDataChip />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>Listings by Category</Typography>
            <Box sx={{ height: 320, width: '100%', mt: 2, mb: 3 }}>
              <ResponsiveContainer>
                <BarChart data={CATEGORY_DIST} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            <DemoDataChip />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>Moderation Overview</Typography>
            <Box sx={{ height: 320, width: '100%', mt: 2, mb: 3 }}>
              <ResponsiveContainer>
                <LineChart data={MODERATION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="reports" stroke="#f59e0b" strokeWidth={3} name="Total Reports" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} name="Resolved" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="escalated" stroke="#ef4444" strokeWidth={3} name="Escalated" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
}
