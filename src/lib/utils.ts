import { format, parseISO, isToday, isFuture, isPast, differenceInDays } from 'date-fns';
import type { WorkoutDay, Intensity, WorkoutStatus, CalendarEvent, OverallStats, WeeklyStats } from '../types';
import { intensityColors, statusColors } from './theme';

// Date formatting helpers
export const formatDate = (date: string | Date, formatStr = 'MMM d, yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

export const formatDateShort = (date: string | Date): string => {
  return formatDate(date, 'MMM d');
};

export const formatWeekday = (date: string | Date): string => {
  return formatDate(date, 'EEEE');
};

export const getDateStatus = (date: string): 'past' | 'today' | 'future' => {
  const d = parseISO(date);
  if (isToday(d)) return 'today';
  if (isPast(d)) return 'past';
  return 'future';
};

export const getDaysUntil = (date: string): number => {
  return differenceInDays(parseISO(date), new Date());
};

// Intensity helpers - all workouts use same accent color
export const getIntensityColor = (intensity: Intensity): string => {
  if (intensity === 'Rest') return 'transparent';
  return '#22c55e'; // Single accent color for all workouts
};

export const getIntensityLabel = (intensity: Intensity): string => {
  const labels: Record<Intensity, string> = {
    'E': 'Easy',
    'S': 'Steady',
    'T': 'Tempo',
    'I': 'Intervals',
    'Rest': 'Rest',
    'Strength': 'Strength',
  };
  return labels[intensity] || 'Unknown';
};

export const getIntensityDescription = (intensity: Intensity): string => {
  const descriptions: Record<Intensity, string> = {
    'E': 'Comfortable, can talk; RPE 3-4/10',
    'S': 'Comfortably challenging, short sentences; RPE 6/10',
    'T': 'Controlled hard, 20-30 min sustainable; RPE 7/10',
    'I': 'Short, strong effort but controlled; RPE 8/10',
    'Rest': 'Recovery day - let your body adapt',
    'Strength': 'Strength training for injury prevention',
  };
  return descriptions[intensity] || '';
};

// Status helpers
export const getStatusColor = (status: WorkoutStatus): string => {
  return statusColors[status] || statusColors.planned;
};

export const getStatusLabel = (status: WorkoutStatus): string => {
  const labels: Record<WorkoutStatus, string> = {
    'planned': 'Planned',
    'completed': 'Completed',
    'skipped': 'Skipped',
    'rescheduled': 'Rescheduled',
  };
  return labels[status] || 'Unknown';
};

// Calendar event conversion
export const workoutToCalendarEvent = (workout: WorkoutDay): CalendarEvent => {
  const intensity = workout.intensity;
  const status = workout.status;
  
  // Base color on intensity, modify opacity based on status
  let backgroundColor = getIntensityColor(intensity);
  let borderColor = backgroundColor;
  
  // Adjust for status
  if (status === 'completed') {
    borderColor = statusColors.completed;
  } else if (status === 'skipped') {
    backgroundColor = `${backgroundColor}66`; // 40% opacity
    borderColor = statusColors.skipped;
  } else if (status === 'rescheduled') {
    borderColor = statusColors.rescheduled;
  }
  
  return {
    id: workout.id,
    title: workout.title,
    date: workout.date,
    backgroundColor,
    borderColor,
    textColor: '#fff',
    extendedProps: {
      workout,
    },
  };
};

// Statistics calculations
export const calculateOverallStats = (workouts: WorkoutDay[]): OverallStats => {
  const pastWorkouts = workouts.filter(w => isPast(parseISO(w.date)) || isToday(parseISO(w.date)));
  
  const completed = workouts.filter(w => w.status === 'completed');
  const skipped = workouts.filter(w => w.status === 'skipped');
  const rescheduled = workouts.filter(w => w.status === 'rescheduled');
  
  // Calculate streaks (consecutive completed workouts)
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Sort by date and calculate streaks
  const sortedPast = [...pastWorkouts]
    .filter(w => w.intensity !== 'Rest')
    .sort((a, b) => a.date.localeCompare(b.date));
  
  for (const workout of sortedPast) {
    if (workout.status === 'completed') {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (workout.status === 'skipped') {
      tempStreak = 0;
    }
  }
  
  // Current streak (from today backwards)
  const reversedPast = [...sortedPast].reverse();
  for (const workout of reversedPast) {
    if (workout.status === 'completed') {
      currentStreak++;
    } else if (workout.status === 'skipped') {
      break;
    }
  }
  
  // Calculate totals
  const totalPlannedDistance = workouts.reduce((sum, w) => sum + (w.planned_distance_km || 0), 0);
  const totalPlannedDuration = workouts.reduce((sum, w) => sum + (w.planned_duration_min || 0), 0);
  
  // Find next workout
  const nextWorkout = workouts
    .filter(w => isFuture(parseISO(w.date)) && w.intensity !== 'Rest' && w.status === 'planned')
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
  
  // Completion rate (only for past non-rest workouts)
  const pastNonRest = pastWorkouts.filter(w => w.intensity !== 'Rest');
  const completionRate = pastNonRest.length > 0 
    ? (completed.filter(w => pastNonRest.some(p => p.id === w.id)).length / pastNonRest.length) * 100
    : 0;
  
  return {
    totalWorkouts: workouts.length,
    completedWorkouts: completed.length,
    skippedWorkouts: skipped.length,
    rescheduledWorkouts: rescheduled.length,
    completionRate,
    currentStreak,
    longestStreak,
    totalPlannedDistance,
    totalPlannedDuration,
    nextWorkout,
  };
};

export const calculateWeeklyStats = (workouts: WorkoutDay[], weekNumber: number): WeeklyStats | null => {
  const weekWorkouts = workouts.filter(w => w.week === weekNumber);
  if (weekWorkouts.length === 0) return null;
  
  const dates = weekWorkouts.map(w => parseISO(w.date)).sort((a, b) => a.getTime() - b.getTime());
  const startDate = format(dates[0], 'yyyy-MM-dd');
  const endDate = format(dates[dates.length - 1], 'yyyy-MM-dd');
  
  const runs = weekWorkouts.filter(w => ['E', 'S', 'T', 'I'].includes(w.intensity));
  const completedRuns = runs.filter(w => w.status === 'completed').length;
  const skippedRuns = runs.filter(w => w.status === 'skipped').length;
  
  return {
    week: weekNumber,
    startDate,
    endDate,
    plannedRuns: runs.length,
    completedRuns,
    skippedRuns,
    totalPlannedDistance: weekWorkouts.reduce((sum, w) => sum + (w.planned_distance_km || 0), 0),
    totalPlannedDuration: weekWorkouts.reduce((sum, w) => sum + (w.planned_duration_min || 0), 0),
    completionRate: runs.length > 0 ? (completedRuns / runs.length) * 100 : 0,
  };
};

// Local storage helpers
export const STORAGE_KEYS = {
  DARK_MODE: 'bosbeekse15_darkMode',
  AUTH_TOKEN: 'bosbeekse15_auth',
  UNDO_STACK: 'bosbeekse15_undoStack',
  FILTERS: 'bosbeekse15_filters',
};

export const getStoredValue = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStoredValue = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

// iCal export
export const generateICalFile = (workouts: WorkoutDay[]): string => {
  const now = new Date();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bosbeekse 15//Training Plan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Bosbeekse 15 Training',
    'X-WR-TIMEZONE:Europe/Amsterdam',
  ];
  
  for (const workout of workouts) {
    if (workout.intensity === 'Rest') continue;
    
    const date = workout.date.replace(/-/g, '');
    const uid = `${workout.id}@bosbeekse15.kubu.net`;
    const summary = `🏃 ${workout.title}`;
    const description = workout.details.replace(/\n/g, '\\n');
    const dtstamp = format(now, "yyyyMMdd'T'HHmmss'Z'");
    
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${date}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `STATUS:${workout.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT'
    );
  }
  
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

// Download helper
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

