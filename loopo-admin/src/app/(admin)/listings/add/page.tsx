'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Grid,
  RadioGroup,
  Radio,
  Chip,
  IconButton,
  Divider,
  Step,
  StepLabel,
  Stepper,
  Avatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  CloudUpload,
  Close,
  CheckCircle,
  Help,
  Check,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';

// ─── Step definitions ───────────────────────────────────────────────────────
const STEPS = [
  { label: 'Basic Information', desc: 'Add product details' },
  { label: 'Images', desc: 'Upload product images' },
  { label: 'Price & Details', desc: 'Set price and condition' },
  { label: 'Additional Info', desc: 'More listing details' },
  { label: 'Preview', desc: 'Review and publish' },
];

// ─── Completion logic ────────────────────────────────────────────────────────
// Step 1 required: category, subcategory, brand, title (≥3 chars), description (≥20 chars)
const isStep1Complete = (f: FormState) =>
  !!f.category && !!f.subcategory && !!f.brand && f.title.trim().length >= 3 && f.description.trim().length >= 20;

// Step 2 required: at least 1 image
const isStep2Complete = (images: File[]) => images.length >= 1;

// Step 3 required: price > 0 and condition selected
const isStep3Complete = (f: FormState) => f.price > 0 && !!f.condition;

// Step 4 required: location city & state filled
const isStep4Complete = (f: FormState) => f.locationCity.trim().length > 0 && f.locationState.trim().length > 0;

// Step 5: complete when listing has been submitted successfully (set externally)
const isStep5Complete = (submitted: boolean) => submitted;

// ─── Per-step errors ─────────────────────────────────────────────────────────
function getStep1Errors(f: FormState) {
  return {
    category: !f.category ? 'Category is required' : '',
    subcategory: !f.subcategory ? 'Subcategory is required' : '',
    brand: !f.brand ? 'Brand is required' : '',
    title: f.title.trim().length < 3 ? 'Title must be at least 3 characters' : '',
    description: f.description.trim().length < 20 ? 'Description must be at least 20 characters' : '',
  };
}

function getStep2Errors(images: File[]) {
  return { images: images.length < 1 ? 'At least 1 image is required' : '' };
}

function getStep3Errors(f: FormState) {
  return {
    price: f.price <= 0 ? 'Price must be greater than 0' : '',
    condition: !f.condition ? 'Condition is required' : '',
  };
}

