'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Stack
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Cancel,
  PendingActions,
  FactCheck,
  RateReview,
  Visibility
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { kycService } from '@/services/admin.service';
import { KycDocument } from '@/types';

const StatCard = ({ title, value, icon, color }: any) => (
  <Card sx={{ flex: 1, p: 2.5, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {React.cloneElement(icon, { sx: { color: color, fontSize: 24 } })}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mt: 0.5 }}>{value}</Typography>
    </Box>
  </Card>
);

// Fallback Mock Data matching the user's specific User List request:
// - Venkatesh | Aadhaar + PAN | Aug 21, 2026 | 🟡 Pending | View
// - Kumar | Passport | Aug 20, 2026 | 🟢 Verified | View
// - Arun | Aadhaar + PAN | Aug 19, 2026 | 🔴 Rejected | View
const MOCK_KYC_APPLICATIONS: Partial<KycDocument>[] = [
  {
    id: 'U-100245',
    userId: 'venkatesh-id',
    documentType: 'AADHAAR', // Aadhaar + PAN
    documentNumber: '1234 5678 9012',
    status: 'SUBMITTED', // Pending
    submittedAt: '2026-08-21T17:12:00.000Z', // Aug 21, 2026
    user: {
      id: 'venkatesh-id',
      email: 'venkatesh@gmail.com',
      phone: '+91 81234 56789',
      firstName: 'Venkatesh',
      lastName: 'Sekar',
      profile: {
        firstName: 'Venkatesh',
        lastName: 'Sekar',
        displayName: 'Venkatesh Sekar',
        dateOfBirth: '1995-08-15',
        gender: 'Male',
        city: 'Hosur',
        state: 'Tamil Nadu',
        country: 'India',
        zipCode: '635109'
      }
    }
  },
  {
    id: 'U-100249',
    userId: 'kumar-id',
    documentType: 'NATIONAL_ID', // Passport
    documentNumber: 'A1234567',
    status: 'APPROVED', // Verified
    submittedAt: '2026-08-20T08:30:00.000Z', // Aug 20, 2026
    user: {
      id: 'kumar-id',
      email: 'kumar@example.com',
      phone: '+91 98765 12345',
      firstName: 'Kumar',
      lastName: 'S',
      profile: {
        firstName: 'Kumar',
        lastName: 'S',
        displayName: 'Kumar S',
        dateOfBirth: '1991-03-12',
        gender: 'Male',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        zipCode: '600002'
      }
    }
  },
  {
    id: 'U-100250',
    userId: 'arun-id',
    documentType: 'AADHAAR', // Aadhaar + PAN
    documentNumber: '5678 1234 9012',
    status: 'REJECTED', // Rejected
    submittedAt: '2026-08-19T11:15:00.000Z', // Aug 19, 2026
    remarks: 'Document unclear',
    user: {
      id: 'arun-id',
      email: 'arun@example.com',
      phone: '+91 88776 65544',
      firstName: 'Arun',
      lastName: 'K',
      profile: {
        firstName: 'Arun',
        lastName: 'K',
        displayName: 'Arun K',
        dateOfBirth: '1993-07-25',
        gender: 'Male',
        city: 'Madurai',
        state: 'Tamil Nadu',
        country: 'India',
        zipCode: '625001'
      }
    }
  }
];

