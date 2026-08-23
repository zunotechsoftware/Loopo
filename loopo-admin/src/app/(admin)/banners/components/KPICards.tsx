'use client';

import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { kpiData } from '../mockData';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  subtitleColor?: string;
}

function KPICard({ title, value, subtitle, icon, iconColor, iconBgColor, subtitleColor = 'text.secondary' }: KPICardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%'
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: iconBgColor,
          color: iconColor,
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#1e293b' }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: subtitleColor, fontWeight: 500 }}>
          {subtitle}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function KPICards({ banners = [] }: { banners?: any[] }) {
  const totalBanners = banners.length;
  const activeBanners = banners.filter(b => b.isActive).length;
  const activePercentage = totalBanners > 0 ? Math.round((activeBanners / totalBanners) * 100) : 0;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="Total Banners"
          value={totalBanners}
          subtitle="All time banners"
          icon={<ImageOutlinedIcon />}
          iconColor="#8b5cf6"
          iconBgColor="#f3e8ff"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="Active Banners"
          value={activeBanners}
          subtitle={`${activePercentage}% of total`}
          icon={<CheckCircleOutlineIcon />}
          iconColor="#10b981"
          iconBgColor="#d1fae5"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="Total Impressions"
          value={kpiData.totalImpressions}
          subtitle={`+${kpiData.impressionsGrowth}% vs last month`}
          subtitleColor="#10b981"
          icon={<VisibilityOutlinedIcon />}
          iconColor="#f59e0b"
          iconBgColor="#fef3c7"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="Total Clicks"
          value={kpiData.totalClicks}
          subtitle={`+${kpiData.clicksGrowth}% vs last month`}
          subtitleColor="#10b981"
          icon={<TouchAppOutlinedIcon />}
          iconColor="#3b82f6"
          iconBgColor="#dbeafe"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="CTR"
          value={kpiData.ctr}
          subtitle={`+${kpiData.ctrGrowth}% vs last month`}
          subtitleColor="#10b981"
          icon={<AdsClickOutlinedIcon />}
          iconColor="#8b5cf6"
          iconBgColor="#f3e8ff"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="Total Spend"
          value={kpiData.totalSpend}
          subtitle={`+${kpiData.spendGrowth}% vs last month`}
          subtitleColor="#10b981"
          icon={<AccountBalanceWalletOutlinedIcon />}
          iconColor="#ef4444"
          iconBgColor="#fee2e2"
        />
      </Grid>
    </Grid>
  );
}
