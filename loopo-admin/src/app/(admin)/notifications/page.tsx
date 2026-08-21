'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, IconButton, Snackbar, Alert } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AddIcon from '@mui/icons-material/Add';
import { notificationsService } from '@/services/admin.service';
import NotificationStats from './components/NotificationStats';
import NotificationFilters from './components/NotificationFilters';
import NotificationTable from './components/NotificationTable';
import NotificationSidebar from './components/NotificationSidebar';
import NotificationDialog from './components/NotificationDialog';
import NotificationPreviewDialog from './components/NotificationPreviewDialog';

export default function NotificationsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [userType, setUserType] = useState('');
  const [platform, setPlatform] = useState('');
  
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [successType, setSuccessType] = useState<'create' | 'update'>('create');

  const [notifications, setNotifications] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resNotifs, resStats] = await Promise.all([
        notificationsService.getAll({
          search,
          status,
          type,
          skip: (page - 1) * rowsPerPage,
          take: rowsPerPage,
        }),
        notificationsService.getStats(),
      ]);
      const payload = resNotifs.data?.data;
      setNotifications(payload?.data || []);
      setTotalCount(payload?.meta?.total || 0);
      setStatsData(resStats.data?.data || null);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [search, status, type, page, rowsPerPage]);

  const handleSubmitNotification = async (notif: any) => {
    try {
      if (selectedNotification) {
        // Edit existing notification
        await notificationsService.update(selectedNotification.id, {
          title: notif.title,
          message: notif.body,
          audience: notif.type,
        });
        setSuccessType('update');
      } else {
        // Create new notification
        await notificationsService.create({
          title: notif.title,
          message: notif.body,
          audience: notif.type,
        });
        setSuccessType('create');
      }
      setSuccessMsg(true);
      fetchData(); // Refresh the table
    } catch (error) {
      console.error('Failed to save notification', error);
    } finally {
      setSelectedNotification(null);
    }
  };

  const handleView = (notif: any) => {
    setSelectedNotification(notif);
    setViewDialogOpen(true);
  };

  const handleEdit = (notif: any) => {
    setSelectedNotification(notif);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNotification(null);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setType('');
    setUserType('');
    setPlatform('');
    setPage(1);
  };

  const filteredNotifications = useMemo(() => {
    // Backend handles search, status, type, and pagination for us now.
    // We only need to filter by tabValue locally if we aren't sending tab state to backend.
    return notifications.filter((n) => {
      let matchTab = true;
      if (tabValue === 1) matchTab = n.status === 'SCHEDULED';
      if (tabValue === 2) matchTab = n.status === 'DRAFT';
      if (tabValue === 3) matchTab = n.status === 'FAILED';

      const matchAudience = userType ? (n.audience || '').toLowerCase().includes(userType.toLowerCase()) : true;

      return matchTab && matchAudience;
    });
  }, [notifications, tabValue, userType]);

  // Reset page to 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, status, type, userType, platform, tabValue]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
            Push Notifications
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Dashboard &gt; Push Notifications &gt; All Notifications
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'white', borderRadius: 2, px: 2, py: 1, border: '1px solid #e2e8f0' }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', mr: 2 }}>Search by title or message...</Typography>
            <Box sx={{ bgcolor: '#f1f5f9', px: 1, borderRadius: 1, color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>⌘K</Box>
          </Box>
          <IconButton sx={{ border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: 'white' }}>
            <SettingsOutlinedIcon sx={{ color: '#64748b' }} />
          </IconButton>
          <IconButton sx={{ border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: 'white' }}>
            <NotificationsNoneOutlinedIcon sx={{ color: '#64748b' }} />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedNotification(null);
              setOpenDialog(true);
            }}
            sx={{
              bgcolor: '#2563eb',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: 'none' },
            }}
          >
            Send Notification
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <NotificationStats statsData={statsData} />

      {/* Filters */}
      <NotificationFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        type={type}
        setType={setType}
        userType={userType}
        setUserType={setUserType}
        platform={platform}
        setPlatform={setPlatform}
        onReset={handleResetFilters}
      />

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', gap: 3, flex: 1, flexDirection: { xs: 'column', xl: 'row' }, minHeight: 0 }}>
        {/* Table Area */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <NotificationTable
            notifications={filteredNotifications}
            totalCount={totalCount}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            tabValue={tabValue}
            setTabValue={setTabValue}
            onView={handleView}
            onEdit={handleEdit}
          />
        </Box>

        {/* Sidebar Area */}
        <Box sx={{ width: { xs: '100%', xl: 350 }, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', pr: 1 }}>
          <NotificationSidebar />
        </Box>
      </Box>

      {/* Dialog & Alerts */}
      <NotificationDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitNotification}
        notification={selectedNotification}
      />

      <NotificationPreviewDialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
      />
      
      <Snackbar open={successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSuccessMsg(false)} severity="success" sx={{ width: '100%' }}>
          {successType === 'create' ? 'Notification sent successfully!' : 'Notification updated successfully!'}
        </Alert>
      </Snackbar>
    </Box>
  );
}
