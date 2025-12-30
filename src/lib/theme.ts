import { createTheme } from '@mui/material/styles';

// Minimal 2-color palette: Dark + Green accent
const colors = {
  bg: '#111111',
  surface: '#1a1a1a',
  surfaceHover: '#222222',
  border: '#2a2a2a',
  text: '#ffffff',
  textMuted: '#888888',
  accent: '#22c55e',
  accentMuted: 'rgba(34, 197, 94, 0.15)',
};

// Status colors - minimal
export const statusColors = {
  completed: '#22c55e',
  skipped: '#666666',
  rescheduled: '#888888',
  planned: '#444444',
};

// All workouts use accent color, only differentiate by opacity for status
export const intensityColors = {
  easy: '#22c55e',
  steady: '#22c55e',
  tempo: '#22c55e',
  interval: '#22c55e',
  strength: '#22c55e',
  rest: 'transparent',
};

export const createAppTheme = (_darkMode: boolean) => createTheme({
  palette: {
    mode: 'dark', // Always dark for this minimal theme
    primary: {
      main: colors.accent,
      light: colors.accent,
      dark: colors.accent,
      contrastText: '#000',
    },
    secondary: {
      main: colors.textMuted,
    },
    background: {
      default: colors.bg,
      paper: colors.surface,
    },
    text: {
      primary: colors.text,
      secondary: colors.textMuted,
    },
    success: {
      main: colors.accent,
    },
    warning: {
      main: '#888888',
    },
    info: {
      main: '#888888',
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: '"Outfit", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { fontWeight: 500, textTransform: 'none' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: colors.surface,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 4,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
          },
        },
      },
    },
  },
});

export { colors as forestColors };
