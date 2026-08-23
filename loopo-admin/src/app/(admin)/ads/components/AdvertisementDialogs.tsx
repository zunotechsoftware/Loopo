'use client';

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Grid, Box, Typography, Switch, FormControlLabel,
  InputAdornment
} from '@mui/material';

export interface AdvertisementData {
  id?: string;
  title: string;
  type: string;
  placement: string;
  campaign?: string;
  status: string;
  imageUrl?: string;
  targetUrl?: string;
  startDate?: string;
  endDate?: string;
}

interface AdvertisementDialogsProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  data: AdvertisementData;
  onClose: () => void;
  onSubmit: (data: AdvertisementData) => void;
  onChange: (data: AdvertisementData) => void;
}

const defaultAd: AdvertisementData = {
  title: '',
  type: 'BANNER',
  placement: '',
  status: 'ACTIVE',
};

export default function AdvertisementDialogs({
  open, mode, data, onClose, onSubmit, onChange
}: AdvertisementDialogsProps) {
  
  const isView = mode === 'view';
  const titleMap = {
    create: 'Create Advertisement',
    edit: 'Edit Advertisement',
    view: 'View Advertisement'
  };

  const handleChange = (field: keyof AdvertisementData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  // Convert ISO dates to YYYY-MM-DD for date inputs
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
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #e2e8f0', pb: 2 }}>
          {titleMap[mode]}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Left Column - Core Details */}
            <Grid item xs={12} md={7}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
                Basic Information
              </Typography>
              <TextField
                fullWidth
                label="Advertisement Title"
                required
                value={data.title}
                onChange={(e) => handleChange('title', e.target.value)}
                disabled={isView}
                sx={{ mb: 3 }}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Ad Type"
                    value={data.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    disabled={isView}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  >
                    <MenuItem value="BANNER">Banner</MenuItem>
                    <MenuItem value="IMAGE_AD">Image Ad</MenuItem>
                    <MenuItem value="TEXT_AD">Text Ad</MenuItem>
                    <MenuItem value="VIDEO_AD">Video Ad</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={data.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    disabled={isView}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="PAUSED">Paused</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="EXPIRED">Expired</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Placement"
                    required
                    placeholder="e.g. Home Page - Top"
                    value={data.placement}
                    onChange={(e) => handleChange('placement', e.target.value)}
                    disabled={isView}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Campaign Name"
                    placeholder="e.g. Summer Sale 2024"
                    value={data.campaign || ''}
                    onChange={(e) => handleChange('campaign', e.target.value)}
                    disabled={isView}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>

            </Grid>

            {/* Right Column - Media & Schedule */}
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
                Media & Links
              </Typography>
              
              <TextField
                fullWidth
                label="Image/Media URL"
                value={data.imageUrl || ''}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                disabled={isView}
                sx={{ mb: 3 }}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              {data.imageUrl && (
                <Box 
                  component="img" 
                  src={data.imageUrl} 
                  sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2, mb: 3, border: '1px solid #e2e8f0' }}
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                />
              )}

              <TextField
                fullWidth
                label="Target Destination URL"
                placeholder="https://"
                value={data.targetUrl || ''}
                onChange={(e) => handleChange('targetUrl', e.target.value)}
                disabled={isView}
                sx={{ mb: 4 }}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
                Schedule
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                    value={formatDateForInput(data.startDate)}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    disabled={isView}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    InputLabelProps={{ shrink: true }}
                    value={formatDateForInput(data.endDate)}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    disabled={isView}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
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
              color="primary"
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3 }}
            >
              {mode === 'create' ? 'Create Advertisement' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}
