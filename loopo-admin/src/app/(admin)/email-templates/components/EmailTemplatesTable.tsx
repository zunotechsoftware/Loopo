import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import { EmailTemplate, TemplateCategory, TemplateStatus } from '../mockData';

interface EmailTemplatesTableProps {
  templates: EmailTemplate[];
  selectedRows: string[];
  setSelectedRows: (selected: string[]) => void;
  selectedTemplateId: string | null;
  onSelectTemplate: (template: EmailTemplate) => void;
  onEditTemplate: (template: EmailTemplate) => void;
  page: number;
  setPage: (p: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (r: number) => void;
}

const CategoryChip = ({ category }: { category: TemplateCategory }) => {
  const styles: Record<TemplateCategory, { bg: string; color: string }> = {
    User: { bg: '#eff6ff', color: '#3b82f6' },
    Order: { bg: '#fff7ed', color: '#f97316' },
    Message: { bg: '#fdf4ff', color: '#d946ef' },
    Marketing: { bg: '#fef2f2', color: '#ef4444' },
    Account: { bg: '#fef2f2', color: '#ef4444' },
    Notification: { bg: '#fffbeb', color: '#f59e0b' },
  };

  const normalizedCategory = category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : '';
  const style = styles[normalizedCategory as TemplateCategory] || { bg: '#f1f5f9', color: '#64748b' };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        bgcolor: style.bg,
        color: style.color,
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {category}
    </Box>
  );
};

const StatusChip = ({ status }: { status: TemplateStatus }) => {
  const styles: Record<TemplateStatus, { bg: string; color: string }> = {
    Active: { bg: '#f0fdf4', color: '#16a34a' },
    Inactive: { bg: '#f1f5f9', color: '#64748b' },
  };

  const normalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';
  const style = styles[normalizedStatus as TemplateStatus] || styles.Inactive;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        bgcolor: style.bg,
        color: style.color,
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {status}
    </Box>
  );
};

export default function EmailTemplatesTable({
  templates,
  selectedRows,
  setSelectedRows,
  selectedTemplateId,
  onSelectTemplate,
  onEditTemplate,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
}: EmailTemplatesTableProps) {
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(templates.map((t) => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelected);
  };

  const isSelected = (id: string) => selectedRows.indexOf(id) !== -1;

  // Pagination logic
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedTemplates = templates.slice(startIndex, startIndex + rowsPerPage);

  return (
    <Box sx={{ flex: 1, bgcolor: 'white', borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #e2e8f0' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
          All Email Templates
        </Typography>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedRows.length > 0 && selectedRows.length < templates.length}
                  checked={templates.length > 0 && selectedRows.length === templates.length}
                  onChange={handleSelectAll}
                  size="small"
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem' }}>Template Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem' }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem' }}>Language</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem' }}>Used</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem' }}>Updated On</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTemplates.map((row) => {
              const isItemSelected = isSelected(row.id);
              const isActive = selectedTemplateId === row.id;

              return (
                <TableRow
                  hover
                  key={row.id}
                  onClick={() => onSelectTemplate(row)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: isActive ? '#f8fafc' : 'transparent',
                    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                  }}
                >
                  <TableCell padding="checkbox" sx={{ borderLeft: 'none' }}>
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleSelectRow(row.id)}
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {row.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {row.subtext}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <CategoryChip category={row.category} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#334155' }}>
                      {row.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      {row.language}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                      {row.used.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                      {row.updatedOn}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <IconButton size="small" sx={{ color: '#64748b' }} onClick={(e) => { e.stopPropagation(); onSelectTemplate(row); }}>
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#64748b' }} onClick={(e) => { e.stopPropagation(); onEditTemplate(row); }}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#64748b' }} onClick={(e) => e.stopPropagation()}>
                        <MoreVertOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, templates.length)} of {templates.length} templates
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Pagination
            count={Math.ceil(templates.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            shape="rounded"
            color="primary"
            size="small"
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Select
              size="small"
              value={rowsPerPage.toString()}
              onChange={(e: SelectChangeEvent) => setRowsPerPage(Number(e.target.value))}
              sx={{ height: 32, fontSize: '0.875rem' }}
            >
              <MenuItem value={10}>10 / page</MenuItem>
              <MenuItem value={20}>20 / page</MenuItem>
              <MenuItem value={50}>50 / page</MenuItem>
            </Select>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
