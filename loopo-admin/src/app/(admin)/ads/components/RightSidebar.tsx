'use client';

import React from 'react';
import { Box, Typography, Paper, Divider, Button, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { chartData } from '../mockData';

export default function RightSidebar() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Performance Overview */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Performance Overview
          </Typography>
          <Button 
            endIcon={<KeyboardArrowDownIcon />} 
            size="small" 
            sx={{ color: '#64748b', textTransform: 'none', border: '1px solid #e2e8f0', borderRadius: 2 }}
          >
            Last 7 Days
          </Button>
        </Box>
        {/* Placeholder for Line Chart */}
        <Box sx={{ height: 200, width: '100%', bgcolor: '#f8fafc', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, position: 'relative', overflow: 'hidden' }}>
           <img src="https://i.ibb.co/Ltb2K27/line-chart-placeholder.png" alt="Chart" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
           <Typography variant="caption" sx={{ position: 'absolute', color: '#64748b' }}>Chart visualization</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
            <Typography variant="caption" color="text.secondary">Impressions</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
            <Typography variant="caption" color="text.secondary">Clicks</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
            <Typography variant="caption" color="text.secondary">Conversions</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Ad Types Distribution */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
          Ad Types Distribution
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ width: 120, height: 120, borderRadius: '50%', border: '16px solid #3b82f6', borderTopColor: '#10b981', borderRightColor: '#f59e0b', borderBottomColor: '#ef4444', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>56</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Total Ads</Typography>
             </Box>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {chartData.distribution.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{item.name}</Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.value} ({Math.round((item.value / 100) * 100)}%)</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AddCircleOutlineIcon fontSize="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>Create New Advertisement</Typography>
              <Typography variant="caption" color="text.secondary">Launch a new ad campaign</Typography>
            </Box>
            <ChevronRightIcon sx={{ color: '#94a3b8' }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#f3e8ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SettingsOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>Manage Campaigns</Typography>
              <Typography variant="caption" color="text.secondary">View and manage campaigns</Typography>
            </Box>
            <ChevronRightIcon sx={{ color: '#94a3b8' }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#dbeafe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileUploadOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>Upload Banner</Typography>
              <Typography variant="caption" color="text.secondary">Upload new banner creative</Typography>
            </Box>
            <ChevronRightIcon sx={{ color: '#94a3b8' }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <InsertChartOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>View Ad Reports</Typography>
              <Typography variant="caption" color="text.secondary">Detailed performance reports</Typography>
            </Box>
            <ChevronRightIcon sx={{ color: '#94a3b8' }} />
          </Box>
        </Box>
      </Paper>

      {/* Top Performing Ads */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Top Performing Ads
          </Typography>
          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, cursor: 'pointer' }}>
            View All
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box component="img" src="https://via.placeholder.com/40x40/10B981/FFFFFF?text=AD" sx={{ width: 32, height: 32, borderRadius: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>Summer Sale Banner</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>CTR 4.85%</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box component="img" src="https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=AD" sx={{ width: 32, height: 32, borderRadius: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>Electronics Fest</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>CTR 4.83%</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box component="img" src="https://via.placeholder.com/40x40/EF4444/FFFFFF?text=AD" sx={{ width: 32, height: 32, borderRadius: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>Download App Now</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>CTR 4.54%</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
