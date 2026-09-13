'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Grid2 as Grid, Card, CardContent, Typography, Chip,
  LinearProgress, CircularProgress, Alert
} from '@mui/material';
import People from '@mui/icons-material/People';
import Storefront from '@mui/icons-material/Storefront';
import Inventory from '@mui/icons-material/Inventory';
import Visibility from '@mui/icons-material/Visibility';
import AttachMoney from '@mui/icons-material/AttachMoney';
import PendingActions from '@mui/icons-material/PendingActions';
import Category from '@mui/icons-material/Category';
import ViewCarousel from '@mui/icons-material/ViewCarousel';
import PersonAdd from '@mui/icons-material/PersonAdd';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Assessment from '@mui/icons-material/Assessment';
import Settings from '@mui/icons-material/Settings';
import FiberManualRecord from '@mui/icons-material/FiberManualRecord';
import ReportProblem from '@mui/icons-material/ReportProblem';
import HourglassEmpty from '@mui/icons-material/HourglassEmpty';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  analyticsService, productsService, sellersService, categoriesService,
  complaintsService, kycService,
} from '@/services/admin.service';

// ─── Types ─────────────────────────────────────────────────────────────────

interface DashboardData {
  totalUsers: number;
  totalSellers: number;
  totalListings: number;
  activeListings: number;
  monthlyRevenue: number;
  pendingListings: number;
  rejectedListings: number;
  soldListings: number;
  expiredListings: number;
  userGrowth: { date: string; newUsers: number; totalUsers: number }[];
  topCategories: { name: string; count: number }[];
  pendingKyc: number;
  openComplaints: number;
}

