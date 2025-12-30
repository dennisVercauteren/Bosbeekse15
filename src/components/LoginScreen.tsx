import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import LockIcon from '@mui/icons-material/Lock';
import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const { login } = useApp();
  const theme = useTheme();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(passcode);
    if (!success) {
      setError(true);
      setPasscode('');
    }
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${theme.palette.background.default} 100%)`,
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 4,
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <DirectionsRunIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
        </Box>
        
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: theme.palette.primary.main }}>
          Bosbeekse 15
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Training Plan Calendar
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 4, display: 'block' }}>
          Zaterdag 2 Mei 2026 • 14:00 uur
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Invalid passcode. Please try again.
            </Alert>
          )}
          
          <TextField
            fullWidth
            type="password"
            label="Passcode"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              setError(false);
            }}
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ mb: 2 }}
            autoFocus
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ py: 1.5 }}
          >
            Enter
          </Button>
        </form>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
          Protected training plan for Dennis
        </Typography>
      </Paper>
    </Box>
  );
}