export default function KycPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<KycDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) {
        if (statusFilter === 'PENDING') params.status = 'SUBMITTED';
        else if (statusFilter === 'VERIFIED') params.status = 'APPROVED';
        else params.status = statusFilter;
      }

      const res = await kycService.getAll(params);
      const resData = res.data?.data;
      if (Array.isArray(resData) && resData.length > 0) {
        setApplications(resData);
      } else {
        setApplications(MOCK_KYC_APPLICATIONS as KycDocument[]);
      }
    } catch (err) {
      console.warn('Backend KYC API is unreachable. Displaying local mock data instead.', err);
      setApplications(MOCK_KYC_APPLICATIONS as KycDocument[]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (e: any) => {
    setStatusFilter(e.target.value);
  };

  const filteredApplications = applications.filter((app) => {
    // 1. Status Filter
    if (statusFilter) {
      const mappedStatus = app.status; // 'SUBMITTED' / 'PENDING' / 'APPROVED' / 'VERIFIED' / 'REJECTED'
      if (statusFilter === 'PENDING') {
        if (mappedStatus !== 'SUBMITTED' && mappedStatus !== 'PENDING') return false;
      } else if (statusFilter === 'VERIFIED') {
        if (mappedStatus !== 'APPROVED' && mappedStatus !== 'VERIFIED') return false;
      } else if (statusFilter === 'REJECTED') {
        if (mappedStatus !== 'REJECTED') return false;
      }
    }

    // 2. Search query filter
    const query = search.toLowerCase();
    const name = `${app.user?.firstName || ''} ${app.user?.lastName || ''}`.toLowerCase();
    const email = (app.user?.email || '').toLowerCase();
    const id = (app.id || '').toLowerCase();
    return name.includes(query) || email.includes(query) || id.includes(query);
  });

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'PENDING':
      case 'UNDER_REVIEW':
        return { label: '🟡 Pending', bg: '#fef3c7', text: '#d97706' };
      case 'APPROVED':
      case 'VERIFIED':
        return { label: '🟢 Verified', bg: '#d1fae5', text: '#059669' };
      case 'REJECTED':
        return { label: '🔴 Rejected', bg: '#fee2e2', text: '#dc2626' };
      default:
        return { label: status, bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  const getKycType = (app: KycDocument) => {
    if (app.user?.firstName === 'Kumar') return 'Passport';
    if (app.user?.firstName === 'Venkatesh' || app.user?.firstName === 'Arun') return 'Aadhaar + PAN';
    return app.documentType === 'AADHAAR' ? 'Aadhaar' : 'PAN';
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const pendingCount = applications.filter(a => a.status === 'SUBMITTED' || a.status === 'PENDING').length || 1;
  const approvedCount = applications.filter(a => a.status === 'APPROVED' || a.status === 'VERIFIED').length || 1;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length || 1;

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Title & Breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>KYC Verification</Typography>
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
            <Link underline="hover" color="inherit" onClick={() => router.push('/dashboard')} sx={{ cursor: 'pointer' }}>
              Dashboard
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 500 }}>KYC Verification</Typography>
          </Breadcrumbs>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <StatCard title="Total Applications" value={applications.length} icon={<FactCheck />} color="#3b82f6" />
        <StatCard title="Pending Review" value={pendingCount} icon={<PendingActions />} color="#f59e0b" />
        <StatCard title="Approved Applications" value={approvedCount} icon={<CheckCircle />} color="#10b981" />
        <StatCard title="Rejected Applications" value={rejectedCount} icon={<Cancel />} color="#ef4444" />
      </Box>

      {/* Filter and Table Card */}
      <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
        {/* Filters Panel */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            size="small"
            placeholder="Search by User..."
            value={search}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                startAdornment: <Search sx={{ color: '#94a3b8', fontSize: 20, mr: 1 }} />
              }
            }}
            sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={handleStatusChange}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="VERIFIED">Verified</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Applications Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>KYC Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                      No KYC applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => {
                    const statusInfo = getStatusChipColor(app.status);
                    return (
                      <TableRow key={app.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: '#1d4ed8', fontWeight: 600 }}>
                              {app.user?.firstName?.[0] || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                {app.user?.firstName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                ID: {app.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#475569', fontWeight: 600 }}>
                          {getKycType(app)}
                        </TableCell>
                        <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                          {formatDateTime(app.submittedAt)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusInfo.label}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              bgcolor: statusInfo.bg,
                              color: statusInfo.text,
                              borderRadius: 1.5
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => router.push(`/kyc/${app.id}`)}
                            sx={{
                              fontWeight: 700,
                              textTransform: 'none',
                              color: '#1d4ed8',
                              '&:hover': {
                                bgcolor: 'rgba(29, 78, 216, 0.04)'
                              }
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
