import { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useApp } from '../context/AppContext';
import { calculateOverallStats, calculateWeeklyStats, formatDate, getDaysUntil } from '../lib/utils';
import { PLAN_METADATA } from '../plan/template';
import { intensityColors } from '../lib/theme';

// Stat card component
function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) {
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: `1px solid ${alpha(color, 0.2)}`,
        backgroundColor: alpha(color, 0.05),
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: alpha(color, 0.15),
            color: color,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color, lineHeight: 1.2 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default function StatsPanel() {
  const { state } = useApp();
  const theme = useTheme();
  
  const stats = useMemo(() => calculateOverallStats(state.workouts), [state.workouts]);
  
  // Calculate weekly stats for chart
  const weeklyData = useMemo(() => {
    const data = [];
    for (let week = 1; week <= 17; week++) {
      const weekStats = calculateWeeklyStats(state.workouts, week);
      if (weekStats) {
        data.push({
          week: `W${week}`,
          weekNum: week,
          completed: weekStats.completedRuns,
          planned: weekStats.plannedRuns,
          rate: weekStats.completionRate,
          distance: weekStats.totalPlannedDistance,
          duration: weekStats.totalPlannedDuration,
        });
      }
    }
    return data;
  }, [state.workouts]);
  
  // Workout type distribution
  const typeDistribution = useMemo(() => {
    const distribution: Record<string, number> = {
      Easy: 0,
      Steady: 0,
      Tempo: 0,
      Strength: 0,
      Rest: 0,
    };
    
    state.workouts.forEach(w => {
      if (w.intensity === 'E') distribution['Easy']++;
      else if (w.intensity === 'S') distribution['Steady']++;
      else if (w.intensity === 'T') distribution['Tempo']++;
      else if (w.intensity === 'Strength') distribution['Strength']++;
      else if (w.intensity === 'Rest') distribution['Rest']++;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      color: name === 'Easy' ? intensityColors.easy
        : name === 'Steady' ? intensityColors.steady
        : name === 'Tempo' ? intensityColors.tempo
        : name === 'Strength' ? intensityColors.strength
        : intensityColors.rest,
    }));
  }, [state.workouts]);
  
  const daysUntilRace = getDaysUntil(PLAN_METADATA.endDate);
  
  return (
    <Box sx={{ py: 2 }}>
      {/* Days until race banner */}
      {daysUntilRace > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
          <Typography variant="h3" fontWeight={700}>
            {daysUntilRace}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            days until {PLAN_METADATA.goalEvent}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Goal: {PLAN_METADATA.goalDistance} km on {formatDate(PLAN_METADATA.endDate)}
          </Typography>
        </Paper>
      )}
      
      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<CheckCircleIcon />}
            title="Completed"
            value={stats.completedWorkouts}
            subtitle={`of ${stats.totalWorkouts} workouts`}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<LocalFireDepartmentIcon />}
            title="Current Streak"
            value={stats.currentStreak}
            subtitle={`Best: ${stats.longestStreak}`}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<DirectionsRunIcon />}
            title="Total Distance"
            value={`${stats.totalPlannedDistance.toFixed(1)}`}
            subtitle="km planned"
            color={intensityColors.easy}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<TimerIcon />}
            title="Total Time"
            value={Math.round(stats.totalPlannedDuration / 60)}
            subtitle="hours planned"
            color={intensityColors.steady}
          />
        </Grid>
      </Grid>
      
      {/* Completion rate */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Overall Completion Rate
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={stats.completionRate}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  backgroundColor: theme.palette.success.main,
                },
              }}
            />
          </Box>
          <Typography variant="h6" fontWeight={600} color="success.main">
            {stats.completionRate.toFixed(0)}%
          </Typography>
        </Box>
      </Paper>
      
      {/* Next workout */}
      {stats.nextWorkout && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Next Workout
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {stats.nextWorkout.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(stats.nextWorkout.date)} · {stats.nextWorkout.phase} · Week {stats.nextWorkout.week}
          </Typography>
          {stats.nextWorkout.planned_duration_min && (
            <Chip 
              label={`${stats.nextWorkout.planned_duration_min} min`} 
              size="small" 
              sx={{ mt: 1 }}
            />
          )}
          {stats.nextWorkout.planned_distance_km && (
            <Chip 
              label={`${stats.nextWorkout.planned_distance_km} km`} 
              size="small" 
              sx={{ mt: 1, ml: 1 }}
            />
          )}
        </Paper>
      )}
      
      {/* Weekly progress chart */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Weekly Completion
        </Typography>
        <Box sx={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="completed" name="Completed" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} />
              <Bar dataKey="planned" name="Planned" fill={alpha(theme.palette.primary.main, 0.3)} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      
      {/* Workout type distribution */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Workout Types
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {typeDistribution.filter(d => d.value > 0).map(type => (
            <Chip
              key={type.name}
              label={`${type.name}: ${type.value}`}
              size="small"
              sx={{
                backgroundColor: alpha(type.color, 0.15),
                color: type.color,
                fontWeight: 500,
              }}
            />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

