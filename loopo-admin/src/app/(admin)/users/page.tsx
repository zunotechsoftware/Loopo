'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  Pagination,
  Tooltip,
  Divider,
  Skeleton,
  Alert,
  Menu,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  PersonAdd,
  Visibility,
  Edit,
  MoreVert,
  TrendingUp,
  People,
  CheckCircle,
  Block,
  VerifiedUser,
  LocationOn,
  FilterList,
  RestartAlt,
  Refresh,
} from '@mui/icons-material';
import { usersService } from '@/services/admin.service';
import { AdminUser } from '@/types';
import UserDialog from './UserDialog';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map Prisma UserStatus enum → display label */
function statusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    BLOCKED: 'Blocked',
    DELETED: 'Deleted',
    PENDING_VERIFICATION: 'Pending',
  };
  return map[status] ?? status;
}

/** Map role name from DB → display label */
function getRoleName(user: AdminUser): string {
  const roleNames = user.roles?.map((r) => r.role.name) ?? [];
  if (roleNames.includes('SUPER_ADMIN')) return 'Super Admin';
  if (roleNames.includes('ADMIN')) return 'Admin';
  return 'User';
}

/** Format an ISO date string as "12 May 2024\n10:30 AM" */
function fmtDate(iso?: string | null): string[] {
  if (!iso) return ['—', ''];
  const d = new Date(iso);
  return [
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  ];
}

/** Get initials for avatar fallback */
function initials(user: AdminUser): string {
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
}

