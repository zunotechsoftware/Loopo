'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Grid, Chip, Rating,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, TextField, InputAdornment, Menu, MenuItem,
  Select, FormControl, InputLabel, Divider, Avatar, Pagination, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Tooltip,
  Breadcrumbs, Link, Paper, CircularProgress, FormControlLabel, Checkbox,
} from '@mui/material';
import {
  Search, MoreVert, Visibility, RestartAlt,
  StarBorder, ThumbUpAltOutlined,
  VisibilityOff, ReportProblem,
  CheckCircle, Flag, History, DeleteOutline, RestartAltOutlined,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Review } from '@/types';
import { reviewsService } from '@/services/admin.service';

const PAGE_SIZE = 10;

const REVIEW_TYPE_LABELS: Record<string, string> = {
  SELLER_REVIEW: 'Seller Review',
  BUYER_REVIEW: 'Buyer Review',
  PRODUCT_REVIEW: 'Product Review',
  TRANSACTION_REVIEW: 'Transaction Review',
};

const CATEGORY_LABELS: { key: keyof Review['ratings'][number]; label: string }[] = [
  { key: 'communication', label: 'Communication' },
  { key: 'productAccuracy', label: 'Product Accuracy' },
  { key: 'behaviour', label: 'Behaviour' },
  { key: 'deliveryExperience', label: 'Meeting Experience' },
  { key: 'responseTime', label: 'Response Time' },
  { key: 'valueForMoney', label: 'Value for Money' },
];

