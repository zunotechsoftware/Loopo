'use client';

import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Collapse
} from '@mui/material';
import {
  Dashboard, People, Storefront, Inventory, Category, ShoppingCart, Payment,
  AccountBalanceWallet, Message, Star, Assessment, ViewCarousel, FeaturedVideo,
  LocalOffer, CardMembership, NotificationsActive, Description, Article,
  Settings, Security, FactCheck, ExpandMore, ExpandLess
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  children?: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { text: 'Dashboard', icon: <Dashboard fontSize="small" />, path: '/dashboard' },
    ],
  },
  {
    groupLabel: 'MAIN',
    items: [
      { text: 'Users', icon: <People fontSize="small" />, path: '/users' },
      { text: 'Sellers', icon: <Storefront fontSize="small" />, path: '/sellers' },
      { text: 'Listings', icon: <Inventory fontSize="small" />, path: '/listings' },
      { text: 'Categories', icon: <Category fontSize="small" />, path: '/categories' },
      { text: 'Orders', icon: <ShoppingCart fontSize="small" />, path: '/orders' },
      { text: 'Payments', icon: <Payment fontSize="small" />, path: '/payments' },
      { text: 'Wallet', icon: <AccountBalanceWallet fontSize="small" />, path: '/wallet' },
      { text: 'Messages', icon: <Message fontSize="small" />, path: '/messages' },
      { text: 'Reviews', icon: <Star fontSize="small" />, path: '/reviews' },
      { text: 'Reports', icon: <Assessment fontSize="small" />, path: '/reports' },
    ],
  },
  {
    groupLabel: 'MARKETING',
    items: [
      { text: 'Banners', icon: <ViewCarousel fontSize="small" />, path: '/banners' },
      { text: 'Advertisements', icon: <FeaturedVideo fontSize="small" />, path: '/ads' },
      { text: 'Coupons', icon: <LocalOffer fontSize="small" />, path: '/coupons' },
      { text: 'Subscriptions', icon: <CardMembership fontSize="small" />, path: '/subscriptions' },
      { text: 'Notifications', icon: <NotificationsActive fontSize="small" />, path: '/notifications' },
    ],
  },
  {
    groupLabel: 'CONTENT',
    items: [
      { text: 'CMS Pages', icon: <Description fontSize="small" />, path: '/cms' },
      { text: 'Blog', icon: <Article fontSize="small" />, path: '/blog' },
    ],
  },
  {
    groupLabel: 'SETTINGS',
    items: [
      { text: 'System Settings', icon: <Settings fontSize="small" />, path: '/settings' },
      { text: 'Roles & Permissions', icon: <Security fontSize="small" />, path: '/roles' },
      { text: 'Audit Logs', icon: <FactCheck fontSize="small" />, path: '/audit' },
    ],
  },
];

export default function Sidebar({ drawerWidth, mobileOpen, handleDrawerToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (path: string) => {
    router.push(path);
    if (mobileOpen) handleDrawerToggle();
  };

  const drawerContent = (
    <Box sx={{ 
      display: 'flex', flexDirection: 'column', height: '100%', 
      bgcolor: '#0B1B42', color: 'white', overflow: 'hidden' 
    }}>
      {/* Logo */}
      <Box sx={{ p: 3, pb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', letterSpacing: -1 }}>
          <span style={{ color: '#84cc16' }}>L</span>
          <span style={{ color: '#ef4444' }}>o</span>
          <span style={{ color: '#f59e0b' }}>o</span>
          <span style={{ color: '#3b82f6' }}>p</span>
          <span style={{ color: '#8b5cf6' }}>o</span>
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#94a3b8', mt: 0.5 }}>
          Buy. <span style={{ color: '#84cc16' }}>Sell.</span> Reuse. Repeat.
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 2, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' } }}>
        {NAV_GROUPS.map((group, gIdx) => (
          <Box key={gIdx} sx={{ mb: 1.5 }}>
            {group.groupLabel && (
              <Typography
                variant="overline"
                sx={{ 
                  fontWeight: 600, pl: 1, fontSize: '0.65rem', 
                  letterSpacing: '0.1em', display: 'block', mb: 0.5,
                  color: '#64748b'
                }}
              >
                {group.groupLabel}
              </Typography>
            )}
            <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {group.items.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                return (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      onClick={() => handleNav(item.path)}
                      sx={{
                        borderRadius: 2,
                        px: 1.5,
                        py: 1,
                        bgcolor: isActive ? '#1d4ed8' : 'transparent',
                        color: isActive ? 'white' : '#cbd5e1',
                        '&:hover': {
                          bgcolor: isActive ? '#1d4ed8' : 'rgba(255,255,255,0.05)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 32,
                          color: isActive ? 'white' : '#cbd5e1',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight: isActive ? 600 : 400,
                              fontSize: '0.85rem'
                            }
                          }
                        }}
                      />
                      {group.items.some(i => i.children) && (
                        <ExpandMore sx={{ fontSize: 16, color: '#64748b' }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer Profile */}
      <Box sx={{ p: 2, m: 2, mt: 'auto', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" sx={{ width: 36, height: 36 }} />
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            Admin User
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            Super Admin
          </Typography>
        </Box>
        <ExpandMore sx={{ fontSize: 18, color: '#64748b' }} />
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
