import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Icon,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SecurityIcon from '@mui/icons-material/Security';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import WavingHandIcon from '@mui/icons-material/WavingHand';

import { Notification, NotificationType, NotificationStatus } from '../mockData';

interface NotificationTableProps {
  notifications: any[];
  totalCount?: number;
  selectedRows: string[];
  setSelectedRows: (selected: string[]) => void;
  page: number;
  setPage: (p: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (r: number) => void;
  tabValue: number;
  setTabValue: (val: number) => void;
  onView: (notif: any) => void;
  onEdit: (notif: any) => void;
}

const getIconByName = (name: string) => {
  switch (name) {
    case 'flash': return <FlashOnIcon fontSize="small" />;
    case 'shopping_bag': return <ShoppingBagIcon fontSize="small" />;
    case 'star': return <StarIcon fontSize="small" />;
    case 'favorite': return <FavoriteIcon fontSize="small" />;
    case 'security': return <SecurityIcon fontSize="small" />;
    case 'card_giftcard': return <CardGiftcardIcon fontSize="small" />;
    case 'notifications_active': return <NotificationsActiveIcon fontSize="small" />;
    case 'new_releases': return <NewReleasesIcon fontSize="small" />;
    case 'local_offer': return <LocalOfferIcon fontSize="small" />;
    case 'waving_hand': return <WavingHandIcon fontSize="small" />;
    default: return <NotificationsActiveIcon fontSize="small" />;
  }
};

const mapType = (type: string): string => {
  const mapping: Record<string, string> = {
    PROMOTION: 'Promotion',
    ORDER_UPDATE: 'Order Update',
    ENGAGEMENT: 'Engagement',
    SECURITY: 'Security',
    CART_REMINDER: 'Cart Reminder',
    UPDATE: 'Update',
    ONBOARDING: 'Onboarding',
  };
  return mapping[type] || type;
};

const mapStatus = (status: string): string => {
  const mapping: Record<string, string> = {
    DELIVERED: 'Delivered',
    SCHEDULED: 'Scheduled',
    FAILED: 'Failed',
    DRAFT: 'Draft',
    OPENED: 'Opened',
  };
  return mapping[status] || status;
};

const getFallbackStyles = (type: string) => {
  const mapped = mapType(type);
  const styles: Record<string, { bg: string; color: string; icon: string }> = {
    Promotion: { bg: '#f3e8ff', color: '#9333ea', icon: 'local_offer' },
    'Order Update': { bg: '#eff6ff', color: '#3b82f6', icon: 'shopping_bag' },
    Engagement: { bg: '#ffedd5', color: '#f97316', icon: 'waving_hand' },
    Security: { bg: '#fee2e2', color: '#ef4444', icon: 'security' },
    'Cart Reminder': { bg: '#ccfbf1', color: '#14b8a6', icon: 'shopping_bag' },
    Update: { bg: '#e0f2fe', color: '#0ea5e9', icon: 'new_releases' },
    Onboarding: { bg: '#dcfce7', color: '#16a34a', icon: 'star' },
  };
  return styles[mapped] || { bg: '#f1f5f9', color: '#64748b', icon: 'notifications_active' };
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${datePart}\n${timePart}`;
};

const TypeChip = ({ type }: { type: string }) => {
  const mapped = mapType(type);
  const styles: Record<string, { bg: string; color: string }> = {
    Promotion: { bg: '#f3e8ff', color: '#9333ea' },
    'Order Update': { bg: '#eff6ff', color: '#3b82f6' },
    Engagement: { bg: '#ffedd5', color: '#f97316' },
    Security: { bg: '#fee2e2', color: '#ef4444' },
    'Cart Reminder': { bg: '#ccfbf1', color: '#14b8a6' },
    Update: { bg: '#e0f2fe', color: '#0ea5e9' },
    Onboarding: { bg: '#dcfce7', color: '#16a34a' },
  };

  const style = styles[mapped] || { bg: '#f1f5f9', color: '#64748b' };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        bgcolor: style.bg,
        color: style.color,
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {mapped}
    </Box>
  );
};

const StatusChip = ({ status }: { status: string }) => {
  const mapped = mapStatus(status);
  const styles: Record<string, { bg: string; color: string }> = {
    Delivered: { bg: '#f0fdf4', color: '#16a34a' },
    Scheduled: { bg: '#fffbeb', color: '#f59e0b' },
    Failed: { bg: '#fef2f2', color: '#ef4444' },
    Draft: { bg: '#f1f5f9', color: '#64748b' },
    Opened: { bg: '#eff6ff', color: '#3b82f6' },
  };

  const style = styles[mapped] || styles.Draft;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        bgcolor: style.bg,
        color: style.color,
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {mapped}
    </Box>
  );
};

export default function NotificationTable({
  notifications,
  selectedRows,
  setSelectedRows,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  tabValue,
  setTabValue,
  onView,
  onEdit,
  totalCount = 0,
}: NotificationTableProps) {
  
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(notifications.map((n) => n.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rId) => rId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Pagination logic
  const startIndex = (page - 1) * rowsPerPage;
  // If totalCount > 0, assume data is already paginated from backend
  const paginatedNotifications = totalCount > 0 ? notifications : notifications.slice(startIndex, startIndex + rowsPerPage);
  const actualTotal = totalCount > 0 ? totalCount : notifications.length;
  const totalPages = Math.ceil(actualTotal / rowsPerPage);

  return (
    <Box sx={{ bgcolor: 'white', borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ minHeight: 48 }}>
          <Tab label="All Notifications" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
          <Tab label="Scheduled" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
          <Tab label="Drafts" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
          <Tab label="Failed" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
        </Tabs>
      </Box>

      {/* Table */}
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <Checkbox
                  indeterminate={selectedRows.length > 0 && selectedRows.length < notifications.length}
                  checked={selectedRows.length === notifications.length && notifications.length > 0}
                  onChange={handleSelectAll}
                  size="small"
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Message</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Audience</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Sent / Scheduled</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Delivery</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedNotifications.length > 0 ? (
              paginatedNotifications.map((row) => {
                const isSelected = selectedRows.includes(row.id);
                const fallbackStyles = getFallbackStyles(row.type);
                const iconBg = row.iconBg || fallbackStyles.bg;
                const iconColor = row.iconColor || fallbackStyles.color;
                const iconName = row.iconName || fallbackStyles.icon;

                return (
                  <TableRow
                    hover
                    key={row.id}
                    selected={isSelected}
                    sx={{
                      '&.Mui-selected': { bgcolor: '#eff6ff' },
                      '&.Mui-selected:hover': { bgcolor: '#e0f2fe' },
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #f1f5f9' }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectRow(row.id)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getIconByName(iconName)}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                          {row.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9', maxWidth: 200 }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }} noWrap>
                        {row.message}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                      <TypeChip type={row.type} />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                      <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 500 }}>
                        {row.audience}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                      <Typography variant="body2" sx={{ color: '#0f172a', fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                        {formatDate(row.sentScheduled)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                      <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 500 }}>
                        {row.delivery}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid #f1f5f9' }}>
                      <IconButton size="small" sx={{ color: '#64748b' }} onClick={() => onView(row)}>
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#64748b' }} onClick={() => onEdit(row)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#64748b' }}>
                        <MoreVertOutlinedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3, color: '#64748b' }}>
                  No notifications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <Box sx={{ borderTop: '1px solid #e2e8f0', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Showing {Math.min(startIndex + 1, actualTotal)} to {Math.min(startIndex + rowsPerPage, actualTotal)} of {actualTotal} notifications
        </Typography>
        
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, p) => setPage(p)}
          color="primary"
          shape="rounded"
          size="small"
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              bgcolor: '#f1f5f9',
              borderRadius: 2,
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            <MenuItem value={10}>10 / page</MenuItem>
            <MenuItem value={20}>20 / page</MenuItem>
            <MenuItem value={50}>50 / page</MenuItem>
          </Select>
        </Box>
      </Box>
    </Box>
  );
}
