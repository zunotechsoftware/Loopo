'use client';

import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Collapse, IconButton
} from '@mui/material';
import Dashboard from '@mui/icons-material/Dashboard';
import People from '@mui/icons-material/People';
import Storefront from '@mui/icons-material/Storefront';
import Inventory from '@mui/icons-material/Inventory';
import Category from '@mui/icons-material/Category';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Payment from '@mui/icons-material/Payment';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import Message from '@mui/icons-material/Message';
import Star from '@mui/icons-material/Star';
import Assessment from '@mui/icons-material/Assessment';
import ViewCarousel from '@mui/icons-material/ViewCarousel';
import FeaturedVideo from '@mui/icons-material/FeaturedVideo';
import LocalOffer from '@mui/icons-material/LocalOffer';
import CardMembership from '@mui/icons-material/CardMembership';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Description from '@mui/icons-material/Description';
import Article from '@mui/icons-material/Article';
import Settings from '@mui/icons-material/Settings';
import Security from '@mui/icons-material/Security';
import FactCheck from '@mui/icons-material/FactCheck';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Logout from '@mui/icons-material/Logout';
import ReportProblem from '@mui/icons-material/ReportProblem';
import SupportAgent from '@mui/icons-material/SupportAgent';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
      { 
        text: 'Listings', 
        icon: <Inventory fontSize="small" />, 
        path: '/listings',
        children: [
          { text: 'All Listings', icon: <Inventory fontSize="small" />, path: '/listings' },
          { text: 'Add Listing', icon: <Inventory fontSize="small" />, path: '/listings/add' },
          { text: 'Pending Approval', icon: <Inventory fontSize="small" />, path: '/listings/pending' },
          { text: 'Bulk Upload', icon: <Inventory fontSize="small" />, path: '/listings/bulk' },
        ]
      },
      { text: 'Categories', icon: <Category fontSize="small" />, path: '/categories' },
      { 
        text: 'Brands', 
        icon: <LocalOffer fontSize="small" />, 
        path: '/brands',
        children: [
          { text: 'All Brands', icon: <LocalOffer fontSize="small" />, path: '/brands' },
          { text: 'Add Brand', icon: <LocalOffer fontSize="small" />, path: '/brands/add' }
        ]
      },
      { text: 'Payments', icon: <Payment fontSize="small" />, path: '/payments' },
      { text: 'Messages', icon: <Message fontSize="small" />, path: '/messages' },
      { text: 'Support Tickets', icon: <Assessment fontSize="small" />, path: '/support' },
      { text: 'Reviews', icon: <Star fontSize="small" />, path: '/reviews' },
      { text: 'Complaints', icon: <ReportProblem fontSize="small" />, path: '/complaints' },
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
  const { user, logout } = useAuth();
  
  // Default expanded state based on pathname
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({
    'Listings': pathname.startsWith('/listings')
  });

  const handleToggleMenu = (text: string) => {
    setOpenMenus(prev => ({ ...prev, [text]: !prev[text] }));
  };

  const handleNav = (item: NavItem) => {
    if (item.children) {
      handleToggleMenu(item.text);
      return;
    }
    router.push(item.path);
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
                const isItemActive = pathname === item.path || (item.children ? pathname.startsWith(item.path) : false);
                const isOpen = openMenus[item.text] || false;
                
                return (
                  <React.Fragment key={item.text}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => handleNav(item)}
                        sx={{
                          borderRadius: 2,
                          px: 1.5,
                          py: 1,
                          bgcolor: isItemActive && !item.children ? '#1d4ed8' : (isOpen ? 'rgba(255,255,255,0.03)' : 'transparent'),
                          color: isItemActive ? 'white' : '#cbd5e1',
                          '&:hover': {
                            bgcolor: isItemActive && !item.children ? '#1d4ed8' : 'rgba(255,255,255,0.05)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 32,
                            color: isItemActive ? 'white' : '#cbd5e1',
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          slotProps={{
                            primary: {
                              sx: {
                                fontWeight: isItemActive ? 600 : 400,
                                fontSize: '0.85rem'
                              }
                            }
                          }}
                        />
                        {item.children && (
                          isOpen ? <ExpandLess sx={{ fontSize: 16, color: '#64748b' }} /> : <ExpandMore sx={{ fontSize: 16, color: '#64748b' }} />
                        )}
                      </ListItemButton>
                    </ListItem>
                    {item.children && (
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                          {item.children.map(child => {
                            const isChildActive = pathname === child.path;
                            return (
                              <ListItemButton
                                key={child.text}
                                onClick={() => handleNav(child)}
                                sx={{
                                  borderRadius: 2,
                                  pl: 5,
                                  py: 0.8,
                                  bgcolor: isChildActive ? '#1d4ed8' : 'transparent',
                                  color: isChildActive ? 'white' : '#94a3b8',
                                  '&:hover': {
                                    bgcolor: isChildActive ? '#1d4ed8' : 'rgba(255,255,255,0.05)',
                                    color: 'white'
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <ListItemText 
                                  primary={child.text} 
                                  slotProps={{
                                    primary: {
                                      sx: {
                                        fontWeight: isChildActive ? 600 : 400,
                                        fontSize: '0.8rem'
                                      }
                                    }
                                  }} 
                                />
                              </ListItemButton>
                            );
                          })}
                        </List>
                      </Collapse>
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer Profile */}
      <Box sx={{ p: 2, m: 2, mt: 'auto', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: '#1d4ed8', fontSize: '0.85rem', fontWeight: 600 }}>
          {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
        </Avatar>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Admin User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            {user?.email || 'Super Admin'}
          </Typography>
        </Box>
        <IconButton onClick={logout} size="small" sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.15)' } }}>
          <Logout sx={{ fontSize: 18 }} />
        </IconButton>
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
