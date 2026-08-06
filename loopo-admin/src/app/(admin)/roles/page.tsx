'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Switch, Divider
} from '@mui/material';
import { Add, Edit, Delete, Shield, Close, Save } from '@mui/icons-material';

const PERMISSIONS = [
  'users.view', 'users.edit', 'users.suspend', 'users.delete',
  'products.view', 'products.approve', 'products.reject', 'products.delete',
  'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
  'reports.view', 'reports.assign', 'reports.resolve', 'reports.escalate',
  'payments.view', 'payments.refund',
  'analytics.view',
  'settings.view', 'settings.edit',
  'notifications.send',
  'roles.manage',
];

const MOCK_ROLES = [
  { id: 'r1', name: 'Super Admin', description: 'Full access to all modules', userCount: 1, permissions: PERMISSIONS },
  { id: 'r2', name: 'Moderator', description: 'Reviews reports, manages content', userCount: 4, permissions: ['products.view', 'products.approve', 'products.reject', 'reports.view', 'reports.assign', 'reports.resolve', 'reports.escalate', 'reviews.view'] },
  { id: 'r3', name: 'Support Agent', description: 'Handles user queries and reports', userCount: 8, permissions: ['users.view', 'reports.view', 'reports.resolve'] },
  { id: 'r4', name: 'Finance Admin', description: 'Manages payments and subscriptions', userCount: 2, permissions: ['payments.view', 'payments.refund', 'analytics.view'] },
];

export default function RolesPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<typeof MOCK_ROLES[0] | null>(null);
  const [enabledPerms, setEnabledPerms] = useState<string[]>([]);

  const handleOpenEdit = (role: typeof MOCK_ROLES[0]) => {
    setSelectedRole(role);
    setEnabledPerms([...role.permissions]);
    setOpenDialog(true);
  };

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setEnabledPerms([]);
    setOpenDialog(true);
  };

  const togglePerm = (perm: string) => {
    setEnabledPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const groupedPerms = PERMISSIONS.reduce<Record<string, string[]>>((acc, perm) => {
    const [module] = perm.split('.');
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {});

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Roles & Permissions</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>Create Role</Button>
      </Box>

      <Grid container spacing={3}>
        {MOCK_ROLES.map(role => (
          <Grid size={{ xs: 12, md: 6 }} key={role.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Shield color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{role.name}</Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" color="info" onClick={() => handleOpenEdit(role)}><Edit /></IconButton>
                    <IconButton size="small" color="error"><Delete /></IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{role.description}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {role.userCount} admin(s) assigned
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {role.permissions.slice(0, 5).map(p => (
                    <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
                  ))}
                  {role.permissions.length > 5 && (
                    <Chip label={`+${role.permissions.length - 5} more`} size="small" color="primary" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Role Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedRole ? `Edit Role: ${selectedRole.name}` : 'Create New Role'}
          <IconButton onClick={() => setOpenDialog(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }} >
                <TextField label="Role Name" fullWidth required defaultValue={selectedRole?.name || ''} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} >
                <TextField label="Description" fullWidth defaultValue={selectedRole?.description || ''} />
              </Grid>
            </Grid>

            <Divider />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Permissions</Typography>

            {Object.entries(groupedPerms).map(([module, perms]) => (
              <Box key={module}>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}>
                  {module.toUpperCase()}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pl: 1 }}>
                  {perms.map(perm => (
                    <FormControlLabel
                      key={perm}
                      control={
                        <Switch
                          size="small"
                          checked={enabledPerms.includes(perm)}
                          onChange={() => togglePerm(perm)}
                        />
                      }
                      label={<Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{perm}</Typography>}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" startIcon={<Save />}>Save Role</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
