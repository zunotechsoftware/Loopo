import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, Grid, Chip, Avatar, Divider 
} from '@mui/material';

interface ListingDialogProps {
  open: boolean;
  onClose: () => void;
  listing: any;
  mode: 'view' | 'edit';
  onSuccess: () => void;
}

export default function ListingDialog({ open, onClose, listing }: ListingDialogProps) {
  if (!listing) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' } }}>
      <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #f1f5f9', pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 8, height: 24, bgcolor: '#3b82f6', borderRadius: 4 }} />
        Listing Details
      </DialogTitle>
      
      <DialogContent sx={{ p: 4, pt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Title</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mt: 0.5 }}>
              {listing.title}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Price</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
              {listing.currency} {listing.price?.toLocaleString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Condition</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', mt: 0.5 }}>
              {listing.condition?.split('_').map((w: string) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Description</Typography>
            <Typography variant="body2" sx={{ color: '#475569', mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
              {listing.description || 'No description provided.'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Seller</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
              <Avatar 
                src={listing.seller?.profile?.profilePicture || `https://ui-avatars.com/api/?name=${listing.seller?.profile?.displayName || listing.seller?.firstName}&background=random`} 
                sx={{ width: 36, height: 36, border: '2px solid #e2e8f0' }} 
              />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {listing.seller?.profile?.displayName || listing.seller?.firstName || 'Unknown Seller'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Category</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mt: 1 }}>
              {listing.category?.name || 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, mb: 1, display: 'block' }}>Status</Typography>
            <Box>
              <Chip label={listing.status} sx={{ fontSize: '0.75rem', fontWeight: 700, px: 1, bgcolor: listing.status === 'APPROVED' ? '#10b98120' : '#f1f5f9', color: listing.status === 'APPROVED' ? '#10b981' : '#64748b' }} />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2.5, px: 4, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
        <Button onClick={onClose} variant="contained" disableElevation sx={{ bgcolor: '#334155', borderRadius: 2, '&:hover': { bgcolor: '#1e293b' } }}>
          Close Dialog
        </Button>
      </DialogActions>
    </Dialog>
  );
}
