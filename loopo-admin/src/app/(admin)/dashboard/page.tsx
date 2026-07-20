'use client';

import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip,
  LinearProgress, Divider, IconButton
} from '@mui/material';
import {
  People, Storefront, Inventory, Visibility, AttachMoney, ShoppingCart,
  TrendingUp, TrendingDown, Category, ViewCarousel, AdminPanelSettings,
  NotificationsActive, Assessment, Settings, MoreVert, FiberManualRecord
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Data ──────────────────────────────────────────────────────────────────────

const userGrowthData = [
  { date: 'May 12', users: 10000 },
  { date: 'May 13', users: 18000 },
  { date: 'May 14', users: 15000 },
  { date: 'May 15', users: 28000 },
  { date: 'May 16', users: 22000 },
  { date: 'May 17', users: 30000 },
  { date: 'May 18', users: 35000 },
];

const revenueData = [
  { date: 'May 12', revenue: 100 },
  { date: 'May 13', revenue: 200 },
  { date: 'May 14', revenue: 150 },
  { date: 'May 15', revenue: 300 },
  { date: 'May 16', revenue: 250 },
  { date: 'May 17', revenue: 450 },
  { date: 'May 18', revenue: 760 },
];

const listingsData = [
  { name: 'Active', value: 312450, color: '#16a34a' },
  { name: 'Pending', value: 52430, color: '#2563eb' },
  { name: 'Sold', value: 36750, color: '#f59e0b' },
  { name: 'Expired', value: 17600, color: '#ef4444' },
];

const topCategories = [
  { name: 'Mobiles', count: 12450, max: 13000 },
  { name: 'Vehicles', count: 9875, max: 13000 },
  { name: 'Electronics', count: 8421, max: 13000 },
  { name: 'Properties', count: 6230, max: 13000 },
  { name: 'Furniture', count: 4890, max: 13000 },
  { name: 'Fashion', count: 3765, max: 13000 },
];

const recentActivities = [
  { icon: '👤', text: 'New user registered - John Doe', time: '2 mins ago', color: '#3b82f6' },
  { icon: '📱', text: 'New listing posted - iPhone 14 Pro', time: '6 mins ago', color: '#10b981' },
  { icon: '💳', text: 'Payment received - Order #ORD124G', time: '15 mins ago', color: '#f59e0b' },
  { icon: '✅', text: 'Listing approved - MacBook Air M2', time: '26 mins ago', color: '#8b5cf6' },
  { icon: '🚩', text: 'Complaint received - Fake Product', time: '40 mins ago', color: '#ef4444' },
];

const platformStatus = [
  { name: 'Website', status: 'Online' },
  { name: 'Mobile App (Android)', status: 'Online' },
  { name: 'Mobile App (iOS)', status: 'Online' },
  { name: 'Payment Gateway', status: 'Online' },
  { name: 'Email Service', status: 'Online' },
  { name: 'SMS Service', status: 'Warning' },
  { name: 'Storage', status: 'Online' },
  { name: 'Backup', status: 'Online' },
];

const quickActions = [
  { label: 'Add Category', icon: <Category sx={{ fontSize: 28, color: '#3b82f6' }} />, bg: '#eff6ff' },
  { label: 'Add Banner', icon: <ViewCarousel sx={{ fontSize: 28, color: '#8b5cf6' }} />, bg: '#f5f3ff' },
  { label: 'Add Admin', icon: <AdminPanelSettings sx={{ fontSize: 28, color: '#10b981' }} />, bg: '#f0fdf4' },
  { label: 'Send Notification', icon: <NotificationsActive sx={{ fontSize: 28, color: '#f59e0b' }} />, bg: '#fffbeb' },
  { label: 'View Reports', icon: <Assessment sx={{ fontSize: 28, color: '#ef4444' }} />, bg: '#fef2f2' },
  { label: 'System Settings', icon: <Settings sx={{ fontSize: 28, color: '#64748b' }} />, bg: '#f8fafc' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ title, value, icon, change, positive, bgColor }: {
  title: string; value: string; icon: React.ReactNode; change: string; positive: boolean; bgColor: string;
}) {
  return (
    <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {positive ? (
            <TrendingUp sx={{ fontSize: 14, color: '#16a34a' }} />
          ) : (
            <TrendingDown sx={{ fontSize: 14, color: '#ef4444' }} />
          )}
          <Typography variant="caption" sx={{ color: positive ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
            {change}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>vs last week</Typography>
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

const RADIAN = Math.PI / 180;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const totalListings = listingsData.reduce((s, d) => s + d.value, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 4 }}>

      {/* ── Stat Cards Row ─────────────────────────────────────────────────── */}
      <Grid container spacing={2}>
        {[
          { title: 'Total Users', value: '1,24,680', icon: <People sx={{ fontSize: 22, color: '#3b82f6' }} />, change: '12.5%', positive: true, bgColor: '#eff6ff' },
          { title: 'Total Sellers', value: '18,265', icon: <Storefront sx={{ fontSize: 22, color: '#10b981' }} />, change: '8.3%', positive: true, bgColor: '#f0fdf4' },
          { title: 'Total Listings', value: '4,21,230', icon: <Inventory sx={{ fontSize: 22, color: '#f59e0b' }} />, change: '13.2%', positive: true, bgColor: '#fffbeb' },
          { title: 'Active Listings', value: '3,12,450', icon: <Visibility sx={{ fontSize: 22, color: '#8b5cf6' }} />, change: '10.4%', positive: true, bgColor: '#f5f3ff' },
          { title: 'Total Revenue', value: '₹48,75,320', icon: <AttachMoney sx={{ fontSize: 22, color: '#16a34a' }} />, change: '18.7%', positive: true, bgColor: '#f0fdf4' },
          { title: 'Orders (Completed)', value: '8,754', icon: <ShoppingCart sx={{ fontSize: 22, color: '#ef4444' }} />, change: '5.6%', positive: false, bgColor: '#fef2f2' },
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
          <SectionCard
            title="User Growth"
            subtitle="New users registered"
            action={
              <Chip label="This Week ▾" size="small" variant="outlined"
                sx={{ fontSize: '0.7rem', height: 24, borderRadius: 1, color: '#64748b', borderColor: '#e2e8f0' }} />
            }
          >
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${v / 1000}K`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                    formatter={(v: any) => [Number(v).toLocaleString(), 'Users']}
                  />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5}
                    dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>

        {/* Listings Overview */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <SectionCard
            title="Listings Overview"
            action={
              <Chip label="This Week ▾" size="small" variant="outlined"
                sx={{ fontSize: '0.7rem', height: 24, borderRadius: 1, color: '#64748b', borderColor: '#e2e8f0' }} />
            }
          >
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
                      {item.value.toLocaleString()} ({((item.value / totalListings) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </SectionCard>
        </Grid>

        {/* Revenue Overview */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <SectionCard
            title="Revenue Overview"
            subtitle="Total revenue"
            action={
              <Chip label="This Week ▾" size="small" variant="outlined"
                sx={{ fontSize: '0.7rem', height: 24, borderRadius: 1, color: '#64748b', borderColor: '#e2e8f0' }} />
            }
          >
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                    formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5}
                    dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* ── Bottom Row ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2}>

        {/* Recent Activities */}
        <Grid size={{ xs: 12, md: 3 }}>
          <SectionCard title="Recent Activities">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {recentActivities.map((act, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{
                    width: 34, height: 34, borderRadius: '50%', bgcolor: `${act.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0
                  }}>
                    {act.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: '#334155', fontWeight: 500, lineHeight: 1.3 }}>
                      {act.text}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
                      {act.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                View All Activities
              </Typography>
            </Box>
          </SectionCard>
        </Grid>

        {/* Top Categories */}
        <Grid size={{ xs: 12, md: 3 }}>
          <SectionCard
            title="Top Categories"
            action={
              <Chip label="This Week ▾" size="small" variant="outlined"
                sx={{ fontSize: '0.7rem', height: 24, borderRadius: 1, color: '#64748b', borderColor: '#e2e8f0' }} />
            }
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {topCategories.map((cat, i) => (
                <Box key={i}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 500, color: '#334155' }}>{cat.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{cat.count.toLocaleString()}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(cat.count / cat.max) * 100}
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
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                View All Categories
              </Typography>
            </Box>
          </SectionCard>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 3 }}>
          <SectionCard title="Quick Actions">
            <Grid container spacing={1.5}>
              {quickActions.map((action, i) => (
                <Grid key={i} size={4}>
                  <Box sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 0.75, p: 1.5, borderRadius: 2, bgcolor: action.bg,
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                  }}>
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

        {/* Platform Status */}
        <Grid size={{ xs: 12, md: 3 }}>
          <SectionCard title="Platform Status">
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {platformStatus.map((item, i) => (
                <Box key={i}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 500 }}>{item.name}</Typography>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        height: 20, fontSize: '0.65rem', fontWeight: 600, borderRadius: 1,
                        bgcolor: item.status === 'Online' ? '#f0fdf4' : '#fffbeb',
                        color: item.status === 'Online' ? '#16a34a' : '#d97706',
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </Box>
                  {i < platformStatus.length - 1 && <Divider sx={{ borderColor: '#f8fafc' }} />}
                </Box>
              ))}
            </Box>
          </SectionCard>
        </Grid>

      </Grid>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
          © 2024 Loopo. All rights reserved. &nbsp;&nbsp;&nbsp; Version 1.0.0 &nbsp;&nbsp;&nbsp; Made with ❤️ for Loopo
        </Typography>
      </Box>
    </Box>
  );
}
