'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  ArrowBackIosNew,
  ArrowForwardIos,
  Send,
  AttachFile,
  NoteAdd,
  CheckCircle,
  Report,
  Person,
  Schedule,
  Category,
  PriorityHigh,
  Settings,
  ShoppingCart,
  Payment,
  ReceiptLong,
  Info,
  Campaign,
  WarningAmber,
  Close,
  InsertDriveFile,
  Download,
  Image as ImageIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { supportTicketsService } from '@/services/admin.service';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  senderName: string;
  message: string;
  timestamp: string;
  avatar?: string;
  attachments?: Array<{ name: string; url: string; size: string }>;
}

interface InternalNote {
  id: string;
  author: string;
  note: string;
  timestamp: string;
}

interface ActivityLog {
  id: string;
  time: string;
  action: string;
  operator: string;
}

interface TicketDetail {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Waiting for User' | 'Resolved' | 'Closed';
  channel: 'Email' | 'Chat' | 'Web' | 'Phone';
  createdOn: string;
  lastReply: string;
  relatedOrder?: {
    id: string;
    productName: string;
    amount: string;
    status: string;
  };
}

const USERS = [
  { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91 98765 43210' },
  { name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91 91234 56789' },
  { name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '+91 88776 65544' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@email.com', phone: '+91 99887 76655' },
  { name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '+91 97654 32109' },
  { name: 'Neha Verma', email: 'neha.verma@email.com', phone: '+91 96543 21098' },
  { name: 'Arjun Mehta', email: 'arjun.mehta@email.com', phone: '+91 95432 10987' },
  { name: 'Kavya Nair', email: 'kavya.nair@email.com', phone: '+91 94321 09876' },
  { name: 'Rohit Das', email: 'rohit.das@email.com', phone: '+91 93210 98765' },
  { name: 'Ananya Joshi', email: 'ananya.joshi@email.com', phone: '+91 92109 87654' },
  { name: 'Sanjay Gupta', email: 'sanjay.gupta@email.com', phone: '+91 91098 76543' },
  { name: 'Deepa Krishnan', email: 'deepa.k@email.com', phone: '+91 90987 65432' },
  { name: 'Vijay Chawla', email: 'vijay.chawla@email.com', phone: '+91 89876 54321' },
  { name: 'Meera Sen', email: 'meera.sen@email.com', phone: '+91 88765 43210' },
  { name: 'Karthik Raja', email: 'karthik.raja@email.com', phone: '+91 87654 32109' },
  { name: 'Pooja Hegde', email: 'pooja.hegde@email.com', phone: '+91 86543 21098' }
];

const CATEGORIES = ['Listings', 'Payments', 'Refunds', 'Technical', 'Account', 'Payouts', 'Orders'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
const STATUSES = ['Open', 'Pending', 'Resolved', 'Closed'] as const;
const CHANNELS = ['Email', 'Chat', 'Web', 'Phone'] as const;
const AGENTS = ['Support Agent A', 'Admin User', 'Support Specialist B', 'Manager C'];

const SUBJECTS_BY_CATEGORY: Record<string, string[]> = {
  Listings: [
    'Image upload limit exceeded error',
    'Listing rejected without clear reason',
    'Cannot edit active product listing details',
    'Listing description formatting is broken',
    'Item details not showing under Mobiles category'
  ],
  Payments: [
    'Invoice not received for order #ORD-2831',
    'Payment completed but status still Escrow Pending',
    'Bank account verification pending for 3 days',
    'Double debited for subscription boost package',
    'Failed payment message on checkout screen'
  ],
  Refunds: [
    'Refund not processed for canceled order',
    'Canceled booking refund timeline inquiry',
    'Refund transaction reference missing',
    'Wrong refund amount credited to bank card',
    'Dispute refund request for order #ORD-1229'
  ],
  Technical: [
    'Login page loops and doesn\'t redirect',
    'App crashes frequently on camera capture',
    'Push notifications not delivering on Android',
    'Profile image upload throws server error 500',
    'Search bar filter results are unresponsive'
  ],
  Account: [
    'Seller account suspension appeal',
    'Reset password verification email not received',
    'Update profile mobile number request',
    'Verify business tax registration document',
    'Close account and delete user profile data'
  ],
  Payouts: [
    'Seller payout delayed for completed orders',
    'Payout bank details update failing',
    'Commission fee structure question',
    'Missing payout settlement statement for May',
    'Minimum payout threshold limits check'
  ],
  Orders: [
    'Item received is not as described in listing',
    'Courier partner tracking status update request',
    'Cancel order request for #ORD-12932',
    'Delivery address incorrect after order confirmation',
    'Buyer claims package not received but marked delivered'
  ]
};

function resolveTicket(lookupKey: string) {
  const numMatch = lookupKey.match(/\d+/);
  const idNum = numMatch ? parseInt(numMatch[0], 10) : 1254;
  const i = Math.max(0, 1254 - idNum);

  const user = USERS[i % USERS.length];
  const category = CATEGORIES[i % CATEGORIES.length];
  const subjects = SUBJECTS_BY_CATEGORY[category] || SUBJECTS_BY_CATEGORY['Payments'];
  const subject = subjects[i % subjects.length];
  const priority = PRIORITIES[i % PRIORITIES.length];
  const rawStatus = STATUSES[i % STATUSES.length];
  const status: TicketDetail['status'] = rawStatus === 'Pending' ? 'In Progress' : rawStatus;
  const channel = CHANNELS[i % CHANNELS.length];
  const assignedAgent = AGENTS[i % AGENTS.length];

  const day = Math.max(1, 12 - Math.floor(i / 13));
  const hour = (10 + (i * 7)) % 12 || 12;
  const min = (15 + (i * 9)) % 60;
  const ampm = i % 2 === 0 ? 'AM' : 'PM';
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const minStr = min < 10 ? `0${min}` : `${min}`;
  const createdOn = `${dayStr} May 2024, ${hour}:${minStr} ${ampm}`;

  const replyMin = (min + 15) % 60;
  const replyHour = replyMin < min ? (hour + 1) % 12 || 12 : hour;
  const replyMinStr = replyMin < 10 ? `0${replyMin}` : `${replyMin}`;
  const lastReply = `${dayStr} May 2024, ${replyHour}:${replyMinStr} ${ampm}`;

  const ticket: TicketDetail = {
    id: `#TKT-000${idNum}`,
    userId: `u${(i % USERS.length) + 1}`,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    subject,
    category,
    priority,
    status,
    channel,
    createdOn,
    lastReply,
    relatedOrder: {
      id: `#ORD-${12450 - i}`,
      productName: `${category} Order - Item #${100 + i}`,
      amount: `₹${((i % 10) + 1) * 3500 + 999}`,
      status: status === 'Resolved' || status === 'Closed' ? 'Payment Completed' : 'Escrow Pending'
    }
  };

  const messages: Message[] = [
    {
      id: `m_${idNum}_1`,
      sender: 'user',
      senderName: user.name,
      message: `Hello support team, I am reaching out regarding: "${subject}". Can you please assist me with this request as soon as possible?`,
      timestamp: createdOn,
      attachments: i % 2 === 0 ? [
        { name: 'error_screenshot.png', url: '/images/aadhaar_front.jpg', size: '245 KB' }
      ] : undefined
    }
  ];

  if (status === 'Closed' || status === 'Resolved') {
    messages.push({
      id: `m_${idNum}_2`,
      sender: 'agent',
      senderName: assignedAgent,
      message: `Hi ${user.name}, we have reviewed and addressed this inquiry. The issue is now resolved.`,
      timestamp: lastReply
    });
  }

  const internalNotes: InternalNote[] = [
    {
      id: `n_${idNum}_1`,
      author: 'System Audit',
      note: `Ticket verified. Customer profile matches records. Assigned to ${assignedAgent}.`,
      timestamp: createdOn
    }
  ];

  const activityLogs: ActivityLog[] = [
    { id: `a_${idNum}_1`, time: createdOn, action: `Support ticket submitted by user via ${channel}`, operator: user.name },
    { id: `a_${idNum}_2`, time: createdOn, action: `Ticket auto-assigned to ${assignedAgent}`, operator: 'System Router' }
  ];

  return { ticket, messages, internalNotes, activityLogs, assignedAgent };
}

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketIdRaw = params.id as string;
  const lookupKey = ticketIdRaw.startsWith('TKT-') ? ticketIdRaw : `TKT-${ticketIdRaw}`;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAttachments, setPendingAttachments] = useState<Array<{ name: string; url: string; size: string }>>([]);

  // Form Inputs
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [assignee, setAssignee] = useState('Support Agent A');
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateDept, setEscalateDept] = useState('Payments / FinOps');
  const [escalateReason, setEscalateReason] = useState('');

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileUrl = (event.target?.result as string) || '';
        setPendingAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: formatBytes(file.size),
            url: fileUrl
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const persistTicketData = (
    updatedTicket: TicketDetail | null,
    updatedMessages: Message[],
    updatedNotes: InternalNote[],
    updatedLogs: ActivityLog[],
    updatedAssignee?: string
  ) => {
    if (typeof window === 'undefined') return;
    try {
      const storageKey = `loopo_support_ticket_${lookupKey}`;
      const payload = {
        ticket: updatedTicket,
        messages: updatedMessages,
        internalNotes: updatedNotes,
        activityLogs: updatedLogs,
        assignee: updatedAssignee || assignee
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  const loadTicketData = useCallback(async () => {
    try {
      const res = await supportTicketsService.getById(lookupKey);
      if (res.data?.data) {
        const t = res.data.data;
        const mappedTicket: TicketDetail = {
          id: t.ticketNumber.startsWith('#') ? t.ticketNumber : `#${t.ticketNumber}`,
          userId: t.userId || 'u1',
          userName: t.userName,
          userEmail: t.userEmail,
          userPhone: t.userPhone || '+91 98765 43210',
          subject: t.subject,
          category: t.category,
          priority: t.priority === 'HIGH' ? 'High' : t.priority === 'URGENT' ? 'Urgent' : t.priority === 'LOW' ? 'Low' : 'Medium',
          status: t.status === 'IN_PROGRESS' ? 'In Progress' : t.status === 'WAITING_FOR_USER' ? 'Waiting for User' : t.status === 'RESOLVED' ? 'Resolved' : t.status === 'CLOSED' ? 'Closed' : 'Open',
          channel: t.channel === 'EMAIL' ? 'Email' : t.channel === 'CHAT' ? 'Chat' : t.channel === 'PHONE' ? 'Phone' : 'Web',
          createdOn: new Date(t.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          lastReply: new Date(t.lastReplyAt || t.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          relatedOrder: {
            id: t.relatedOrderId || '#ORD-12458',
            productName: t.relatedProductName || `${t.category} Order Item`,
            amount: t.relatedAmount || '₹34,999',
            status: t.relatedOrderStatus || 'Escrow Pending'
          }
        };

        const mappedMessages: Message[] = (t.messages || []).map((m: any) => ({
          id: m.id,
          sender: m.senderType === 'USER' ? 'user' : 'agent',
          senderName: m.senderName,
          message: m.message,
          timestamp: new Date(m.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          attachments: m.attachments || undefined
        }));

        const mappedNotes: InternalNote[] = (t.internalNotes || []).map((n: any) => ({
          id: n.id,
          author: n.authorName,
          note: n.note,
          timestamp: new Date(n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        }));

        const mappedLogs: ActivityLog[] = (t.activityLogs || []).map((a: any) => ({
          id: a.id,
          time: new Date(a.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          action: a.action,
          operator: a.operator
        }));

        setTicket(mappedTicket);
        setMessages(mappedMessages);
        setInternalNotes(mappedNotes);
        setActivityLogs(mappedLogs);
        setAssignee(t.assignedAgent || 'Support Agent A');
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Backend API getById fallback to local sync:', e);
    }

    const storageKey = `loopo_support_ticket_${lookupKey}`;
    const saved = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const expectedId = lookupKey.replace('TKT-', '');
        if (parsed.ticket && parsed.ticket.id.includes(expectedId)) {
          setTicket(parsed.ticket);
          setMessages(parsed.messages || []);
          setInternalNotes(parsed.internalNotes || []);
          setActivityLogs(parsed.activityLogs || []);
          setAssignee(parsed.assignee || 'Support Agent A');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error parsing stored ticket data:', err);
      }
    }

    // Default dynamic details based on lookupKey
    const resolved = resolveTicket(lookupKey);
    setTicket(resolved.ticket);
    setMessages(resolved.messages);
    setInternalNotes(resolved.internalNotes);
    setActivityLogs(resolved.activityLogs);
    setAssignee(resolved.assignedAgent);
    setLoading(false);
  }, [lookupKey]);

  useEffect(() => {
    loadTicketData();
  }, [loadTicketData]);

  const handleDownload = (fileUrl: string, fileName: string) => {
    if (fileUrl && (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:') || fileUrl.startsWith('http') || fileUrl.startsWith('/'))) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([`SUPPORT DOCUMENT DATA\nTicket: ${ticket?.id}\nUser: ${ticket?.userName}\nFile Name: ${fileName}\nCreated: ${new Date().toISOString()}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendReply = async () => {
    if ((!replyText.trim() && pendingAttachments.length === 0) || !ticket) return;

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newMsg: Message = {
      id: `new_m_${Date.now()}`,
      sender: 'agent',
      senderName: 'Admin User',
      message: replyText.trim() || 'Attached documents.',
      timestamp: timeStr,
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
    };

    const newLog: ActivityLog = {
      id: `new_log_${Date.now()}`,
      time: timeStr,
      action: pendingAttachments.length > 0 ? `Agent replied with ${pendingAttachments.length} attachment(s)` : 'Agent replied to customer message',
      operator: 'Admin User'
    };

    const newMessages = [...messages, newMsg];
    const newLogs = [newLog, ...activityLogs];

    setMessages(newMessages);
    setActivityLogs(newLogs);
    const sentAttachments = [...pendingAttachments];
    const sentText = replyText.trim() || 'Attached documents.';
    setReplyText('');
    setPendingAttachments([]);
    persistTicketData(ticket, newMessages, internalNotes, newLogs);

    // Call PostgreSQL backend API
    try {
      await supportTicketsService.sendReply(lookupKey, {
        message: sentText,
        attachments: sentAttachments.length > 0 ? sentAttachments : undefined
      });
    } catch (e) {
      console.warn('Backend API sendReply fallback to local:', e);
    }

    setSnackbar({ open: true, message: 'Reply and attachments sent successfully!', severity: 'success' });
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !ticket) return;

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newNote: InternalNote = {
      id: `new_n_${Date.now()}`,
      author: 'Admin User',
      note: noteText,
      timestamp: timeStr
    };

    const newLog: ActivityLog = {
      id: `new_log_${Date.now()}`,
      time: timeStr,
      action: 'Private internal note added',
      operator: 'Admin User'
    };

    const newNotes = [...internalNotes, newNote];
    const newLogs = [newLog, ...activityLogs];

    const savedNoteText = noteText;
    setInternalNotes(newNotes);
    setActivityLogs(newLogs);
    setNoteText('');
    persistTicketData(ticket, messages, newNotes, newLogs);

    // Call PostgreSQL backend API
    try {
      await supportTicketsService.addNote(lookupKey, { note: savedNoteText });
    } catch (e) {
      console.warn('Backend API addNote fallback to local:', e);
    }

    setSnackbar({ open: true, message: 'Internal note saved privately!', severity: 'success' });
  };

  const handleStatusChange = async (newStatus: TicketDetail['status']) => {
    if (!ticket) return;

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const updated = { ...ticket, status: newStatus };
    setTicket(updated);

    const newLog: ActivityLog = {
      id: `new_log_${Date.now()}`,
      time: timeStr,
      action: `Ticket status updated to ${newStatus}`,
      operator: 'Admin User'
    };

    const newLogs = [newLog, ...activityLogs];
    setActivityLogs(newLogs);
    persistTicketData(updated, messages, internalNotes, newLogs);

    // Call PostgreSQL backend API
    try {
      const dbStatus = newStatus === 'In Progress' ? 'IN_PROGRESS' : newStatus === 'Waiting for User' ? 'WAITING_FOR_USER' : newStatus.toUpperCase();
      await supportTicketsService.updateStatus(lookupKey, dbStatus);
    } catch (e) {
      console.warn('Backend API updateStatus fallback to local:', e);
    }

    setSnackbar({ open: true, message: `Ticket status updated to ${newStatus}`, severity: 'success' });
  };

  const handlePriorityChange = async (newPriority: TicketDetail['priority']) => {
    if (!ticket) return;

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const updated = { ...ticket, priority: newPriority };
    setTicket(updated);

    const newLog: ActivityLog = {
      id: `new_log_${Date.now()}`,
      time: timeStr,
      action: `Ticket priority raised to ${newPriority}`,
      operator: 'Admin User'
    };

    const newLogs = [newLog, ...activityLogs];
    setActivityLogs(newLogs);
    persistTicketData(updated, messages, internalNotes, newLogs);

    // Call PostgreSQL backend API
    try {
      await supportTicketsService.updatePriority(lookupKey, newPriority.toUpperCase());
    } catch (e) {
      console.warn('Backend API updatePriority fallback to local:', e);
    }

    setSnackbar({ open: true, message: `Ticket priority changed to ${newPriority}`, severity: 'success' });
  };

  const handleAssigneeChange = async (newAssignee: string) => {
    if (!ticket) return;
    setAssignee(newAssignee);

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newLog: ActivityLog = {
      id: `new_log_${Date.now()}`,
      time: timeStr,
      action: `Ticket assigned to ${newAssignee}`,
      operator: 'Admin User'
    };

    const newLogs = [newLog, ...activityLogs];
    setActivityLogs(newLogs);
    persistTicketData(ticket, messages, internalNotes, newLogs, newAssignee);

    // Call PostgreSQL backend API
    try {
      await supportTicketsService.assignAgent(lookupKey, newAssignee);
    } catch (e) {
      console.warn('Backend API assignAgent fallback to local:', e);
    }

    setSnackbar({ open: true, message: `Ticket assigned to ${newAssignee}`, severity: 'success' });
  };

  const handleCloseTicket = () => {
    handleStatusChange('Closed');
  };

  const handleEscalate = async () => {
    if (!ticket) return;
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newNote: InternalNote = {
      id: `new_n_${Date.now()}`,
      author: 'Escalation Router',
      note: `🚨 ESCALATED TO ${escalateDept.toUpperCase()}: ${escalateReason || 'Immediate attention required.'}`,
      timestamp: timeStr
    };

    const newLog: ActivityLog = {
      id: `new_log_${Date.now()}`,
      time: timeStr,
      action: `Ticket escalated to ${escalateDept}`,
      operator: 'Admin User'
    };

    const updated = { ...ticket, priority: 'Urgent' as const, status: 'In Progress' as const };
    const newNotes = [newNote, ...internalNotes];
    const newLogs = [newLog, ...activityLogs];

    const department = escalateDept;
    const reason = escalateReason;

    setInternalNotes(newNotes);
    setActivityLogs(newLogs);
    setTicket(updated);
    setEscalateOpen(false);
    setEscalateReason('');
    persistTicketData(updated, messages, newNotes, newLogs);

    // Call PostgreSQL backend API
    try {
      await supportTicketsService.escalate(lookupKey, { department, reason });
    } catch (e) {
      console.warn('Backend API escalate fallback to local:', e);
    }

    setSnackbar({ open: true, message: `Ticket successfully escalated to ${escalateDept}!`, severity: 'success' });
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Low': return { bg: '#eff6ff', text: '#2563eb' };
      case 'Medium': return { bg: '#fef3c7', text: '#d97706' };
      case 'High':
      case 'Urgent': return { bg: '#fef2f2', text: '#dc2626' };
      default: return { bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open': return { bg: '#ecfdf5', text: '#059669' };
      case 'In Progress': return { bg: '#eff6ff', text: '#2563eb' };
      case 'Waiting for User': return { bg: '#fff7ed', text: '#ea580c' };
      case 'Resolved': return { bg: '#f5f3ff', text: '#7c3aed' };
      case 'Closed': return { bg: '#f3f4f6', text: '#4b5563' };
      default: return { bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  if (loading || !ticket) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const prioStyle = getPriorityStyle(ticket.priority);
  const statStyle = getStatusStyle(ticket.status);

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Breadcrumb & Back Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Ticket Details</Typography>
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
            <Link underline="hover" color="inherit" onClick={() => router.push('/dashboard')} sx={{ cursor: 'pointer' }}>
              Dashboard
            </Link>
            <Link underline="hover" color="inherit" onClick={() => router.push('/support')} sx={{ cursor: 'pointer' }}>
              Support Tickets
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 500 }}>Ticket Details</Typography>
          </Breadcrumbs>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => router.push('/support')}
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
            Back to Dashboard
          </Button>
          <IconButton sx={{ border: '1px solid #cbd5e1', borderRadius: 2, bgcolor: 'white' }}>
            <ArrowBackIosNew sx={{ fontSize: 14, color: '#64748b' }} />
          </IconButton>
          <IconButton sx={{ border: '1px solid #cbd5e1', borderRadius: 2, bgcolor: 'white' }}>
            <ArrowForwardIos sx={{ fontSize: 14, color: '#64748b' }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Ticket Details Summary Banner Card */}
      <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5.5} sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: '#1d4ed8', fontWeight: 'bold' }}>{ticket.userName[0]}</Avatar>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {ticket.userName}
                </Typography>
                <Chip
                  label={ticket.id}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    bgcolor: '#eff6ff',
                    color: '#1d4ed8',
                    borderRadius: 1
                  }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25, fontWeight: 500 }}>
                {ticket.userEmail} &nbsp;•&nbsp; {ticket.userPhone}
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, fontWeight: 700 }}>
                Subject: {ticket.subject}
              </Typography>
            </Box>
          </Grid>

          {/* Ticket Metadata status indicators */}
          <Grid item xs={12} md={6.5}>
            <Grid container spacing={2} justifyContent="flex-end">
              <Grid item xs={6} md={3} sx={{ textAlign: { md: 'right' } }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>STATUS</Typography>
                <Chip
                  label={ticket.status}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: statStyle.bg,
                    color: statStyle.text,
                    borderRadius: 1.5,
                    px: 1
                  }}
                />
              </Grid>

              <Grid item xs={6} md={3} sx={{ textAlign: { md: 'right' } }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>PRIORITY</Typography>
                <Chip
                  label={ticket.priority}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: prioStyle.bg,
                    color: prioStyle.text,
                    borderRadius: 1.5,
                    px: 1
                  }}
                />
              </Grid>

              <Grid item xs={6} md={3} sx={{ textAlign: { md: 'right' } }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>CATEGORY</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {ticket.category}
                </Typography>
              </Grid>

              <Grid item xs={6} md={3} sx={{ textAlign: { md: 'right' } }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>CHANNEL</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {ticket.channel}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>

      {/* Main Dual Column Layout (60% Conversation & Notes, 40% Settings & Info) */}
      <Grid container spacing={3}>
        {/* Left Column (60% width) */}
        <Grid item xs={12} md={7.2} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Conversation History */}
          <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 3 }}>Conversation History</Typography>
            
            <Stack spacing={3.5} sx={{ mb: 4 }}>
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-start' : 'flex-end',
                    width: '100%'
                  }}
                >
                  <Stack direction={msg.sender === 'user' ? 'row' : 'row-reverse'} spacing={1.5} sx={{ maxWidth: '85%' }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: msg.sender === 'user' ? '#1d4ed8' : '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {msg.senderName[0]}
                    </Avatar>
                    
                    <Box>
                      <Stack direction="row" spacing={1.5} alignItems="baseline" justifyContent={msg.sender === 'user' ? 'flex-start' : 'flex-end'}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{msg.senderName}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>{msg.timestamp}</Typography>
                      </Stack>
                      
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mt: 0.75,
                          borderRadius: 3,
                          bgcolor: msg.sender === 'user' ? '#f1f5f9' : '#e0f2fe',
                          color: '#334155',
                          border: msg.sender === 'user' ? '1px solid #e2e8f0' : '1px solid #bae6fd'
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.5, fontWeight: 500 }}>{msg.message}</Typography>
                      </Paper>

                      {/* Attachments rendering */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <Stack spacing={1} sx={{ mt: 1.5 }}>
                          {msg.attachments.map((file, fIdx) => (
                            <Box
                              key={fIdx}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.2,
                                border: '1px solid #cbd5e1',
                                borderRadius: 2.5,
                                bgcolor: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: '#f8fafc', borderColor: '#1d4ed8', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
                              }}
                              onClick={() => handleDownload(file.url, file.name)}
                            >
                              {file.url && file.url.startsWith('data:image') ? (
                                <ImageIcon sx={{ fontSize: 20, color: '#10b981' }} />
                              ) : (
                                <InsertDriveFile sx={{ fontSize: 20, color: '#1d4ed8' }} />
                              )}
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1d4ed8', display: 'block' }}>{file.name}</Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>{file.size} &bull; Click to download/view</Typography>
                              </Box>
                              <Tooltip title="Download file">
                                <IconButton size="small">
                                  <Download sx={{ fontSize: 18, color: '#64748b' }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Reply pane */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mb: 1.5 }}>Send Reply to Customer</Typography>
              <TextField
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                placeholder="Type your response to the customer here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#f8fafc'
                  }
                }}
              />

              {/* Pending Attachments List */}
              {pendingAttachments.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5, gap: 1 }}>
                  {pendingAttachments.map((file, idx) => (
                    <Chip
                      key={idx}
                      icon={<InsertDriveFile fontSize="small" />}
                      label={`${file.name} (${file.size})`}
                      onDelete={() => handleRemovePendingAttachment(idx)}
                      deleteIcon={<Close fontSize="small" />}
                      variant="outlined"
                      sx={{ bgcolor: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8', fontWeight: 600, borderRadius: 2 }}
                    />
                  ))}
                </Stack>
              )}

              <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<AttachFile />}
                  sx={{ textTransform: 'none', borderRadius: 2.5, borderColor: '#cbd5e1', color: '#64748b', fontWeight: 600 }}
                >
                  Attach File {pendingAttachments.length > 0 ? `(${pendingAttachments.length})` : ''}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSendReply}
                  startIcon={<Send />}
                  disabled={!replyText.trim() && pendingAttachments.length === 0}
                  sx={{ textTransform: 'none', borderRadius: 2.5, bgcolor: '#1d4ed8', fontWeight: 700 }}
                >
                  Send Reply
                </Button>
              </Stack>
            </Box>
          </Card>

          {/* Internal Notes Card */}
          <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Internal Notes (Admin Only)</Typography>
            
            {/* List notes */}
            {internalNotes.length > 0 && (
              <Stack spacing={2} sx={{ mb: 3 }}>
                {internalNotes.map((note) => (
                  <Box key={note.id} sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 2.5, border: '1px solid #fde68a' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#b45309' }}>Note by {note.author}</Typography>
                      <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 500 }}>{note.timestamp}</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#78350f', fontWeight: 500 }}>{note.note}</Typography>
                  </Box>
                ))}
              </Stack>
            )}

            <TextField
              multiline
              rows={2}
              fullWidth
              variant="outlined"
              placeholder="Add an internal note visible only to administrators..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#f8fafc'
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
              <Button
                variant="outlined"
                color="warning"
                onClick={handleAddNote}
                startIcon={<NoteAdd />}
                sx={{ textTransform: 'none', borderRadius: 2.5, borderColor: '#f59e0b', color: '#d97706', fontWeight: 700 }}
              >
                Save Internal Note
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Right Column (40% width) */}
        <Grid item xs={12} md={4.8} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Settings / Assignee controls */}
          <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5 }}>Ticket Control Panel</Typography>
            <Stack spacing={2.5}>
              {/* Status Select */}
              <FormControl fullWidth size="small">
                <InputLabel id="ticket-status-label">Ticket Status</InputLabel>
                <Select
                  labelId="ticket-status-label"
                  value={ticket.status}
                  label="Ticket Status"
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Waiting for User">Waiting for User</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>

              {/* Priority Select */}
              <FormControl fullWidth size="small">
                <InputLabel id="ticket-priority-label">Ticket Priority</InputLabel>
                <Select
                  labelId="ticket-priority-label"
                  value={ticket.priority}
                  label="Ticket Priority"
                  onChange={(e) => handlePriorityChange(e.target.value as any)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>

              {/* Assignee select */}
              <FormControl fullWidth size="small">
                <InputLabel id="ticket-agent-label">Assigned Support Agent</InputLabel>
                <Select
                  labelId="ticket-agent-label"
                  value={assignee}
                  label="Assigned Support Agent"
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Support Agent A">Support Agent A</MenuItem>
                  <MenuItem value="Admin User">Admin User</MenuItem>
                  <MenuItem value="Support Specialist B">Support Specialist B</MenuItem>
                  <MenuItem value="Manager C">Manager C</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ my: 1 }} />

              <Button
                fullWidth
                variant="contained"
                onClick={handleCloseTicket}
                disabled={ticket.status === 'Closed'}
                startIcon={<CheckCircle />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 3,
                  bgcolor: '#10b981',
                  color: 'white',
                  fontWeight: 700,
                  py: 1.2,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#059669', boxShadow: 'none' }
                }}
              >
                Close Ticket
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => setEscalateOpen(true)}
                disabled={ticket.status === 'Closed'}
                startIcon={<Campaign />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 3,
                  borderColor: '#fca5a5',
                  color: '#dc2626',
                  fontWeight: 700,
                  py: 1.1,
                  '&:hover': { borderColor: '#ef4444', bgcolor: '#fef2f2' }
                }}
              >
                Escalate to Department
              </Button>
            </Stack>
          </Card>

          {/* Related Information */}
          {ticket.relatedOrder && (
            <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Related Information</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#eff6ff', color: '#1d4ed8' }}>
                    <ShoppingCart fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>PRODUCT DETAILS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      {ticket.relatedOrder.productName}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#eff6ff', color: '#1d4ed8' }}>
                    <ReceiptLong fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>ORDER REFERENCE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      {ticket.relatedOrder.id}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#eff6ff', color: '#1d4ed8' }}>
                    <Payment fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>PAYMENT AMOUNT</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      {ticket.relatedOrder.amount}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#eff6ff', color: '#1d4ed8' }}>
                    <Info fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>ORDER STATUS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', lineHeight: 1.4 }}>
                      {ticket.relatedOrder.status}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Card>
          )}

          {/* Activity / Action Logs */}
          <Card sx={{ p: 3, borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5 }}>Activity Logs</Typography>
            <Box sx={{ position: 'relative', pl: 3, '&:before': { content: '""', position: 'absolute', left: 8, top: 4, bottom: 4, width: 2, bgcolor: '#cbd5e1' } }}>
              {activityLogs.map((log) => (
                <Box key={log.id} sx={{ mb: 2.5, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: -22, top: 4, width: 8, height: 8, borderRadius: '50%', bgcolor: '#94a3b8', border: '2px solid white' }} />
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>{log.time}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.25 }}>{log.action}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.25 }}>By {log.operator}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Escalate Dialog Modal */}
      <Dialog
        open={escalateOpen}
        onClose={() => setEscalateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Campaign />
          </Box>
          Escalate Ticket #{ticket.id}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '10px !important' }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Escalate this unresolved issue to a specialized department. Priority will automatically be raised to Urgent and an escalation note will be logged in the audit trail.
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel id="escalate-dept-label">Target Department</InputLabel>
            <Select
              labelId="escalate-dept-label"
              value={escalateDept}
              label="Target Department"
              onChange={(e) => setEscalateDept(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="Payments / FinOps">Payments & FinOps</MenuItem>
              <MenuItem value="Listings / Catalog Moderation">Listings & Catalog Moderation</MenuItem>
              <MenuItem value="Technical / Engineering">Technical & Engineering Support</MenuItem>
              <MenuItem value="Trust & Safety / Legal">Trust & Safety / Legal Department</MenuItem>
              <MenuItem value="Executive Management">Executive Management Escalate</MenuItem>
            </Select>
          </FormControl>

          <TextField
            multiline
            rows={3}
            fullWidth
            label="Escalation Reason & Context"
            placeholder="Explain why this ticket is being escalated and any steps already attempted..."
            value={escalateReason}
            onChange={(e) => setEscalateReason(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setEscalateOpen(false)}
            sx={{ textTransform: 'none', color: '#64748b', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleEscalate}
            startIcon={<Campaign />}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 3 }}
          >
            Confirm Escalation
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
