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
              bgcolor: '#ffffff',
              borderRadius: 3,
              p: 3,
              boxShadow: 'none',
              borderStyle: 'solid',
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>Subject</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>{template.subject}</Typography>
            <Divider sx={{ mb: 2 }} />
            {template.body ? (
              <Box
                sx={{ color: '#1e293b', fontSize: '0.85rem', lineHeight: 1.6, '& img': { maxWidth: '100%' } }}
                dangerouslySetInnerHTML={{ __html: template.body }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                This template has no body content yet. Edit it to add one.
              </Typography>
            )}
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
