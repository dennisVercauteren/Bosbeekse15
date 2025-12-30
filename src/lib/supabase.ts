import { createClient } from '@supabase/supabase-js';
import type { WorkoutDay, WorkoutDayInput, CheckIn, CheckInInput, HistoryEntry } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Running in demo mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Workout Days CRUD
export const workoutService = {
  async getAll(): Promise<WorkoutDay[]> {
    const { data, error } = await supabase
      .from('workout_days')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByDateRange(startDate: string, endDate: string): Promise<WorkoutDay[]> {
    const { data, error } = await supabase
      .from('workout_days')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByDate(date: string): Promise<WorkoutDay | null> {
    const { data, error } = await supabase
      .from('workout_days')
      .select('*')
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(workout: WorkoutDayInput): Promise<WorkoutDay> {
    // Explicitly map fields to ensure we only send columns that exist in the database
    const insertData = {
      date: workout.date,
      title: workout.title,
      details: workout.details,
      phase: workout.phase,
      week: workout.week,
      tags: workout.tags,
      planned_distance_km: workout.planned_distance_km ?? null,
      planned_duration_min: workout.planned_duration_min ?? null,
      actual_distance_km: workout.actual_distance_km ?? null,
      actual_duration_min: workout.actual_duration_min ?? null,
      intensity: workout.intensity,
      status: workout.status || 'planned',
      notes: workout.notes ?? null,
      activity_type: workout.activity_type ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('workout_days')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createMany(workouts: WorkoutDayInput[]): Promise<WorkoutDay[]> {
    const now = new Date().toISOString();
    // Explicitly map fields to ensure we only send columns that exist in the database
    const workoutsWithTimestamps = workouts.map(w => ({
      date: w.date,
      title: w.title,
      details: w.details,
      phase: w.phase,
      week: w.week,
      tags: w.tags,
      planned_distance_km: w.planned_distance_km ?? null,
      planned_duration_min: w.planned_duration_min ?? null,
      actual_distance_km: w.actual_distance_km ?? null,
      actual_duration_min: w.actual_duration_min ?? null,
      intensity: w.intensity,
      status: w.status || 'planned',
      notes: w.notes ?? null,
      activity_type: w.activity_type ?? null,
      created_at: now,
      updated_at: now,
    }));

    const { data, error } = await supabase
      .from('workout_days')
      .insert(workoutsWithTimestamps)
      .select();

    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: Partial<WorkoutDayInput>): Promise<WorkoutDay> {
    const { data, error } = await supabase
      .from('workout_days')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateByDate(date: string, updates: Partial<WorkoutDayInput>): Promise<WorkoutDay> {
    const { data, error } = await supabase
      .from('workout_days')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('date', date)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async moveWorkout(workoutId: string, newDate: string, oldDate: string): Promise<WorkoutDay> {
    // First check if there's already a workout on the target date
    const existing = await this.getByDate(newDate);
    if (existing) {
      throw new Error(`There's already a workout scheduled for ${newDate}`);
    }

    const { data, error } = await supabase
      .from('workout_days')
      .update({
        date: newDate,
        moved_from_date: oldDate,
        status: 'rescheduled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', workoutId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markStatus(id: string, status: WorkoutDay['status']): Promise<WorkoutDay> {
    const updates: Partial<WorkoutDay> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('workout_days')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workout_days')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAll(): Promise<void> {
    // Supabase requires a WHERE clause for delete operations.
    // Using .neq('id', UUID_ZERO) effectively matches all rows since no real ID equals UUID_ZERO.
    // This is a common pattern for "delete all" operations in Supabase.
    const { error } = await supabase
      .from('workout_days')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw error;
  },

  async count(): Promise<number> {
    const { count, error } = await supabase
      .from('workout_days')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  },
};

// Check-ins CRUD
export const checkInService = {
  async getAll(): Promise<CheckIn[]> {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByDate(date: string): Promise<CheckIn | null> {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsert(checkIn: CheckInInput): Promise<CheckIn> {
    const { data, error } = await supabase
      .from('checkins')
      .upsert({
        ...checkIn,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('checkins')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// History tracking
export const historyService = {
  async getAll(): Promise<HistoryEntry[]> {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  async getByWorkout(workoutId: string): Promise<HistoryEntry[]> {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('workout_id', workoutId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(entry: Omit<HistoryEntry, 'id' | 'created_at'>): Promise<HistoryEntry> {
    const { data, error } = await supabase
      .from('history')
      .insert([{
        ...entry,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Export data as JSON
export const exportData = async (): Promise<string> => {
  const [workouts, checkIns, history] = await Promise.all([
    workoutService.getAll(),
    checkInService.getAll(),
    historyService.getAll(),
  ]);

  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    workouts,
    checkIns,
    history,
  }, null, 2);
};

// Import data from JSON
export const importData = async (jsonString: string): Promise<void> => {
  let data: { workouts?: unknown[] };
  
  try {
    data = JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON format: unable to parse backup file');
  }
  
  if (!data.workouts || !Array.isArray(data.workouts)) {
    throw new Error('Invalid backup file: missing workouts array');
  }
  
  // Delete existing and import new
  await workoutService.deleteAll();
  await workoutService.createMany(data.workouts as WorkoutDayInput[]);
};

