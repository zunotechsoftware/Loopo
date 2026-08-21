'use client';

import React from 'react';
import { Box, TextField, InputAdornment, MenuItem, Select, Button, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

interface AdvertisementFiltersProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
  typeFilter?: string;
  onTypeChange?: (type: string) => void;
  placementFilter?: string;
  onPlacementChange?: (placement: string) => void;
  campaignFilter?: string;
  onCampaignChange?: (campaign: string) => void;
  onReset?: () => void;
}

export default function AdvertisementFilters({ 
  searchQuery, onSearchChange,
  statusFilter, onStatusChange,
  typeFilter, onTypeChange,
  placementFilter, onPlacementChange,
  campaignFilter, onCampaignChange,
  onReset
}: AdvertisementFiltersProps) {
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
        placeholder="Search by ad name or ID..."
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
        <MenuItem value="completed">Completed</MenuItem>
      </Select>

      <Select 
        size="small" 
        value={typeFilter || 'all'} 
        onChange={(e) => onTypeChange && onTypeChange(e.target.value)}
        sx={{ minWidth: 130, borderRadius: 2, color: 'text.secondary', fontSize: '0.875rem' }}
      >
        <MenuItem value="all">All Types</MenuItem>
        <MenuItem value="banner">Banner</MenuItem>
        <MenuItem value="image_ad">Image Ad</MenuItem>
        <MenuItem value="text_ad">Text Ad</MenuItem>
        <MenuItem value="video_ad">Video Ad</MenuItem>
      </Select>

      <Select 
        size="small" 
        value={placementFilter || 'all'} 
        onChange={(e) => onPlacementChange && onPlacementChange(e.target.value)}
        sx={{ minWidth: 150, borderRadius: 2, color: 'text.secondary', fontSize: '0.875rem' }}
      >
        <MenuItem value="all">All Placements</MenuItem>
        <MenuItem value="home_top">Home Top</MenuItem>
        <MenuItem value="sidebar">Sidebar</MenuItem>
        <MenuItem value="footer">Footer</MenuItem>
      </Select>

      <Select 
        size="small" 
        value={campaignFilter || 'all'} 
        onChange={(e) => onCampaignChange && onCampaignChange(e.target.value)}
        sx={{ minWidth: 150, borderRadius: 2, color: 'text.secondary', fontSize: '0.875rem' }}
      >
        <MenuItem value="all">All Campaigns</MenuItem>
        <MenuItem value="summer_sale">Summer Sale</MenuItem>
        <MenuItem value="winter_promo">Winter Promo</MenuItem>
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
        Filters
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
