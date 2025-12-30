import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useApp } from '../context/AppContext';
import { exportData } from '../lib/supabase';
import { generateICalFile, downloadFile } from '../lib/utils';

interface HeaderProps {
  showStats: boolean;
  onToggleStats: () => void;
}

export default function Header({ showStats, onToggleStats }: HeaderProps) {
  const { state, dispatch, logout } = useApp();
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  const handleDarkModeToggle = () => {
    dispatch({ type: 'SET_SETTINGS', payload: { darkMode: !state.settings.darkMode } });
  };
  
  const handleExportJSON = async () => {
    setMenuAnchor(null);
    try {
      const json = await exportData();
      downloadFile(json, 'bosbeekse15-backup.json', 'application/json');
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };
  
  const handleExportICal = () => {
    setMenuAnchor(null);
    const ical = generateICalFile(state.workouts);
    downloadFile(ical, 'bosbeekse15-training.ics', 'text/calendar');
  };
  
  const handleImport = () => {
    setMenuAnchor(null);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          // Import logic would go here
          console.log('Import:', text);
          alert('Import functionality coming soon!');
        } catch (error) {
          console.error('Failed to import:', error);
        }
      }
    };
    input.click();
  };
  
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DirectionsRunIcon sx={{ color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Bosbeekse 15
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Training Plan
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Stats toggle */}
          <Tooltip title={showStats ? 'Hide stats' : 'Show stats'}>
            <IconButton
              onClick={onToggleStats}
              sx={{
                backgroundColor: showStats ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              }}
            >
              <BarChartIcon />
            </IconButton>
          </Tooltip>
          
          {/* Dark mode toggle */}
          <Tooltip title={state.settings.darkMode ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={handleDarkModeToggle}>
              {state.settings.darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          {/* More menu */}
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleExportJSON}>
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export backup (JSON)</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleExportICal}>
              <ListItemIcon>
                <CalendarMonthIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export to calendar (iCal)</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleImport}>
              <ListItemIcon>
                <UploadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Import backup</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

