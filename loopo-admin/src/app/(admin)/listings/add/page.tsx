'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  IconButton,
  Divider,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  CloudUpload,
  Close,
  CheckCircle,
  Help,
  PhoneIphone,
  Check
} from '@mui/icons-material';

const steps = [
  { label: 'Basic Information', desc: 'Add product details' },
  { label: 'Images', desc: 'Upload product images' },
  { label: 'Price & Details', desc: 'Set price and condition' },
  { label: 'Additional Info', desc: 'More listing details' },
  { label: 'Preview', desc: 'Review and publish' }
];

export default function AddListingPage() {
  const [highlights, setHighlights] = useState<string[]>(['128GB Storage', 'Blue Color', 'Good Battery Health', 'Original Box', 'No Scratches']);
  const [highlightInput, setHighlightInput] = useState('');
  
  const [title, setTitle] = useState('iPhone 13 128GB Blue');
  const [description, setDescription] = useState('iPhone 13 in excellent condition. 128GB storage, blue color.\nNo scratches, comes with original box and charger.\nBattery health 89%. Used for 6 months only.');
  
  const [condition, setCondition] = useState('Like New');
  const [availability, setAvailability] = useState('In Stock');

  const handleAddHighlight = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && highlightInput.trim() !== '') {
      e.preventDefault();
      if (highlights.length < 5 && !highlights.includes(highlightInput.trim())) {
        setHighlights([...highlights, highlightInput.trim()]);
      }
      setHighlightInput('');
    }
  };

  const handleRemoveHighlight = (item: string) => {
    setHighlights(highlights.filter(h => h !== item));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Add Listing</Typography>
          <Typography variant="body2" color="text.secondary">Dashboard &gt; Listings &gt; Add Listing</Typography>
        </Box>
      </Box>

      {/* Stepper Card */}
      <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <Stepper activeStep={0} alternativeLabel sx={{ '& .MuiStepConnector-line': { borderColor: '#e2e8f0' } }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel 
                sx={{
                  '& .MuiStepIcon-root.Mui-active': { color: '#2563eb' },
                  '& .MuiStepIcon-root.Mui-completed': { color: '#2563eb' },
                  '& .MuiStepIcon-root': { color: '#cbd5e1' }
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: index === 0 ? 700 : 500, color: index === 0 ? '#1e293b' : '#64748b' }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  {step.desc}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      <Grid container spacing={3}>
        
        {/* Left Column - Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 4, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Basic Information</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Provide the basic details about your listing</Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Category <span style={{color: '#ef4444'}}>*</span></Typography>
                <FormControl fullWidth size="small">
                  <Select value="Electronics" sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <MenuItem value="Electronics">Electronics</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Subcategory <span style={{color: '#ef4444'}}>*</span></Typography>
                <FormControl fullWidth size="small">
                  <Select value="Mobile Phones" sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <MenuItem value="Mobile Phones">Mobile Phones</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Brand <span style={{color: '#ef4444'}}>*</span></Typography>
                <FormControl fullWidth size="small">
                  <Select value="Apple" sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <MenuItem value="Apple">Apple</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Model</Typography>
                <TextField 
                  fullWidth size="small" 
                  value="iPhone 13" 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Title <span style={{color: '#ef4444'}}>*</span></Typography>
                <Box sx={{ position: 'relative' }}>
                  <TextField 
                    fullWidth size="small" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
                  />
                  <Typography variant="caption" sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    {title.length}/100
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Description <span style={{color: '#ef4444'}}>*</span></Typography>
                <Box sx={{ position: 'relative' }}>
                  <TextField 
                    fullWidth multiline rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
                  />
                  <Box sx={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <CheckCircle sx={{ color: '#10b981', fontSize: 20, mb: 0.5 }} />
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {description.length}/1000
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Product Highlights</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Add key features of your product (Max 5)</Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {highlights.map((item, idx) => (
                    <Chip 
                      key={idx} 
                      label={item} 
                      onDelete={() => handleRemoveHighlight(item)}
                      sx={{ borderRadius: 1.5, bgcolor: '#f1f5f9', color: '#334155', fontWeight: 500 }}
                      deleteIcon={<Close sx={{ fontSize: 16 }} />}
                    />
                  ))}
                </Box>
                <TextField 
                  fullWidth size="small" 
                  placeholder="Add highlight and press Enter"
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  onKeyDown={handleAddHighlight}
                  disabled={highlights.length >= 5}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Condition <span style={{color: '#ef4444'}}>*</span></Typography>
                <RadioGroup row value={condition} onChange={(e) => setCondition(e.target.value)}>
                  {['Like New', 'Used', 'Good', 'Fair', 'Poor'].map((opt) => (
                    <Box 
                      key={opt}
                      sx={{ 
                        border: condition === opt ? '1px solid #3b82f6' : '1px solid #e2e8f0', 
                        borderRadius: 2, px: 2, py: 1, mr: 1, mb: 1,
                        bgcolor: condition === opt ? '#eff6ff' : 'transparent',
                        display: 'flex', alignItems: 'center', cursor: 'pointer'
                      }}
                      onClick={() => setCondition(opt)}
                    >
                      <Radio checked={condition === opt} size="small" sx={{ p: 0, mr: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: condition === opt ? 600 : 500, color: condition === opt ? '#2563eb' : '#64748b' }}>
                        {opt}
                      </Typography>
                    </Box>
                  ))}
                </RadioGroup>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Availability <span style={{color: '#ef4444'}}>*</span></Typography>
                <RadioGroup row value={availability} onChange={(e) => setAvailability(e.target.value)}>
                  {['In Stock', 'Out of Stock'].map((opt) => (
                    <Box 
                      key={opt}
                      sx={{ 
                        border: availability === opt ? '1px solid #3b82f6' : '1px solid #e2e8f0', 
                        borderRadius: 2, px: 2, py: 1, mr: 1,
                        bgcolor: availability === opt ? '#eff6ff' : 'transparent',
                        display: 'flex', alignItems: 'center', cursor: 'pointer'
                      }}
                      onClick={() => setAvailability(opt)}
                    >
                      <Radio checked={availability === opt} size="small" sx={{ p: 0, mr: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: availability === opt ? 600 : 500, color: availability === opt ? '#2563eb' : '#64748b' }}>
                        {opt}
                      </Typography>
                    </Box>
                  ))}
                </RadioGroup>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#64748b' }}>
                Cancel
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#334155' }}>
                  Save as Draft
                </Button>
                <Button variant="contained" sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb', px: 3 }}>
                  Save & Continue →
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Right Column - Sidebar Widgets */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Upload Images */}
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>Upload Images <span style={{color: '#ef4444'}}>*</span></Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Upload clear images of your product (Max 10 images)</Typography>
              
              <Box sx={{ border: '1px dashed #cbd5e1', borderRadius: 2, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f8fafc', mb: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f1f5f9' } }}>
                <CloudUpload sx={{ fontSize: 32, color: '#3b82f6', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>Click to upload or drag and drop</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>JPG, PNG or WEBP. Max size 5MB each.</Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 1 }}>
                {[1,2,3,4,5].map((idx) => (
                  <Box key={idx} sx={{ position: 'relative', width: 60, height: 60, borderRadius: 1.5, border: '1px solid #e2e8f0', flexShrink: 0, overflow: 'hidden' }}>
                    <Box sx={{ width: '100%', height: '100%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PhoneIphone sx={{ color: '#0f172a', fontSize: 30 }} />
                    </Box>
                    <IconButton size="small" sx={{ position: 'absolute', top: -5, right: -5, bgcolor: 'white', border: '1px solid #e2e8f0', p: 0.2, '&:hover': { bgcolor: 'white' } }}>
                      <Close sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>5/10 images uploaded</Typography>
              </Box>
              <Box sx={{ width: '100%', height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ width: '50%', height: '100%', bgcolor: '#10b981' }} />
              </Box>
            </Card>

            {/* Tips Card */}
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 'none', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, mb: 1.5, color: '#166534' }}>Tips for better results</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, color: '#22c55e' }} />
                  <Typography variant="body2" sx={{ color: '#166534', fontWeight: 500 }}>Upload clear and original images</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, color: '#22c55e' }} />
                  <Typography variant="body2" sx={{ color: '#166534', fontWeight: 500 }}>Add accurate product details</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, color: '#22c55e' }} />
                  <Typography variant="body2" sx={{ color: '#166534', fontWeight: 500 }}>Set a fair price</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, color: '#22c55e' }} />
                  <Typography variant="body2" sx={{ color: '#166534', fontWeight: 500 }}>Choose the right category</Typography>
                </Box>
              </Box>
            </Card>

            {/* Quick Preview Card */}
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>Quick Preview</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: 2, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <PhoneIphone sx={{ color: '#0f172a', fontSize: 40 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{title || 'Product Title'}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Electronics &gt; Mobile Phones &gt; Apple</Typography>
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'block', mb: 0.5 }}>{condition}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#2563eb' }}>₹32,000</Typography>
                </Box>
              </Box>
            </Card>

            {/* Need Help Card */}
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Help sx={{ fontSize: 20, color: '#64748b' }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>Need Help?</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Read our <span style={{ color: '#3b82f6', textDecoration: 'underline' }}>listing guidelines</span> to create better listings and get more buyers.
              </Typography>
              <Button variant="outlined" size="small" sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0' }}>
                View Guidelines
              </Button>
            </Card>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
