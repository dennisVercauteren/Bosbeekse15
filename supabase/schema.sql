-- Bosbeekse 15 Training Plan - Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- WORKOUT_DAYS TABLE
-- Main table storing all workout data
-- ============================================
CREATE TABLE IF NOT EXISTS workout_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  phase TEXT NOT NULL,
  week INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  planned_distance_km NUMERIC(5,2),
  planned_duration_min INTEGER,
  intensity TEXT NOT NULL CHECK (intensity IN ('E', 'S', 'T', 'I', 'Rest', 'Strength')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'skipped', 'rescheduled')),
  completed_at TIMESTAMPTZ,
  moved_from_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_workout_days_date ON workout_days(date);
CREATE INDEX IF NOT EXISTS idx_workout_days_status ON workout_days(status);
CREATE INDEX IF NOT EXISTS idx_workout_days_week ON workout_days(week);

-- ============================================
-- CHECKINS TABLE
-- Daily check-in data (weight, sleep, pain, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  weight_kg NUMERIC(5,2),
  sleep_hours NUMERIC(4,2),
  steps INTEGER,
  energy_1_10 INTEGER CHECK (energy_1_10 >= 1 AND energy_1_10 <= 10),
  pain_0_10 INTEGER CHECK (pain_0_10 >= 0 AND pain_0_10 <= 10),
  pain_location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);

-- ============================================
-- HISTORY TABLE
-- Track changes for undo functionality
-- ============================================
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workout_days(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('moved', 'status_changed', 'edited')),
  from_date DATE,
  to_date DATE,
  from_status TEXT,
  to_status TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for workout history queries
CREATE INDEX IF NOT EXISTS idx_history_workout_id ON history(workout_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- For single-user app, we enable RLS but allow all operations
-- In production, you might want to add user-based policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (for single-user app with anon key)
-- These allow all operations through the anon key
-- For better security, consider using Supabase Auth

CREATE POLICY "Allow all operations on workout_days"
  ON workout_days FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on checkins"
  ON checkins FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on history"
  ON history FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- UPDATED_AT TRIGGER
-- Automatically update the updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to workout_days
DROP TRIGGER IF EXISTS update_workout_days_updated_at ON workout_days;
CREATE TRIGGER update_workout_days_updated_at
  BEFORE UPDATE ON workout_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to checkins
DROP TRIGGER IF EXISTS update_checkins_updated_at ON checkins;
CREATE TRIGGER update_checkins_updated_at
  BEFORE UPDATE ON checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPFUL VIEWS (optional)
-- ============================================

-- Weekly summary view
CREATE OR REPLACE VIEW weekly_summary AS
SELECT 
  week,
  phase,
  COUNT(*) as total_workouts,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
  COUNT(*) FILTER (WHERE status = 'rescheduled') as rescheduled,
  SUM(planned_distance_km) as total_distance_km,
  SUM(planned_duration_min) as total_duration_min
FROM workout_days
GROUP BY week, phase
ORDER BY week;

-- Current streak calculation function
CREATE OR REPLACE FUNCTION get_current_streak()
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT status 
    FROM workout_days 
    WHERE date <= CURRENT_DATE 
      AND intensity != 'Rest'
    ORDER BY date DESC
  LOOP
    IF rec.status = 'completed' THEN
      streak := streak + 1;
    ELSIF rec.status = 'skipped' THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE QUERIES (for reference)
-- ============================================

-- Get workouts for a specific week:
-- SELECT * FROM workout_days WHERE week = 1 ORDER BY date;

-- Get all completed workouts:
-- SELECT * FROM workout_days WHERE status = 'completed' ORDER BY date;

-- Get workouts in date range:
-- SELECT * FROM workout_days WHERE date BETWEEN '2026-01-01' AND '2026-01-31' ORDER BY date;

-- Get check-ins for the last 7 days:
-- SELECT * FROM checkins WHERE date >= CURRENT_DATE - INTERVAL '7 days' ORDER BY date DESC;

-- Get workout history:
-- SELECT h.*, w.title as workout_title 
-- FROM history h 
-- JOIN workout_days w ON h.workout_id = w.id 
-- ORDER BY h.created_at DESC;

