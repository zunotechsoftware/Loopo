'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Grid,
  Avatar,
  IconButton,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox
} from '@mui/material';
import {
  ArrowBackIosNew,
  ArrowForwardIos,
  ZoomIn,
  ZoomOut,
  RotateRight,
  Download,
  Person,
  CalendarToday,
  Wc,
  Email,
  Phone,
  LocationOn,
  CheckCircle,
  Cancel,
  Upload,
  Warning,
  Security
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { kycService } from '@/services/admin.service';
import { KycDocument } from '@/types';

interface DocumentCardProps {
  title: string;
  imageUrl?: string;
  onDownload: () => void;
}

const DocumentPreviewCard = ({ title, imageUrl, onDownload }: DocumentCardProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', overflow: 'hidden', bgcolor: 'white', position: 'relative' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #f1f5f9' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
          📄 {title}
        </Typography>
      </Box>
      <Box sx={{ 
        height: 220, 
        bgcolor: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden',
        position: 'relative'
      }}>
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={title}
            sx={{
              maxHeight: '90%',
              maxWidth: '90%',
              objectFit: 'contain',
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
              borderRadius: 1
            }}
          />
        ) : (
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            No image uploaded
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', gap: 1, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
        <IconButton size="small" onClick={handleZoomIn} sx={{ color: '#64748b' }}>
          <ZoomIn fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleZoomOut} sx={{ color: '#64748b' }}>
          <ZoomOut fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleRotate} sx={{ color: '#64748b' }}>
          <RotateRight fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onDownload} sx={{ color: '#64748b' }}>
          <Download fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};

