'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  Image as ImageIcon,
  CheckCircle,
  Star,
  Apple,
  Launch
} from '@mui/icons-material';

export default function AddBrandPage() {
  const [brandName, setBrandName] = useState('Apple');
  const [slug, setSlug] = useState('apple');
  const [category, setCategory] = useState('Electronics');
  const [status, setStatus] = useState('active');
  const [featured, setFeatured] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Add Brand</Typography>
          <Typography variant="body2" color="text.secondary">Dashboard &gt; Brands &gt; Add Brand</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 4, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 4 }}>
            
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Basic Information</Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Brand Name <span style={{color: '#ef4444'}}>*</span></Typography>
                  <TextField 
                    fullWidth size="small" 
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter brand name" 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>Maximum 50 characters</Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Slug <span style={{color: '#ef4444'}}>*</span></Typography>
                  <TextField 
                    fullWidth size="small" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Enter slug (auto generated)" 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>This will be used in URL</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{slug.length}/50</Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Category <span style={{color: '#ef4444'}}>*</span></Typography>
                  <FormControl fullWidth size="small">
                    <Select value={category} onChange={(e) => setCategory(e.target.value)} displayEmpty sx={{ borderRadius: 2 }}>
                      <MenuItem value="Electronics">Electronics</MenuItem>
                      <MenuItem value="Fashion">Fashion</MenuItem>
                      <MenuItem value="Home">Home</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>Select the category this brand belongs to</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Country</Typography>
                  <FormControl fullWidth size="small">
                    <Select value="" displayEmpty sx={{ borderRadius: 2 }}>
                      <MenuItem value="">Select country</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>Select the brand country</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Brand Logo</Typography>
                  <Box sx={{ border: '2px dashed #cbd5e1', borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: '#2563eb', bgcolor: '#eff6ff' } }}>
                    <CloudUpload sx={{ color: '#3b82f6', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>Upload Logo</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>PNG, JPG, SVG (Max. 2MB)</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>This logo will be shown in brand list and app</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Banner Image (Optional)</Typography>
                  <Box sx={{ border: '2px dashed #cbd5e1', borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: '#2563eb', bgcolor: '#eff6ff' } }}>
                    <CloudUpload sx={{ color: '#3b82f6', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>Upload Banner</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>PNG, JPG (Max. 2MB)</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>This banner will be shown in brand details page</Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Brand Details */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Brand Details</Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Short Description (Optional)</Typography>
                  <TextField 
                    fullWidth size="small" multiline rows={3}
                    placeholder="Enter short description" 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Maximum 150 characters</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>0/150</Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Full Description (Optional)</Typography>
                  <TextField 
                    fullWidth size="small" multiline rows={3}
                    placeholder="Enter full description" 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Maximum 500 characters</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>0/500</Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Website (Optional)</Typography>
                  <TextField 
                    fullWidth size="small" 
                    placeholder="https://www.example.com" 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>Enter brand official website</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Established Year (Optional)</Typography>
                  <TextField 
                    fullWidth size="small" 
                    placeholder="e.g. 1990" 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* SEO & Meta */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>SEO & Meta <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>(Optional)</span></Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Meta Title</Typography>
                  <TextField 
                    fullWidth size="small" 
                    placeholder="Enter meta title" 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>For SEO purpose, max 60 characters</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>0/60</Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Meta Description</Typography>
                  <TextField 
                    fullWidth size="small" 
                    placeholder="Enter meta description" 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>For SEO purpose, max 160 characters</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>0/160</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Status & Settings */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Status & Settings</Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Status <span style={{color: '#ef4444'}}>*</span></Typography>
                  <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value)}>
                    <FormControlLabel value="active" control={<Radio size="small" />} label={<Typography variant="body2">Active</Typography>} />
                    <FormControlLabel value="inactive" control={<Radio size="small" />} label={<Typography variant="body2">Inactive</Typography>} />
                  </RadioGroup>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Featured Brand</Typography>
                  <FormControlLabel 
                    control={<Checkbox size="small" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />} 
                    label={<Typography variant="body2">Mark as featured brand</Typography>} 
                  />
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: -0.5, ml: 3.5, display: 'block' }}>Featured brands will be highlighted in the app</Typography>
                </Grid>
              </Grid>
            </Box>

          </Card>
        </Grid>

        {/* Right Column - Sidebar Widgets */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Brand Preview */}
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>Brand Preview</Typography>
              
              <Box sx={{ 
                bgcolor: '#f8fafc', 
                borderRadius: 2, 
                border: '1px solid #e2e8f0',
                p: 3, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                mb: 3
              }}>
                <Box sx={{ width: 64, height: 64, bgcolor: '#fff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' }}>
                  <Apple sx={{ fontSize: 40, color: '#1e293b' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{brandName || 'Brand Name'}</Typography>
                <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600 }}>{slug || 'slug'}</Typography>
                {category && (
                  <Chip label={category} size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: '0.7rem', borderRadius: 1, mt: 1 }} />
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}><ImageIcon fontSize="small" /> Category</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{category || '-'}</Typography>
                </Box>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle fontSize="small" /> Status</Typography>
                  {status === 'active' ? (
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{width:6,height:6,bgcolor:'#10b981',borderRadius:'50%'}}/> Active</Typography>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{width:6,height:6,bgcolor:'#ef4444',borderRadius:'50%'}}/> Inactive</Typography>
                  )}
                </Box>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle fontSize="small" /> Featured</Typography>
                  {featured ? (
                    <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}><Star sx={{ fontSize: 16, color: '#f59e0b' }} /> Yes</Typography>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}><Star sx={{ fontSize: 16, color: '#cbd5e1' }} /> No</Typography>
                  )}
                </Box>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle fontSize="small" /> Created On</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Not created yet</Typography>
                </Box>
              </Box>
            </Card>

            {/* Guidelines */}
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>Guidelines</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ p: 0.5, bgcolor: '#eff6ff', borderRadius: 1 }}><ImageIcon sx={{ fontSize: 16, color: '#3b82f6' }} /></Box>
                  <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5 }}>Use high quality logo for better display.</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ p: 0.5, bgcolor: '#eff6ff', borderRadius: 1 }}><ImageIcon sx={{ fontSize: 16, color: '#3b82f6' }} /></Box>
                  <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5 }}>Logo size should be square (1:1 ratio).</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ p: 0.5, bgcolor: '#eff6ff', borderRadius: 1 }}><ImageIcon sx={{ fontSize: 16, color: '#3b82f6' }} /></Box>
                  <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5 }}>Banner size should be 1200x400 px.</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ p: 0.5, bgcolor: '#eff6ff', borderRadius: 1 }}><ImageIcon sx={{ fontSize: 16, color: '#3b82f6' }} /></Box>
                  <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5 }}>Choose the correct category.</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ p: 0.5, bgcolor: '#eff6ff', borderRadius: 1 }}><ImageIcon sx={{ fontSize: 16, color: '#3b82f6' }} /></Box>
                  <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5 }}>Featured brands will appear on the home page.</Typography>
                </Box>
              </Box>
            </Card>

            {/* Help */}
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>Help</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2, lineHeight: 1.5 }}>
                Brands help users to find listings easily. Add brand details carefully for better user experience.
              </Typography>
              <Button variant="outlined" startIcon={<Launch sx={{ fontSize: 16 }} />} sx={{ width: '100%', borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#2563eb' }}>
                View Brand List
              </Button>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Footer Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2, mb: 4 }}>
        <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#64748b', px: 4 }}>Cancel</Button>
        <Button variant="contained" sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb', px: 4 }}>Save Brand</Button>
      </Box>
    </Box>
  );
}
