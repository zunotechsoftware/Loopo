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
  Security,
  Autorenew,
  DoneAll
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { kycService } from '@/services/admin.service';
import { KycDocument } from '@/types';

// Dynamic fallback mock data matching the list exactly
const MOCK_KYC_DETAILS: Record<string, Partial<KycDocument>> = {
  'U-100245': {
    id: 'U-100245',
    userId: 'venkatesh-id',
    documentType: 'AADHAAR', // Aadhaar + PAN
    documentNumber: '1234 5678 9012',
    status: 'SUBMITTED',
    submittedAt: '2026-08-21T17:12:00.000Z', // Aug 21, 2026
    remarks: '',
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
        dateOfBirth: '1995-08-15T00:00:00.000Z',
        gender: 'Male',
        city: 'Hosur',
        state: 'Tamil Nadu',
        country: 'India',
        zipCode: '635109'
      }
    },
    frontImage: { id: 'img-aadhaar-front', fileUrl: '/images/aadhaar_front.jpg', fileName: 'aadhaar_front.jpg', fileSize: 624929, mimeType: 'image/jpeg' },
    backImage: { id: 'img-aadhaar-back', fileUrl: '/images/aadhaar_back.jpg', fileName: 'aadhaar_back.jpg', fileSize: 670382, mimeType: 'image/jpeg' },
    selfieImage: { id: 'img-selfie', fileUrl: '/images/selfie.jpg', fileName: 'selfie.jpg', fileSize: 680605, mimeType: 'image/jpeg' }
  },
  'U-100249': {
    id: 'U-100249',
    userId: 'kumar-id',
    documentType: 'NATIONAL_ID', // Passport
    documentNumber: 'A1234567',
    status: 'APPROVED',
    submittedAt: '2026-08-20T08:30:00.000Z', // Aug 20, 2026
    remarks: '',
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
        dateOfBirth: '1991-03-12T00:00:00.000Z',
        gender: 'Male',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        zipCode: '600002'
      }
    },
    frontImage: { id: 'img-passport-front', fileUrl: '', fileName: 'passport_front.jpg', fileSize: 504000, mimeType: 'image/jpeg' },
    backImage: { id: 'img-passport-back', fileUrl: '', fileName: 'passport_back.jpg', fileSize: 512000, mimeType: 'image/jpeg' },
    selfieImage: { id: 'img-selfie', fileUrl: '/images/selfie.jpg', fileName: 'selfie.jpg', fileSize: 680605, mimeType: 'image/jpeg' }
  },
  'U-100250': {
    id: 'U-100250',
    userId: 'arun-id',
    documentType: 'AADHAAR', // Aadhaar + PAN
    documentNumber: '5678 1234 9012',
    status: 'REJECTED',
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
        dateOfBirth: '1993-07-25T00:00:00.000Z',
        gender: 'Male',
        city: 'Madurai',
        state: 'Tamil Nadu',
        country: 'India',
        zipCode: '625001'
      }
    },
    frontImage: { id: 'img-aadhaar-front', fileUrl: '/images/aadhaar_front.jpg', fileName: 'aadhaar_front.jpg', fileSize: 624929, mimeType: 'image/jpeg' },
    backImage: { id: 'img-aadhaar-back', fileUrl: '/images/aadhaar_back.jpg', fileName: 'aadhaar_back.jpg', fileSize: 670382, mimeType: 'image/jpeg' },
    selfieImage: { id: 'img-selfie', fileUrl: '/images/selfie.jpg', fileName: 'selfie.jpg', fileSize: 680605, mimeType: 'image/jpeg' }
  }
};

const MOCK_PAN_DOC = {
  id: 'img-pan',
  fileUrl: '/images/pan_card.jpg',
  fileName: 'pan_card.jpg',
  fileSize: 988234,
  mimeType: 'image/jpeg',
  documentNumber: 'ABCDE1234F'
};

interface DocumentCardProps {
  title: string;
  imageUrl?: string;
  onDownload: () => void;
  isScanning: boolean;
  customContent?: React.ReactNode;
}

