'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid2 as Grid, Chip,
  IconButton, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Switch, Divider, CircularProgress,
  Alert, Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, Shield, Close, Save, Lock } from '@mui/icons-material';
import { rolesService } from '@/services/admin.service';

interface Role {
  id: string;
  name: string;
  description: string | null;
  isProtected: boolean;
  userCount: number;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [enabledPerms, setEnabledPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([rolesService.getAll(), rolesService.getPermissions()]);
      setRoles(Array.isArray(rolesRes.data?.data) ? rolesRes.data.data : []);
      setPermissions(Array.isArray(permsRes.data?.data) ? permsRes.data.data : []);
    } catch (err) {
      console.error('Failed to load roles', err);
      setError('Could not load roles. Is the backend reachable?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groupedPerms = useMemo(() => {
    return permissions.reduce<Record<string, string[]>>((acc, perm) => {
      const [module] = perm.name.split('.');
      if (!acc[module]) acc[module] = [];
      acc[module].push(perm.name);
      return acc;
    }, {});
  }, [permissions]);

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setNameInput(role.name);
    setDescriptionInput(role.description || '');
    setEnabledPerms([...role.permissions]);
    setActionError(null);
    setOpenDialog(true);
  };

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setNameInput('');
    setDescriptionInput('');
    setEnabledPerms([]);
    setActionError(null);
    setOpenDialog(true);
  };

  const togglePerm = (perm: string) => {
    setEnabledPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  };

  const handleSave = async () => {
    if (!nameInput.trim()) {
      setActionError('Role name is required.');
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      if (selectedRole) {
        const payload: { name?: string; description?: string; permissionNames?: string[] } = {
          description: descriptionInput,
        };
        if (!selectedRole.isProtected) {
          payload.name = nameInput;
          payload.permissionNames = enabledPerms;
        }
        await rolesService.update(selectedRole.id, payload);
      } else {
        await rolesService.create({ name: nameInput, description: descriptionInput, permissionNames: enabledPerms });
      }
      setOpenDialog(false);
      await load();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Failed to save role.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: Role) => {
    setActionError(null);
    try {
      await rolesService.delete(role.id);
      await load();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || `Failed to delete role "${role.name}".`);
    }
  };

  if (loading && roles.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Roles & Permissions</Typography>
          <Typography variant="body2" color="text.secondary">SUPER_ADMIN, ADMIN, and USER are core system roles - protected from renaming, permission edits, or deletion here.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>Create Role</Button>
      </Box>

      {error && <Alert severity="warning">{error}</Alert>}
      {actionError && <Alert severity="error" onClose={() => setActionError(null)}>{actionError}</Alert>}

      <Grid container spacing={3}>
        {roles.map((role) => (
          <Grid size={{ xs: 12, md: 6 }} key={role.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Shield color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{role.name}</Typography>
                    {role.isProtected && (
                      <Tooltip title="Core system role - protected">
                        <Lock fontSize="small" sx={{ color: 'text.disabled' }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Box>
                    <IconButton size="small" color="info" onClick={() => handleOpenEdit(role)}><Edit /></IconButton>
                    <Tooltip title={role.isProtected ? 'Core system role - cannot be deleted' : role.userCount > 0 ? 'Users are still assigned to this role' : ''}>
                      <span>
                        <IconButton size="small" color="error" disabled={role.isProtected || role.userCount > 0} onClick={() => handleDelete(role)}>
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{role.description || 'No description'}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {role.userCount} user(s) assigned
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {role.permissions.slice(0, 5).map((p) => (
                    <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
                  ))}
                  {role.permissions.length > 5 && (
                    <Chip label={`+${role.permissions.length - 5} more`} size="small" color="primary" />
                  )}
                  {role.permissions.length === 0 && (
                    <Typography variant="caption" color="text.disabled">No permissions granted</Typography>
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
            {actionError && <Alert severity="error">{actionError}</Alert>}
            {selectedRole?.isProtected && (
              <Alert severity="info">This is a core system role - its name and permissions are protected. Only the description can be changed here.</Alert>
            )}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Role Name" fullWidth required
                  value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                  disabled={Boolean(selectedRole?.isProtected)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Description" fullWidth
                  value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)}
                />
              </Grid>
            </Grid>

            <Divider />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Permissions {selectedRole?.isProtected && <Typography component="span" variant="caption" color="text.disabled">(read-only)</Typography>}
            </Typography>

            {Object.entries(groupedPerms).map(([module, perms]) => (
              <Box key={module}>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}>
                  {module.toUpperCase()}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pl: 1 }}>
                  {perms.map((perm) => (
                    <FormControlLabel
                      key={perm}
                      control={
                        <Switch
                          size="small"
                          checked={enabledPerms.includes(perm)}
                          onChange={() => togglePerm(perm)}
                          disabled={Boolean(selectedRole?.isProtected)}
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
          <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />} disabled={saving} onClick={handleSave}>
            Save Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