export default function KycDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [kyc, setKyc] = useState<KycDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  
  // Modals Open/Close States
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reuploadOpen, setReuploadOpen] = useState(false);

  // Reject Modal Form States
  const [rejectReason, setRejectReason] = useState('Document unclear');
  const [customRejectReason, setCustomRejectReason] = useState('');

  // Re-upload Modal Form States
  const [reuploadDocs, setReuploadDocs] = useState({
    frontSide: true,
    backSide: false,
    selfie: false
  });
  const [reuploadReason, setReuploadReason] = useState('Blurry / Low resolution');

  // Manual verification checklist - there is no real automated
  // document-verification integration, so every item starts (and stays,
  // unless an admin manually marks it via toggleChecklistItem) 'pending'.
  const [scannedItems, setScannedItems] = useState({
    nameMatched: 'pending',       // 'pending' | 'passed' | 'failed'
    dobMatched: 'pending',
    documentReadable: 'pending',
    selfieMatched: 'pending',
    duplicateKyc: 'pending'
  });

  const [verificationTimeline, setVerificationTimeline] = useState<Array<{ date: string; title: string; subtitle: string; iconColor: string }>>([]);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // 1. Fetching Details
  const fetchKycDetail = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await kycService.getById(id);
      const resData = res.data?.data;

      if (!resData) {
        setKyc(null);
        setFetchError('KYC application not found.');
        return;
      }
      const selectedKyc: KycDocument = resData;

      setKyc(selectedKyc);
      setRemarks(selectedKyc.remarks || '');

      // Build the Verification History timeline from the real timestamps
      // this record actually has (submittedAt/createdAt, approvedAt,
      // rejectedAt) - this used to hardcode a fixed fake date/time for
      // every single entry regardless of when anything actually happened
      // ("21 Aug 2026, 11:05 PM" for every application's "Under Review"
      // step, etc.), which an admin could mistake for a real audit trail.
      const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' + new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const submittedAt = selectedKyc.submittedAt || selectedKyc.createdAt;
      const initialTimeline = [
        {
          date: submittedAt ? fmt(submittedAt) : 'Not available',
          title: 'KYC Submitted by user',
          subtitle: 'Documents uploaded successfully.',
          iconColor: '#3b82f6'
        }
      ];

      if (selectedKyc.status === 'UNDER_REVIEW') {
        initialTimeline.push({
          date: fmt(selectedKyc.updatedAt),
          title: 'Under Review',
          subtitle: 'Review in progress.',
          iconColor: '#94a3b8'
        });
      } else if (selectedKyc.status === 'APPROVED') {
        initialTimeline.push({
          date: selectedKyc.approvedAt ? fmt(selectedKyc.approvedAt) : 'Not available',
          title: 'Verified & Approved by Admin',
          subtitle: 'Application approved.',
          iconColor: '#10b981'
        });
      } else if (selectedKyc.status === 'REJECTED') {
        initialTimeline.push({
          date: selectedKyc.rejectedAt ? fmt(selectedKyc.rejectedAt) : 'Not available',
          title: 'Rejected by Admin',
          subtitle: selectedKyc.remarks || 'No reason provided',
          iconColor: '#ef4444'
        });
      }

      // There is no real per-check (name/DOB/selfie match) verification
      // data anywhere in this system - no document-verification vendor is
      // integrated, and nothing persists which checks an admin looked at
      // before approving/rejecting. This used to synthesize a fixed
      // all-"passed" or all-"failed"-except-two pattern here for every
      // approved/rejected application, presenting fabricated per-check
      // verdicts as if they were the real basis for a past decision.
      // Leaving these at their honest 'pending' default and letting
      // toggleChecklistItem (below) be the only way any of them change is
      // the only truthful option without a real vendor integration.
      setScannedItems({
        nameMatched: 'pending',
        dobMatched: 'pending',
        documentReadable: 'pending',
        selfieMatched: 'pending',
        duplicateKyc: 'pending'
      });

      setVerificationTimeline(initialTimeline);

    } catch (err: any) {
      // Real error - do not fabricate a fake KYC record to review. An
      // admin approving/rejecting fake data (previously shown here as a
      // "local mockup") would have looked successful while never touching
      // the real applicant's actual record at all.
      console.error('Failed to load KYC application:', err);
      setKyc(null);
      setFetchError(err?.response?.data?.message || 'Could not load this KYC application. Is the backend reachable?');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKycDetail();
  }, [fetchKycDetail]);

  const handleDownload = (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      setSnackbar({ open: true, message: 'No file was uploaded for this document.', severity: 'error' });
      return;
    }

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApproveConfirm = async () => {
    setApproveOpen(false);
    if (!kyc) return;
    try {
      setLoading(true);
      await kycService.approve(kyc.id);
      // Re-fetch the real record instead of hand-editing local state, so
      // what's shown always matches what's actually in the database - this
      // also rebuilds the Verification History timeline from the real
      // approvedAt field, so no separate append is needed here.
      await fetchKycDetail();
      setSnackbar({ open: true, message: 'KYC Application approved successfully', severity: 'success' });
    } catch (err: any) {
      // A failed approval must look like a failure - silently pretending
      // it worked left the applicant's real record untouched while the
      // admin believed it had been approved.
      console.error('Failed to approve KYC application:', err);
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to approve this application. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    setRejectOpen(false);
    if (!kyc) return;
    const finalReason = rejectReason === 'Other' ? customRejectReason : rejectReason;
    if (!finalReason) {
      setSnackbar({ open: true, message: 'Please specify the rejection reason.', severity: 'error' });
      return;
    }
    try {
      setLoading(true);
      await kycService.reject(kyc.id, finalReason);
      // Rebuilds the timeline from the real rejectedAt field - see the
      // matching comment in handleApproveConfirm above.
      await fetchKycDetail();
      setSnackbar({ open: true, message: `KYC Application rejected. Reason: ${finalReason}`, severity: 'success' });
    } catch (err: any) {
      console.error('Failed to reject KYC application:', err);
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to reject this application. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReuploadConfirm = () => {
    setReuploadOpen(false);
    const docsStr = Object.entries(reuploadDocs)
      .filter(([_, checked]) => checked)
      .map(([name]) => name.replace('Side', ' Side'))
      .join(', ');

    if (!docsStr) {
      setSnackbar({ open: true, message: 'Please select at least one document to request re-upload.', severity: 'error' });
      return;
    }

    setSnackbar({ open: true, message: `Request sent for: ${docsStr}. Reason: ${reuploadReason}`, severity: 'success' });
    
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setVerificationTimeline(prev => [
      ...prev,
      { date: timeStr, title: 'Re-upload Requested', subtitle: `Requested: ${docsStr} (${reuploadReason})`, iconColor: '#8b5cf6' }
    ]);
  };

  const toggleChecklistItem = (item: keyof typeof scannedItems) => {
    setScannedItems(prev => ({
      ...prev,
      [item]: prev[item] === 'passed' ? 'failed' : 'passed'
    }));
  };

  const formatBirthDate = (dateStr?: string) => {
    // Real user profiles don't collect a date of birth anywhere in this
    // app yet - this used to fabricate a specific fake date ("15 Aug
    // 1995") whenever it was missing, on every single real application,
    // which an admin could easily mistake for real data while deciding
    // whether to approve/reject someone's actual identity documents.
    if (!dateStr) return 'Not provided';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && !kyc) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!loading && !kyc) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6" color="text.secondary">{fetchError || 'KYC application not found.'}</Typography>
        <Button variant="outlined" onClick={fetchKycDetail}>Retry</Button>
      </Box>
    );
  }

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

  const statusInfo = kyc ? getStatusChipColor(kyc.status) : { label: 'Pending', bg: '#fef3c7', text: '#d97706' };

  const getKycTypeLabel = () => {
    if (!kyc) return '—';
    return kyc.documentType.replace(/_/g, ' ');
  };

  const renderChecklistStatus = (itemState: string, successLabel: string, failLabel: string) => {
    if (itemState === 'scanning') {
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={12} sx={{ color: '#3b82f6' }} />
          <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 700 }}>Detecting...</Typography>
        </Stack>
      );
    }
    if (itemState === 'passed') {
      return (
        <Typography variant="body2" sx={{ color: '#059669', fontWeight: 700 }}>
          {successLabel} ✅
        </Typography>
      );
    }
    if (itemState === 'failed') {
      return (
        <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 700 }}>
          {failLabel} ❌
        </Typography>
      );
    }
    return (
      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
        Pending ⏳
      </Typography>
    );
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Header Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>KYC Details</Typography>
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
            <Link underline="hover" color="inherit" onClick={() => router.push('/dashboard')} sx={{ cursor: 'pointer' }}>
              Dashboard
            </Link>
            <Link underline="hover" color="inherit" onClick={() => router.push('/kyc')} sx={{ cursor: 'pointer' }}>
              KYC Verification
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 500 }}>KYC Details</Typography>
          </Breadcrumbs>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => router.push('/kyc')}
            startIcon={<ArrowBackIosNew sx={{ fontSize: '10px !important' }} />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#cbd5e1',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              bgcolor: 'white',
              px: 2,
              py: 0.8,
              '&:hover': {
                borderColor: '#94a3b8',
                bgcolor: '#f8fafc'
              }
            }}
          >
            Back to List
          </Button>
          <IconButton sx={{ border: '1px solid #cbd5e1', borderRadius: 2, bgcolor: 'white' }}>
            <ArrowBackIosNew sx={{ fontSize: 14, color: '#64748b' }} />
          </IconButton>
          <IconButton sx={{ border: '1px solid #cbd5e1', borderRadius: 2, bgcolor: 'white' }}>
            <ArrowForwardIos sx={{ fontSize: 14, color: '#64748b' }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Main Details Banner Card */}
      {kyc && (
        <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            {/* User Name, ID, Mobile/Email */}
            <Grid item xs={12} md={4.5} sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              {/* Profile Avatar: the real uploaded selfie, or an initial-letter
                  fallback - never a stock/mock photo standing in for a real
                  applicant's face. */}
              <Avatar
                src={kyc.selfieImage?.fileUrl || undefined}
                sx={{ width: 64, height: 64, border: '1px solid #e2e8f0' }}
              >
                {!kyc.selfieImage?.fileUrl && (kyc.user?.firstName?.[0] || '?')}
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {kyc.user?.firstName} {kyc.user?.lastName || ''}
                  </Typography>
                  <Chip
                    label="Individual"
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      height: 18,
                      bgcolor: '#d1fae5',
                      color: '#065f46',
                      borderRadius: 1
                    }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25, fontWeight: 500 }}>
                  User ID : {kyc.id}
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ mt: 0.75, color: '#64748b' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Phone sx={{ fontSize: 13, color: '#64748b' }} />
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>{kyc.user?.phone || 'Not provided'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Email sx={{ fontSize: 13, color: '#64748b' }} />
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>{kyc.user?.email}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* Banner Columns */}
            <Grid item xs={12} md={7.5}>
              <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                {/* 1. KYC Status */}
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>KYC Status</Typography>
                  <Chip
                    label={statusInfo.label.replace(/^[^\s]+\s+/, '')}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      bgcolor: statusInfo.bg,
                      color: statusInfo.text,
                      borderRadius: 1.5,
                      px: 1.5
                    }}
                  />
                </Box>

                {/* 2. KYC Type */}
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>KYC Type</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {getKycTypeLabel()}
                  </Typography>
                </Box>

                {/* 3. Submitted On */}
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>Submitted On</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {(() => {
                      const submitted = kyc.submittedAt || kyc.createdAt;
                      return submitted
                        ? new Date(submitted).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date(submitted).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : 'Not available';
                    })()}
                  </Typography>
                </Box>

                {/* 4. Under Review By */}
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>Under Review By</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 22, height: 22, bgcolor: '#0b1b42', fontSize: '0.65rem' }}>A</Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>Admin</Typography>
                  </Stack>
                </Box>

                {/* 5. Priority */}
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>Priority</Typography>
                  <Chip
                    label="Normal"
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      bgcolor: '#f3e8ff',
                      color: '#6b21a8',
                      borderRadius: 1.5,
                      px: 1.5
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Main Dual Column Layout (60% Document Preview, 40% User/Verification Info) */}
      {kyc && (
        <Grid container spacing={3}>
          {/* Document Preview (60%) */}
          <Grid item xs={12} md={7.2} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5 }}>Document Verification</Typography>
              <Grid container spacing={3}>
                {/* 1. Front side - the real uploaded document image only, never a
                     stock/mock fallback standing in for what the applicant
                     actually submitted. */}
                <Grid item xs={12} sm={6}>
                  <DocumentPreviewCard
                    title="Front side"
                    imageUrl={kyc.frontImage?.fileUrl}
                    onDownload={() => handleDownload(kyc.frontImage?.fileUrl || '', kyc.frontImage?.fileName || 'front_side.jpg')}
                  />
                </Grid>

                {/* 2. Back side (optional - not every document type has one) */}
                <Grid item xs={12} sm={6}>
                  <DocumentPreviewCard
                    title="Back side"
                    imageUrl={kyc.backImage?.fileUrl}
                    onDownload={() => handleDownload(kyc.backImage?.fileUrl || '', kyc.backImage?.fileName || 'back_side.jpg')}
                  />
                </Grid>

                {/* 3. Selfie */}
                <Grid item xs={12} sm={6}>
                  <DocumentPreviewCard
                    title="Selfie"
                    imageUrl={kyc.selfieImage?.fileUrl}
                    onDownload={() => handleDownload(kyc.selfieImage?.fileUrl || '', kyc.selfieImage?.fileName || 'selfie.jpg')}
                  />
                </Grid>
              </Grid>
            </Card>

            {/* Admin Remarks Input */}
            <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Admin Remarks</Typography>
              <TextField
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                placeholder="Add remarks (optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#f8fafc'
                  }
                }}
              />
            </Card>
          </Grid>

          {/* User/Verification Info & Actions (40%) */}
          <Grid item xs={12} md={4.8} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Identity Information */}
            <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Identity Information</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#f1f5f9', color: '#64748b' }}>
                    <Person fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>FULL NAME</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      {kyc.user?.firstName} {kyc.user?.lastName}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#f1f5f9', color: '#64748b' }}>
                    <CalendarToday fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>DATE OF BIRTH</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      {formatBirthDate(kyc.user?.profile?.dateOfBirth)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#f1f5f9', color: '#64748b' }}>
                    <Wc fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>GENDER</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      {kyc.user?.profile?.gender || 'Not provided'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#f1f5f9', color: '#64748b' }}>
                    <LocationOn fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>ADDRESS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', lineHeight: 1.4 }}>
                      {kyc.user?.profile?.city
                        ? `${kyc.user.profile.city}, ${kyc.user.profile.state || ''} ${kyc.user.profile.zipCode || ''}`.trim()
                        : 'Not provided'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#f1f5f9', color: '#64748b' }}>
                    <Security fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>DOCUMENT TYPE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      {getKycTypeLabel()}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#f1f5f9', color: '#64748b' }}>
                    <Security fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>DOCUMENT NUMBER</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      {kyc.documentNumber}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Card>

            {/* Verification Information Checklist */}
            <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Verification Information</Typography>
              <Stack spacing={1.5}>
                {/* 1. Name Matched */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>Name matched</Typography>
                  <IconButton 
                    size="small"
                    onClick={() => toggleChecklistItem('nameMatched')}
                    sx={{ p: 0.5 }}
                  >
                    {renderChecklistStatus(scannedItems.nameMatched, 'Matched', 'Unmatched')}
                  </IconButton>
                </Box>

                {/* 2. DOB Matched */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>DOB matched</Typography>
                  <IconButton 
                    size="small"
                    onClick={() => toggleChecklistItem('dobMatched')}
                    sx={{ p: 0.5 }}
                  >
                    {renderChecklistStatus(scannedItems.dobMatched, 'Matched', 'Unmatched')}
                  </IconButton>
                </Box>

                {/* 3. Document Readable */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>Document readable</Typography>
                  <IconButton 
                    size="small"
                    onClick={() => toggleChecklistItem('documentReadable')}
                    sx={{ p: 0.5 }}
                  >
                    {renderChecklistStatus(scannedItems.documentReadable, 'Readable', 'Unreadable')}
                  </IconButton>
                </Box>

                {/* 4. Selfie Matched */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>Selfie matched</Typography>
                  <IconButton 
                    size="small"
                    onClick={() => toggleChecklistItem('selfieMatched')}
                    sx={{ p: 0.5 }}
                  >
                    {renderChecklistStatus(scannedItems.selfieMatched, 'Matched', 'Unmatched')}
                  </IconButton>
                </Box>

                {/* 5. Duplicate KYC */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>Duplicate KYC</Typography>
                  <IconButton 
                    size="small"
                    onClick={() => toggleChecklistItem('duplicateKyc')}
                    sx={{ p: 0.5 }}
                  >
                    {renderChecklistStatus(scannedItems.duplicateKyc, 'No Duplicate', 'Duplicate')}
                  </IconButton>
                </Box>
              </Stack>
            </Card>

            {/* Verification History Timeline */}
            <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5 }}>Verification History</Typography>
              <Box sx={{ position: 'relative', pl: 3.5, '&:before': { content: '""', position: 'absolute', left: 8, top: 4, bottom: 4, width: 2, bgcolor: '#cbd5e1' } }}>
                {verificationTimeline.map((item, idx) => (
                  <Box key={idx} sx={{ mb: idx === verificationTimeline.length - 1 ? 0 : 3, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: -26, top: 2, width: 12, height: 12, borderRadius: '50%', bgcolor: item.iconColor, border: '2px solid white' }} />
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>{item.date}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.5 }}>{item.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25 }}>{item.subtitle}</Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            {/* Action Buttons */}
            <Stack direction="column" spacing={2} sx={{ mt: 1, width: '100%' }}>
              <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setReuploadOpen(true)}
                  startIcon={<Upload />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 3,
                    borderColor: '#8b5cf6',
                    color: '#8b5cf6',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    py: 1.2,
                    '&:hover': {
                      bgcolor: '#f5f3ff',
                      borderColor: '#7c3aed'
                    }
                  }}
                >
                  Request Re-upload
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={() => setRejectOpen(true)}
                  startIcon={<Cancel />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 3,
                    borderColor: '#f43f5e',
                    color: '#f43f5e',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    py: 1.2,
                    '&:hover': {
                      bgcolor: '#fff1f2',
                      borderColor: '#e11d48'
                    }
                  }}
                >
                  Reject KYC
                </Button>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                onClick={() => setApproveOpen(true)}
                startIcon={<CheckCircle />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 3,
                  bgcolor: '#10b981',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  py: 1.4,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#059669',
                    boxShadow: 'none'
                  }
                }}
              >
                Approve KYC
              </Button>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* APPROVE KYC MODAL */}
      <Dialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, p: 1, maxWidth: 440 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#10b981', fontWeight: 800 }}>
          <CheckCircle sx={{ fontSize: 28 }} /> Approve KYC Application
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569', fontWeight: 500 }}>
            Are you sure you want to approve this KYC application? This will verify the user's identity and award them the verified badge status.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setApproveOpen(false)}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2.5, px: 2.5, borderColor: '#cbd5e1', color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApproveConfirm}
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: 2.5, px: 3, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
          >
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* REJECT KYC MODAL */}
      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, p: 1, width: '100%', maxWidth: 480 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#ef4444', fontWeight: 800 }}>
          <Warning sx={{ fontSize: 28 }} /> Reject KYC Application
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <DialogContentText sx={{ color: '#475569', fontWeight: 500 }}>
            Please select the reason for rejecting this KYC application:
          </DialogContentText>

          <FormControl>
            <RadioGroup
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              sx={{ gap: 0.5 }}
            >
              <FormControlLabel value="Document unclear" control={<Radio size="small" />} label="Document unclear" />
              <FormControlLabel value="Name mismatch" control={<Radio size="small" />} label="Name mismatch" />
              <FormControlLabel value="DOB mismatch" control={<Radio size="small" />} label="DOB mismatch" />
              <FormControlLabel value="Invalid document" control={<Radio size="small" />} label="Invalid document" />
              <FormControlLabel value="Expired document" control={<Radio size="small" />} label="Expired document" />
              <FormControlLabel value="Selfie mismatch" control={<Radio size="small" />} label="Selfie mismatch" />
              <FormControlLabel value="Other" control={<Radio size="small" />} label="Other (specify reason below)" />
            </RadioGroup>
          </FormControl>

          {rejectReason === 'Other' && (
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              placeholder="Enter custom rejection reason"
              value={customRejectReason}
              onChange={(e) => setCustomRejectReason(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setRejectOpen(false)}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2.5, px: 2.5, borderColor: '#cbd5e1', color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', borderRadius: 2.5, px: 3, bgcolor: '#f43f5e', '&:hover': { bgcolor: '#e11d48' } }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      {/* REQUEST RE-UPLOAD MODAL */}
      <Dialog
        open={reuploadOpen}
        onClose={() => setReuploadOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, p: 1, width: '100%', maxWidth: 480 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#8b5cf6', fontWeight: 800 }}>
          <Upload sx={{ fontSize: 28 }} /> Request Document Re-upload
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <DialogContentText sx={{ color: '#475569', fontWeight: 500 }}>
            Select which documents the user needs to re-upload and specify the reason:
          </DialogContentText>

          {/* Document selection */}
          <Box>
            <FormLabel sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', display: 'block', mb: 1 }}>SELECT DOCUMENTS</FormLabel>
            <FormGroup row sx={{ gap: 2 }}>
              <FormControlLabel
                control={<Checkbox size="small" checked={reuploadDocs.frontSide} onChange={(e) => setReuploadDocs(prev => ({ ...prev, frontSide: e.target.checked }))} />}
                label="Front Side"
              />
              <FormControlLabel
                control={<Checkbox size="small" checked={reuploadDocs.backSide} onChange={(e) => setReuploadDocs(prev => ({ ...prev, backSide: e.target.checked }))} />}
                label="Back Side"
              />
              <FormControlLabel
                control={<Checkbox size="small" checked={reuploadDocs.selfie} onChange={(e) => setReuploadDocs(prev => ({ ...prev, selfie: e.target.checked }))} />}
                label="Selfie"
              />
            </FormGroup>
          </Box>

          {/* Reason selection */}
          <Box>
            <FormLabel sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', display: 'block', mb: 1 }}>REASON FOR RE-UPLOAD</FormLabel>
            <FormControl>
              <RadioGroup
                value={reuploadReason}
                onChange={(e) => setReuploadReason(e.target.value)}
                sx={{ gap: 0.5 }}
              >
                <FormControlLabel value="Blurry / Low resolution" control={<Radio size="small" />} label="Blurry / Low resolution" />
                <FormControlLabel value="Text cut off / missing" control={<Radio size="small" />} label="Text cut off / missing" />
                <FormControlLabel value="Wrong document uploaded" control={<Radio size="small" />} label="Wrong document uploaded" />
                <FormControlLabel value="Other" control={<Radio size="small" />} label="Other" />
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setReuploadOpen(false)}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2.5, px: 2.5, borderColor: '#cbd5e1', color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReuploadConfirm}
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: 2.5, px: 3, bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
