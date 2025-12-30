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
  Card,
  CardContent,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import UndoIcon from '@mui/icons-material/Undo';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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

// Single workout card component
interface WorkoutCardProps {
  workout: WorkoutDay;
  canEdit: boolean;
  onStatusChange: (id: string, status: 'completed' | 'skipped' | 'planned') => void;
  onMove: (id: string, days: number) => void;
  onDelete: (id: string) => void;
  onUpdateDetails: (id: string, details: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateActuals: (id: string, distance: number | null, duration: number | null) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

function WorkoutCard({
  workout,
  canEdit,
  onStatusChange,
  onMove,
  onDelete,
  onUpdateDetails,
  onUpdateNotes,
  onUpdateActuals,
  expanded,
  onToggleExpand,
}: WorkoutCardProps) {
  const theme = useTheme();
  const [notes, setNotes] = useState(workout.notes || '');
  const [details, setDetails] = useState(workout.details || '');
  const [actualDistance, setActualDistance] = useState(workout.actual_distance_km?.toString() || '');
  const [actualDuration, setActualDuration] = useState(workout.actual_duration_min?.toString() || '');
  const [editingDetails, setEditingDetails] = useState(false);

  useEffect(() => {
    setNotes(workout.notes || '');
    setDetails(workout.details || '');
    setActualDistance(workout.actual_distance_km?.toString() || '');
    setActualDuration(workout.actual_duration_min?.toString() || '');
  }, [workout]);

  const isRest = workout.intensity === 'Rest';
  const isCompleted = workout.status === 'completed';

  const activityType = ACTIVITY_TYPES.find(t => t.id === workout.activity_type);
  const cardColor = activityType?.color || theme.palette.primary.main;

  const handleSaveDetails = () => {
    if (details !== workout.details) {
      onUpdateDetails(workout.id, details);
    }
    setEditingDetails(false);
  };

  const handleSaveNotes = () => {
    if (notes !== workout.notes) {
      onUpdateNotes(workout.id, notes);
    }
  };

  const handleSaveActuals = () => {
    const newDistance = actualDistance ? parseFloat(actualDistance) : null;
    const newDuration = actualDuration ? parseInt(actualDuration) : null;
    if (newDistance !== workout.actual_distance_km || newDuration !== workout.actual_duration_min) {
      onUpdateActuals(workout.id, newDistance, newDuration);
    }
  };

  if (isRest) {
    return (
      <Card
        sx={{
          backgroundColor: alpha(theme.palette.grey[500], 0.1),
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Rest Day
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        backgroundColor: alpha(cardColor, 0.05),
        border: `1px solid ${alpha(cardColor, 0.3)}`,
        borderLeft: `4px solid ${cardColor}`,
      }}
    >
      <CardContent sx={{ pb: 1, '&:last-child': { pb: 1.5 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {activityType && <activityType.icon sx={{ color: cardColor, fontSize: 20 }} />}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {workout.title}
            </Typography>
            <Chip
              size="small"
              label={workout.status}
              sx={{
                height: 20,
                fontSize: '0.65rem',
                backgroundColor: isCompleted
                  ? alpha('#22c55e', 0.2)
                  : alpha(theme.palette.grey[500], 0.1),
                color: isCompleted ? '#22c55e' : theme.palette.text.secondary,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {canEdit && (
              <IconButton
                size="small"
                onClick={() => onDelete(workout.id)}
                sx={{ color: 'error.main', mr: 0.5 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={onToggleExpand}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Description (always visible) */}
        {!editingDetails ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.5,
              cursor: canEdit ? 'pointer' : 'default',
              '&:hover': canEdit ? { backgroundColor: alpha(theme.palette.action.hover, 0.5), borderRadius: 1 } : {},
              p: 0.5,
              m: -0.5,
            }}
            onClick={() => canEdit && setEditingDetails(true)}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', flex: 1 }}>
              {workout.details}
            </Typography>
            {canEdit && <EditIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.5 }} />}
          </Box>
        ) : (
          <TextField
            fullWidth
            multiline
            size="small"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onBlur={handleSaveDetails}
            onKeyDown={(e) => e.key === 'Escape' && setEditingDetails(false)}
            autoFocus
            sx={{ mb: 1 }}
          />
        )}

        {/* Expanded content */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Planned metrics */}
            {(workout.planned_distance_km || workout.planned_duration_min) && (
              <Box sx={{ display: 'flex', gap: 3 }}>
                {workout.planned_distance_km && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Planned Distance
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {workout.planned_distance_km} km
                    </Typography>
                  </Box>
                )}
                {workout.planned_duration_min && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Planned Duration
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {workout.planned_duration_min} min
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Actual metrics */}
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
                    onBlur={handleSaveActuals}
                    inputProps={{ step: 0.1, min: 0 }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Duration (min)"
                    type="number"
                    value={actualDuration}
                    onChange={(e) => setActualDuration(e.target.value)}
                    onBlur={handleSaveActuals}
                    inputProps={{ step: 1, min: 0 }}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            )}

            {/* Quick move buttons */}
            {canEdit && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Move Activity
                </Typography>
                <ButtonGroup size="small" variant="outlined" fullWidth>
                  <Button onClick={() => onMove(workout.id, -3)}>-3</Button>
                  <Button onClick={() => onMove(workout.id, -2)}>-2</Button>
                  <Button onClick={() => onMove(workout.id, -1)}>-1</Button>
                  <Button onClick={() => onMove(workout.id, 1)}>+1</Button>
                  <Button onClick={() => onMove(workout.id, 2)}>+2</Button>
                  <Button onClick={() => onMove(workout.id, 3)}>+3</Button>
                </ButtonGroup>
              </Box>
            )}

            {/* Notes */}
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
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Notes
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {workout.notes}
                </Typography>
              </Box>
            )}

            {/* Status buttons */}
            {canEdit && (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                {workout.status !== 'skipped' && (
                  <Button
                    size="small"
                    startIcon={<BlockIcon />}
                    onClick={() => onStatusChange(workout.id, 'skipped')}
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
                    onClick={() => onStatusChange(workout.id, 'completed')}
                    sx={{ backgroundColor: '#22c55e', '&:hover': { backgroundColor: '#16a34a' } }}
                  >
                    Complete
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onStatusChange(workout.id, 'planned')}
                  >
                    Undo Complete
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default function WorkoutModal() {
  const { state, closeDayModal, updateWorkout, deleteWorkout, moveWorkout, undo, createWorkout } = useApp();
  const theme = useTheme();
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [newActivity, setNewActivity] = useState({
    type: 'run',
    duration: 30,
    distance: '',
    notes: '',
  });

  const canEdit = state.authenticated;

  // Get all workouts for the selected date
  const workoutsForDay = useMemo(() => {
    if (!state.selectedDate) return [];
    return state.workouts
      .filter(w => w.date === state.selectedDate)
      .sort((a, b) => {
        // Rest days last, then by created_at
        if (a.intensity === 'Rest' && b.intensity !== 'Rest') return 1;
        if (a.intensity !== 'Rest' && b.intensity === 'Rest') return -1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  }, [state.selectedDate, state.workouts]);

  // Auto-expand first non-rest workout
  useEffect(() => {
    if (workoutsForDay.length > 0) {
      const firstNonRest = workoutsForDay.find(w => w.intensity !== 'Rest');
      if (firstNonRest) {
        setExpandedWorkouts(new Set([firstNonRest.id]));
      }
    }
    setShowAddActivity(false);
  }, [state.selectedDate, workoutsForDay]);

  if (!state.selectedDate) return null;

  const formattedDate = format(parseISO(state.selectedDate), 'EEEE, MMMM d, yyyy');
  const hasOnlyRestDay = workoutsForDay.length === 1 && workoutsForDay[0].intensity === 'Rest';
  const hasNoWorkouts = workoutsForDay.length === 0;

  const toggleExpand = (id: string) => {
    setExpandedWorkouts(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleStatusChange = async (id: string, status: 'completed' | 'skipped' | 'planned') => {
    const updates: Partial<WorkoutDay> = { status };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    await updateWorkout(id, updates);
  };

  const handleMove = async (id: string, days: number) => {
    const workout = workoutsForDay.find(w => w.id === id);
    if (!workout) return;
    const newDate = format(addDays(parseISO(workout.date), days), 'yyyy-MM-dd');
    await moveWorkout(id, newDate);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      await deleteWorkout(id);
    }
  };

  const handleUpdateDetails = async (id: string, details: string) => {
    await updateWorkout(id, { details });
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    await updateWorkout(id, { notes });
  };

  const handleUpdateActuals = async (id: string, distance: number | null, duration: number | null) => {
    await updateWorkout(id, { actual_distance_km: distance, actual_duration_min: duration });
  };

  const handleAddActivity = async () => {
    if (!state.selectedDate) return;

    const activityType = ACTIVITY_TYPES.find(t => t.id === newActivity.type);
    const title = `${activityType?.label || 'Activity'}`;

    try {
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
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formattedDate}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {workoutsForDay.filter(w => w.intensity !== 'Rest').length} activit{workoutsForDay.filter(w => w.intensity !== 'Rest').length === 1 ? 'y' : 'ies'}
            </Typography>
          </Box>
          <IconButton onClick={closeDayModal} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: theme.palette.divider }} />

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Existing workouts */}
          {workoutsForDay.map(workout => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              canEdit={canEdit}
              onStatusChange={handleStatusChange}
              onMove={handleMove}
              onDelete={handleDelete}
              onUpdateDetails={handleUpdateDetails}
              onUpdateNotes={handleUpdateNotes}
              onUpdateActuals={handleUpdateActuals}
              expanded={expandedWorkouts.has(workout.id)}
              onToggleExpand={() => toggleExpand(workout.id)}
            />
          ))}

          {/* Add activity section */}
          {(hasNoWorkouts || hasOnlyRestDay || canEdit) && !showAddActivity && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowAddActivity(true)}
              sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}
            >
              Add Activity
            </Button>
          )}

          {showAddActivity && (
            <Card sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Add Custom Activity
                </Typography>

                {/* Activity Type Selection */}
                <Box sx={{ mb: 2 }}>
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
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
                  label="Description (optional)"
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                {/* Buttons */}
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
                  <Button variant="outlined" onClick={() => setShowAddActivity(false)}>
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>

      {state.undoStack.length > 0 && canEdit && (
        <>
          <Divider sx={{ borderColor: theme.palette.divider }} />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              size="small"
              startIcon={<UndoIcon />}
              onClick={undo}
              sx={{ color: 'text.secondary' }}
            >
              Undo Last Action
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
