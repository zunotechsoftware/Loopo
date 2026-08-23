'use client';

import React from 'react';
import { Box, TextField, InputAdornment, MenuItem, Select, Button, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

interface BannerFiltersProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
  typeFilter?: string;
  onTypeChange?: (type: string) => void;
  placementFilter?: string;
  onPlacementChange?: (placement: string) => void;
  deviceFilter?: string;
  onDeviceChange?: (device: string) => void;
  onReset?: () => void;
}

export default function BannerFilters({ 
  searchQuery, onSearchChange,
  statusFilter, onStatusChange,
  typeFilter, onTypeChange,
  placementFilter, onPlacementChange,
  deviceFilter, onDeviceChange,
  onReset
}: BannerFiltersProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        flexWrap: 'wrap', 
        mb: 3,
        p: 2,
        bgcolor: '#ffffff',
        borderRadius: 2,
        border: '1px solid #e2e8f0'
      }}
    >
      <TextField
        placeholder="Search by banner name..."
        size="small"
        value={searchQuery || ''}
        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />

      <Select 
        size="small" 
        value={statusFilter || 'all'} 
        onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
        sx={{ minWidth: 130, borderRadius: 2, color: 'text.secondary', fontSize: '0.875rem' }}
      >
        <MenuItem value="all">All Status</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="paused">Paused</MenuItem>
        <MenuItem value="expired">Expired</MenuItem>
      </Select>

      <Select 
        size="small" 
        value={typeFilter || 'all'} 
        onChange={(e) => onTypeChange && onTypeChange(e.target.value)}
        sx={{ minWidth: 130, borderRadius: 2, color: 'text.secondary', fontSize: '0.875rem' }}
      >
        <MenuItem value="all">All Types</MenuItem>
        <MenuItem value="homepage">Homepage</MenuItem>
        <MenuItem value="category">Category</MenuItem>
        <MenuItem value="popup">Popup</MenuItem>
        <MenuItem value="promotional">Promotional</MenuItem>
      </Select>

      <Select 
        size="small" 
        value={placementFilter || 'all'} 
        onChange={(e) => onPlacementChange && onPlacementChange(e.target.value)}
        sx={{ minWidth: 150, borderRadius: 2, color: 'text.secondary', fontSize: '0.875rem' }}
      >
        <MenuItem value="all">All Placements</MenuItem>
        <MenuItem value="home-top">Home Page - Top</MenuItem>
        <MenuItem value="home-middle">Home Page - Middle</MenuItem>
      </Select>

      <Select 
        size="small" 
        value={deviceFilter || 'all'} 
        onChange={(e) => onDeviceChange && onDeviceChange(e.target.value)}
        sx={{ minWidth: 130, borderRadius: 2, color: 'text.secondary', fontSize: '0.875rem' }}
      >
        <MenuItem value="all">All Audience</MenuItem>
        <MenuItem value="all">Everyone</MenuItem>
        <MenuItem value="logged_in">Logged In</MenuItem>
        <MenuItem value="guest">Guest</MenuItem>
      </Select>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #e2e8f0', borderRadius: 2, px: 2, py: 1, height: '40px', boxSizing: 'border-box' }}>
        <Typography variant="body2" color="text.secondary">Start Date - End Date</Typography>
        <CalendarTodayOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        sx={{ 
          color: '#475569', 
          borderColor: '#e2e8f0', 
          textTransform: 'none', 
          borderRadius: 2,
          '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
        }}
      >
        Filter
      </Button>

      <Button
        variant="text"
        onClick={onReset}
        sx={{ 
          color: '#64748b', 
          textTransform: 'none', 
          '&:hover': { bgcolor: 'transparent', color: '#0f172a' }
        }}
      >
        Reset
      </Button>
    </Box>
  );
}
