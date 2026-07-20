'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem as SelectItem, Switch,
  FormControlLabel, Collapse, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import {
  Add, Edit, Delete, ExpandMore, ExpandLess,
  Category as CategoryIcon, FolderOpen, Close, Save
} from '@mui/icons-material';
import { Category, CategoryAttribute } from '@/types';

const MOCK_CATEGORIES: Category[] = [
  {
    id: '1', name: 'Electronics', slug: 'electronics', isActive: true, createdAt: '2025-01-01',
    children: [
      { id: '1-1', name: 'Phones', slug: 'phones', parentId: '1', isActive: true, createdAt: '2025-01-01', attributes: [
        { id: 'a1', name: 'Brand', type: 'select', required: true, options: ['Apple', 'Samsung', 'Google', 'OnePlus'] },
        { id: 'a2', name: 'Storage (GB)', type: 'number', required: false },
      ]},
      { id: '1-2', name: 'Laptops', slug: 'laptops', parentId: '1', isActive: true, createdAt: '2025-01-01', attributes: [
        { id: 'a3', name: 'RAM (GB)', type: 'number', required: true },
        { id: 'a4', name: 'OS', type: 'select', required: true, options: ['Windows', 'macOS', 'Linux'] },
      ]},
    ],
  },
  {
    id: '2', name: 'Clothing', slug: 'clothing', isActive: true, createdAt: '2025-01-02',
    children: [
      { id: '2-1', name: "Men's Wear", slug: 'mens-wear', parentId: '2', isActive: true, createdAt: '2025-01-02', attributes: [
        { id: 'a5', name: 'Size', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
        { id: 'a6', name: 'Material', type: 'text', required: false },
      ]},
    ],
  },
  {
    id: '3', name: 'Home & Garden', slug: 'home-garden', isActive: false, createdAt: '2025-01-03',
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCreate = (parentId?: string) => {
    setEditingCategory({ isActive: true, parentId });
    setOpenDialog(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory({ ...cat });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSave = () => {
    // In a real app, call categoriesService.create/update here
    handleCloseDialog();
  };

  const renderCategoryRow = (cat: Category, depth = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expanded[cat.id];

    return (
      <React.Fragment key={cat.id}>
        <TableRow
          hover
          sx={{ 
            bgcolor: depth === 0 ? 'background.paper' : '#f8fafc',
            '& td': { borderBottom: 'none' }
          }}
        >
          <TableCell sx={{ pl: depth === 0 ? 2 : 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {hasChildren && (
                <IconButton size="small" onClick={() => toggleExpand(cat.id)}>
                  {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>
              )}
              {!hasChildren && <Box sx={{ width: 28 }} />}
              <ListItemIcon sx={{ minWidth: 32 }}>
                {depth === 0 ? <FolderOpen color="primary" /> : <CategoryIcon color="action" fontSize="small" />}
              </ListItemIcon>
              <Typography sx={{ fontWeight: depth === 0 ? 600 : 400 }}>{cat.name}</Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
              {cat.slug}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2" color="text.secondary">
              {cat.attributes?.length || 0} attributes
            </Typography>
          </TableCell>
          <TableCell>
            <Chip
              size="small"
              label={cat.isActive ? 'Active' : 'Inactive'}
              color={cat.isActive ? 'success' : 'default'}
            />
          </TableCell>
          <TableCell align="right">
            <IconButton size="small" color="primary" onClick={() => handleOpenCreate(cat.id)} title="Add child category">
              <Add fontSize="small" />
            </IconButton>
            <IconButton size="small" color="info" onClick={() => handleOpenEdit(cat)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error">
              <Delete fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && cat.children!.map(child => renderCategoryRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Categories Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenCreate()}>
          Add Category
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Category Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Slug</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Attributes</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map(cat => renderCategoryRow(cat))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingCategory?.id ? 'Edit Category' : 'Create Category'}
          <IconButton onClick={handleCloseDialog}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          <TextField
            label="Category Name"
            fullWidth
            required
            value={editingCategory?.name || ''}
            onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            label="Slug"
            fullWidth
            value={editingCategory?.slug || ''}
            onChange={(e) => setEditingCategory(prev => ({ ...prev, slug: e.target.value }))}
            helperText="Auto-generated from name if left empty"
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={editingCategory?.description || ''}
            onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
          />
          <FormControlLabel
            control={
              <Switch
                checked={editingCategory?.isActive ?? true}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, isActive: e.target.checked }))}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">Cancel</Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
