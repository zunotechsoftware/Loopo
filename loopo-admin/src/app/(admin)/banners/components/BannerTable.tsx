'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Checkbox, IconButton, Chip, Pagination
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

interface BannerTableProps {
  banners: any[];
  onEdit: (banner: any) => void;
  onView: (banner: any) => void;
}

export default function BannerTable({ banners, onEdit, onView }: BannerTableProps) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return { color: '#10b981', bgcolor: '#d1fae5' };
      case 'paused': return { color: '#f59e0b', bgcolor: '#fef3c7' };
      case 'expired': return { color: '#ef4444', bgcolor: '#fee2e2' };
      default: return { color: '#64748b', bgcolor: '#f1f5f9' };
    }
  };

  const getTypeColor = (type: string) => {
    return { color: '#8b5cf6', bgcolor: '#f3e8ff' };
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const totalPages = Math.ceil(banners.length / rowsPerPage);
  const paginatedBanners = banners.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const startIndex = banners.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, banners.length);

  return (
    <Box sx={{ bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>All Banners</Typography>
      </Box>
      <TableContainer>
        <Table sx={{ minWidth: 800 }} aria-label="banners table">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox color="primary" />
              </TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Banner</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Type</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Placement</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Status</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Impressions</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Clicks</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>CTR</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>Start Date</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>End Date</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem', align: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBanners.map((row: any) => (
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
                      src={row.imageUrl}
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
                    label={row.type} 
                    size="small" 
                    sx={{ 
                      ...getTypeColor(row.type), 
                      fontWeight: 600, 
                      fontSize: '0.7rem',
                      borderRadius: 1
                    }} 
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{row.targetUrl || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.isActive ? 'Active' : 'Inactive'} 
                    size="small" 
                    sx={{ 
                      ...getStatusColor(row.isActive ? 'active' : 'paused'), 
                      fontWeight: 600, 
                      fontSize: '0.7rem',
                      borderRadius: 1
                    }} 
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{row.impressions || '-'}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{row.clicks || '-'}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{row.ctr || '-'}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{row.startDate ? new Date(row.startDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{row.endDate ? new Date(row.endDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" sx={{ color: '#64748b' }} onClick={() => onView(row)}>
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ color: '#64748b' }} onClick={() => onEdit(row)}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedBanners.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No banners found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {startIndex} to {endIndex} of {banners.length} banners
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
