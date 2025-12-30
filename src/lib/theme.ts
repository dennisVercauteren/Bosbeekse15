import { createTheme, alpha } from '@mui/material/styles';

// Colors from the Bosbeekse 15 poster
const colors = {
  // Light theme (default)
  light: {
    bg: '#F5F0E8',           // Cream/beige background
    surface: '#FFFFFF',
    surfaceHover: '#FAF8F5',
    border: '#E8E0D8',
    text: '#1a1a1a',
    textMuted: '#666666',
    accent: '#C41E3A',       // Poster magenta/crimson
    accentMuted: 'rgba(196, 30, 58, 0.15)',
  },
  // Dark theme
  dark: {
    bg: '#111111',
    surface: '#1a1a1a',
    surfaceHover: '#222222',
    border: '#2a2a2a',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C41E3A',       // Same accent
    accentMuted: 'rgba(196, 30, 58, 0.15)',
  },
};

// Status colors
export const statusColors = {
  completed: '#22c55e',
  skipped: '#666666',
  rescheduled: '#888888',
  planned: '#444444',
};

// Activity type colors
export const activityColors = {
  run: '#C41E3A',
  walk: '#22c55e',
  cycle: '#3b82f6',
  swim: '#06b6d4',
  padel: '#f97316',
  squash: '#a855f7',
  strength: '#eab308',
  rest: 'transparent',
};

// For backwards compatibility
export const intensityColors = {
  easy: '#C41E3A',
  steady: '#C41E3A',
  tempo: '#C41E3A',
  interval: '#C41E3A',
  strength: '#eab308',
  rest: 'transparent',
};

export const createAppTheme = (darkMode: boolean) => {
  const palette = darkMode ? colors.dark : colors.light;
  
  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: palette.accent,
        light: alpha(palette.accent, 0.7),
        dark: palette.accent,
        contrastText: '#fff',
      },
      secondary: {
        main: palette.textMuted,
      },
      background: {
        default: palette.bg,
        paper: palette.surface,
      },
      text: {
        primary: palette.text,
        secondary: palette.textMuted,
      },
      success: {
        main: '#22c55e',
      },
      warning: {
        main: '#f97316',
      },
      error: {
        main: '#ef4444',
      },
      info: {
        main: '#3b82f6',
      },
      divider: palette.border,
    },
    typography: {
      fontFamily: '"Outfit", system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
      button: { fontWeight: 600, textTransform: 'none' },
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
            backgroundColor: palette.surface,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: `1px solid ${palette.border}`,
            backgroundColor: palette.surface,
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
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
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
};

export { colors as themeColors };
