import { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  alpha,
  useTheme,
  Collapse,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import BoltIcon from '@mui/icons-material/Bolt';
import HealingIcon from '@mui/icons-material/Healing';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import { useApp } from '../context/AppContext';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { activityColors } from '../lib/theme';

type TimeRange = '7d' | '30d' | 'all';

// Chart data types
interface CheckInChartData {
  date: string;
  fullDate: string;
  weight: number | null;
  sleep: number | null;
  steps: number | null;
  energy: number | null;
  pain: number | null;
}

interface ActivityDistanceData {
  name: string;
  distance: number;
  color: string;
}

interface WeeklyDistanceData {
  week: string;
  weekNum: number;
  run: number;
  walk: number;
  cycle: number;
}

// Full-width bar chart for a single metric
function FullWidthBarChart({
  title,
  icon,
  data,
  dataKey,
  color,
  unit,
  domain,
}: {
  title: string;
  icon: React.ReactNode;
  data: CheckInChartData[];
  dataKey: keyof CheckInChartData;
  color: string;
  unit?: string;
  domain?: [number | 'auto', number | 'auto'];
}) {
  const theme = useTheme();
  
  // Filter out null/undefined/0 values
  const filteredData = data.filter(d => d[dataKey] !== null && d[dataKey] !== undefined && d[dataKey] !== 0);
  
  // Get latest value
  const latestValue = filteredData.length > 0 ? filteredData[filteredData.length - 1]?.[dataKey] : null;
  
  if (filteredData.length === 0) {
    return null; // Don't render if no valid data
  }
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Typography variant="subtitle2" fontWeight={600}>
          {title}
        </Typography>
        {latestValue !== null && (
          <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 700, color }}>
            {latestValue}{unit}
          </Typography>
        )}
      </Box>
      <Box sx={{ height: 120, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={domain || ['auto', 'auto']}
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value}${unit || ''}`, title]}
              labelFormatter={(label) => label}
            />
            <Bar 
              dataKey={dataKey} 
              fill={color} 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

// Distance by activity chart
function DistanceChart({ data }: { data: ActivityDistanceData[] }) {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        mb: 2,
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
        Distance by Activity (km)
      </Typography>
      <Box sx={{ height: 150 }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
              <XAxis 
                dataKey="name" 
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
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value.toFixed(1)} km`, 'Distance']}
              />
              <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Bar key={index} dataKey="distance" fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              No completed workouts yet
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

