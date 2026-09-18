'use client';

import React, { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Avatar,
  Menu, MenuItem, Box, Divider, ListItemIcon, Badge,
  List, ListItemButton, ListItemText, Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Logout from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import Search from '@mui/icons-material/Search';
import Fullscreen from '@mui/icons-material/Fullscreen';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { useAuth } from '@/hooks/useAuth';
import { useMyNotifications } from '@/hooks/useMyNotifications';
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
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { items: notifications, unreadCount, markRead, markAllRead } = useMyNotifications();

  const handleNotificationClick = (notif: { id: string; isRead: boolean; link?: string | null }) => {
    if (!notif.isRead) markRead(notif.id);
    setNotifAnchorEl(null);
    if (notif.link) router.push(notif.link);
  };

  const timeAgo = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

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

          <IconButton
            color="inherit"
            size="small"
            sx={{ color: '#64748b' }}
            onClick={(e) => setNotifAnchorEl(e.currentTarget)}
          >
            <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { minWidth: 16, height: 16, fontSize: '0.65rem' } }}>
              <NotificationsOutlined fontSize="small" />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={() => setNotifAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1, width: 360, maxHeight: 440, borderRadius: 2,
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notifications</Typography>
              {unreadCount > 0 && (
                <Button size="small" sx={{ textTransform: 'none', fontSize: '0.75rem' }} onClick={() => markAllRead()}>
                  Mark all read
                </Button>
              )}
            </Box>
            <Divider />
            {notifications.length === 0 ? (
              <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">You&apos;re all caught up</Typography>
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {notifications.map((notif) => (
                  <ListItemButton
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      alignItems: 'flex-start',
                      bgcolor: notif.isRead ? 'transparent' : '#eff6ff',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: notif.isRead ? 500 : 700 }}>
                          {notif.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                            {notif.message}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            {timeAgo(notif.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
            <Divider />
            <MenuItem onClick={() => { setNotifAnchorEl(null); router.push('/notifications'); }} sx={{ justifyContent: 'center', py: 1.25 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563eb' }}>View all notifications</Typography>
            </MenuItem>
          </Menu>

          <IconButton color="inherit" size="small" sx={{ color: '#64748b' }}>
            <Fullscreen fontSize="small" />
          </IconButton>

          {/* User Avatar & Menu */}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#1d4ed8', fontSize: '0.85rem', fontWeight: 600 }}>
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            onClick={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1, minWidth: 200, borderRadius: 2,
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Admin User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'admin@loopo.com'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => router.push('/settings')}>
              <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={logout} sx={{ color: 'error.main' }}>
              <ListItemIcon><Logout fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
