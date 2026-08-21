import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { EmailTemplate, TemplateCategory, TemplateStatus } from '../mockData';

interface EmailTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
  onSave: (template: EmailTemplate) => void;
}

export default function EmailTemplateDialog({
  open,
  onClose,
  template,
  onSave,
}: EmailTemplateDialogProps) {
  const isEdit = Boolean(template);

  const [formData, setFormData] = useState<Partial<EmailTemplate>>({
    name: '',
    subtext: '',
    category: 'Marketing',
    subject: '',
    language: 'English',
    status: 'Active',
  });

  useEffect(() => {
    if (template && open) {
      setFormData(template);
    } else if (!template && open) {
      setFormData({
        name: '',
        subtext: '',
        category: 'Marketing',
        subject: '',
        language: 'English',
        status: 'Active',
      });
    }
  }, [template, open]);

  const handleChange = (field: keyof EmailTemplate) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    onSave({
      id: template ? template.id : Math.random().toString(36).substr(2, 9),
      name: formData.name || '',
      subtext: formData.subtext || '',
      category: (formData.category as TemplateCategory) || 'Marketing',
      subject: formData.subject || '',
      language: formData.language || 'English',
      status: (formData.status as TemplateStatus) || 'Active',
      used: template ? template.used : 0,
      updatedOn: template ? template.updatedOn : new Date().toLocaleString(),
    } as EmailTemplate);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEdit ? 'Edit Template' : 'Create Template'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Template Name"
              value={formData.name}
              onChange={handleChange('name')}
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Subtext"
              value={formData.subtext}
              onChange={handleChange('subtext')}
              size="small"
              placeholder="e.g. User Welcome"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TemplateCategory })}
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Order">Order</MenuItem>
                <MenuItem value="Message">Message</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Account">Account</MenuItem>
                <MenuItem value="Notification">Notification</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Language</InputLabel>
              <Select
                value={formData.language}
                label="Language"
                onChange={(e) => setFormData({ ...formData, language: e.target.value as string })}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Spanish">Spanish</MenuItem>
                <MenuItem value="French">French</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Subject Line"
              value={formData.subject}
              onChange={handleChange('subject')}
              size="small"
              required
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TemplateStatus })}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ bgcolor: '#1d4ed8', textTransform: 'none' }}
          disabled={!formData.name || !formData.subject}
        >
          {isEdit ? 'Save Changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
