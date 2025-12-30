// Workout status types
export type WorkoutStatus = 'planned' | 'completed' | 'skipped' | 'rescheduled';

// Intensity levels
export type Intensity = 'E' | 'S' | 'T' | 'I' | 'Rest' | 'Strength';

// Activity types for custom activities
export type ActivityType = 'run' | 'walk' | 'cycle' | 'swim' | 'padel' | 'squash' | 'strength' | 'rest';

// Workout tags
export type WorkoutTag = 
  | 'easy' 
  | 'steady' 
  | 'tempo' 
  | 'interval' 
  | 'longrun' 
  | 'strength' 
  | 'rest' 
  | 'race'
  | 'deload';

// Main workout entity
export interface WorkoutDay {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  title: string;
  details: string;
  phase: string;
  week: number;
  tags: WorkoutTag[];
  planned_distance_km: number | null;
  planned_duration_min: number | null;
  actual_distance_km: number | null;
  actual_duration_min: number | null;
  intensity: Intensity;
  status: WorkoutStatus;
  completed_at: string | null;
  moved_from_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  activity_type?: ActivityType; // Optional - for custom activity categorization
}

// For creating/updating workouts
export interface WorkoutDayInput {
  date: string;
  title: string;
  details: string;
  phase: string;
  week: number;
  tags: WorkoutTag[];
  planned_distance_km?: number | null;
  planned_duration_min?: number | null;
  actual_distance_km?: number | null;
  actual_duration_min?: number | null;
  intensity: Intensity;
  status?: WorkoutStatus;
  notes?: string | null;
  activity_type?: ActivityType;
}

// Check-in entity for daily tracking
export interface CheckIn {
  id: string;
  date: string;
  weight_kg: number | null;
  sleep_hours: number | null;
  steps: number | null;
  energy_1_10: number | null;
  pain_0_10: number | null;
  pain_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckInInput {
  date: string;
  weight_kg?: number | null;
  sleep_hours?: number | null;
  steps?: number | null;
  energy_1_10?: number | null;
  pain_0_10?: number | null;
  pain_location?: string | null;
  notes?: string | null;
}

// History entry for tracking changes
export interface HistoryEntry {
  id: string;
  workout_id: string;
  action: 'moved' | 'status_changed' | 'edited';
  from_date: string | null;
  to_date: string | null;
  from_status: WorkoutStatus | null;
  to_status: WorkoutStatus | null;
  details: string | null;
  created_at: string;
}

// Stats types
export interface WeeklyStats {
  week: number;
  startDate: string;
  endDate: string;
  plannedRuns: number;
  completedRuns: number;
  skippedRuns: number;
  totalPlannedDistance: number;
  totalPlannedDuration: number;
  completionRate: number;
}

export interface OverallStats {
  totalWorkouts: number;
  completedWorkouts: number;
  skippedWorkouts: number;
  rescheduledWorkouts: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalPlannedDistance: number;
  totalPlannedDuration: number;
  nextWorkout: WorkoutDay | null;
}

// Calendar event type for FullCalendar
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    workout: WorkoutDay;
  };
}

// Filter options
export interface FilterOptions {
  status: WorkoutStatus | 'all';
  intensity: Intensity | 'all';
  tag: WorkoutTag | 'all';
}

// App settings
export interface AppSettings {
  darkMode: boolean;
  showCompletedBadges: boolean;
  defaultView: 'month' | 'week';
}

// Undo action
export interface UndoAction {
  type: 'move' | 'status_change';
  workoutId: string;
  previousState: Partial<WorkoutDay>;
  timestamp: number;
}