/** Get user location from profile */
function getLocation(user: AdminUser): string {
  const p = user.profile;
  if (!p) return '—';
  return [p.city, p.state].filter(Boolean).join(', ') || '—';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const label = statusLabel(status);
  const map: Record<string, { bg: string; color: string; dot: string }> = {
    Active:    { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
    Suspended: { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
    Blocked:   { bg: '#fff1f2', color: '#b91c1c', dot: '#ef4444' },
    Pending:   { bg: '#f0f9ff', color: '#0369a1', dot: '#38bdf8' },
    Deleted:   { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
  };
  const s = map[label] ?? map['Pending'];
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: 1.2, py: 0.3, borderRadius: 10, bgcolor: s.bg,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: s.color, lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}

function RoleChip({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Super Admin': { bg: '#fef2f2', color: '#991b1b' },
    Admin:         { bg: '#fff7ed', color: '#c2410c' },
    User:          { bg: '#eff6ff', color: '#1d4ed8' },
  };
  const s = map[role] ?? { bg: '#f1f5f9', color: '#475569' };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1.2, py: 0.3, borderRadius: 10, bgcolor: s.bg }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: s.color, lineHeight: 1 }}>
        {role}
      </Typography>
    </Box>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell padding="checkbox" sx={{ pl: 2.5 }}><Skeleton variant="rectangular" width={16} height={16} /></TableCell>
      {[160, 180, 150, 70, 90, 100, 100, 80].map((w, i) => (
        <TableCell key={i} sx={{ py: 1.4 }}>
          {i === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Skeleton variant="circular" width={34} height={34} />
              <Box>
                <Skeleton variant="text" width={100} height={14} />
                <Skeleton variant="text" width={60} height={11} />
              </Box>
            </Box>
          ) : (
            <Skeleton variant="text" width={w} height={14} />
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const ROLE_OPTIONS = [
  { label: 'All Roles', value: '' },
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
  { label: 'Admin',     value: 'ADMIN' },
  { label: 'User',      value: 'USER' },
];

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Active',     value: 'ACTIVE' },
  { label: 'Suspended',  value: 'SUSPENDED' },
  { label: 'Blocked',    value: 'BLOCKED' },
  { label: 'Pending',    value: 'PENDING_VERIFICATION' },
];

export default function UsersPage() {
  // ── Filters ────────────────────────────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize]       = useState(10);
  const [page, setPage]               = useState(1);

  // ── Data ───────────────────────────────────────────────────────────────────
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Selection ──────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<string[]>([]);

  // ── Actions menu ──────────────────────────────────────────────────────────
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser]     = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Dialog State ───────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogUser, setDialogUser] = useState<AdminUser | null>(null);

  // ── Stat counts ───────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ total: 0, active: 0, verified: 0, blocked: 0 });

  // ── Debounce search ────────────────────────────────────────────────────────
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 400);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [search]);

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        skip: (page - 1) * pageSize,
        take: pageSize,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter)      params.role   = roleFilter;
      if (statusFilter)    params.status = statusFilter;

      const res = await usersService.getAll(params);
      const resData = res.data;

      // Backend returns `{ success, message, data: { data: [...], total } }` due to interceptor
      const payload = resData?.data;

      if (Array.isArray(payload)) {
        setUsers(payload);
        setTotal(payload.length < pageSize ? (page - 1) * pageSize + payload.length : (page - 1) * pageSize + payload.length + 1);
      } else if (payload?.data && Array.isArray(payload.data)) {
        setUsers(payload.data);
        setTotal(payload.total ?? payload.data.length);
      } else {
        setUsers([]);
        setTotal(0);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch users';
      setError(msg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, roleFilter, statusFilter]);

  // ── Fetch stat totals (all users) ──────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const [allRes, activeRes, blockedRes] = await Promise.all([
        usersService.getAll({ skip: 0, take: 1 }),
        usersService.getAll({ skip: 0, take: 1, status: 'ACTIVE' }),
        usersService.getAll({ skip: 0, take: 1, status: 'BLOCKED' }),
      ]);
      const getTotal = (r: any) => {
        const d = r.data;
        if (d?.total) return d.total;
        if (Array.isArray(d)) return d.length;
        return 0;
      };
      setStats({
        total:   getTotal(allRes),
        active:  getTotal(activeRes),
        verified: 0,
        blocked: getTotal(blockedRes),
      });
    } catch { /* stats are best-effort */ }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allSelected = users.length > 0 && users.every((u) => selected.includes(u.id));
  const toggleAll = () => setSelected(allSelected ? [] : users.map((u) => u.id));
  const toggleRow = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleReset = () => {
    setSearch(''); setDebounced('');
    setRoleFilter(''); setStatusFilter('');
    setPage(1);
  };

  const handleFilterChange = (setter: (v: string) => void) => (e: any) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleAction = async (action: 'suspend' | 'activate' | 'block' | 'delete') => {
    if (!menuUser) return;
    
    // For delete, add a simple confirmation
    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${menuUser.firstName} ${menuUser.lastName}?`)) {
        setMenuAnchor(null);
        return;
      }
    }
    
    setActionLoading(true);
    try {
      if (action === 'suspend') await usersService.suspend(menuUser.id);
      if (action === 'activate') await usersService.activate(menuUser.id);
      if (action === 'block') await usersService.block(menuUser.id);
      if (action === 'delete') await usersService.delete(menuUser.id);
      setMenuAnchor(null);
      setMenuUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDialog = (user?: AdminUser) => {
    setDialogUser(user || null);
    setDialogOpen(true);
  };

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const STAT_CARDS = [
    {
      label: 'Total Users', value: stats.total || total,
      change: '+12.5%', changeLabel: 'from last week', positive: true,
      icon: <People sx={{ fontSize: 28, color: '#3b82f6' }} />, iconBg: '#eff6ff',
    },
    {
      label: 'Active Users', value: stats.active,
      change: '+10.8%', changeLabel: 'from last week', positive: true,
      icon: <CheckCircle sx={{ fontSize: 28, color: '#10b981' }} />, iconBg: '#f0fdf4',
    },
    {
      label: 'Verified Users', value: stats.verified,
      change: '+8.7%', changeLabel: 'from last week', positive: true,
      icon: <VerifiedUser sx={{ fontSize: 28, color: '#8b5cf6' }} />, iconBg: '#f5f3ff',
    },
    {
      label: 'Blocked Users', value: stats.blocked,
      change: '+2.1%', changeLabel: 'from last week', positive: false,
      icon: <Block sx={{ fontSize: 28, color: '#ef4444' }} />, iconBg: '#fff1f2',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Page Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>Users</Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
          Manage all registered users on the platform
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          action={
            <Button size="small" startIcon={<Refresh />} onClick={fetchUsers}>
              Retry
            </Button>
          }
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
        {STAT_CARDS.map((card) => (
          <Card key={card.label} sx={{
            p: 2.5, border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderRadius: 2.5,
            display: 'flex', flexDirection: 'column', gap: 1.5,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, mb: 0.5 }}>
                  {card.label}
                </Typography>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                  {card.value.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{
                width: 48, height: 48, borderRadius: 2, bgcolor: card.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {card.icon}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 14, color: card.positive ? '#10b981' : '#ef4444' }} />
              <Typography sx={{ fontSize: '0.73rem', fontWeight: 600, color: card.positive ? '#10b981' : '#ef4444' }}>
                {card.change}
              </Typography>
              <Typography sx={{ fontSize: '0.73rem', color: '#94a3b8' }}>{card.changeLabel}</Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Table Card */}
      <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderRadius: 2.5, overflow: 'hidden' }}>
        {/* Filter Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, email or mobile number..."
            variant="outlined" size="small"
            sx={{
              flex: '1 1 260px', minWidth: 220,
              '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem', bgcolor: '#f8fafc' },
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={roleFilter} onChange={handleFilterChange(setRoleFilter)} displayEmpty
              renderValue={(selected) => {
                const opt = ROLE_OPTIONS.find(o => o.value === selected);
                return opt ? opt.label : 'All Roles';
              }}
              sx={{ borderRadius: 2, fontSize: '0.82rem', bgcolor: '#f8fafc' }}>
              {ROLE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.82rem' }}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={statusFilter} onChange={handleFilterChange(setStatusFilter)} displayEmpty
              renderValue={(selected) => {
                const opt = STATUS_OPTIONS.find(o => o.value === selected);
                return opt ? opt.label : 'All Status';
              }}
              sx={{ borderRadius: 2, fontSize: '0.82rem', bgcolor: '#f8fafc' }}>
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.82rem' }}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined" size="small"
            startIcon={<FilterList sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 2, fontSize: '0.8rem', fontWeight: 500, color: '#475569',
              borderColor: '#e2e8f0', px: 1.5, whiteSpace: 'nowrap',
              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
            }}
          >
            More Filters
          </Button>
          <Button
            variant="text" size="small"
            startIcon={<RestartAlt sx={{ fontSize: 16 }} />}
            onClick={handleReset}
            sx={{ borderRadius: 2, fontSize: '0.8rem', fontWeight: 500, color: '#64748b', px: 1.5, '&:hover': { bgcolor: '#f1f5f9' } }}
          >
            Reset
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained" size="small"
            startIcon={<PersonAdd sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 2, fontSize: '0.8rem', fontWeight: 600, bgcolor: '#2563eb',
              px: 2, py: 0.9, whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
            onClick={() => handleOpenDialog()}
          >
            + Add User
          </Button>
        </Box>

        <Divider sx={{ borderColor: '#f1f5f9' }} />

        <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
            Users List
          </Typography>
          {loading && <CircularProgress size={14} thickness={5} sx={{ color: '#2563eb' }} />}
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                  <Checkbox
                    size="small" checked={allSelected}
                    indeterminate={selected.length > 0 && !allSelected}
                    onChange={toggleAll}
                    sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#2563eb' } }}
                  />
                </TableCell>
                {['User', 'Mobile / Email', 'Location', 'Role', 'Status', 'Joined Date', 'Last Login', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#475569', py: 1.2, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 6, textAlign: 'center' }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, idx) => {
                  const role = getRoleName(user);
                  const joinedParts = fmtDate(user.createdAt);
                  const loginParts  = fmtDate(user.lastLoginAt);
                  const location    = getLocation(user);
                  const avatarSrc   = user.profile?.avatarUrl ?? undefined;

                  return (
                    <TableRow
                      key={user.id}
                      hover
                      selected={selected.includes(user.id)}
                      sx={{
                        bgcolor: idx % 2 === 0 ? 'white' : '#fafafa',
                        '&:hover': { bgcolor: '#eff6ff !important' },
                        '&.Mui-selected': { bgcolor: '#eff6ff' },
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                        <Checkbox
                          size="small" checked={selected.includes(user.id)}
                          onChange={() => toggleRow(user.id)}
                          sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#2563eb' } }}
                        />
                      </TableCell>

                      {/* User */}
                      <TableCell sx={{ py: 1.2, minWidth: 160 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar src={avatarSrc} sx={{ width: 34, height: 34, flexShrink: 0, bgcolor: '#e0e7ff', color: '#4f46e5', fontSize: '0.75rem', fontWeight: 700 }}>
                            {!avatarSrc && initials(user)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.2 }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Mobile / Email */}
                      <TableCell sx={{ py: 1.2, minWidth: 180 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#0f172a', lineHeight: 1.3 }}>
                          {user.phone ?? user.profile?.phone ?? '—'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.3 }}>
                          {user.email}
                        </Typography>
                      </TableCell>

                      {/* Location */}
                      <TableCell sx={{ py: 1.2, minWidth: 150 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <LocationOn sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>{location}</Typography>
                        </Box>
                      </TableCell>

                      {/* Role */}
                      <TableCell sx={{ py: 1.2 }}>
                        <RoleChip role={role} />
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ py: 1.2 }}>
                        <StatusChip status={user.status} />
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell sx={{ py: 1.2, minWidth: 100 }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.3 }}>{joinedParts[0]}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.3 }}>{joinedParts[1]}</Typography>
                      </TableCell>

                      {/* Last Login */}
                      <TableCell sx={{ py: 1.2, minWidth: 100 }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.3 }}>{loginParts[0]}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.3 }}>{loginParts[1]}</Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={{ py: 1.2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" sx={{ color: '#64748b', '&:hover': { color: '#2563eb', bgcolor: '#eff6ff' } }}>
                              <Visibility sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton size="small" sx={{ color: '#64748b', '&:hover': { color: '#10b981', bgcolor: '#f0fdf4' } }}
                                        onClick={() => handleOpenDialog(user)}>
                              <Edit sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              sx={{ color: '#64748b', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' } }}
                              onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuUser(user); }}
                            >
                              <MoreVert sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.5, py: 1.5, borderTop: '1px solid #f1f5f9',
        }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
            Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total.toLocaleString()} users
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Pagination
              count={totalPages} page={page}
              onChange={(_, v) => setPage(v)}
              size="small" siblingCount={1} boundaryCount={1} shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': { fontSize: '0.78rem', color: '#475569', minWidth: 28, height: 28 },
                '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#2563eb', color: 'white', fontWeight: 600 },
              }}
            />
            <FormControl size="small">
              <Select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                sx={{ fontSize: '0.78rem', borderRadius: 1.5, '& .MuiSelect-select': { py: 0.5, px: 1 } }}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <MenuItem key={n} value={n} sx={{ fontSize: '0.78rem' }}>{n} / page</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setMenuUser(null); }}
        slotProps={{ paper: { sx: { boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 2, minWidth: 160 } } }}
      >
        <MenuItem
          onClick={() => handleAction('activate')}
          disabled={actionLoading || menuUser?.status === 'ACTIVE'}
          sx={{ fontSize: '0.82rem', gap: 1, color: '#15803d' }}
        >
          <CheckCircle sx={{ fontSize: 16 }} /> Activate
        </MenuItem>
        <MenuItem
          onClick={() => handleAction('suspend')}
          disabled={actionLoading || menuUser?.status === 'SUSPENDED'}
          sx={{ fontSize: '0.82rem', gap: 1, color: '#b45309' }}
        >
          <Block sx={{ fontSize: 16 }} /> Suspend
        </MenuItem>
        <MenuItem
          onClick={() => handleAction('block')}
          disabled={actionLoading || menuUser?.status === 'BLOCKED'}
          sx={{ fontSize: '0.82rem', gap: 1, color: '#b91c1c' }}
        >
          <Block sx={{ fontSize: 16 }} /> Block
        </MenuItem>
        <MenuItem
          onClick={() => handleAction('delete')}
          disabled={actionLoading}
          sx={{ fontSize: '0.82rem', gap: 1, color: '#b91c1c', borderTop: '1px solid #f1f5f9', mt: 1, pt: 1 }}
        >
          <Block sx={{ fontSize: 16 }} /> Delete User
        </MenuItem>
      </Menu>

      {/* User Dialog (Add/Edit) */}
      <UserDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        onSaved={fetchUsers} 
        user={dialogUser} 
      />
    </Box>
  );
}


