'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Checkbox,
  Select,
  FormControl,
  Avatar,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  Search,
  MoreVert,
  Edit,
  Visibility,
  CheckCircle,
  Cancel,
  StarBorder,
  DeleteForever,
  Add,
  FilterList,
  Inventory,
  CheckCircleOutlined,
  AccessTime,
  HighlightOff,
  ShoppingCartOutlined,
  ArrowUpward,
  ArrowDownward,
  LocationOnOutlined
} from '@mui/icons-material';
import { productsService } from '@/services/admin.service';

const StatCard = ({ title, value, icon, color, trend, trendValue, isPositive }: any) => (
  <Card sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color: color, display: 'flex' }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{value}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isPositive ? <ArrowUpward sx={{ fontSize: 14, color: '#10b981' }}/> : <ArrowDownward sx={{ fontSize: 14, color: '#ef4444' }}/>}
        <Typography variant="caption" sx={{ color: isPositive ? '#10b981' : '#ef4444', fontWeight: 600 }}>{trendValue}</Typography>
        <Typography variant="caption" color="text.secondary">vs last week</Typography>
      </Box>
    </Box>
  </Card>
);

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await productsService.getAll();
      if (res.data) {
        const payload = res.data.data;
        if (Array.isArray(payload)) {
          setListings(payload);
        } else if (payload?.data && Array.isArray(payload.data)) {
          setListings(payload.data);
        } else {
          setListings([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getConditionColor = (cond: string) => {
    if (cond === 'LIKE_NEW' || cond === 'NEW') return { color: '#10b981', bgcolor: '#10b98115' };
    if (cond === 'GOOD' || cond === 'FAIR') return { color: '#f59e0b', bgcolor: '#f59e0b15' };
    return { color: '#3b82f6', bgcolor: '#3b82f615' }; // POOR or Used
  };

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED' || status === 'ACTIVE') return { color: '#10b981', bgcolor: '#10b98115' };
    if (status === 'PENDING') return { color: '#f59e0b', bgcolor: '#f59e0b15' };
    return { color: '#ef4444', bgcolor: '#ef444415' }; // REJECTED
  };

  const formatCondition = (cond: string) => {
    if (!cond) return 'Unknown';
    return cond.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  const totalListings = listings.length;
  const activeListings = listings.filter(l => l.status === 'APPROVED' || l.status === 'ACTIVE').length;
  const pendingListings = listings.filter(l => l.status === 'PENDING').length;
  const rejectedListings = listings.filter(l => l.status === 'REJECTED').length;
  const soldListings = listings.filter(l => l.status === 'SOLD').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Listings</Typography>
        <Typography variant="body2" color="text.secondary">Manage all product listings on the platform</Typography>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <StatCard title="Total Listings" value={totalListings} icon={<Inventory />} color="#3b82f6" isPositive={true} trendValue="15.2%" />
        <StatCard title="Active Listings" value={activeListings} icon={<CheckCircleOutlined />} color="#10b981" isPositive={true} trendValue="10.4%" />
        <StatCard title="Pending Approval" value={pendingListings} icon={<AccessTime />} color="#f59e0b" isPositive={false} trendValue="5.8%" />
        <StatCard title="Rejected Listings" value={rejectedListings} icon={<HighlightOff />} color="#ef4444" isPositive={true} trendValue="2.5%" />
        <StatCard title="Sold Listings" value={soldListings} icon={<ShoppingCartOutlined />} color="#8b5cf6" isPositive={true} trendValue="12.7%" />
      </Box>

      {/* Main Card */}
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        
        {/* Filter Row */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search listing by title, id or seller name..."
            variant="outlined" size="small"
            sx={{ flex: '1 1 250px', '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' } }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20 }} /></InputAdornment> } }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select displayEmpty value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              renderValue={(val) => val ? val : 'All Categories'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="Mobiles" sx={{ fontSize: '0.85rem' }}>Mobiles</MenuItem>
              <MenuItem value="Vehicles" sx={{ fontSize: '0.85rem' }}>Vehicles</MenuItem>
              <MenuItem value="Electronics" sx={{ fontSize: '0.85rem' }}>Electronics</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select displayEmpty value={subcategoryFilter} onChange={(e) => setSubcategoryFilter(e.target.value)}
              renderValue={(val) => val ? val : 'All Subcategories'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="iPhone" sx={{ fontSize: '0.85rem' }}>iPhone</MenuItem>
              <MenuItem value="Cars" sx={{ fontSize: '0.85rem' }}>Cars</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              renderValue={(val) => val ? val : 'All Status'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="Active" sx={{ fontSize: '0.85rem' }}>Active</MenuItem>
              <MenuItem value="Pending" sx={{ fontSize: '0.85rem' }}>Pending</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select displayEmpty value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}
              renderValue={(val) => val ? val : 'All Conditions'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="LIKE_NEW" sx={{ fontSize: '0.85rem' }}>Like New</MenuItem>
              <MenuItem value="GOOD" sx={{ fontSize: '0.85rem' }}>Good</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select displayEmpty value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
              renderValue={(val) => val ? val : 'All Locations'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="Delhi" sx={{ fontSize: '0.85rem' }}>Delhi</MenuItem>
              <MenuItem value="Mumbai" sx={{ fontSize: '0.85rem' }}>Mumbai</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" size="small" startIcon={<FilterList />} sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary', borderColor: '#e2e8f0', bgcolor: '#f8fafc' }}>
            More Filters
          </Button>
          <Button variant="text" size="small" sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Reset
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button variant="contained" size="small" startIcon={<Add />} sx={{ borderRadius: 2, textTransform: 'none', px: 2, py: 0.8, bgcolor: '#2563eb' }}>
            Add Listing
          </Button>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem' }}>Listings List</Typography>

        <TableContainer>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid #f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', py: 1.5 } }}>
                <TableCell padding="checkbox"><Checkbox size="small"/></TableCell>
                <TableCell>Listing</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Views</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Posted On</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : listings.map((item, idx) => (
                <TableRow key={idx} hover sx={{ '& td': { borderBottom: '1px solid #f8fafc', py: 1.5 } }}>
                  <TableCell padding="checkbox"><Checkbox size="small"/></TableCell>
                  
                  {/* Listing Info */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={item.images?.[0]?.originalUrl || `https://ui-avatars.com/api/?name=${item.title}&background=random`} variant="rounded" sx={{ width: 40, height: 40, bgcolor: '#e2e8f0' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>#{item.id?.substring(0, 8).toUpperCase()}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Seller Info */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={item.seller?.profile?.profilePicture || `https://ui-avatars.com/api/?name=${item.seller?.profile?.displayName || item.seller?.firstName}&background=random`} sx={{ width: 32, height: 32 }} />
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>{item.seller?.profile?.displayName || item.seller?.firstName}</Typography>
                          {item.seller?.profile?.verifiedBadge && <CheckCircle sx={{ fontSize: 12, color: '#10b981' }} />}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>#{item.seller?.id?.substring(0, 8).toUpperCase()}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Category Info */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155', fontSize: '0.8rem' }}>{item.category?.name || 'N/A'}</Typography>
                  </TableCell>

                  {/* Price */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>₹{item.price?.toLocaleString()}</Typography>
                  </TableCell>

                  {/* Condition */}
                  <TableCell>
                    <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600, ...getConditionColor(item.condition) }}>
                      {formatCondition(item.condition)}
                    </Box>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                      <LocationOnOutlined sx={{ fontSize: 16, color: '#64748b', mt: 0.2 }} />
                      <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.2 }}>
                        {item.location?.city ? `${item.location.city},` : 'Not Set'}<br/>{item.location?.state || ''}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Views */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Visibility sx={{ fontSize: 16, color: '#94a3b8' }} />
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>{item.viewCount?.toLocaleString() || 0}</Typography>
                    </Box>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600, ...getStatusColor(item.status) }}>
                      {item.status}
                    </Box>
                  </TableCell>

                  {/* Posted On */}
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.8rem' }}>{new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                      <IconButton size="small"><Visibility sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                      <IconButton size="small"><Edit sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                      <IconButton size="small" onClick={handleMenuOpen}><MoreVert sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
          <Typography variant="body2" color="text.secondary">Showing {listings.length > 0 ? 1 : 0} to {listings.length} of {listings.length} listings</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
             {/* Simple pagination mock for UI */}
             <Button variant="outlined" size="small" sx={{ minWidth: 30, p: 0.5, borderColor: '#e2e8f0', color: '#64748b' }} disabled>&lt;</Button>
             <Button variant="contained" size="small" sx={{ minWidth: 30, p: 0.5, bgcolor: '#2563eb' }}>1</Button>
             <Button variant="outlined" size="small" sx={{ minWidth: 30, p: 0.5, borderColor: '#e2e8f0', color: '#64748b' }} disabled>&gt;</Button>
          </Box>
        </Box>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose}><CheckCircle fontSize="small" sx={{ mr: 1, color: '#10b981' }} /> Approve</MenuItem>
          <MenuItem onClick={handleMenuClose}><Cancel fontSize="small" sx={{ mr: 1, color: '#ef4444' }} /> Reject</MenuItem>
          <MenuItem onClick={handleMenuClose}><DeleteForever fontSize="small" sx={{ mr: 1, color: '#ef4444' }} /> Remove</MenuItem>
        </Menu>
      </Card>
    </Box>
  );
}
