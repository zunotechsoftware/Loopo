'use client';

import React from 'react';
import { Box, Typography, Button, TextField, InputAdornment, IconButton, Badge, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

interface PageHeaderProps {
  onCreateClick: () => void;
}

export default function PageHeader({ onCreateClick }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
          Coupons
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', typography: 'body2' }}>
          <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>Dashboard</Typography>
          <Typography variant="body2">›</Typography>
          <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>Coupons</Typography>
          <Typography variant="body2">›</Typography>
          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>All Coupons</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          placeholder="Search by coupon code or name..."
          size="small"
          sx={{
            width: 320,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#ffffff',
              borderRadius: 2,
              pr: 1
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>⌘K</Typography>
                </Box>
              </InputAdornment>
            )
          }}
        />
        
        <IconButton sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <SettingsOutlinedIcon sx={{ color: '#64748b' }} />
        </IconButton>
        
        <IconButton sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Badge badgeContent={2} color="error" variant="dot">
            <NotificationsNoneOutlinedIcon sx={{ color: '#64748b' }} />
          </Badge>
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1, borderLeft: '1px solid #e2e8f0', pl: 3 }}>
          <Avatar 
            src="https://i.pravatar.cc/150?img=11" 
            sx={{ width: 40, height: 40, border: '2px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>
              Admin User
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Super Admin
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateClick}
          sx={{
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            py: 1,
            ml: 2,
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
          }}
        >
          Create Coupon
        </Button>
      </Box>
    </Box>
  );
}
