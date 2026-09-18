'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid2 as Grid, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Switch, FormControlLabel, Button, TextField, InputAdornment,
  CircularProgress, Alert, TablePagination,
} from '@mui/material';
import {
  Settings, Flag, History, Search, Save,
} from '@mui/icons-material';
import { settingsService, auditLogsService } from '@/services/admin.service';

interface SystemSettingRow {
  id: string;
  key: string;
  value: { value: string | number | boolean };
  group: string;
  description?: string;
}

interface FeatureFlagRow {
  id: string;
  key: string;
  name: string;
  description?: string;
  isEnabled: boolean;
}

interface AuditLogRow {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
  user?: { id: string; email: string; firstName?: string; lastName?: string } | null;
}

const SETTINGS_TABS = [
  { label: 'General', icon: <Settings /> },
  { label: 'Feature Flags', icon: <Flag /> },
  { label: 'Audit Logs', icon: <History /> },
];

function formatSettingLabel(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);

  // --- General settings (real /admin/settings) ---
  const [settings, setSettings] = useState<SystemSettingRow[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savedAlert, setSavedAlert] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await settingsService.getAll();
      const list = res.data?.data || res.data || [];
      setSettings(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateLocalSetting = (key: string, value: string | number | boolean) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value: { value } } : s)));
  };

  const handleSaveSettings = async () => {
    setSaveError(null);
    try {
      await Promise.all(settings.map((s) => settingsService.update(s.key, { value: s.value.value }, s.group)));
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveError('Failed to save one or more settings. Please try again.');
    }
  };

  // --- Feature flags (real /admin/feature-flags) ---
  const [flags, setFlags] = useState<FeatureFlagRow[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    setFlagsLoading(true);
    try {
      const res = await settingsService.getFeatureFlags();
      const list = res.data?.data || res.data || [];
      setFlags(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch feature flags:', err);
    } finally {
      setFlagsLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const toggleFlag = async (flag: FeatureFlagRow) => {
    const nextEnabled = !flag.isEnabled;
    setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, isEnabled: nextEnabled } : f)));
    try {
      await settingsService.updateFeatureFlag(flag.key, nextEnabled, flag.name, flag.description);
    } catch (err) {
      console.error('Failed to update feature flag:', err);
      // Revert on failure
      setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, isEnabled: flag.isEnabled } : f)));
    }
  };

  // --- Audit logs (real /admin/audit-logs) ---
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsPage, setLogsPage] = useState(0);
  const [logsPerPage, setLogsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchLogs = useCallback(async (page: number, limit: number) => {
    setLogsLoading(true);
    try {
      const res = await auditLogsService.getAll({ page: page + 1, limit });
      const data = res.data?.data || res.data || {};
      setLogs(Array.isArray(data.items) ? data.items : []);
      setLogsTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tabValue === 2) fetchLogs(logsPage, logsPerPage);
  }, [tabValue, logsPage, logsPerPage, fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const adminName = log.user ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email : '';
    return (
      log.action.toLowerCase().includes(term) ||
      log.entity.toLowerCase().includes(term) ||
      adminName.toLowerCase().includes(term)
    );
  });

  const handleExportLogs = async () => {
    setExporting(true);
    try {
      const res = await auditLogsService.export();
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export audit logs:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>System Settings</Typography>

      {savedAlert && (
        <Alert severity="success" onClose={() => setSavedAlert(false)}>Settings saved successfully!</Alert>
      )}
      {saveError && (
        <Alert severity="error" onClose={() => setSaveError(null)}>{saveError}</Alert>
      )}

      <Card sx={{ pt: 2, px: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          {SETTINGS_TABS.map((t) => <Tab key={t.label} label={t.label} />)}
        </Tabs>

        {/* General Settings */}
        {tabValue === 0 && (
          <Box sx={{ pb: 3 }}>
            {settingsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : settings.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No settings configured yet.</Typography>
            ) : (
              <>
                <Grid container spacing={3}>
                  {settings.map((setting) => (
                    <Grid size={{ xs: 12, md: 6 }} key={setting.key}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} gutterBottom>
                            {formatSettingLabel(setting.key)}
                          </Typography>
                          {setting.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              {setting.description}
                            </Typography>
                          )}
                          {typeof setting.value?.value === 'boolean' ? (
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={setting.value.value}
                                  onChange={(e) => updateLocalSetting(setting.key, e.target.checked)}
                                />
                              }
                              label={setting.value.value ? 'Enabled' : 'Disabled'}
                            />
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              variant="outlined"
                              type={typeof setting.value?.value === 'number' ? 'number' : 'text'}
                              value={setting.value?.value ?? ''}
                              onChange={(e) => updateLocalSetting(
                                setting.key,
                                typeof setting.value?.value === 'number' ? Number(e.target.value) : e.target.value
                              )}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button variant="contained" startIcon={<Save />} onClick={handleSaveSettings}>
                    Save Settings
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}

        {/* Feature Flags */}
        {tabValue === 1 && (
          <Box sx={{ pb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enable or disable platform features without deploying code. Changes apply immediately.
            </Typography>
            {flagsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : flags.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No feature flags configured yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {flags.map((flag) => (
                  <Grid size={{ xs: 12, md: 6 }} key={flag.key}>
                    <Card variant="outlined">
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Flag sx={{ fontSize: 18, color: flag.isEnabled ? 'primary.main' : 'text.disabled' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{flag.name}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">{flag.description}</Typography>
                        </Box>
                        <Switch checked={flag.isEnabled} onChange={() => toggleFlag(flag)} color="primary" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Audit Logs */}
        {tabValue === 2 && (
          <Box sx={{ pb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <TextField
                placeholder="Filter loaded logs by admin, action or entity..."
                size="small"
                sx={{ width: 380 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{ input: {
                  startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>
                 } }}
              />
              <Button variant="outlined" size="small" startIcon={<History />} onClick={handleExportLogs} disabled={exporting}>
                {exporting ? 'Exporting...' : 'Export Logs'}
              </Button>
            </Box>

            {logsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Admin</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Entity</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Target</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                            No audit log entries found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log) => {
                          const adminName = log.user
                            ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email
                            : 'System';
                          return (
                            <TableRow key={log.id} hover>
                              <TableCell sx={{ fontWeight: 'medium' }}>{adminName}</TableCell>
                              <TableCell>
                                <Chip
                                  label={log.action}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                                />
                              </TableCell>
                              <TableCell>{log.entity}</TableCell>
                              <TableCell>
                                {log.entityId ? (
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
                                    {log.entityId}
                                  </Typography>
                                ) : '—'}
                              </TableCell>
                              <TableCell>{log.ipAddress || '—'}</TableCell>
                              <TableCell>
                                <Typography variant="caption">{new Date(log.createdAt).toLocaleString()}</Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={logsTotal}
                  page={logsPage}
                  onPageChange={(_, p) => setLogsPage(p)}
                  rowsPerPage={logsPerPage}
                  onRowsPerPageChange={(e) => { setLogsPerPage(parseInt(e.target.value, 10)); setLogsPage(0); }}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                />
              </>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
}
