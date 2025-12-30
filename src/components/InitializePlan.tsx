import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  alpha,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useApp } from '../context/AppContext';
import { PLAN_METADATA } from '../plan/template';

export default function InitializePlan() {
  const { initializePlan } = useApp();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  
  const handleInitialize = async () => {
    setLoading(true);
    try {
      await initializePlan();
    } catch (error) {
      console.error('Failed to initialize:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          borderRadius: 4,
          textAlign: 'center',
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <DirectionsRunIcon sx={{ fontSize: 50, color: 'white' }} />
        </Box>
        
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Welcome, Dennis! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your {PLAN_METADATA.totalWeeks}-week training plan for the {PLAN_METADATA.goalEvent} is ready to be loaded.
        </Typography>
        
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.default, 0.5),
            textAlign: 'left',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Plan Overview
          </Typography>
          <List dense disablePadding>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CalendarMonthIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={`${PLAN_METADATA.startDate} → ${PLAN_METADATA.endDate}`}
                secondary="17 weeks of structured training"
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <EmojiEventsIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={`Goal: ${PLAN_METADATA.goalDistance} km`}
                secondary="Run comfortably on race day"
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <FitnessCenterIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="3 runs + 2 strength sessions per week"
                secondary="Progressive build with deload weeks"
              />
            </ListItem>
          </List>
        </Paper>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Training Phases
          </Typography>
          {PLAN_METADATA.phases.map((phase) => (
            <Box
              key={phase.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.5,
                opacity: 0.9,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="body2">
                <strong>{phase.name}</strong> (Weeks {phase.weeks}): {phase.focus}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Button
          variant="contained"
          size="large"
          onClick={handleInitialize}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DirectionsRunIcon />}
          sx={{
            py: 1.5,
            px: 4,
            fontSize: '1rem',
            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          {loading ? 'Loading plan...' : 'Initialize Training Plan'}
        </Button>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          This will create all workout entries in your calendar.
          <br />
          You can modify them at any time.
        </Typography>
      </Paper>
    </Box>
  );
}

