'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  Avatar,
  Tab,
  Tabs,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Public,
  DateRange,
  LocalOffer,
  Category as CategoryIcon,
  Description,
  Image as ImageIcon,
  CheckCircle,
  PauseCircleFilled,
  Star,
  Link as LinkIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { brandsService } from '@/services/admin.service';
import { Brand } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`brand-tabpanel-${index}`}
      aria-labelledby={`brand-tab-${index}`}
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

export default function ViewBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await brandsService.getById(id);
        setBrand(res.data.data);
      } catch (err) {
        console.error('Failed to fetch brand:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchBrand();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await brandsService.delete(id);
      router.push('/brands');
    } catch (err) {
      console.error('Failed to delete brand:', err);
      alert('Failed to delete brand');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!brand) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6" color="text.secondary">Brand not found</Typography>
        <Button variant="outlined" onClick={() => router.push('/brands')} sx={{ mt: 2 }}>Back to Brands</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.push('/brands')} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0' }}>
            <ArrowBack sx={{ color: '#64748b' }} />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Brand Details</Typography>
            <Typography variant="body2" color="text.secondary">Dashboard &gt; Brands &gt; {brand.name}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Delete />}
            onClick={handleDelete}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#ef4444', borderColor: '#fca5a5', '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' } }}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => router.push(`/brands/edit/${id}`)}
            sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}
          >
            Edit Brand
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Banner & Profile */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', border: 'none' }}>
            {/* Banner Area */}
            <Box sx={{ 
              height: 160, 
              bgcolor: '#f1f5f9', 
              backgroundImage: brand.bannerUrl ? `url(${brand.bannerUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {!brand.bannerUrl && <ImageIcon sx={{ fontSize: 64, color: '#cbd5e1', opacity: 0.5 }} />}
              
              {/* Status Chips Top Right */}
              <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                <Chip 
                  icon={brand.isActive ? <CheckCircle fontSize="small" /> : <PauseCircleFilled fontSize="small" />}
                  label={brand.isActive ? 'Active' : 'Inactive'} 
                  size="small" 
                  sx={{ 
                    bgcolor: brand.isActive ? '#10b981' : '#ef4444', 
                    color: '#fff', 
                    fontWeight: 600, 
                    backdropFilter: 'blur(4px)',
                    '& .MuiChip-icon': { color: '#fff' }
                  }} 
                />
                {brand.isFeatured && (
                  <Chip 
                    icon={<Star fontSize="small" />}
                    label="Featured" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#f59e0b', 
                      color: '#fff', 
                      fontWeight: 600,
                      backdropFilter: 'blur(4px)',
                      '& .MuiChip-icon': { color: '#fff' }
                    }} 
                  />
                )}
              </Box>
            </Box>

            {/* Profile Info */}
            <Box sx={{ px: 3, pb: 3, position: 'relative' }}>
              <Avatar 
                src={brand.logoUrl || ''} 
                alt={brand.name}
                sx={{ 
                  width: 90, 
                  height: 90, 
                  border: '4px solid #fff', 
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)', 
                  mt: -5.5, 
                  mb: 2,
                  bgcolor: '#fff',
                  '& img': { objectFit: 'contain', p: 1 }
                }}
              >
                {!brand.logoUrl && <LocalOffer sx={{ fontSize: 40, color: '#cbd5e1' }} />}
              </Avatar>

              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>{brand.name}</Typography>
              <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 600, mb: 2 }}>@{brand.slug}</Typography>

              {brand.shortDescription && (
                <Typography variant="body2" sx={{ color: '#475569', mb: 3, lineHeight: 1.6 }}>
                  {brand.shortDescription}
                </Typography>
              )}

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {brand.category && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 0.8, bgcolor: '#eff6ff', borderRadius: 1.5, display: 'flex' }}><CategoryIcon sx={{ fontSize: 18, color: '#3b82f6' }}/></Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Category</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{brand.category.name}</Typography>
                    </Box>
                  </Box>
                )}

                {brand.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 0.8, bgcolor: '#f0fdf4', borderRadius: 1.5, display: 'flex' }}><Public sx={{ fontSize: 18, color: '#10b981' }}/></Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Website</Typography>
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Visit Link <LinkIcon sx={{ fontSize: 14 }} />
                        </Typography>
                      </a>
                    </Box>
                  </Box>
                )}

                {brand.country && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 0.8, bgcolor: '#fef3c7', borderRadius: 1.5, display: 'flex' }}><Public sx={{ fontSize: 18, color: '#f59e0b' }}/></Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Origin Country</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{brand.country}</Typography>
                    </Box>
                  </Box>
                )}

                {brand.establishedYear && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 0.8, bgcolor: '#f3e8ff', borderRadius: 1.5, display: 'flex' }}><DateRange sx={{ fontSize: 18, color: '#a855f7' }}/></Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Established</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{brand.establishedYear}</Typography>
                    </Box>
                  </Box>
                )}
              </Box>

            </Box>
          </Card>
        </Grid>

        {/* Right Column: Detailed Tabs */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', border: 'none', height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={tabValue} onChange={(_, newVal) => setTabValue(newVal)} aria-label="brand details tabs">
                <Tab label="Overview" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' }} />
                <Tab label="Products" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' }} />
                <Tab label="SEO Meta" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' }} />
              </Tabs>
            </Box>

            <CustomTabPanel value={tabValue} index={0}>
              <Box sx={{ px: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description sx={{ color: '#cbd5e1' }} /> Full Description
                </Typography>
                <Card variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  {brand.description ? (
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                      {brand.description}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>No detailed description provided.</Typography>
                  )}
                </Card>

                <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
                      System Information
                    </Typography>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">ID</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{brand.id}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Created</Typography>
                        <Typography variant="body2">{new Date(brand.createdAt).toLocaleDateString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Updated</Typography>
                        <Typography variant="body2">{new Date(brand.updatedAt).toLocaleDateString()}</Typography>
                      </Box>
                    </Card>
                  </Box>
                </Box>
              </Box>
            </CustomTabPanel>

            <CustomTabPanel value={tabValue} index={1}>
              <Box sx={{ px: 3, textAlign: 'center', py: 8 }}>
                <Box sx={{ width: 64, height: 64, bgcolor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <LocalOffer sx={{ fontSize: 32, color: '#3b82f6' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                  {brand._count?.products || 0} Products
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                  This brand has {brand._count?.products || 0} products associated with it. Product listings will appear here in future updates.
                </Typography>
                <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>View Products in Catalog</Button>
              </Box>
            </CustomTabPanel>

            <CustomTabPanel value={tabValue} index={2}>
              <Box sx={{ px: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>Search Engine Optimization</Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>Meta Title</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>{brand.seoTitle || brand.name}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>Meta Description</Typography>
                    <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>{brand.seoDescription || brand.shortDescription || 'No SEO description provided.'}</Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 2, textTransform: 'uppercase' }}>Google Search Preview</Typography>
                    <Typography variant="body1" sx={{ color: '#1a0dab', fontSize: '18px', display: 'block', mb: 0.5, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                      {brand.seoTitle || brand.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#006621', fontSize: '14px', display: 'block', mb: 0.5 }}>
                      https://loopo.com/brands/{brand.slug}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#545454', fontSize: '14px', lineHeight: 1.5 }}>
                      {brand.seoDescription || brand.shortDescription || `Browse the best products from ${brand.name} on Loopo marketplace.`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CustomTabPanel>

          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
