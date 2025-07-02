import React from 'react';
import { Box, Pagination, Stack, Select, MenuItem, Typography } from '@mui/material';

export default function PaginationMUI({ page, count, onChange, limit, onLimitChange }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" mt={3} mb={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <Pagination
          color="primary"
          page={page}
          count={count}
          onChange={(_, value) => onChange(value)}
          showFirstButton
          showLastButton
        />
        {onLimitChange && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">Par page :</Typography>
            <Select
              size="small"
              value={limit}
              onChange={e => onLimitChange(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map(val => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </Select>
          </Stack>
        )}
      </Stack>
    </Box>
  );
} 