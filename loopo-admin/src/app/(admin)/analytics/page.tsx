'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Tabs, Tab, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material';
import {
  PeopleAlt, Inventory2, MonetizationOn, Category, ManageSearch,
  Gavel, TrendingUp, TrendingDown
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const USER_GROWTH = [
  { month: 'Jan', total: 4200, new: 320, vendors: 45 },
  { month: 'Feb', total: 4800, new: 280, vendors: 38 },
  { month: 'Mar', total: 5400, new: 450, vendors: 62 },
  { month: 'Apr', total: 6100, new: 510, vendors: 71 },
  { month: 'May', total: 6800, new: 380, vendors: 55 },
  { month: 'Jun', total: 7600, new: 490, vendors: 68 },
  { month: 'Jul', total: 8200, new: 520, vendors: 74 },
];

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

const SUMMARY_METRICS = [
  { label: 'Total Users', value: '8,247', trend: '+6.2%', up: true, icon: <PeopleAlt color="primary" /> },
  { label: 'Active Listings', value: '14,320', trend: '+4.1%', up: true, icon: <Inventory2 color="success" /> },
  { label: 'Monthly Revenue', value: '$22,500', trend: '+17.2%', up: true, icon: <MonetizationOn color="warning" /> },
  { label: 'Avg. Order Value', value: '$67.40', trend: '-2.1%', up: false, icon: <Category color="secondary" /> },
  { label: 'Search Queries', value: '95,430', trend: '+11.5%', up: true, icon: <ManageSearch color="info" /> },
  { label: 'Moderation Rate', value: '94.8%', trend: '+1.3%', up: true, icon: <Gavel color="error" /> },
];

const ANALYTICS_TABS = ['Users', 'Revenue', 'Products', 'Moderation'];

export default function AnalyticsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [period, setPeriod] = useState('7months');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Analytics</Typography>
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Period</InputLabel>
          <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="7months">Last 7 Months</MenuItem>
            <MenuItem value="12months">Last 12 Months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2}>
        {SUMMARY_METRICS.map((metric, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={idx}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {metric.icon}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    {metric.up ? <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} /> : <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />}
                    <Typography variant="caption" color={metric.up ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold' }}>
                      {metric.trend}
                    </Typography>
                  </Box>
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
            <Box sx={{ height: 320, width: '100%', mt: 2, mb: 3 }}>
              <ResponsiveContainer>
                <AreaChart data={USER_GROWTH}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Area type="monotone" dataKey="total" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} name="Total Users" />
                  <Area type="monotone" dataKey="new" stroke="#10b981" fill="#d1fae5" strokeWidth={2} name="New Users" />
                  <Area type="monotone" dataKey="vendors" stroke="#7c3aed" fill="#ede9fe" strokeWidth={2} name="New Vendors" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
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
