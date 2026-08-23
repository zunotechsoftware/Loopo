'use client';

import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface PageHeaderProps {
  onCreateClick: () => void;
}

export default function PageHeader({ onCreateClick }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
          Banners
        </Typography>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}
        >
          <Link underline="hover" color="inherit" href="/dashboard" sx={{ fontSize: '0.875rem' }}>
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="/banners" sx={{ fontSize: '0.875rem' }}>
            Banners
          </Link>
          <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#2563eb' }}>
            All Banners
          </Typography>
        </Breadcrumbs>
      </Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateClick}
        sx={{
          bgcolor: '#2563eb',
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          px: 2.5,
          py: 1,
          boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.2), 0 2px 4px -2px rgb(37 99 235 / 0.2)',
          '&:hover': {
            bgcolor: '#1d4ed8',
          }
        }}
      >
        Create Banner
      </Button>
    </Box>
  );
}
