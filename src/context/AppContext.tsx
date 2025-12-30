import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import type { WorkoutDay, CheckIn, FilterOptions, UndoAction, AppSettings } from '../types';
import { workoutService, checkInService, isSupabaseConfigured } from '../lib/supabase';
import { planTemplate } from '../plan/template';
import { getStoredValue, setStoredValue, STORAGE_KEYS } from '../lib/utils';

// State type
interface AppState {
  workouts: WorkoutDay[];
  checkIns: CheckIn[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  authenticated: boolean; // True if logged in and can edit
  filters: FilterOptions;
  settings: AppSettings;
  undoStack: UndoAction[];
  selectedDate: string | null;
  modalOpen: boolean;
}

// Check if user can edit (requires authentication)
export const canEdit = (authenticated: boolean): boolean => authenticated;

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WORKOUTS'; payload: WorkoutDay[] }
  | { type: 'ADD_WORKOUT'; payload: WorkoutDay }
  | { type: 'UPDATE_WORKOUT'; payload: WorkoutDay }
  | { type: 'SET_CHECKINS'; payload: CheckIn[] }
  | { type: 'UPDATE_CHECKIN'; payload: CheckIn }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_FILTERS'; payload: Partial<FilterOptions> }
  | { type: 'SET_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'PUSH_UNDO'; payload: UndoAction }
  | { type: 'POP_UNDO' }
  | { type: 'CLEAR_UNDO' }
  | { type: 'SET_SELECTED_DATE'; payload: string | null }
  | { type: 'SET_MODAL_OPEN'; payload: boolean };

// Initial state - app is viewable by everyone, editing requires authentication
const initialState: AppState = {
  workouts: [],
  checkIns: [],
  loading: true,
  error: null,
  initialized: false,
  authenticated: false, // Editing requires authentication
  filters: {
    status: 'all',
    intensity: 'all',
    tag: 'all',
  },
  settings: {
    darkMode: getStoredValue(STORAGE_KEYS.DARK_MODE, true),
    showCompletedBadges: true,
    defaultView: 'month',
  },
  undoStack: [],
  selectedDate: null,
  modalOpen: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_WORKOUTS':
      return { ...state, workouts: action.payload };
    case 'ADD_WORKOUT':
      return { ...state, workouts: [...state.workouts, action.payload] };
    case 'UPDATE_WORKOUT':
      return {
        ...state,
        workouts: state.workouts.map(w => 
          w.id === action.payload.id ? action.payload : w
        ),
      };
    case 'SET_CHECKINS':
      return { ...state, checkIns: action.payload };
    case 'UPDATE_CHECKIN':
      const existingIndex = state.checkIns.findIndex(c => c.date === action.payload.date);
      if (existingIndex >= 0) {
        const newCheckIns = [...state.checkIns];
        newCheckIns[existingIndex] = action.payload;
        return { ...state, checkIns: newCheckIns };
      }
      return { ...state, checkIns: [...state.checkIns, action.payload] };
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, authenticated: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_SETTINGS':
      const newSettings = { ...state.settings, ...action.payload };
      if ('darkMode' in action.payload) {
        setStoredValue(STORAGE_KEYS.DARK_MODE, newSettings.darkMode);
      }
      return { ...state, settings: newSettings };
    case 'PUSH_UNDO':
      return { ...state, undoStack: [action.payload, ...state.undoStack.slice(0, 9)] };
    case 'POP_UNDO':
      return { ...state, undoStack: state.undoStack.slice(1) };
    case 'CLEAR_UNDO':
      return { ...state, undoStack: [] };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_MODAL_OPEN':
      return { ...state, modalOpen: action.payload };
    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Workout actions
  loadWorkouts: () => Promise<void>;
  initializePlan: () => Promise<void>;
  createWorkout: (workout: Omit<WorkoutDay, 'id' | 'created_at' | 'updated_at'>) => Promise<WorkoutDay>;
  updateWorkout: (id: string, updates: Partial<WorkoutDay>) => Promise<void>;
  moveWorkout: (workoutId: string, newDate: string) => Promise<void>;
  markWorkoutStatus: (id: string, status: WorkoutDay['status']) => Promise<void>;
  undo: () => Promise<void>;
  // Check-in actions
  loadCheckIns: () => Promise<void>;
  saveCheckIn: (checkIn: CheckIn) => Promise<void>;
  // Auth
  login: (passcode: string) => boolean;
  logout: () => void;
  // Modal
  openDayModal: (date: string) => void;
  closeDayModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Demo mode data - use localStorage when Supabase isn't configured
const DEMO_STORAGE_KEY = 'bosbeekse15_demo_workouts';
const DEMO_CHECKINS_KEY = 'bosbeekse15_demo_checkins';

const getDemoWorkouts = (): WorkoutDay[] => {
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveDemoWorkouts = (workouts: WorkoutDay[]): void => {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(workouts));
};

const getDemoCheckIns = (): CheckIn[] => {
  const stored = localStorage.getItem(DEMO_CHECKINS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveDemoCheckIns = (checkIns: CheckIn[]): void => {
  localStorage.setItem(DEMO_CHECKINS_KEY, JSON.stringify(checkIns));
};

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const isDemo = !isSupabaseConfigured();

  // Load workouts
  const loadWorkouts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      let workouts: WorkoutDay[];
      
      if (isDemo) {
        workouts = getDemoWorkouts();
      } else {
        workouts = await workoutService.getAll();
      }
      
      dispatch({ type: 'SET_WORKOUTS', payload: workouts });
      dispatch({ type: 'SET_INITIALIZED', payload: workouts.length > 0 });
    } catch (error) {
      console.error('Failed to load workouts:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load workouts' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isDemo]);

  // Initialize plan from template
  const initializePlan = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      let workouts: WorkoutDay[];
      
      if (isDemo) {
        // Generate IDs for demo mode
        workouts = planTemplate.map((w, i) => ({
          ...w,
          id: `demo-${i}-${Date.now()}`,
          status: w.status || 'planned',
          completed_at: null,
          moved_from_date: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) as WorkoutDay[];
        saveDemoWorkouts(workouts);
      } else {
        workouts = await workoutService.createMany(planTemplate);
      }
      
      dispatch({ type: 'SET_WORKOUTS', payload: workouts });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    } catch (error) {
      console.error('Failed to initialize plan:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize plan' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isDemo]);

  // Create a new workout (for custom activities)
  const createWorkout = useCallback(async (workoutData: Omit<WorkoutDay, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutDay> => {
    try {
      const now = new Date().toISOString();
      let newWorkout: WorkoutDay;
      
      if (isDemo) {
        // Generate a unique ID for demo mode
        newWorkout = {
          ...workoutData,
          id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: now,
          updated_at: now,
        } as WorkoutDay;
        
        // Get existing workouts and add the new one
        const workouts = getDemoWorkouts();
        workouts.push(newWorkout);
        saveDemoWorkouts(workouts);
      } else {
        // For Supabase, let the database generate the UUID
        newWorkout = await workoutService.create(workoutData);
      }
      
      dispatch({ type: 'ADD_WORKOUT', payload: newWorkout });
      return newWorkout;
    } catch (error) {
      console.error('Failed to create workout:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create workout' });
      throw error;
    }
  }, [isDemo]);

  // Update workout
  const updateWorkout = useCallback(async (id: string, updates: Partial<WorkoutDay>) => {
    try {
      let updated: WorkoutDay;
      
      if (isDemo) {
        const workouts = getDemoWorkouts();
        const index = workouts.findIndex(w => w.id === id);
        if (index >= 0) {
          updated = { ...workouts[index], ...updates, updated_at: new Date().toISOString() };
          workouts[index] = updated;
          saveDemoWorkouts(workouts);
        } else {
          throw new Error('Workout not found');
        }
      } else {
        updated = await workoutService.update(id, updates);
      }
      
      dispatch({ type: 'UPDATE_WORKOUT', payload: updated });
    } catch (error) {
      console.error('Failed to update workout:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update workout' });
      throw error;
    }
  }, [isDemo]);

  // Move workout to new date
  const moveWorkout = useCallback(async (workoutId: string, newDate: string) => {
    const workout = state.workouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    // Save undo action
    dispatch({
      type: 'PUSH_UNDO',
      payload: {
        type: 'move',
        workoutId,
        previousState: { date: workout.date, status: workout.status, moved_from_date: workout.moved_from_date },
        timestamp: Date.now(),
      },
    });
    
    try {
      let updated: WorkoutDay;
      
      if (isDemo) {
        const workouts = getDemoWorkouts();
        // Check if target date has a non-rest workout (rest days can be overwritten)
        const existing = workouts.find(w => w.date === newDate && w.intensity !== 'Rest');
        if (existing) {
          throw new Error(`There's already a workout scheduled for ${newDate}`);
        }
        // Remove any rest day on the target date
        const filteredWorkouts = workouts.filter(w => !(w.date === newDate && w.intensity === 'Rest'));
        
        const index = filteredWorkouts.findIndex(w => w.id === workoutId);
        if (index >= 0) {
          updated = {
            ...filteredWorkouts[index],
            date: newDate,
            moved_from_date: workout.date,
            status: 'rescheduled',
            updated_at: new Date().toISOString(),
          };
          filteredWorkouts[index] = updated;
          saveDemoWorkouts(filteredWorkouts);
        } else {
          throw new Error('Workout not found');
        }
      } else {
        updated = await workoutService.moveWorkout(workoutId, newDate, workout.date);
      }
      
      dispatch({ type: 'UPDATE_WORKOUT', payload: updated });
    } catch (error) {
      // Remove the undo action if move failed
      dispatch({ type: 'POP_UNDO' });
      console.error('Failed to move workout:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to move workout' });
      throw error;
    }
  }, [state.workouts, isDemo]);

  // Mark workout status
  const markWorkoutStatus = useCallback(async (id: string, status: WorkoutDay['status']) => {
    const workout = state.workouts.find(w => w.id === id);
    if (!workout) return;
    
    // Save undo action
    dispatch({
      type: 'PUSH_UNDO',
      payload: {
        type: 'status_change',
        workoutId: id,
        previousState: { status: workout.status, completed_at: workout.completed_at },
        timestamp: Date.now(),
      },
    });
    
    try {
      let updated: WorkoutDay;
      
      if (isDemo) {
        const workouts = getDemoWorkouts();
        const index = workouts.findIndex(w => w.id === id);
        if (index >= 0) {
          updated = {
            ...workouts[index],
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          };
          workouts[index] = updated;
          saveDemoWorkouts(workouts);
        } else {
          throw new Error('Workout not found');
        }
      } else {
        updated = await workoutService.markStatus(id, status);
      }
      
      dispatch({ type: 'UPDATE_WORKOUT', payload: updated });
    } catch (error) {
      dispatch({ type: 'POP_UNDO' });
      console.error('Failed to update status:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update status' });
      throw error;
    }
  }, [state.workouts, isDemo]);

  // Undo last action
  const undo = useCallback(async () => {
    const lastAction = state.undoStack[0];
    if (!lastAction) return;
    
    try {
      if (isDemo) {
        const workouts = getDemoWorkouts();
        const index = workouts.findIndex(w => w.id === lastAction.workoutId);
        if (index >= 0) {
          workouts[index] = { ...workouts[index], ...lastAction.previousState, updated_at: new Date().toISOString() };
          saveDemoWorkouts(workouts);
          dispatch({ type: 'UPDATE_WORKOUT', payload: workouts[index] });
        }
      } else {
        const updated = await workoutService.update(lastAction.workoutId, lastAction.previousState);
        dispatch({ type: 'UPDATE_WORKOUT', payload: updated });
      }
      
      dispatch({ type: 'POP_UNDO' });
    } catch (error) {
      console.error('Failed to undo:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to undo' });
    }
  }, [state.undoStack, isDemo]);

