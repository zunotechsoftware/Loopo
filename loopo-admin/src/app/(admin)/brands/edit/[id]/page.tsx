'use client';

import React, { useState, useEffect } from 'react';
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
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import {
  CloudUpload,
  Image as ImageIcon,
  CheckCircle,
  Star,
  LocalOffer,
  Launch,
  ArrowBack
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { brandsService, categoriesService } from '@/services/admin.service';
import { Category } from '@/types';

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);

  const [brandName, setBrandName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [country, setCountry] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [status, setStatus] = useState('active');
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Fetch brand data and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        const [brandRes, catRes] = await Promise.all([
          brandsService.getById(id),
          categoriesService.getAll({ all: true })
        ]);
        
        const brand = brandRes.data.data || brandRes.data;
        
        let cats = [];
        const catData = catRes.data;
        if (catData?.data && Array.isArray(catData.data)) cats = catData.data;
        else if (catData?.data?.data && Array.isArray(catData.data.data)) cats = catData.data.data;
        else if (Array.isArray(catData)) cats = catData;
        
        setCategories(cats);

        // Populate state
        setBrandName(brand.name || '');
        setSlug(brand.slug || '');
        setCategoryId(brand.categoryId || '');
        setCountry(brand.country || '');
        setShortDescription(brand.shortDescription || '');
        setDescription(brand.description || '');
        setWebsite(brand.website || '');
        setEstablishedYear(brand.establishedYear ? String(brand.establishedYear) : '');
        setSeoTitle(brand.seoTitle || '');
        setSeoDescription(brand.seoDescription || '');
        setLogoUrl(brand.logoUrl || '');
        setStatus(brand.isActive ? 'active' : 'inactive');
        setFeatured(brand.isFeatured || false);

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setSnackbar({ open: true, message: 'Failed to load brand details', severity: 'error' });
      } finally {
        setInitialLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!brandName.trim()) {
      setSnackbar({ open: true, message: 'Brand name is required', severity: 'error' });
      return;
    }
    if (!slug.trim()) {
      setSnackbar({ open: true, message: 'Slug is required', severity: 'error' });
      return;
    }
    if (!categoryId) {
      setSnackbar({ open: true, message: 'Category is required', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      await brandsService.update(id, {
        name: brandName.trim(),
        slug: slug.trim(),
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        categoryId: categoryId || undefined,
        country: country.trim() || undefined,
        website: website.trim() || undefined,
        establishedYear: establishedYear ? parseInt(establishedYear, 10) : undefined,
        logoUrl: logoUrl.trim() || undefined,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        isActive: status === 'active',
        isFeatured: featured,
      } as any);

      setSnackbar({ open: true, message: 'Brand updated successfully!', severity: 'success' });
      setTimeout(() => router.push('/brands'), 1500);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update brand';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.push('/brands')} sx={{ bgcolor: '#f1f5f9' }}>
          <ArrowBack sx={{ color: '#64748b' }} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Edit Brand</Typography>
          <Typography variant="body2" color="text.secondary">Dashboard &gt; Brands &gt; Edit</Typography>
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
                    placeholder="Enter slug"
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
                    <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} displayEmpty sx={{ borderRadius: 2 }}>
                      <MenuItem value="">Select category</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>Select the category this brand belongs to</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Country</Typography>
                  <TextField
                    fullWidth size="small"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>Country of origin for the brand</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Brand Logo URL</Typography>
                  <TextField
                    fullWidth size="small"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://logo.clearbit.com/example.com"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>This logo will be shown in brand list and app</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Banner Image URL (Optional)</Typography>
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
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Enter short description"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Maximum 150 characters</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{shortDescription.length}/150</Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Full Description (Optional)</Typography>
                  <TextField
                    fullWidth size="small" multiline rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter full description"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Maximum 500 characters</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{description.length}/500</Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Website (Optional)</Typography>
                  <TextField
                    fullWidth size="small"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.example.com"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>Enter brand official website</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Established Year (Optional)</Typography>
                  <TextField
                    fullWidth size="small"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value)}
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
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Enter meta title"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>For SEO purpose, max 60 characters</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{seoTitle.length}/60</Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Meta Description</Typography>
                  <TextField
                    fullWidth size="small"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Enter meta description"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>For SEO purpose, max 160 characters</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{seoDescription.length}/160</Typography>
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
                <Box sx={{ width: 64, height: 64, bgcolor: '#fff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, boxShadow: '0px 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo preview" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                  ) : (
                    <LocalOffer sx={{ fontSize: 32, color: '#cbd5e1' }} />
                  )}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{brandName || 'Brand Name'}</Typography>
                <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600 }}>{slug || 'slug'}</Typography>
                {categoryId && (
                  <Chip
                    label={categories.find(c => c.id === categoryId)?.name || 'Category'}
                    size="small"
                    sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: '0.7rem', borderRadius: 1, mt: 1 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}><ImageIcon fontSize="small" /> Category</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{categories.find(c => c.id === categoryId)?.name || '—'}</Typography>
                </Box>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle fontSize="small" /> Status</Typography>
                  {status === 'active' ? (
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}><Box component="span" sx={{width:6,height:6,bgcolor:'#10b981',borderRadius:'50%'}}/> Active</Typography>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}><Box component="span" sx={{width:6,height:6,bgcolor:'#ef4444',borderRadius:'50%'}}/> Inactive</Typography>
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
              </Box>
            </Card>

            {/* Help */}
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>Help</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2, lineHeight: 1.5 }}>
                Brands help users to find listings easily. Keep details updated for a better user experience.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Launch sx={{ fontSize: 16 }} />}
                onClick={() => router.push(`/brands/${id}`)}
                sx={{ width: '100%', borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#2563eb' }}
              >
                View Details
              </Button>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Footer Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2, mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => router.push('/brands')}
          sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#64748b', px: 4 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb', px: 4 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
