import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  alpha,
  Tooltip,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PoolIcon from '@mui/icons-material/Pool';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useApp } from '../context/AppContext';
import type { WorkoutDay } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, addMonths } from 'date-fns';
import { activityColors, statusColors } from '../lib/theme';

// Day names
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Get activity icon based on workout title/type
function getActivityIcon(workout: WorkoutDay, size: number = 18) {
  const title = workout.title.toLowerCase();
  const iconSx = { fontSize: size };
  
  // Check for activity type in title
  if (title.includes('cycle') || title.includes('bike') || title.includes('cycling')) {
    return <DirectionsBikeIcon sx={iconSx} />;
  }
  if (title.includes('swim') || title.includes('pool')) {
    return <PoolIcon sx={iconSx} />;
  }
  if (title.includes('walk') || title.includes('walking')) {
    return <DirectionsWalkIcon sx={iconSx} />;
  }
  if (title.includes('padel') || title.includes('squash') || title.includes('tennis')) {
    return <SportsTennisIcon sx={iconSx} />;
  }
  if (title.includes('strength') || title.includes('gym') || workout.intensity === 'Strength') {
    return <FitnessCenterIcon sx={iconSx} />;
  }
  // Default to running
  return <DirectionsRunIcon sx={iconSx} />;
}

// Get activity color based on workout
function getActivityColor(workout: WorkoutDay): string {
  const title = workout.title.toLowerCase();
  
  if (title.includes('cycle') || title.includes('bike')) return activityColors.cycle;
  if (title.includes('swim') || title.includes('pool')) return activityColors.swim;
  if (title.includes('walk')) return activityColors.walk;
  if (title.includes('padel') || title.includes('squash')) return activityColors.padel;
  if (title.includes('strength') || workout.intensity === 'Strength') return activityColors.strength;
  return activityColors.run;
}

