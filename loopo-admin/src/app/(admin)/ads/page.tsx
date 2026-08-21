'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Snackbar, Alert } from '@mui/material';
import api from '@/services/api';
import PageHeader from './components/PageHeader';
import KPICards from './components/KPICards';
import AdvertisementsTable from './components/AdvertisementsTable';
import RightSidebar from './components/RightSidebar';
import AdvertisementFilters from './components/AdvertisementFilters';
import AdvertisementDialogs, { AdvertisementData } from './components/AdvertisementDialogs';

const defaultAd: AdvertisementData = {
  title: '',
  type: 'BANNER',
  placement: '',
  status: 'ACTIVE',
};

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentAd, setCurrentAd] = useState<AdvertisementData>(defaultAd);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');

  const handleShowSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchAds = async () => {
    try {
      const response = await api.get('/admin/advertisements');
      setAds(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch advertisements:', error);
      handleShowSnackbar('Failed to fetch advertisements', 'error');
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', ad?: any) => {
    setDialogMode(mode);
    if (ad) {
      setCurrentAd({ ...ad });
    } else {
      setCurrentAd({ ...defaultAd });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmitDialog = async (data: AdvertisementData) => {
    try {
      const payload: any = {
        title: data.title,
        type: data.type,
        placement: data.placement,
        status: data.status,
      };

      if (data.campaign) payload.campaign = data.campaign;
      if (data.imageUrl) payload.imageUrl = data.imageUrl;
      if (data.targetUrl) payload.targetUrl = data.targetUrl;
      if (data.startDate) payload.startDate = new Date(data.startDate).toISOString();
      if (data.endDate) payload.endDate = new Date(data.endDate).toISOString();

      if (dialogMode === 'create') {
        await api.post('/admin/advertisements', payload);
        handleShowSnackbar('Advertisement created successfully', 'success');
      } else if (dialogMode === 'edit' && data.id) {
        await api.put(`/admin/advertisements/${data.id}`, payload);
        handleShowSnackbar('Advertisement updated successfully', 'success');
      }
      handleCloseDialog();
      fetchAds();
    } catch (error: any) {
      console.error('Failed to save advertisement:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Server error';
      handleShowSnackbar(`Failed to save advertisement: ${Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}`, 'error');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPlacementFilter('all');
    setCampaignFilter('all');
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = !searchQuery || 
      (ad.title && ad.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ad.type && ad.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ad.placement && ad.placement.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = statusFilter === 'all' || (ad.status && ad.status.toLowerCase() === statusFilter);
    const matchesType = typeFilter === 'all' || (ad.type && ad.type.toLowerCase() === typeFilter);
    const matchesPlacement = placementFilter === 'all' || (ad.placement && ad.placement.toLowerCase() === placementFilter);
    const matchesCampaign = campaignFilter === 'all' || (ad.campaign && ad.campaign.toLowerCase() === campaignFilter);

    return matchesSearch && matchesStatus && matchesType && matchesPlacement && matchesCampaign;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: 'auto', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <PageHeader 
        onCreateClick={() => handleOpenDialog('create')} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <KPICards ads={filteredAds} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={9}>
          <AdvertisementFilters 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            placementFilter={placementFilter}
            onPlacementChange={setPlacementFilter}
            campaignFilter={campaignFilter}
            onCampaignChange={setCampaignFilter}
            onReset={handleResetFilters}
          />
          <AdvertisementsTable 
            ads={filteredAds} 
            onEdit={(ad) => handleOpenDialog('edit', ad)} 
            onView={(ad) => handleOpenDialog('view', ad)} 
          />
        </Grid>
        <Grid item xs={12} lg={3}>
          <RightSidebar />
        </Grid>
      </Grid>

      <AdvertisementDialogs
        open={dialogOpen}
        mode={dialogMode}
        data={currentAd}
        onClose={handleCloseDialog}
        onChange={setCurrentAd}
        onSubmit={handleSubmitDialog}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
