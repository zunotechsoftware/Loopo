'use client';
import ListingDialog from './ListingDialog';

import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Search,
  MoreVert,
  Edit,
  Visibility,
  CheckCircle,
  Cancel,
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
import { productsService, categoriesService } from '@/services/admin.service';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  // Data States
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, rejected: 0, sold: 0 });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Menu/Action States
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchFiltersData = async () => {
    try {
      const [catRes, locRes, statsRes] = await Promise.all([
        categoriesService.getAll({ all: true }),
        productsService.getLocations(),
        productsService.getStats()
      ]);
      if (catRes.data) {
        const catPayload = catRes.data.data || catRes.data;
        if (Array.isArray(catPayload)) setCategories(catPayload);
        else if (catPayload?.data && Array.isArray(catPayload.data)) setCategories(catPayload.data);
      }
      
      if (locRes.data) {
        const locPayload = locRes.data.data || locRes.data;
        if (Array.isArray(locPayload)) setLocations(locPayload);
        else if (locPayload?.data && Array.isArray(locPayload.data)) setLocations(locPayload.data);
      }
      
      if (statsRes.data?.data) {
        // stats are typically just an object
        const statsPayload = statsRes.data.data;
        setStats(statsPayload.data || statsPayload);
      }
    } catch (err) {
      console.error('Failed to fetch filter data:', err);
    }
  };

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        skip: (page - 1) * limit,
        take: limit,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (subcategoryFilter) params.subcategoryId = subcategoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (conditionFilter) params.condition = conditionFilter;
      if (locationFilter) params.location = locationFilter;

      const res = await productsService.getAll(params);
      if (res.data) {
        const payload = res.data.data || res.data;
        if (Array.isArray(payload)) {
          setListings(payload);
        } else if (payload?.data && Array.isArray(payload.data)) {
          setListings(payload.data);
          setTotal(payload.total || 0);
        } else {
          setListings([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, categoryFilter, subcategoryFilter, statusFilter, conditionFilter, locationFilter]);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handle Category change to fetch subcategories
  useEffect(() => {
    if (categoryFilter) {
      const selectedCat = categories.find(c => c.id === categoryFilter);
      if (selectedCat && selectedCat.children) {
        setSubcategories(selectedCat.children);
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }, [categoryFilter, categories]);

  const handleReset = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setCategoryFilter('');
    setSubcategoryFilter('');
    setStatusFilter('');
    setConditionFilter('');
    setLocationFilter('');
    setPage(1);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, listing: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedListing(listing);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedListing(null);
  };

  const handleApprove = async () => {
    if (!selectedListing) return;
    try {
      setActionLoading(true);
      await productsService.approve(selectedListing.id);
      fetchListings();
      productsService.getStats().then(res => res.data?.data && setStats(res.data.data));
    } catch (err) {
      console.error('Failed to approve listing:', err);
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedListing) return;
    try {
      setActionLoading(true);
      await productsService.reject(selectedListing.id, rejectReason || 'Violation of terms');
      fetchListings();
      productsService.getStats().then(res => res.data?.data && setStats(res.data.data));
    } catch (err) {
      console.error('Failed to reject listing:', err);
    } finally {
      setActionLoading(false);
      setIsRejectDialogOpen(false);
      setRejectReason('');
      handleMenuClose();
    }
  };

  const handleDelete = async () => {
    if (!selectedListing) return;
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      setActionLoading(true);
      await productsService.remove(selectedListing.id);
      fetchListings();
      productsService.getStats().then(res => res.data?.data && setStats(res.data.data));
    } catch (err) {
      console.error('Failed to delete listing:', err);
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };

  const getConditionColor = (cond: string) => {
    if (cond === 'LIKE_NEW' || cond === 'NEW') return { color: '#10b981', bgcolor: '#10b98115' };
    if (cond === 'GOOD' || cond === 'FAIR') return { color: '#f59e0b', bgcolor: '#f59e0b15' };
    return { color: '#3b82f6', bgcolor: '#3b82f615' };
  };

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED' || status === 'ACTIVE') return { color: '#10b981', bgcolor: '#10b98115' };
    if (status === 'PENDING' || status === 'UNDER_REVIEW') return { color: '#f59e0b', bgcolor: '#f59e0b15' };
    return { color: '#ef4444', bgcolor: '#ef444415' };
  };

  const formatCondition = (cond: string) => {
    if (!cond) return 'Unknown';
    return cond.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Listings</Typography>
        <Typography variant="body2" color="text.secondary">Manage all product listings on the platform</Typography>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <StatCard title="Total Listings" value={stats.total} icon={<Inventory />} color="#3b82f6" isPositive={true} trendValue="15.2%" />
        <StatCard title="Active Listings" value={stats.active} icon={<CheckCircleOutlined />} color="#10b981" isPositive={true} trendValue="10.4%" />
        <StatCard title="Pending Approval" value={stats.pending} icon={<AccessTime />} color="#f59e0b" isPositive={false} trendValue="5.8%" />
        <StatCard title="Rejected Listings" value={stats.rejected} icon={<HighlightOff />} color="#ef4444" isPositive={true} trendValue="2.5%" />
        <StatCard title="Sold Listings" value={stats.sold} icon={<ShoppingCartOutlined />} color="#8b5cf6" isPositive={true} trendValue="12.7%" />
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20 }} /></InputAdornment> } }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select displayEmpty value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              renderValue={(val) => val ? categories.find(c => c.id === val)?.name || 'All Categories' : 'All Categories'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="" sx={{ fontSize: '0.85rem' }}><em>All Categories</em></MenuItem>
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.85rem' }}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select displayEmpty value={subcategoryFilter} onChange={(e) => { setSubcategoryFilter(e.target.value); setPage(1); }}
              renderValue={(val) => val ? subcategories.find(c => c.id === val)?.name || 'All Subcategories' : 'All Subcategories'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}
              disabled={!categoryFilter || subcategories.length === 0}>
              <MenuItem value="" sx={{ fontSize: '0.85rem' }}><em>All Subcategories</em></MenuItem>
              {subcategories.map(c => (
                <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.85rem' }}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select displayEmpty value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              renderValue={(val) => val ? val : 'All Status'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="" sx={{ fontSize: '0.85rem' }}><em>All Status</em></MenuItem>
              <MenuItem value="ACTIVE" sx={{ fontSize: '0.85rem' }}>Active</MenuItem>
              <MenuItem value="PENDING" sx={{ fontSize: '0.85rem' }}>Pending</MenuItem>
              <MenuItem value="APPROVED" sx={{ fontSize: '0.85rem' }}>Approved</MenuItem>
              <MenuItem value="REJECTED" sx={{ fontSize: '0.85rem' }}>Rejected</MenuItem>
              <MenuItem value="SOLD" sx={{ fontSize: '0.85rem' }}>Sold</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select displayEmpty value={conditionFilter} onChange={(e) => { setConditionFilter(e.target.value); setPage(1); }}
              renderValue={(val) => val ? formatCondition(val) : 'All Conditions'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="" sx={{ fontSize: '0.85rem' }}><em>All Conditions</em></MenuItem>
              <MenuItem value="NEW" sx={{ fontSize: '0.85rem' }}>New</MenuItem>
              <MenuItem value="LIKE_NEW" sx={{ fontSize: '0.85rem' }}>Like New</MenuItem>
              <MenuItem value="GOOD" sx={{ fontSize: '0.85rem' }}>Good</MenuItem>
              <MenuItem value="FAIR" sx={{ fontSize: '0.85rem' }}>Fair</MenuItem>
              <MenuItem value="POOR" sx={{ fontSize: '0.85rem' }}>Poor</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select displayEmpty value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
              renderValue={(val) => val ? val : 'All Locations'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="" sx={{ fontSize: '0.85rem' }}><em>All Locations</em></MenuItem>
              {locations.map((loc, idx) => (
                <MenuItem key={idx} value={loc} sx={{ fontSize: '0.85rem' }}>{loc}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" size="small" startIcon={<FilterList />} sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary', borderColor: '#e2e8f0', bgcolor: '#f8fafc' }}>
            More Filters
          </Button>
          <Button variant="text" size="small" onClick={handleReset} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Reset
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button variant="contained" size="small" startIcon={<Add />} onClick={() => router.push('/listings/add')} sx={{ borderRadius: 2, textTransform: 'none', px: 2, py: 0.8, bgcolor: '#2563eb' }}>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No listings found matching the selected filters.</Typography>
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
                      <IconButton size="small" onClick={() => { setSelectedListing(item); setIsViewDialogOpen(true); }}><Visibility sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}><MoreVert sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {total > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} listings
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Pagination 
              count={Math.ceil(total / limit)} 
              page={page} 
              onChange={(e, val) => setPage(val)} 
              color="primary" 
              size="small" 
            />
          </Box>
        </Box>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {selectedListing?.status === 'PENDING' && (
            <MenuItem onClick={handleApprove} disabled={actionLoading}>
              <CheckCircle fontSize="small" sx={{ mr: 1, color: '#10b981' }} /> Approve
            </MenuItem>
          )}
          {selectedListing?.status !== 'REJECTED' && (
            <MenuItem onClick={() => { setIsRejectDialogOpen(true); setAnchorEl(null); }} disabled={actionLoading}>
              <Cancel fontSize="small" sx={{ mr: 1, color: '#ef4444' }} /> Reject
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete} disabled={actionLoading}>
            <DeleteForever fontSize="small" sx={{ mr: 1, color: '#ef4444' }} /> Remove
          </MenuItem>
        </Menu>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onClose={() => setIsRejectDialogOpen(false)}>
        <DialogTitle>Reject Listing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this listing. This will be sent to the seller.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRejectDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleRejectConfirm} variant="contained" color="error" disabled={!rejectReason.trim() || actionLoading}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <ListingDialog 
        open={isViewDialogOpen || isEditDialogOpen} 
        onClose={() => { setIsViewDialogOpen(false); setIsEditDialogOpen(false); }} 
        listing={selectedListing} 
        mode={isEditDialogOpen ? 'edit' : 'view'} 
        onSuccess={fetchListings}
      />
    </Box>
  );
}
