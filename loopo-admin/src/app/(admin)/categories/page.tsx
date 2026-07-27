'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableRow, TableHead,
  Chip, TextField, FormControl, InputLabel, Select, MenuItem,
  Radio, RadioGroup, FormControlLabel, FormLabel, Tab, Tabs,
  Drawer, Divider, Grid, Paper, Pagination, CircularProgress,
  Snackbar, Alert, Checkbox, SelectChangeEvent, Avatar
} from '@mui/material';
import {
  Add, Edit, Delete, Close, Save, Search, FilterList,
  GetApp as ExportIcon, Visibility, CloudUpload,
  ArrowUpward, ArrowDownward, CheckCircle, FolderOpen, Category as CategoryIcon,
  Inventory, Block
} from '@mui/icons-material';
import { Category, CategoryStats } from '@/types';
import { categoriesService } from '@/services/admin.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`category-tabpanel-${index}`}
      aria-labelledby={`category-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  // --- States ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Table paging and filtering
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('sortOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState(0);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  
  // File uploads mock
  const [iconPreview, setIconPreview] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');

  // Notification states
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // --- API Call Triggers ---
  
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await categoriesService.getStats();
      if (res.data) {
        setStats(res.data.data || res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: pageSize,
        sortBy,
        sortOrder,
      };

      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (levelFilter !== 'all') params.level = parseInt(levelFilter);

      const res = await categoriesService.getAll(params);
      const resData = res.data;
      
      // Standardize result structure
      if (resData?.data && Array.isArray(resData.data)) {
        setCategories(resData.data);
        setTotal(resData.total || resData.data.length);
      } else if (resData?.data?.data && Array.isArray(resData.data.data)) {
        setCategories(resData.data.data);
        setTotal(resData.data.total || 0);
      } else if (Array.isArray(resData)) {
        setCategories(resData);
        setTotal(resData.length);
      } else {
        setCategories([]);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      showNotification('Failed to retrieve categories list', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, typeFilter, levelFilter, sortBy, sortOrder]);

  const fetchParentOptions = useCallback(async () => {
    try {
      // Fetch all items for dropdown selections
      const res = await categoriesService.getAll({ all: true });
      const resData = res.data;
      if (resData?.data && Array.isArray(resData.data)) {
        setParentCategories(resData.data);
      } else if (resData?.data?.data && Array.isArray(resData.data.data)) {
        setParentCategories(resData.data.data);
      } else if (Array.isArray(resData)) {
        setParentCategories(resData);
      }
    } catch (err: any) {
      console.error('Failed to fetch parent categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchParentOptions();
  }, [fetchStats, fetchParentOptions]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- Notifications Helper ---
  const showNotification = (message: string, severity: 'success' | 'error' | 'info') => {
    setAlert({ open: true, message, severity });
  };

  const handleAlertClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  // --- UI Handlers ---
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  const handleStatusFilter = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleTypeFilter = (e: SelectChangeEvent) => {
    setTypeFilter(e.target.value);
    setPage(1);
  };

  const handleLevelFilter = (e: SelectChangeEvent) => {
    setLevelFilter(e.target.value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setLevelFilter('all');
    setSortBy('sortOrder');
    setSortOrder('asc');
    setPage(1);
  };

  const handleSlugAutoGeneration = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setEditingCategory(prev => {
      if (!prev) return null;
      const slug = prev.id ? (prev.slug || '') : handleSlugAutoGeneration(name);
      return { ...prev, name, slug };
    });
  };

  const handleOpenCreate = () => {
    setEditingCategory({
      name: '',
      slug: '',
      parentId: '',
      isActive: true,
      sortOrder: 0,
      description: '',
      seoTitle: '',
      seoDescription: '',
      icon: '',
      bannerImage: ''
    });
    setIconPreview('');
    setImagePreview('');
    setDrawerTab(0);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId || '',
      isActive: cat.isActive,
      sortOrder: cat.sortOrder || 0,
      description: cat.description || '',
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || '',
      icon: cat.icon || '',
      bannerImage: cat.bannerImage || ''
    });
    setIconPreview(cat.icon || '');
    setImagePreview(cat.bannerImage || '');
    setDrawerTab(0);
    setDrawerOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!editingCategory?.name) {
      showNotification('Category Name is required', 'error');
      return;
    }
    if (!editingCategory?.slug) {
      showNotification('Slug is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Category> = {
        name: editingCategory.name,
        slug: editingCategory.slug,
        parentId: editingCategory.parentId || undefined,
        isActive: editingCategory.isActive,
        sortOrder: Number(editingCategory.sortOrder),
        description: editingCategory.description || undefined,
        seoTitle: editingCategory.seoTitle || undefined,
        seoDescription: editingCategory.seoDescription || undefined,
        icon: iconPreview || undefined,
        bannerImage: imagePreview || undefined
      };

      if (editingCategory.id) {
        await categoriesService.update(editingCategory.id, payload);
        showNotification('Category updated successfully', 'success');
      } else {
        await categoriesService.create(payload);
        showNotification('Category created successfully', 'success');
      }

      setDrawerOpen(false);
      fetchCategories();
      fetchStats();
      fetchParentOptions();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message ?? err?.message ?? 'Failed to save category';
      showNotification(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? All subcategories might be affected.')) {
      return;
    }

    try {
      await categoriesService.delete(id);
      showNotification('Category deleted successfully', 'success');
      fetchCategories();
      fetchStats();
      fetchParentOptions();
    } catch (err: any) {
      showNotification('Failed to delete category', 'error');
    }
  };

  const handleExport = () => {
    const headers = ['Name', 'Slug', 'Level', 'ProductsCount', 'Status', 'SortOrder', 'CreatedAt'];
    const rows = categories.map(c => [
      c.name,
      c.slug,
      (c.level ?? 0) + 1,
      c._count?.products ?? 0,
      c.isActive ? 'Active' : 'Inactive',
      c.sortOrder ?? 0,
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `loopo_categories_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Exported categories list successfully', 'success');
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderTrend = (change: number, type: 'increase' | 'decrease') => {
    const isUp = type === 'increase';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        {isUp ? (
          <ArrowUpward fontSize="inherit" sx={{ color: 'success.main', fontSize: '0.85rem' }} />
        ) : (
          <ArrowDownward fontSize="inherit" sx={{ color: 'error.main', fontSize: '0.85rem' }} />
        )}
        <Typography variant="caption" sx={{ color: isUp ? 'success.main' : 'error.main', fontWeight: 600 }}>
          {isUp ? `+${change}%` : `${change}%`}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
          vs last month
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 4 }}>
      {/* Header and Breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>Categories</Typography>
          <Typography variant="body2" color="text.secondary">
            Dashboard &gt; <span style={{ color: '#2563eb', fontWeight: 500 }}>Categories</span>
          </Typography>
        </Box>
      </Box>

      {/* 5 Stats Cards Grid */}
      <Grid container spacing={3}>
        {/* Total Categories */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Total Categories
                  </Typography>
                  {statsLoading ? (
                    <CircularProgress size={24} sx={{ my: 0.5 }} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                      {stats?.totalCategories?.value ?? 0}
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', width: 44, height: 44, borderRadius: 3 }}>
                  <CategoryIcon />
                </Avatar>
              </Box>
              {!statsLoading && stats?.totalCategories && renderTrend(stats.totalCategories.change, stats.totalCategories.changeType)}
            </CardContent>
          </Card>
        </Grid>

        {/* Active Categories */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Active Categories
                  </Typography>
                  {statsLoading ? (
                    <CircularProgress size={24} sx={{ my: 0.5 }} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                      {stats?.activeCategories?.value ?? 0}
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: 44, height: 44, borderRadius: 3 }}>
                  <CheckCircle />
                </Avatar>
              </Box>
              {!statsLoading && stats?.activeCategories && renderTrend(stats.activeCategories.change, stats.activeCategories.changeType)}
            </CardContent>
          </Card>
        </Grid>

        {/* Sub Categories */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Sub Categories
                  </Typography>
                  {statsLoading ? (
                    <CircularProgress size={24} sx={{ my: 0.5 }} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                      {stats?.subCategories?.value ?? 0}
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: 44, height: 44, borderRadius: 3 }}>
                  <FolderOpen />
                </Avatar>
              </Box>
              {!statsLoading && stats?.subCategories && renderTrend(stats.subCategories.change, stats.subCategories.changeType)}
            </CardContent>
          </Card>
        </Grid>

        {/* Total Products */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Total Products
                  </Typography>
                  {statsLoading ? (
                    <CircularProgress size={24} sx={{ my: 0.5 }} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                      {stats?.totalProducts?.value ? stats.totalProducts.value.toLocaleString() : 0}
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', width: 44, height: 44, borderRadius: 3 }}>
                  <Inventory />
                </Avatar>
              </Box>
              {!statsLoading && stats?.totalProducts && renderTrend(stats.totalProducts.change, stats.totalProducts.changeType)}
            </CardContent>
          </Card>
        </Grid>

        {/* Inactive Categories */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Inactive Categories
                  </Typography>
                  {statsLoading ? (
                    <CircularProgress size={24} sx={{ my: 0.5 }} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                      {stats?.inactiveCategories?.value ?? 0}
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: 44, height: 44, borderRadius: 3 }}>
                  <Block />
                </Avatar>
              </Box>
              {!statsLoading && stats?.inactiveCategories && renderTrend(stats.inactiveCategories.change, stats.inactiveCategories.changeType)}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content: Categories List Panel */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* Panel Top Title and Primary Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>All Categories</Typography>
              <Typography variant="body2" color="text.secondary">View and manage all categories</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<ExportIcon />}
                onClick={handleExport}
                sx={{ borderColor: '#cbd5e1', color: '#475569', borderRadius: 2 }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenCreate}
                sx={{ borderRadius: 2 }}
              >
                Add Category
              </Button>
            </Box>
          </Box>

          {/* Filtering Bar */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
            <TextField
              placeholder="Search categories..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              size="small"
              sx={{ flexGrow: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              slotProps={{
                input: {
                  startAdornment: <Search fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />,
                }
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="status-filter-label">All Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="All Status"
                onChange={handleStatusFilter}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="type-filter-label">All Types</InputLabel>
              <Select
                labelId="type-filter-label"
                value={typeFilter}
                label="All Types"
                onChange={handleTypeFilter}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="root">Root</MenuItem>
                <MenuItem value="subcategory">Sub Category</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="level-filter-label">All Levels</InputLabel>
              <Select
                labelId="level-filter-label"
                value={levelFilter}
                label="All Levels"
                onChange={handleLevelFilter}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="0">Level 1 (Root)</MenuItem>
                <MenuItem value="1">Level 2</MenuItem>
                <MenuItem value="2">Level 3</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<FilterList />}
              onClick={handleResetFilters}
              sx={{ borderColor: '#cbd5e1', borderRadius: 2 }}
            >
              Reset Filters
            </Button>
          </Box>

          {/* Categories Grid Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Category Details</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Level</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Products</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Sort Order</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Created On</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary">No categories found matching filters.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((cat) => {
                      const isRoot = !cat.parentId;
                      return (
                        <TableRow hover key={cat.id}>
                          <TableCell padding="checkbox">
                            <Checkbox size="small" />
                          </TableCell>
                          
                          {/* Category Details Column */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                src={cat.icon || undefined}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: isRoot ? 'rgba(37,99,235,0.08)' : 'rgba(16,185,129,0.08)',
                                  color: isRoot ? '#2563eb' : '#10b981',
                                  fontSize: '0.85rem'
                                }}
                              >
                                {cat.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                                  {cat.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                  {cat.slug}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Type Column */}
                          <TableCell>
                            <Chip
                              label={isRoot ? '#Root' : 'Sub Category'}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                bgcolor: isRoot ? 'rgba(37,99,235,0.08)' : 'rgba(16,185,129,0.08)',
                                color: isRoot ? '#2563eb' : '#10b981',
                                border: 'none'
                              }}
                            />
                          </TableCell>

                          {/* Level Column */}
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {cat.level !== undefined ? cat.level + 1 : 1}
                            </Typography>
                          </TableCell>

                          {/* Products Column */}
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {cat._count?.products ? cat._count.products.toLocaleString() : 0}
                            </Typography>
                          </TableCell>

                          {/* Status Column */}
                          <TableCell>
                            <Chip
                              label={cat.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                borderColor: cat.isActive ? '#10b981' : '#ef4444',
                                color: cat.isActive ? '#10b981' : '#ef4444',
                                bgcolor: cat.isActive ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          </TableCell>

                          {/* Sort Order Column */}
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                              {cat.sortOrder ?? 0}
                            </Typography>
                          </TableCell>

                          {/* Created On Column */}
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, fontSize: '0.85rem' }}>
                              {new Date(cat.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
                              {new Date(cat.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </TableCell>

                          {/* Actions Column */}
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <IconButton size="small" onClick={() => handleOpenEdit(cat)} sx={{ color: '#475569' }}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton size="small" sx={{ color: '#475569' }}>
                                <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteCategory(cat.id)} sx={{ color: '#ef4444' }}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination Controls */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mt: 3, gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {total > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, total)} of {total} categories
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Pagination
                count={Math.ceil(total / pageSize)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="medium"
              />
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value={10}>10 / page</MenuItem>
                  <MenuItem value={20}>20 / page</MenuItem>
                  <MenuItem value={50}>50 / page</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Side Slide-Out Drawer for Creating/Editing Categories */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: { width: { xs: '100%', sm: 460 }, p: 3, display: 'flex', flexDirection: 'column' }
          }
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {editingCategory?.id ? 'Edit Category' : 'Add New Category'}
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        <Divider />

        {/* Drawer Navigation Tabs */}
        <Tabs
          value={drawerTab}
          onChange={(e, v) => setDrawerTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mt: 1,
            '& .MuiTab-root': { fontWeight: 600, fontSize: '0.85rem' }
          }}
        >
          <Tab label="Basic Information" id="category-tab-0" />
          <Tab label="SEO & Meta" id="category-tab-1" />
        </Tabs>

        {/* Drawer Scrollable Content */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 0.5 }}>
          {editingCategory && (
            <>
              {/* TAB 1: Basic Information */}
              <TabPanel value={drawerTab} index={0}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  
                  {/* Category Name */}
                  <TextField
                    label="Category Name"
                    required
                    fullWidth
                    size="small"
                    value={editingCategory.name || ''}
                    onChange={handleNameChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Slug */}
                  <TextField
                    label="Slug"
                    required
                    fullWidth
                    size="small"
                    value={editingCategory.slug || ''}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev!, slug: e.target.value }))}
                    helperText="This will be used in URL (auto generated)"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Parent Category Selector */}
                  <FormControl size="small" fullWidth>
                    <InputLabel id="drawer-parent-label">Parent Category</InputLabel>
                    <Select
                      labelId="drawer-parent-label"
                      value={editingCategory.parentId || ''}
                      label="Parent Category"
                      onChange={(e) => setEditingCategory(prev => ({ ...prev!, parentId: e.target.value }))}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value=""><em>Select parent category</em></MenuItem>
                      {parentCategories
                        .filter(c => c.id !== editingCategory.id) // Prevent select self
                        .map(parent => (
                          <MenuItem key={parent.id} value={parent.id}>{parent.name}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  {/* Category Icon File Box */}
                  <Box>
                    <FormLabel sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, display: 'block' }}>Category Icon</FormLabel>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 3,
                        cursor: 'pointer',
                        borderColor: '#cbd5e1',
                        bgcolor: '#f8fafc',
                        '&:hover': { bgcolor: '#f1f5f9' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}
                      component="label"
                    >
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleIconUpload}
                      />
                      {iconPreview ? (
                        <Box sx={{ position: 'relative', width: 60, height: 60 }}>
                          <img src={iconPreview} alt="Icon Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                        </Box>
                      ) : (
                        <>
                          <CloudUpload color="primary" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Upload icon</Typography>
                          <Typography variant="caption" color="text.secondary">SVG, PNG, JPG (Max. 2MB)</Typography>
                        </>
                      )}
                    </Paper>
                  </Box>

                  {/* Category Image Box */}
                  <Box>
                    <FormLabel sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, display: 'block' }}>Category Image (Optional)</FormLabel>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 3,
                        cursor: 'pointer',
                        borderColor: '#cbd5e1',
                        bgcolor: '#f8fafc',
                        '&:hover': { bgcolor: '#f1f5f9' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}
                      component="label"
                    >
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      {imagePreview ? (
                        <Box sx={{ position: 'relative', width: '100%', height: 100 }}>
                          <img src={imagePreview} alt="Image Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        </Box>
                      ) : (
                        <>
                          <CloudUpload color="primary" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Upload Image</Typography>
                          <Typography variant="caption" color="text.secondary">JPG, PNG (Max. 2MB)</Typography>
                        </>
                      )}
                    </Paper>
                  </Box>

                  {/* Status radios */}
                  <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>Status *</FormLabel>
                    <RadioGroup
                      row
                      value={editingCategory.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setEditingCategory(prev => ({ ...prev!, isActive: e.target.value === 'active' }))}
                    >
                      <FormControlLabel value="active" control={<Radio size="small" />} label="Active" />
                      <FormControlLabel value="inactive" control={<Radio size="small" />} label="Inactive" />
                    </RadioGroup>
                  </FormControl>

                  {/* Sort Order */}
                  <TextField
                    label="Sort Order"
                    type="number"
                    required
                    fullWidth
                    size="small"
                    value={editingCategory.sortOrder}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev!, sortOrder: parseInt(e.target.value) || 0 }))}
                    helperText="Lower numbers appear first"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Description */}
                  <TextField
                    label="Description (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev!, description: e.target.value.substring(0, 200) }))}
                    helperText={`${editingCategory.description?.length || 0}/200`}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                </Box>
              </TabPanel>

              {/* TAB 2: SEO & Meta */}
              <TabPanel value={drawerTab} index={1}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label="SEO Title"
                    fullWidth
                    size="small"
                    value={editingCategory.seoTitle || ''}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev!, seoTitle: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    label="SEO Description"
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    value={editingCategory.seoDescription || ''}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev!, seoDescription: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
              </TabPanel>
            </>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Drawer Footer controls */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setDrawerOpen(false)}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitting}
            onClick={handleSaveCategory}
            startIcon={submitting ? <CircularProgress size={16} /> : <Save />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Save Category
          </Button>
        </Box>
      </Drawer>

      {/* Snackbar Alert Notifications */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

