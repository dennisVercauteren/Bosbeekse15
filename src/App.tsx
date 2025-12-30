import { ThemeProvider, CssBaseline, Box, Container, Typography, Link, Chip, alpha } from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MapIcon from '@mui/icons-material/Map';
import { AppProvider, useApp } from './context/AppContext';
import { createAppTheme } from './lib/theme';
import Calendar from './components/Calendar';
import WorkoutModal from './components/WorkoutModal';
import StatsPanel from './components/StatsPanel';
import FilterBar from './components/FilterBar';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import InitializePlan from './components/InitializePlan';
import CheckInForm from './components/CheckInForm';

function AppContent() {
  const { state } = useApp();

  if (!state.authenticated) {
    return <LoginScreen />;
  }

  if (state.workouts.length === 0) {
    return <InitializePlan />;
  }
  
  // Calculate days until race
  const raceDate = new Date('2026-05-02');
  const today = new Date();
  const daysUntil = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate progress
  const completedWorkouts = state.workouts.filter(w => w.status === 'completed' && w.intensity !== 'Rest').length;
  const totalWorkouts = state.workouts.filter(w => w.intensity !== 'Rest').length;
  const progress = Math.round((completedWorkouts / totalWorkouts) * 100);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: alpha('#111111', 0.95),
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {/* Title & Race Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DirectionsRunIcon sx={{ color: '#22c55e', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  Bosbeekse 15
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {daysUntil} days to go • {progress}% complete
                </Typography>
              </Box>
            </Box>
            
            {/* Route link */}
            <Link
              href="https://www.komoot.com/tour/2731338257"
              target="_blank"
              rel="noopener"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.8rem',
                '&:hover': { color: '#22c55e' },
              }}
            >
              <MapIcon sx={{ fontSize: 16 }} />
              View Route
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Stats Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          <StatCard 
            label="Completed" 
            value={completedWorkouts} 
            suffix={`/ ${totalWorkouts}`}
          />
          <StatCard 
            label="Days Left" 
            value={daysUntil} 
          />
          <StatCard 
            label="Progress" 
            value={progress} 
            suffix="%"
          />
          <StatCard 
            label="This Week" 
            value={getThisWeekWorkouts(state.workouts)} 
          />
        </Box>
        
        {/* Filter Bar */}
        <Box sx={{ mb: 3 }}>
          <FilterBar />
        </Box>
        
        {/* Calendar - All months */}
        <Calendar />
      </Container>

      {/* Modal */}
      <WorkoutModal />
    </Box>
  );
}

// Simple stat card
function StatCard({ label, value, suffix = '' }: { label: string; value: number | string; suffix?: string }) {
  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#22c55e' }}>
        {value}
        {suffix && (
          <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 0.5 }}>
            {suffix}
          </Typography>
        )}
      </Typography>
    </Box>
  );
}

// Helper to count this week's remaining workouts
function getThisWeekWorkouts(workouts: any[]): number {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Sunday
  
  return workouts.filter(w => {
    const date = new Date(w.date);
    return date >= weekStart && date <= weekEnd && w.status !== 'completed' && w.intensity !== 'Rest';
  }).length;
}

function App() {
  return (
    <AppProvider>
      <AppWithTheme />
    </AppProvider>
  );
}

function AppWithTheme() {
  const { state } = useApp();
  const theme = createAppTheme(state.darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