// Weekly distance trend chart
function WeeklyDistanceChart({ data }: { data: WeeklyDistanceData[] }) {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        mb: 2,
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
        Weekly Distance Trend (km)
      </Typography>
      <Box sx={{ height: 180 }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
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
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line 
                type="monotone" 
                dataKey="run" 
                stroke={activityColors.run} 
                strokeWidth={2}
                dot={{ fill: activityColors.run, strokeWidth: 0, r: 3 }}
                name="Running"
              />
              <Line 
                type="monotone" 
                dataKey="walk" 
                stroke={activityColors.walk} 
                strokeWidth={2}
                dot={{ fill: activityColors.walk, strokeWidth: 0, r: 3 }}
                name="Walking"
              />
              <Line 
                type="monotone" 
                dataKey="cycle" 
                stroke={activityColors.cycle} 
                strokeWidth={2}
                dot={{ fill: activityColors.cycle, strokeWidth: 0, r: 3 }}
                name="Cycling"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              No data yet
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default function StatsDashboard() {
  const { state } = useApp();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  
  // Filter check-ins by time range
  const filteredCheckIns = useMemo(() => {
    if (timeRange === 'all') return state.checkIns;
    
    const days = timeRange === '7d' ? 7 : 30;
    const cutoff = subDays(new Date(), days);
    
    return state.checkIns.filter(c => isAfter(parseISO(c.date), cutoff));
  }, [state.checkIns, timeRange]);
  
  // Prepare check-in data for charts
  const checkInData = useMemo(() => {
    return filteredCheckIns
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(c => ({
        date: format(parseISO(c.date), 'MMM d'),
        fullDate: c.date,
        weight: c.weight_kg,
        sleep: c.sleep_hours,
        steps: c.steps ? Math.round(c.steps / 1000) : null, // Convert to thousands
        energy: c.energy_1_10,
        pain: c.pain_0_10,
      }));
  }, [filteredCheckIns]);
  
  // Calculate distance by activity type (only completed workouts)
  // Uses actual_distance_km when available, falls back to planned_distance_km
  const distanceByActivity = useMemo(() => {
    const totals: Record<string, number> = {
      run: 0,
      walk: 0,
      cycle: 0,
      swim: 0,
      total: 0,
    };
    
    state.workouts
      .filter(w => w.status === 'completed' && (w.actual_distance_km || w.planned_distance_km))
      .forEach(w => {
        // Prefer actual distance over planned for completed workouts
        const distance = w.actual_distance_km ?? w.planned_distance_km ?? 0;
        const type = w.activity_type || 'run';
        
        if (type in totals) {
          totals[type] += distance;
        }
        totals.total += distance;
      });
    
    return [
      { name: 'Running', distance: totals.run, color: activityColors.run },
      { name: 'Walking', distance: totals.walk, color: activityColors.walk },
      { name: 'Cycling', distance: totals.cycle, color: activityColors.cycle },
      { name: 'Swimming', distance: totals.swim, color: activityColors.swim },
    ].filter(d => d.distance > 0);
  }, [state.workouts]);
  
  // Total distance summary (uses actual distance when available)
  const totalDistance = useMemo(() => {
    return state.workouts
      .filter(w => w.status === 'completed' && (w.actual_distance_km || w.planned_distance_km))
      .reduce((sum, w) => sum + (w.actual_distance_km ?? w.planned_distance_km ?? 0), 0);
  }, [state.workouts]);
  
  // Weekly distance data (uses actual distance when available)
  const weeklyDistanceData = useMemo(() => {
    const weeks: Record<number, { run: number; walk: number; cycle: number }> = {};
    
    state.workouts
      .filter(w => w.status === 'completed' && (w.actual_distance_km || w.planned_distance_km))
      .forEach(w => {
        const week = w.week;
        if (!weeks[week]) {
          weeks[week] = { run: 0, walk: 0, cycle: 0 };
        }
        
        const distance = w.actual_distance_km ?? w.planned_distance_km ?? 0;
        const type = w.activity_type || 'run';
        if (type === 'run') weeks[week].run += distance;
        else if (type === 'walk') weeks[week].walk += distance;
        else if (type === 'cycle') weeks[week].cycle += distance;
      });
    
    return Object.entries(weeks)
      .map(([week, data]) => ({
        week: `W${week}`,
        weekNum: parseInt(week),
        ...data,
      }))
      .sort((a, b) => a.weekNum - b.weekNum);
  }, [state.workouts]);
  
  // Check-in counts
  const hasCheckInData = state.checkIns.length > 0;
  const hasWorkoutData = state.workouts.filter(w => w.status === 'completed').length > 0;
  
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        mb: 2,
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            📈 Stats Dashboard
          </Typography>
          {totalDistance > 0 && (
            <Typography variant="caption" color="text.secondary">
              {totalDistance.toFixed(1)} km completed
            </Typography>
          )}
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {/* Time range selector */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(_, value) => value && setTimeRange(value)}
              size="small"
            >
              <ToggleButton value="7d">7 days</ToggleButton>
              <ToggleButton value="30d">30 days</ToggleButton>
              <ToggleButton value="all">All</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {/* Check-in metrics - Full width bar charts */}
          {hasCheckInData && (
            <>
              <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 2, display: 'block' }}>
                DAILY CHECK-INS
              </Typography>
              
              <FullWidthBarChart
                title="Weight"
                icon={<MonitorWeightIcon fontSize="small" />}
                data={checkInData}
                dataKey="weight"
                color={activityColors.run}
                unit=" kg"
              />
              
              <FullWidthBarChart
                title="Sleep"
                icon={<BedtimeIcon fontSize="small" />}
                data={checkInData}
                dataKey="sleep"
                color="#8b5cf6"
                unit=" h"
                domain={[0, 12]}
              />
              
              <FullWidthBarChart
                title="Steps (thousands)"
                icon={<DirectionsWalkIcon fontSize="small" />}
                data={checkInData}
                dataKey="steps"
                color={activityColors.walk}
                unit="k"
              />
              
              <FullWidthBarChart
                title="Energy Level"
                icon={<BoltIcon fontSize="small" />}
                data={checkInData}
                dataKey="energy"
                color="#eab308"
                unit="/10"
                domain={[0, 10]}
              />
              
              <FullWidthBarChart
                title="Pain Level"
                icon={<HealingIcon fontSize="small" />}
                data={checkInData}
                dataKey="pain"
                color="#ef4444"
                unit="/10"
                domain={[0, 10]}
              />
            </>
          )}
          
          {/* Activity distance charts */}
          <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 2, mt: 3, display: 'block' }}>
            ACTIVITY DISTANCE
          </Typography>
          
          <DistanceChart data={distanceByActivity} />
          <WeeklyDistanceChart data={weeklyDistanceData} />
          
          {/* Summary stats */}
          <Box 
            sx={{ 
              mt: 2, 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DirectionsRunIcon sx={{ color: activityColors.run, fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary">
                Run: <strong>{distanceByActivity.find(d => d.name === 'Running')?.distance.toFixed(1) || 0}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DirectionsWalkIcon sx={{ color: activityColors.walk, fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary">
                Walk: <strong>{distanceByActivity.find(d => d.name === 'Walking')?.distance.toFixed(1) || 0}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DirectionsBikeIcon sx={{ color: activityColors.cycle, fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary">
                Cycle: <strong>{distanceByActivity.find(d => d.name === 'Cycling')?.distance.toFixed(1) || 0}</strong>
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total: <strong>{totalDistance.toFixed(1)} km</strong>
              </Typography>
            </Box>
          </Box>
          
          {!hasCheckInData && !hasWorkoutData && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Complete workouts and add daily check-ins to see your stats here!
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
