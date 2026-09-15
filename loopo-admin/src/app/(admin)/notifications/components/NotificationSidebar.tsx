import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, Button, CircularProgress } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import SendIcon from '@mui/icons-material/Send';
import { notificationsService } from '@/services/admin.service';

const TYPE_LABELS: Record<string, string> = {
  PROMOTION: 'Promotion',
  ORDER_UPDATE: 'Order Update',
  ENGAGEMENT: 'Engagement',
  SECURITY: 'Security',
  CART_REMINDER: 'Cart Reminder',
  UPDATE: 'Update',
  ONBOARDING: 'Onboarding',
};

const TYPE_COLORS: Record<string, string> = {
  PROMOTION: '#3b82f6',
  ORDER_UPDATE: '#10b981',
  ENGAGEMENT: '#f59e0b',
  SECURITY: '#ef4444',
  CART_REMINDER: '#0ea5e9',
  UPDATE: '#8b5cf6',
  ONBOARDING: '#64748b',
};

const STATUS_LABELS: Record<string, string> = {
  DELIVERED: 'Delivered',
  SCHEDULED: 'Scheduled',
  FAILED: 'Failed',
  DRAFT: 'Draft',
  OPENED: 'Opened',
};

export default function NotificationSidebar({ onCreateClick }: { onCreateClick: () => void }) {
  const [loading, setLoading] = useState(true);
  const [byType, setByType] = useState<{ type: string; count: number }[]>([]);
  const [last7Days, setLast7Days] = useState<{ date: string; sent: number; delivered: number; opened: number }[]>([]);
  const [recent, setRecent] = useState<{ id: string; title: string; type: string; status: string; deliveryRate: number }[]>([]);

  useEffect(() => {
    notificationsService.getAnalytics()
      .then((res) => {
        const data = res.data?.data || res.data || {};
        setByType(Array.isArray(data.byType) ? data.byType : []);
        setLast7Days(Array.isArray(data.last7Days) ? data.last7Days : []);
        setRecent(Array.isArray(data.recent) ? data.recent : []);
      })
      .catch((err) => console.error('Failed to load notification analytics', err))
      .finally(() => setLoading(false));
  }, []);

  const totalByType = byType.reduce((sum, t) => sum + t.count, 0);
  const chartData = last7Days.map((d) => ({
    name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sent: d.sent,
    delivered: d.delivered,
    opened: d.opened,
  }));

  if (loading) {
    return (
      <Card sx={{ p: 4, borderRadius: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Performance Chart - real per-day sent/delivered/opened counts */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontSize: '1rem' }}>
          Notification Activity <Typography component="span" sx={{ color: '#64748b', fontSize: '0.875rem' }}>(Last 7 Days)</Typography>
        </Typography>

        {chartData.every((d) => d.sent === 0) ? (
          <Typography variant="body2" color="text.secondary">No notifications sent in the last 7 days.</Typography>
        ) : (
          <Box sx={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="opened" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Card>

      {/* Types Chart - real breakdown by NotificationType */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>
          Notification Types
        </Typography>
        {byType.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 140, height: 140, position: 'relative' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={byType}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="type"
                    stroke="none"
                  >
                    {byType.map((entry) => (
                      <Cell key={entry.type} fill={TYPE_COLORS[entry.type] || '#64748b'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{totalByType}</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Total</Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              {byType.map((t) => (
                <Box key={t.type} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: TYPE_COLORS[t.type] || '#64748b' }} />
                    {TYPE_LABELS[t.type] || t.type}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {t.count} <Typography component="span" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>({totalByType ? ((t.count / totalByType) * 100).toFixed(0) : 0}%)</Typography>
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Card>

      {/* Quick Actions - only the one action that's real */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<SendIcon />}
          onClick={onCreateClick}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, py: 1.2 }}
        >
          Send New Notification
        </Button>
      </Card>

      {/* Recent Notifications - real, replaces a fabricated "Top Performing" list */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>
          Recent Notifications
        </Typography>
        {recent.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No notifications sent yet.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {recent.map((n) => (
              <Box key={n.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: '#1e293b', maxWidth: 200 }}>
                    {n.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {TYPE_LABELS[n.type] || n.type}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                  {STATUS_LABELS[n.status] || n.status}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Card>
    </Box>
  );
}
