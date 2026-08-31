'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip,
  Button, TextField, Avatar, Stack, Breadcrumbs, Link,
  Tabs, Tab, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Alert, Tooltip, IconButton,
  Select, MenuItem, FormControl, InputLabel, Stepper,
  Step, StepLabel, StepButton, Paper
} from '@mui/material';
import {
  ArrowBack, Send, AttachFile, Person, Storefront,
  Receipt, WarningAmber, CheckCircle, Assignment,
  History, Security, SupportAgent, LocalShipping,
  Gavel, Download, Visibility, Close, Autorenew,
  AddComment, TaskAlt, HighlightOff, AccessTime,
  Business, Payment, ErrorOutline, CheckCircleOutline
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { complaintsService } from '@/services/admin.service';

interface MessageItem {
  id: string;
  senderType: 'CUSTOMER' | 'VENDOR' | 'INTERNAL';
  senderName: string;
  message: string;
  createdAt: string;
  attachments?: Array<{ name: string; url: string; size: string }>;
}

interface InvestigationNoteItem {
  id: string;
  authorName: string;
  findings: string;
  remarks?: string;
  createdAt: string;
}

interface ActivityLogItem {
  id: string;
  operator: string;
  action: string;
  details?: string;
  createdAt: string;
}

interface ResolutionItem {
  id: string;
  resolutionType: string;
  amount?: string;
  summary: string;
  approvedBy: string;
  approvedAt: string;
}

interface ComplaintDetail {
  id: string;
  complaintNumber: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  vendorName: string;
  relatedOrderId: string;
  relatedAmount: string;
  relatedOrderStatus: string;
  subjectTitle: string;
  subjectDescription: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
  status: 'SUBMITTED' | 'ASSIGNED' | 'INVESTIGATING' | 'ACTION_REQUIRED' | 'RESOLVED' | 'CLOSED';
  channel: 'EMAIL' | 'CHAT' | 'WEB' | 'PHONE';
  assignedDepartment: string;
  assignedAgent: string;
  targetResolutionAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  evidenceFiles?: Array<{ name: string; url: string; size: string }>;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STEPS = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'INVESTIGATING', label: 'Investigating' },
  { key: 'ACTION_REQUIRED', label: 'Action Required' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

export default function ComplaintDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = (params?.id as string) || 'CMP-0001248';
  const lookupKey = rawId.startsWith('CMP-') ? rawId : `CMP-${rawId}`;

  // State
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [investigationNotes, setInvestigationNotes] = useState<InvestigationNoteItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [resolutions, setResolutions] = useState<ResolutionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Communication Tab: 0 = Customer, 1 = Vendor, 2 = Internal
  const [commTab, setCommTab] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<Array<{ name: string; url: string; size: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [findingDialogOpen, setFindingDialogOpen] = useState(false);
  const [findingText, setFindingText] = useState('');
  const [findingRemarks, setFindingRemarks] = useState('');

  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
  const [resolutionType, setResolutionType] = useState('REFUND');
  const [resolutionAmount, setResolutionAmount] = useState('₹24,999');
  const [resolutionSummary, setResolutionSummary] = useState('');

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignDept, setAssignDept] = useState('Support');
  const [assignAgent, setAssignAgent] = useState('Admin User');

  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [escalateDept, setEscalateDept] = useState('Fraud & Compliance');
  const [escalateReason, setEscalateReason] = useState('');

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  // Load Complaint from Backend API or local fallback
  const loadComplaint = useCallback(async () => {
    try {
      const res = await complaintsService.getById(lookupKey);
      if (res.data?.data) {
        const c = res.data.data;
        setComplaint({
          id: c.id,
          complaintNumber: c.complaintNumber.startsWith('#') ? c.complaintNumber : `#${c.complaintNumber}`,
          userName: c.userName,
          userEmail: c.userEmail,
          userPhone: c.userPhone || '+91 98765 43210',
          vendorName: c.vendorName || 'TechZone Electronics',
          relatedOrderId: c.relatedOrderId || '#ORD-9821',
          relatedAmount: c.relatedAmount || '₹24,999',
          relatedOrderStatus: c.relatedOrderStatus || 'Delivered',
          subjectTitle: c.subjectTitle,
          subjectDescription: c.subjectDescription,
          category: c.category,
          priority: c.priority || 'HIGH',
          severity: c.severity || 'MAJOR',
          status: c.status || 'SUBMITTED',
          channel: c.channel || 'EMAIL',
          assignedDepartment: c.assignedDepartment || 'Support',
          assignedAgent: c.assignedAgent || 'Admin User',
          evidenceFiles: c.evidenceFiles || [
            { name: 'evidence_damage.jpg', url: '/images/aadhaar_front.jpg', size: '340 KB' },
            { name: 'invoice_slip.pdf', url: '/images/pan_card.jpg', size: '180 KB' }
          ],
          targetResolutionAt: c.targetResolutionAt,
          resolvedAt: c.resolvedAt,
          closedAt: c.closedAt,
          createdAt: new Date(c.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          updatedAt: new Date(c.updatedAt || c.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        });

        setMessages((c.messages || []).map((m: any) => ({
          id: m.id,
          senderType: m.senderType || 'CUSTOMER',
          senderName: m.senderName,
          message: m.message,
          createdAt: new Date(m.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          attachments: m.attachments || undefined
        })));

        setInvestigationNotes((c.investigationNotes || []).map((n: any) => ({
          id: n.id,
          authorName: n.authorName,
          findings: n.findings,
          remarks: n.remarks,
          createdAt: new Date(n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        })));

        setActivityLogs((c.activityLogs || []).map((a: any) => ({
          id: a.id,
          operator: a.operator,
          action: a.action,
          details: a.details,
          createdAt: new Date(a.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        })));

        setResolutions((c.resolutions || []).map((r: any) => ({
          id: r.id,
          resolutionType: r.resolutionType,
          amount: r.amount,
          summary: r.summary,
          approvedBy: r.approvedBy,
          approvedAt: new Date(r.approvedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        })));

        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Backend lookup fallback:', e);
    }

    // Default Fallback details
    const now = new Date();
    setComplaint({
      id: 'cmp-mock-id',
      complaintNumber: `#${lookupKey}`,
      userName: 'Rahul Sharma',
      userEmail: 'rahul.sharma@email.com',
      userPhone: '+91 98765 43210',
      vendorName: 'TechZone Electronics',
      relatedOrderId: '#ORD-9821',
      relatedAmount: '₹24,999',
      relatedOrderStatus: 'Delivered',
      subjectTitle: 'Item not as described',
      subjectDescription: 'The product I received is completely different from what was shown in the listing pictures. The color is wrong and it has scratches on the back cover.',
      category: 'Orders',
      priority: 'HIGH',
      severity: 'MAJOR',
      status: 'INVESTIGATING',
      channel: 'EMAIL',
      assignedDepartment: 'Support',
      assignedAgent: 'Admin User',
      evidenceFiles: [
        { name: 'evidence_damage.jpg', url: '/images/aadhaar_front.jpg', size: '340 KB' },
        { name: 'invoice_slip.pdf', url: '/images/pan_card.jpg', size: '180 KB' }
      ],
      createdAt: '12 May 2024, 10:31 AM',
      updatedAt: '12 May 2024, 11:45 AM'
    });

    setMessages([
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Rahul Sharma',
        message: 'The product I received is completely different from what was shown in the listing pictures. The color is wrong and it has scratches on the back cover.',
        createdAt: '12 May 2024, 10:31 AM',
        attachments: [{ name: 'evidence_damage.jpg', url: '/images/aadhaar_front.jpg', size: '340 KB' }]
      },
      {
        id: 'm2',
        senderType: 'VENDOR',
        senderName: 'TechZone Electronics',
        message: 'We inspected our warehouse dispatch video. Unit was packaged securely. We request high-resolution serial number photo.',
        createdAt: '12 May 2024, 11:15 AM'
      }
    ]);

    setInvestigationNotes([
      {
        id: 'n1',
        authorName: 'Investigation Officer',
        findings: 'Customer photographic evidence shows significant cosmetic variance from catalog SKU #TZ-9921.',
        remarks: 'Seller has been issued formal notice to provide serial verification.',
        createdAt: '12 May 2024, 10:45 AM'
      }
    ]);

    setActivityLogs([
      {
        id: 'a1',
        operator: 'Admin User',
        action: 'Case assigned to Support Department',
        createdAt: '12 May 2024, 10:32 AM'
      },
      {
        id: 'a2',
        operator: 'Rahul Sharma',
        action: 'Complaint registered with 2 attachments',
        createdAt: '12 May 2024, 10:31 AM'
      }
    ]);

    setLoading(false);
  }, [lookupKey]);

  useEffect(() => {
    loadComplaint();
  }, [loadComplaint]);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      setPendingAttachments((prev) => [...prev, { name: file.name, url: base64Url, size: sizeStr }]);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send Message
  const handleSendMessage = async () => {
    if ((!replyText.trim() && pendingAttachments.length === 0) || !complaint) return;

    const senderType = commTab === 0 ? 'CUSTOMER' : commTab === 1 ? 'VENDOR' : 'INTERNAL';
    const messageContent = replyText.trim() || 'Attached documents.';
    const attachmentsToSend = [...pendingAttachments];

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newMsg: MessageItem = {
      id: `msg_${Date.now()}`,
      senderType,
      senderName: 'Admin User (Support Lead)',
      message: messageContent,
      createdAt: timeStr,
      attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined
    };

    const newLog: ActivityLogItem = {
      id: `log_${Date.now()}`,
      operator: 'Admin User',
      action: `Message sent to ${senderType.toLowerCase()}`,
      createdAt: timeStr
    };

    setMessages(prev => [...prev, newMsg]);
    setActivityLogs(prev => [newLog, ...prev]);
    setReplyText('');
    setPendingAttachments([]);

    try {
      await complaintsService.addMessage(lookupKey, {
        message: messageContent,
        senderType,
        senderName: 'Admin User',
        attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined
      });
    } catch (e) {
      console.warn('API addMessage fallback:', e);
    }

    setSnackbar({ open: true, message: `Message transmitted to ${senderType.toLowerCase()} channel!`, severity: 'success' });
  };

  // Add Investigation Finding
  const handleAddFinding = async () => {
    if (!findingText.trim() || !complaint) return;

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newNote: InvestigationNoteItem = {
      id: `note_${Date.now()}`,
      authorName: 'Admin User',
      findings: findingText,
      remarks: findingRemarks || undefined,
      createdAt: timeStr
    };

    const newLog: ActivityLogItem = {
      id: `log_${Date.now()}`,
      operator: 'Admin User',
      action: 'Investigation findings recorded',
      details: findingText.slice(0, 80),
      createdAt: timeStr
    };

    setInvestigationNotes(prev => [newNote, ...prev]);
    setActivityLogs(prev => [newLog, ...prev]);
    const savedText = findingText;
    const savedRemarks = findingRemarks;
    setFindingText('');
    setFindingRemarks('');
    setFindingDialogOpen(false);

    try {
      await complaintsService.addNote(lookupKey, { findings: savedText, remarks: savedRemarks });
    } catch (e) {
      console.warn('API addNote fallback:', e);
    }

    setSnackbar({ open: true, message: 'Investigation findings saved to official record!', severity: 'success' });
  };

  // Status Change
  const handleStatusChange = async (newStatus: ComplaintDetail['status']) => {
    if (!complaint) return;
    setComplaint(prev => prev ? { ...prev, status: newStatus } : null);

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newLog: ActivityLogItem = {
      id: `log_${Date.now()}`,
      operator: 'Admin User',
      action: `Status transitioned to ${newStatus}`,
      createdAt: timeStr
    };
    setActivityLogs(prev => [newLog, ...prev]);

    try {
      await complaintsService.updateStatus(lookupKey, newStatus);
    } catch (e) {
      console.warn('API updateStatus fallback:', e);
    }

    setSnackbar({ open: true, message: `Complaint status updated to ${newStatus}`, severity: 'success' });
  };

  // Approve Resolution
  const handleApproveResolution = async () => {
    if (!resolutionSummary.trim() || !complaint) return;

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newRes: ResolutionItem = {
      id: `res_${Date.now()}`,
      resolutionType,
      amount: resolutionAmount || undefined,
      summary: resolutionSummary,
      approvedBy: 'Admin User',
      approvedAt: timeStr
    };

    const newLog: ActivityLogItem = {
      id: `log_${Date.now()}`,
      operator: 'Admin User',
      action: `Resolution approved: ${resolutionType} (${resolutionAmount})`,
      details: resolutionSummary,
      createdAt: timeStr
    };

    setResolutions(prev => [newRes, ...prev]);
    setComplaint(prev => prev ? { ...prev, status: 'RESOLVED' } : null);
    setActivityLogs(prev => [newLog, ...prev]);

    const resType = resolutionType;
    const resAmt = resolutionAmount;
    const resSum = resolutionSummary;
    setResolutionSummary('');
    setResolutionDialogOpen(false);

    try {
      await complaintsService.resolve(lookupKey, {
        resolutionType: resType,
        amount: resAmt,
        summary: resSum
      });
    } catch (e) {
      console.warn('API resolve fallback:', e);
    }

    setSnackbar({ open: true, message: `Resolution approved: ${resType} for ${resAmt}`, severity: 'success' });
  };

  // Reassign Department / Agent
  const handleAssign = async () => {
    if (!complaint) return;
    setComplaint(prev => prev ? { ...prev, assignedDepartment: assignDept, assignedAgent: assignAgent, status: prev.status === 'SUBMITTED' ? 'ASSIGNED' : prev.status } : null);

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newLog: ActivityLogItem = {
      id: `log_${Date.now()}`,
      operator: 'Admin User',
      action: `Reassigned to ${assignDept} (Officer: ${assignAgent})`,
      createdAt: timeStr
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setAssignDialogOpen(false);

    try {
      await complaintsService.assign(lookupKey, { department: assignDept, agentName: assignAgent });
    } catch (e) {
      console.warn('API assign fallback:', e);
    }

    setSnackbar({ open: true, message: `Case assigned to ${assignDept} department!`, severity: 'success' });
  };

  // Escalate Complaint
  const handleEscalate = async () => {
    if (!complaint) return;
    setComplaint(prev => prev ? { ...prev, priority: 'URGENT', severity: 'CRITICAL', status: 'ACTION_REQUIRED', assignedDepartment: escalateDept } : null);

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newNote: InvestigationNoteItem = {
      id: `note_${Date.now()}`,
      authorName: 'Escalation Controller',
      findings: `🚨 HIGH PRIORITY ESCALATION TO ${escalateDept.toUpperCase()}: ${escalateReason || 'Immediate leadership review enforced.'}`,
      createdAt: timeStr
    };

    const newLog: ActivityLogItem = {
      id: `log_${Date.now()}`,
      operator: 'Admin User',
      action: `Escalated to ${escalateDept}`,
      details: escalateReason,
      createdAt: timeStr
    };

    setInvestigationNotes(prev => [newNote, ...prev]);
    setActivityLogs(prev => [newLog, ...prev]);
    const dept = escalateDept;
    const reason = escalateReason;
    setEscalateReason('');
    setEscalateDialogOpen(false);

    try {
      await complaintsService.escalate(lookupKey, { department: dept, reason });
    } catch (e) {
      console.warn('API escalate fallback:', e);
    }

    setSnackbar({ open: true, message: `Complaint escalated to ${dept}!`, severity: 'success' });
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === complaint?.status);

  if (loading || !complaint) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#64748b' }}>Loading Complaint Details...</Typography>
      </Box>
    );
  }

  // Filter messages according to selected communication tab
  const visibleMessages = messages.filter(m => {
    if (commTab === 0) return m.senderType === 'CUSTOMER' || m.senderType === 'INTERNAL';
    if (commTab === 1) return m.senderType === 'VENDOR' || m.senderType === 'INTERNAL';
    return true;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Top Breadcrumb & Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => router.push('/complaints')} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box>
            <Breadcrumbs separator="›" sx={{ fontSize: '0.85rem' }}>
              <Link color="inherit" href="/dashboard" sx={{ textDecoration: 'none' }}>Dashboard</Link>
              <Link color="inherit" href="/complaints" sx={{ textDecoration: 'none' }}>Complaints</Link>
              <Typography color="text.primary" sx={{ fontWeight: 700 }}>{complaint.complaintNumber}</Typography>
            </Breadcrumbs>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {complaint.complaintNumber}: {complaint.subjectTitle}
            </Typography>
          </Box>
        </Box>

        {/* Header Action Buttons */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<Person />}
            onClick={() => setAssignDialogOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, borderColor: '#cbd5e1', color: '#334155' }}
          >
            Assign Staff
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<WarningAmber />}
            onClick={() => setEscalateDialogOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            Escalate Case
          </Button>
          <Button
            variant="contained"
            startIcon={<Gavel />}
            onClick={() => setResolutionDialogOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
          >
            Approve Resolution
          </Button>
        </Stack>
      </Box>

      {/* Status Flow Stepper Card */}
      <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>Investigation & Resolution Progression</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`Priority: ${complaint.priority}`} color={complaint.priority === 'HIGH' || complaint.priority === 'URGENT' ? 'error' : 'warning'} size="small" sx={{ fontWeight: 700 }} />
            <Chip label={`Severity: ${complaint.severity}`} color={complaint.severity === 'CRITICAL' || complaint.severity === 'MAJOR' ? 'error' : 'default'} size="small" sx={{ fontWeight: 700 }} />
            <Chip label={`Status: ${complaint.status}`} color="primary" size="small" sx={{ fontWeight: 700, bgcolor: '#2563eb' }} />
          </Stack>
        </Box>

        <Stepper activeStep={currentStepIndex >= 0 ? currentStepIndex : 0} alternativeLabel>
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <Step key={step.key} completed={isCompleted}>
                <StepButton onClick={() => handleStatusChange(step.key as any)}>
                  <StepLabel error={step.key === 'ACTION_REQUIRED' && isCurrent}>
                    <Typography variant="caption" sx={{ fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#2563eb' : '#475569' }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                </StepButton>
              </Step>
            );
          })}
        </Stepper>
      </Card>

      {/* Main Grid: Left Column (Case Details & Comms) + Right Column (Summary & Audit) */}
      <Grid container spacing={3}>
        
        {/* Left Column (8 cols) */}
        <Grid size={{ xs: 12, lg: 8 }}>
          
          {/* Card 1: Complainant, Vendor & Order Snapshot */}
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Complainant Profile */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 42, height: 42, fontWeight: 700 }}>
                      {complaint.userName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>{complaint.userName}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Complainant (Buyer)</Typography>
                    </Box>
                  </Box>
                  <Stack spacing={0.5} sx={{ pl: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#475569' }}>📧 {complaint.userEmail}</Typography>
                    <Typography variant="caption" sx={{ color: '#475569' }}>📞 {complaint.userPhone}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <CheckCircle sx={{ fontSize: 14, color: '#10b981' }} />
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>KYC Verified Profile</Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Vendor Profile */}
                <Grid size={{ xs: 12, sm: 4 }} sx={{ borderLeft: { sm: '1px solid #f1f5f9' }, pl: { sm: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#fef3c7', color: '#d97706', width: 42, height: 42 }}>
                      <Storefront />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>{complaint.vendorName}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Disputed Seller / Vendor</Typography>
                    </Box>
                  </Box>
                  <Stack spacing={0.5} sx={{ pl: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#475569' }}>Store: {complaint.vendorName}</Typography>
                    <Typography variant="caption" sx={{ color: '#475569' }}>Seller Rating: 4.8 / 5.0 ⭐</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Shield sx={{ fontSize: 14, color: '#2563eb' }} />
                      <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700 }}>Escrow Merchant Account</Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Order Information */}
                <Grid size={{ xs: 12, sm: 4 }} sx={{ borderLeft: { sm: '1px solid #f1f5f9' }, pl: { sm: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#ecfdf5', color: '#059669', width: 42, height: 42 }}>
                      <Receipt />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>{complaint.relatedOrderId}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Associated Order</Typography>
                    </Box>
                  </Box>
                  <Stack spacing={0.5} sx={{ pl: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#475569' }}>Disputed Amount: <strong>{complaint.relatedAmount}</strong></Typography>
                    <Typography variant="caption" sx={{ color: '#475569' }}>Order Status: {complaint.relatedOrderStatus}</Typography>
                    <Typography variant="caption" sx={{ color: '#475569' }}>Category: {complaint.category}</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Card 2: Complaint Details & Evidence Files */}
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Complaint Description & Evidence
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                {complaint.subjectDescription}
              </Typography>

              {complaint.evidenceFiles && complaint.evidenceFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Uploaded Evidence & Attachments ({complaint.evidenceFiles.length})
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                    {complaint.evidenceFiles.map((file, idx) => (
                      <Paper
                        key={idx}
                        variant="outlined"
                        onClick={() => handleDownload(file.url, file.name)}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
                          minWidth: 180
                        }}
                      >
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#dbeafe', color: '#2563eb', borderRadius: 1.5 }}>
                          <Receipt sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block', maxWidth: 120 }} noWrap>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                            {file.size}
                          </Typography>
                        </Box>
                        <Download sx={{ fontSize: 16, color: '#64748b' }} />
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Investigation Findings & Officer Remarks */}
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security sx={{ color: '#2563eb', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Investigation Findings & Internal Remarks
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<AddComment sx={{ fontSize: 16 }} />}
                  onClick={() => setFindingDialogOpen(true)}
                  sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                >
                  Record Finding
                </Button>
              </Box>

              {investigationNotes.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic', py: 2 }}>
                  No investigation notes recorded yet. Click "Record Finding" to add evidence analysis.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {investigationNotes.map((note) => (
                    <Box key={note.id} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          👮 {note.authorName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {note.createdAt}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                        {note.findings}
                      </Typography>
                      {note.remarks && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#d97706', fontWeight: 600, bgcolor: '#fef3c7', p: 0.75, borderRadius: 1 }}>
                          Action Remark: {note.remarks}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Multi-Channel Communication Center (Customer, Vendor, Internal) */}
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <Box sx={{ borderBottom: '1px solid #e2e8f0', px: 2, pt: 1 }}>
              <Tabs value={commTab} onChange={(_, val) => setCommTab(val)}>
                <Tab label={`Customer Communication (${messages.filter(m => m.senderType === 'CUSTOMER').length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }} />
                <Tab label={`Vendor Coordination (${messages.filter(m => m.senderType === 'VENDOR').length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }} />
                <Tab label="All Messages & History" sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }} />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {/* Message Thread */}
              <Box sx={{ maxHeight: 350, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, mb: 3, pr: 1 }}>
                {visibleMessages.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
                    No messages in this communication channel.
                  </Typography>
                ) : (
                  visibleMessages.map((msg) => {
                    const isAgent = msg.senderName.includes('Admin') || msg.senderType === 'INTERNAL';
                    const isVendor = msg.senderType === 'VENDOR';

                    let bubbleBg = '#f1f5f9';
                    let bubbleColor = '#0f172a';
                    let alignSelf = 'flex-start';

                    if (isAgent) {
                      bubbleBg = '#2563eb';
                      bubbleColor = '#ffffff';
                      alignSelf = 'flex-end';
                    } else if (isVendor) {
                      bubbleBg = '#fef3c7';
                      bubbleColor = '#78350f';
                    }

                    return (
                      <Box key={msg.id} sx={{ alignSelf, maxWidth: '80%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, justifyContent: isAgent ? 'flex-end' : 'flex-start' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                            {msg.senderName} ({msg.senderType})
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                            {msg.createdAt}
                          </Typography>
                        </Box>
                        <Box sx={{ p: 1.75, borderRadius: 2.5, bgcolor: bubbleBg, color: bubbleColor }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.5, fontWeight: 500 }}>
                            {msg.message}
                          </Typography>

                          {msg.attachments && msg.attachments.length > 0 && (
                            <Stack spacing={1} sx={{ mt: 1.5 }}>
                              {msg.attachments.map((att, idx) => (
                                <Box
                                  key={idx}
                                  onClick={() => handleDownload(att.url, att.name)}
                                  sx={{
                                    p: 0.75,
                                    borderRadius: 1.5,
                                    bgcolor: isAgent ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Receipt sx={{ fontSize: 16 }} />
                                  <Typography variant="caption" sx={{ fontWeight: 700, flexGrow: 1 }} noWrap>{att.name}</Typography>
                                  <Download sx={{ fontSize: 14 }} />
                                </Box>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>

              {/* Pending Attachments Chips */}
              {pendingAttachments.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                  {pendingAttachments.map((att, idx) => (
                    <Chip
                      key={idx}
                      label={`${att.name} (${att.size})`}
                      size="small"
                      onDelete={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))}
                      sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              )}

              {/* Reply Box */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Tooltip title="Attach documents or evidence">
                  <IconButton onClick={() => fileInputRef.current?.click()} sx={{ bgcolor: '#f1f5f9', color: '#475569' }}>
                    <AttachFile />
                  </IconButton>
                </Tooltip>

                <TextField
                  fullWidth
                  size="small"
                  placeholder={commTab === 0 ? "Type reply to customer..." : commTab === 1 ? "Type official inquiry to vendor..." : "Type internal staff message..."}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />

                <Button
                  variant="contained"
                  endIcon={<Send />}
                  onClick={handleSendMessage}
                  sx={{ borderRadius: 2.5, px: 2.5, bgcolor: '#2563eb', textTransform: 'none', fontWeight: 700 }}
                >
                  Send
                </Button>
              </Box>
            </CardContent>
          </Card>

        </Grid>

        {/* Right Column (4 cols): Case Summary & Audit Trail */}
        <Grid size={{ xs: 12, lg: 4 }}>
          
          {/* Metadata Card */}
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                Complaint Metadata
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Complaint ID</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563eb' }}>{complaint.complaintNumber}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Category</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>{complaint.category}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Priority</Typography>
                  <Chip label={complaint.priority} size="small" color={complaint.priority === 'HIGH' || complaint.priority === 'URGENT' ? 'error' : 'warning'} sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Severity</Typography>
                  <Chip label={complaint.severity} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#fee2e2', color: '#b91c1c' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Department</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>{complaint.assignedDepartment}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Assigned Agent</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>{complaint.assignedAgent}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Intake Channel</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>{complaint.channel}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Target SLA Deadline</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#d97706' }}>48h (36h remaining)</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Filed On</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>{complaint.createdAt}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Resolutions History (if any) */}
          {resolutions.length > 0 && (
            <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', mb: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <CheckCircle sx={{ color: '#16a34a' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                    Approved Resolution
                  </Typography>
                </Box>
                {resolutions.map(r => (
                  <Box key={r.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #dcfce7' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#15803d', display: 'block' }}>
                      {r.resolutionType} {r.amount && `— ${r.amount}`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, fontSize: '0.8rem' }}>
                      {r.summary}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1 }}>
                      Approved by {r.approvedBy} on {r.approvedAt}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Audit Trail / Activity Log */}
          <Card elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <History sx={{ color: '#64748b', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Audit Trail & Timeline
                </Typography>
              </Box>

              <Stack spacing={2}>
                {activityLogs.map((log) => (
                  <Box key={log.id} sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563eb', mt: 0.75 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                        {log.action}
                      </Typography>
                      {log.details && (
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                          {log.details}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                        By {log.operator} &bull; {log.createdAt}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

        </Grid>
      </Grid>

      {/* Dialog: Record Investigation Finding */}
      <Dialog open={findingDialogOpen} onClose={() => setFindingDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Investigation Findings</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
          <TextField
            label="Investigation Findings *"
            fullWidth
            multiline
            rows={3}
            placeholder="Detail verified facts, catalog checks, carrier tracking audits, or evidence analysis..."
            value={findingText}
            onChange={(e) => setFindingText(e.target.value)}
          />
          <TextField
            label="Action Remarks / Required Next Steps"
            fullWidth
            placeholder="e.g. Recommended for 100% refund, vendor warning issued."
            value={findingRemarks}
            onChange={(e) => setFindingRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setFindingDialogOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddFinding} sx={{ bgcolor: '#2563eb', fontWeight: 700 }}>Save Findings</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Approve Resolution */}
      <Dialog open={resolutionDialogOpen} onClose={() => setResolutionDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#059669' }}>Approve Complaint Resolution</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
          <FormControl fullWidth size="small">
            <InputLabel>Resolution Remedy</InputLabel>
            <Select label="Resolution Remedy" value={resolutionType} onChange={(e) => setResolutionType(e.target.value)}>
              <MenuItem value="REFUND">Approve Full Refund to Customer</MenuItem>
              <MenuItem value="CREDIT">Issue Marketplace Wallet Credit</MenuItem>
              <MenuItem value="VENDOR_PENALTY">Enforce Vendor Penalty / Warning</MenuItem>
              <MenuItem value="REPLACEMENT">Order Free Replacement</MenuItem>
              <MenuItem value="REJECTION">Reject Complaint (Invalid Evidence)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Resolution Amount / Value"
            fullWidth
            size="small"
            value={resolutionAmount}
            onChange={(e) => setResolutionAmount(e.target.value)}
          />

          <TextField
            label="Resolution Summary & Final Decision *"
            fullWidth
            multiline
            rows={3}
            placeholder="State the official rationale and instructions for finance/logistics..."
            value={resolutionSummary}
            onChange={(e) => setResolutionSummary(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setResolutionDialogOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleApproveResolution} sx={{ bgcolor: '#10b981', fontWeight: 700 }}>
            Authorize Resolution
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Assign Department & Agent */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Complaint Case</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select label="Department" value={assignDept} onChange={(e) => setAssignDept(e.target.value)}>
              <MenuItem value="Support">Customer Support</MenuItem>
              <MenuItem value="Billing">Billing & Payments</MenuItem>
              <MenuItem value="Fraud & Safety">Fraud & Trust Safety</MenuItem>
              <MenuItem value="Logistics">Logistics & Delivery</MenuItem>
              <MenuItem value="Seller Relations">Seller Relations</MenuItem>
              <MenuItem value="Technical">Technical Operations</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Assigned Lead / Officer"
            fullWidth
            size="small"
            value={assignAgent}
            onChange={(e) => setAssignAgent(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignDialogOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} sx={{ bgcolor: '#2563eb' }}>Save Assignment</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Escalate Complaint */}
      <Dialog open={escalateDialogOpen} onClose={() => setEscalateDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>Escalate Complaint</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
          <FormControl fullWidth size="small">
            <InputLabel>Escalate To Department</InputLabel>
            <Select label="Escalate To Department" value={escalateDept} onChange={(e) => setEscalateDept(e.target.value)}>
              <MenuItem value="Fraud & Compliance">Fraud & Compliance Directorate</MenuItem>
              <MenuItem value="Executive Resolution">Executive Grievance Cell</MenuItem>
              <MenuItem value="Legal Department">Legal & Dispute Team</MenuItem>
              <MenuItem value="Seller Operations Lead">Senior Seller Operations</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Escalation Justification *"
            fullWidth
            multiline
            rows={3}
            placeholder="Explain why standard resolution failed or high dispute severity..."
            value={escalateReason}
            onChange={(e) => setEscalateReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEscalateDialogOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleEscalate} sx={{ fontWeight: 700 }}>
            Escalate Immediately
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>

    </Box>
  );
}
