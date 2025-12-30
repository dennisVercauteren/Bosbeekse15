import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { useApp } from '../context/AppContext';
import type { WorkoutTag, Intensity, WorkoutStatus } from '../types';

export default function FilterBar() {
  const { state, dispatch } = useApp();

  const handleStatusChange = (value: string) => {
    dispatch({ type: 'SET_FILTERS', payload: { status: value as WorkoutStatus | 'all' } });
  };

  const handleIntensityChange = (value: string) => {
    dispatch({ type: 'SET_FILTERS', payload: { intensity: value as Intensity | 'all' } });
  };

  const handleTagChange = (value: string) => {
    dispatch({ type: 'SET_FILTERS', payload: { tag: value as WorkoutTag | 'all' } });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
        Filter:
      </Typography>
      
      {/* Status Filter */}
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <Select
          value={state.filters.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          sx={{
            fontSize: '0.8rem',
            '& .MuiSelect-select': { py: 0.75 },
          }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="planned">Planned</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="skipped">Skipped</MenuItem>
        </Select>
      </FormControl>

      {/* Intensity Filter */}
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <Select
          value={state.filters.intensity}
          onChange={(e) => handleIntensityChange(e.target.value)}
          sx={{
            fontSize: '0.8rem',
            '& .MuiSelect-select': { py: 0.75 },
          }}
        >
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="E">Easy</MenuItem>
          <MenuItem value="S">Steady</MenuItem>
          <MenuItem value="T">Tempo</MenuItem>
          <MenuItem value="I">Interval</MenuItem>
          <MenuItem value="Strength">Strength</MenuItem>
        </Select>
      </FormControl>

      {/* Tag Filter */}
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <Select
          value={state.filters.tag}
          onChange={(e) => handleTagChange(e.target.value)}
          sx={{
            fontSize: '0.8rem',
            '& .MuiSelect-select': { py: 0.75 },
          }}
        >
          <MenuItem value="all">All Tags</MenuItem>
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="longrun">Long Run</MenuItem>
          <MenuItem value="strength">Strength</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
