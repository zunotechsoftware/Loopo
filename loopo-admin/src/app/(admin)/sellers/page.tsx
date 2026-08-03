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
  FilterList,
  Storefront,
  VerifiedUser,
  PendingActions,
  Cancel,
  Block,
  ArrowUpward,
  ArrowDownward,
  Star
} from '@mui/icons-material';
import { sellersService } from '@/services/admin.service';

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

export default function SellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await sellersService.getAll();
      if (res.data) {
        const payload = res.data.data;
        if (Array.isArray(payload)) {
          setSellers(payload);
        } else if (payload?.data && Array.isArray(payload.data)) {
          setSellers(payload.data);
        } else {
          setSellers([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sellers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, sellerId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedSellerId(sellerId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSellerId(null);
  };

  const handleVerify = async () => {
    if (!selectedSellerId) return;
    try {
      await sellersService.verify(selectedSellerId);
      fetchSellers();
    } catch (err) {
      console.error(err);
    }
    handleMenuClose();
  };

  const handleSuspend = async () => {
    if (!selectedSellerId) return;
    try {
      await sellersService.suspend(selectedSellerId);
      fetchSellers();
    } catch (err) {
      console.error(err);
    }
    handleMenuClose();
  };

  const getVerificationColor = (status: string) => {
    if (status === 'VERIFIED') return { color: '#10b981', bgcolor: '#10b98115', label: 'Verified' };
    if (status === 'PENDING') return { color: '#f59e0b', bgcolor: '#f59e0b15', label: 'Pending' };
    if (status === 'REJECTED') return { color: '#ef4444', bgcolor: '#ef444415', label: 'Rejected' };
    if (status === 'SUSPENDED') return { color: '#ef4444', bgcolor: '#ef444415', label: 'Suspended' };
    return { color: '#64748b', bgcolor: '#64748b15', label: 'Unknown' };
  };
  
  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return { color: '#10b981', bgcolor: '#10b98115', label: 'Active' };
    if (status === 'PENDING') return { color: '#f59e0b', bgcolor: '#f59e0b15', label: 'Pending' };
    if (status === 'SUSPENDED') return { color: '#ef4444', bgcolor: '#ef444415', label: 'Suspended' };
    if (status === 'BLOCKED') return { color: '#ef4444', bgcolor: '#ef444415', label: 'Blocked' };
    return { color: '#64748b', bgcolor: '#64748b15', label: status || 'Unknown' };
  };

  const uniqueCategories = Array.from(new Set(sellers.flatMap(s => s.user?.products?.map((p: any) => p.category?.name)).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(sellers.flatMap(s => s.user?.products?.map((p: any) => p.location?.city)).filter(Boolean)));

  const filteredSellers = sellers.filter(seller => {
    const user = seller.user;
    const searchMatch = !searchTerm || 
      seller.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user?.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = !statusFilter || (user?.status && user.status.toUpperCase() === statusFilter.toUpperCase());
    
    const verificationMatch = !verificationFilter || (seller.verificationStatus && seller.verificationStatus.toUpperCase() === verificationFilter.toUpperCase());
    
    const sellerCategories = user?.products?.map((p: any) => p.category?.name) || [];
    const categoryMatch = !categoryFilter || sellerCategories.includes(categoryFilter); 
    
    const sellerLocations = user?.products?.map((p: any) => p.location?.city) || [];
    const locationMatch = !locationFilter || sellerLocations.includes(locationFilter);
    
    return searchMatch && statusMatch && verificationMatch && categoryMatch && locationMatch;
  });

  const totalSellers = filteredSellers.length;
  const verifiedSellers = filteredSellers.filter(s => s.verificationStatus === 'VERIFIED').length;
  const pendingSellers = filteredSellers.filter(s => s.verificationStatus === 'PENDING').length;
  const rejectedSellers = filteredSellers.filter(s => s.verificationStatus === 'REJECTED').length;
  const suspendedSellers = filteredSellers.filter(s => s.verificationStatus === 'SUSPENDED').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Sellers</Typography>
          <Typography variant="body2" color="text.secondary">Manage all sellers and their verification status</Typography>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <StatCard title="Total Sellers" value={totalSellers.toLocaleString()} icon={<Storefront />} color="#3b82f6" isPositive={true} trendValue="8.3%" />
        <StatCard title="Verified Sellers" value={verifiedSellers.toLocaleString()} icon={<VerifiedUser />} color="#10b981" isPositive={true} trendValue="12.6%" />
        <StatCard title="Pending Verification" value={pendingSellers.toLocaleString()} icon={<PendingActions />} color="#f59e0b" isPositive={false} trendValue="3.4%" />
        <StatCard title="Rejected Sellers" value={rejectedSellers.toLocaleString()} icon={<Cancel />} color="#ef4444" isPositive={true} trendValue="5.2%" />
        <StatCard title="Suspended Sellers" value={suspendedSellers.toLocaleString()} icon={<Block />} color="#8b5cf6" isPositive={true} trendValue="2.1%" />
      </Box>

      {/* Main Card */}
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        
        {/* Filter Row */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search seller by name, email or mobile..."
            variant="outlined" size="small"
            sx={{ flex: '1 1 250px', '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' } }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20 }} /></InputAdornment> } }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              renderValue={(val) => val ? val : 'All Status'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="Active" sx={{ fontSize: '0.85rem' }}>Active</MenuItem>
              <MenuItem value="Suspended" sx={{ fontSize: '0.85rem' }}>Suspended</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select displayEmpty value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)}
              renderValue={(val) => val ? val : 'All Verification'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="Verified" sx={{ fontSize: '0.85rem' }}>Verified</MenuItem>
              <MenuItem value="Pending" sx={{ fontSize: '0.85rem' }}>Pending</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select displayEmpty value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              renderValue={(val) => val ? val : 'All Categories'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="" sx={{ fontSize: '0.85rem' }}>All Categories</MenuItem>
              {uniqueCategories.map(cat => (
                <MenuItem key={cat as string} value={cat as string} sx={{ fontSize: '0.85rem' }}>{cat as string}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select displayEmpty value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
              renderValue={(val) => val ? val : 'All Locations'}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="" sx={{ fontSize: '0.85rem' }}>All Locations</MenuItem>
              {uniqueLocations.map(loc => (
                <MenuItem key={loc as string} value={loc as string} sx={{ fontSize: '0.85rem' }}>{loc as string}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" size="small" startIcon={<FilterList />} sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary', borderColor: '#e2e8f0', bgcolor: '#f8fafc' }}>
            More Filters
          </Button>
          <Button variant="text" size="small" sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Reset
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button variant="contained" size="small" sx={{ borderRadius: 2, textTransform: 'none', px: 2, py: 0.8, bgcolor: '#2563eb' }}>
            + Add Seller
          </Button>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem' }}>Sellers List</Typography>

        <TableContainer>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid #f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', py: 1.5 } }}>
                <TableCell padding="checkbox"><Checkbox size="small"/></TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Store & Contact</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Verification</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Listings</TableCell>
                <TableCell>Total Sales</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && sellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredSellers.map((item, idx) => {
                const user = item.user;
                const vColor = getVerificationColor(item.verificationStatus);
                const sColor = getStatusColor(user?.status);
                const kycDocs = item.kycStatus === 'APPROVED' ? 'PAN, Aadhar' : 'PAN'; // Mock tags based on status

                return (
                  <TableRow key={idx} hover sx={{ '& td': { borderBottom: '1px solid #f8fafc', py: 1.5 } }}>
                    <TableCell padding="checkbox"><Checkbox size="small"/></TableCell>
                    
                    {/* Seller Info */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={item.profileImage || user?.profileImage || `https://ui-avatars.com/api/?name=${item.displayName}&background=random`} sx={{ width: 36, height: 36 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{item.displayName}</Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>#SLR{item.id?.substring(0, 4).toUpperCase()}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Store & Contact Info */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>{item.storeName || item.displayName}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{user?.phone || 'N/A'}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{user?.email}</Typography>
                      </Box>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Storefront sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155', fontSize: '0.8rem' }}>
                          {user?.products?.[0]?.category?.name || 'General'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Verification */}
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'inline-block', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.7rem', fontWeight: 600, mb: 0.5, ...vColor }}>
                          {vColor.label}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{kycDocs}</Typography>
                      </Box>
                    </TableCell>

                    {/* Rating */}
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 16, color: '#f59e0b' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{user?.sellerStatistics?.averageRating?.toFixed(1) || item.sellerRating?.toFixed(1) || '0.0'}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>({user?.sellerStatistics?.totalReviews || 0})</Typography>
                      </Box>
                    </TableCell>

                    {/* Listings */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{item.totalListings || 0}</Typography>
                        <Typography variant="caption" sx={{ color: '#10b981' }}>Active</Typography>
                      </Box>
                    </TableCell>

                    {/* Total Sales */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>₹{item.totalSales?.toLocaleString() || 0}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{Math.floor(item.totalSales / 1000) || 0} Orders</Typography>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600, ...sColor }}>
                        {sColor.label}
                      </Box>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.8rem' }}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                        <IconButton size="small"><Visibility sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                        <IconButton size="small"><Edit sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, item.id)}><MoreVert sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
          <Typography variant="body2" color="text.secondary">Showing {filteredSellers.length > 0 ? 1 : 0} to {filteredSellers.length} of {filteredSellers.length} sellers</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
             <Button variant="outlined" size="small" sx={{ minWidth: 30, p: 0.5, borderColor: '#e2e8f0', color: '#64748b' }} disabled>&lt;</Button>
             <Button variant="contained" size="small" sx={{ minWidth: 30, p: 0.5, bgcolor: '#2563eb' }}>1</Button>
             <Button variant="outlined" size="small" sx={{ minWidth: 30, p: 0.5, borderColor: '#e2e8f0', color: '#64748b' }} disabled>&gt;</Button>
          </Box>
        </Box>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleVerify}><CheckCircle fontSize="small" sx={{ mr: 1, color: '#10b981' }} /> Verify</MenuItem>
          <MenuItem onClick={handleSuspend}><Block fontSize="small" sx={{ mr: 1, color: '#f59e0b' }} /> Suspend</MenuItem>
        </Menu>
      </Card>
    </Box>
  );
}
