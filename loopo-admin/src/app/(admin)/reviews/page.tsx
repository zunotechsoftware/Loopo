'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Rating,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, TextField, InputAdornment, Menu, MenuItem, Checkbox,
  Select, FormControl, LinearProgress, Divider, Avatar, Pagination, Stack,
  SelectChangeEvent
} from '@mui/material';
import {
  Search, MoreVert, Visibility, FilterList, RestartAlt,
  StarBorder, Star, ThumbUpAltOutlined, SentimentNeutralOutlined,
  ThumbDownAltOutlined, FormatListBulleted, PendingActions,
  VisibilityOff, Settings, Download, Smartphone, Headset,
  LaptopMac, Chair, Blender, CalendarToday
} from '@mui/icons-material';
import { Review } from '@/types';

// Extended mock data based on the design
const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1', title: 'Great product and condition!', comment: 'Very satisfied with the product quality.',
    productId: 'p1', productTitle: 'iPhone 13 128GB', productCategory: 'Mobiles',
    userId: 'u1', userName: 'Rahul Sharma', userEmail: 'rahul.sharma@email.com',
    rating: 5, status: 'Published', orderId: '#ORD-12458', createdAt: '12 May 2024\n10:31 AM'
  },
  {
    id: 'r2', title: 'Good value for money', comment: 'Works as expected. Battery backup is good.',
    productId: 'p2', productTitle: 'Sony WH-1000XM4', productCategory: 'Electronics',
    userId: 'u2', userName: 'Priya Patel', userEmail: 'priya.patel@email.com',
    rating: 4, status: 'Published', orderId: '#ORD-12457', createdAt: '12 May 2024\n09:15 AM'
  },
  {
    id: 'r3', title: 'Average product', comment: 'It\'s okay, could be better for the price.',
    productId: 'p3', productTitle: 'Dining Table Set', productCategory: 'Furniture',
    userId: 'u3', userName: 'Amit Kumar', userEmail: 'amit.kumar@email.com',
    rating: 3, status: 'Published', orderId: '#ORD-12456', createdAt: '11 May 2024\n08:45 PM'
  },
  {
    id: 'r4', title: 'Not as described', comment: 'The product has scratches and not in good condition.',
    productId: 'p4', productTitle: 'MacBook Air M2', productCategory: 'Laptops',
    userId: 'u4', userName: 'Sneha Reddy', userEmail: 'sneha.reddy@email.com',
    rating: 2, status: 'Published', orderId: '#ORD-12455', createdAt: '11 May 2024\n06:20 PM'
  },
  {
    id: 'r5', title: 'Poor quality', comment: 'Stopped working within a week.',
    productId: 'p5', productTitle: 'Canon EOS R50', productCategory: 'Cameras',
    userId: 'u5', userName: 'Vikram Singh', userEmail: 'vikram.singh@email.com',
    rating: 1, status: 'Hidden', orderId: '#ORD-12454', createdAt: '10 May 2024\n04:30 PM'
  },
  {
    id: 'r6', title: 'Excellent experience!', comment: 'Fast delivery and genuine product.',
    productId: 'p6', productTitle: 'Nike Air Max', productCategory: 'Shoes',
    userId: 'u6', userName: 'Neha Verma', userEmail: 'neha.verma@email.com',
    rating: 5, status: 'Published', orderId: '#ORD-12453', createdAt: '10 May 2024\n02:30 PM'
  },
  {
    id: 'r7', title: 'Good seller', comment: 'Communicates well and shipped quickly.',
    productId: 'p7', productTitle: 'iPad Air 5', productCategory: 'Tablets',
    userId: 'u7', userName: 'Arjun Mehta', userEmail: 'arjun.mehta@email.com',
    rating: 4, status: 'Published', orderId: '#ORD-12452', createdAt: '09 May 2024\n11:20 AM'
  },
  {
    id: 'r8', title: 'Item not working', comment: 'Received defective product.',
    productId: 'p8', productTitle: 'Washing Machine', productCategory: 'Home Appliances',
    userId: 'u8', userName: 'Kavya Nair', userEmail: 'kavya.nair@email.com',
    rating: 1, status: 'Removed', orderId: '#ORD-12451', createdAt: '09 May 2024\n10:00 AM'
  },
];

const statusColor: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  Published: 'success', Hidden: 'warning', Removed: 'error', Flagged: 'error'
};