const DocumentPreviewCard = ({ title, imageUrl, onDownload, isScanning, customContent }: DocumentCardProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', overflow: 'hidden', bgcolor: 'white', position: 'relative' }}>
      {/* Animated Scan Line Overlay */}
      {isScanning && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(to bottom, rgba(59,130,246,0), rgba(59,130,246,1), rgba(59,130,246,0))',
            boxShadow: '0 0 8px #3b82f6',
            zIndex: 10,
            animation: 'scanline 2s linear infinite'
          }}
        />
      )}

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
        {customContent ? (
          <Box sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease'
          }}>
            {customContent}
          </Box>
        ) : (
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

// CSS-styled Passport Front Document Mockup to match Kumar S profile & bearded selfie photo perfectly
const PassportFrontPreview = ({ name, dob, passportNo, selfieUrl }: { name: string; dob: string; passportNo: string; selfieUrl: string }) => (
  <Box sx={{
    width: '90%',
    height: '92%',
    bgcolor: '#fcf8f2',
    border: '2px solid #b58957',
    borderRadius: 2,
    p: 1.5,
    boxSizing: 'border-box',
    fontFamily: 'monospace',
    color: '#1c1917',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  }}>
    <Box sx={{ borderBottom: '1px solid #b58957', pb: 0.5, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: 800, fontSize: '0.62rem', letterSpacing: 0.8, color: '#b58957', fontFamily: 'monospace' }}>REPUBLIC OF INDIA / भारत गणराज्य</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: '0.58rem', color: '#78716c', fontFamily: 'monospace' }}>PASSPORT / पासपोर्ट</Typography>
    </Box>

    <Box sx={{ display: 'flex', gap: 1.5, flexGrow: 1, mt: 0.75 }}>
      {/* Portrait photo of the user matching the selfie */}
      <Box sx={{ width: 68, height: 80, border: '1px solid #78716c', bgcolor: '#e7e5e4', overflow: 'hidden', borderRadius: 0.5 }}>
        <img src={selfieUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.25, fontSize: '0.5rem' }}>
        <Box>
          <Typography sx={{ fontSize: '0.42rem', color: '#78716c', m: 0 }}>Surname / उपनाम</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.55rem', m: 0 }}>S</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.42rem', color: '#78716c', m: 0 }}>Given Name(s) / नाम</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.55rem', m: 0 }}>{name}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.42rem', color: '#78716c', m: 0 }}>Date of Birth / जन्म तिथि</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.55rem', m: 0 }}>{dob}</Typography>
        </Box>
      </Box>
    </Box>

    <Box sx={{ borderTop: '1px solid #b58957', pt: 0.5, mt: 0.5 }}>
      <Typography sx={{ fontWeight: 800, fontSize: '0.58rem', textAlign: 'right', color: '#b58957', fontFamily: 'monospace', m: 0 }}>P.No: {passportNo}</Typography>
      <Box sx={{ bgcolor: '#e7e5e4', p: 0.25, borderRadius: 0.5, mt: 0.25, fontSize: '0.42rem', letterSpacing: 0.8, fontFamily: 'Courier New, monospace', fontWeight: 'bold', lineHeight: 1.1 }}>
        P&lt;IND{name.toUpperCase().replace(/\s+/g, '')}&lt;&lt;S&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
        {passportNo}4IND9103120M2608311&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;0
      </Box>
    </Box>
  </Box>
);

