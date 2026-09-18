'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid2 as Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Select, MenuItem, FormControl, InputLabel, IconButton, Menu,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Stack, Divider, Link as MuiLink,
} from '@mui/material';
import {
  MoreVert, Flag, PriorityHigh, CheckCircle, Cancel, TrendingUp, Visibility,
} from '@mui/icons-material';
import { reportsService, usersService } from '@/services/admin.service';

const STATUSES = ['OPEN', 'ASSIGNED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'ESCALATED', 'CLOSED'];
const TARGET_TYPES = ['LISTING', 'USER', 'CHAT_MESSAGE', 'CATEGORY', 'SYSTEM'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const statusColor: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  OPEN: 'warning', ASSIGNED: 'info', UNDER_REVIEW: 'info', RESOLVED: 'success',
  REJECTED: 'default', ESCALATED: 'error', CLOSED: 'default',
};
const priorityColor: Record<string, 'default' | 'warning' | 'error'> = {
  LOW: 'default', MEDIUM: 'default', HIGH: 'warning', CRITICAL: 'error',
};

function fullName(u: any) {
  if (!u) return 'Unknown';
  return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown';
}
function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [moderators, setModerators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignId, setAssignId] = useState('');
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateNote, setEscalateNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (targetTypeFilter) params.targetType = targetTypeFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await reportsService.getAll(params);
      setReports(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to load reports', err);
      setError('Could not load reports. Is the backend reachable?');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, targetTypeFilter, priorityFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    usersService.getAll({ role: 'ADMIN', take: 50 })
      .then((res) => setModerators(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setModerators([]));
  }, []);

  const stats = useMemo(() => {
    const open = reports.filter((r) => r.status === 'OPEN').length;
    const inProgress = reports.filter((r) => r.status === 'ASSIGNED' || r.status === 'UNDER_REVIEW').length;
    const escalated = reports.filter((r) => r.status === 'ESCALATED').length;
    const closed = reports.filter((r) => ['RESOLVED', 'REJECTED', 'CLOSED'].includes(r.status)).length;
    return { total: reports.length, open, inProgress, escalated, closed };
  }, [reports]);

  const openMenu = (e: React.MouseEvent<HTMLElement>, report: any) => {
    setAnchorEl(e.currentTarget);
    setSelected(report);
  };
  const closeMenu = () => setAnchorEl(null);

  const runAction = async (fn: () => Promise<unknown>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await fn();
      await load();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = (report: any) => runAction(() => reportsService.resolve(report.id));
  const handleReject = (report: any) => runAction(() => reportsService.reject(report.id));
  const handleAssignSubmit = () => runAction(async () => {
    await reportsService.assign(selected.id, assignId);
    setAssignOpen(false);
    setAssignId('');
  });
  const handleEscalateSubmit = () => runAction(async () => {
    await reportsService.escalate(selected.id, escalateNote);
    setEscalateOpen(false);
    setEscalateNote('');
  });

  if (loading && reports.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Reports</Typography>
        <Typography variant="body2" color="text.secondary">User-filed reports about listings, users, and messages, grouped into moderation cases.</Typography>
      </Box>

      {error && <Alert severity="warning">{error}</Alert>}
      {actionError && <Alert severity="error" onClose={() => setActionError(null)}>{actionError}</Alert>}

      <Grid container spacing={2}>
        {[
          { label: 'Total', value: stats.total, icon: <Flag color="action" />, bg: '#f1f5f9' },
          { label: 'Open', value: stats.open, icon: <PriorityHigh sx={{ color: '#d97706' }} />, bg: '#fffbeb' },
          { label: 'In Progress', value: stats.inProgress, icon: <TrendingUp sx={{ color: '#2563eb' }} />, bg: '#eff6ff' },
          { label: 'Escalated', value: stats.escalated, icon: <PriorityHigh sx={{ color: '#dc2626' }} />, bg: '#fef2f2' },
          { label: 'Closed', value: stats.closed, icon: <CheckCircle sx={{ color: '#16a34a' }} />, bg: '#f0fdf4' },
        ].map((s) => (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={s.label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: s.bg, display: 'flex' }}>{s.icon}</Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">All Status</MenuItem>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Target Type</InputLabel>
            <Select label="Target Type" value={targetTypeFilter} onChange={(e) => setTargetTypeFilter(e.target.value)}>
              <MenuItem value="">All Types</MenuItem>
              {TARGET_TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Priority</InputLabel>
            <Select label="Priority" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <MenuItem value="">All Priorities</MenuItem>
              {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <Button size="small" onClick={() => { setStatusFilter(''); setTargetTypeFilter(''); setPriorityFilter(''); }}>Reset</Button>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Reporter</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Target</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Filed On</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No reports found.</TableCell></TableRow>
              ) : reports.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{fullName(r.reporter)}</TableCell>
                  <TableCell>
                    <Chip label={r.targetType} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                    <Typography component="span" variant="caption" sx={{ fontFamily: 'monospace' }}>{String(r.targetId).slice(0, 8)}…</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography variant="body2" noWrap title={r.details}>{r.customReason || r.reasonCode}</Typography>
                  </TableCell>
                  <TableCell><Chip label={r.priority} size="small" color={priorityColor[r.priority] || 'default'} /></TableCell>
                  <TableCell><Chip label={r.status.replace('_', ' ')} size="small" color={statusColor[r.status] || 'default'} /></TableCell>
                  <TableCell>{formatDate(r.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => { setSelected(r); setDetailOpen(true); }} title="View details">
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => openMenu(e, r)}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Row action menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={() => { setAssignOpen(true); closeMenu(); }}>Assign to moderator</MenuItem>
        <MenuItem onClick={() => { setEscalateOpen(true); closeMenu(); }}>Escalate</MenuItem>
        <MenuItem onClick={() => { handleResolve(selected); closeMenu(); }} disabled={actionLoading}>Mark resolved</MenuItem>
        <MenuItem onClick={() => { handleReject(selected); closeMenu(); }} disabled={actionLoading}>Reject</MenuItem>
      </Menu>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={1.5}>
              <Box><Typography variant="caption" color="text.secondary">Reporter</Typography><Typography>{fullName(selected.reporter)} ({selected.reporter?.email})</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Target</Typography><Typography>{selected.targetType} — {selected.targetId}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Reason</Typography><Typography>{selected.customReason || selected.reasonCode}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Details</Typography><Typography sx={{ whiteSpace: 'pre-wrap' }}>{selected.details}</Typography></Box>
              <Divider />
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box><Typography variant="caption" color="text.secondary">Priority</Typography><Box><Chip label={selected.priority} size="small" color={priorityColor[selected.priority] || 'default'} /></Box></Box>
                <Box><Typography variant="caption" color="text.secondary">Status</Typography><Box><Chip label={selected.status?.replace('_', ' ')} size="small" color={statusColor[selected.status] || 'default'} /></Box></Box>
              </Box>
              {selected.evidence?.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Evidence</Typography>
                  <Stack spacing={0.5}>
                    {selected.evidence.map((e: any) => (
                      <MuiLink key={e.id} href={e.fileUrl} target="_blank" rel="noreferrer" variant="body2">{e.type} attachment</MuiLink>
                    ))}
                  </Stack>
                </Box>
              )}
              {selected.case && (
                <Box><Typography variant="caption" color="text.secondary">Moderation Case</Typography><Typography>{selected.case.title}</Typography></Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Assign dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign to Moderator</DialogTitle>
        <DialogContent>
          {moderators.length > 0 ? (
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel>Moderator</InputLabel>
              <Select label="Moderator" value={assignId} onChange={(e) => setAssignId(e.target.value)}>
                {moderators.map((m) => (
                  <MenuItem key={m.id} value={m.id}>{fullName(m)} ({m.email})</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              fullWidth size="small" sx={{ mt: 1 }} label="Moderator User ID"
              value={assignId} onChange={(e) => setAssignId(e.target.value)}
              helperText="No admin users were found to list - paste a user id directly."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!assignId || actionLoading} onClick={handleAssignSubmit}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Escalate dialog */}
      <Dialog open={escalateOpen} onClose={() => setEscalateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Escalate Report</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth multiline rows={3} sx={{ mt: 1 }} label="Escalation note"
            value={escalateNote} onChange={(e) => setEscalateNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEscalateOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={!escalateNote.trim() || actionLoading} onClick={handleEscalateSubmit}>Escalate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
