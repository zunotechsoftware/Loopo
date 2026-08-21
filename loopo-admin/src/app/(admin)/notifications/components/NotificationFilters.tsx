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
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

interface NotificationFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  status: string;
  setStatus: (s: string) => void;
  type: string;
  setType: (t: string) => void;
  userType: string;
  setUserType: (u: string) => void;
  platform: string;
  setPlatform: (p: string) => void;
  onReset: () => void;
}

export default function NotificationFilters({
  search,
  setSearch,
  status,
  setStatus,
  type,
  setType,
  userType,
  setUserType,
  platform,
  setPlatform,
  onReset,
}: NotificationFiltersProps) {
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
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: { xs: '100%', lg: 'auto' }, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by title or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            minWidth: 250,
            bgcolor: 'white',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 120, bgcolor: 'white' }}>
          <Select
            value={status}
            displayEmpty
            onChange={(e) => setStatus(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Scheduled">Scheduled</MenuItem>
            <MenuItem value="Opened">Opened</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120, bgcolor: 'white' }}>
          <Select
            value={type}
            displayEmpty
            onChange={(e) => setType(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="Promotion">Promotion</MenuItem>
            <MenuItem value="Order Update">Order Update</MenuItem>
            <MenuItem value="Engagement">Engagement</MenuItem>
            <MenuItem value="Security">Security</MenuItem>
            <MenuItem value="Cart Reminder">Cart Reminder</MenuItem>
            <MenuItem value="Update">Update</MenuItem>
            <MenuItem value="Onboarding">Onboarding</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120, bgcolor: 'white' }}>
          <Select
            value={userType}
            displayEmpty
            onChange={(e) => setUserType(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">All Users</MenuItem>
            <MenuItem value="New Users">New Users</MenuItem>
            <MenuItem value="Active Users">Active Users</MenuItem>
            <MenuItem value="Inactive Users">Inactive Users</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 130, bgcolor: 'white' }}>
          <Select
            value={platform}
            displayEmpty
            onChange={(e) => setPlatform(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">All Platforms</MenuItem>
            <MenuItem value="iOS">iOS</MenuItem>
            <MenuItem value="Android">Android</MenuItem>
            <MenuItem value="Web">Web</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          endIcon={<CalendarTodayOutlinedIcon fontSize="small" />}
          sx={{
            borderColor: '#cbd5e1',
            color: '#64748b',
            textTransform: 'none',
            borderRadius: 2,
            bgcolor: 'white',
          }}
        >
          Start Date — End Date
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{
            borderColor: '#cbd5e1',
            color: '#1e293b',
            textTransform: 'none',
            borderRadius: 2,
            bgcolor: 'white',
            fontWeight: 600,
          }}
        >
          Filters
        </Button>
        <Button
          onClick={onReset}
          sx={{
            color: '#1e293b',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
}
