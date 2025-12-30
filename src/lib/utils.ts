import { format, parseISO, differenceInDays } from 'date-fns';
import type { Intensity, WorkoutDay, OverallStats, WeeklyStats } from '../types';

// LocalStorage helpers
export const STORAGE_KEYS = {
  DARK_MODE: 'bosbeekse15_darkMode',
  AUTH_TOKEN: 'bosbeekse15_auth',
  FILTERS: 'bosbeekse15_filters',
} as const;

export const getStoredValue = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStoredValue = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Date formatting helpers
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
};

export const formatDisplayDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE, MMMM d, yyyy');
};

export const formatShortDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
};

// Days until a date
export const getDaysUntil = (date: string): number => {
  const targetDate = parseISO(date);
  const today = new Date();
  return differenceInDays(targetDate, today);
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
    'I': 'Interval',
    'Rest': 'Rest',
    'Strength': 'Strength',
  };
  return labels[intensity] || intensity;
};

// Week calculation
export const getWeekNumber = (date: string): number => {
  const startDate = new Date('2026-01-02');
  const currentDate = parseISO(date);
  const diffTime = currentDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Export helpers
export const downloadJSON = (data: unknown, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Download file helper
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

// Generate iCal file content
export const generateICalFile = (workouts: WorkoutDay[]): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bosbeekse15//Training Plan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  workouts
    .filter(w => w.intensity !== 'Rest')
    .forEach(workout => {
      const dateStr = workout.date.replace(/-/g, '');
      lines.push(
        'BEGIN:VEVENT',
        `UID:${workout.id}@bosbeekse15`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
        `SUMMARY:${workout.title}`,
        `DESCRIPTION:${workout.details?.replace(/\n/g, '\\n') || ''}`,
        `STATUS:${workout.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'}`,
        'END:VEVENT'
      );
    });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

// Calculate overall stats
export const calculateOverallStats = (workouts: WorkoutDay[]): OverallStats => {
  const nonRestWorkouts = workouts.filter(w => w.intensity !== 'Rest');
  const completedWorkouts = nonRestWorkouts.filter(w => w.status === 'completed');
  const skippedWorkouts = nonRestWorkouts.filter(w => w.status === 'skipped');
  const rescheduledWorkouts = nonRestWorkouts.filter(w => w.status === 'rescheduled');
  
  // Calculate streak
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const plannedDates = nonRestWorkouts
    .filter(w => w.date <= today)
    .map(w => w.date)
    .sort()
    .reverse();
  
  for (const date of plannedDates) {
    const workout = workouts.find(w => w.date === date);
    if (workout?.status === 'completed') {
      streak++;
      if (streak > longestStreak) longestStreak = streak;
    } else {
      if (currentStreak === 0) currentStreak = streak;
      streak = 0;
    }
  }
  if (currentStreak === 0) currentStreak = streak;
  
  // Find next workout
  const nextWorkout = nonRestWorkouts
    .filter(w => w.date >= today && w.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
  
  // Total distance and duration
  const totalPlannedDistance = nonRestWorkouts.reduce(
    (sum, w) => sum + (w.planned_distance_km || 0),
    0
  );
  const totalPlannedDuration = nonRestWorkouts.reduce(
    (sum, w) => sum + (w.planned_duration_min || 0),
    0
  );
  
  const completionRate = nonRestWorkouts.length > 0
    ? (completedWorkouts.length / nonRestWorkouts.filter(w => w.date <= today).length) * 100
    : 0;

  return {
    totalWorkouts: nonRestWorkouts.length,
    completedWorkouts: completedWorkouts.length,
    skippedWorkouts: skippedWorkouts.length,
    rescheduledWorkouts: rescheduledWorkouts.length,
    completionRate: isNaN(completionRate) ? 0 : completionRate,
    currentStreak,
    longestStreak,
    totalPlannedDistance,
    totalPlannedDuration,
    nextWorkout,
  };
};

// Calculate weekly stats
export const calculateWeeklyStats = (workouts: WorkoutDay[], weekNum: number): WeeklyStats | null => {
  const weekWorkouts = workouts.filter(w => w.week === weekNum && w.intensity !== 'Rest');
  
  if (weekWorkouts.length === 0) return null;
  
  const dates = weekWorkouts.map(w => w.date).sort();
  const completedRuns = weekWorkouts.filter(w => w.status === 'completed').length;
  const skippedRuns = weekWorkouts.filter(w => w.status === 'skipped').length;
  
  return {
    week: weekNum,
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    plannedRuns: weekWorkouts.length,
    completedRuns,
    skippedRuns,
    totalPlannedDistance: weekWorkouts.reduce((sum, w) => sum + (w.planned_distance_km || 0), 0),
    totalPlannedDuration: weekWorkouts.reduce((sum, w) => sum + (w.planned_duration_min || 0), 0),
    completionRate: weekWorkouts.length > 0 ? (completedRuns / weekWorkouts.length) * 100 : 0,
  };
};
