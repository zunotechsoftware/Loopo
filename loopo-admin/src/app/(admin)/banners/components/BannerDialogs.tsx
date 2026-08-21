'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Grid,
  Box,
} from '@mui/material';

export interface BannerData {
  id?: string;
  title: string;
  type: string;
  imageUrl: string;
  targetUrl?: string;
  sortOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  audience?: string;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  banner?: BannerData | null;
  mode: 'create' | 'edit' | 'view';
}

const defaultBanner: BannerData = {
  title: '',
  type: 'HOMEPAGE',
  imageUrl: '',
  targetUrl: '',
  sortOrder: 0,
  isActive: true,
  audience: 'ALL',
};

export default function BannerDialog({ open, onClose, onSubmit, banner, mode }: DialogProps) {
  const [formData, setFormData] = useState<BannerData>(defaultBanner);

  useEffect(() => {
    if (banner && (mode === 'edit' || mode === 'view')) {
      setFormData(banner);
    } else {
      setFormData(defaultBanner);
    }
  }, [banner, mode, open]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string) => (e: any) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Create New Banner' : mode === 'edit' ? 'Edit Banner' : 'View Banner'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Banner Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Type"
                  onChange={handleSelectChange('type')}
                  inputProps={{ readOnly: isReadOnly }}
                >
                  <MenuItem value="HOMEPAGE">Homepage</MenuItem>
                  <MenuItem value="CATEGORY">Category</MenuItem>
                  <MenuItem value="POPUP">Popup</MenuItem>
                  <MenuItem value="PROMOTIONAL">Promotional</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Audience</InputLabel>
                <Select
                  name="audience"
                  value={formData.audience || 'ALL'}
                  label="Audience"
                  onChange={handleSelectChange('audience')}
                  inputProps={{ readOnly: isReadOnly }}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="LOGGED_IN">Logged In Users</MenuItem>
                  <MenuItem value="GUEST">Guests</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                InputProps={{ readOnly: isReadOnly }}
              />
              {formData.imageUrl && (
                <Box mt={2}>
                  <img src={formData.imageUrl} alt="Banner Preview" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Target URL (Link)"
                name="targetUrl"
                value={formData.targetUrl || ''}
                onChange={handleChange}
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sort Order"
                name="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={handleChange}
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                    disabled={isReadOnly}
                  />
                }
                label="Active Status"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button type="submit" variant="contained" color="primary">
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}
