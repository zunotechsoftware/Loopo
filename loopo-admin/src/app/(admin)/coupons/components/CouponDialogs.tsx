'use client';

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Grid, Box, Typography, InputAdornment, Switch, FormControlLabel
} from '@mui/material';

export interface CouponData {
  id?: string;
  code: string;
  name: string;
  type: string;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  expiresAt?: string;
  isActive: boolean;
}

interface CouponDialogsProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  data: CouponData;
  onClose: () => void;
  onSubmit: (data: CouponData) => void;
  onChange: (data: CouponData) => void;
}

export default function CouponDialogs({
  open, mode, data, onClose, onSubmit, onChange
}: CouponDialogsProps) {
  
  const isView = mode === 'view';
  const titleMap = {
    create: 'Create Coupon',
    edit: 'Edit Coupon',
    view: 'View Coupon'
  };

  const handleChange = (field: keyof CouponData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  const formatDateForInput = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e2e8f0', pb: 2 }}>
          {titleMap[mode]}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Left Column - Core Details */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                Basic Information
              </Typography>
              
              <TextField
                fullWidth
                label="Coupon Code"
                required
                value={data.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                disabled={isView || mode === 'edit'} // Code usually cannot be edited
                sx={{ mb: 3 }}
                InputProps={{ sx: { borderRadius: 2 } }}
                helperText="Must be unique. E.g. SUMMER20"
              />

              <TextField
                fullWidth
                label="Coupon Name"
                required
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isView}
                sx={{ mb: 3 }}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Discount Type"
                    value={data.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    disabled={isView}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  >
                    <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                    <MenuItem value="FIXED">Fixed Amount (₹)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Discount Value"
                    required
                    value={data.value || ''}
                    onChange={(e) => handleChange('value', parseFloat(e.target.value))}
                    disabled={isView}
                    InputProps={{ 
                      sx: { borderRadius: 2 },
                      startAdornment: data.type === 'FIXED' ? <InputAdornment position="start">₹</InputAdornment> : null,
                      endAdornment: data.type === 'PERCENTAGE' ? <InputAdornment position="end">%</InputAdornment> : null,
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Purchase"
                    value={data.minPurchase || ''}
                    onChange={(e) => handleChange('minPurchase', parseFloat(e.target.value))}
                    disabled={isView}
                    InputProps={{ 
                      sx: { borderRadius: 2 },
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Discount"
                    value={data.maxDiscount || ''}
                    onChange={(e) => handleChange('maxDiscount', parseFloat(e.target.value))}
                    disabled={isView || data.type === 'FIXED'}
                    InputProps={{ 
                      sx: { borderRadius: 2 },
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    helperText={data.type === 'FIXED' ? "N/A for Fixed" : ""}
                  />
                </Grid>
              </Grid>

            </Grid>

            {/* Right Column - Limits & Settings */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                Usage Limits & Schedule
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Usage Limit"
                    value={data.usageLimit || ''}
                    onChange={(e) => handleChange('usageLimit', parseInt(e.target.value))}
                    disabled={isView}
                    InputProps={{ sx: { borderRadius: 2 } }}
                    helperText="Leave empty for unlimited"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Per User Limit"
                    value={data.perUserLimit || ''}
                    onChange={(e) => handleChange('perUserLimit', parseInt(e.target.value))}
                    disabled={isView}
                    InputProps={{ sx: { borderRadius: 2 } }}
                    helperText="Default is 1"
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                type="date"
                label="Expiration Date"
                InputLabelProps={{ shrink: true }}
                value={formatDateForInput(data.expiresAt)}
                onChange={(e) => handleChange('expiresAt', e.target.value)}
                disabled={isView}
                sx={{ mb: 4 }}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                 <FormControlLabel
                  control={
                    <Switch
                      checked={data.isActive}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                      disabled={isView}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Coupon is Active
                    </Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  If disabled, users will not be able to apply this coupon even if it hasn't expired.
                </Typography>
              </Box>

            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          {!isView && (
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3 }}
            >
              {mode === 'create' ? 'Create Coupon' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}
