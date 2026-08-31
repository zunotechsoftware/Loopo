'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Rating,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, TextField, InputAdornment, Menu, MenuItem, Checkbox,
  Select, FormControl, LinearProgress, Divider, Avatar, Pagination, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Tooltip,
  Breadcrumbs, Link, Paper
} from '@mui/material';
import {
  Search, MoreVert, Visibility, FilterList, RestartAlt,
  StarBorder, Star, ThumbUpAltOutlined, SentimentNeutralOutlined,
  ThumbDownAltOutlined, FormatListBulleted, PendingActions,
  VisibilityOff, Settings, Download, Smartphone, Headset,
  LaptopMac, Chair, Blender, CalendarToday, CheckCircle,
  Cancel, Flag, Reply, EditNote, Storefront, ShoppingCart,
  History, ReportProblem, Shield
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Review, ReviewModerationLog } from '@/types';

// Extended Seeded Reviews spanning full moderation lifecycle
const INITIAL_REVIEWS: Review[] = [
  {
    id: 'REV-001',
    title: 'Great product and condition!',
    comment: 'Very satisfied with the product quality. Packaging was intact, and delivery was prompt.',
    productId: 'p1',
    productTitle: 'iPhone 13 128GB',
    productCategory: 'Mobiles',
    vendorId: 'v1',
    vendorName: 'TechWorld Retailers',
    userId: 'u1',
    userName: 'Rahul Sharma',
    userEmail: 'rahul.sharma@email.com',
    rating: 5,
    ratingBreakdown: { quality: 5, value: 5, delivery: 5, customerService: 5 },
    status: 'Published',
    orderId: '#ORD-12458',
    createdAt: '12 May 2024, 10:31 AM',
    response: {
      text: 'Thank you for your fantastic feedback, Rahul! Glad you loved the iPhone.',
      responder: 'Loopo Customer Care',
      createdAt: '12 May 2024, 11:00 AM',
      isPublic: true
    },
    moderationHistory: [
      { action: 'Review submitted by customer', moderator: 'System', timestamp: '12 May 2024, 10:31 AM' },
      { action: 'Auto-approved and published', moderator: 'Admin Bot', timestamp: '12 May 2024, 10:35 AM' }
    ]
  },
  {
    id: 'REV-002',
    title: 'Good value for money',
    comment: 'Works as expected. Battery backup is good, though the noise cancellation is slightly less powerful than Bose.',
    productId: 'p2',
    productTitle: 'Sony WH-1000XM4',
    productCategory: 'Electronics',
    vendorId: 'v2',
    vendorName: 'AudioPro India',
    userId: 'u2',
    userName: 'Priya Patel',
    userEmail: 'priya.patel@email.com',
    rating: 4,
    ratingBreakdown: { quality: 4, value: 4, delivery: 5, customerService: 4 },
    status: 'Published',
    orderId: '#ORD-12457',
    createdAt: '12 May 2024, 09:15 AM',
    moderationHistory: [
      { action: 'Review submitted by customer', moderator: 'System', timestamp: '12 May 2024, 09:15 AM' },
      { action: 'Approved by moderator', moderator: 'Admin User', timestamp: '12 May 2024, 09:30 AM' }
    ]
  },
  {
    id: 'REV-003',
    title: 'Awaiting moderation: Solid wooden table',
    comment: 'The wood finish is very sturdy and fits my living room well. Waiting for platform verification.',
    productId: 'p3',
    productTitle: 'Dining Table Set',
    productCategory: 'Furniture',
    vendorId: 'v3',
    vendorName: 'UrbanLiving Store',
    userId: 'u3',
    userName: 'Amit Kumar',
    userEmail: 'amit.kumar@email.com',
    rating: 4,
    ratingBreakdown: { quality: 4, value: 4, delivery: 4, customerService: 4 },
    status: 'Under Review',
    orderId: '#ORD-12456',
    createdAt: '11 May 2024, 08:45 PM',
    moderationHistory: [
      { action: 'Review submitted by customer', moderator: 'System', timestamp: '11 May 2024, 08:45 PM' },
      { action: 'Moved to manual review queue', moderator: 'Automated Filter', timestamp: '11 May 2024, 08:46 PM' }
    ]
  },
  {
    id: 'REV-004',
    title: 'Not as described (Edited)',
    comment: 'The product has noticeable scratches on the lid and is not in mint condition as advertised by seller.',
    productId: 'p4',
    productTitle: 'MacBook Air M2',
    productCategory: 'Laptops',
    vendorId: 'v4',
    vendorName: 'AppleStore Delhi',
    userId: 'u4',
    userName: 'Sneha Reddy',
    userEmail: 'sneha.reddy@email.com',
    rating: 2,
    ratingBreakdown: { quality: 2, value: 2, delivery: 4, customerService: 3 },
    status: 'Approved',
    orderId: '#ORD-12455',
    createdAt: '11 May 2024, 06:20 PM',
    isEdited: true,
    moderationHistory: [
      { action: 'Review submitted by customer', moderator: 'System', timestamp: '11 May 2024, 06:20 PM' },
      { action: 'Customer edited review content', moderator: 'User', timestamp: '11 May 2024, 07:10 PM' },
      { action: 'Approved for public listing', moderator: 'Support Specialist', timestamp: '11 May 2024, 07:30 PM' }
    ]
  },
  {
    id: 'REV-005',
    title: 'Defective sensor - Suspicious Seller Claims',
    comment: 'Stopped working within a week. Seller claimed customer damage without inspection.',
    productId: 'p5',
    productTitle: 'Canon EOS R50',
    productCategory: 'Cameras',
    vendorId: 'v5',
    vendorName: 'ProCamera Hub',
    userId: 'u5',
    userName: 'Vikram Singh',
    userEmail: 'vikram.singh@email.com',
    rating: 1,
    ratingBreakdown: { quality: 1, value: 1, delivery: 3, customerService: 1 },
    status: 'Flagged',
    orderId: '#ORD-12454',
    createdAt: '10 May 2024, 04:30 PM',
    isReported: true,
    reportReason: 'Vendor disputed review claiming competitor harassment',
    moderationHistory: [
      { action: 'Review submitted by customer', moderator: 'System', timestamp: '10 May 2024, 04:30 PM' },
      { action: 'Flagged for investigation by Vendor ProCamera', moderator: 'Vendor Dispute Bot', timestamp: '10 May 2024, 05:00 PM' }
    ]
  },
  {
    id: 'REV-006',
    title: 'Excellent experience and fast delivery!',
    comment: 'Fast delivery and genuine product. Fits comfortably and looks very stylish.',
    productId: 'p6',
    productTitle: 'Nike Air Max',
    productCategory: 'Shoes',
    vendorId: 'v6',
    vendorName: 'SoleStore',
    userId: 'u6',
    userName: 'Neha Verma',
    userEmail: 'neha.verma@email.com',
    rating: 5,
    ratingBreakdown: { quality: 5, value: 5, delivery: 5, customerService: 5 },
    status: 'Published',
    orderId: '#ORD-12453',
    createdAt: '10 May 2024, 02:30 PM',
    moderationHistory: [
      { action: 'Review submitted by customer', moderator: 'System', timestamp: '10 May 2024, 02:30 PM' },
      { action: 'Published to marketplace', moderator: 'Admin User', timestamp: '10 May 2024, 02:45 PM' }
    ]
  },
  {
    id: 'REV-007',
    title: 'New submission pending first review',
    comment: 'Screen is bright and pencil response is instantaneous. Highly recommend for students.',
    productId: 'p7',
    productTitle: 'iPad Air 5',
    productCategory: 'Tablets',
    vendorId: 'v1',
    vendorName: 'TechWorld Retailers',
    userId: 'u7',
    userName: 'Arjun Mehta',
    userEmail: 'arjun.mehta@email.com',
    rating: 4,
    ratingBreakdown: { quality: 4, value: 4, delivery: 5, customerService: 4 },
    status: 'Submitted',
    orderId: '#ORD-12452',
    createdAt: '09 May 2024, 11:20 AM',
    moderationHistory: [
      { action: 'Review submitted by customer', moderator: 'System', timestamp: '09 May 2024, 11:20 AM' }
    ]
  },
  {
    id: 'REV-008',
    title: 'Inappropriate language and spam links',
    comment: 'Spam text promoting external telegram group and abusive comments about delivery rider.',
    productId: 'p8',
    productTitle: 'Washing Machine',
    productCategory: 'Home Appliances',
    vendorId: 'v7',
    vendorName: 'HomeAppliances Mart',
    userId: 'u8',
    userName: 'Kavya Nair',
    userEmail: 'kavya.nair@email.com',
    rating: 1,
    ratingBreakdown: { quality: 1, value: 1, delivery: 1, customerService: 1 },
    status: 'Hidden',
    orderId: '#ORD-12451',
    createdAt: '09 May 2024, 10:00 AM',
    isReported: true,
    reportReason: 'Contains external telegram spam links and abusive language',
    moderationHistory: [
      { action: 'Review submitted by customer', moderator: 'System', timestamp: '09 May 2024, 10:00 AM' },
      { action: 'Hidden from public view due to spam policy violation', moderator: 'Trust & Safety Moderator', timestamp: '09 May 2024, 10:15 AM' }
    ]
  }
];

