'use client';

import React from 'react';
import { Box, Typography, Paper, Divider, List, ListItem, ListItemIcon, ListItemText, Link } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { performanceData, placementData, topPerformingBanners } from '../mockData';

export default function RightSidebar() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Banner Performance Chart */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Banner Performance</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ border: '1px solid #e2e8f0', px: 1, py: 0.5, borderRadius: 1 }}>
            Last 7 Days
          </Typography>
        </Box>
        <Box sx={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <RechartsTooltip />
              <Line type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="ctr" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
            <Typography variant="caption" color="text.secondary">Impressions</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
            <Typography variant="caption" color="text.secondary">Clicks</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
            <Typography variant="caption" color="text.secondary">CTR (%)</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Banners by Placement Chart */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Banners by Placement</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', height: 180 }}>
          <Box sx={{ width: '50%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={placementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {placementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ width: '50%' }}>
            <List dense disablePadding>
              {placementData.map((item, index) => (
                <ListItem key={index} disableGutters sx={{ py: 0.2 }}>
                  <ListItemIcon sx={{ minWidth: 20 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.fill }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${item.name} - ${item.value}`} 
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Quick Actions</Typography>
        <List dense sx={{ bgcolor: 'transparent' }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemIcon sx={{ minWidth: 36, color: '#10b981' }}><AddCircleOutlineIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Create New Banner" secondary="Add a new banner" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} secondaryTypographyProps={{ variant: 'caption' }} />
          </ListItem>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemIcon sx={{ minWidth: 36, color: '#3b82f6' }}><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Manage Placements" secondary="Manage banner placements" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} secondaryTypographyProps={{ variant: 'caption' }} />
          </ListItem>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemIcon sx={{ minWidth: 36, color: '#ef4444' }}><CloudUploadOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Upload Banner" secondary="Upload new banner" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} secondaryTypographyProps={{ variant: 'caption' }} />
          </ListItem>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemIcon sx={{ minWidth: 36, color: '#8b5cf6' }}><InsertChartOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="View Performance Report" secondary="Detailed banner analytics" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} secondaryTypographyProps={{ variant: 'caption' }} />
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 36, color: '#f59e0b' }}><FileDownloadOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Export Banners" secondary="Download banners report" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} secondaryTypographyProps={{ variant: 'caption' }} />
          </ListItem>
        </List>
      </Box>

      <Divider />

      {/* Top Performing Banners */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Top Performing Banners</Typography>
          <Link href="#" underline="none" variant="caption" sx={{ fontWeight: 600, color: '#2563eb' }}>View All</Link>
        </Box>
        <List dense disablePadding>
          {topPerformingBanners.map((banner, index) => (
            <ListItem key={index} disableGutters sx={{ mb: 1 }}>
              <ListItemIcon sx={{ minWidth: 50 }}>
                <Box component="img" src={banner.image} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }} />
              </ListItemIcon>
              <ListItemText 
                primary={banner.name} 
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: '#1e293b' }} 
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{banner.ctr}</Typography>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}
