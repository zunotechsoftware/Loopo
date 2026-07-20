'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Switch, FormControlLabel, Button, TextField, InputAdornment,
  Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert
} from '@mui/material';
import {
  Settings, ToggleOn, VpnKey, Storage, NotificationsActive,
  Tune, History, Flag, Shield, Edit, Save, Close, Search, Add
} from '@mui/icons-material';
import { AuditLog, Banner } from '@/types';

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: '1', adminId: 'a1', adminName: 'Super Admin', action: 'APPROVE_PRODUCT', module: 'Products', targetId: 'p1', targetType: 'Product', ipAddress: '192.168.1.1', createdAt: '2026-07-19 10:22:00' },
  { id: '2', adminId: 'a2', adminName: 'Moderator A', action: 'SUSPEND_USER', module: 'Users', targetId: 'u5', targetType: 'User', ipAddress: '192.168.1.2', createdAt: '2026-07-19 09:45:11' },
  { id: '3', adminId: 'a1', adminName: 'Super Admin', action: 'UPDATE_SETTING', module: 'Settings', metadata: { key: 'maintenance_mode', value: false }, ipAddress: '192.168.1.1', createdAt: '2026-07-18 16:30:00' },
  { id: '4', adminId: 'a3', adminName: 'Support Agent', action: 'RESOLVE_REPORT', module: 'Reports', targetId: 'r3', targetType: 'Report', ipAddress: '192.168.1.3', createdAt: '2026-07-18 14:00:00' },
  { id: '5', adminId: 'a2', adminName: 'Moderator A', action: 'REJECT_LISTING', module: 'Products', targetId: 'p8', targetType: 'Product', ipAddress: '192.168.1.2', createdAt: '2026-07-17 11:11:00' },
];

const MOCK_BANNERS = [
  { id: 'b1', title: 'Summer Sale 2026', imageUrl: '', linkUrl: '/summer-sale', placement: 'Home', isActive: true, startDate: '2026-07-01', endDate: '2026-07-31' },
  { id: 'b2', title: 'New Electronics Arrivals', imageUrl: '', linkUrl: '/electronics', placement: 'Category', isActive: true, startDate: '2026-07-10', endDate: '2026-07-25' },
  { id: 'b3', title: 'Flash Deal Friday', imageUrl: '', linkUrl: '/deals', placement: 'Home', isActive: false, startDate: '2026-07-05', endDate: '2026-07-05' },
];

const FEATURE_FLAGS = [
  { key: 'referral_system', label: 'Referral System', description: 'Enable user referral rewards program', enabled: true },
  { key: 'live_chat', label: 'Live Chat', description: 'Real-time chat between buyers and sellers', enabled: true },
  { key: 'flash_deals', label: 'Flash Deals', description: 'Time-limited product deals section', enabled: false },
  { key: 'loyalty_points', label: 'Loyalty Points', description: 'Reward buyers with points for purchases', enabled: false },
  { key: 'ai_recommendations', label: 'AI Recommendations', description: 'Personalized product suggestions via ML', enabled: true },
  { key: 'multi_currency', label: 'Multi-Currency', description: 'Accept payments in multiple currencies', enabled: false },
];

const GENERAL_SETTINGS = [
  { key: 'platform_name', label: 'Platform Name', value: 'Loopo Marketplace', type: 'text' },
  { key: 'support_email', label: 'Support Email', value: 'support@loopo.com', type: 'text' },
  { key: 'commission_rate', label: 'Commission Rate (%)', value: '8.5', type: 'text' },
  { key: 'min_payout', label: 'Min Payout Amount ($)', value: '50', type: 'text' },
  { key: 'maintenance_mode', label: 'Maintenance Mode', value: false, type: 'boolean' },
  { key: 'auto_approve', label: 'Auto-Approve New Listings', value: false, type: 'boolean' },
];

const SETTINGS_TABS = [
  { label: 'General', icon: <Settings /> },
  { label: 'Banners', icon: <Tune /> },
  { label: 'Feature Flags', icon: <Flag /> },
  { label: 'Audit Logs', icon: <History /> },
];

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [flags, setFlags] = useState(FEATURE_FLAGS);
  const [settings, setSettings] = useState(GENERAL_SETTINGS);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedAlert, setSavedAlert] = useState(false);

  const toggleFlag = (key: string) => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const handleSaveSettings = () => {
    // Call settingsService.update() for each changed setting in production
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>System Settings</Typography>

      {savedAlert && (
        <Alert severity="success" onClose={() => setSavedAlert(false)}>Settings saved successfully!</Alert>
      )}

      <Card sx={{ pt: 2, px: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          {SETTINGS_TABS.map(t => <Tab key={t.label} label={t.label} />)}
        </Tabs>

        {/* General Settings */}
        {tabValue === 0 && (
          <Box sx={{ pb: 3 }}>
            <Grid container spacing={3}>
              {settings.map(setting => (
                <Grid size={{ xs: 12, md: 6 }} key={setting.key}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} gutterBottom>
                        {setting.label}
                      </Typography>
                      {setting.type === 'boolean' ? (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={setting.value as boolean}
                              onChange={(e) => setSettings(prev => prev.map(s =>
                                s.key === setting.key ? { ...s, value: e.target.checked } : s
                              ))}
                            />
                          }
                          label={setting.value ? 'Enabled' : 'Disabled'}
                        />
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          variant="outlined"
                          value={setting.value}
                          onChange={(e) => setSettings(prev => prev.map(s =>
                            s.key === setting.key ? { ...s, value: e.target.value } : s
                          ))}
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
          </Box>
        )}

        {/* Banners */}
        {tabValue === 1 && (
          <Box sx={{ pb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<Add />}>Add Banner</Button>
            </Box>
            <Grid container spacing={2}>
              {MOCK_BANNERS.map(banner => (
                <Grid size={{ xs: 12, md: 4 }} key={banner.id}>
                  <Card variant="outlined">
                    <Box sx={{ height: 120, bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px 8px 0 0' }}>
                      <Typography variant="body2" color="text.secondary">Banner Preview</Typography>
                    </Box>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{banner.title}</Typography>
                          <Chip label={banner.placement} size="small" sx={{ mt: 0.5 }} />
                        </Box>
                        <Chip
                          label={banner.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={banner.isActive ? 'success' : 'default'}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {banner.startDate} → {banner.endDate}
                      </Typography>
                      <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" startIcon={<Edit />}>Edit</Button>
                        <Button size="small" variant="outlined" color="error">Delete</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Feature Flags */}
        {tabValue === 2 && (
          <Box sx={{ pb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enable or disable platform features without deploying code.
            </Typography>
            <Grid container spacing={2}>
              {flags.map(flag => (
                <Grid size={{ xs: 12, md: 6 }} key={flag.key}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Flag sx={{ fontSize: 18, color: flag.enabled ? 'primary.main' : 'text.disabled' }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{flag.label}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">{flag.description}</Typography>
                      </Box>
                      <Switch checked={flag.enabled} onChange={() => toggleFlag(flag.key)} color="primary" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Audit Logs */}
        {tabValue === 3 && (
          <Box sx={{ pb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <TextField
                placeholder="Search logs..."
                size="small"
                sx={{ width: 350 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{ input: { 
                  startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>
                 } }}
              />
              <Button variant="outlined" size="small" startIcon={<History />}>Export Logs</Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Admin</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Module</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Target</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map(log => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>{log.adminName}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell>
                        {log.targetId ? (
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
                            {log.targetType}:{log.targetId}
                          </Typography>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>
                        <Typography variant="caption">{log.createdAt}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Card>
    </Box>
  );
}