// Workout card component - now with icon
function WorkoutCard({ 
  workout, 
  onClick,
  onDragStart,
  isDragging,
}: { 
  workout: WorkoutDay; 
  onClick: () => void;
  onDragStart: (e: React.DragEvent, workout: WorkoutDay) => void;
  isDragging: boolean;
}) {
  const isCompleted = workout.status === 'completed';
  const isSkipped = workout.status === 'skipped';
  const isRescheduled = workout.status === 'rescheduled';
  
  const activityColor = isCompleted 
    ? statusColors.completed 
    : isSkipped 
      ? statusColors.skipped 
      : getActivityColor(workout);
  
  const statusIcon = () => {
    if (isCompleted) return <CheckCircleIcon sx={{ fontSize: 10, position: 'absolute', bottom: -2, right: -2 }} />;
    if (isSkipped) return <BlockIcon sx={{ fontSize: 10, position: 'absolute', bottom: -2, right: -2, opacity: 0.5 }} />;
    if (isRescheduled) return <SwapHorizIcon sx={{ fontSize: 10, position: 'absolute', bottom: -2, right: -2, opacity: 0.7 }} />;
    return null;
  };
  
  return (
    <Tooltip 
      title={
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>{workout.title}</Typography>
          {workout.planned_duration_min && (
            <Typography variant="caption" display="block">{workout.planned_duration_min} min</Typography>
          )}
          {workout.planned_distance_km && (
            <Typography variant="caption" display="block">{workout.planned_distance_km} km</Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        draggable
        onDragStart={(e) => onDragStart(e, workout)}
        onClick={onClick}
        sx={{
          backgroundColor: alpha(activityColor, isSkipped ? 0.1 : 0.15),
          border: `2px solid ${alpha(activityColor, isSkipped ? 0.2 : 0.5)}`,
          borderRadius: '50%',
          width: { xs: 32, sm: 36 },
          height: { xs: 32, sm: 36 },
          cursor: 'grab',
          opacity: isDragging ? 0.5 : (isSkipped ? 0.5 : 1),
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: alpha(activityColor, 0.25),
            transform: 'scale(1.1)',
          },
          '&:active': {
            cursor: 'grabbing',
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          color: activityColor,
          mx: 'auto',
        }}
      >
        {getActivityIcon(workout, 18)}
        {statusIcon()}
      </Box>
    </Tooltip>
  );
}

// Day cell component
function DayCell({ 
  date, 
  workout, 
  isCurrentMonth,
  isToday,
  onClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragTarget,
  isDraggingWorkout,
}: { 
  date: Date;
  workout: WorkoutDay | undefined;
  isCurrentMonth: boolean;
  isToday: boolean;
  onClick: (date: string) => void;
  onDragStart: (e: React.DragEvent, workout: WorkoutDay) => void;
  onDragOver: (e: React.DragEvent, date: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, date: string) => void;
  isDragTarget: boolean;
  isDraggingWorkout: WorkoutDay | null;
}) {
  const theme = useTheme();
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayNum = format(date, 'd');
  const isRest = workout?.intensity === 'Rest';
  const hasWorkout = workout && !isRest;
  
  return (
    <Box
      onDragOver={(e) => onDragOver(e, dateStr)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, dateStr)}
      onClick={() => onClick(dateStr)}
      sx={{
        minHeight: { xs: 56, sm: 70 },
        p: 0.5,
        backgroundColor: isDragTarget 
          ? alpha(theme.palette.primary.main, 0.1)
          : isToday 
            ? alpha(theme.palette.primary.main, 0.05)
            : 'transparent',
        border: isDragTarget 
          ? `2px dashed ${alpha(theme.palette.primary.main, 0.5)}`
          : isToday 
            ? `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
            : `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        borderRadius: 1,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        opacity: isCurrentMonth ? 1 : 0.3,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: isToday ? 700 : 400,
          color: isToday ? theme.palette.primary.main : 'text.secondary',
          fontSize: '0.7rem',
          mb: 0.5,
        }}
      >
        {dayNum}
      </Typography>
      
      {hasWorkout && (
        <WorkoutCard
          workout={workout}
          onClick={() => onClick(dateStr)}
          onDragStart={onDragStart}
          isDragging={isDraggingWorkout?.id === workout.id}
        />
      )}
    </Box>
  );
}

// Month component
function MonthCalendar({ 
  month, 
  workouts,
  onDayClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  dragTargetDate,
  isDraggingWorkout,
}: {
  month: Date;
  workouts: WorkoutDay[];
  onDayClick: (date: string) => void;
  onDragStart: (e: React.DragEvent, workout: WorkoutDay) => void;
  onDragOver: (e: React.DragEvent, date: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, date: string) => void;
  dragTargetDate: string | null;
  isDraggingWorkout: WorkoutDay | null;
}) {
  const theme = useTheme();
  const today = new Date();
  
  // Get all days for this month's calendar grid
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  
  // Get the first day of the week (Monday = 0)
  let startDay = getDay(monthStart) - 1;
  if (startDay < 0) startDay = 6; // Sunday
  
  // Create calendar grid
  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  days.forEach(day => calendarDays.push(day));
  
  // Create workout lookup by date
  const workoutsByDate = useMemo(() => {
    const map = new Map<string, WorkoutDay>();
    workouts.forEach(w => map.set(w.date, w));
    return map;
  }, [workouts]);
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        mb: 2,
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        {format(month, 'MMMM yyyy')}
      </Typography>
      
      {/* Day headers */}
      <Grid container spacing={0.5} sx={{ mb: 0.5 }}>
        {DAYS.map(day => (
          <Grid item xs={12/7} key={day}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
      
      {/* Calendar grid */}
      <Grid container spacing={0.5}>
        {calendarDays.map((date, i) => (
          <Grid item xs={12/7} key={i}>
            {date ? (
              <DayCell
                date={date}
                workout={workoutsByDate.get(format(date, 'yyyy-MM-dd'))}
                isCurrentMonth={isSameMonth(date, month)}
                isToday={format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')}
                onClick={onDayClick}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                isDragTarget={dragTargetDate === format(date, 'yyyy-MM-dd')}
                isDraggingWorkout={isDraggingWorkout}
              />
            ) : (
              <Box sx={{ minHeight: { xs: 56, sm: 70 } }} />
            )}
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

export default function Calendar() {
  const { state, openDayModal, moveWorkout } = useApp();
  
  const [draggingWorkout, setDraggingWorkout] = useState<WorkoutDay | null>(null);
  const [dragTargetDate, setDragTargetDate] = useState<string | null>(null);
  
  // Filter out rest days from display, apply other filters
  const filteredWorkouts = useMemo(() => {
    let filtered = state.workouts.filter(w => w.intensity !== 'Rest');
    
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(w => w.status === state.filters.status);
    }
    if (state.filters.intensity !== 'all') {
      filtered = filtered.filter(w => w.intensity === state.filters.intensity);
    }
    if (state.filters.tag !== 'all') {
      const tagFilter = state.filters.tag;
      filtered = filtered.filter(w => w.tags.includes(tagFilter));
    }
    
    return filtered;
  }, [state.workouts, state.filters]);
  
  // Generate all months from Jan to May 2026
  const months = useMemo(() => {
    const result: Date[] = [];
    let current = new Date(2026, 0, 1); // January 2026
    const end = new Date(2026, 4, 1); // May 2026
    
    while (current <= end) {
      result.push(current);
      current = addMonths(current, 1);
    }
    
    return result;
  }, []);
  
  // Drag handlers
  const handleDragStart = (e: React.DragEvent, workout: WorkoutDay) => {
    setDraggingWorkout(workout);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Update visual feedback for drop target
    if (dragTargetDate !== date) {
      setDragTargetDate(date);
    }
  };
  
  const handleDragLeave = () => {
    setDragTargetDate(null);
  };
  
  const handleDrop = async (e: React.DragEvent, date: string) => {
    e.preventDefault();
    setDragTargetDate(null);
    
    if (draggingWorkout && date !== draggingWorkout.date) {
      try {
        await moveWorkout(draggingWorkout.id, date);
      } catch (error) {
        console.error('Failed to move workout:', error);
      }
    }
    
    setDraggingWorkout(null);
  };
  
  const handleDayClick = (date: string) => {
    if (!draggingWorkout) {
      openDayModal(date);
    }
  };
  
  return (
    <Box>
      {months.map(month => (
        <MonthCalendar
          key={format(month, 'yyyy-MM')}
          month={month}
          workouts={filteredWorkouts}
          onDayClick={handleDayClick}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          dragTargetDate={dragTargetDate}
          isDraggingWorkout={draggingWorkout}
        />
      ))}
    </Box>
  );
}
