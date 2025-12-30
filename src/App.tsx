import { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Container, Typography, Link, alpha, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Tooltip, useTheme, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MapIcon from '@mui/icons-material/Map';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import LoginIcon from '@mui/icons-material/Login';
import LockIcon from '@mui/icons-material/Lock';
import { AppProvider, useApp } from './context/AppContext';
import { createAppTheme } from './lib/theme';
import Calendar from './components/Calendar';
import WorkoutModal from './components/WorkoutModal';
import FilterBar from './components/FilterBar';
import InitializePlan from './components/InitializePlan';
import CheckInForm from './components/CheckInForm';
import StatsDashboard from './components/StatsDashboard';
import { generateICalFile, downloadFile } from './lib/utils';
import type { WorkoutDay } from './types';

function AppContent() {
  const { state, dispatch, logout, login } = useApp();
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Show initialize plan if no workouts (but only for authenticated users)
  if (state.workouts.length === 0 && state.authenticated) {
    return <InitializePlan />;
  }

  // Show loading state while workouts are being loaded
  if (state.loading && state.workouts.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' }}>
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }
  
  // Calculate days until race
  const raceDate = new Date('2026-05-02');
  const today = new Date();
  const daysUntil = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate progress
  const completedWorkouts = state.workouts.filter(w => w.status === 'completed' && w.intensity !== 'Rest').length;
  const totalWorkouts = state.workouts.filter(w => w.intensity !== 'Rest').length;
  const progress = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

  const handleDarkModeToggle = () => {
    dispatch({ type: 'SET_SETTINGS', payload: { darkMode: !state.settings.darkMode } });
  };

  const handleExportICal = () => {
    setMenuAnchor(null);
    const ical = generateICalFile(state.workouts);
    downloadFile(ical, 'bosbeekse15-training.ics', 'text/calendar');
  };

  const handleExportJSON = () => {
    setMenuAnchor(null);
    const json = JSON.stringify(state.workouts, null, 2);
    downloadFile(json, 'bosbeekse15-backup.json', 'application/json');
  };

  const handleLogin = () => {
    if (login(passcode)) {
      setLoginDialogOpen(false);
      setPasscode('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLoginKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: alpha(theme.palette.background.default, 0.95),
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl">
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
              <DirectionsRunIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: theme.palette.primary.main }}>
                  Bosbeekse 15
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {daysUntil} days to go • {progress}% complete
                </Typography>
              </Box>
            </Box>
            
            {/* Right side: Route link + Settings */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Link
                href="https://www.komoot.com/tour/2731338257"
                target="_blank"
                rel="noopener"
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  '&:hover': { color: theme.palette.primary.main },
                }}
              >
                <MapIcon sx={{ fontSize: 16 }} />
                View Route
              </Link>

              {/* Login button when not authenticated */}
              {!state.authenticated && (
                <Tooltip title="Login to edit">
                  <IconButton onClick={() => setLoginDialogOpen(true)} size="small">
                    <LoginIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* Dark mode toggle */}
              <Tooltip title={state.settings.darkMode ? 'Light mode' : 'Dark mode'}>
                <IconButton onClick={handleDarkModeToggle} size="small">
                  {state.settings.darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              {/* Settings menu */}
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small">
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem onClick={handleExportJSON}>
                  <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Export backup (JSON)</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleExportICal}>
                  <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Export calendar (iCal)</ListItemText>
                </MenuItem>
                {state.authenticated && (
                  <>
                    <Divider />
                    <MenuItem onClick={logout}>
                      <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* View-only notice for non-authenticated users */}
        {!state.authenticated && state.workouts.length > 0 && (
          <Alert 
            severity="info" 
            icon={<LockIcon />}
            action={
              <Button color="inherit" size="small" onClick={() => setLoginDialogOpen(true)}>
                Login
              </Button>
            }
            sx={{ mb: 3 }}
          >
            You're viewing in read-only mode. Login to make changes.
          </Alert>
        )}

        {/* Two-column layout for desktop */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '340px 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          {/* Left Column: Stats, Check-in, Dashboard */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              position: { lg: 'sticky' },
              top: { lg: 80 },
            }}
          >
            {/* Stats Cards */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', lg: '1fr 1fr' },
                gap: 2,
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

            {/* Daily Check-In - Only for authenticated users */}
            {state.authenticated && <CheckInForm />}
            
            {/* Stats Dashboard */}
            <StatsDashboard />
          </Box>

          {/* Right Column: Filter + Calendar */}
          <Box>
            {/* Filter Bar */}
            <Box sx={{ mb: 3 }}>
              <FilterBar />
            </Box>
            
            {/* Calendar - All months */}
            <Calendar />
          </Box>
        </Box>
      </Container>

      {/* Workout Modal */}
      <WorkoutModal />

      {/* Login Dialog */}
      <Dialog 
        open={loginDialogOpen} 
        onClose={() => { setLoginDialogOpen(false); setLoginError(false); setPasscode(''); }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <LockIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6">Login to Edit</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Passcode"
            value={passcode}
            onChange={(e) => { setPasscode(e.target.value); setLoginError(false); }}
            onKeyDown={handleLoginKeyDown}
            error={loginError}
            helperText={loginError ? 'Incorrect passcode' : ''}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setLoginDialogOpen(false); setLoginError(false); setPasscode(''); }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleLogin}>
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Simple stat card
function StatCard({ label, value, suffix = '' }: { label: string; value: number | string; suffix?: string }) {
  const theme = useTheme();
  
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
      <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
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
function getThisWeekWorkouts(workouts: WorkoutDay[]): number {
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
  const theme = createAppTheme(state.settings.darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
