'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Checkbox, IconButton, Chip, Pagination
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

interface AdvertisementsTableProps {
  ads: any[];
  onEdit: (ad: any) => void;
  onView: (ad: any) => void;
}

export default function AdvertisementsTable({ ads, onEdit, onView }: AdvertisementsTableProps) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return { color: '#10b981', bgcolor: '#d1fae5' };
      case 'paused': return { color: '#f59e0b', bgcolor: '#fef3c7' };
      case 'expired': return { color: '#ef4444', bgcolor: '#fee2e2' };
      case 'completed': return { color: '#3b82f6', bgcolor: '#dbeafe' };
      default: return { color: '#64748b', bgcolor: '#f1f5f9' };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'banner': return { color: '#8b5cf6', bgcolor: '#f3e8ff' };
      case 'image_ad': return { color: '#10b981', bgcolor: '#d1fae5' };
      case 'text_ad': return { color: '#f59e0b', bgcolor: '#fef3c7' };
      case 'video_ad': return { color: '#ef4444', bgcolor: '#fee2e2' };
      default: return { color: '#64748b', bgcolor: '#f1f5f9' };
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const totalPages = Math.ceil(ads.length / rowsPerPage);
  const paginatedAds = ads.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const startIndex = ads.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, ads.length);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);
  };

  return (
    <Box sx={{ bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>All Advertisements</Typography>
      </Box>
      <TableContainer>
        <Table sx={{ minWidth: 800 }} aria-label="advertisements table">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox color="primary" />
              </TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Advertisement</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Type</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Placement</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Campaign</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Status</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Impressions</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Clicks</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>CTR</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Spend</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Start Date</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>End Date</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem', align: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAds.map((row: any) => {
              const ctr = row.impressions > 0 ? ((row.clicks / row.impressions) * 100).toFixed(2) : '0.00';
              return (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        component="img"
                        src={row.imageUrl || 'https://via.placeholder.com/80x32?text=AD'}
                        alt={row.title}
                        sx={{ width: 80, height: 32, borderRadius: 1, objectFit: 'cover' }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {row.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.id?.substring(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.type.replace('_', ' ')} 
                      size="small" 
                      sx={{ 
                        ...getTypeColor(row.type), 
                        fontWeight: 600, 
                        fontSize: '0.7rem',
                        borderRadius: 1
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#475569' }}>{row.placement || 'N/A'}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#475569' }}>{row.campaign || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small" 
                      sx={{ 
                        ...getStatusColor(row.status), 
                        fontWeight: 600, 
                        fontSize: '0.7rem',
                        borderRadius: 1
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>{formatNumber(row.impressions)}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>{formatNumber(row.clicks)}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>{ctr}%</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>{formatCurrency(row.spend)}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#475569' }}>{row.startDate ? new Date(row.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#475569' }}>{row.endDate ? new Date(row.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" sx={{ color: '#64748b' }} onClick={() => onView(row)}>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#64748b' }} onClick={() => onEdit(row)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginatedAds.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No advertisements found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {startIndex} to {endIndex} of {ads.length} advertisements
        </Typography>
        <Pagination 
          count={totalPages} 
          page={page}
          onChange={handlePageChange}
          color="primary" 
          shape="rounded" 
          size="small" 
        />
      </Box>
    </Box>
  );
}
