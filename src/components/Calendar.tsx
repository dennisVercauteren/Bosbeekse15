import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  alpha,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useApp } from '../context/AppContext';
import type { WorkoutDay } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, addMonths } from 'date-fns';

// Day names
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Workout card component
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
  const statusIcon = () => {
    switch (workout.status) {
      case 'completed':
        return <CheckCircleIcon sx={{ fontSize: 12 }} />;
      case 'skipped':
        return <BlockIcon sx={{ fontSize: 12, opacity: 0.5 }} />;
      case 'rescheduled':
        return <SwapHorizIcon sx={{ fontSize: 12, opacity: 0.7 }} />;
      default:
        return null;
    }
  };
  
  const isCompleted = workout.status === 'completed';
  const isSkipped = workout.status === 'skipped';
  
  return (
    <Box
      draggable
      onDragStart={(e) => onDragStart(e, workout)}
      onClick={onClick}
      sx={{
        backgroundColor: isCompleted 
          ? alpha('#22c55e', 0.2)
          : isSkipped 
            ? alpha('#666', 0.1)
            : alpha('#22c55e', 0.1),
        border: `1px solid ${isCompleted ? alpha('#22c55e', 0.4) : 'transparent'}`,
        borderRadius: 1,
        px: 1,
        py: 0.5,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : (isSkipped ? 0.5 : 1),
        transition: 'all 0.15s ease',
        '&:hover': {
          backgroundColor: isCompleted 
            ? alpha('#22c55e', 0.25)
            : alpha('#22c55e', 0.15),
          transform: 'scale(1.02)',
        },
        '&:active': {
          cursor: 'grabbing',
        },
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        minHeight: 28,
      }}
    >
      {statusIcon()}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          fontSize: '0.7rem',
          textDecoration: isSkipped ? 'line-through' : 'none',
        }}
      >
        {workout.title.replace(' (Easy)', '').replace(' - Deload', '').replace(' - Taper', '')}
      </Typography>
    </Box>
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
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, date: string) => void;
  isDragTarget: boolean;
  isDraggingWorkout: WorkoutDay | null;
}) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayNum = format(date, 'd');
  const isRest = workout?.intensity === 'Rest';
  const hasWorkout = workout && !isRest;
  
  return (
    <Box
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, dateStr)}
      onClick={() => onClick(dateStr)}
      sx={{
        minHeight: { xs: 60, sm: 80 },
        p: 0.5,
        backgroundColor: isDragTarget 
          ? alpha('#22c55e', 0.1)
          : isToday 
            ? alpha('#22c55e', 0.05)
            : 'transparent',
        border: isDragTarget 
          ? `2px dashed ${alpha('#22c55e', 0.5)}`
          : isToday 
            ? `1px solid ${alpha('#22c55e', 0.3)}`
            : '1px solid transparent',
        borderRadius: 1,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        opacity: isCurrentMonth ? 1 : 0.3,
        '&:hover': {
          backgroundColor: alpha('#22c55e', 0.05),
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: isToday ? 700 : 400,
          color: isToday ? '#22c55e' : 'text.secondary',
          fontSize: '0.75rem',
          display: 'block',
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
  onDrop,
  dragTargetDate,
  isDraggingWorkout,
}: {
  month: Date;
  workouts: WorkoutDay[];
  onDayClick: (date: string) => void;
  onDragStart: (e: React.DragEvent, workout: WorkoutDay) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, date: string) => void;
  dragTargetDate: string | null;
  isDraggingWorkout: WorkoutDay | null;
}) {
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
        backgroundColor: alpha('#1a1a1a', 0.5),
        border: '1px solid #2a2a2a',
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
                onDrop={onDrop}
                isDragTarget={dragTargetDate === format(date, 'yyyy-MM-dd')}
                isDraggingWorkout={isDraggingWorkout}
              />
            ) : (
              <Box sx={{ minHeight: { xs: 60, sm: 80 } }} />
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
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
          onDrop={handleDrop}
          dragTargetDate={dragTargetDate}
          isDraggingWorkout={draggingWorkout}
        />
      ))}
    </Box>
  );
}
