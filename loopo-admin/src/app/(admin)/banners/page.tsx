'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Snackbar, Alert } from '@mui/material';
import api from '@/services/api';
import PageHeader from './components/PageHeader';
import KPICards from './components/KPICards';
import BannerFilters from './components/BannerFilters';
import BannerTable from './components/BannerTable';
import RightSidebar from './components/RightSidebar';
import BannerDialog, { BannerData } from './components/BannerDialogs';

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedBanner, setSelectedBanner] = useState<BannerData | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');

  const fetchBanners = async () => {
    try {
      const response = await api.get('/admin/banners');
      setBanners(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      // Fallback or show error
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', banner?: any) => {
    setDialogMode(mode);
    setSelectedBanner(banner || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedBanner(null);
  };

  const handleShowSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmitDialog = async (data: BannerData) => {
    try {
      // Explicitly construct payload to avoid forbidNonWhitelisted errors
      const payload: any = {
        title: data.title,
        type: data.type,
        imageUrl: data.imageUrl,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: Boolean(data.isActive),
        audience: data.audience || 'ALL',
      };

      if (data.targetUrl) payload.targetUrl = data.targetUrl;
      if (data.startDate) payload.startDate = new Date(data.startDate).toISOString();
      if (data.endDate) payload.endDate = new Date(data.endDate).toISOString();

      if (dialogMode === 'create') {
        await api.post('/admin/banners', payload);
        handleShowSnackbar('Banner created successfully', 'success');
      } else if (dialogMode === 'edit' && data.id) {
        await api.put(`/admin/banners/${data.id}`, payload);
        handleShowSnackbar('Banner updated successfully', 'success');
      }
      handleCloseDialog();
      fetchBanners();
    } catch (error: any) {
      console.error('Failed to save banner:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Server error';
      console.error('Backend returned:', error.response?.data);
      handleShowSnackbar(`Failed to save banner: ${Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}`, 'error');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPlacementFilter('all');
    setDeviceFilter('all');
  };

  const getStatus = (banner: any) => {
    const now = new Date();
    if (banner.endDate && new Date(banner.endDate) <= now) return 'expired';
    if (!banner.isActive) return 'paused';
    return 'active';
  };

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = !searchQuery || (banner.title && banner.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || getStatus(banner) === statusFilter;
    const matchesType = typeFilter === 'all' || (banner.type && banner.type.toLowerCase() === typeFilter);
    const matchesPlacement = placementFilter === 'all' || (banner.placement && banner.placement === placementFilter);
    const matchesDevice = deviceFilter === 'all' || (banner.audience && banner.audience.toLowerCase() === deviceFilter);
    
    return matchesSearch && matchesStatus && matchesType && matchesPlacement && matchesDevice;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: 'auto' }}>
      <PageHeader onCreateClick={() => handleOpenDialog('create')} />
      <KPICards banners={filteredBanners} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={9}>
          <BannerFilters 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            placementFilter={placementFilter}
            onPlacementChange={setPlacementFilter}
            deviceFilter={deviceFilter}
            onDeviceChange={setDeviceFilter}
            onReset={handleResetFilters}
          />
          <BannerTable 
            banners={filteredBanners} 
            onEdit={(banner) => handleOpenDialog('edit', banner)}
            onView={(banner) => handleOpenDialog('view', banner)}
          />
        </Grid>
        
        <Grid item xs={12} lg={3}>
          <RightSidebar />
        </Grid>
      </Grid>

      <BannerDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitDialog}
        banner={selectedBanner}
        mode={dialogMode}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