// CSS-styled Passport Back Document Mockup matching Kumar S details
const PassportBackPreview = ({ address }: { address: string }) => (
  <Box sx={{
    width: '90%',
    height: '92%',
    bgcolor: '#fcf8f2',
    border: '2px solid #b58957',
    borderRadius: 2,
    p: 1.5,
    boxSizing: 'border-box',
    fontFamily: 'monospace',
    color: '#1c1917',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  }}>
    <Box sx={{ borderBottom: '1px solid #b58957', pb: 0.5, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: 800, fontSize: '0.62rem', color: '#b58957', fontFamily: 'monospace' }}>REPUBLIC OF INDIA / भारत गणराज्य</Typography>
    </Box>
    <Box sx={{ mt: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '0.5rem' }}>
      <Box>
        <Typography sx={{ fontSize: '0.42rem', color: '#78716c', m: 0 }}>Name of Father / पिता का नाम</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.55rem', m: 0 }}>SOMANATHAN S</Typography>
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.42rem', color: '#78716c', m: 0 }}>Name of Mother / माता का नाम</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.55rem', m: 0 }}>MEENAKSHI S</Typography>
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.42rem', color: '#78716c', m: 0 }}>Address / पता</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.48rem', lineHeight: 1.2, m: 0 }}>{address}</Typography>
      </Box>
    </Box>
    <Box sx={{ borderTop: '1px solid #b58957', pt: 0.5, mt: 0.5, textAlign: 'center' }}>
      <Typography sx={{ fontSize: '0.48rem', color: '#78716c', fontFamily: 'monospace' }}>PIN CODE: 600002</Typography>
    </Box>
  </Box>
);

