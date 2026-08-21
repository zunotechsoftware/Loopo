'use client';

import React from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { chartData } from '../mockData';

export default function RightSidebar() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* Coupon Summary */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
          Coupon Summary
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ width: 120, height: 120, borderRadius: '50%', border: '12px solid #3b82f6', borderTopColor: '#ef4444', borderRightColor: '#f59e0b', borderBottomColor: '#10b981', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, color: '#0f172a' }}>128</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Total Coupons</Typography>
             </Box>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {chartData.summary.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>{item.name}</Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>{item.value} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({Math.round((item.value / 128) * 100)}%)</span></Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Top Coupons */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Top Coupons (by usage)
          </Typography>
          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, cursor: 'pointer' }}>
            View All
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {chartData.topCoupons.map((coupon, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ border: '1px dashed #cbd5e1', borderRadius: 1, px: 1, py: 0.25, bgcolor: '#f8fafc' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981' }}>{coupon.code}</Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>{new Intl.NumberFormat().format(coupon.uses)} uses</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AddCircleOutlineIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>Create New Coupon</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>Add a new coupon</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#dbeafe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SettingsOutlinedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>Manage Campaigns</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>View coupon campaigns</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#f3e8ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileUploadOutlinedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>Bulk Import Coupons</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>Import coupons in bulk</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <InsertChartOutlinedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>Export Coupons</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>Download coupons report</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Usage Overview */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Usage Overview
          </Typography>
          <Button 
            endIcon={<KeyboardArrowDownIcon />} 
            size="small" 
            sx={{ color: '#475569', textTransform: 'none', border: '1px solid #e2e8f0', borderRadius: 2, py: 0.2 }}
          >
            This Month
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>Coupons Used</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>845</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: '#10b981', bgcolor: '#d1fae5', px: 0.5, borderRadius: 1 }}>
                <ArrowUpwardIcon sx={{ fontSize: 12 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>12.5%</Typography>
              </Box>
            </Box>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>Discount Given</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>₹45,230</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: '#10b981', bgcolor: '#d1fae5', px: 0.5, borderRadius: 1 }}>
                <ArrowUpwardIcon sx={{ fontSize: 12 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>8.2%</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

    </Box>
  );
}
