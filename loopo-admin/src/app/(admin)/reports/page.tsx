'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, TextField, InputAdornment, Select, MenuItem,
  FormControl, Avatar, Pagination, Stack, Divider, LinearProgress, Menu
} from '@mui/material';
import {
  Search, FilterList, RestartAlt, CalendarToday, Download, Visibility, MoreVert,
  Description, EventNote, InsertChartOutlined, CloudDownloadOutlined, AccessTime,
  PieChart as PieChartIcon, History, Add, CheckCircle
} from '@mui/icons-material';
import { SystemReport } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Mock Data
const MOCK_REPORTS: SystemReport[] = [
  { id: '1', name: 'Sales Summary Report', shortDescription: 'Summary of sales and orders', category: 'Sales', type: 'Summary', description: 'Overview of total sales, orders, and revenue.', lastGenerated: '17 May 2024\n10:30 AM', status: 'Generated' },
  { id: '2', name: 'User Registration Report', shortDescription: 'New user registrations', category: 'Users', type: 'Detailed', description: 'Detailed report of newly registered users.', lastGenerated: '17 May 2024\n09:15 AM', status: 'Generated' },
  { id: '3', name: 'Top Products Report', shortDescription: 'Best selling products', category: 'Products', type: 'Summary', description: 'Top performing products by sales.', lastGenerated: '16 May 2024\n05:40 PM', status: 'Generated' },
  { id: '4', name: 'Orders Report', shortDescription: 'All orders analysis', category: 'Orders', type: 'Detailed', description: 'Complete list of orders with status.', lastGenerated: '16 May 2024\n04:20 PM', status: 'Generated' },
  { id: '5', name: 'Revenue Report', shortDescription: 'Revenue and earnings', category: 'Finance', type: 'Summary', description: 'Revenue overview with date-wise breakdowns.', lastGenerated: '16 May 2024\n02:10 PM', status: 'Generated' },
  { id: '6', name: 'Refunds Report', shortDescription: 'Refunds and returns', category: 'Refunds', type: 'Detailed', description: 'Detailed report of all refunds and returns.', lastGenerated: '15 May 2024\n08:20 PM', status: 'Generated' },
  { id: '7', name: 'Seller Performance Report', shortDescription: 'Seller performance analysis', category: 'Sellers', type: 'Summary', description: 'Performance report of top sellers.', lastGenerated: '15 May 2024\n02:45 PM', status: 'Scheduled' },
  { id: '8', name: 'Category Wise Report', shortDescription: 'Sales by category', category: 'Products', type: 'Summary', description: 'Sales and orders grouped by category.', lastGenerated: '15 May 2024\n11:30 AM', status: 'Scheduled' },
  { id: '9', name: 'Payment Transactions Report', shortDescription: 'All payment transactions', category: 'Payments', type: 'Detailed', description: 'Detailed list of all payment transactions.', lastGenerated: '14 May 2024\n05:00 PM', status: 'Generated' },
  { id: '10', name: 'Daily Activity Report', shortDescription: 'Daily platform activity', category: 'Activity', type: 'Summary', description: 'Daily summary of platform activities.', lastGenerated: '14 May 2024\n08:30 AM', status: 'Generated' },
];

const categoryColors: Record<string, { bg: string; color: string }> = {
  Sales: { bg: '#e0e7ff', color: '#4f46e5' },
  Users: { bg: '#d1fae5', color: '#10b981' },
  Products: { bg: '#f3e8ff', color: '#9333ea' },
  Orders: { bg: '#fef3c7', color: '#d97706' },
  Finance: { bg: '#ccfbf1', color: '#0d9488' },
  Refunds: { bg: '#fee2e2', color: '#dc2626' },
  Sellers: { bg: '#fef08a', color: '#ca8a04' },
  Payments: { bg: '#e0f2fe', color: '#0284c7' },
  Activity: { bg: '#f1f5f9', color: '#475569' },
};

const statusColors: Record<string, 'success' | 'info'> = {
  Generated: 'success',
  Scheduled: 'info',
};

const summaryCards = [
  { title: 'Total Reports', value: '58', sub: 'All available reports', icon: <Description sx={{ color: '#3b82f6' }} />, bg: '#eff6ff' },
  { title: 'Scheduled Reports', value: '12', sub: 'Auto generated reports', icon: <EventNote sx={{ color: '#10b981' }} />, bg: '#ecfdf5' },
  { title: 'Generated Today', value: '8', sub: 'Reports generated', icon: <InsertChartOutlined sx={{ color: '#f59e0b' }} />, bg: '#fffbeb' },
  { title: 'Downloads (This Month)', value: '243', sub: 'Total report downloads', icon: <CloudDownloadOutlined sx={{ color: '#8b5cf6' }} />, bg: '#f5f3ff' },
  { title: 'Last Generated', value: '10:30 AM', sub: '17 May 2024', icon: <AccessTime sx={{ color: '#ef4444' }} />, bg: '#fef2f2' },
];

const pieData = [
  { name: 'Sales', value: 18, color: '#3b82f6' },
  { name: 'Users', value: 10, color: '#10b981' },
  { name: 'Products', value: 8, color: '#f59e0b' },
  { name: 'Orders', value: 7, color: '#8b5cf6' },
  { name: 'Others', value: 15, color: '#94a3b8' },
];

