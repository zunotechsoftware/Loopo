'use client';

import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

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

export default function KPICards({ ads = [] }: { ads?: any[] }) {
  const totalAds = ads.length;
  const activeAds = ads.filter(a => a.status === 'ACTIVE').length;
  const activePercentage = totalAds > 0 ? Math.round((activeAds / totalAds) * 100) : 0;
  
  // Calculate totals from data
  const totalImpressions = ads.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
  const totalClicks = ads.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;
  const totalSpend = ads.reduce((acc, curr) => acc + (curr.spend || 0), 0);

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="Total Advertisements"
          value={totalAds}
          subtitle="All time ads"
          icon={<CampaignOutlinedIcon />}
          iconColor="#8b5cf6"
          iconBgColor="#f3e8ff"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="Active Advertisements"
          value={activeAds}
          subtitle={`${activePercentage}% of total`}
          icon={<CheckCircleOutlineIcon />}
          iconColor="#10b981"
          iconBgColor="#d1fae5"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="Total Impressions"
          value={formatNumber(totalImpressions)}
          subtitle="+18.45% vs last month"
          subtitleColor="#10b981"
          icon={<VisibilityOutlinedIcon />}
          iconColor="#f59e0b"
          iconBgColor="#fef3c7"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="Total Clicks"
          value={formatNumber(totalClicks)}
          subtitle="+12.35% vs last month"
          subtitleColor="#10b981"
          icon={<TouchAppOutlinedIcon />}
          iconColor="#3b82f6"
          iconBgColor="#dbeafe"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="CTR"
          value={`${ctr}%`}
          subtitle="+0.45% vs last month"
          subtitleColor="#10b981"
          icon={<AdsClickOutlinedIcon />}
          iconColor="#8b5cf6"
          iconBgColor="#f3e8ff"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <KPICard
          title="Total Spend"
          value={formatCurrency(totalSpend)}
          subtitle="+15.20% vs last month"
          subtitleColor="#10b981"
          icon={<AccountBalanceWalletOutlinedIcon />}
          iconColor="#ef4444"
          iconBgColor="#fee2e2"
        />
      </Grid>
    </Grid>
  );
}
