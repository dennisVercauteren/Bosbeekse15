import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Slider,
  Button,
  Grid,
  alpha,
  useTheme,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import BoltIcon from '@mui/icons-material/Bolt';
import HealingIcon from '@mui/icons-material/Healing';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

export default function CheckInForm() {
  const { state, saveCheckIn } = useApp();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayCheckIn = state.checkIns.find(c => c.date === today);
  
  const [formData, setFormData] = useState({
    weight_kg: todayCheckIn?.weight_kg || null,
    sleep_hours: todayCheckIn?.sleep_hours || null,
    steps: todayCheckIn?.steps || null,
    energy_1_10: todayCheckIn?.energy_1_10 || 5,
    pain_0_10: todayCheckIn?.pain_0_10 || 0,
    pain_location: todayCheckIn?.pain_location || '',
    notes: todayCheckIn?.notes || '',
  });
  
  useEffect(() => {
    if (todayCheckIn) {
      setFormData({
        weight_kg: todayCheckIn.weight_kg,
        sleep_hours: todayCheckIn.sleep_hours,
        steps: todayCheckIn.steps,
        energy_1_10: todayCheckIn.energy_1_10 || 5,
        pain_0_10: todayCheckIn.pain_0_10 || 0,
        pain_location: todayCheckIn.pain_location || '',
        notes: todayCheckIn.notes || '',
      });
    }
  }, [todayCheckIn]);
  
  const handleSave = async () => {
    setSaving(true);
    try {
      // For new check-ins, generate a proper ID; for existing ones, use the existing ID
      const checkInData = {
        id: todayCheckIn?.id || `checkin-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        date: today,
        ...formData,
        created_at: todayCheckIn?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await saveCheckIn(checkInData);
    } catch (error) {
      console.error('Failed to save check-in:', error);
    } finally {
      setSaving(false);
    }
  };
  
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
        <Typography variant="subtitle1" fontWeight={600}>
          📊 Daily Check-In
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <MonitorWeightIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Weight (kg)
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={formData.weight_kg || ''}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value ? Number(e.target.value) : null })}
                inputProps={{ step: 0.1 }}
              />
            </Grid>
            
            <Grid item xs={6} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <BedtimeIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Sleep (hours)
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={formData.sleep_hours || ''}
                onChange={(e) => setFormData({ ...formData, sleep_hours: e.target.value ? Number(e.target.value) : null })}
                inputProps={{ step: 0.5, min: 0, max: 24 }}
              />
            </Grid>
            
            <Grid item xs={6} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <DirectionsWalkIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Steps
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={formData.steps || ''}
                onChange={(e) => setFormData({ ...formData, steps: e.target.value ? Number(e.target.value) : null })}
                inputProps={{ step: 100 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BoltIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Energy Level: {formData.energy_1_10}/10
                </Typography>
              </Box>
              <Slider
                value={formData.energy_1_10 || 5}
                onChange={(_, value) => setFormData({ ...formData, energy_1_10: value as number })}
                min={1}
                max={10}
                marks
                valueLabelDisplay="auto"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <HealingIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Pain Level: {formData.pain_0_10}/10
                </Typography>
              </Box>
              <Slider
                value={formData.pain_0_10 || 0}
                onChange={(_, value) => setFormData({ ...formData, pain_0_10: value as number })}
                min={0}
                max={10}
                marks
                valueLabelDisplay="auto"
                size="small"
                color="warning"
              />
            </Grid>
            
            {(formData.pain_0_10 || 0) > 0 && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Pain location"
                  value={formData.pain_location}
                  onChange={(e) => setFormData({ ...formData, pain_location: e.target.value })}
                  placeholder="e.g., left knee, right calf"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="How are you feeling today?"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                fullWidth
              >
                {saving ? 'Saving...' : 'Save Check-In'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}

