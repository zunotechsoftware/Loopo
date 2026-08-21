import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

interface EmailTemplateFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  category: string;
  setCategory: (c: string) => void;
  status: string;
  setStatus: (s: string) => void;
  language: string;
  setLanguage: (l: string) => void;
  onReset: () => void;
}

export default function EmailTemplateFilters({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  language,
  setLanguage,
  onReset,
}: EmailTemplateFiltersProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
        <TextField
          placeholder="Search by template name or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            flex: 1,
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              borderRadius: 2,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            displayEmpty
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ bgcolor: 'white', borderRadius: 2 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="User">User</MenuItem>
            <MenuItem value="Order">Order</MenuItem>
            <MenuItem value="Message">Message</MenuItem>
            <MenuItem value="Marketing">Marketing</MenuItem>
            <MenuItem value="Account">Account</MenuItem>
            <MenuItem value="Notification">Notification</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            displayEmpty
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ bgcolor: 'white', borderRadius: 2 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            displayEmpty
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            sx={{ bgcolor: 'white', borderRadius: 2 }}
          >
            <MenuItem value="">All Languages</MenuItem>
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Spanish">Spanish</MenuItem>
            <MenuItem value="French">French</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{
            textTransform: 'none',
            color: '#475569',
            borderColor: '#e2e8f0',
            bgcolor: 'white',
            borderRadius: 2,
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#f8fafc',
              borderColor: '#cbd5e1',
            },
          }}
        >
          Filters
        </Button>
        <Button
          variant="text"
          onClick={onReset}
          sx={{
            textTransform: 'none',
            color: '#64748b',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#f1f5f9',
            },
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
}
