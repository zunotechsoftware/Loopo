'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, TextField, InputAdornment, Select, MenuItem,
  FormControl, Avatar, Pagination, Stack, Checkbox, Menu
} from '@mui/material';
import {
  Search, FilterList, RestartAlt, CalendarToday, Visibility, MoreVert,
  SupportAgent, CheckCircleOutlined, Autorenew, TaskAlt, HighlightOff,
  Email, Chat, Language, Phone, AddCircleOutlined, ListAlt,
  Category as CategoryIcon, FileDownload
} from '@mui/icons-material';
import { Complaint } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const MOCK_COMPLAINTS: Complaint[] = [
  { id: '1', complaintId: '#CMP-0001248', userName: 'Rahul Sharma', userEmail: 'rahul.sharma@email.com', subjectTitle: 'Item not as described', subjectDescription: 'The product I received is...', category: 'Orders', priority: 'High', status: 'Open', channel: 'Email', createdAt: '12 May 2024\n10:31 AM', updatedAt: '12 May 2024\n10:31 AM' },
  { id: '2', complaintId: '#CMP-0001247', userName: 'Priya Patel', userEmail: 'priya.patel@email.com', subjectTitle: 'Payment issue', subjectDescription: 'Payment was deducted but...', category: 'Payments', priority: 'High', status: 'In Progress', channel: 'Chat', createdAt: '12 May 2024\n09:15 AM', updatedAt: '12 May 2024\n11:20 AM' },
  { id: '3', complaintId: '#CMP-0001246', userName: 'Amit Kumar', userEmail: 'amit.kumar@email.com', subjectTitle: 'Refund not received', subjectDescription: 'I requested a refund but...', category: 'Refunds', priority: 'Medium', status: 'In Progress', channel: 'Web', createdAt: '11 May 2024\n08:45 PM', updatedAt: '11 May 2024\n09:50 PM' },
  { id: '4', complaintId: '#CMP-0001245', userName: 'Sneha Reddy', userEmail: 'sneha.reddy@email.com', subjectTitle: 'Unable to upload images', subjectDescription: 'I am unable to upload...', category: 'Technical', priority: 'Medium', status: 'Open', channel: 'Email', createdAt: '11 May 2024\n06:20 PM', updatedAt: '11 May 2024\n06:20 PM' },
  { id: '5', complaintId: '#CMP-0001244', userName: 'Vikram Singh', userEmail: 'vikram.singh@email.com', subjectTitle: 'Account verification issue', subjectDescription: 'My account is under...', category: 'Account', priority: 'Low', status: 'Resolved', channel: 'Phone', createdAt: '10 May 2024\n04:30 PM', updatedAt: '11 May 2024\n10:15 AM' },
  { id: '6', complaintId: '#CMP-0001243', userName: 'Neha Verma', userEmail: 'neha.verma@email.com', subjectTitle: 'Login problems', subjectDescription: 'I can\'t login to my account...', category: 'Technical', priority: 'High', status: 'Resolved', channel: 'Chat', createdAt: '10 May 2024\n02:30 PM', updatedAt: '10 May 2024\n05:40 PM' },
  { id: '7', complaintId: '#CMP-0001242', userName: 'Arjun Mehta', userEmail: 'arjun.mehta@email.com', subjectTitle: 'Seller not responding', subjectDescription: 'The seller is not replying to...', category: 'Sellers', priority: 'Medium', status: 'Open', channel: 'Email', createdAt: '09 May 2024\n11:20 AM', updatedAt: '09 May 2024\n11:20 AM' },
  { id: '8', complaintId: '#CMP-0001241', userName: 'Kavya Nair', userEmail: 'kavya.nair@email.com', subjectTitle: 'Delivery delayed', subjectDescription: 'My order is delayed by more...', category: 'Delivery', priority: 'Low', status: 'Resolved', channel: 'Web', createdAt: '09 May 2024\n10:00 AM', updatedAt: '09 May 2024\n03:15 PM' },
  { id: '9', complaintId: '#CMP-0001240', userName: 'Rohit Das', userEmail: 'rohit.das@email.com', subjectTitle: 'Damaged item received', subjectDescription: 'I received a damaged item...', category: 'Orders', priority: 'High', status: 'Closed', channel: 'Email', createdAt: '08 May 2024\n07:15 PM', updatedAt: '09 May 2024\n07:45 PM' },
  { id: '10', complaintId: '#CMP-0001239', userName: 'Ananya Joshi', userEmail: 'ananya.joshi@email.com', subjectTitle: 'Wrong item delivered', subjectDescription: 'I received a different item...', category: 'Orders', priority: 'Medium', status: 'Closed', channel: 'Chat', createdAt: '08 May 2024\n05:45 PM', updatedAt: '08 May 2024\n08:30 PM' },
];

