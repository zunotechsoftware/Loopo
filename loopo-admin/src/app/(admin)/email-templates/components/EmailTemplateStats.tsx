import React from 'react';
import { Box, Card, Typography, Grid } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';

interface StatData {
  title: string;
  value: string;
  subtitle: string;
  subtitleColor?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export default function EmailTemplateStats({ data }: { data: any }) {
  const statsList: StatData[] = [
    {
      title: 'Total Templates',
      value: data?.total?.toString() || '0',
      subtitle: 'All email templates',
      icon: <EmailOutlinedIcon />,
      iconBg: '#f3e8ff',
      iconColor: '#9333ea',
    },
    {
      title: 'Active Templates',
      value: data?.active?.toString() || '0',
      subtitle: `${data?.activePercentage || '0%'} of total`,
      icon: <FactCheckOutlinedIcon />,
      iconBg: '#dcfce7',
      iconColor: '#16a34a',
    },
    {
      title: 'Used This Month',
      value: data?.usedThisMonth?.toString() || '0',
      subtitle: '+8.45% vs last month',
      subtitleColor: '#16a34a',
      icon: <SendOutlinedIcon />,
      iconBg: '#ffedd5',
      iconColor: '#f97316',
    },
    {
      title: 'Open Rate (Avg.)',
      value: data?.openRate || '0%',
      subtitle: '+2.31% vs last month',
      subtitleColor: '#16a34a',
      icon: <VisibilityOutlinedIcon />,
      iconBg: '#e0f2fe',
      iconColor: '#0284c7',
    },
    {
      title: 'Click Rate (Avg.)',
      value: data?.clickRate || '0%',
      subtitle: '+1.12% vs last month',
      subtitleColor: '#16a34a',
      icon: <TouchAppOutlinedIcon />,
      iconBg: '#f3e8ff',
      iconColor: '#9333ea',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {statsList.map((stat, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 3,
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                height: '100%',
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: stat.iconBg,
                  color: stat.iconColor,
                  display: 'flex',
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, fontSize: '0.75rem' }}>
                  {stat.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5, fontSize: '1.25rem' }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: stat.subtitleColor || '#94a3b8', fontWeight: 500 }}>
                  {stat.subtitle}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