const quickActions = [
  { label: 'Add Category', icon: <Category sx={{ fontSize: 28, color: '#3b82f6' }} />, bg: '#eff6ff', href: '/categories' },
  { label: 'Add Banner', icon: <ViewCarousel sx={{ fontSize: 28, color: '#8b5cf6' }} />, bg: '#f5f3ff', href: '/banners' },
  { label: 'Manage Users', icon: <PersonAdd sx={{ fontSize: 28, color: '#10b981' }} />, bg: '#f0fdf4', href: '/users' },
  { label: 'Send Notification', icon: <NotificationsActive sx={{ fontSize: 28, color: '#f59e0b' }} />, bg: '#fffbeb', href: '/notifications' },
  { label: 'View Reports', icon: <Assessment sx={{ fontSize: 28, color: '#ef4444' }} />, bg: '#fef2f2', href: '/analytics' },
  { label: 'System Settings', icon: <Settings sx={{ fontSize: 28, color: '#64748b' }} />, bg: '#f8fafc', href: '/settings' },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({ title, value, icon, bgColor }: {
  title: string; value: string; icon: React.ReactNode; bgColor: string;
}) {
  return (
    <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: '#0f172a', fontSize: '1.4rem' }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: bgColor }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function SectionCard({ title, subtitle, action, children }: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>{title}</Typography>
            {subtitle && <Typography variant="caption" sx={{ color: '#94a3b8' }}>{subtitle}</Typography>}
          </Box>
          {action}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, growthRes, productStatsRes, sellersRes, categoriesRes, complaintStatsRes, kycRes] = await Promise.all([
        analyticsService.getSummary({}),
        analyticsService.getUserMetrics({}),
        productsService.getStats(),
        sellersService.getAll({ take: 1 }),
        categoriesService.getAll({ all: true }),
        complaintsService.getStats(),
        kycService.getAll({ take: 100 }),
      ]);

      const summary = summaryRes.data?.data ?? {};
      // /admin/products/stats wraps its payload one level deeper than most
      // endpoints ({ data: { data: {...} } }, since the controller itself
      // already returns { data: stats } before the global envelope wraps it
      // again) - unwrap that shape first, same as the listings page does.
      const productStatsRaw = productStatsRes.data?.data;
      const productStats = productStatsRaw?.data ?? productStatsRaw ?? {};
      const categoriesRaw = categoriesRes.data?.data;
      const categoriesList: any[] = Array.isArray(categoriesRaw) ? categoriesRaw : Array.isArray(categoriesRaw?.data) ? categoriesRaw.data : [];
      const kycRaw = kycRes.data?.data;
      const kycList: any[] = Array.isArray(kycRaw) ? kycRaw : Array.isArray(kycRaw?.data) ? kycRaw.data : [];

      setData({
        totalUsers: summary.totalUsers ?? 0,
        totalSellers: sellersRes.data?.data?.total ?? 0,
        totalListings: productStats.total ?? 0,
        activeListings: productStats.active ?? summary.activeListings ?? 0,
        monthlyRevenue: summary.monthlyRevenue ?? 0,
        pendingListings: productStats.pending ?? 0,
        rejectedListings: productStats.rejected ?? 0,
        soldListings: productStats.sold ?? 0,
        expiredListings: productStats.expired ?? 0,
        userGrowth: growthRes.data?.data?.series ?? [],
        topCategories: categoriesList
          .map((c) => ({ name: c.name, count: c._count?.products ?? 0 }))
          .filter((c) => c.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 6),
        pendingKyc: kycList.filter((k) => k.status === 'SUBMITTED' || k.status === 'UNDER_REVIEW').length,
        openComplaints: complaintStatsRes.data?.data?.open ?? 0,
      });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError('Could not load dashboard data. Is the backend reachable?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !data) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!data) return null;

  const listingsData = [
    { name: 'Active', value: data.activeListings, color: '#16a34a' },
    { name: 'Pending', value: data.pendingListings, color: '#2563eb' },
    { name: 'Sold', value: data.soldListings, color: '#f59e0b' },
    { name: 'Rejected', value: data.rejectedListings, color: '#ef4444' },
    { name: 'Expired', value: data.expiredListings, color: '#94a3b8' },
  ].filter((d) => d.value > 0);
  const totalListingsForPie = listingsData.reduce((s, d) => s + d.value, 0) || 1;
  const maxCategoryCount = Math.max(1, ...data.topCategories.map((c) => c.count));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 4 }}>

      {/* ── Stat Cards Row ─────────────────────────────────────────────────── */}
      <Grid container spacing={2}>
        {[
          { title: 'Total Users', value: data.totalUsers.toLocaleString('en-IN'), icon: <People sx={{ fontSize: 22, color: '#3b82f6' }} />, bgColor: '#eff6ff' },
          { title: 'Total Sellers', value: data.totalSellers.toLocaleString('en-IN'), icon: <Storefront sx={{ fontSize: 22, color: '#10b981' }} />, bgColor: '#f0fdf4' },
          { title: 'Total Listings', value: data.totalListings.toLocaleString('en-IN'), icon: <Inventory sx={{ fontSize: 22, color: '#f59e0b' }} />, bgColor: '#fffbeb' },
          { title: 'Active Listings', value: data.activeListings.toLocaleString('en-IN'), icon: <Visibility sx={{ fontSize: 22, color: '#8b5cf6' }} />, bgColor: '#f5f3ff' },
          { title: 'Revenue (30d)', value: `₹${data.monthlyRevenue.toLocaleString('en-IN')}`, icon: <AttachMoney sx={{ fontSize: 22, color: '#16a34a' }} />, bgColor: '#f0fdf4' },
          { title: 'Pending Approval', value: data.pendingListings.toLocaleString('en-IN'), icon: <PendingActions sx={{ fontSize: 22, color: '#ef4444' }} />, bgColor: '#fef2f2' },
        ].map((stat, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* ── Charts Row ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2}>
        {/* User Growth */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="User Growth" subtitle="New users registered, last 7 days">
            {data.userGrowth.length === 0 ? (
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">No signups in this period yet.</Typography>
              </Box>
            ) : (
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.userGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                      formatter={(v: any) => [Number(v).toLocaleString(), 'New Users']}
                    />
                    <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={2.5}
                      dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* Listings Overview */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <SectionCard title="Listings Overview" subtitle="By status">
            {listingsData.length === 0 ? (
              <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">No listings yet.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: '0 0 auto' }}>
                  <PieChart width={160} height={160}>
                    <Pie data={listingsData} cx={75} cy={75} innerRadius={48} outerRadius={75}
                      paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                      {listingsData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </Box>
                <Box sx={{ flex: 1 }}>
                  {listingsData.map((item) => (
                    <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <FiberManualRecord sx={{ fontSize: 10, color: item.color }} />
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>{item.name}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        {item.value.toLocaleString()} ({((item.value / totalListingsForPie) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* Pending Actions */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <SectionCard title="Pending Actions" subtitle="Needs admin attention">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { label: 'Listings awaiting approval', value: data.pendingListings, icon: <HourglassEmpty sx={{ fontSize: 20, color: '#f59e0b' }} />, href: '/listings' },
                { label: 'KYC submissions to review', value: data.pendingKyc, icon: <VerifiedUser sx={{ fontSize: 20, color: '#3b82f6' }} />, href: '/kyc' },
                { label: 'Open complaints', value: data.openComplaints, icon: <ReportProblem sx={{ fontSize: 20, color: '#ef4444' }} />, href: '/complaints' },
              ].map((row) => (
                <Box
                  key={row.label}
                  onClick={() => router.push(row.href)}
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    p: 1.25, borderRadius: 2, cursor: 'pointer', border: '1px solid #f1f5f9',
                    '&:hover': { bgcolor: '#f8fafc' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    {row.icon}
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>{row.label}</Typography>
                  </Box>
                  <Chip label={row.value} size="small" sx={{ fontWeight: 700, bgcolor: row.value > 0 ? '#fef2f2' : '#f0fdf4', color: row.value > 0 ? '#dc2626' : '#16a34a' }} />
                </Box>
              ))}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* ── Bottom Row ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2}>

        {/* Top Categories */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Top Categories" subtitle="By approved listing count">
            {data.topCategories.length === 0 ? (
              <Typography variant="caption" color="text.secondary">No categories yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {data.topCategories.map((cat, i) => (
                  <Box key={cat.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 500, color: '#334155' }}>{cat.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{cat.count.toLocaleString()}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(cat.count / maxCategoryCount) * 100}
                      sx={{
                        height: 6, borderRadius: 3,
                        bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: i === 0 ? '#3b82f6' : i === 1 ? '#10b981' : i === 2 ? '#f59e0b' : i === 3 ? '#8b5cf6' : i === 4 ? '#ef4444' : '#64748b',
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Quick Actions">
            <Grid container spacing={1.5}>
              {quickActions.map((action, i) => (
                <Grid key={i} size={4}>
                  <Box
                    onClick={() => router.push(action.href)}
                    sx={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 0.75, p: 1.5, borderRadius: 2, bgcolor: action.bg,
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                    }}
                  >
                    {action.icon}
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#334155', lineHeight: 1.2, textAlign: 'center' }}>
                      {action.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

      </Grid>

      {error && <Alert severity="warning">{error} (showing last successfully loaded data)</Alert>}
    </Box>
  );
}
