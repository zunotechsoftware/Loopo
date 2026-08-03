'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Avatar,
  IconButton,
  Pagination,
  Chip
} from '@mui/material';
import {
  LocalOffer,
  CheckCircle,
  PauseCircleFilled,
  Inventory2,
  Star,
  StarBorder,
  Visibility,
  Edit,
  MoreVert,
  Add,
  FileDownload,
  FilterList
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';

const StatCard = ({ title, value, trend, icon, color, trendColor }: any) => (
  <Card sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'flex-start', gap: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {React.cloneElement(icon, { sx: { color: color, fontSize: 24 } })}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', my: 0.5 }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: trendColor }}>
        {trend} <span style={{ color: '#94a3b8' }}>vs last month</span>
      </Typography>
    </Box>
  </Card>
);

const brandsData = [
  { id: 1, name: 'Apple', slug: 'apple', category: 'Electronics', products: '12,456', status: 'Active', featured: true, date: '12 May 2024', time: '10:30 AM', logo: 'https://logo.clearbit.com/apple.com' },
  { id: 2, name: 'Samsung', slug: 'samsung', category: 'Electronics', products: '8,751', status: 'Active', featured: true, date: '12 May 2024', time: '09:15 AM', logo: 'https://logo.clearbit.com/samsung.com' },
  { id: 3, name: 'Xiaomi', slug: 'xiaomi', category: 'Electronics', products: '6,321', status: 'Active', featured: false, date: '11 May 2024', time: '06:40 PM', logo: 'https://logo.clearbit.com/mi.com' },
  { id: 4, name: 'Nike', slug: 'nike', category: 'Fashion', products: '4,895', status: 'Active', featured: true, date: '11 May 2024', time: '05:20 PM', logo: 'https://logo.clearbit.com/nike.com' },
  { id: 5, name: 'Sony', slug: 'sony', category: 'Electronics', products: '4,235', status: 'Active', featured: false, date: '11 May 2024', time: '04:10 PM', logo: 'https://logo.clearbit.com/sony.com' },
  { id: 6, name: 'Dell', slug: 'dell', category: 'Electronics', products: '3,987', status: 'Active', featured: false, date: '10 May 2024', time: '03:45 PM', logo: 'https://logo.clearbit.com/dell.com' },
  { id: 7, name: 'HP', slug: 'hp', category: 'Electronics', products: '3,456', status: 'Active', featured: false, date: '10 May 2024', time: '02:30 PM', logo: 'https://logo.clearbit.com/hp.com' },
  { id: 8, name: 'Adidas', slug: 'adidas', category: 'Fashion', products: '2,987', status: 'Inactive', featured: false, date: '10 May 2024', time: '01:20 PM', logo: 'https://logo.clearbit.com/adidas.com' },
  { id: 9, name: 'Bosch', slug: 'bosch', category: 'Home Appliances', products: '2,654', status: 'Active', featured: false, date: '09 May 2024', time: '11:30 AM', logo: 'https://logo.clearbit.com/bosch.com' },
  { id: 10, name: 'Canon', slug: 'canon', category: 'Cameras', products: '2,341', status: 'Active', featured: false, date: '09 May 2024', time: '10:15 AM', logo: 'https://logo.clearbit.com/canon.com' },
];

export default function BrandsPage() {
  const router = useRouter();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Brand Management</Typography>
          <Typography variant="body2" color="text.secondary">Dashboard &gt; Brands &gt; All Brands</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff', px: 2, py: 1, borderRadius: 2, border: '1px solid #e2e8f0', minWidth: 250 }}>
            <Box component="input" placeholder="Search brands..." sx={{ border: 'none', bgcolor: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
          </Box>
        </Box>
      </Box>

      {/* Metrics Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <StatCard title="Total Brands" value="2,456" trend="↑ 8.6%" icon={<LocalOffer />} color="#8b5cf6" trendColor="#10b981" />
        <StatCard title="Active Brands" value="2,123" trend="↑ 7.2%" icon={<CheckCircle />} color="#10b981" trendColor="#10b981" />
        <StatCard title="Inactive Brands" value="333" trend="↓ 3.1%" icon={<PauseCircleFilled />} color="#ef4444" trendColor="#ef4444" />
        <StatCard title="Total Products" value="1,24,350" trend="↑ 12.5%" icon={<Inventory2 />} color="#3b82f6" trendColor="#10b981" />
        <StatCard title="Featured Brands" value="156" trend="↑ 9.8%" icon={<Star />} color="#f59e0b" trendColor="#10b981" />
      </Box>

      {/* Main Table Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        {/* Filter Bar */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, borderBottom: '1px solid #f1f5f9', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', px: 2, py: 1, borderRadius: 2, border: '1px solid #e2e8f0', flex: 1, minWidth: 250 }}>
            <Box component="input" placeholder="Search by brand name, slug..." sx={{ border: 'none', bgcolor: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value="" displayEmpty sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="">All Status</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value="" displayEmpty sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="">All Categories</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value="" displayEmpty sx={{ borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
              <MenuItem value="">All Countries</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" startIcon={<FilterList />} sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#64748b' }}>Filters</Button>
          <Button variant="text" sx={{ textTransform: 'none', color: '#64748b' }}>Reset</Button>
          
          <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<FileDownload />} sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#334155' }}>Export</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/brands/add')} sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}>Add Brand</Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Brand</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Category</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Products</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Featured</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Created On</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {brandsData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={row.logo} alt={row.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{row.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>{row.slug}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#475569' }}>{row.category}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{row.products}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small" 
                      sx={{ 
                        bgcolor: row.status === 'Active' ? '#dcfce7' : '#fee2e2',
                        color: row.status === 'Active' ? '#166534' : '#991b1b',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        borderRadius: 1
                      }} 
                    />
                  </TableCell>

                  <TableCell align="center">
                    {row.featured ? (
                      <Star sx={{ color: '#f59e0b', fontSize: 20 }} />
                    ) : (
                      <StarBorder sx={{ color: '#cbd5e1', fontSize: 20 }} />
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#334155' }}>{row.date}</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{row.time}</Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton size="small"><Visibility sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                      <IconButton size="small"><Edit sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                      <IconButton size="small"><MoreVert sx={{ fontSize: 18, color: '#64748b' }} /></IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
          <Typography variant="body2" color="text.secondary">Showing 1 to 10 of 2,456 brands</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Pagination count={246} shape="rounded" color="primary" size="small" />
            <FormControl size="small">
              <Select value="10" sx={{ borderRadius: 2, fontSize: '0.8rem', height: 32 }}>
                <MenuItem value="10">10 / page</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
