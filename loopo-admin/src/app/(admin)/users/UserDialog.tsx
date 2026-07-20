import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { AdminUser } from '@/types';
import { usersService } from '@/services/admin.service';

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user: AdminUser | null;
}

export default function UserDialog({ open, onClose, onSaved, user }: UserDialogProps) {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      const roleNames = user.roles?.map((r) => r.role.name) ?? [];
      const primaryRole = roleNames.includes('SUPER_ADMIN') ? 'SUPER_ADMIN' :
                          roleNames.includes('ADMIN') ? 'ADMIN' :
                          roleNames.includes('SELLER') ? 'SELLER' : 'CUSTOMER';
      setFormData({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        password: '',
        role: primaryRole,
      });
    } else if (open && !user) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'CUSTOMER',
      });
    }
    setError(null);
  }, [open, user]);

  const handleChange = (field: string) => (e: any) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        roles: [formData.role],
      };

      if (!isEditing) {
        if (!formData.password || formData.password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
        payload.password = formData.password;
        await usersService.create(payload);
      } else {
        await usersService.update(user!.id, payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err.message ?? 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEditing ? 'Edit User' : 'Add New User'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="First Name"
              required
              fullWidth
              size="small"
              value={formData.firstName}
              onChange={handleChange('firstName')}
            />
            <TextField
              label="Last Name"
              required
              fullWidth
              size="small"
              value={formData.lastName}
              onChange={handleChange('lastName')}
            />
          </Box>
          
          <TextField
            label="Email Address"
            type="email"
            required
            fullWidth
            size="small"
            value={formData.email}
            onChange={handleChange('email')}
          />
          
          <TextField
            label="Phone Number"
            fullWidth
            size="small"
            value={formData.phone}
            onChange={handleChange('phone')}
          />
          
          {!isEditing && (
            <TextField
              label="Password"
              type="password"
              required
              fullWidth
              size="small"
              value={formData.password}
              onChange={handleChange('password')}
              helperText="Minimum 8 characters"
            />
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={formData.role}
              onChange={handleChange('role')}
            >
              <MenuItem value="CUSTOMER">Buyer</MenuItem>
              <MenuItem value="SELLER">Seller</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
          
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {isEditing ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