const summaryCards = [
  { title: 'Total Reviews', value: '2,457', sub: 'All time reviews', icon: <StarBorder sx={{ color: '#8b5cf6' }} />, bg: '#f3e8ff' },
  { title: 'Positive Reviews', value: '1,980', sub: '80.57% of total', icon: <ThumbUpAltOutlined sx={{ color: '#10b981' }} />, bg: '#d1fae5' },
  { title: 'Neutral Reviews', value: '298', sub: '12.13% of total', icon: <SentimentNeutralOutlined sx={{ color: '#f59e0b' }} />, bg: '#fef3c7' },
  { title: 'Negative Reviews', value: '179', sub: '7.30% of total', icon: <ThumbDownAltOutlined sx={{ color: '#ef4444' }} />, bg: '#fee2e2' },
  { title: 'Average Rating', value: '4.3 / 5', sub: 'Based on 2,457 reviews', icon: <StarBorder sx={{ color: '#3b82f6' }} />, bg: '#dbeafe' },
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

const quickActions = [
  { title: 'View All Reviews', desc: 'Browse all customer reviews', icon: <FormatListBulleted color="action" /> },
  { title: 'Pending Reviews', desc: 'Reviews awaiting approval', icon: <PendingActions color="warning" /> },
  { title: 'Hidden Reviews', desc: 'Reviews hidden from public', icon: <VisibilityOff color="error" /> },
  { title: 'Review Settings', desc: 'Configure review preferences', icon: <Settings color="info" /> },
  { title: 'Export Reviews', desc: 'Download reviews report', icon: <Download color="success" /> },
];

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [listingFilter, setListingFilter] = useState('All Listings');
  const [userFilter, setUserFilter] = useState('All Users');

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
      
      {/* Header handled by global layout, but we could add Breadcrumbs here if needed */}

      {/* Summary Cards */}
      <Grid container spacing={2}>
        {summaryCards.map((card, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={idx}>
            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                <Avatar sx={{ bgcolor: card.bg, width: 48, height: 48 }}>{card.icon}</Avatar>
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
                placeholder="Search by product, user or order ID..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 250, flexGrow: 1 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                  <MenuItem value="All Ratings">All Ratings</MenuItem>
                  <MenuItem value="5 Stars">5 Stars</MenuItem>
                  <MenuItem value="4 Stars">4 Stars</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="All Status">All Status</MenuItem>
                  <MenuItem value="Published">Published</MenuItem>
                  <MenuItem value="Hidden">Hidden</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={listingFilter} onChange={(e) => setListingFilter(e.target.value)}>
                  <MenuItem value="All Listings">All Listings</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                  <MenuItem value="All Users">All Users</MenuItem>
                </Select>
              </FormControl>

              <Button 
                variant="outlined" 
                endIcon={<CalendarToday fontSize="small" />} 
                sx={{ color: 'text.secondary', borderColor: 'divider', textTransform: 'none', px: 2 }}
              >
                Start Date &nbsp;&mdash;&nbsp; End Date
              </Button>

              <Button variant="outlined" startIcon={<FilterList />} sx={{ color: 'text.secondary', borderColor: 'divider' }}>
                Filters
              </Button>
              <Button variant="text" sx={{ color: 'text.secondary' }}>
                Reset
              </Button>
            </Box>

            {/* Table */}
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Review</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Product / Listing</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Review Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_REVIEWS.map(review => (
                    <TableRow key={review.id} hover>
                      <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{review.title}</Typography>
                        <Rating value={review.rating} readOnly size="small" sx={{ my: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                          {review.comment}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'grey.200' }} src={review.productImage}>
                            <Smartphone sx={{ color: 'grey.500' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>{review.productTitle}</Typography>
                            <Typography variant="caption" color="text.secondary">{review.productCategory}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32 }} src={review.userAvatar}>{review.userName.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="subtitle2">{review.userName}</Typography>
                            <Typography variant="caption" color="text.secondary">{review.userEmail}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{review.rating}.0</Typography>
                          <Star fontSize="small" sx={{ color: '#faaf00' }} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={review.status}
                          size="small"
                          color={statusColor[review.status]}
                          sx={{ height: 24, fontSize: '0.75rem', fontWeight: 'medium' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 'medium' }}>
                          {review.orderId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{review.createdAt}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => handleActionClick(e, review.id)}>
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
              <Typography variant="body2" color="text.secondary">Showing 1 to 10 of 2,457 reviews</Typography>
              <Pagination count={246} shape="rounded" color="primary" />
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Sidebar */}
        <Grid size={{ xs: 12, lg: 3 }}>
          {/* Rating Distribution */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Rating Distribution</Typography>
              <Stack spacing={2}>
                {ratingDistribution.map((item) => (
                  <Box key={item.stars} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 45 }}>{item.stars} Stars</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{
                        flexGrow: 1, height: 8, borderRadius: 4,
                        bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 4 }
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" align="right" sx={{ minWidth: 80 }}>
                      {item.count} ({item.percentage}%)
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Top Rated Categories */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Top Rated Categories</Typography>
              <Stack spacing={2}>
                {topCategories.map((cat, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: cat.bg, width: 36, height: 36 }}>{cat.icon}</Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{cat.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{cat.rating}</Typography>
                      <Star fontSize="small" sx={{ color: '#faaf00', width: 16, height: 16 }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Button variant="text" size="small" sx={{ mt: 2, p: 0, textTransform: 'none' }}>
                View all categories &rarr;
              </Button>
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
        <MenuItem onClick={handleClose}><Visibility fontSize="small" sx={{ mr: 1, color: 'success.main' }} /> Publish</MenuItem>
        <MenuItem onClick={handleClose}><VisibilityOff fontSize="small" sx={{ mr: 1, color: 'warning.main' }} /> Hide</MenuItem>
      </Menu>

    </Box>
  );
}
