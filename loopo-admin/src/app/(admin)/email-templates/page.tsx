'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { mockTemplates, EmailTemplate } from './mockData';
import EmailTemplateStats from './components/EmailTemplateStats';
import EmailTemplateFilters from './components/EmailTemplateFilters';
import EmailTemplatesTable from './components/EmailTemplatesTable';
import EmailTemplateSidebar from './components/EmailTemplateSidebar';
import EmailTemplateDialog from './components/EmailTemplateDialog';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { emailTemplatesService } from '@/services/admin.service';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [statsData, setStatsData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>('1');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTemplate, setDialogTemplate] = useState<EmailTemplate | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTemplates, resStats] = await Promise.all([
        emailTemplatesService.getAll(),
        emailTemplatesService.getStats(),
      ]);
      setTemplates(resTemplates.data?.data || []);
      setStatsData(resStats.data?.data || {});
    } catch (error) {
      console.error('Failed to fetch templates', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setLanguage('');
    setPage(1);
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchSearch =
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.subject.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category ? template.category === category : true;
      const matchStatus = status ? template.status === status : true;
      const matchLanguage = language ? template.language === language : true;

      return matchSearch && matchCategory && matchStatus && matchLanguage;
    });
  }, [templates, search, category, status, language]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const handleCreate = () => {
    setDialogTemplate(null);
    setDialogOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setDialogTemplate(template);
    setDialogOpen(true);
  };

  const handleSave = async (template: EmailTemplate) => {
    try {
      const payload = {
        name: template.name,
        subtext: template.subtext,
        category: template.category.toUpperCase(),
        subject: template.subject,
        language: template.language,
        status: template.status.toUpperCase(),
      };

      if (dialogTemplate) {
        // Edit
        await emailTemplatesService.update(template.id, payload);
      } else {
        // Create
        await emailTemplatesService.create(payload);
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save template', error);
    }
  };

  const handleView = (template: EmailTemplate) => {
    setSelectedTemplateId(template.id);
    setViewDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            Email Templates
          </Typography>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/dashboard" sx={{ fontSize: '0.85rem' }}>
              Dashboard
            </Link>
            <Link underline="hover" color="inherit" href="/email-templates" sx={{ fontSize: '0.85rem' }}>
              Email Templates
            </Link>
            <Typography color="text.primary" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
              All Templates
            </Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{
            bgcolor: '#1d4ed8',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#1e40af',
              boxShadow: 'none',
            },
          }}
        >
          Create Template
        </Button>
      </Box>

      {/* Stats Cards */}
      <EmailTemplateStats data={statsData} />

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', gap: 3, flex: 1, flexDirection: { xs: 'column', lg: 'row' } }}>
        
        {/* Left Side (Filters & Table) */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <EmailTemplateFilters
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            status={status}
            setStatus={setStatus}
            language={language}
            setLanguage={setLanguage}
            onReset={handleResetFilters}
          />
          <EmailTemplatesTable
            templates={filteredTemplates}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={handleView}
            onEditTemplate={handleEdit}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
          />
        </Box>

        {/* Right Side (Sidebar) */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            p: 3,
            display: { xs: 'none', lg: 'block' }
          }}
        >
          <EmailTemplateSidebar template={selectedTemplate} />
        </Box>
      </Box>

      {/* Edit/Create Dialog */}
      <EmailTemplateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        template={dialogTemplate}
        onSave={handleSave}
      />

      {/* Mobile View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ display: { xs: 'block', lg: 'none' } }}
      >
        <DialogContent sx={{ p: 2, position: 'relative' }}>
          <IconButton
            size="small"
            onClick={() => setViewDialogOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#f1f5f9' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <EmailTemplateSidebar template={selectedTemplate} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
