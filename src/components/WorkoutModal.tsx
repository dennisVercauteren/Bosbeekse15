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
  ButtonGroup,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import UndoIcon from '@mui/icons-material/Undo';
import AddIcon from '@mui/icons-material/Add';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PoolIcon from '@mui/icons-material/Pool';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useApp } from '../context/AppContext';
import { format, parseISO, addDays } from 'date-fns';
import { activityColors } from '../lib/theme';
import type { WorkoutDay, ActivityType } from '../types';

// Activity types
const ACTIVITY_TYPES = [
  { id: 'run', label: 'Run', icon: DirectionsRunIcon, color: activityColors.run },
  { id: 'walk', label: 'Walk', icon: DirectionsWalkIcon, color: activityColors.walk },
  { id: 'cycle', label: 'Cycle', icon: DirectionsBikeIcon, color: activityColors.cycle },
  { id: 'swim', label: 'Swim', icon: PoolIcon, color: activityColors.swim },
  { id: 'padel', label: 'Padel', icon: SportsTennisIcon, color: activityColors.padel },
  { id: 'squash', label: 'Squash', icon: SportsTennisIcon, color: activityColors.squash },
  { id: 'strength', label: 'Strength', icon: FitnessCenterIcon, color: activityColors.strength },
];

export default function WorkoutModal() {
  const { state, closeDayModal, updateWorkout, moveWorkout, undo, createWorkout } = useApp();
  const theme = useTheme();
  const [notes, setNotes] = useState('');
  const [actualDistance, setActualDistance] = useState<string>('');
  const [actualDuration, setActualDuration] = useState<string>('');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'run',
    duration: 30,
    distance: '',
    notes: '',
  });
  
  // Check if user can edit (requires authentication)
  const canEdit = state.authenticated;

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
    setShowAddActivity(false);
  }, [workout]);

  if (!state.selectedDate) return null;

  const isRest = workout?.intensity === 'Rest';
  const isCompleted = workout?.status === 'completed';
  const formattedDate = format(parseISO(state.selectedDate), 'EEEE, MMMM d, yyyy');

  const handleStatusChange = async (status: 'completed' | 'skipped' | 'planned') => {
    if (!workout) return;
    
    const updates: Partial<WorkoutDay> = { status };
    
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    
    await updateWorkout(workout.id, updates);
  };

  const handleSaveNotes = async () => {
    if (!workout) return;
    await updateWorkout(workout.id, { notes });
  };

  const handleSaveActualValues = async () => {
    if (!workout) return;
    const updates: Partial<WorkoutDay> = {};
    
    const newDistance = actualDistance ? parseFloat(actualDistance) : null;
    const newDuration = actualDuration ? parseInt(actualDuration) : null;
    
    if (newDistance !== workout.actual_distance_km) {
      updates.actual_distance_km = newDistance;
    }
    if (newDuration !== workout.actual_duration_min) {
      updates.actual_duration_min = newDuration;
    }
    
    if (Object.keys(updates).length > 0) {
      await updateWorkout(workout.id, updates);
    }
  };

  // Quick move by days (-3, -2, -1, +1, +2, +3)
  const handleQuickMove = async (days: number) => {
    if (!workout) return;
    const newDate = format(addDays(parseISO(workout.date), days), 'yyyy-MM-dd');
    await moveWorkout(workout.id, newDate);
    closeDayModal();
  };

  // Add custom activity
  const handleAddActivity = async () => {
    if (!state.selectedDate) return;
    
    const activityType = ACTIVITY_TYPES.find(t => t.id === newActivity.type);
    const title = `${activityType?.label || 'Activity'}`;
    
    try {
      // Use the context's createWorkout function
      await createWorkout({
        date: state.selectedDate,
        title,
        details: newActivity.notes || `Custom ${activityType?.label} activity`,
        phase: 'Custom',
        week: 0,
        tags: [],
        planned_distance_km: newActivity.distance ? parseFloat(newActivity.distance) : null,
        planned_duration_min: newActivity.duration || null,
        actual_distance_km: null,
        actual_duration_min: null,
        intensity: newActivity.type === 'strength' ? 'Strength' : 'E',
        status: 'planned',
        completed_at: null,
        moved_from_date: null,
        notes: null,
        activity_type: newActivity.type as ActivityType,
      });
      
      // Reset form
      setNewActivity({ type: 'run', duration: 30, distance: '', notes: '' });
      setShowAddActivity(false);
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  const selectedActivityType = ACTIVITY_TYPES.find(t => t.id === newActivity.type);

  return (
    <Dialog
      open={state.modalOpen}
      onClose={closeDayModal}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {workout?.title || 'No Activity'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formattedDate}
              {workout && workout.phase !== 'Custom' && ` • ${workout.phase} • Week ${workout.week}`}
            </Typography>
          </Box>
          <IconButton onClick={closeDayModal} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: theme.palette.divider }} />

      <DialogContent sx={{ pt: 2 }}>
        {workout && !isRest ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Status Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={workout.status.charAt(0).toUpperCase() + workout.status.slice(1)}
                sx={{
                  backgroundColor: isCompleted 
                    ? alpha('#22c55e', 0.2) 
                    : alpha(theme.palette.primary.main, 0.1),
                  color: isCompleted ? '#22c55e' : theme.palette.primary.main,
                  fontWeight: 500,
                }}
              />
              {workout.tags.map(tag => (
                <Chip
                  key={tag}
                  size="small"
                  label={tag}
                  variant="outlined"
                  sx={{ borderColor: theme.palette.divider, fontSize: '0.7rem' }}
                />
              ))}
            </Box>

            {/* Workout Details */}
            {workout.details && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {workout.details}
                </Typography>
              </Box>
            )}

            {/* Planned metrics */}
            {(workout.planned_distance_km || workout.planned_duration_min) && (
              <Box sx={{ display: 'flex', gap: 3 }}>
                {workout.planned_distance_km && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Planned Distance
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {workout.planned_distance_km} km
                    </Typography>
                  </Box>
                )}
                {workout.planned_duration_min && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Planned Duration
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {workout.planned_duration_min} min
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Actual metrics - Editable */}
            {canEdit && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Actual Results
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    size="small"
                    label="Distance (km)"
                    type="number"
                    value={actualDistance}
                    onChange={(e) => setActualDistance(e.target.value)}
                    onBlur={handleSaveActualValues}
                    inputProps={{ step: 0.1, min: 0 }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Duration (min)"
                    type="number"
                    value={actualDuration}
                    onChange={(e) => setActualDuration(e.target.value)}
                    onBlur={handleSaveActualValues}
                    inputProps={{ step: 1, min: 0 }}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            )}

            {/* Quick Move Buttons - Only show if user can edit */}
            {canEdit && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Move Activity
                </Typography>
                <ButtonGroup size="small" variant="outlined" fullWidth>
                  <Button onClick={() => handleQuickMove(-3)}>-3</Button>
                  <Button onClick={() => handleQuickMove(-2)}>-2</Button>
                  <Button onClick={() => handleQuickMove(-1)}>-1</Button>
                  <Button onClick={() => handleQuickMove(1)}>+1</Button>
                  <Button onClick={() => handleQuickMove(2)}>+2</Button>
                  <Button onClick={() => handleQuickMove(3)}>+3</Button>
                </ButtonGroup>
              </Box>
            )}

            {/* Notes - Editable only if authenticated */}
            <Box>
              {canEdit ? (
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
              ) : workout.notes && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {workout.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!showAddActivity ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {isRest ? 'Rest day scheduled' : 'No activity scheduled'}
                </Typography>
                {canEdit && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddActivity(true)}
                    sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}
                  >
                    Add Activity
                  </Button>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Add Custom Activity
                </Typography>
                
                {/* Activity Type Selection */}
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                    Activity Type
                  </Typography>
                  <ToggleButtonGroup
                    value={newActivity.type}
                    exclusive
                    onChange={(_, value) => value && setNewActivity({ ...newActivity, type: value })}
                    size="small"
                    sx={{ flexWrap: 'wrap', gap: 0.5 }}
                  >
                    {ACTIVITY_TYPES.map(type => (
                      <ToggleButton 
                        key={type.id} 
                        value={type.id}
                        sx={{
                          border: `1px solid ${theme.palette.divider}`,
                          '&.Mui-selected': {
                            backgroundColor: alpha(type.color, 0.15),
                            color: type.color,
                            borderColor: type.color,
                          },
                        }}
                      >
                        <type.icon sx={{ fontSize: 18, mr: 0.5 }} />
                        {type.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>

                {/* Duration & Distance */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    size="small"
                    label="Duration (min)"
                    type="number"
                    value={newActivity.duration}
                    onChange={(e) => setNewActivity({ ...newActivity, duration: parseInt(e.target.value) || 0 })}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Distance (km)"
                    type="number"
                    value={newActivity.distance}
                    onChange={(e) => setNewActivity({ ...newActivity, distance: e.target.value })}
                    sx={{ flex: 1 }}
                  />
                </Box>

                {/* Notes */}
                <TextField
                  size="small"
                  label="Notes (optional)"
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  fullWidth
                />

                {/* Add Button */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleAddActivity}
                    sx={{ 
                      flex: 1,
                      backgroundColor: selectedActivityType?.color,
                      '&:hover': { backgroundColor: alpha(selectedActivityType?.color || '#C41E3A', 0.8) },
                    }}
                  >
                    Add {selectedActivityType?.label}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAddActivity(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {workout && !isRest && canEdit && (
        <>
          <Divider sx={{ borderColor: theme.palette.divider }} />
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
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
                  sx={{ color: theme.palette.text.secondary }}
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
                  sx={{ borderColor: theme.palette.divider }}
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
