'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Snackbar, Alert } from '@mui/material';
import api from '@/services/api';
import PageHeader from './components/PageHeader';
import KPICards from './components/KPICards';
import CouponsTable from './components/CouponsTable';
import RightSidebar from './components/RightSidebar';
import CouponDialogs, { CouponData } from './components/CouponDialogs';

const defaultCoupon: CouponData = {
  code: '',
  name: '',
  type: 'PERCENTAGE',
  value: 0,
  isActive: true,
  perUserLimit: 1,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentCoupon, setCurrentCoupon] = useState<CouponData>(defaultCoupon);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleShowSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchCoupons = async () => {
    try {
      const response = await api.get('/admin/coupons');
      setCoupons(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      handleShowSnackbar('Failed to fetch coupons', 'error');
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', coupon?: any) => {
    setDialogMode(mode);
    if (coupon) {
      setCurrentCoupon({ ...coupon });
    } else {
      setCurrentCoupon({ ...defaultCoupon });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmitDialog = async (data: CouponData) => {
    try {
      const payload: any = {
        code: data.code,
        name: data.name,
        type: data.type,
        value: data.value,
        isActive: data.isActive,
      };

      if (data.minPurchase) payload.minPurchase = data.minPurchase;
      if (data.maxDiscount) payload.maxDiscount = data.maxDiscount;
      if (data.usageLimit) payload.usageLimit = data.usageLimit;
      if (data.perUserLimit) payload.perUserLimit = data.perUserLimit;
      if (data.expiresAt) payload.expiresAt = new Date(data.expiresAt).toISOString();

      if (dialogMode === 'create') {
        await api.post('/admin/coupons', payload);
        handleShowSnackbar('Coupon created successfully', 'success');
      } else if (dialogMode === 'edit' && data.id) {
        await api.put(`/admin/coupons/${data.id}`, payload);
        handleShowSnackbar('Coupon updated successfully', 'success');
      }
      handleCloseDialog();
      fetchCoupons();
    } catch (error: any) {
      console.error('Failed to save coupon:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Server error';
      handleShowSnackbar(`Failed to save coupon: ${Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}`, 'error');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: 'auto', bgcolor: '#f1f5f9', minHeight: '100vh' }}>
      <PageHeader onCreateClick={() => handleOpenDialog('create')} />
      <KPICards coupons={coupons} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={9}>
          <CouponsTable 
            coupons={coupons} 
            onEdit={(coupon) => handleOpenDialog('edit', coupon)} 
            onView={(coupon) => handleOpenDialog('view', coupon)} 
          />
        </Grid>
        <Grid item xs={12} lg={3}>
          <RightSidebar />
        </Grid>
      </Grid>

      <CouponDialogs
        open={dialogOpen}
        mode={dialogMode}
        data={currentCoupon}
        onClose={handleCloseDialog}
        onChange={setCurrentCoupon}
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
