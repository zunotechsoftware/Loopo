'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, TextField, InputAdornment, Select, MenuItem,
  FormControl, Avatar, Pagination, Stack, Checkbox, Menu, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Tooltip,
  Divider, InputLabel
} from '@mui/material';
import {
  Search, FilterList, RestartAlt, CalendarToday, Visibility, MoreVert,
  SupportAgent, CheckCircleOutlined, Autorenew, TaskAlt, HighlightOff,
  Email, Chat, Language, Phone, AddCircleOutlined, ListAlt,
  Category as CategoryIcon, FileDownload, Close, ArrowForward,
  WarningAmber, Person, Storefront, LocalShipping, Payment,
  AccountBalanceWallet, Build, Shield, CheckCircle
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { complaintsService } from '@/services/admin.service';

export interface ComplaintRow {
  id: string;
  complaintId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  vendorName?: string;
  subjectTitle: string;
  subjectDescription: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  severity?: 'Minor' | 'Moderate' | 'Major' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  rawStatus?: string;
  channel: 'Email' | 'Chat' | 'Web' | 'Phone';
  assignedDepartment?: string;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
}

const INITIAL_MOCK_COMPLAINTS: ComplaintRow[] = [
  { id: '1', complaintId: '#CMP-0001248', userName: 'Rahul Sharma', userEmail: 'rahul.sharma@email.com', userPhone: '+91 98765 43210', vendorName: 'TechZone Electronics', subjectTitle: 'Item not as described', subjectDescription: 'The product I received is completely different from what was shown in the listing pictures.', category: 'Orders', priority: 'High', status: 'Open', channel: 'Email', createdAt: '12 May 2024\n10:31 AM', updatedAt: '12 May 2024\n10:31 AM' },
  { id: '2', complaintId: '#CMP-0001247', userName: 'Priya Patel', userEmail: 'priya.patel@email.com', userPhone: '+91 91234 56789', vendorName: 'UrbanStyle Fashion', subjectTitle: 'Payment issue', subjectDescription: 'Payment was deducted from my bank account but order status is still showing Pending.', category: 'Payments', priority: 'High', status: 'In Progress', channel: 'Chat', createdAt: '12 May 2024\n09:15 AM', updatedAt: '12 May 2024\n11:20 AM' },
  { id: '3', complaintId: '#CMP-0001246', userName: 'Amit Kumar', userEmail: 'amit.kumar@email.com', userPhone: '+91 88776 65544', vendorName: 'ElectroWorld Hub', subjectTitle: 'Refund not received', subjectDescription: 'I requested a refund but have not received it after 7 business days.', category: 'Refunds', priority: 'Medium', status: 'In Progress', channel: 'Web', createdAt: '11 May 2024\n08:45 PM', updatedAt: '11 May 2024\n09:50 PM' },
  { id: '4', complaintId: '#CMP-0001245', userName: 'Sneha Reddy', userEmail: 'sneha.reddy@email.com', userPhone: '+91 99887 76655', vendorName: 'MobileHub Store', subjectTitle: 'Unable to upload images', subjectDescription: 'I am unable to upload supporting images when disputing an item condition.', category: 'Technical', priority: 'Medium', status: 'Open', channel: 'Email', createdAt: '11 May 2024\n06:20 PM', updatedAt: '11 May 2024\n06:20 PM' },
  { id: '5', complaintId: '#CMP-0001244', userName: 'Vikram Singh', userEmail: 'vikram.singh@email.com', userPhone: '+91 97654 32109', vendorName: 'Loopo Official', subjectTitle: 'Account verification issue', subjectDescription: 'My account is under review for more than 5 days.', category: 'Account', priority: 'Low', status: 'Resolved', channel: 'Phone', createdAt: '10 May 2024\n04:30 PM', updatedAt: '11 May 2024\n10:15 AM' },
  { id: '6', complaintId: '#CMP-0001243', userName: 'Neha Verma', userEmail: 'neha.verma@email.com', userPhone: '+91 96543 21098', vendorName: 'Loopo Official', subjectTitle: 'Login problems', subjectDescription: "I can't login to my account on mobile app after password reset.", category: 'Technical', priority: 'High', status: 'Resolved', channel: 'Chat', createdAt: '10 May 2024\n02:30 PM', updatedAt: '10 May 2024\n05:40 PM' },
  { id: '7', complaintId: '#CMP-0001242', userName: 'Arjun Mehta', userEmail: 'arjun.mehta@email.com', userPhone: '+91 95432 10987', vendorName: 'LensCraft Pro', subjectTitle: 'Seller not responding', subjectDescription: 'The seller is not replying to messages regarding warranty.', category: 'Sellers', priority: 'Medium', status: 'Open', channel: 'Email', createdAt: '09 May 2024\n11:20 AM', updatedAt: '09 May 2024\n11:20 AM' },
  { id: '8', complaintId: '#CMP-0001241', userName: 'Kavya Nair', userEmail: 'kavya.nair@email.com', userPhone: '+91 94321 09876', vendorName: 'Express Logistics', subjectTitle: 'Delivery delayed', subjectDescription: 'My order is delayed by more than 4 days past the scheduled window.', category: 'Delivery', priority: 'Low', status: 'Resolved', channel: 'Web', createdAt: '09 May 2024\n10:00 AM', updatedAt: '09 May 2024\n03:15 PM' },
  { id: '9', complaintId: '#CMP-0001240', userName: 'Rohit Das', userEmail: 'rohit.das@email.com', userPhone: '+91 93210 98765', vendorName: 'GadgetCare India', subjectTitle: 'Damaged item received', subjectDescription: 'I received a damaged item with broken screen glass.', category: 'Orders', priority: 'High', status: 'Closed', channel: 'Email', createdAt: '08 May 2024\n07:15 PM', updatedAt: '09 May 2024\n07:45 PM' },
  { id: '10', complaintId: '#CMP-0001239', userName: 'Ananya Joshi', userEmail: 'ananya.joshi@email.com', userPhone: '+91 92109 87654', vendorName: 'Vogue Apparel', subjectTitle: 'Wrong item delivered', subjectDescription: 'I received a different item from what I ordered.', category: 'Orders', priority: 'Medium', status: 'Closed', channel: 'Chat', createdAt: '08 May 2024\n05:45 PM', updatedAt: '08 May 2024\n08:30 PM' },
];

const categoryColors: Record<string, string> = {
  Orders: '#10b981',
  Payments: '#3b82f6',
  Refunds: '#8b5cf6',
  Technical: '#0d9488',
  Account: '#3b82f6',
  Sellers: '#f59e0b',
  Delivery: '#ef4444'
};

const categoryBgColors: Record<string, string> = {
  Orders: '#ecfdf5',
  Payments: '#eff6ff',
  Refunds: '#f5f3ff',
  Technical: '#f0fdfa',
  Account: '#eff6ff',
  Sellers: '#fefce8',
  Delivery: '#fef2f2'
};

const priorityStyles: Record<string, { bg: string; color: string }> = {
  Urgent: { bg: '#fee2e2', color: '#b91c1c' },
  High: { bg: '#fee2e2', color: '#dc2626' },
  Medium: { bg: '#fef3c7', color: '#d97706' },
  Low: { bg: '#ecfdf5', color: '#059669' },
};

const statusStyles: Record<string, { bg: string; color: string }> = {
  Open: { bg: '#ecfdf5', color: '#059669' },
  'In Progress': { bg: '#fef3c7', color: '#d97706' },
  Resolved: { bg: '#eff6ff', color: '#2563eb' },
  Closed: { bg: '#f3f4f6', color: '#4b5563' },
};

const pieColors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

const categoriesList = [
  { name: 'Orders', count: 432, percentage: 34.62, color: '#3b82f6', icon: <CategoryIcon fontSize="small" sx={{ color: '#3b82f6' }} /> },
  { name: 'Payments', count: 228, percentage: 18.27, color: '#ef4444', icon: <Payment fontSize="small" sx={{ color: '#ef4444' }} /> },
  { name: 'Refunds', count: 156, percentage: 12.50, color: '#f59e0b', icon: <AccountBalanceWallet fontSize="small" sx={{ color: '#f59e0b' }} /> },
  { name: 'Technical', count: 150, percentage: 12.02, color: '#10b981', icon: <Build fontSize="small" sx={{ color: '#10b981' }} /> },
  { name: 'Account', count: 120, percentage: 9.62, color: '#8b5cf6', icon: <Person fontSize="small" sx={{ color: '#8b5cf6' }} /> },
  { name: 'Sellers', count: 102, percentage: 8.17, color: '#0ea5e9', icon: <Storefront fontSize="small" sx={{ color: '#0ea5e9' }} /> },
  { name: 'Delivery', count: 60, percentage: 4.81, color: '#f43f5e', icon: <LocalShipping fontSize="small" sx={{ color: '#f43f5e' }} /> },
];

export default function ComplaintsPage() {
  const router = useRouter();

  // State
  const [complaints, setComplaints] = useState<ComplaintRow[]>(INITIAL_MOCK_COMPLAINTS);
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 1248,
    open: 342,
    openPct: '27.40',
    inProgress: 218,
    inProgressPct: '17.47',
    resolved: 638,
    resolvedPct: '51.12',
    closed: 50,
    closedPct: '4.01'
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [channelFilter, setChannelFilter] = useState('All Channels');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateDialogOpen, setDateDialogOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs & Menus
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<ComplaintRow | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  // New Complaint Form State
  const [newComplaintForm, setNewComplaintForm] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    vendorName: '',
    relatedOrderId: '',
    relatedAmount: '',
    subjectTitle: '',
    subjectDescription: '',
    category: 'Orders',
    priority: 'Medium',
    severity: 'Moderate',
    channel: 'Email',
    assignedDepartment: 'Support'
  });

  // Fetch Complaints from PostgreSQL Database
  const fetchComplaints = useCallback(async () => {
    try {
      const res = await complaintsService.getAll({ take: 150 });
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped: ComplaintRow[] = res.data.data.map((c: any) => {
          const rawStatus = c.status;
          let displayStatus: ComplaintRow['status'] = 'Open';
          if (rawStatus === 'INVESTIGATING' || rawStatus === 'ACTION_REQUIRED') displayStatus = 'In Progress';
          else if (rawStatus === 'RESOLVED') displayStatus = 'Resolved';
          else if (rawStatus === 'CLOSED') displayStatus = 'Closed';

          let displayPriority: ComplaintRow['priority'] = 'Medium';
          if (c.priority === 'HIGH') displayPriority = 'High';
          else if (c.priority === 'URGENT') displayPriority = 'Urgent';
          else if (c.priority === 'LOW') displayPriority = 'Low';

          let displayChannel: ComplaintRow['channel'] = 'Email';
          if (c.channel === 'CHAT') displayChannel = 'Chat';
          else if (c.channel === 'WEB') displayChannel = 'Web';
          else if (c.channel === 'PHONE') displayChannel = 'Phone';

          const createdDate = new Date(c.createdAt);
          const updatedDate = new Date(c.updatedAt || c.createdAt);

          return {
            id: c.id,
            complaintId: c.complaintNumber.startsWith('#') ? c.complaintNumber : `#${c.complaintNumber}`,
            userName: c.userName,
            userEmail: c.userEmail,
            userPhone: c.userPhone || '+91 98765 43210',
            vendorName: c.vendorName || 'General Platform',
            subjectTitle: c.subjectTitle,
            subjectDescription: c.subjectDescription,
            category: c.category,
            priority: displayPriority,
            status: displayStatus,
            rawStatus: c.status,
            channel: displayChannel,
            assignedDepartment: c.assignedDepartment || 'Support',
            assignedAgent: c.assignedAgent || 'Admin User',
            createdAt: `${createdDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}\n${createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
            updatedAt: `${updatedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}\n${updatedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
          };
        });
        setComplaints(mapped);
      }
    } catch (e) {
      console.warn('Complaints API request fallback:', e);
    }
  }, []);

  // Fetch Stats from Backend
  const fetchStats = useCallback(async () => {
    try {
      const res = await complaintsService.getStats();
      if (res.data?.data) {
        const d = res.data.data;
        setStats({
          total: d.total || 1248,
          open: d.open || 342,
          openPct: d.openPercentage ? d.openPercentage.toFixed(2) : '27.40',
          inProgress: d.inProgress || 218,
          inProgressPct: d.inProgressPercentage ? d.inProgressPercentage.toFixed(2) : '17.47',
          resolved: d.resolved || 638,
          resolvedPct: d.resolvedPercentage ? d.resolvedPercentage.toFixed(2) : '51.12',
          closed: d.closed || 50,
          closedPct: d.closedPercentage ? d.closedPercentage.toFixed(2) : '4.01'
        });
      }
    } catch (e) {
      console.warn('Stats fetch fallback:', e);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, [fetchComplaints, fetchStats]);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchSearch = searchTerm === '' ||
        c.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subjectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subjectDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.vendorName && c.vendorName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'All Status' || c.status === statusFilter;
      const matchCategory = categoryFilter === 'All Categories' || c.category === categoryFilter;
      const matchPriority = priorityFilter === 'All Priorities' || c.priority === priorityFilter;
      const matchChannel = channelFilter === 'All Channels' || c.channel === channelFilter;

      return matchSearch && matchStatus && matchCategory && matchPriority && matchChannel;
    });
  }, [complaints, searchTerm, statusFilter, categoryFilter, priorityFilter, channelFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredComplaints.length / rowsPerPage) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredComplaints.slice(start, start + rowsPerPage);
  }, [filteredComplaints, page, rowsPerPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedComplaints(paginatedComplaints.map(c => c.id));
    } else {
      setSelectedComplaints([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedComplaints(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Status');
    setCategoryFilter('All Categories');
    setPriorityFilter('All Priorities');
    setChannelFilter('All Channels');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setSnackbar({ open: true, message: 'All filters reset.', severity: 'info' });
  };

  const handleExportCSV = () => {
    const headers = ['Complaint ID', 'User Name', 'User Email', 'User Phone', 'Vendor', 'Subject', 'Category', 'Priority', 'Status', 'Channel', 'Department', 'Created At', 'Last Updated'];
    const rows = filteredComplaints.map(c => [
      c.complaintId,
      `"${c.userName}"`,
      c.userEmail,
      c.userPhone || '',
      `"${c.vendorName || ''}"`,
      `"${c.subjectTitle.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.status,
      c.channel,
      c.assignedDepartment || '',
      `"${c.createdAt.replace('\n', ' ')}"`,
      `"${c.updatedAt.replace('\n', ' ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `complaints_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSnackbar({ open: true, message: 'Complaints report exported to CSV successfully!', severity: 'success' });
  };

  const handleCreateComplaint = async () => {
    if (!newComplaintForm.userName || !newComplaintForm.userEmail || !newComplaintForm.subjectTitle || !newComplaintForm.subjectDescription) {
      setSnackbar({ open: true, message: 'Please fill in all required fields.', severity: 'error' });
      return;
    }

    try {
      const res = await complaintsService.create({
        userName: newComplaintForm.userName,
        userEmail: newComplaintForm.userEmail,
        userPhone: newComplaintForm.userPhone,
        vendorName: newComplaintForm.vendorName,
        relatedOrderId: newComplaintForm.relatedOrderId,
        relatedAmount: newComplaintForm.relatedAmount,
        subjectTitle: newComplaintForm.subjectTitle,
        subjectDescription: newComplaintForm.subjectDescription,
        category: newComplaintForm.category,
        priority: newComplaintForm.priority.toUpperCase(),
        severity: newComplaintForm.severity.toUpperCase(),
        channel: newComplaintForm.channel.toUpperCase(),
        assignedDepartment: newComplaintForm.assignedDepartment,
      });

      setSnackbar({ open: true, message: 'New complaint registered successfully in PostgreSQL database!', severity: 'success' });
      setCreateDialogOpen(false);
      setNewComplaintForm({
        userName: '',
        userEmail: '',
        userPhone: '',
        vendorName: '',
        relatedOrderId: '',
        relatedAmount: '',
        subjectTitle: '',
        subjectDescription: '',
        category: 'Orders',
        priority: 'Medium',
        severity: 'Moderate',
        channel: 'Email',
        assignedDepartment: 'Support'
      });
      fetchComplaints();
      fetchStats();
    } catch (e) {
      console.error('Error creating complaint:', e);
      setSnackbar({ open: true, message: 'Failed to create complaint.', severity: 'error' });
    }
  };

  const handleNavigateToDetail = (complaintId: string) => {
    const cleanId = complaintId.replace('#', '');
    router.push(`/complaints/${cleanId}`);
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, row: ComplaintRow) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const renderChannel = (channel: string) => {
    const props = { sx: { fontSize: 16, color: '#64748b' } };
    let Icon = Email;
    if (channel === 'Chat') Icon = Chat;
    if (channel === 'Web') Icon = Language;
    if (channel === 'Phone') Icon = Phone;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Icon {...props} />
        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 500 }}>{channel}</Typography>
      </Box>
    );
  };

  const pieData = [
    { name: 'Open', value: stats.open, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
    { name: 'Resolved', value: stats.resolved, color: '#3b82f6' },
    { name: 'Closed', value: stats.closed, color: '#ef4444' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header and Breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Complaints</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.2 }}>
            Dashboard &gt; Complaints &gt; <strong>All Complaints</strong>
          </Typography>
        </Box>
      </Box>

      {/* 5 Top Summary Stat Cards */}
      <Grid container spacing={2}>
        {/* Total Complaints */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Avatar sx={{ bgcolor: '#f3e8ff', color: '#8b5cf6', width: 44, height: 44, borderRadius: 2 }}>
                <SupportAgent sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Total Complaints</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{stats.total.toLocaleString()}</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>All time complaints</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Open Complaints */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Avatar sx={{ bgcolor: '#dcfce7', color: '#10b981', width: 44, height: 44, borderRadius: 2 }}>
                <CheckCircleOutlined sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Open Complaints</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{stats.open}</Typography>
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, fontSize: '0.7rem' }}>{stats.openPct}% of total</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* In Progress */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Avatar sx={{ bgcolor: '#fef3c7', color: '#f59e0b', width: 44, height: 44, borderRadius: 2 }}>
                <Autorenew sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>In Progress</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{stats.inProgress}</Typography>
                <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.7rem' }}>{stats.inProgressPct}% of total</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Resolved */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Avatar sx={{ bgcolor: '#dbeafe', color: '#3b82f6', width: 44, height: 44, borderRadius: 2 }}>
                <TaskAlt sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Resolved</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{stats.resolved}</Typography>
                <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.7rem' }}>{stats.resolvedPct}% of total</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Closed */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Avatar sx={{ bgcolor: '#fee2e2', color: '#ef4444', width: 44, height: 44, borderRadius: 2 }}>
                <HighlightOff sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Closed</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{stats.closed}</Typography>
                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.7rem' }}>{stats.closedPct}% of total</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Grid: Left Table & Right Sidebar */}
      <Grid container spacing={3}>
        {/* Left Column (9 cols) */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', overflow: 'hidden' }}>
            
            {/* Filter Bar */}
            <Box sx={{ p: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #f1f5f9', bgcolor: '#ffffff' }}>
              <TextField
                placeholder="Search by complaint ID, user, email or subject..."
                size="small"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                sx={{ minWidth: 260, flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: '#94a3b8' }} /></InputAdornment> } }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2 }}>
                  <MenuItem value="All Status">All Status</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 135 }}>
                <Select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2 }}>
                  <MenuItem value="All Categories">All Categories</MenuItem>
                  <MenuItem value="Orders">Orders</MenuItem>
                  <MenuItem value="Payments">Payments</MenuItem>
                  <MenuItem value="Refunds">Refunds</MenuItem>
                  <MenuItem value="Technical">Technical</MenuItem>
                  <MenuItem value="Account">Account</MenuItem>
                  <MenuItem value="Sellers">Sellers</MenuItem>
                  <MenuItem value="Delivery">Delivery</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 125 }}>
                <Select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2 }}>
                  <MenuItem value="All Priorities">All Priorities</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 125 }}>
                <Select value={channelFilter} onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2 }}>
                  <MenuItem value="All Channels">All Channels</MenuItem>
                  <MenuItem value="Email">Email</MenuItem>
                  <MenuItem value="Chat">Chat</MenuItem>
                  <MenuItem value="Web">Web</MenuItem>
                  <MenuItem value="Phone">Phone</MenuItem>
                </Select>
              </FormControl>

              <Button 
                variant="outlined" 
                onClick={() => setDateDialogOpen(true)}
                endIcon={<CalendarToday sx={{ fontSize: 16 }} />} 
                sx={{ color: '#475569', borderColor: '#cbd5e1', textTransform: 'none', px: 2, borderRadius: 2, fontSize: '0.8rem', fontWeight: 600 }}
              >
                {startDate && endDate ? `${startDate} - ${endDate}` : 'Start Date  —  End Date'}
              </Button>

              <Button 
                variant="outlined" 
                startIcon={<FilterList sx={{ fontSize: 16 }} />} 
                onClick={fetchComplaints}
                sx={{ color: '#475569', borderColor: '#cbd5e1', textTransform: 'none', borderRadius: 2, fontSize: '0.8rem', fontWeight: 600 }}
              >
                Filters
              </Button>

              <Button 
                variant="text" 
                onClick={handleResetFilters}
                sx={{ color: '#64748b', textTransform: 'none', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Reset
              </Button>
            </Box>

            {/* Complaints Data Table */}
            <TableContainer>
              <Table sx={{ minWidth: 1050 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell padding="checkbox">
                      <Checkbox 
                        size="small" 
                        checked={paginatedComplaints.length > 0 && selectedComplaints.length === paginatedComplaints.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Complaint ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Channel</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Created On</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Last Updated</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>No complaints match your active filters.</Typography>
                        <Button variant="text" onClick={handleResetFilters} sx={{ mt: 1, textTransform: 'none' }}>Reset Filters</Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedComplaints.map((complaint) => {
                      const isSelected = selectedComplaints.includes(complaint.id);
                      return (
                        <TableRow 
                          key={complaint.id} 
                          hover 
                          selected={isSelected}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                          onClick={() => handleNavigateToDetail(complaint.complaintId)}
                        >
                          <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                            <Checkbox 
                              size="small" 
                              checked={isSelected}
                              onChange={() => handleSelectOne(complaint.id)}
                            />
                          </TableCell>
                          
                          {/* Complaint ID */}
                          <TableCell onClick={(e) => { e.stopPropagation(); handleNavigateToDetail(complaint.complaintId); }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563eb', '&:hover': { textDecoration: 'underline' } }}>
                              {complaint.complaintId}
                            </Typography>
                          </TableCell>
                          
                          {/* User */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#e2e8f0', color: '#334155', fontSize: '0.8rem', fontWeight: 700 }}>
                                {complaint.userName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', lineHeight: 1.2 }}>
                                  {complaint.userName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                                  {complaint.userEmail}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          
                          {/* Subject */}
                          <TableCell sx={{ maxWidth: 220 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem', lineHeight: 1.2 }}>
                              {complaint.subjectTitle}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {complaint.subjectDescription}
                            </Typography>
                          </TableCell>
                          
                          {/* Category */}
                          <TableCell>
                            <Chip 
                              label={complaint.category} 
                              size="small" 
                              sx={{ 
                                fontWeight: 700, 
                                fontSize: '0.72rem', 
                                bgcolor: categoryBgColors[complaint.category] || '#f1f5f9', 
                                color: categoryColors[complaint.category] || '#475569',
                                borderRadius: 1.5,
                                border: `1px solid ${categoryColors[complaint.category] || '#cbd5e1'}30`
                              }} 
                            />
                          </TableCell>
                          
                          {/* Priority */}
                          <TableCell>
                            <Chip
                              label={complaint.priority}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                bgcolor: priorityStyles[complaint.priority]?.bg || '#f1f5f9',
                                color: priorityStyles[complaint.priority]?.color || '#475569',
                                borderRadius: 1.5
                              }}
                            />
                          </TableCell>
                          
                          {/* Status */}
                          <TableCell>
                            <Chip
                              label={complaint.status}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                bgcolor: statusStyles[complaint.status]?.bg || '#f1f5f9',
                                color: statusStyles[complaint.status]?.color || '#475569',
                                borderRadius: 1.5
                              }}
                            />
                          </TableCell>
                          
                          {/* Channel */}
                          <TableCell>
                            {renderChannel(complaint.channel)}
                          </TableCell>
                          
                          {/* Created On */}
                          <TableCell>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontWeight: 600, color: '#334155', fontSize: '0.78rem', lineHeight: 1.3 }}>
                              {complaint.createdAt}
                            </Typography>
                          </TableCell>
                          
                          {/* Last Updated */}
                          <TableCell>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontWeight: 600, color: '#334155', fontSize: '0.78rem', lineHeight: 1.3 }}>
                              {complaint.updatedAt}
                            </Typography>
                          </TableCell>
                          
                          {/* Actions */}
                          <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="View Complaint Details">
                              <IconButton size="small" onClick={() => handleNavigateToDetail(complaint.complaintId)} sx={{ color: '#64748b', '&:hover': { color: '#2563eb' } }}>
                                <Visibility sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <IconButton size="small" onClick={(e) => handleActionClick(e, complaint)} sx={{ color: '#64748b' }}>
                              <MoreVert sx={{ fontSize: 18 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Bottom Pagination Bar */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderTop: '1px solid #f1f5f9' }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                Showing <strong>{filteredComplaints.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}</strong> to <strong>{Math.min(page * rowsPerPage, filteredComplaints.length)}</strong> of <strong>{stats.total.toLocaleString()}</strong> complaints
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }} sx={{ borderRadius: 2, fontSize: '0.8rem', height: 32 }}>
                    <MenuItem value={10}>10 / page</MenuItem>
                    <MenuItem value={25}>25 / page</MenuItem>
                    <MenuItem value={50}>50 / page</MenuItem>
                  </Select>
                </FormControl>

                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={(_, val) => setPage(val)} 
                  shape="rounded" 
                  color="primary"
                  sx={{
                    '& .Mui-selected': { bgcolor: '#2563eb !important', color: '#ffffff' }
                  }}
                />
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Right Column (3 cols): Sidebar Widgets */}
        <Grid size={{ xs: 12, lg: 3 }}>
          
          {/* Widget 1: Complaints Overview (Donut Chart) */}
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>Complaints Overview</Typography>
              
              <Box sx={{ height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Doughnut Text */}
                <Box sx={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.total.toLocaleString()}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>Total Complaints</Typography>
                </Box>
              </Box>

              <Stack spacing={1.25} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 500 }}>Open</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                    {stats.open} <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>({stats.openPct}%)</Typography>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 500 }}>In Progress</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                    {stats.inProgress} <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>({stats.inProgressPct}%)</Typography>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 500 }}>Resolved</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                    {stats.resolved} <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>({stats.resolvedPct}%)</Typography>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 500 }}>Closed</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                    {stats.closed} <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>({stats.closedPct}%)</Typography>
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Widget 2: Complaints by Category */}
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Complaints by Category</Typography>
              <Stack spacing={2}>
                {categoriesList.map((cat, idx) => (
                  <Box 
                    key={idx} 
                    onClick={() => { setCategoryFilter(cat.name); setPage(1); }}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', p: 0.5, borderRadius: 1.5, '&:hover': { bgcolor: '#f8fafc' } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: `${cat.color}15`, display: 'flex' }}>
                        {cat.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.82rem' }}>{cat.name}</Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.82rem' }}>
                      {cat.count} <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>({cat.percentage}%)</Typography>
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Widget 3: Quick Actions */}
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Quick Actions</Typography>
              <Stack spacing={2}>
                {/* 1. Create New Complaint */}
                <Box 
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, cursor: 'pointer', p: 1, borderRadius: 2, '&:hover': { bgcolor: '#f1f5f9' }, transition: 'all 0.15s' }}
                >
                  <Avatar sx={{ bgcolor: '#ecfdf5', color: '#10b981', width: 38, height: 38, borderRadius: 2 }}>
                    <AddCircleOutlined sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Create New Complaint</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Add a new formal complaint</Typography>
                  </Box>
                </Box>

                {/* 2. View All Complaints */}
                <Box 
                  onClick={handleResetFilters}
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, cursor: 'pointer', p: 1, borderRadius: 2, '&:hover': { bgcolor: '#f1f5f9' }, transition: 'all 0.15s' }}
                >
                  <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 38, height: 38, borderRadius: 2 }}>
                    <ListAlt sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>View All Complaints</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Browse all complaints</Typography>
                  </Box>
                </Box>

                {/* 3. Complaint Categories */}
                <Box 
                  onClick={() => setCategoriesDialogOpen(true)}
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, cursor: 'pointer', p: 1, borderRadius: 2, '&:hover': { bgcolor: '#f1f5f9' }, transition: 'all 0.15s' }}
                >
                  <Avatar sx={{ bgcolor: '#f8fafc', color: '#475569', width: 38, height: 38, borderRadius: 2 }}>
                    <CategoryIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Complaint Categories</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Manage categories</Typography>
                  </Box>
                </Box>

                {/* 4. Export Complaints */}
                <Box 
                  onClick={handleExportCSV}
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, cursor: 'pointer', p: 1, borderRadius: 2, '&:hover': { bgcolor: '#f1f5f9' }, transition: 'all 0.15s' }}
                >
                  <Avatar sx={{ bgcolor: '#fef3c7', color: '#d97706', width: 38, height: 38, borderRadius: 2 }}>
                    <FileDownload sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Export Complaints</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Download complaints report</Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

        </Grid>
      </Grid>

      {/* Row More Options Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleActionClose} PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}>
        <MenuItem onClick={() => { if (selectedRow) handleNavigateToDetail(selectedRow.complaintId); handleActionClose(); }}>
          <Visibility sx={{ fontSize: 16, mr: 1, color: '#64748b' }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => { if (selectedRow) handleNavigateToDetail(selectedRow.complaintId); handleActionClose(); }}>
          <Autorenew sx={{ fontSize: 16, mr: 1, color: '#64748b' }} /> Update Status
        </MenuItem>
        <MenuItem onClick={() => { if (selectedRow) handleNavigateToDetail(selectedRow.complaintId); handleActionClose(); }}>
          <Person sx={{ fontSize: 16, mr: 1, color: '#64748b' }} /> Assign Agent
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { if (selectedRow) handleNavigateToDetail(selectedRow.complaintId); handleActionClose(); }} sx={{ color: 'error.main' }}>
          <WarningAmber sx={{ fontSize: 16, mr: 1 }} /> Escalate
        </MenuItem>
      </Menu>

      {/* Create New Complaint Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Register Formal Complaint
          <IconButton size="small" onClick={() => setCreateDialogOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Submit a formal dispute or user grievance. An investigation case and audit record will be created in PostgreSQL.
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Complainant Name *" 
                fullWidth 
                size="small" 
                value={newComplaintForm.userName} 
                onChange={(e) => setNewComplaintForm(prev => ({ ...prev, userName: e.target.value }))} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Email Address *" 
                fullWidth 
                size="small" 
                value={newComplaintForm.userEmail} 
                onChange={(e) => setNewComplaintForm(prev => ({ ...prev, userEmail: e.target.value }))} 
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Mobile Phone" 
                fullWidth 
                size="small" 
                placeholder="+91 98765 43210"
                value={newComplaintForm.userPhone} 
                onChange={(e) => setNewComplaintForm(prev => ({ ...prev, userPhone: e.target.value }))} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Associated Vendor / Seller" 
                fullWidth 
                size="small" 
                placeholder="TechZone Electronics"
                value={newComplaintForm.vendorName} 
                onChange={(e) => setNewComplaintForm(prev => ({ ...prev, vendorName: e.target.value }))} 
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Related Order # / Transaction ID" 
                fullWidth 
                size="small" 
                placeholder="#ORD-9821"
                value={newComplaintForm.relatedOrderId} 
                onChange={(e) => setNewComplaintForm(prev => ({ ...prev, relatedOrderId: e.target.value }))} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Disputed Amount" 
                fullWidth 
                size="small" 
                placeholder="₹24,999"
                value={newComplaintForm.relatedAmount} 
                onChange={(e) => setNewComplaintForm(prev => ({ ...prev, relatedAmount: e.target.value }))} 
              />
            </Grid>
          </Grid>

          <TextField 
            label="Complaint Subject *" 
            fullWidth 
            size="small" 
            placeholder="Item not as described"
            value={newComplaintForm.subjectTitle} 
            onChange={(e) => setNewComplaintForm(prev => ({ ...prev, subjectTitle: e.target.value }))} 
          />

          <TextField 
            label="Detailed Complaint Description *" 
            fullWidth 
            multiline 
            rows={3} 
            size="small" 
            placeholder="Explain the grievance, issue timeline, and customer demands..."
            value={newComplaintForm.subjectDescription} 
            onChange={(e) => setNewComplaintForm(prev => ({ ...prev, subjectDescription: e.target.value }))} 
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={newComplaintForm.category} onChange={(e) => setNewComplaintForm(prev => ({ ...prev, category: e.target.value }))}>
                  <MenuItem value="Orders">Orders</MenuItem>
                  <MenuItem value="Payments">Payments</MenuItem>
                  <MenuItem value="Refunds">Refunds</MenuItem>
                  <MenuItem value="Technical">Technical</MenuItem>
                  <MenuItem value="Account">Account</MenuItem>
                  <MenuItem value="Sellers">Sellers</MenuItem>
                  <MenuItem value="Delivery">Delivery</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select label="Priority" value={newComplaintForm.priority} onChange={(e) => setNewComplaintForm(prev => ({ ...prev, priority: e.target.value }))}>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select label="Severity" value={newComplaintForm.severity} onChange={(e) => setNewComplaintForm(prev => ({ ...prev, severity: e.target.value }))}>
                  <MenuItem value="Minor">Minor</MenuItem>
                  <MenuItem value="Moderate">Moderate</MenuItem>
                  <MenuItem value="Major">Major</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: '#64748b', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateComplaint} sx={{ bgcolor: '#2563eb', textTransform: 'none', px: 3, borderRadius: 2 }}>
            Register Complaint
          </Button>
        </DialogActions>
      </Dialog>

      {/* Date Range Dialog */}
      <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Filter by Date Range</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
          <TextField 
            label="Start Date" 
            type="date" 
            fullWidth 
            size="small" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            slotProps={{ inputLabel: { shrink: true } }} 
          />
          <TextField 
            label="End Date" 
            type="date" 
            fullWidth 
            size="small" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            slotProps={{ inputLabel: { shrink: true } }} 
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setStartDate(''); setEndDate(''); setDateDialogOpen(false); }} sx={{ color: '#64748b' }}>Clear</Button>
          <Button variant="contained" onClick={() => setDateDialogOpen(false)} sx={{ bgcolor: '#2563eb' }}>Apply</Button>
        </DialogActions>
      </Dialog>

      {/* Categories Breakdown Dialog */}
      <Dialog open={categoriesDialogOpen} onClose={() => setCategoriesDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Complaint Categories Distribution
          <IconButton size="small" onClick={() => setCategoriesDialogOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {categoriesList.map((cat, idx) => (
              <Box key={idx} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: `${cat.color}20`, color: cat.color }}>{cat.icon}</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{cat.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Active dispute category</Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>{cat.count}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>{cat.percentage}% of all cases</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Global Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>

    </Box>
  );
}
