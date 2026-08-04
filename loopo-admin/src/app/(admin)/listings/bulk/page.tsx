'use client';

import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton
} from '@mui/material';
import {
  CloudUpload,
  Download,
  CheckCircle,
  Error,
  CancelOutlined,
  PlayArrow,
  AssignmentTurnedIn,
  DescriptionOutlined
} from '@mui/icons-material';

const uploadHistory = [
  { id: 1, name: 'products_12_may_2024.csv', type: 'Products', records: '1,048', status: 'Completed', date: '12 May 2024, 10:30 AM' },
  { id: 2, name: 'products_10_may_2024.xlsx', type: 'Products', records: '856', status: 'Completed', date: '10 May 2024, 04:20 PM' },
  { id: 3, name: 'products_08_may_2024.csv', type: 'Products', records: '2,350', status: 'Failed', date: '08 May 2024, 11:15 AM' },
  { id: 4, name: 'products_05_may_2024.xlsx', type: 'Products', records: '1,125', status: 'Completed', date: '05 May 2024, 02:45 PM' },
  { id: 5, name: 'products_03_may_2024.csv', type: 'Products', records: '980', status: 'Completed', date: '03 May 2024, 09:30 AM' },
];

export default function BulkUploadPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Bulk Upload</Typography>
          <Typography variant="body2" color="text.secondary">Dashboard &gt; Listings &gt; Bulk Upload</Typography>
        </Box>
      </Box>

      {/* Custom Stepper */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
        {/* Step 1 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>1</Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>Upload File</Typography>
            <Typography variant="caption" sx={{ color: '#2563eb' }}>Upload your data file</Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, height: 2, bgcolor: '#e2e8f0', mx: 3 }} />
        {/* Step 2 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: 0.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>2</Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>Map Fields</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Map file columns</Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, height: 2, bgcolor: '#e2e8f0', mx: 3 }} />
        {/* Step 3 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: 0.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>3</Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>Preview Data</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Review & confirm</Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, height: 2, bgcolor: '#e2e8f0', mx: 3 }} />
        {/* Step 4 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: 0.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>4</Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>Import</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Import data</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Left Column - Upload Area */}
        <Box sx={{ flex: 2, minWidth: 400 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Upload Your File</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Download the sample file, prepare your data and upload it here.</Typography>
          
          <Box sx={{ 
            border: '2px dashed #cbd5e1', 
            borderRadius: 3, 
            bgcolor: '#f8fafc',
            p: 6, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { borderColor: '#2563eb', bgcolor: '#eff6ff' }
          }}>
            <CloudUpload sx={{ fontSize: 64, color: '#3b82f6', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>Drag & drop your file here</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>or</Typography>
            <Button variant="contained" startIcon={<CloudUpload />} sx={{ px: 4, py: 1, borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb', fontWeight: 600 }}>Choose File</Button>
            <Typography variant="caption" sx={{ color: '#64748b', mt: 4, display: 'block' }}>Supported formats: CSV, XLS, XLSX</Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Maximum file size: 10MB</Typography>
          </Box>
        </Box>

        {/* Right Column - Instructions */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Instructions</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>1.</Typography>
              <Typography variant="body2" sx={{ color: '#334155' }}>Download the sample file and fill your data.</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>2.</Typography>
              <Typography variant="body2" sx={{ color: '#334155' }}>Do not change the column headers.</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>3.</Typography>
              <Typography variant="body2" sx={{ color: '#334155' }}>First row should contain the column names.</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>4.</Typography>
              <Typography variant="body2" sx={{ color: '#334155' }}>Maximum 5,000 records are allowed per file.</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>5.</Typography>
              <Typography variant="body2" sx={{ color: '#334155' }}>Supported file formats: CSV, XLS, XLSX.</Typography>
            </Box>
          </Box>

          <Button variant="outlined" startIcon={<Download />} sx={{ mt: 4, px: 3, py: 1, borderRadius: 2, textTransform: 'none', color: '#2563eb', borderColor: '#bfdbfe', '&:hover': { borderColor: '#2563eb', bgcolor: '#eff6ff' } }}>
            Download Sample File
          </Button>
        </Box>
      </Box>

      {/* Upload History */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Upload History</Typography>
        <Card sx={{ borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>File Name</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Type</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Records</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Uploaded On</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uploadHistory.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>{row.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#475569' }}>{row.type}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#475569' }}>{row.records}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: row.status === 'Completed' ? '#dcfce7' : '#fee2e2',
                          color: row.status === 'Completed' ? '#166534' : '#991b1b',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          borderRadius: 1
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#475569' }}>{row.date}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <Download sx={{ fontSize: 20 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      {/* Upload Tips */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Upload Tips</Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 250, p: 2, display: 'flex', alignItems: 'flex-start', gap: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#eff6ff' }}>
              <DescriptionOutlined sx={{ color: '#2563eb' }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>Use the sample file</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.5, display: 'block' }}>Download our sample file and use the same format.</Typography>
            </Box>
          </Card>
          
          <Card sx={{ flex: 1, minWidth: 250, p: 2, display: 'flex', alignItems: 'flex-start', gap: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#eff6ff' }}>
              <AssignmentTurnedIn sx={{ color: '#2563eb' }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>Check your data</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.5, display: 'block' }}>Make sure all mandatory fields are filled.</Typography>
            </Box>
          </Card>

          <Card sx={{ flex: 1, minWidth: 250, p: 2, display: 'flex', alignItems: 'flex-start', gap: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#ecfdf5' }}>
              <CheckCircle sx={{ color: '#10b981' }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>Validate before import</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.5, display: 'block' }}>Preview your data and fix errors if any.</Typography>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#64748b', px: 3 }}>Cancel</Button>
        <Button variant="contained" endIcon={<PlayArrow />} sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb', px: 4 }}>Next: Map Fields</Button>
      </Box>
    </Box>
  );
}
