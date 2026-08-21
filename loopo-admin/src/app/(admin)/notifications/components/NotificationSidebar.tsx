import React from 'react';
import { Box, Typography, Card, Divider, Button } from '@mui/material';
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
  Legend
} from 'recharts';
import SendIcon from '@mui/icons-material/Send';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const performanceData = [
  { name: 'May 10', sent: 400, delivered: 350, opened: 200, clicked: 100 },
  { name: 'May 11', sent: 500, delivered: 480, opened: 250, clicked: 120 },
  { name: 'May 12', sent: 600, delivered: 550, opened: 280, clicked: 150 },
  { name: 'May 13', sent: 550, delivered: 500, opened: 260, clicked: 130 },
  { name: 'May 14', sent: 700, delivered: 680, opened: 350, clicked: 180 },
  { name: 'May 15', sent: 650, delivered: 620, opened: 320, clicked: 160 },
  { name: 'May 16', sent: 680, delivered: 650, opened: 330, clicked: 170 },
];

const typesData = [
  { name: 'Promotion', value: 512, color: '#3b82f6' },
  { name: 'Order Update', value: 285, color: '#10b981' },
  { name: 'Engagement', value: 198, color: '#f59e0b' },
  { name: 'Security', value: 98, color: '#ef4444' },
  { name: 'Cart Reminder', value: 82, color: '#0ea5e9' },
  { name: 'Others', value: 72, color: '#64748b' },
];

const quickActions = [
  { title: 'Send New Notification', desc: 'Create and send notification', icon: <SendIcon fontSize="small" />, color: '#10b981' },
  { title: 'Create Notification Template', desc: 'Save time with templates', icon: <FileCopyIcon fontSize="small" />, color: '#3b82f6' },
  { title: 'Schedule Notification', desc: 'Plan notifications in advance', icon: <ScheduleIcon fontSize="small" />, color: '#8b5cf6' },
  { title: 'View Reports', desc: 'Detailed analytics & insights', icon: <AssessmentIcon fontSize="small" />, color: '#f59e0b' },
];

const topPerforming = [
  { title: 'Flash Sale is Live! ⚡', rate: '62.45%', icon: <FlashOnIcon fontSize="small" />, bg: '#1e1b4b', color: '#818cf8' },
  { title: 'Items in Your Wishlist on Sale!', rate: '58.21%', icon: <FavoriteIcon fontSize="small" />, bg: '#fce7f3', color: '#db2777' },
  { title: 'Weekend Mega Deals 🔥', rate: '57.12%', icon: <LocalOfferIcon fontSize="small" />, bg: '#fee2e2', color: '#ef4444' },
];

export default function NotificationSidebar() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Performance Chart */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontSize: '1rem' }}>
          Notification Performance <Typography component="span" sx={{ color: '#64748b', fontSize: '0.875rem' }}>(Last 7 Days)</Typography>
        </Typography>
        
        <Box sx={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={performanceData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="opened" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="clicked" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          {[
            { label: 'Sent', value: '7,842', color: '#3b82f6' },
            { label: 'Delivered', value: '6,912', pct: '88.14%', color: '#10b981' },
            { label: 'Opened', value: '3,845', pct: '55.64%', color: '#8b5cf6' },
            { label: 'Clicked', value: '1,245', pct: '37.87%', color: '#f59e0b' },
          ].map((stat, i) => (
            <Box key={i}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: stat.color }} />
                {stat.label}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {stat.value}
                {stat.pct && <Typography component="span" variant="caption" sx={{ color: stat.color, ml: 0.5 }}>({stat.pct})</Typography>}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Types Chart */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>
          Notification Types
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 140, height: 140, position: 'relative' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={typesData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {typesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>1,248</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Total</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            {typesData.map((type, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: type.color }} />
                  {type.name}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {type.value} <Typography component="span" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>({((type.value / 1248) * 100).toFixed(2)}%)</Typography>
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      {/* Quick Actions */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {quickActions.map((action, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, cursor: 'pointer', '&:hover .title': { color: '#2563eb' } }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${action.color}15`, color: action.color, display: 'flex' }}>
                {action.icon}
              </Box>
              <Box>
                <Typography className="title" variant="body2" sx={{ fontWeight: 600, color: '#1e293b', transition: 'color 0.2s' }}>
                  {action.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {action.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Top Performing */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            Top Performing Notifications
          </Typography>
          <Button variant="text" size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>View All</Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {topPerforming.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Open Rate: {item.rate}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {item.rate}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