export default function KycDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [kyc, setKyc] = useState<KycDocument | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Auto-Verification and Detection state machine
  const [autoState, setAutoState] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [scannedItems, setScannedItems] = useState({
    nameMatched: 'pending',       // 'pending' | 'scanning' | 'passed' | 'failed'
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
      const res = await kycService.getById(id);
      const resData = res.data?.data;
      
      let selectedKyc: KycDocument;
      if (resData) {
        selectedKyc = resData;
      } else {
        selectedKyc = (MOCK_KYC_DETAILS[id] || MOCK_KYC_DETAILS['U-100245']) as KycDocument;
      }

      setKyc(selectedKyc);
      setRemarks(selectedKyc.remarks || '');

      // Initialize Verification Timeline depending on status
      const initialTimeline = [
        {
          date: selectedKyc.submittedAt ? new Date(selectedKyc.submittedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date(selectedKyc.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '21 Aug 2026, 10:42 PM',
          title: 'KYC Submitted by user',
          subtitle: 'Documents uploaded successfully.',
          iconColor: '#3b82f6'
        },
        {
          date: '21 Aug 2026, 11:05 PM',
          title: 'Under Review',
          subtitle: 'Review assigned to Admin.',
          iconColor: '#94a3b8'
        }
      ];

      if (selectedKyc.status === 'APPROVED') {
        initialTimeline.push({
          date: '21 Aug 2026, 11:30 PM',
          title: 'Verified & Approved by Admin',
          subtitle: 'Checks successfully verified.',
          iconColor: '#10b981'
        });
        setScannedItems({
          nameMatched: 'passed',
          dobMatched: 'passed',
          documentReadable: 'passed',
          selfieMatched: 'passed',
          duplicateKyc: 'passed'
        });
        setAutoState('completed');
      } else if (selectedKyc.status === 'REJECTED') {
        initialTimeline.push({
          date: '21 Aug 2026, 11:45 PM',
          title: 'Rejected by Admin',
          subtitle: selectedKyc.remarks || 'Document unclear',
          iconColor: '#ef4444'
        });
        // For rejected mock user Arun (U-100250), name/selfie mismatch checks fail!
        setScannedItems({
          nameMatched: 'failed', // Failed (Arun K vs Venkatesh Sekar)
          dobMatched: 'failed',  // Failed
          documentReadable: 'passed',
          selfieMatched: 'failed', // Failed (clean shaven vs bearded selfie)
          duplicateKyc: 'passed'
        });
        setAutoState('completed');
      } else {
        // PENDING / SUBMITTED -> Trigger Auto Verification Simulator!
        setAutoState('scanning');
      }

      setVerificationTimeline(initialTimeline);

    } catch (err) {
      console.warn('Backend API unreachable. Loading local mockup details.', err);
      const fallback = (MOCK_KYC_DETAILS[id] || MOCK_KYC_DETAILS['U-100245']) as KycDocument;
      setKyc(fallback);
      setRemarks(fallback.remarks || '');
      
      const initialTimeline = [
        { date: '21 Aug 2026, 10:42 PM', title: 'KYC Submitted by user', subtitle: 'Documents uploaded successfully.', iconColor: '#3b82f6' },
        { date: '21 Aug 2026, 11:05 PM', title: 'Under Review', subtitle: 'Review assigned to Admin.', iconColor: '#94a3b8' }
      ];

      if (fallback.status === 'APPROVED') {
        initialTimeline.push({ date: '21 Aug 2026, 11:30 PM', title: 'Verified & Approved by Admin', subtitle: 'Checks successfully verified.', iconColor: '#10b981' });
        setScannedItems({ nameMatched: 'passed', dobMatched: 'passed', documentReadable: 'passed', selfieMatched: 'passed', duplicateKyc: 'passed' });
        setAutoState('completed');
      } else if (fallback.status === 'REJECTED') {
        initialTimeline.push({ date: '21 Aug 2026, 11:45 PM', title: 'Rejected by Admin', subtitle: fallback.remarks || 'Document unclear', iconColor: '#ef4444' });
        setScannedItems({ nameMatched: 'failed', dobMatched: 'failed', documentReadable: 'passed', selfieMatched: 'failed', duplicateKyc: 'passed' });
        setAutoState('completed');
      } else {
        setAutoState('scanning');
      }
      setVerificationTimeline(initialTimeline);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKycDetail();
  }, [fetchKycDetail]);

  // 2. Simulated Auto-Verification Step-by-Step Timer Effect
  useEffect(() => {
    if (autoState !== 'scanning') return;

    // Phase 1: Name match scan
    const t1 = setTimeout(() => {
      setScannedItems(prev => ({ ...prev, nameMatched: 'scanning' }));
    }, 300);

    const t2 = setTimeout(() => {
      setScannedItems(prev => ({ ...prev, nameMatched: 'passed', dobMatched: 'scanning' }));
    }, 900);

    // Phase 2: DOB match scan
    const t3 = setTimeout(() => {
      setScannedItems(prev => ({ ...prev, dobMatched: 'passed', documentReadable: 'scanning' }));
    }, 1500);

    // Phase 3: Document readability scan
    const t4 = setTimeout(() => {
      setScannedItems(prev => ({ ...prev, documentReadable: 'passed', selfieMatched: 'scanning' }));
    }, 2100);

    // Phase 4: Selfie Match scan
    const t5 = setTimeout(() => {
      setScannedItems(prev => ({ ...prev, selfieMatched: 'passed', duplicateKyc: 'scanning' }));
    }, 2700);

    // Phase 5: Duplicate KYC check
    const t6 = setTimeout(() => {
      setScannedItems(prev => ({ ...prev, duplicateKyc: 'passed' }));
      setAutoState('completed');
      
      // Append Auto-Verification success timeline event
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      setVerificationTimeline(prev => [
        ...prev,
        {
          date: timeStr,
          title: 'Auto-verification checks passed',
          subtitle: 'OCR & facial comparison successfully matched.',
          iconColor: '#10b981'
        }
      ]);
      setSnackbar({ open: true, message: 'Auto-verification checks completed successfully!', severity: 'success' });
    }, 3300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [autoState]);

  const handleDownload = (fileUrl: string, fileName: string) => {
    // If it's a CSS preview file, download it as a custom textual passport representation
    if (!fileUrl) {
      const element = document.createElement('a');
      const file = new Blob([`PASSPORT DOCUMENT DATA:\nName: ${kyc?.user?.firstName} ${kyc?.user?.lastName}\nDOB: 12 Mar 1991\nNo: A1234567`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
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
      setSnackbar({ open: true, message: 'KYC Application approved successfully', severity: 'success' });
      setKyc(prev => prev ? { ...prev, status: 'APPROVED' } : null);
      
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setVerificationTimeline(prev => [
        ...prev,
        { date: timeStr, title: 'Verified & Approved by Admin', subtitle: 'Approved from details portal.', iconColor: '#10b981' }
      ]);
    } catch (err) {
      console.warn('Backend API approve failed, simulating local success.', err);
      setSnackbar({ open: true, message: 'KYC Approved successfully (Local Simulation)', severity: 'success' });
      setKyc(prev => prev ? { ...prev, status: 'APPROVED' } : null);
      
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setVerificationTimeline(prev => [
        ...prev,
        { date: timeStr, title: 'Verified & Approved by Admin', subtitle: 'Approved from details portal.', iconColor: '#10b981' }
      ]);
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
      setSnackbar({ open: true, message: `KYC Application rejected. Reason: ${finalReason}`, severity: 'success' });
      setKyc(prev => prev ? { ...prev, status: 'REJECTED', remarks: finalReason } : null);
      
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setVerificationTimeline(prev => [
        ...prev,
        { date: timeStr, title: 'Rejected by Admin', subtitle: `Reason: ${finalReason}`, iconColor: '#ef4444' }
      ]);
    } catch (err) {
      console.warn('Backend API reject failed, simulating local success.', err);
      setSnackbar({ open: true, message: `KYC Rejected successfully: ${finalReason} (Local Simulation)`, severity: 'success' });
      setKyc(prev => prev ? { ...prev, status: 'REJECTED', remarks: finalReason } : null);
      
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setVerificationTimeline(prev => [
        ...prev,
        { date: timeStr, title: 'Rejected by Admin', subtitle: `Reason: ${finalReason}`, iconColor: '#ef4444' }
      ]);
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
    if (!dateStr) return '15 Aug 1995';
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

  const isVenkatesh = kyc?.user?.firstName === 'Venkatesh';
  const isKumar = kyc?.user?.firstName === 'Kumar';
  const isArun = kyc?.user?.firstName === 'Arun';
  const hasSecondaryPan = isVenkatesh;

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
    if (!kyc) return 'Aadhaar + PAN';
    if (isKumar) return 'Passport';
    return hasSecondaryPan ? 'Aadhaar + PAN' : kyc.documentType;
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
      {/* CSS Keyframes for Scan Line Animation */}
      <style>{`
        @keyframes scanline {
          0% { top: 0px; }
          50% { top: 220px; }
          100% { top: 0px; }
        }
      `}</style>

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
              {/* Profile Avatar: resolve portrait dynamically */}
              {isVenkatesh ? (
                <Avatar sx={{ width: 64, height: 64, border: '1px solid #e2e8f0' }}>
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: "url('/images/aadhaar_front.jpg')",
                    backgroundSize: '450%',
                    backgroundPosition: '11% 47%',
                    backgroundRepeat: 'no-repeat'
                  }} />
                </Avatar>
              ) : (
                <Avatar
                  src={kyc.selfieImage?.fileUrl || '/images/selfie.jpg'}
                  sx={{ width: 64, height: 64, border: '1px solid #e2e8f0' }}
                />
              )}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {kyc.user?.firstName} {kyc.user?.lastName || 'Sekar'}
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
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>{kyc.user?.phone || '+91 81234 56789'}</Typography>
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
                    {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date(kyc.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '21 Aug 2026, 10:42 PM'}
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

      {/* Auto-Verification Glow Indicator */}
      {kyc && autoState !== 'idle' && (
        <Card
          sx={{
            p: 2,
            borderRadius: 3,
            boxShadow: 'none',
            border: autoState === 'scanning' ? '1px solid #93c5fd' : '1px solid #a7f3d0',
            bgcolor: autoState === 'scanning' ? '#eff6ff' : '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            {autoState === 'scanning' ? (
              <Autorenew sx={{ color: '#3b82f6', animation: 'spin 1.5s linear infinite' }} />
            ) : (
              <DoneAll sx={{ color: '#10b981' }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 700, color: autoState === 'scanning' ? '#1e3a8a' : '#065f46' }}>
              {autoState === 'scanning' ? '🤖 Auto-Verification: Scanning uploaded documents and running facial matching checks...' : '🟢 Auto-Verification: All document verification biometric checks completed.'}
            </Typography>
          </Stack>
          {autoState === 'scanning' && <CircularProgress size={16} />}
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
                {/* 1. Passport Front side (for Kumar) OR Aadhaar Front side (for others) */}
                <Grid item xs={12} sm={6}>
                  {isKumar ? (
                    <DocumentPreviewCard
                      title="Front side"
                      onDownload={() => handleDownload('', 'passport_front.txt')}
                      isScanning={autoState === 'scanning'}
                      customContent={
                        <PassportFrontPreview 
                          name="Kumar S" 
                          dob="12/03/1991" 
                          passportNo="A1234567" 
                          selfieUrl="/images/selfie.jpg" 
                        />
                      }
                    />
                  ) : (
                    <DocumentPreviewCard
                      title="Front side"
                      imageUrl={kyc.frontImage?.fileUrl || '/images/aadhaar_front.jpg'}
                      onDownload={() => handleDownload(kyc.frontImage?.fileUrl || '/images/aadhaar_front.jpg', kyc.frontImage?.fileName || 'front_side.jpg')}
                      isScanning={autoState === 'scanning'}
                    />
                  )}
                </Grid>

                {/* 2. Passport Back side (for Kumar) OR Aadhaar Back side (for others) */}
                <Grid item xs={12} sm={6}>
                  {isKumar ? (
                    <DocumentPreviewCard
                      title="Back side"
                      onDownload={() => handleDownload('', 'passport_back.txt')}
                      isScanning={autoState === 'scanning'}
                      customContent={
                        <PassportBackPreview 
                          address="4/56, Anna Salai, Chennai, Tamil Nadu - 600002" 
                        />
                      }
                    />
                  ) : (
                    <DocumentPreviewCard
                      title="Back side"
                      imageUrl={kyc.backImage?.fileUrl || '/images/aadhaar_back.jpg'}
                      onDownload={() => handleDownload(kyc.backImage?.fileUrl || '/images/aadhaar_back.jpg', kyc.backImage?.fileName || 'back_side.jpg')}
                      isScanning={autoState === 'scanning'}
                    />
                  )}
                </Grid>

                {/* 3. Secondary PAN Card (if applicable, for Aadhaar + PAN) */}
                {hasSecondaryPan && (
                  <Grid item xs={12} sm={6}>
                    <DocumentPreviewCard
                      title="PAN Card"
                      imageUrl={MOCK_PAN_DOC.fileUrl}
                      onDownload={() => handleDownload(MOCK_PAN_DOC.fileUrl, MOCK_PAN_DOC.fileName)}
                      isScanning={autoState === 'scanning'}
                    />
                  </Grid>
                )}

                {/* 4. Selfie */}
                <Grid item xs={12} sm={6}>
                  {isVenkatesh ? (
                    <DocumentPreviewCard
                      title="Selfie"
                      onDownload={() => handleDownload('/images/aadhaar_front.jpg', 'venkatesh_selfie.jpg')}
                      isScanning={autoState === 'scanning'}
                      customContent={
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: "url('/images/aadhaar_front.jpg')",
                          backgroundSize: '450%',
                          backgroundPosition: '11% 47%',
                          backgroundRepeat: 'no-repeat',
                          borderRadius: 2
                        }} />
                      }
                    />
                  ) : (
                    <DocumentPreviewCard
                      title="Selfie"
                      imageUrl={kyc.selfieImage?.fileUrl || '/images/selfie.jpg'}
                      onDownload={() => handleDownload(kyc.selfieImage?.fileUrl || '/images/selfie.jpg', kyc.selfieImage?.fileName || 'selfie.jpg')}
                      isScanning={autoState === 'scanning'}
                    />
                  )}
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
                      {kyc.user?.profile?.gender || 'Male'}
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
                      {kyc.user?.profile?.city ? `${kyc.user.profile.city === 'Hosur' ? '1/23, South Street, Hosur, Krishnagiri, ' : ''}${kyc.user.profile.city}, ${kyc.user.profile.state} - ${kyc.user.profile.zipCode}` : '1/23, South Street, Hosur, Krishnagiri, Tamil Nadu - 635109'}
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