const summaryCards = [
  { title: 'Total Reviews', value: '2,457', sub: 'All time platform reviews', icon: <StarBorder sx={{ color: '#8b5cf6' }} />, bg: '#f3e8ff' },
  { title: 'Positive Reviews', value: '1,980', sub: '80.57% of total', icon: <ThumbUpAltOutlined sx={{ color: '#10b981' }} />, bg: '#d1fae5' },
  { title: 'Neutral Reviews', value: '298', sub: '12.13% of total', icon: <SentimentNeutralOutlined sx={{ color: '#f59e0b' }} />, bg: '#fef3c7' },
  { title: 'Negative Reviews', value: '179', sub: '7.30% of total', icon: <ThumbDownAltOutlined sx={{ color: '#ef4444' }} />, bg: '#fee2e2' },
  { title: 'Average Rating', value: '4.3 / 5', sub: 'Based on verified reviews', icon: <StarBorder sx={{ color: '#3b82f6' }} />, bg: '#dbeafe' },
];

const ratingDistribution = [
  { stars: 5, count: '1,398', percentage: 56.9, color: '#10b981' },
  { stars: 4, count: '582', percentage: 23.7, color: '#10b981' },
  { stars: 3, count: '298', percentage: 12.1, color: '#f59e0b' },
  { stars: 2, count: '106', percentage: 4.3, color: '#ef4444' },
  { stars: 1, count: '73', percentage: 3.0, color: '#ef4444' },
];

