'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Pagination,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  LocalOffer,
  CheckCircle,
  PauseCircleFilled,
  Inventory2,
  Star,
  StarBorder,
  Visibility,
  Edit,
  Delete,
  Add,
  FileDownload,
  FilterList
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { brandsService } from '@/services/admin.service';
import { Brand, BrandStats } from '@/types';

const StatCard = ({ title, value, icon, color }: any) => (
  <Card sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'flex-start', gap: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {React.cloneElement(icon, { sx: { color: color, fontSize: 24 } })}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', my: 0.5 }}>{value}</Typography>
    </Box>
  </Card>
);

export default function BrandsPage() {
  const router = useRouter();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<BrandStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        skip: (page - 1) * pageSize,
        take: pageSize,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.categoryId = categoryFilter;

      const res = await brandsService.getAll(params);
      const resData = res.data;
      if (resData?.data && Array.isArray(resData.data)) {
        setBrands(resData.data);
        setTotal(resData.total || resData.data.length);
      } else if (resData?.data?.data && Array.isArray(resData.data.data)) {
        setBrands(resData.data.data);
        setTotal(resData.data.total || 0);
      } else if (Array.isArray(resData)) {
        setBrands(resData);
        setTotal(resData.length);
      } else {
        setBrands([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err);
      setSnackbar({ open: true, message: 'Failed to load brands', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, categoryFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await brandsService.getStats();
      setStats(res.data.data || null);
    } catch (err) {
      console.error('Failed to fetch brand stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await brandsService.delete(id);
      setSnackbar({ open: true, message: 'Brand deleted successfully', severity: 'success' });
      fetchBrands();
      fetchStats();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete brand', severity: 'error' });
    }
  };

  const handleToggleFeatured = async (id: string, currentVal: boolean) => {
    try {
      await brandsService.toggleFeatured(id, !currentVal);
      fetchBrands();
      fetchStats();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update featured status', severity: 'error' });
    }
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  const handleExport = () => {
    if (brands.length === 0) {
      setSnackbar({ open: true, message: 'No data to export', severity: 'error' });
      return;
    }
    const csvContent = [
      ['ID', 'Name', 'Slug', 'Category', 'Status', 'Featured', 'Created At'],
      ...brands.map(b => [
        b.id,
        `"${b.name}"`,
        b.slug,
        `"${b.category?.name || ''}"`,
        b.isActive ? 'Active' : 'Inactive',
        b.isFeatured ? 'Yes' : 'No',
        new Date(b.createdAt).toISOString()
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `brands_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleView = (id: string) => {
    router.push(`/brands/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/brands/edit/${id}`);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Brand Management</Typography>
          <Typography variant="body2" color="text.secondary">Dashboard &gt; Brands &gt; All Brands</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff', px: 2, py: 1, borderRadius: 2, border: '1px solid #e2e8f0', minWidth: 250 }}>
            <Box
              component="input"
              placeholder="Search brands..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
              sx={{ border: 'none', bgcolor: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Metrics Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <StatCard title="Total Brands" value={stats?.total?.toLocaleString() ?? '—'} icon={<LocalOffer />} color="#8b5cf6" />
        <StatCard title="Active Brands" value={stats?.active?.toLocaleString() ?? '—'} icon={<CheckCircle />} color="#10b981" />
        <StatCard title="Inactive Brands" value={stats?.inactive?.toLocaleString() ?? '—'} icon={<PauseCircleFilled />} color="#ef4444" />
        <StatCard title="Total Products" value={stats?.totalProducts?.toLocaleString() ?? '—'} icon={<Inventory2 />} color="#3b82f6" />
        <StatCard title="Featured Brands" value={stats?.featured?.toLocaleString() ?? '—'} icon={<Star />} color="#f59e0b" />
      </Box>

      {/* Main Table Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        {/* Filter Bar */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, borderBottom: '1px solid #f1f5f9', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', px: 2, py: 1, borderRadius: 2, border: '1px solid #e2e8f0', flex: 1, minWidth: 250 }}>
            <Box
              component="input"
              placeholder="Search by brand name, slug..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
              sx={{ border: 'none', bgcolor: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }}
            />
          </Box>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={statusFilter}
              displayEmpty
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" startIcon={<FilterList />} sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#64748b' }}>Filters</Button>
          <Button variant="text" onClick={handleReset} sx={{ textTransform: 'none', color: '#64748b' }}>Reset</Button>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExport} sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#334155' }}>Export</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/brands/add')} sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}>Add Brand</Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Brand</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Category</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Products</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Featured</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Created On</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">No brands found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  brands.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 40, height: 40, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {row.logoUrl ? (
                              <img src={row.logoUrl} alt={row.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                            ) : (
                              <LocalOffer sx={{ color: '#cbd5e1', fontSize: 20 }} />
                            )}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{row.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>{row.slug}</Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#475569' }}>{row.category?.name || '—'}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{row._count?.products?.toLocaleString() ?? '0'}</Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={row.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: row.isActive ? '#dcfce7' : '#fee2e2',
                            color: row.isActive ? '#166534' : '#991b1b',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            borderRadius: 1
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleToggleFeatured(row.id, row.isFeatured)}>
                          {row.isFeatured ? (
                            <Star sx={{ color: '#f59e0b', fontSize: 20 }} />
                          ) : (
                            <StarBorder sx={{ color: '#cbd5e1', fontSize: 20 }} />
                          )}
                        </IconButton>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155' }}>
                          {new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {new Date(row.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleView(row.id)}><Visibility sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                          <IconButton size="small" onClick={() => handleEdit(row.id)}><Edit sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                          <IconButton size="small" onClick={() => handleDelete(row.id)}>
                            <Delete sx={{ fontSize: 18, color: '#ef4444' }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {brands.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, total)} of {total.toLocaleString()} brands
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, val) => setPage(val)}
              shape="rounded"
              color="primary"
              size="small"
            />
            <FormControl size="small">
              <Select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                sx={{ borderRadius: 2, fontSize: '0.8rem', height: 32 }}
              >
                <MenuItem value={10}>10 / page</MenuItem>
                <MenuItem value={25}>25 / page</MenuItem>
                <MenuItem value={50}>50 / page</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Card>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