const categoryColors: Record<string, string> = {
  Orders: '#10b981', Payments: '#3b82f6', Refunds: '#8b5cf6',
  Technical: '#0d9488', Account: '#3b82f6', Sellers: '#64748b', Delivery: '#10b981'
};

const priorityColors: Record<string, 'error' | 'warning' | 'success'> = {
  High: 'error', Medium: 'warning', Low: 'success'
};

const statusColors: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
  Open: 'success', 'In Progress': 'warning', Resolved: 'info', Closed: 'error'
};

const summaryCards = [
  { title: 'Total Complaints', value: '1,248', sub: 'All time complaints', icon: <SupportAgent sx={{ color: '#8b5cf6' }} />, bg: '#f3e8ff' },
  { title: 'Open Complaints', value: '342', sub: '27.40% of total', icon: <CheckCircleOutlined sx={{ color: '#10b981' }} />, bg: '#d1fae5' },
  { title: 'In Progress', value: '218', sub: '17.47% of total', icon: <Autorenew sx={{ color: '#f59e0b' }} />, bg: '#fef3c7' },
  { title: 'Resolved', value: '638', sub: '51.12% of total', icon: <TaskAlt sx={{ color: '#3b82f6' }} />, bg: '#dbeafe' },
  { title: 'Closed', value: '50', sub: '4.01% of total', icon: <HighlightOff sx={{ color: '#ef4444' }} />, bg: '#fee2e2' },
];

const pieData = [
  { name: 'Open', value: 342, color: '#10b981' },
  { name: 'In Progress', value: 218, color: '#f59e0b' },
  { name: 'Resolved', value: 638, color: '#3b82f6' },
  { name: 'Closed', value: 50, color: '#ef4444' },
];

const categoriesList = [
  { name: 'Orders', count: 432, percentage: 34.62, color: '#3b82f6', icon: <CategoryIcon fontSize="small" sx={{ color: '#3b82f6' }} /> },
  { name: 'Payments', count: 228, percentage: 18.27, color: '#ef4444', icon: <CategoryIcon fontSize="small" sx={{ color: '#ef4444' }} /> },
  { name: 'Refunds', count: 156, percentage: 12.50, color: '#f59e0b', icon: <CategoryIcon fontSize="small" sx={{ color: '#f59e0b' }} /> },
  { name: 'Technical', count: 150, percentage: 12.02, color: '#10b981', icon: <CategoryIcon fontSize="small" sx={{ color: '#10b981' }} /> },
  { name: 'Account', count: 120, percentage: 9.62, color: '#8b5cf6', icon: <CategoryIcon fontSize="small" sx={{ color: '#8b5cf6' }} /> },
  { name: 'Sellers', count: 102, percentage: 8.17, color: '#0ea5e9', icon: <CategoryIcon fontSize="small" sx={{ color: '#0ea5e9' }} /> },
  { name: 'Delivery', count: 60, percentage: 4.81, color: '#f43f5e', icon: <CategoryIcon fontSize="small" sx={{ color: '#f43f5e' }} /> },
];

