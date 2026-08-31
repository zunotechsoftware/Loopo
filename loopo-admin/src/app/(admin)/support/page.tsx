'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Checkbox,
  Select,
  FormControl,
  Avatar,
  Stack,
  Breadcrumbs,
  Link,
  Pagination,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search,
  Visibility,
  MoreVert,
  ConfirmationNumber,
  HourglassEmpty,
  CheckCircle,
  Cancel,
  ContactSupport,
  Email as EmailIcon,
  Chat as ChatIcon,
  Language as WebIcon,
  Phone as PhoneIcon,
  CalendarToday,
  RestartAlt,
  FilterList,
  Add,
  ArrowForward,
  Assignment,
  Category,
  GetApp
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { supportTicketsService } from '@/services/admin.service';

export interface SupportTicket {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  assignedAgent: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'Pending' | 'Resolved' | 'Closed';
  channel: 'Email' | 'Chat' | 'Web' | 'Phone';
  createdOn: string;
  lastReply: string;
}

const AGENTS = ['Support Agent A', 'Admin User', 'Support Specialist B', 'Manager C'];

const USERS = [
  { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91 98765 43210' },
  { name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91 91234 56789' },
  { name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '+91 88776 65544' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@email.com', phone: '+91 99887 76655' },
  { name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '+91 97654 32109' },
  { name: 'Neha Verma', email: 'neha.verma@email.com', phone: '+91 96543 21098' },
  { name: 'Arjun Mehta', email: 'arjun.mehta@email.com', phone: '+91 95432 10987' },
  { name: 'Kavya Nair', email: 'kavya.nair@email.com', phone: '+91 94321 09876' },
  { name: 'Rohit Das', email: 'rohit.das@email.com', phone: '+91 93210 98765' },
  { name: 'Ananya Joshi', email: 'ananya.joshi@email.com', phone: '+91 92109 87654' },
  { name: 'Sanjay Gupta', email: 'sanjay.gupta@email.com', phone: '+91 91098 76543' },
  { name: 'Deepa Krishnan', email: 'deepa.k@email.com', phone: '+91 90987 65432' },
  { name: 'Vijay Chawla', email: 'vijay.chawla@email.com', phone: '+91 89876 54321' },
  { name: 'Meera Sen', email: 'meera.sen@email.com', phone: '+91 88765 43210' },
  { name: 'Karthik Raja', email: 'karthik.raja@email.com', phone: '+91 87654 32109' },
  { name: 'Pooja Hegde', email: 'pooja.hegde@email.com', phone: '+91 86543 21098' }
];

const CATEGORIES = ['Listings', 'Payments', 'Refunds', 'Technical', 'Account', 'Payouts', 'Orders'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
const STATUSES = ['Open', 'Pending', 'Resolved', 'Closed'] as const;
const CHANNELS = ['Email', 'Chat', 'Web', 'Phone'] as const;

const SUBJECTS_BY_CATEGORY: Record<string, string[]> = {
  Listings: [
    'Image upload limit exceeded error',
    'Listing rejected without clear reason',
    'Cannot edit active product listing details',
    'Listing description formatting is broken',
    'Item details not showing under Mobiles category'
  ],
  Payments: [
    'Payment completed but status still Escrow Pending',
    'Bank account verification pending for 3 days',
    'Double debited for subscription boost package',
    'Invoice not received for order #ORD-2831',
    'Failed payment message on checkout screen'
  ],
  Refunds: [
    'Refund not processed for canceled order',
    'Canceled booking refund timeline inquiry',
    'Refund transaction reference missing',
    'Wrong refund amount credited to bank card',
    'Dispute refund request for order #ORD-1229'
  ],
  Technical: [
    'Login page loops and doesn\'t redirect',
    'App crashes frequently on camera capture',
    'Push notifications not delivering on Android',
    'Profile image upload throws server error 500',
    'Search bar filter results are unresponsive'
  ],
  Account: [
    'Seller account suspension appeal',
    'Reset password verification email not received',
    'Update profile mobile number request',
    'Verify business tax registration document',
    'Close account and delete user profile data'
  ],
  Payouts: [
    'Seller payout delayed for completed orders',
    'Payout bank details update failing',
    'Commission fee structure question',
    'Missing payout settlement statement for May',
    'Minimum payout threshold limits check'
  ],
  Orders: [
    'Item received is not as described in listing',
    'Courier partner tracking status update request',
    'Cancel order request for #ORD-12932',
    'Delivery address incorrect after order confirmation',
    'Buyer claims package not received but marked delivered'
  ]
};

function seedTickets(): SupportTicket[] {
  const tickets: SupportTicket[] = [];
  for (let i = 0; i < 150; i++) {
    const idNum = 1254 - i;
    const ticketId = `#TKT-000${idNum}`;
    const user = USERS[i % USERS.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    const subjects = SUBJECTS_BY_CATEGORY[category];
    const subject = subjects[i % subjects.length];
    const priority = PRIORITIES[i % PRIORITIES.length];
    const status = STATUSES[i % STATUSES.length];
    const channel = CHANNELS[i % CHANNELS.length];
    const assignedAgent = AGENTS[i % AGENTS.length];
    
    const day = 12 - Math.floor(i / 13);
    const hour = (10 + (i * 7)) % 12 || 12;
    const min = (15 + (i * 9)) % 60;
    const ampm = i % 2 === 0 ? 'AM' : 'PM';
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const minStr = min < 10 ? `0${min}` : `${min}`;
    const createdOn = `${dayStr} May 2024, ${hour}:${minStr} ${ampm}`;
    
    const replyMin = (min + 15) % 60;
    const replyHour = replyMin < min ? (hour + 1) % 12 || 12 : hour;
    const replyMinStr = replyMin < 10 ? `0${replyMin}` : `${replyMin}`;
    const lastReply = `${dayStr} May 2024, ${replyHour}:${replyMinStr} ${ampm}`;
    
    tickets.push({
      id: ticketId,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      assignedAgent,
      subject,
      category,
      priority,
      status,
      channel,
      createdOn,
      lastReply
    });
  }
  return tickets;
}

const MOCK_TICKETS = seedTickets();

const StatCard = ({ title, value, percentage, subText, icon, color }: any) => (
  <Card sx={{ flex: 1, p: 2.5, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {React.cloneElement(icon, { sx: { color: color, fontSize: 22 } })}
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{title}</Typography>
      <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>{value}</Typography>
        {percentage && (
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }}>
            {percentage} {subText}
          </Typography>
        )}
      </Stack>
    </Box>
  </Card>
);

const ChannelItem = ({ name, count, percentage, icon }: any) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box sx={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{name}</Typography>
    </Stack>
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{count}</Typography>
      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>({percentage})</Typography>
    </Stack>
  </Box>
);

const QuickActionItem = ({ title, sub, icon, onClick }: any) => (
  <Box 
    onClick={onClick}
    sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      p: 1.5, 
      borderRadius: 2.5, 
      cursor: 'pointer',
      '&:hover': { bgcolor: '#f8fafc' }
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25 }}>{sub}</Typography>
      </Box>
    </Stack>
    <ArrowForward sx={{ fontSize: 16, color: '#94a3b8' }} />
  </Box>
);

export default function SupportTicketsPage() {
  const router = useRouter();

  // Dynamic synchronized tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);

  // Sync tickets with PostgreSQL backend or localStorage fallback
  const syncTickets = useCallback(async () => {
    try {
      const res = await supportTicketsService.getAll({ take: 150 });
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped: SupportTicket[] = res.data.data.map((t: any) => ({
          id: t.ticketNumber.startsWith('#') ? t.ticketNumber : `#${t.ticketNumber}`,
          userName: t.userName,
          userEmail: t.userEmail,
          userPhone: t.userPhone || '+91 98765 43210',
          assignedAgent: t.assignedAgent || 'Support Agent A',
          subject: t.subject,
          category: t.category,
          priority: t.priority === 'HIGH' ? 'High' : t.priority === 'URGENT' ? 'Urgent' : t.priority === 'LOW' ? 'Low' : 'Medium',
          status: t.status === 'IN_PROGRESS' ? 'Pending' : t.status === 'WAITING_FOR_USER' ? 'Pending' : t.status === 'RESOLVED' ? 'Resolved' : t.status === 'CLOSED' ? 'Closed' : 'Open',
          channel: t.channel === 'EMAIL' ? 'Email' : t.channel === 'CHAT' ? 'Chat' : t.channel === 'PHONE' ? 'Phone' : 'Web',
          createdOn: new Date(t.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          lastReply: new Date(t.lastReplyAt || t.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        }));
        setTickets(mapped);
        return;
      }
    } catch (e) {
      console.warn('Backend API request fallback to local sync:', e);
    }

    if (typeof window === 'undefined') return;
    try {
      const updatedList = MOCK_TICKETS.map(t => {
        const key = `loopo_support_ticket_${t.id.replace('#', '')}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.ticket) {
              return {
                ...t,
                status: parsed.ticket.status || t.status,
                priority: parsed.ticket.priority || t.priority,
                assignedAgent: parsed.assignee || parsed.ticket.assignedAgent || t.assignedAgent
              };
            }
          } catch (e) {
            // ignore
          }
        }
        return t;
      });
      setTickets(updatedList);
    } catch (e) {
      console.warn('Error reading localStorage for tickets:', e);
    }
  }, []);

  useEffect(() => {
    syncTickets();
    window.addEventListener('focus', syncTickets);
    window.addEventListener('storage', syncTickets);
    return () => {
      window.removeEventListener('focus', syncTickets);
      window.removeEventListener('storage', syncTickets);
    };
  }, [syncTickets]);

  // Filter & Pagination States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [channelFilter, setChannelFilter] = useState('All Channels');
  const [agentFilter, setAgentFilter] = useState('All Agents');

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  // Reset Filters handler
  const handleReset = () => {
    setSearch('');
    setStatusFilter('All Status');
    setCategoryFilter('All Categories');
    setPriorityFilter('All Priorities');
    setChannelFilter('All Channels');
    setAgentFilter('All Agents');
    setPage(1);
  };

  const handleExport = () => {
    const headers = ['Ticket ID', 'User', 'Email', 'Phone', 'Assigned Agent', 'Subject', 'Category', 'Priority', 'Status', 'Channel', 'Created On', 'Last Reply'];
    const rows = filteredTickets.map(t => [
      t.id,
      t.userName,
      t.userEmail,
      t.userPhone,
      t.assignedAgent,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.category,
      t.priority,
      t.status,
      t.channel,
      t.createdOn,
      t.lastReply
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `support_tickets_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({ open: true, message: 'Support tickets exported successfully!', severity: 'success' });
  };

  const getPriorityChip = (priority: SupportTicket['priority']) => {
    let bg = '#fef2f2', color = '#dc2626'; // High / Urgent
    if (priority === 'Medium') { bg = '#fef3c7'; color = '#d97706'; }
    if (priority === 'Low') { bg = '#eff6ff'; color = '#2563eb'; }
    return (
      <Chip
        label={priority}
        size="small"
        sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: bg, color: color, borderRadius: 1 }}
      />
    );
  };

  const getStatusChip = (status: SupportTicket['status']) => {
    let bg = '#ecfdf5', color = '#059669'; // Open / Resolved
    if (status === 'Pending') { bg = '#fef3c7'; color = '#d97706'; }
    if (status === 'Closed') { bg = '#f3f4f6'; color = '#4b5563'; }
    return (
      <Chip
        label={status}
        size="small"
        sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: bg, color: color, borderRadius: 1 }}
      />
    );
  };

  const getChannelIcon = (channel: SupportTicket['channel']) => {
    switch (channel) {
      case 'Email': return <EmailIcon sx={{ fontSize: 16 }} />;
      case 'Chat': return <ChatIcon sx={{ fontSize: 16 }} />;
      case 'Web': return <WebIcon sx={{ fontSize: 16 }} />;
      case 'Phone': return <PhoneIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Listings': return { bg: '#f5f3ff', color: '#7c3aed' };
      case 'Payments': return { bg: '#eff6ff', color: '#2563eb' };
      case 'Refunds': return { bg: '#ecfdf5', color: '#059669' };
      case 'Technical': return { bg: '#fee2e2', color: '#dc2626' };
      case 'Account': return { bg: '#fff7ed', color: '#ea580c' };
      case 'Payouts': return { bg: '#fdf2f8', color: '#db2777' };
      default: return { bg: '#f3f4f6', color: '#4b5563' };
    }
  };

  // Filtering Ticket Logic
  const filteredTickets = tickets.filter((ticket) => {
    // 1. Status Filter
    if (statusFilter && statusFilter !== 'All Status' && ticket.status !== statusFilter) return false;
    // 2. Category Filter
    if (categoryFilter && categoryFilter !== 'All Categories' && ticket.category !== categoryFilter) return false;
    // 3. Priority Filter
    if (priorityFilter && priorityFilter !== 'All Priorities' && ticket.priority !== priorityFilter) return false;
    // 4. Channel Filter
    if (channelFilter && channelFilter !== 'All Channels' && ticket.channel !== channelFilter) return false;
    // 5. Agent Filter
    if (agentFilter && agentFilter !== 'All Agents' && ticket.assignedAgent !== agentFilter) return false;

    // 6. Search Text Filter (ID, User name, Email, Phone number, Subject)
    if (search) {
      const q = search.toLowerCase();
      const matchId = ticket.id.toLowerCase().includes(q);
      const matchName = ticket.userName.toLowerCase().includes(q);
      const matchEmail = ticket.userEmail.toLowerCase().includes(q);
      const matchPhone = (ticket.userPhone || '').toLowerCase().includes(q);
      const matchSubject = ticket.subject.toLowerCase().includes(q);
      return matchId || matchName || matchEmail || matchPhone || matchSubject;
    }

    return true;
  });

  const pageCount = Math.ceil(filteredTickets.length / rowsPerPage);
  const paginatedTickets = filteredTickets.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const pendingCount = tickets.filter(t => t.status === 'Pending').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const closedCount = tickets.filter(t => t.status === 'Closed').length;

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Page Title & Breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Support Tickets</Typography>
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
            <Link underline="hover" color="inherit" onClick={() => router.push('/dashboard')} sx={{ cursor: 'pointer' }}>
              Dashboard
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 500 }}>Support Tickets</Typography>
          </Breadcrumbs>
        </Box>
      </Box>

      {/* Metrics Row */}
      <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
        <StatCard title="Total Tickets" value={tickets.length.toLocaleString()} icon={<ConfirmationNumber />} color="#3b82f6" />
        <StatCard title="Open Tickets" value={openCount.toLocaleString()} percentage={`${((openCount / tickets.length) * 100).toFixed(1)}%`} subText="of total" icon={<ContactSupport />} color="#10b981" />
        <StatCard title="Pending Tickets" value={pendingCount.toLocaleString()} percentage={`${((pendingCount / tickets.length) * 100).toFixed(1)}%`} subText="of total" icon={<HourglassEmpty />} color="#f59e0b" />
        <StatCard title="Resolved Tickets" value={resolvedCount.toLocaleString()} percentage={`${((resolvedCount / tickets.length) * 100).toFixed(1)}%`} subText="of total" icon={<CheckCircle />} color="#3b82f6" />
        <StatCard title="Closed Tickets" value={closedCount.toLocaleString()} percentage={`${((closedCount / tickets.length) * 100).toFixed(1)}%`} subText="of total" icon={<Cancel />} color="#ef4444" />
      </Box>

      {/* Main Filter and Sidebar Grid Layout */}
      <Grid container spacing={3}>
        {/* Left Columns (9 cols in grid layout) - Search & Table */}
        <Grid item xs={12} lg={9.2} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            
            {/* Filter Bar */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search Box */}
              <TextField
                size="small"
                placeholder="Search by ticket ID, user, email, phone or subject..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                slotProps={{
                  input: {
                    startAdornment: <Search sx={{ color: '#94a3b8', fontSize: 18, mr: 0.5 }} />
                  }
                }}
                sx={{ flexGrow: 1, minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Status Select */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="All Status">All Status</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>

              {/* Category Select */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="All Categories">All Categories</MenuItem>
                  <MenuItem value="Listings">Listings</MenuItem>
                  <MenuItem value="Payments">Payments</MenuItem>
                  <MenuItem value="Refunds">Refunds</MenuItem>
                  <MenuItem value="Technical">Technical</MenuItem>
                  <MenuItem value="Account">Account</MenuItem>
                  <MenuItem value="Payouts">Payouts</MenuItem>
                  <MenuItem value="Orders">Orders</MenuItem>
                </Select>
              </FormControl>

              {/* Priority Select */}
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={priorityFilter}
                  onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="All Priorities">All Priorities</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>

              {/* Channel Select */}
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={channelFilter}
                  onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="All Channels">All Channels</MenuItem>
                  <MenuItem value="Email">Email</MenuItem>
                  <MenuItem value="Chat">Chat</MenuItem>
                  <MenuItem value="Web">Web</MenuItem>
                  <MenuItem value="Phone">Phone</MenuItem>
                </Select>
              </FormControl>

              {/* Agent Select */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={agentFilter}
                  onChange={(e) => { setAgentFilter(e.target.value); setPage(1); }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="All Agents">All Agents</MenuItem>
                  <MenuItem value="Support Agent A">Support Agent A</MenuItem>
                  <MenuItem value="Admin User">Admin User</MenuItem>
                  <MenuItem value="Support Specialist B">Support Specialist B</MenuItem>
                  <MenuItem value="Manager C">Manager C</MenuItem>
                </Select>
              </FormControl>

              {/* Reset Filters */}
              <IconButton onClick={handleReset} title="Reset Filters" sx={{ border: '1px solid #cbd5e1', borderRadius: 2, p: 0.8 }}>
                <RestartAlt sx={{ fontSize: 18, color: '#64748b' }} />
              </IconButton>
            </Box>

            {/* Tickets Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Ticket ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Channel</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Created On</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                        No support tickets found matching current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTickets.map((ticket) => {
                      const catStyle = getCategoryColor(ticket.category);
                      return (
                        <TableRow key={ticket.id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox size="small" />
                          </TableCell>
                          <TableCell
                            onClick={() => router.push(`/support/${ticket.id.replace('#', '')}`)}
                            sx={{ fontWeight: 700, color: '#1d4ed8', fontSize: '0.8rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {ticket.id}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: '#1d4ed8', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                {ticket.userName[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e293b', display: 'block' }}>{ticket.userName}</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>{ticket.userEmail}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 160 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ticket.subject}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.category}
                              size="small"
                              sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: catStyle.bg, color: catStyle.color, borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell>{getPriorityChip(ticket.priority)}</TableCell>
                          <TableCell>{getStatusChip(ticket.status)}</TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" sx={{ color: '#64748b' }}>
                              {getChannelIcon(ticket.channel)}
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>{ticket.channel}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                            {ticket.createdOn.split(',')[0]}
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton size="small" onClick={() => router.push(`/support/${ticket.id.replace('#', '')}`)} title="View Detail">
                                <Visibility fontSize="small" sx={{ color: '#64748b' }} />
                              </IconButton>
                              <IconButton size="small">
                                <MoreVert fontSize="small" sx={{ color: '#64748b' }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                Showing {filteredTickets.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, filteredTickets.length)} of {filteredTickets.length} tickets
              </Typography>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(e, value) => setPage(value)}
                variant="outlined"
                shape="rounded"
                size="small"
                color="primary"
              />
            </Box>
          </Card>
        </Grid>

        {/* Right Sidebar (2.8 cols) - Charts and Actions */}
        <Grid item xs={12} lg={2.8} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Donut Chart Visual overview */}
          <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Tickets Overview</Typography>
            
            {/* SVG Donut representation */}
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', my: 2 }}>
              <svg width="150" height="150" viewBox="0 0 42 42" className="donut">
                <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
                <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f3f4f6" strokeWidth="4.2"></circle>
                
                {/* 27.29% Open (green) */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="4.2" strokeDasharray="27.29 72.71" strokeDashoffset="100"></circle>
                
                {/* 14.83% Pending (yellow) */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="4.2" strokeDasharray="14.83 85.17" strokeDashoffset="72.71"></circle>
                
                {/* 54.97% Resolved (blue) */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="4.2" strokeDasharray="54.97 45.03" strokeDashoffset="57.88"></circle>
                
                {/* 2.95% Closed (red) */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="4.2" strokeDasharray="2.95 97.05" strokeDashoffset="2.91"></circle>
              </svg>
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>1,254</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.6rem', display: 'block', mt: 0.25 }}>Total Tickets</Typography>
              </Box>
            </Box>

            {/* Donut Legend */}
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Open</Typography>
                </Stack>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>342 (27.29%)</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Pending</Typography>
                </Stack>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>186 (14.83%)</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Resolved</Typography>
                </Stack>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>689 (54.97%)</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Closed</Typography>
                </Stack>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>37 (2.95%)</Typography>
              </Box>
            </Stack>
          </Card>

          {/* Channels breakdown */}
          <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Tickets by Channel</Typography>
            <Stack spacing={1}>
              <ChannelItem name="Email" count="512" percentage="40.83%" icon={<EmailIcon sx={{ fontSize: 16 }} />} />
              <ChannelItem name="Chat" count="386" percentage="30.81%" icon={<ChatIcon sx={{ fontSize: 16 }} />} />
              <ChannelItem name="Web" count="228" percentage="18.18%" icon={<WebIcon sx={{ fontSize: 16 }} />} />
              <ChannelItem name="Phone" count="128" percentage="10.18%" icon={<PhoneIcon sx={{ fontSize: 16 }} />} />
            </Stack>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Quick Actions</Typography>
            <Stack spacing={1.5}>
              <QuickActionItem
                title="Create New Ticket"
                sub="Add a new support ticket"
                icon={<Add sx={{ fontSize: 18 }} />}
                onClick={() => setSnackbar({ open: true, message: 'Create New Ticket modal form triggered!', severity: 'info' })}
              />
              <QuickActionItem
                title="View All Tickets"
                sub="Browse all support tickets"
                icon={<Assignment sx={{ fontSize: 18 }} />}
                onClick={handleReset}
              />
              <QuickActionItem
                title="Ticket Categories"
                sub="Manage ticket categories"
                icon={<Category sx={{ fontSize: 18 }} />}
                onClick={() => setSnackbar({ open: true, message: 'Ticket Categories panel selection triggered!', severity: 'info' })}
              />
              <QuickActionItem
                title="Export Tickets"
                sub="Download tickets report"
                icon={<GetApp sx={{ fontSize: 18 }} />}
                onClick={handleExport}
              />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
