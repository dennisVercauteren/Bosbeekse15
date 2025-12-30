import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Chip,
  Divider,
  alpha,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UndoIcon from '@mui/icons-material/Undo';
import { useApp } from '../context/AppContext';
import { format, parseISO, addDays } from 'date-fns';

export default function WorkoutModal() {
  const { state, closeDayModal, updateWorkout, moveWorkout, undo } = useApp();
  const [notes, setNotes] = useState('');
  const [actualDistance, setActualDistance] = useState<string>('');
  const [actualDuration, setActualDuration] = useState<string>('');
  const [moveDateOpen, setMoveDateOpen] = useState(false);
  const [moveDate, setMoveDate] = useState('');

  const workout = useMemo(() => {
    if (!state.selectedDate) return null;
    return state.workouts.find(w => w.date === state.selectedDate);
  }, [state.selectedDate, state.workouts]);

  useEffect(() => {
    if (workout) {
      setNotes(workout.notes || '');
      setActualDistance(workout.actual_distance_km?.toString() || '');
      setActualDuration(workout.actual_duration_min?.toString() || '');
    }
  }, [workout]);

  if (!state.selectedDate) return null;

  const isRest = workout?.intensity === 'Rest';
  const isCompleted = workout?.status === 'completed';
  const formattedDate = format(parseISO(state.selectedDate), 'EEEE, MMMM d, yyyy');

  const handleStatusChange = async (status: 'completed' | 'skipped' | 'planned') => {
    if (!workout) return;
    
    const updates: any = { status };
    
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
      if (actualDistance) updates.actual_distance_km = parseFloat(actualDistance);
      if (actualDuration) updates.actual_duration_min = parseInt(actualDuration);
    }
    
    await updateWorkout(workout.id, updates);
  };

  const handleSaveNotes = async () => {
    if (!workout) return;
    await updateWorkout(workout.id, { notes });
  };

  const handleMoveToNextDay = async () => {
    if (!workout) return;
    const nextDay = format(addDays(parseISO(workout.date), 1), 'yyyy-MM-dd');
    await moveWorkout(workout.id, nextDay);
    closeDayModal();
  };

  const handleMoveToDate = async () => {
    if (!workout || !moveDate) return;
    await moveWorkout(workout.id, moveDate);
    setMoveDateOpen(false);
    setMoveDate('');
    closeDayModal();
  };

  return (
    <Dialog
      open={state.dayModalOpen}
      onClose={closeDayModal}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #2a2a2a',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {workout?.title || 'Rest Day'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formattedDate}
              {workout && ` • ${workout.phase} • Week ${workout.week}`}
            </Typography>
          </Box>
          <IconButton onClick={closeDayModal} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: '#2a2a2a' }} />

      <DialogContent sx={{ pt: 2 }}>
        {workout && !isRest ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Status Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                size="small"
                label={workout.status.charAt(0).toUpperCase() + workout.status.slice(1)}
                sx={{
                  backgroundColor: isCompleted 
                    ? alpha('#22c55e', 0.2) 
                    : alpha('#666', 0.2),
                  color: isCompleted ? '#22c55e' : '#888',
                  fontWeight: 500,
                }}
              />
              {workout.tags.map(tag => (
                <Chip
                  key={tag}
                  size="small"
                  label={tag}
                  variant="outlined"
                  sx={{ borderColor: '#2a2a2a', fontSize: '0.7rem' }}
                />
              ))}
            </Box>

            {/* Workout Details */}
            {workout.description && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {workout.description}
                </Typography>
              </Box>
            )}

            {/* Planned metrics */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              {workout.planned_distance_km && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Distance
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {workout.planned_distance_km} km
                  </Typography>
                </Box>
              )}
              {workout.planned_duration_min && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Duration
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {workout.planned_duration_min} min
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Actual metrics (for completed) */}
            {isCompleted && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="Actual Distance (km)"
                  type="number"
                  value={actualDistance}
                  onChange={(e) => setActualDistance(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Actual Duration (min)"
                  type="number"
                  value={actualDuration}
                  onChange={(e) => setActualDuration(e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Box>
            )}

            {/* Notes */}
            <Box>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
              />
            </Box>

            {/* Move to date */}
            {moveDateOpen && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="date"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={handleMoveToDate}
                  disabled={!moveDate}
                >
                  Move
                </Button>
                <Button 
                  size="small" 
                  onClick={() => setMoveDateOpen(false)}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
            {isRest ? 'Rest day - no workout scheduled' : 'No workout scheduled for this day'}
          </Typography>
        )}
      </DialogContent>

      {workout && !isRest && (
        <>
          <Divider sx={{ borderColor: '#2a2a2a' }} />
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<ArrowForwardIcon />}
                onClick={handleMoveToNextDay}
                sx={{ color: 'text.secondary' }}
              >
                Next Day
              </Button>
              <Button
                size="small"
                startIcon={<CalendarTodayIcon />}
                onClick={() => setMoveDateOpen(true)}
                sx={{ color: 'text.secondary' }}
              >
                Pick Date
              </Button>
              {state.undoStack.length > 0 && (
                <Button
                  size="small"
                  startIcon={<UndoIcon />}
                  onClick={undo}
                  sx={{ color: 'text.secondary' }}
                >
                  Undo
                </Button>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {workout.status !== 'skipped' && (
                <Button
                  size="small"
                  startIcon={<BlockIcon />}
                  onClick={() => handleStatusChange('skipped')}
                  sx={{ color: '#666' }}
                >
                  Skip
                </Button>
              )}
              {workout.status !== 'completed' ? (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleStatusChange('completed')}
                  sx={{ backgroundColor: '#22c55e', '&:hover': { backgroundColor: '#16a34a' } }}
                >
                  Complete
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleStatusChange('planned')}
                  sx={{ borderColor: '#2a2a2a' }}
                >
                  Undo Complete
                </Button>
              )}
            </Box>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
