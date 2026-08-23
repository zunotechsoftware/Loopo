import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Divider,
  Card,
  Grid,
} from '@mui/material';
import { EmailTemplate, TemplateCategory, TemplateStatus } from '../mockData';

interface EmailTemplateSidebarProps {
  template: EmailTemplate | null;
}

const CategoryBadge = ({ category }: { category: TemplateCategory }) => {
  const styles: Record<TemplateCategory, { bg: string; color: string }> = {
    User: { bg: '#eff6ff', color: '#3b82f6' },
    Order: { bg: '#fff7ed', color: '#f97316' },
    Message: { bg: '#fdf4ff', color: '#d946ef' },
    Marketing: { bg: '#fef2f2', color: '#ef4444' },
    Account: { bg: '#fef2f2', color: '#ef4444' },
    Notification: { bg: '#fffbeb', color: '#f59e0b' },
  };

  const normalizedCategory = category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : '';
  const style = styles[normalizedCategory as TemplateCategory] || { bg: '#f1f5f9', color: '#64748b' };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.3,
        borderRadius: 2,
        bgcolor: style.bg,
        color: style.color,
        fontSize: '0.7rem',
        fontWeight: 600,
      }}
    >
      {category}
    </Box>
  );
};

const StatusBadge = ({ status }: { status: TemplateStatus }) => {
  const styles: Record<TemplateStatus, { bg: string; color: string }> = {
    Active: { bg: '#f0fdf4', color: '#16a34a' },
    Inactive: { bg: '#f1f5f9', color: '#64748b' },
  };

  const normalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';
  const style = styles[normalizedStatus as TemplateStatus] || styles.Inactive;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.3,
        borderRadius: 2,
        bgcolor: style.bg,
        color: style.color,
        fontSize: '0.7rem',
        fontWeight: 600,
      }}
    >
      {status}
    </Box>
  );
};

export default function EmailTemplateSidebar({ template }: EmailTemplateSidebarProps) {
  const [tabIndex, setTabIndex] = useState(0);

  if (!template) {
    return (
      <Box sx={{ width: 350, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
        Select a template to view details
      </Box>
    );
  }

  return (
    <Box sx={{ width: { xs: '100%', lg: 380 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
            Template Preview
          </Typography>
          <Button
            variant="text"
            size="small"
            sx={{
              textTransform: 'none',
              color: '#3b82f6',
              fontWeight: 600,
              fontSize: '0.8rem',
              '&:hover': { bgcolor: '#eff6ff' },
            }}
          >
            Send Test Email
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
              Template Name
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {template.name}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
              Category
            </Typography>
            <CategoryBadge category={template.category} />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
              Language
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
              {template.language}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
              Subject
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {template.subject}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
              Status
            </Typography>
            <StatusBadge status={template.status} />
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ minHeight: 36 }}>
            <Tab label="Preview" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 36, py: 0 }} />
            <Tab label="Details" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 36, py: 0 }} />
          </Tabs>
        </Box>

        {tabIndex === 0 && (
          <Card
            sx={{
              bgcolor: '#f8fafc',
              border: 'none',
              borderRadius: 3,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 'none',
              borderStyle: 'solid',
              borderWidth: 1,
              borderColor: '#e2e8f0'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', letterSpacing: -1, mb: 3 }}>
              <span style={{ color: '#84cc16' }}>L</span>
              <span style={{ color: '#ef4444' }}>o</span>
              <span style={{ color: '#f59e0b' }}>o</span>
              <span style={{ color: '#3b82f6' }}>p</span>
              <span style={{ color: '#8b5cf6' }}>o</span>
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1, textAlign: 'center' }}>
              Hi {'{'}user_name{'}'},
            </Typography>

            <Typography variant="body2" sx={{ color: '#475569', textAlign: 'center', mb: 3, maxWidth: 250 }}>
              Welcome to Loopo! We're excited to have you on board.
              You can now buy, sell, reuse and repeat with ease.
            </Typography>

            <Button
              variant="contained"
              sx={{
                bgcolor: '#1d4ed8',
                color: 'white',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                mb: 4,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1e40af', boxShadow: 'none' },
              }}
            >
              Explore Now
            </Button>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ p: 1, bgcolor: '#dcfce7', color: '#16a34a', borderRadius: 2 }}>
                    {/* Mock Icon */}
                    <Box sx={{ width: 20, height: 20, border: '2px solid currentColor', borderRadius: 1 }} />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#1e293b' }}>Buy</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', textAlign: 'center' }}>Find great deals</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ p: 1, bgcolor: '#e0f2fe', color: '#0ea5e9', borderRadius: 2 }}>
                    {/* Mock Icon */}
                    <Box sx={{ width: 20, height: 20, border: '2px solid currentColor', borderRadius: 1 }} />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#1e293b' }}>Sell</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', textAlign: 'center' }}>List in minutes</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ p: 1, bgcolor: '#f3e8ff', color: '#a855f7', borderRadius: 2 }}>
                    {/* Mock Icon */}
                    <Box sx={{ width: 20, height: 20, border: '2px solid currentColor', borderRadius: 1, borderRadius: '50%' }} />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#1e293b' }}>Repeat</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', textAlign: 'center' }}>Reuse & save more</Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'center', display: 'block', mb: 2 }}>
              Need help? Contact our <span style={{ color: '#3b82f6', cursor: 'pointer' }}>support team</span>.
            </Typography>

            <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'center', display: 'block' }}>
              Thank you,<br />The Loopo Team
            </Typography>
          </Card>
        )}
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
          Template Performance (Last 30 Days)
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Sent</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>2,450</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Opened</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>812</Typography>
            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>↑ 33.14%</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Clicked</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>215</Typography>
            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>↑ 8.76%</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Bounced</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>12</Typography>
            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600 }}>↓ 0.49%</Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
