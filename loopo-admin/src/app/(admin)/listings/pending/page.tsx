'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  Grid,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Avatar,
  Stack,
  Pagination
} from '@mui/material';
import {
  AccessTime,
  AddCircle,
  Inventory2Outlined,
  PeopleAltOutlined,
  MoreVert,
  CheckCircle,
  CancelOutlined,
  InfoOutlined,
  Visibility
} from '@mui/icons-material';

const pendingData = [
  { id: 'LST10001', title: 'iPhone 13 128GB Blue', category: 'Electronics', subcategory: 'Mobile Phones', price: '₹32,000', seller: 'Ajay Patel', sellerId: '#SLR001', submitted: '12 May 2024', time: '10:30 AM', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a' },
  { id: 'LST10002', title: 'Maruti Swift VXi 2020', category: 'Vehicles', subcategory: 'Cars', price: '₹4,85,000', seller: 'Sneha Reddy', sellerId: '#SLR002', submitted: '12 May 2024', time: '09:45 AM', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b' },
  { id: 'LST10003', title: 'L Shape Sofa Set', category: 'Home & Living', subcategory: 'Furniture', price: '₹18,000', seller: 'Rahul Sharma', sellerId: '#SLR003', submitted: '12 May 2024', time: '08:20 AM', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704c' },
  { id: 'LST10004', title: 'Dell Inspiron 15', category: 'Electronics', subcategory: 'Laptops', price: '₹28,500', seller: 'Vikram Singh', sellerId: '#SLR004', submitted: '12 May 2024', time: '08:00 AM', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 'LST10005', title: 'Royal Enfield Classic 350', category: 'Vehicles', subcategory: 'Motorcycles', price: '₹1,35,000', seller: 'Mohit Jain', sellerId: '#SLR005', submitted: '12 May 2024', time: '08:15 AM', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
  { id: 'LST10006', title: 'Canon EOS 200D II', category: 'Electronics', subcategory: 'Cameras', price: '₹32,000', seller: 'Pooja Mehra', sellerId: '#SLR006', submitted: '12 May 2024', time: '07:40 AM', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
  { id: 'LST10007', title: 'Hero Sprint Bicycle', category: 'Sports', subcategory: 'Bicycles', price: '₹3,500', seller: 'Arun Kumar', sellerId: '#SLR007', submitted: '12 May 2024', time: '07:10 AM', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704g' },
  { id: 'LST10008', title: 'Yamaha F310 Acoustic Guitar', category: 'Hobbies', subcategory: 'Musical Instruments', price: '₹6,200', seller: 'David Wilson', sellerId: '#SLR008', submitted: '12 May 2024', time: '06:40 AM', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704h' },
];

const StatCard = ({ title, value, subtext, icon, color }: any) => (
  <Card sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {React.cloneElement(icon, { sx: { color: color, fontSize: 24 } })}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', my: 0.5 }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: '#94a3b8' }}>{subtext}</Typography>
    </Box>
  </Card>
);

export default function PendingApprovalPage() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Pending Approval</Typography>
          <Typography variant="body2" color="text.secondary">Dashboard &gt; Listings &gt; Pending Approval</Typography>
        </Box>
      </Box>

      {/* Metrics Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <StatCard title="Total Pending" value="678" subtext="All types" icon={<AccessTime />} color="#f59e0b" />
        <StatCard title="New Today" value="128" subtext="Added today" icon={<AddCircle />} color="#10b981" />
        <StatCard title="Products" value="512" subtext="75.5% of total" icon={<Inventory2Outlined />} color="#3b82f6" />
        <StatCard title="Sellers" value="166" subtext="24.5% of total" icon={<PeopleAltOutlined />} color="#8b5cf6" />
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        {/* Filter Bar */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, borderBottom: '1px solid #f1f5f9', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', px: 2, py: 1, borderRadius: 2, border: '1px solid #e2e8f0', flex: 1, minWidth: 250 }}>
            <Box component="input" placeholder="Search by title, seller or category..." sx={{ border: 'none', bgcolor: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value="" displayEmpty sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="">All Categories</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value="" displayEmpty sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="">All Types</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value="" displayEmpty sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="">All Locations</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#64748b' }}>Filter</Button>
          <Button variant="text" sx={{ textTransform: 'none', color: '#64748b' }}>Reset</Button>
        </Box>

        {/* Tabs & Bulk Actions */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {['All (678)', 'Products (512)', 'Sellers (166)'].map(tab => (
              <Typography 
                key={tab} 
                variant="body2" 
                sx={{ 
                  fontWeight: activeTab === tab.split(' ')[0] ? 600 : 500, 
                  color: activeTab === tab.split(' ')[0] ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.split(' ')[0] ? '2px solid #2563eb' : 'none',
                  pb: 1, mb: -2
                }}
                onClick={() => setActiveTab(tab.split(' ')[0])}
              >
                {tab}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select value="" displayEmpty sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
                <MenuItem value="">Bulk Actions</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}>Approve All</Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Listing Details</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Seller</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Category</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Price</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Submitted On</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingData.map((item, idx) => (
                <TableRow key={idx} hover>
                  <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                  
                  {/* Listing Details */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#f1f5f9' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>{item.id}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Seller */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={item.avatar} sx={{ width: 28, height: 28 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>{item.seller}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>{item.sellerId}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>{item.category}</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{item.subcategory}</Typography>
                  </TableCell>

                  {/* Price */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{item.price}</Typography>
                  </TableCell>

                  {/* Submitted On */}
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#334155' }}>{item.submitted}</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{item.time}</Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button size="small" variant="outlined" color="success" sx={{ fontSize: '0.7rem', py: 0, px: 1, borderRadius: 1.5, textTransform: 'none', bgcolor: '#f0fdf4' }}>Approve</Button>
                      <Button size="small" variant="outlined" color="error" sx={{ fontSize: '0.7rem', py: 0, px: 1, borderRadius: 1.5, textTransform: 'none', bgcolor: '#fef2f2' }}>Reject</Button>
                      <Button size="small" variant="outlined" sx={{ fontSize: '0.7rem', py: 0, px: 1, borderRadius: 1.5, textTransform: 'none', color: '#64748b', borderColor: '#e2e8f0' }}>View</Button>
                      <IconButton size="small"><MoreVert sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
          <Typography variant="body2" color="text.secondary">Showing 1 to 8 of 678 pending listings</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Pagination count={85} shape="rounded" color="primary" size="small" />
            <FormControl size="small">
              <Select value="10" sx={{ borderRadius: 2, fontSize: '0.8rem', height: 32 }}>
                <MenuItem value="10">10 / page</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Card>

      {/* Footer Guidelines */}
      <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1.5, minWidth: 300 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1e293b' }}>Guidelines for Approval</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="body2" sx={{ color: '#475569' }}>Make sure the listing title and description are clear and relevant.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="body2" sx={{ color: '#475569' }}>Check images quality and ensure there is no watermark.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="body2" sx={{ color: '#475569' }}>Verify correct category and appropriate pricing.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="body2" sx={{ color: '#475569' }}>Ensure there is no banned, illegal or misleading content.</Typography>
            </Box>
          </Box>
        </Box>
        
        <Card sx={{ flex: 1, minWidth: 200, p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2, boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CheckCircle sx={{ color: '#166534', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#166534' }}>Approve</Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#15803d' }}>Listing will be visible to users.</Typography>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200, p: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2, boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CancelOutlined sx={{ color: '#991b1b', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#991b1b' }}>Reject</Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#b91c1c' }}>Listing will be rejected and seller will be notified.</Typography>
        </Card>
      </Box>

    </Box>
  );
}