const quickActions = [
  { title: 'Create New Complaint', desc: 'Add a new complaint', icon: <AddCircleOutlined color="success" /> },
  { title: 'View All Complaints', desc: 'Browse all complaints', icon: <ListAlt color="info" /> },
  { title: 'Complaint Categories', desc: 'Manage categories', icon: <CategoryIcon color="action" /> },
  { title: 'Export Complaints', desc: 'Download complaints report', icon: <FileDownload color="warning" /> },
];

export default function ComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [channelFilter, setChannelFilter] = useState('All Channels');

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

  const renderChannel = (channel: string) => {
    const props = { fontSize: 'small' as const, sx: { color: 'text.secondary' } };
    let Icon = Email;
    if (channel === 'Chat') Icon = Chat;
    if (channel === 'Web') Icon = Language;
    if (channel === 'Phone') Icon = Phone;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon {...props} />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>{channel}</Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header and Breadcrumbs */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Complaints</Typography>
        <Typography variant="body2" color="text.secondary">Dashboard &gt; Complaints &gt; All Complaints</Typography>
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
                placeholder="Search by complaint ID, user, subject..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 250, flexGrow: 1 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="All Status">All Status</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <MenuItem value="All Categories">All Categories</MenuItem>
                  <MenuItem value="Orders">Orders</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <MenuItem value="All Priorities">All Priorities</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
                  <MenuItem value="All Channels">All Channels</MenuItem>
                  <MenuItem value="Email">Email</MenuItem>
                  <MenuItem value="Chat">Chat</MenuItem>
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
              <Table sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Complaint ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Channel</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Created On</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Last Updated</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_COMPLAINTS.map(complaint => (
                    <TableRow key={complaint.id} hover>
                      <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                      <TableCell>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', cursor: 'pointer' }}>
                          {complaint.complaintId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>{complaint.userName.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{complaint.userName}</Typography>
                            <Typography variant="caption" color="text.secondary">{complaint.userEmail}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>{complaint.subjectTitle}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                          {complaint.subjectDescription}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: categoryColors[complaint.category] || '#475569' }}>
                          {complaint.category}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={complaint.priority}
                          size="small"
                          color={priorityColors[complaint.priority]}
                          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 'bold' }}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={complaint.status}
                          size="small"
                          color={statusColors[complaint.status]}
                          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 'bold' }}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {renderChannel(complaint.channel)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontWeight: 'medium', color: '#334155' }}>
                          {complaint.createdAt}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontWeight: 'medium', color: '#334155' }}>
                          {complaint.updatedAt}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => handleActionClick(e, complaint.id)} sx={{ color: 'text.secondary' }}>
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
              <Typography variant="body2" color="text.secondary">Showing 1 to 10 of 1,248 complaints</Typography>
              <Pagination count={125} shape="rounded" color="primary" />
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Sidebar */}
        <Grid size={{ xs: 12, lg: 3 }}>
          
          {/* Complaints Overview */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Complaints Overview</Typography>
              
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
                  <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>1,248</Typography>
                  <Typography variant="caption" color="text.secondary">Total Complaints</Typography>
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
                      {item.value} <Typography component="span" variant="caption" color="text.secondary">({((item.value / 1248) * 100).toFixed(2)}%)</Typography>
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Complaints by Category */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Complaints by Category</Typography>
              <Stack spacing={2.5}>
                {categoriesList.map((cat, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: `${cat.color}15`, display: 'flex' }}>
                        {cat.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#334155' }}>{cat.name}</Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {cat.count} <Typography component="span" variant="caption" color="text.secondary">({cat.percentage}%)</Typography>
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
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

        </Grid>
      </Grid>

      {/* More Options Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleClose}>View Details</MenuItem>
        <MenuItem onClick={handleClose}>Update Status</MenuItem>
        <MenuItem onClick={handleClose}>Assign Agent</MenuItem>
        <MenuItem onClick={handleClose} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

    </Box>
  );
}