const topCategories = [
  { name: 'Mobiles', rating: 4.8, icon: <Smartphone color="primary" fontSize="small" />, bg: '#e0e7ff' },
  { name: 'Electronics', rating: 4.5, icon: <Headset color="secondary" fontSize="small" />, bg: '#f3e8ff' },
  { name: 'Laptops', rating: 4.4, icon: <LaptopMac color="info" fontSize="small" />, bg: '#e0f2fe' },
  { name: 'Furniture', rating: 4.2, icon: <Chair color="warning" fontSize="small" />, bg: '#fef3c7' },
  { name: 'Home Appliances', rating: 4.1, icon: <Blender color="success" fontSize="small" />, bg: '#d1fae5' },
];

export default function ReviewsPage() {
  const router = useRouter();

  // Reviews Data State
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [userFilter, setUserFilter] = useState('All Users');
  const [vendorFilter, setVendorFilter] = useState('All Vendors');

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Selected row menu anchor
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeDetail, setActiveDetail] = useState<Review | null>(null);

  // Response Form State
  const [responseText, setResponseText] = useState('');
  const [responsePublic, setResponsePublic] = useState(true);

  // Reject / Hide Dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Inappropriate content');

  // Toast notification
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  // Reset Filters
  const handleReset = () => {
    setSearchTerm('');
    setRatingFilter('All Ratings');
    setStatusFilter('All Status');
    setCategoryFilter('All Categories');
    setUserFilter('All Users');
    setVendorFilter('All Vendors');
    setPage(1);
  };

  // Row Action Menu Handlers
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, review: Review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Open Detail Modal
  const handleOpenDetail = (rev: Review) => {
    setActiveDetail(rev);
    setResponseText(rev.response?.text || '');
    setResponsePublic(rev.response?.isPublic ?? true);
    setDetailModalOpen(true);
    handleCloseMenu();
  };

  // Moderation Status Update Handler
  const handleUpdateStatus = (id: string, newStatus: Review['status'], note?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newLog: ReviewModerationLog = {
      action: `Status changed to ${newStatus}${note ? ` (${note})` : ''}`,
      moderator: 'Admin Moderator',
      timestamp: timeStr,
      note
    };

    setReviews(prev => prev.map(r => {
      if (r.id === id) {
        const updatedLogs = [newLog, ...(r.moderationHistory || [])];
        const updated = { ...r, status: newStatus, moderationHistory: updatedLogs };
        if (activeDetail && activeDetail.id === id) {
          setActiveDetail(updated);
        }
        return updated;
      }
      return r;
    }));

    handleCloseMenu();
    setRejectDialogOpen(false);
    setSnackbar({ open: true, message: `Review ${id} status updated to ${newStatus}!`, severity: 'success' });
  };

  // Submit Official Response
  const handleSaveResponse = () => {
    if (!activeDetail || !responseText.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const responseObj = {
      text: responseText.trim(),
      responder: 'Loopo Official Support',
      createdAt: timeStr,
      isPublic: responsePublic
    };

    const newLog: ReviewModerationLog = {
      action: 'Official response posted',
      moderator: 'Loopo Official Support',
      timestamp: timeStr
    };

    setReviews(prev => prev.map(r => {
      if (r.id === activeDetail.id) {
        const updatedLogs = [newLog, ...(r.moderationHistory || [])];
        const updated = { ...r, response: responseObj, moderationHistory: updatedLogs };
        setActiveDetail(updated);
        return updated;
      }
      return r;
    }));

    setSnackbar({ open: true, message: 'Official response posted successfully!', severity: 'success' });
  };

  // Export Filtered Reviews to CSV
  const handleExportReviews = () => {
    const headers = ['Review ID', 'Product', 'Category', 'Vendor', 'User', 'Email', 'Rating', 'Status', 'Comment', 'Order ID', 'Created At'];
    const rows = filteredReviews.map(r => [
      r.id,
      `"${r.productTitle.replace(/"/g, '""')}"`,
      r.productCategory || 'General',
      `"${(r.vendorName || '').replace(/"/g, '""')}"`,
      r.userName,
      r.userEmail || '',
      r.rating,
      r.status,
      `"${r.comment.replace(/"/g, '""')}"`,
      r.orderId || '',
      r.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reviews_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: 'Reviews exported to CSV successfully!', severity: 'success' });
  };

  // Status Chip Renderer
  const getStatusChip = (status: Review['status']) => {
    let bg = '#ecfdf5', color = '#059669'; // Published
    if (status === 'Submitted') { bg = '#eff6ff'; color = '#2563eb'; }
    if (status === 'Under Review') { bg = '#fef3c7'; color = '#d97706'; }
    if (status === 'Approved') { bg = '#f0fdfa'; color = '#0d9488'; }
    if (status === 'Hidden') { bg = '#f3f4f6'; color = '#4b5563'; }
    if (status === 'Flagged') { bg = '#fef2f2'; color = '#dc2626'; }
    if (status === 'Rejected' || status === 'Removed') { bg = '#fee2e2'; color = '#991b1b'; }

    return (
      <Chip
        label={status}
        size="small"
        sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: bg, color: color, borderRadius: 1.5, px: 0.5 }}
      />
    );
  };

  // Filter Logic
  const filteredReviews = reviews.filter((rev) => {
    // 1. Rating Filter
    if (ratingFilter !== 'All Ratings') {
      const targetStars = parseInt(ratingFilter[0], 10);
      if (!isNaN(targetStars) && rev.rating !== targetStars) return false;
    }

    // 2. Status Filter
    if (statusFilter !== 'All Status' && rev.status !== statusFilter) return false;

    // 3. Category Filter
    if (categoryFilter !== 'All Categories' && rev.productCategory !== categoryFilter) return false;

    // 4. User Filter
    if (userFilter !== 'All Users' && rev.userName !== userFilter) return false;

    // 5. Vendor Filter
    if (vendorFilter !== 'All Vendors' && rev.vendorName !== vendorFilter) return false;

    // 6. Search Filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = rev.id.toLowerCase().includes(q);
      const matchProd = rev.productTitle.toLowerCase().includes(q);
      const matchUser = rev.userName.toLowerCase().includes(q);
      const matchEmail = (rev.userEmail || '').toLowerCase().includes(q);
      const matchOrder = (rev.orderId || '').toLowerCase().includes(q);
      const matchComment = rev.comment.toLowerCase().includes(q);
      return matchId || matchProd || matchUser || matchEmail || matchOrder || matchComment;
    }

    return true;
  });

  const pageCount = Math.ceil(filteredReviews.length / rowsPerPage);
  const paginatedReviews = filteredReviews.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Top Header & Breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Review Moderation & Feedback</Typography>
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
            <Link underline="hover" color="inherit" onClick={() => router.push('/dashboard')} sx={{ cursor: 'pointer' }}>
              Dashboard
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 500 }}>Reviews Management</Typography>
          </Breadcrumbs>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2.5}>
        {summaryCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={2.4} key={idx}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2.5, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ bgcolor: card.bg, width: 44, height: 44 }}>{card.icon}</Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{card.title}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.25 }}>{card.value}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>{card.sub}</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dual Column Layout: Left Table (75%), Right Sidebar (25%) */}
      <Grid container spacing={3}>
        {/* Left Column: Filters and Moderation Table */}
        <Grid item xs={12} lg={9}>
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white', p: 3 }}>
            
            {/* Filter Bar */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search by product, user, order, or review ID..."
                size="small"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                sx={{ minWidth: 260, flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: '#94a3b8' }} /></InputAdornment> } }}
              />
              
              {/* Rating Select */}
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select value={ratingFilter} onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2 }}>
                  <MenuItem value="All Ratings">All Ratings</MenuItem>
                  <MenuItem value="5 Stars">5 Stars ⭐⭐⭐⭐⭐</MenuItem>
                  <MenuItem value="4 Stars">4 Stars ⭐⭐⭐⭐</MenuItem>
                  <MenuItem value="3 Stars">3 Stars ⭐⭐⭐</MenuItem>
                  <MenuItem value="2 Stars">2 Stars ⭐⭐</MenuItem>
                  <MenuItem value="1 Star">1 Star ⭐</MenuItem>
                </Select>
              </FormControl>

              {/* Status Select */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2 }}>
                  <MenuItem value="All Status">All Status</MenuItem>
                  <MenuItem value="Submitted">Submitted</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Published">Published</MenuItem>
                  <MenuItem value="Hidden">Hidden</MenuItem>
                  <MenuItem value="Flagged">Flagged</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

              {/* Category Select */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2 }}>
                  <MenuItem value="All Categories">All Categories</MenuItem>
                  <MenuItem value="Mobiles">Mobiles</MenuItem>
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Laptops">Laptops</MenuItem>
                  <MenuItem value="Furniture">Furniture</MenuItem>
                  <MenuItem value="Cameras">Cameras</MenuItem>
                  <MenuItem value="Shoes">Shoes</MenuItem>
                  <MenuItem value="Tablets">Tablets</MenuItem>
                  <MenuItem value="Home Appliances">Home Appliances</MenuItem>
                </Select>
              </FormControl>

              {/* User Select */}
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2 }}>
                  <MenuItem value="All Users">All Users</MenuItem>
                  <MenuItem value="Rahul Sharma">Rahul Sharma</MenuItem>
                  <MenuItem value="Priya Patel">Priya Patel</MenuItem>
                  <MenuItem value="Amit Kumar">Amit Kumar</MenuItem>
                  <MenuItem value="Sneha Reddy">Sneha Reddy</MenuItem>
                  <MenuItem value="Vikram Singh">Vikram Singh</MenuItem>
                  <MenuItem value="Neha Verma">Neha Verma</MenuItem>
                  <MenuItem value="Arjun Mehta">Arjun Mehta</MenuItem>
                  <MenuItem value="Kavya Nair">Kavya Nair</MenuItem>
                </Select>
              </FormControl>

              {/* Reset Button */}
              <IconButton onClick={handleReset} title="Reset Filters" sx={{ border: '1px solid #cbd5e1', borderRadius: 2, p: 0.8 }}>
                <RestartAlt sx={{ fontSize: 18, color: '#64748b' }} />
              </IconButton>
            </Box>

            {/* Table */}
            <TableContainer>
              <Table sx={{ minWidth: 850 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>REVIEW & RATING</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>PRODUCT / VENDOR</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>USER</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>ORDER ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>DATE</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                        No reviews found matching current filter criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReviews.map((review) => (
                      <TableRow key={review.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                              {review.title || 'Review'}
                            </Typography>
                            {review.isEdited && (
                              <Chip label="Edited" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600 }} />
                            )}
                            {review.isReported && (
                              <Tooltip title={review.reportReason || 'Reported by vendor/user'}>
                                <Chip icon={<ReportProblem sx={{ fontSize: '12px !important' }} />} label="Reported" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }} />
                              </Tooltip>
                            )}
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 0.5 }}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#d97706' }}>{review.rating}.0</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {review.comment}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{review.productTitle}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{review.productCategory} &bull; <span style={{ color: '#1d4ed8', fontWeight: 600 }}>{review.vendorName || 'Platform Vendor'}</span></Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1d4ed8', fontWeight: 'bold', fontSize: '0.85rem' }}>
                              {review.userName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>{review.userName}</Typography>
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>{review.userEmail}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(review.status)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1d4ed8', bgcolor: '#eff6ff', px: 1, py: 0.5, borderRadius: 1 }}>
                            {review.orderId || 'Direct'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                            {review.createdAt.split(',')[0]}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleOpenDetail(review)} sx={{ color: '#1d4ed8' }} title="View details & moderate">
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={(e) => handleActionClick(e, review)} sx={{ color: '#64748b' }}>
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                Showing {filteredReviews.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, filteredReviews.length)} of {filteredReviews.length} reviews
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

        {/* Right Column: Widgets & Quick Actions */}
        <Grid item xs={12} lg={3} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Rating Distribution */}
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white', p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Rating Distribution</Typography>
            <Stack spacing={2}>
              {ratingDistribution.map((item) => (
                <Box key={item.stars} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ minWidth: 45, fontWeight: 600, color: '#334155' }}>{item.stars} Stars</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={item.percentage}
                    sx={{
                      flexGrow: 1, height: 7, borderRadius: 4,
                      bgcolor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 4 }
                    }}
                  />
                  <Typography variant="caption" align="right" sx={{ minWidth: 70, color: '#64748b', fontWeight: 600 }}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>

          {/* Top Rated Categories */}
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white', p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Top Rated Categories</Typography>
            <Stack spacing={2}>
              {topCategories.map((cat, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: cat.bg, width: 36, height: 36 }}>{cat.icon}</Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{cat.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>{cat.rating}</Typography>
                    <Star fontSize="small" sx={{ color: '#faaf00', width: 16, height: 16 }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Card>

          {/* Quick Actions Card */}
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white', p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Quick Actions</Typography>
            <Stack spacing={2}>
              <Box
                onClick={() => { setStatusFilter('Submitted'); setPage(1); }}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2.5, cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
              >
                <Avatar sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', width: 38, height: 38 }}><PendingActions fontSize="small" /></Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>Pending Reviews</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Filter reviews awaiting approval</Typography>
                </Box>
              </Box>

              <Box
                onClick={() => { setStatusFilter('Flagged'); setPage(1); }}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2.5, cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
              >
                <Avatar sx={{ bgcolor: '#fee2e2', color: '#dc2626', width: 38, height: 38 }}><Flag fontSize="small" /></Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>Flagged / Reported</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Suspicious reviews to inspect</Typography>
                </Box>
              </Box>

              <Box
                onClick={handleExportReviews}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2.5, cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
              >
                <Avatar sx={{ bgcolor: '#ecfdf5', color: '#059669', width: 38, height: 38 }}><Download fontSize="small" /></Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>Export All Reviews</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Download CSV moderation report</Typography>
                </Box>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Row More Actions Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => selectedReview && handleOpenDetail(selectedReview)}>
          <Visibility fontSize="small" sx={{ mr: 1.5, color: '#1d4ed8' }} /> View Details & History
        </MenuItem>
        <MenuItem onClick={() => selectedReview && handleUpdateStatus(selectedReview.id, 'Approved')}>
          <CheckCircle fontSize="small" sx={{ mr: 1.5, color: '#0d9488' }} /> Approve Review
        </MenuItem>
        <MenuItem onClick={() => selectedReview && handleUpdateStatus(selectedReview.id, 'Published')}>
          <Visibility fontSize="small" sx={{ mr: 1.5, color: '#059669' }} /> Publish Publicly
        </MenuItem>
        <MenuItem onClick={() => { setRejectDialogOpen(true); handleCloseMenu(); }}>
          <VisibilityOff fontSize="small" sx={{ mr: 1.5, color: '#d97706' }} /> Hide / Reject Review
        </MenuItem>
        <MenuItem onClick={() => selectedReview && handleUpdateStatus(selectedReview.id, 'Flagged', 'Flagged as suspicious review by admin')}>
          <Flag fontSize="small" sx={{ mr: 1.5, color: '#dc2626' }} /> Flag as Suspicious
        </MenuItem>
      </Menu>

      {/* Comprehensive Review Details & Moderation Modal */}
      {activeDetail && (
        <Dialog
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Review #{activeDetail.id}</Typography>
              {getStatusChip(activeDetail.status)}
            </Box>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Submitted on {activeDetail.createdAt}</Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Top Product & User Banner */}
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>PRODUCT & VENDOR</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5 }}>{activeDetail.productTitle}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Category: <b>{activeDetail.productCategory}</b> &bull; Vendor: <b>{activeDetail.vendorName || 'General'}</b>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>CUSTOMER DETAILS</Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#1d4ed8', fontWeight: 'bold' }}>{activeDetail.userName.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{activeDetail.userName}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>{activeDetail.userEmail} &bull; Order: {activeDetail.orderId || 'Direct'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Review Content & Star Breakdown */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>Review Content & Rating Breakdown</Typography>
              <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Rating value={activeDetail.rating} readOnly size="medium" />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#d97706' }}>{activeDetail.rating}.0 / 5</Typography>
                  {activeDetail.isEdited && (
                    <Chip label="Edited by Customer" size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
                  )}
                </Stack>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                  "{activeDetail.title || 'Product Feedback'}"
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                  {activeDetail.comment}
                </Typography>

                {/* Rating Breakdown Sub-metrics */}
                {activeDetail.ratingBreakdown && (
                  <Grid container spacing={2} sx={{ mt: 2, pt: 2, borderTop: '1px dashed #e2e8f0' }}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>PRODUCT QUALITY</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{activeDetail.ratingBreakdown.quality} / 5 ⭐</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>VALUE FOR MONEY</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{activeDetail.ratingBreakdown.value} / 5 ⭐</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>DELIVERY SPEED</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{activeDetail.ratingBreakdown.delivery} / 5 ⭐</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>CUSTOMER SUPPORT</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{activeDetail.ratingBreakdown.customerService} / 5 ⭐</Typography>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Box>

            {/* Reported Flag Notice */}
            {activeDetail.isReported && (
              <Box sx={{ p: 2, bgcolor: '#fee2e2', borderRadius: 3, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 2 }}>
                <ReportProblem sx={{ color: '#dc2626' }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b' }}>Reported Review Notice</Typography>
                  <Typography variant="caption" sx={{ color: '#b91c1c' }}>{activeDetail.reportReason}</Typography>
                </Box>
              </Box>
            )}

            {/* Official Platform / Vendor Response Pane */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Reply fontSize="small" sx={{ color: '#1d4ed8' }} /> Official Response (on behalf of platform / vendor)
              </Typography>
              <TextField
                multiline
                rows={2.5}
                fullWidth
                placeholder="Write an official public response to address the customer's review..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Checkbox checked={responsePublic} onChange={(e) => setResponsePublic(e.target.checked)} size="small" />
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Visible publicly on marketplace</Typography>
                </Stack>
                <Button
                  variant="contained"
                  onClick={handleSaveResponse}
                  size="small"
                  sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#1d4ed8', fontWeight: 700 }}
                >
                  Post Official Response
                </Button>
              </Box>
            </Box>

            {/* Moderation History Audit Trail */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <History fontSize="small" sx={{ color: '#64748b' }} /> Moderation History & Audit Trail
              </Typography>
              <Box sx={{ pl: 2, position: 'relative', '&:before': { content: '""', position: 'absolute', left: 4, top: 4, bottom: 4, width: 2, bgcolor: '#cbd5e1' } }}>
                {(activeDetail.moderationHistory || []).map((log, lIdx) => (
                  <Box key={lIdx} sx={{ mb: 1.5, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: -16, top: 5, width: 6, height: 6, borderRadius: '50%', bgcolor: '#94a3b8' }} />
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>{log.timestamp} &bull; <b>{log.moderator}</b></Typography>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>{log.action}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

          </DialogContent>
          <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
            <Button onClick={() => setDetailModalOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Close
            </Button>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => { setRejectDialogOpen(true); setSelectedReview(activeDetail); }}
                startIcon={<VisibilityOff />}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                Hide / Reject
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => handleUpdateStatus(activeDetail.id, 'Flagged', 'Flagged as suspicious')}
                startIcon={<Flag />}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                Flag Suspicious
              </Button>
              <Button
                variant="outlined"
                color="info"
                onClick={() => handleUpdateStatus(activeDetail.id, 'Approved')}
                startIcon={<CheckCircle />}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleUpdateStatus(activeDetail.id, 'Published')}
                startIcon={<Visibility />}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                Publish Live
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>
      )}

      {/* Hide / Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#991b1b' }}>Hide or Reject Review</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Select the moderation reason for hiding or rejecting this review from public display:
          </Typography>
          <FormControl fullWidth size="small">
            <Select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value="Inappropriate content">Inappropriate or offensive content</MenuItem>
              <MenuItem value="Spam / Promo links">Contains spam or external links</MenuItem>
              <MenuItem value="Competitor harassment">Fake / Competitor harassment</MenuItem>
              <MenuItem value="Unrelated to product">Unrelated to product or service</MenuItem>
              <MenuItem value="Personal contact info">Contains personal contact information</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => selectedReview && handleUpdateStatus(selectedReview.id, 'Hidden', rejectReason)}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            Confirm Hide / Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alerts */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
