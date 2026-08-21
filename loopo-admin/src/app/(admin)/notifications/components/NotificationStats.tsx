import React from 'react';
import { Box, Card, Typography, Grid } from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

interface StatData {
  title: string;
  value: string;
  subtitle: string;
  subtitleColor?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export default function NotificationStats({ statsData }: { statsData?: any }) {
  const stats: StatData[] = [
    {
      title: 'Total Sent',
      value: statsData ? statsData.totalSent.toLocaleString() : '0',
      subtitle: 'All time',
      icon: <SendOutlinedIcon />,
      iconBg: '#f3e8ff',
      iconColor: '#9333ea',
    },
    {
      title: 'Delivered',
      value: statsData ? statsData.delivered.toLocaleString() : '0',
      subtitle: `(${statsData ? statsData.deliveredRate.toFixed(2) : '0'}%) All time`,
      subtitleColor: '#1e293b',
      icon: <CheckCircleOutlineOutlinedIcon />,
      iconBg: '#dcfce7',
      iconColor: '#16a34a',
    },
    {
      title: 'Opened',
      value: statsData ? statsData.opened.toLocaleString() : '0',
      subtitle: `(${statsData ? statsData.openedRate.toFixed(2) : '0'}%) All time`,
      subtitleColor: '#1e293b',
      icon: <VisibilityOutlinedIcon />,
      iconBg: '#ffedd5',
      iconColor: '#f97316',
    },
    {
      title: 'Clicked',
      value: statsData ? statsData.clicked.toLocaleString() : '0',
      subtitle: `(${statsData && statsData.opened ? ((statsData.clicked / statsData.opened) * 100).toFixed(2) : '0'}%) All time`,
      subtitleColor: '#1e293b',
      icon: <TouchAppOutlinedIcon />,
      iconBg: '#e0f2fe',
      iconColor: '#0ea5e9',
    },
    {
      title: 'Pending',
      value: statsData ? statsData.pending.toLocaleString() : '0',
      subtitle: 'Scheduled',
      subtitleColor: '#64748b',
      icon: <ScheduleOutlinedIcon />,
      iconBg: '#f3e8ff',
      iconColor: '#a855f7',
    },
    {
      title: 'Failed',
      value: statsData ? statsData.failed.toLocaleString() : '0',
      subtitle: `(${statsData ? statsData.failedRate.toFixed(2) : '0'}%) All time`,
      subtitleColor: '#1e293b',
      icon: <ErrorOutlineOutlinedIcon />,
      iconBg: '#ffe4e6',
      iconColor: '#e11d48',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {stats.map((stat, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
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
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: stat.subtitleColor || '#94a3b8', fontWeight: 500, display: 'block', mt: -0.5 }}>
                  {stat.subtitle.includes('(') ? (
                    <>
                      <span style={{ fontWeight: 700 }}>{stat.subtitle.split(' ')[0]}</span> {stat.subtitle.split(' ').slice(1).join(' ')}
                    </>
                  ) : (
                    stat.subtitle
                  )}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
