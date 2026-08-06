'use client';

import React, { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Avatar,
  Menu, MenuItem, Box, Divider, ListItemIcon, Badge
} from '@mui/material';
import {
  Menu as MenuIcon, Logout, AccountCircle, NotificationsOutlined,
  Search, Fullscreen, CalendarToday
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
  drawerWidth: number;
  handleDrawerToggle: () => void;
}

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  products: 'Products',
  categories: 'Categories',
  reports: 'Reports',
  payments: 'Payments',
  analytics: 'Analytics',
  reviews: 'Reviews',
  notifications: 'Notifications',
  roles: 'Roles & Permissions',
  settings: 'Settings',
};

export default function Header({ drawerWidth, handleDrawerToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname.split('/').filter(Boolean);
  const currentPage = PAGE_LABELS[segments[segments.length - 1]] || 'Admin Portal';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <Toolbar sx={{ minHeight: '72px !important', px: 3, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {currentPage}
          </Typography>
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Date Picker Placeholder */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, 
            border: '1px solid #e2e8f0', borderRadius: 2, px: 2, py: 1,
            cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' }
          }}>
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
              May 12, 2024 - May 18, 2024
            </Typography>
            <CalendarToday sx={{ fontSize: 18, color: '#64748b' }} />
          </Box>

          <IconButton color="inherit" size="small" sx={{ ml: 1, color: '#64748b' }}>
            <Search fontSize="small" />
          </IconButton>

          <IconButton color="inherit" size="small" sx={{ color: '#64748b' }}>
            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { minWidth: 16, height: 16, fontSize: '0.65rem' } }}>
              <NotificationsOutlined fontSize="small" />
            </Badge>
          </IconButton>

          <IconButton color="inherit" size="small" sx={{ color: '#64748b' }}>
            <Fullscreen fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
