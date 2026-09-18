'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid2 as Grid, Tabs, Tab, FormControl,
  InputLabel, Select, MenuItem, Skeleton, Alert, Button
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

interface RevenuePoint {
  month: string;
  revenue: number;
  subscriptions: number;
  other: number;
}

interface NameValue {
  name: string;
  value: number;
}

interface ModerationPoint {
  month: string;
  reports: number;
  resolved: number;
  escalated: number;
}

const PIE_COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

function EmptyChartState({ message }: { message: string }) {
  return (
    <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}

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

export default function AnalyticsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [period, setPeriod] = useState('7months');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [growth, setGrowth] = useState<UserGrowthPoint[]>([]);
  const [revenueSeries, setRevenueSeries] = useState<RevenuePoint[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<NameValue[]>([]);
  const [listingsByCategory, setListingsByCategory] = useState<NameValue[]>([]);
  const [moderationSeries, setModerationSeries] = useState<ModerationPoint[]>([]);
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
      const [summaryRes, growthRes, revenueRes, revenueByCatRes, listingsRes, moderationRes] = await Promise.all([
        analyticsService.getSummary({ timeframe }),
        analyticsService.getUserMetrics({ timeframe }),
        analyticsService.getRevenueMetrics({ timeframe }),
        analyticsService.getRevenueByCategory({ timeframe }),
        analyticsService.getProductMetrics(),
        analyticsService.getModerationMetrics({ timeframe }),
      ]);
      setSummary(summaryRes.data?.data ?? null);
      setGrowth(growthRes.data?.data?.series ?? []);
      setRevenueSeries(revenueRes.data?.data?.series ?? []);
      setRevenueByCategory(revenueByCatRes.data?.data ?? []);
      setListingsByCategory(listingsRes.data?.data ?? []);
      setModerationSeries(moderationRes.data?.data?.series ?? []);
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
            <Grid size={{ xs: 12, md: 8 }} >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>Revenue Breakdown</Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={320} sx={{ mt: 2 }} />
              ) : revenueSeries.length === 0 ? (
                <EmptyChartState message="No successful payments in this period yet." />
              ) : (
                <Box sx={{ height: 320, width: '100%', mt: 2 }}>
                  <ResponsiveContainer>
                    <BarChart data={revenueSeries}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: any) => [`$${v.toLocaleString()}`, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#2563eb" name="Total Revenue" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="subscriptions" fill="#10b981" name="Subscriptions" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="other" fill="#7c3aed" name="Listings/Boosts" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>Revenue by Category</Typography>
              {loading ? (
                <Skeleton variant="circular" width={200} height={200} sx={{ mt: 2, mx: 'auto' }} />
              ) : revenueByCategory.length === 0 ? (
                <EmptyChartState message="No product sales in this period yet." />
              ) : (
                <Box sx={{ height: 320, mt: 2 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                        {revenueByCategory.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>Listings by Category</Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={320} sx={{ mt: 2, mb: 3 }} />
            ) : listingsByCategory.length === 0 ? (
              <EmptyChartState message="No listings yet." />
            ) : (
              <Box sx={{ height: 320, width: '100%', mt: 2, mb: 3 }}>
                <ResponsiveContainer>
                  <BarChart data={listingsByCategory} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>Moderation Overview</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Based on complaint volume — &quot;Escalated&quot; approximates HIGH/URGENT-priority complaints (there&apos;s no distinct escalation status).
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={320} sx={{ mt: 2, mb: 3 }} />
            ) : moderationSeries.length === 0 ? (
              <EmptyChartState message="No complaints in this period yet." />
            ) : (
              <Box sx={{ height: 320, width: '100%', mt: 2, mb: 3 }}>
                <ResponsiveContainer>
                  <LineChart data={moderationSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="reports" stroke="#f59e0b" strokeWidth={3} name="Total Reports" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} name="Resolved" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="escalated" stroke="#ef4444" strokeWidth={3} name="Escalated" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
}