function reviewerName(r?: { firstName?: string; lastName?: string } | null) {
  if (!r) return 'Unknown';
  return `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Unknown';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReviewsPage() {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({ total: 0, hidden: 0, reported: 0 });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [visibilityFilter, setVisibilityFilter] = useState<'All' | 'Visible' | 'Hidden'>('All');
  const [reportedOnly, setReportedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [activeDetail, setActiveDetail] = useState<Review | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>(
    { open: false, message: '', severity: 'success' },
  );

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      };
      if (typeFilter !== 'All Types') params.type = typeFilter;
      if (visibilityFilter !== 'All') params.isVisible = visibilityFilter === 'Visible';
      if (reportedOnly) params.reportedOnly = true;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await reviewsService.getAll(params);
      const data = res.data?.data ?? res.data;
      setReviews(data?.items || []);
      setTotal(data?.total || 0);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load reviews', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, visibilityFilter, reportedOnly, searchTerm]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Lightweight summary counts (take:1 just to read `total` from each facet) -
  // avoids fabricating numbers the backend doesn't actually expose.
  useEffect(() => {
    Promise.all([
      reviewsService.getAll({ take: 1 }),
      reviewsService.getAll({ take: 1, isVisible: false }),
      reviewsService.getAll({ take: 1, reportedOnly: true }),
    ]).then(([allRes, hiddenRes, reportedRes]) => {
      const allData = allRes.data?.data ?? allRes.data;
      const hiddenData = hiddenRes.data?.data ?? hiddenRes.data;
      const reportedData = reportedRes.data?.data ?? reportedRes.data;
      setSummary({
        total: allData?.total || 0,
        hidden: hiddenData?.total || 0,
        reported: reportedData?.total || 0,
      });
    }).catch(() => {});
  }, [reviews]);

  const handleReset = () => {
    setSearchTerm('');
    setTypeFilter('All Types');
    setVisibilityFilter('All');
    setReportedOnly(false);
    setPage(1);
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, review: Review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };
  const handleCloseMenu = () => setAnchorEl(null);

  const handleOpenDetail = async (review: Review) => {
    handleCloseMenu();
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await reviewsService.getById(review.id);
      const data = res.data?.data ?? res.data;
      setActiveDetail(data);
    } catch {
      setActiveDetail(review);
    } finally {
      setDetailLoading(false);
    }
  };

  const runAction = async (action: 'hide' | 'restore' | 'delete', id: string) => {
    setActionLoading(true);
    try {
      if (action === 'hide') await reviewsService.hide(id);
      if (action === 'restore') await reviewsService.restore(id);
      if (action === 'delete') await reviewsService.delete(id);
      setSnackbar({
        open: true,
        message: `Review ${action === 'hide' ? 'hidden' : action === 'restore' ? 'restored' : 'deleted'} successfully`,
        severity: 'success',
      });
      handleCloseMenu();
      if (activeDetail?.id === id) {
        const res = await reviewsService.getById(id);
        const data = res.data?.data ?? res.data;
        setActiveDetail(data);
      }
      fetchReviews();
    } catch {
      setSnackbar({ open: true, message: `Failed to ${action} review`, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const getVisibilityChip = (review: Review) => {
    if (review.deletedAt) {
      return <Chip label="Deleted" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#f3f4f6', color: '#4b5563', borderRadius: 1.5 }} />;
    }
    if (!review.isVisible) {
      return <Chip label="Hidden" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#fef3c7', color: '#92400e', borderRadius: 1.5 }} />;
    }
    return <Chip label="Visible" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#ecfdf5', color: '#059669', borderRadius: 1.5 }} />;
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* Top Header & Breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Review Moderation</Typography>
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
            <Link underline="hover" color="inherit" onClick={() => router.push('/dashboard')} sx={{ cursor: 'pointer' }}>
              Dashboard
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 500 }}>Reviews Management</Typography>
          </Breadcrumbs>
        </Box>
      </Box>

      {/* Summary Cards - real counts only, no fabricated breakdowns */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2.5, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#f3e8ff', width: 44, height: 44 }}><StarBorder sx={{ color: '#8b5cf6' }} /></Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Total Reviews</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.25 }}>{summary.total}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2.5, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#fef3c7', width: 44, height: 44 }}><VisibilityOff sx={{ color: '#d97706' }} /></Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Currently Hidden</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.25 }}>{summary.hidden}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2.5, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#fee2e2', width: 44, height: 44 }}><ReportProblem sx={{ color: '#dc2626' }} /></Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Reported Reviews</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.25 }}>{summary.reported}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filters + Table */}
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white', p: 3 }}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search review content..."
            size="small"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            sx={{ minWidth: 260, flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: '#94a3b8' }} /></InputAdornment> } }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} sx={{ borderRadius: 2 }}>
              <MenuItem value="All Types">All Types</MenuItem>
              {Object.entries(REVIEW_TYPE_LABELS).map(([val, label]) => (
                <MenuItem key={val} value={val}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={visibilityFilter} onChange={(e) => { setVisibilityFilter(e.target.value as any); setPage(1); }} sx={{ borderRadius: 2 }}>
              <MenuItem value="All">All Visibility</MenuItem>
              <MenuItem value="Visible">Visible</MenuItem>
              <MenuItem value="Hidden">Hidden</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Checkbox checked={reportedOnly} onChange={(e) => { setReportedOnly(e.target.checked); setPage(1); }} size="small" />}
            label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Reported only</Typography>}
          />

          <IconButton onClick={handleReset} title="Reset Filters" sx={{ border: '1px solid #cbd5e1', borderRadius: 2, p: 0.8 }}>
            <RestartAlt sx={{ fontSize: 18, color: '#64748b' }} />
          </IconButton>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 850 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>REVIEW</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>REVIEWER</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>SELLER / PRODUCT</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>VISIBILITY</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>DATE</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    No reviews found matching current filter criteria
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => {
                  const overall = review.ratings?.[0]?.overall || 0;
                  return (
                    <TableRow key={review.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {review.title || REVIEW_TYPE_LABELS[review.reviewType] || 'Review'}
                          </Typography>
                          {review.isVerified && (
                            <Chip icon={<CheckCircle sx={{ fontSize: '12px !important' }} />} label="Verified" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#d1fae5', color: '#047857', fontWeight: 700 }} />
                          )}
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 0.5 }}>
                          <Rating value={overall} readOnly size="small" />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#d97706' }}>{overall}.0</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {review.content || <em>No written review text</em>}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1d4ed8', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            {reviewerName(review.reviewer).charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>{reviewerName(review.reviewer)}</Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>{review.reviewer?.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{reviewerName(review.targetUser)}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{review.product?.title || '—'}</Typography>
                      </TableCell>
                      <TableCell>{getVisibilityChip(review)}</TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                          {formatDate(review.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenDetail(review)} sx={{ color: '#1d4ed8' }} title="View details">
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => handleActionClick(e, review)} sx={{ color: '#64748b' }}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} reviews
          </Typography>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_e, value) => setPage(value)}
            variant="outlined"
            shape="rounded"
            size="small"
            color="primary"
          />
        </Box>
      </Card>

      {/* Row Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => selectedReview && handleOpenDetail(selectedReview)}>
          <Visibility fontSize="small" sx={{ mr: 1.5, color: '#1d4ed8' }} /> View Details & Reports
        </MenuItem>
        {selectedReview && !selectedReview.deletedAt && selectedReview.isVisible && (
          <MenuItem onClick={() => selectedReview && runAction('hide', selectedReview.id)} disabled={actionLoading}>
            <VisibilityOff fontSize="small" sx={{ mr: 1.5, color: '#d97706' }} /> Hide Review
          </MenuItem>
        )}
        {selectedReview && !selectedReview.deletedAt && !selectedReview.isVisible && (
          <MenuItem onClick={() => selectedReview && runAction('restore', selectedReview.id)} disabled={actionLoading}>
            <RestartAltOutlined fontSize="small" sx={{ mr: 1.5, color: '#059669' }} /> Restore Review
          </MenuItem>
        )}
        {selectedReview && !selectedReview.deletedAt && (
          <MenuItem onClick={() => selectedReview && runAction('delete', selectedReview.id)} disabled={actionLoading}>
            <DeleteOutline fontSize="small" sx={{ mr: 1.5, color: '#dc2626' }} /> Delete Review
          </MenuItem>
        )}
      </Menu>

      {/* Review Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Review Details</Typography>
            {activeDetail && getVisibilityChip(activeDetail)}
          </Box>
          {activeDetail && <Typography variant="caption" sx={{ color: '#94a3b8' }}>Submitted on {formatDate(activeDetail.createdAt)}</Typography>}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {detailLoading || !activeDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : (
            <>
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>REVIEWER</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5 }}>{reviewerName(activeDetail.reviewer)}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>{activeDetail.reviewer?.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>SELLER / PRODUCT</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5 }}>{reviewerName(activeDetail.targetUser)}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>{activeDetail.product?.title || 'No linked listing'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>Review Content & Ratings</Typography>
                <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Rating value={activeDetail.ratings?.[0]?.overall || 0} readOnly size="medium" />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#d97706' }}>{activeDetail.ratings?.[0]?.overall || 0}.0 / 5</Typography>
                    {activeDetail.isVerified && (
                      <Chip icon={<CheckCircle />} label="Verified Transaction" size="small" sx={{ bgcolor: '#d1fae5', color: '#047857', fontWeight: 700 }} />
                    )}
                  </Stack>
                  {activeDetail.title && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>"{activeDetail.title}"</Typography>
                  )}
                  <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                    {activeDetail.content || <em>No written review text</em>}
                  </Typography>

                  {activeDetail.ratings?.[0] && CATEGORY_LABELS.some(({ key }) => (activeDetail.ratings![0] as any)[key]) && (
                    <Grid container spacing={2} sx={{ mt: 2, pt: 2, borderTop: '1px dashed #e2e8f0' }}>
                      {CATEGORY_LABELS.map(({ key, label }) =>
                        (activeDetail.ratings![0] as any)[key] ? (
                          <Grid item xs={6} sm={4} key={key}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>{label.toUpperCase()}</Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{(activeDetail.ratings![0] as any)[key]} / 5</Typography>
                          </Grid>
                        ) : null,
                      )}
                    </Grid>
                  )}
                </Paper>
              </Box>

              {/* Reports filed against this review */}
              {activeDetail.reports && activeDetail.reports.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReportProblem fontSize="small" sx={{ color: '#dc2626' }} /> Reports ({activeDetail.reports.length})
                  </Typography>
                  <Stack spacing={1.5}>
                    {activeDetail.reports.map((report) => (
                      <Paper key={report.id} elevation={0} sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2.5, border: '1px solid #fecaca' }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991b1b' }}>
                            {report.reason?.label || report.reasonCode}
                          </Typography>
                          <Chip label={report.status} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                        </Stack>
                        <Typography variant="body2" sx={{ color: '#7f1d1d', mt: 0.5 }}>{report.details}</Typography>
                        <Typography variant="caption" sx={{ color: '#b91c1c' }}>
                          Reported by {reviewerName(report.reporter)} on {formatDate(report.createdAt)}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Seller's response - read-only, since only the reviewed seller
                  may author one (ReviewsService.respondToReview is strictly
                  self-authorized), never an admin on their behalf. */}
              {activeDetail.response && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>Seller's Response</Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#ecfdf5', borderRadius: 2.5, border: '1px solid #a7f3d0' }}>
                    <Typography variant="body2" sx={{ color: '#065f46' }}>{activeDetail.response.content}</Typography>
                    <Typography variant="caption" sx={{ color: '#047857' }}>{formatDate(activeDetail.response.createdAt)}</Typography>
                  </Paper>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button onClick={() => setDetailOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>Close</Button>
          {activeDetail && !activeDetail.deletedAt && (
            <Stack direction="row" spacing={1.5}>
              {activeDetail.isVisible ? (
                <Button
                  variant="outlined" color="warning" startIcon={<VisibilityOff />} disabled={actionLoading}
                  onClick={() => runAction('hide', activeDetail.id)}
                  sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                >
                  Hide
                </Button>
              ) : (
                <Button
                  variant="outlined" color="success" startIcon={<RestartAltOutlined />} disabled={actionLoading}
                  onClick={() => runAction('restore', activeDetail.id)}
                  sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                >
                  Restore
                </Button>
              )}
              <Button
                variant="contained" color="error" startIcon={<DeleteOutline />} disabled={actionLoading}
                onClick={() => runAction('delete', activeDetail.id)}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                Delete
              </Button>
            </Stack>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