  // Load check-ins
  const loadCheckIns = useCallback(async () => {
    try {
      let checkIns: CheckIn[];
      
      if (isDemo) {
        checkIns = getDemoCheckIns();
      } else {
        checkIns = await checkInService.getAll();
      }
      
      dispatch({ type: 'SET_CHECKINS', payload: checkIns });
    } catch (error) {
      console.error('Failed to load check-ins:', error);
    }
  }, [isDemo]);

  // Save check-in
  const saveCheckIn = useCallback(async (checkIn: CheckIn) => {
    try {
      let saved: CheckIn;
      
      if (isDemo) {
        const checkIns = getDemoCheckIns();
        const index = checkIns.findIndex(c => c.date === checkIn.date);
        saved = { ...checkIn, updated_at: new Date().toISOString() };
        if (index >= 0) {
          checkIns[index] = saved;
        } else {
          saved.id = `checkin-${Date.now()}`;
          saved.created_at = new Date().toISOString();
          checkIns.push(saved);
        }
        saveDemoCheckIns(checkIns);
      } else {
        saved = await checkInService.upsert(checkIn);
      }
      
      dispatch({ type: 'UPDATE_CHECKIN', payload: saved });
    } catch (error) {
      console.error('Failed to save check-in:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save check-in' });
      throw error;
    }
  }, [isDemo]);

  // Authentication
  const login = useCallback((passcode: string): boolean => {
    const expectedPasscode = import.meta.env.VITE_APP_PASSCODE;
    
    // If no passcode is set in env (or empty string), allow access (development mode)
    if (!expectedPasscode || expectedPasscode === '') {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      setStoredValue(STORAGE_KEYS.AUTH_TOKEN, 'authenticated');
      return true;
    }
    
    if (passcode === expectedPasscode) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      setStoredValue(STORAGE_KEYS.AUTH_TOKEN, 'authenticated');
      return true;
    }
    
    return false;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }, []);

  // Modal controls
  const openDayModal = useCallback((date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
    dispatch({ type: 'SET_MODAL_OPEN', payload: true });
  }, []);

  const closeDayModal = useCallback(() => {
    dispatch({ type: 'SET_MODAL_OPEN', payload: false });
    dispatch({ type: 'SET_SELECTED_DATE', payload: null });
  }, []);

  // Initial load
  useEffect(() => {
    // Check if already authenticated - same logic as initial state
    const storedAuth = getStoredValue(STORAGE_KEYS.AUTH_TOKEN, null);
    const envPasscode = import.meta.env.VITE_APP_PASSCODE;
    const hasPasscodeEnv = envPasscode && envPasscode.length > 0;
    
    if (!hasPasscodeEnv || storedAuth === 'authenticated') {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    }
    
    loadWorkouts();
    loadCheckIns();
  }, [loadWorkouts, loadCheckIns]);

  const value: AppContextType = {
    state,
    dispatch,
    loadWorkouts,
    initializePlan,
    createWorkout,
    updateWorkout,
    moveWorkout,
    markWorkoutStatus,
    undo,
    loadCheckIns,
    saveCheckIn,
    login,
    logout,
    openDayModal,
    closeDayModal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