const reportsByType = [
  { type: 'Summary', count: 24, percentage: 41.38, color: '#3b82f6' },
  { type: 'Detailed', count: 22, percentage: 37.93, color: '#10b981' },
  { type: 'Scheduled', count: 12, percentage: 20.69, color: '#8b5cf6' },
];

const quickActions = [
  { title: 'Create New Report', desc: 'Create a custom report', icon: <Add color="success" /> },
  { title: 'Schedule Report', desc: 'Automate report generation', icon: <EventNote color="info" /> },
  { title: 'Report Templates', desc: 'Manage report templates', icon: <PieChartIcon color="action" /> },
  { title: 'Export History', desc: 'View all exported reports', icon: <History color="warning" /> },
];

const recentDownloads = [
  { title: 'Sales Summary Report', date: '17 May 2024, 10:35 AM' },
  { title: 'User Registration Report', date: '17 May 2024, 09:18 AM' },
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [formatFilter, setFormatFilter] = useState('All Formats');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header and Breadcrumbs - Usually handled by global layout */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Reports</Typography>
        <Typography variant="body2" color="text.secondary">Dashboard &gt; Reports &gt; All Reports</Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2}>
        {summaryCards.map((card, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={idx}>
            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                <Avatar sx={{ bgcolor: card.bg, width: 48, height: 48, borderRadius: 2 }}>{card.icon}</Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>{card.title}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>{card.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{card.sub}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column: Filters and Table */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }}>
            
            {/* Filter Bar */}
            <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <TextField
                placeholder="Search reports by name or description..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 250, flexGrow: 1 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
              />
              
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <MenuItem value="All Categories">All Categories</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Users">Users</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <MenuItem value="All Types">All Types</MenuItem>
                  <MenuItem value="Summary">Summary</MenuItem>
                  <MenuItem value="Detailed">Detailed</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)}>
                  <MenuItem value="All Formats">All Formats</MenuItem>
                  <MenuItem value="PDF">PDF</MenuItem>
                  <MenuItem value="CSV">CSV</MenuItem>
                  <MenuItem value="Excel">Excel</MenuItem>
                </Select>
              </FormControl>

              <Button 
                variant="outlined" 
                endIcon={<CalendarToday fontSize="small" />} 
                sx={{ color: 'text.secondary', borderColor: 'divider', textTransform: 'none', px: 2 }}
              >
                Start Date &nbsp;&mdash;&nbsp; End Date
              </Button>

              <Button variant="text" sx={{ color: 'text.secondary' }}>
                Reset
              </Button>
              <Button variant="outlined" startIcon={<FilterList />} sx={{ color: 'text.secondary', borderColor: 'divider' }}>
                Filters
              </Button>
            </Box>

            {/* Table */}
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Report Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Last Generated</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_REPORTS.map(report => (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: '#f1f5f9' }}>
                            <Description sx={{ color: '#64748b', fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>{report.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{report.shortDescription}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.category}
                          size="small"
                          sx={{ 
                            height: 24, fontSize: '0.75rem', fontWeight: 'bold',
                            bgcolor: categoryColors[report.category]?.bg || '#f1f5f9',
                            color: categoryColors[report.category]?.color || '#475569'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#475569' }}>{report.type}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }} noWrap>
                          {report.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontWeight: 'medium', color: '#334155' }}>
                          {report.lastGenerated}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          size="small"
                          color={statusColors[report.status]}
                          sx={{ height: 24, fontSize: '0.75rem', fontWeight: 'bold' }}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <Download fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => handleActionClick(e, report.id)} sx={{ color: 'text.secondary' }}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Placeholder */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
              <Typography variant="body2" color="text.secondary">Showing 1 to 10 of 58 reports</Typography>
              <Pagination count={6} shape="rounded" color="primary" />
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Sidebar */}
        <Grid size={{ xs: 12, lg: 3 }}>
          
          {/* Reports Summary */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Reports Summary</Typography>
              
              <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text inside Doughnut */}
                <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>58</Typography>
                  <Typography variant="caption" color="text.secondary">Total Reports</Typography>
                </Box>
              </Box>

              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {pieData.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="body2" color="text.secondary">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.value} <Typography component="span" variant="caption" color="text.secondary">({((item.value / 58) * 100).toFixed(2)}%)</Typography>
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Reports by Type */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Reports by Type</Typography>
              <Stack spacing={2}>
                {reportsByType.map((item) => (
                  <Box key={item.type}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{item.type}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {item.count} <Typography component="span" variant="caption" color="text.secondary">({item.percentage}%)</Typography>
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{
                        height: 6, borderRadius: 3,
                        bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 3 }
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Quick Actions</Typography>
              <Stack spacing={2.5}>
                {quickActions.map((action, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
                    <Avatar sx={{ bgcolor: '#f8fafc', width: 40, height: 40 }}>{action.icon}</Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{action.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{action.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Recent Downloads */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Recent Downloads</Typography>
                <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>View All</Typography>
              </Box>
              <Stack spacing={2}>
                {recentDownloads.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <CheckCircle color="success" fontSize="small" sx={{ mt: 0.5 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.date}</Typography>
                    </Box>
                    <IconButton size="small"><Download fontSize="small" sx={{ color: 'text.secondary' }} /></IconButton>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

        </Grid>
      </Grid>

      {/* More Options Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleClose}>View Details</MenuItem>
        <MenuItem onClick={handleClose}>Edit Report</MenuItem>
        <MenuItem onClick={handleClose} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

    </Box>
  );
}
