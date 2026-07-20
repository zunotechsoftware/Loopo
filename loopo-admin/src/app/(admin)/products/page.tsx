'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search,
  MoreVert,
  Edit,
  CheckCircle,
  Cancel,
  StarBorder,
  DeleteForever
} from '@mui/icons-material';

const MOCK_PRODUCTS = [
  { id: '1', title: 'Wireless Headphones', vendor: 'TechGear', category: 'Electronics', price: '$129.99', status: 'Active', stock: 45 },
  { id: '2', title: 'Ergonomic Chair', vendor: 'OfficePlus', category: 'Furniture', price: '$199.50', status: 'Pending Approval', stock: 12 },
  { id: '3', title: 'Running Shoes', vendor: 'SportsCo', category: 'Clothing', price: '$89.00', status: 'Active', stock: 89 },
  { id: '4', title: 'Smart Watch', vendor: 'TechGear', category: 'Electronics', price: '$249.99', status: 'Rejected', stock: 0 },
  { id: '5', title: 'Yoga Mat', vendor: 'FitLife', category: 'Sports', price: '$29.99', status: 'Pending Approval', stock: 150 },
];

export default function ProductsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, productId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedProductId(productId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProductId(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  let filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (tabValue === 1) filteredProducts = filteredProducts.filter(p => p.status === 'Active');
  if (tabValue === 2) filteredProducts = filteredProducts.filter(p => p.status === 'Pending Approval');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Products Management</Typography>
      </Box>

      <Card sx={{ pt: 2, px: 2, pb: 0 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tab label="All Products" />
          <Tab label="Active" />
          <Tab label="Pending Approval" />
        </Tabs>

        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            placeholder="Search by title or vendor..."
            variant="outlined"
            size="small"
            sx={{ width: 400 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{ input: { 
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
             } }}
          />
        </Box>

        <TableContainer sx={{ pb: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell sx={{ fontWeight: 'medium' }}>{product.title}</TableCell>
                  <TableCell>{product.vendor}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Chip 
                      label={product.status} 
                      size="small" 
                      color={
                        product.status === 'Active' ? 'success' : 
                        product.status === 'Pending Approval' ? 'warning' : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuOpen(e, product.id)}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Edit fontSize="small" sx={{ mr: 1 }} color="info" /> Review Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <CheckCircle fontSize="small" sx={{ mr: 1 }} color="success" /> Approve Listing
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Cancel fontSize="small" sx={{ mr: 1 }} color="error" /> Reject Listing
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <StarBorder fontSize="small" sx={{ mr: 1 }} color="warning" /> Boost/Feature
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <DeleteForever fontSize="small" sx={{ mr: 1 }} color="error" /> Remove
          </MenuItem>
        </Menu>
      </Card>
    </Box>
  );
}