function getStep4Errors(f: FormState) {
  return {
    locationCity: !f.locationCity.trim() ? 'City is required' : '',
    locationState: !f.locationState.trim() ? 'State is required' : '',
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface FormState {
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  title: string;
  description: string;
  condition: string;
  availability: string;
  price: number;
  negotiable: boolean;
  currency: string;
  locationCity: string;
  locationState: string;
  locationCountry: string;
}

const INITIAL_FORM: FormState = {
  category: '',
  subcategory: '',
  brand: '',
  model: '',
  title: '',
  description: '',
  condition: '',
  availability: 'In Stock',
  price: 0,
  negotiable: false,
  currency: 'INR',
  locationCity: '',
  locationState: '',
  locationCountry: 'India',
};

// ─── Custom StepIcon ─────────────────────────────────────────────────────────
function CustomStepIcon({ completed, active, stepNumber }: { completed: boolean; active: boolean; stepNumber: number }) {
  if (completed) {
    return (
      <Box sx={{
        width: 32, height: 32, borderRadius: '50%',
        bgcolor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Check sx={{ color: 'white', fontSize: 16 }} />
      </Box>
    );
  }
  if (active) {
    return (
      <Box sx={{
        width: 32, height: 32, borderRadius: '50%',
        bgcolor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 0 4px #dbeafe',
      }}>
        <Typography sx={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{stepNumber}</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{
      width: 32, height: 32, borderRadius: '50%',
      bgcolor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Typography sx={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{stepNumber}</Typography>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AddListingPage() {
  // Step navigation
  const [currentStep, setCurrentStep] = useState(0);

  // Form state (single source of truth)
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // Image state
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Additional misc state
  const [highlights, setHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // ── Touched state — set when user attempts to advance ────────────────────
  const [touched, setTouched] = useState(false);

  // ── Field updater ─────────────────────────────────────────────────────────
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // ── Image handlers ────────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (images.length + selected.length > 10) {
        alert('You can upload a maximum of 10 images');
        return;
      }
      setImages(prev => [...prev, ...selected]);
      setImagePreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ── Highlights ────────────────────────────────────────────────────────────
  const handleAddHighlight = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && highlightInput.trim()) {
      e.preventDefault();
      if (highlights.length < 5 && !highlights.includes(highlightInput.trim())) {
        setHighlights(prev => [...prev, highlightInput.trim()]);
      }
      setHighlightInput('');
    }
  };

  // ── Completion derived from real state ────────────────────────────────────
  const completedSteps = useMemo(() => ({
    0: isStep1Complete(form),
    1: isStep2Complete(images),
    2: isStep3Complete(form),
    3: isStep4Complete(form),
    4: isStep5Complete(submitted),
  }), [form, images, submitted]);

  // ── Per-step errors (computed live from form state) ───────────────────────
  const step1Errors = useMemo(() => getStep1Errors(form), [form]);
  const step2Errors = useMemo(() => getStep2Errors(images), [images]);
  const step3Errors = useMemo(() => getStep3Errors(form), [form]);
  const step4Errors = useMemo(() => getStep4Errors(form), [form]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const isCurrentStepComplete = completedSteps[currentStep as keyof typeof completedSteps];

  const goNext = () => {
    if (!isCurrentStepComplete) {
      setTouched(true); // reveal errors
      return;
    }
    setTouched(false); // reset touched for next step
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setTouched(false);
    setCurrentStep(s => Math.max(s - 1, 0));
  };

  // When step changes, reset touched so errors don't pre-show
  const handleStepClick = (index: number) => {
    setTouched(false);
    setCurrentStep(index);
  };

  // ─── Step panels ────────────────────────────────────────────────────────────
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return <StepBasicInfo form={form} setField={setField} highlights={highlights} highlightInput={highlightInput} setHighlightInput={setHighlightInput} handleAddHighlight={handleAddHighlight} setHighlights={setHighlights} errors={step1Errors} touched={touched} />;
      case 1: return <StepImages images={images} imagePreviews={imagePreviews} onUpload={handleImageUpload} onRemove={handleRemoveImage} errors={step2Errors} touched={touched} />;
      case 2: return <StepPriceDetails form={form} setField={setField} errors={step3Errors} touched={touched} />;
      case 3: return <StepAdditionalInfo form={form} setField={setField} errors={step4Errors} touched={touched} />;
      case 4: return <StepPreview form={form} images={imagePreviews} highlights={highlights} onSubmit={() => setSubmitted(true)} />;
      default: return null;
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1400, margin: '0 auto' }}>

      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Add Listing</Typography>
        <Typography variant="body2" color="text.secondary">Dashboard &gt; Listings &gt; Add Listing</Typography>
      </Box>

      {/* Stepper Card */}
      <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <Stepper
          activeStep={currentStep}
          alternativeLabel
          sx={{
            '& .MuiStepConnector-line': { borderColor: '#e2e8f0' },
            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: '#2563eb' },
          }}
        >
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps[index as keyof typeof completedSteps];
            const isActive = currentStep === index;
            return (
              <Step key={step.label} completed={isCompleted}>
                <StepLabel
                  icon={
                    <CustomStepIcon completed={isCompleted} active={isActive} stepNumber={index + 1} />
                  }
                  onClick={() => handleStepClick(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: isActive ? 700 : 500, color: isActive ? '#1e293b' : isCompleted ? '#2563eb' : '#64748b' }}
                  >
                    {step.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>{step.desc}</Typography>
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Card>

      {/* Step Content */}
      <Card sx={{ p: 4, borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        {renderStepContent()}

        <Divider sx={{ my: 4 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={goBack}
            disabled={currentStep === 0}
            startIcon={<ArrowBack />}
            sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#64748b' }}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#334155' }}>
              Save as Draft
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button
                variant="contained"
                disableElevation
                onClick={goNext}
                endIcon={<ArrowForward />}
                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb', px: 3, '&:hover': { bgcolor: '#1d4ed8' } }}
              >
                Save & Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                disableElevation
                onClick={() => setSubmitted(true)}
                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#10b981', px: 3, '&:hover': { bgcolor: '#059669' } }}
              >
                Publish Listing
              </Button>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

// ─── Step 1: Basic Information ────────────────────────────────────────────────
function StepBasicInfo({
  form, setField, highlights, highlightInput, setHighlightInput, handleAddHighlight, setHighlights, errors, touched,
}: {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, val: FormState[K]) => void;
  highlights: string[];
  highlightInput: string;
  setHighlightInput: (v: string) => void;
  handleAddHighlight: (e: React.KeyboardEvent) => void;
  setHighlights: React.Dispatch<React.SetStateAction<string[]>>;
  errors: ReturnType<typeof getStep1Errors>;
  touched: boolean;
}) {
  const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Toys', 'Vehicles', 'Other'];
  const SUBCATEGORIES: Record<string, string[]> = {
    Electronics: ['Mobile Phones', 'Laptops', 'Tablets', 'Cameras', 'Accessories'],
    Furniture: ['Sofa', 'Table', 'Chair', 'Bed', 'Wardrobe'],
    Clothing: ['Men', 'Women', 'Kids', 'Footwear'],
    Books: ['Fiction', 'Non-Fiction', 'Academic', 'Comics'],
    Sports: ['Cricket', 'Football', 'Gym Equipment', 'Cycling'],
    Toys: ['Action Figures', 'Board Games', 'Puzzles'],
    Vehicles: ['Cars', 'Bikes', 'Scooters', 'Parts'],
    Other: ['Miscellaneous'],
  };
  const BRANDS: Record<string, string[]> = {
    'Mobile Phones': ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Nokia'],
    'Laptops': ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'MSI'],
    'Tablets': ['Apple', 'Samsung', 'Lenovo', 'Xiaomi'],
    'Cameras': ['Canon', 'Nikon', 'Sony', 'Fujifilm'],
    default: ['Other'],
  };
  const subcatOptions = form.category ? SUBCATEGORIES[form.category] || [] : [];
  const brandOptions = form.subcategory ? (BRANDS[form.subcategory] || BRANDS['default']) : BRANDS['default'];

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Basic Information</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Provide the basic details about your listing</Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Category <span style={{ color: '#ef4444' }}>*</span></Typography>
          <FormControl fullWidth size="small" error={touched && !!errors.category}>
            <Select
              value={form.category}
              displayEmpty
              onChange={e => { setField('category', e.target.value); setField('subcategory', ''); setField('brand', ''); }}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
            >
              <MenuItem value=""><em>Select category</em></MenuItem>
              {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
            {touched && errors.category && <FormHelperText>{errors.category}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Subcategory <span style={{ color: '#ef4444' }}>*</span></Typography>
          <FormControl fullWidth size="small" disabled={!form.category} error={touched && !!errors.subcategory}>
            <Select
              value={form.subcategory}
              displayEmpty
              onChange={e => { setField('subcategory', e.target.value); setField('brand', ''); }}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
            >
              <MenuItem value=""><em>Select subcategory</em></MenuItem>
              {subcatOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
            {touched && errors.subcategory && <FormHelperText>{errors.subcategory}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Brand <span style={{ color: '#ef4444' }}>*</span></Typography>
          <FormControl fullWidth size="small" disabled={!form.subcategory} error={touched && !!errors.brand}>
            <Select
              value={form.brand}
              displayEmpty
              onChange={e => setField('brand', e.target.value)}
              sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
            >
              <MenuItem value=""><em>Select brand</em></MenuItem>
              {brandOptions.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </Select>
            {touched && errors.brand && <FormHelperText>{errors.brand}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Model</Typography>
          <TextField
            fullWidth size="small"
            value={form.model}
            onChange={e => setField('model', e.target.value)}
            placeholder="e.g. iPhone 13"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Title <span style={{ color: '#ef4444' }}>*</span></Typography>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth size="small"
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="Enter a descriptive title"
              slotProps={{ htmlInput: { maxLength: 100 } }}
              error={touched && !!errors.title}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
            />
            <Typography variant="caption" sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              {form.title.length}/100
            </Typography>
          </Box>
          {touched && errors.title && <FormHelperText error>{errors.title}</FormHelperText>}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Description <span style={{ color: '#ef4444' }}>*</span></Typography>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth multiline rows={5}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="Describe the condition, features, and specifications..."
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              error={touched && !!errors.description}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
            />
            <Box sx={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {form.description.length >= 20 && <CheckCircle sx={{ color: '#10b981', fontSize: 20, mb: 0.5 }} />}
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>{form.description.length}/1000</Typography>
            </Box>
          </Box>
          {touched && errors.description && <FormHelperText error>{errors.description}</FormHelperText>}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Product Highlights</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Add key features (Max 5)</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {highlights.map((item, idx) => (
              <Chip key={idx} label={item} onDelete={() => setHighlights(prev => prev.filter(h => h !== item))} sx={{ borderRadius: 1.5, bgcolor: '#f1f5f9', color: '#334155', fontWeight: 500 }} deleteIcon={<Close sx={{ fontSize: 16 }} />} />
            ))}
          </Box>
          <TextField
            fullWidth size="small"
            placeholder="Add highlight and press Enter"
            value={highlightInput}
            onChange={e => setHighlightInput(e.target.value)}
            onKeyDown={handleAddHighlight}
            disabled={highlights.length >= 5}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── Step 2: Images ───────────────────────────────────────────────────────────
function StepImages({ images, imagePreviews, onUpload, onRemove, errors, touched }: {
  images: File[];
  imagePreviews: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
  errors: ReturnType<typeof getStep2Errors>;
  touched: boolean;
}) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Upload Images</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Upload clear images of your product (Max 10 images, min 1 required)</Typography>

      <Box
        component="label"
        sx={{ border: '2px dashed #cbd5e1', borderRadius: 2, p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f8fafc', mb: 3, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#f1f5f9', borderColor: '#3b82f6' } }}
      >
        <input type="file" multiple accept="image/png, image/jpeg, image/webp" hidden onChange={onUpload} />
        <CloudUpload sx={{ fontSize: 48, color: '#3b82f6', mb: 1.5 }} />
        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>Click to upload or drag and drop</Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>JPG, PNG or WEBP. Max size 5MB each.</Typography>
      </Box>

      {imagePreviews.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#334155' }}>Uploaded Images ({images.length}/10)</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {imagePreviews.map((preview, idx) => (
              <Box key={idx} sx={{ position: 'relative', width: 80, height: 80, borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <img src={preview} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <IconButton
                  size="small"
                  onClick={() => onRemove(idx)}
                  sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)', p: 0.3, '&:hover': { bgcolor: 'white' } }}
                >
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {touched && errors.images && (
        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
          <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>{errors.images}</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: images.length >= 1 ? '#10b981' : '#64748b' }}>
          {images.length}/10 images uploaded {images.length >= 1 ? '✓ Minimum met' : '(at least 1 required)'}
        </Typography>
      </Box>
      <Box sx={{ width: '100%', height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ width: `${(images.length / 10) * 100}%`, height: '100%', bgcolor: images.length >= 1 ? '#10b981' : '#cbd5e1', transition: 'width 0.3s ease' }} />
      </Box>
    </Box>
  );
}

// ─── Step 3: Price & Details ──────────────────────────────────────────────────
function StepPriceDetails({ form, setField, errors, touched }: {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, val: FormState[K]) => void;
  errors: ReturnType<typeof getStep3Errors>;
  touched: boolean;
}) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Price & Details</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Set the price and condition for your listing</Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Price <span style={{ color: '#ef4444' }}>*</span></Typography>
          <TextField
            fullWidth size="small" type="number"
            value={form.price || ''}
            onChange={e => setField('price', parseFloat(e.target.value) || 0)}
            placeholder="Enter price"
            error={touched && !!errors.price}
            slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1, color: '#64748b' }}>₹</Typography> } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
          />
          {touched && errors.price && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{errors.price}</Typography>}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Currency</Typography>
          <FormControl fullWidth size="small">
            <Select value={form.currency} onChange={e => setField('currency', e.target.value)} sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
              <MenuItem value="INR">INR – Indian Rupee</MenuItem>
              <MenuItem value="USD">USD – US Dollar</MenuItem>
              <MenuItem value="EUR">EUR – Euro</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={<Switch checked={form.negotiable} onChange={e => setField('negotiable', e.target.checked)} color="primary" />}
            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Price is negotiable</Typography>}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Condition <span style={{ color: '#ef4444' }}>*</span></Typography>
          <RadioGroup row value={form.condition} onChange={e => setField('condition', e.target.value)}>
            {['New', 'Like New', 'Good', 'Fair', 'Poor'].map(opt => (
              <Box
                key={opt}
                onClick={() => setField('condition', opt)}
                sx={{ border: form.condition === opt ? '1px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: 2, px: 2, py: 1, mr: 1, mb: 1, bgcolor: form.condition === opt ? '#eff6ff' : 'transparent', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <Radio checked={form.condition === opt} size="small" sx={{ p: 0, mr: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: form.condition === opt ? 600 : 500, color: form.condition === opt ? '#2563eb' : '#64748b' }}>{opt}</Typography>
              </Box>
            ))}
          </RadioGroup>
          {touched && errors.condition && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{errors.condition}</Typography>}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Availability <span style={{ color: '#ef4444' }}>*</span></Typography>
          <RadioGroup row value={form.availability} onChange={e => setField('availability', e.target.value)}>
            {['In Stock', 'Out of Stock'].map(opt => (
              <Box
                key={opt}
                onClick={() => setField('availability', opt)}
                sx={{ border: form.availability === opt ? '1px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: 2, px: 2, py: 1, mr: 1, bgcolor: form.availability === opt ? '#eff6ff' : 'transparent', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <Radio checked={form.availability === opt} size="small" sx={{ p: 0, mr: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: form.availability === opt ? 600 : 500, color: form.availability === opt ? '#2563eb' : '#64748b' }}>{opt}</Typography>
              </Box>
            ))}
          </RadioGroup>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── Step 4: Additional Info ─────────────────────────────────────────────────────────
function StepAdditionalInfo({ form, setField, errors, touched }: {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, val: FormState[K]) => void;
  errors: ReturnType<typeof getStep4Errors>;
  touched: boolean;
}) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Additional Info</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Provide location and other listing details</Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>City <span style={{ color: '#ef4444' }}>*</span></Typography>
          <TextField
            fullWidth size="small"
            value={form.locationCity}
            onChange={e => setField('locationCity', e.target.value)}
            placeholder="e.g. Mumbai"
            error={touched && !!errors.locationCity}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
          />
          {touched && errors.locationCity && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{errors.locationCity}</Typography>}
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>State <span style={{ color: '#ef4444' }}>*</span></Typography>
          <TextField
            fullWidth size="small"
            value={form.locationState}
            onChange={e => setField('locationState', e.target.value)}
            placeholder="e.g. Maharashtra"
            error={touched && !!errors.locationState}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
          />
          {touched && errors.locationState && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{errors.locationState}</Typography>}
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Country</Typography>
          <TextField
            fullWidth size="small"
            value={form.locationCountry}
            onChange={e => setField('locationCountry', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── Step 5: Preview ──────────────────────────────────────────────────────────
function StepPreview({ form, images, highlights, onSubmit }: { form: FormState; images: string[]; highlights: string[]; onSubmit: () => void }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Review & Publish</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Review all details before publishing your listing</Typography>

      <Grid container spacing={3}>
        {images.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {images.map((src, i) => (
                <Box key={i} sx={{ width: 80, height: 80, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={src} alt={`img-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          </Grid>
        )}

        {[
          { label: 'Title', value: form.title },
          { label: 'Category', value: `${form.category} › ${form.subcategory}` },
          { label: 'Brand', value: `${form.brand}${form.model ? ` – ${form.model}` : ''}` },
          { label: 'Price', value: `${form.currency} ${form.price.toLocaleString()}${form.negotiable ? ' (Negotiable)' : ''}` },
          { label: 'Condition', value: form.condition },
          { label: 'Availability', value: form.availability },
          { label: 'Location', value: `${form.locationCity}, ${form.locationState}, ${form.locationCountry}` },
        ].map(row => (
          <Grid size={{ xs: 12, sm: 6 }} key={row.label}>
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{row.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mt: 0.5 }}>{row.value || '—'}</Typography>
          </Grid>
        ))}

        <Grid size={{ xs: 12 }}>
          <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Description</Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>{form.description}</Typography>
        </Grid>

        {highlights.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Highlights</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {highlights.map((h, i) => <Chip key={i} label={h} size="small" sx={{ bgcolor: '#f1f5f9' }} />)}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
