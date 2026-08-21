'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Checkbox, IconButton, Chip, Pagination,
  LinearProgress, MenuItem, TextField, Button
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

interface CouponsTableProps {
  coupons: any[];
  onEdit: (coupon: any) => void;
  onView: (coupon: any) => void;
}

export default function CouponsTable({ coupons, onEdit, onView }: CouponsTableProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');

  const getStatus = (coupon: any) => {
    const now = new Date();
    if (coupon.expiresAt && new Date(coupon.expiresAt) <= now) return 'Expired';
    if (!coupon.isActive) return 'Paused';
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return { color: '#10b981', bgcolor: '#d1fae5', border: '1px solid #10b98140' };
      case 'Paused': return { color: '#f59e0b', bgcolor: '#fef3c7', border: '1px solid #f59e0b40' };
      case 'Expired': return { color: '#ef4444', bgcolor: '#fee2e2', border: '1px solid #ef444440' };
      case 'Scheduled': return { color: '#3b82f6', bgcolor: '#dbeafe', border: '1px solid #3b82f640' };
      default: return { color: '#64748b', bgcolor: '#f1f5f9', border: '1px solid #64748b40' };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return { color: '#8b5cf6', bgcolor: '#f3e8ff' };
      case 'FIXED': return { color: '#3b82f6', bgcolor: '#dbeafe' };
      default: return { color: '#f59e0b', bgcolor: '#fef3c7' };
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setTypeFilter('All Types');
    setPage(1);
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = 
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || getStatus(coupon) === statusFilter;
    const matchesType = typeFilter === 'All Types' || 
      (typeFilter === 'Percentage' && coupon.type === 'PERCENTAGE') ||
      (typeFilter === 'Fixed' && coupon.type === 'FIXED');

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredCoupons.length / rowsPerPage);
  const paginatedCoupons = filteredCoupons.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const startIndex = filteredCoupons.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, filteredCoupons.length);

  const formatCurrency = (num: number) => {
    if (!num) return '-';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <Box sx={{ bgcolor: '#ffffff', borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      
      {/* Table Filters Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField 
          size="small" 
          placeholder="Search by coupon code or name..." 
          sx={{ width: 220 }} 
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
        />
        <TextField 
          select 
          size="small" 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          sx={{ width: 140 }}
        >
          <MenuItem value="All Status">All Status</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Paused">Paused</MenuItem>
          <MenuItem value="Expired">Expired</MenuItem>
        </TextField>
        <TextField 
          select 
          size="small" 
          value={typeFilter} 
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          sx={{ width: 140 }}
        >
          <MenuItem value="All Types">All Types</MenuItem>
          <MenuItem value="Percentage">Percentage</MenuItem>
          <MenuItem value="Fixed">Fixed</MenuItem>
        </TextField>
        <TextField select size="small" value="All Users" sx={{ width: 140 }}>
          <MenuItem value="All Users">All Users</MenuItem>
        </TextField>
        <TextField select size="small" value="All Minimum Purchase" sx={{ width: 200 }}>
          <MenuItem value="All Minimum Purchase">All Minimum Purchase</MenuItem>
        </TextField>
        <Button variant="outlined" size="small" sx={{ ml: 'auto', textTransform: 'none', color: '#64748b', borderColor: '#e2e8f0' }}>Filters</Button>
        <Button size="small" onClick={handleResetFilters} sx={{ textTransform: 'none', color: '#64748b' }}>Reset</Button>
      </Box>

      <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>All Coupons</Typography>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 1000 }} aria-label="coupons table">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell padding="checkbox"><Checkbox color="primary" /></TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Coupon</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Type</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Discount</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Min. Purchase</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Usage / Limit</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Status</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Validity</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Created On</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem', align: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCoupons.map((row: any) => {
              const status = getStatus(row);
              const usagePercent = row.usageLimit ? (row.usageCount / row.usageLimit) * 100 : 0;
              
              return (
                <TableRow key={row.id} hover>
                  <TableCell padding="checkbox"><Checkbox color="primary" /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ border: '1px dashed #cbd5e1', borderRadius: 1, px: 1, py: 0.5, bgcolor: '#f8fafc' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981' }}>{row.code}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{row.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.type === 'PERCENTAGE' ? `${row.value}% off` : `Flat ${formatCurrency(row.value)} off`}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed'} 
                      size="small" 
                      sx={{ ...getTypeColor(row.type), fontWeight: 600, fontSize: '0.7rem', borderRadius: 1, height: 24 }} 
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                    {row.type === 'PERCENTAGE' ? `${row.value}%` : formatCurrency(row.value)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                    {formatCurrency(row.minPurchase)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 100 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>
                        {row.usageCount} / {row.usageLimit || '∞'}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontSize: '0.65rem' }}>
                        {row.usageLimit ? `${Math.round(usagePercent)}% used` : 'Unlimited'}
                      </Typography>
                      {row.usageLimit && (
                        <LinearProgress 
                          variant="determinate" 
                          value={usagePercent} 
                          sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: usagePercent >= 100 ? '#ef4444' : '#10b981' } }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={status} 
                      size="small" 
                      sx={{ ...getStatusColor(status), fontWeight: 600, fontSize: '0.7rem', borderRadius: 1, height: 24 }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ display: 'block', color: '#475569', fontWeight: 500 }}>
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                      {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                     <Typography variant="caption" sx={{ display: 'block', color: '#475569', fontWeight: 500 }}>
                      {new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                      {new Date(row.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" sx={{ color: '#64748b' }} onClick={() => onView(row)}><VisibilityOutlinedIcon fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ color: '#64748b' }} onClick={() => onEdit(row)}><EditOutlinedIcon fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ color: '#64748b' }}><MoreVertOutlinedIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginatedCoupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No coupons found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Showing {startIndex} to {endIndex} of {coupons.length} coupons
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {totalPages > 1 && (
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" shape="rounded" size="small" />
          )}
          <TextField 
            select 
            size="small" 
            value={rowsPerPage.toString()} 
            onChange={handleRowsPerPageChange}
            sx={{ width: 100, '& .MuiOutlinedInput-root': { height: 32 } }}
          >
             <MenuItem value="5">5 / page</MenuItem>
             <MenuItem value="10">10 / page</MenuItem>
             <MenuItem value="25">25 / page</MenuItem>
             <MenuItem value="50">50 / page</MenuItem>
          </TextField>
        </Box>
      </Box>
    </Box>
  );
}
