# Developer Prompt: Debug, Fix & Optimize Bosbeekse 15 Training Calendar

You are a **senior full-stack developer** with deep expertise in **React, TypeScript, Material UI, Supabase, and fitness/workout applications**. Your mission is to **audit, debug, fix, and optimize** this codebase for maximum performance, simplicity, and maintainability.

---

## 📋 Project Overview

This is a **running training plan calendar** for the Bosbeekse 15 race (15km on May 2, 2026). 

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Material UI 5 + custom calendar components
- **Database:** Supabase (Postgres) with optional localStorage fallback
- **Charts:** Recharts
- **Date handling:** date-fns

**Key Features:**
- Interactive calendar with drag-and-drop workout rescheduling
- Workout status tracking (completed/skipped/rescheduled)
- Daily check-ins (weight, sleep, pain, etc.)
- Stats dashboard with completion metrics
- Dark mode toggle
- JSON/iCal export
- Simple passcode authentication

---

## 🎯 Your Objectives

### 1. CODE AUDIT & CLEANUP

**Identify and fix:**
- Dead code, unused imports, and unused variables
- Duplicate logic that can be consolidated
- Overly complex functions that can be simplified
- Inconsistent naming conventions
- Type safety issues (any types, missing types, loose types)
- Memory leaks (useEffect cleanup, event listeners, subscriptions)

**Files to audit (priority order):**
1. `src/context/AppContext.tsx` - Main state management (550 lines - likely too big)
2. `src/components/Calendar.tsx` - Custom calendar implementation
3. `src/components/WorkoutModal.tsx` - Day detail modal
4. `src/lib/supabase.ts` - Database service layer
5. `src/App.tsx` - Main app component

### 2. PERFORMANCE OPTIMIZATION

**Focus areas:**
- **Unnecessary re-renders:** Check memoization of callbacks and values
- **Large component trees:** Consider splitting `AppContext.tsx` into smaller contexts
- **Calendar rendering:** Currently renders 5 months statically - consider virtualization
- **Filter logic:** Runs on every render - should be memoized properly
- **Drag-and-drop state:** Updates on every drag event - throttle/debounce needed?

**Questions to answer:**
- Is React.memo used appropriately on expensive components?
- Are useCallback/useMemo used correctly (with proper dependencies)?
- Are there any infinite re-render loops?
- Is state normalized efficiently?

### 3. BUG HUNTING

**Known/suspected issues to investigate:**

1. **Demo mode sync issues:**
   - When in demo mode (localStorage), does undo work correctly?
   - Does data persist correctly across refreshes?
   - Race conditions when rapidly updating workouts?

2. **Drag-and-drop edge cases:**
   - What happens when dropping on a date that already has a workout?
   - Does the error message display properly?
   - Is the drag visual feedback working on mobile?

3. **Authentication flow:**
   - The `canEdit` function is exported but never used - dead code?
   - Is the auth state being checked properly before all mutations?
   - What happens if the passcode env var is undefined vs empty string?

4. **Calendar display:**
   - Is the "this week's workouts" count correct (Monday-Sunday)?
   - Does filtering affect all views consistently?
   - Time zone issues with date comparisons?

5. **State consistency:**
   - Does `SET_INITIALIZED` get set correctly in all cases?
   - When does `loading` become false - is it too early/late?
   - Is error state being cleared appropriately?

### 4. ARCHITECTURE IMPROVEMENTS

**Consider restructuring:**

1. **Split AppContext** into smaller, focused contexts:
   - `WorkoutContext` - workout CRUD operations
   - `CheckInContext` - daily check-in data
   - `UIContext` - modals, filters, settings
   - `AuthContext` - authentication state

2. **Extract custom hooks:**
   - `useWorkouts()` - load, filter, update workouts
   - `useDragDrop()` - drag-and-drop logic
   - `useUndo()` - undo stack management
   - `useLocalStorage()` - generic localStorage wrapper

3. **Service layer cleanup:**
   - Consolidate demo mode logic (currently scattered)
   - Create a unified data service that abstracts Supabase/localStorage

4. **Component optimization:**
   - Extract `StatCard` from `App.tsx` to its own file
   - Create a `CalendarGrid` component for reusability
   - Consider extracting workout card variants (completed, skipped, etc.)

### 5. UX/UI FIXES

**Issues to address:**

1. **Mobile experience:**
   - Drag-and-drop may not work well on touch devices
   - Calendar cells may be too small on mobile
   - Modal might not be scrollable properly

2. **Accessibility:**
   - Are dialogs keyboard-navigable?
   - Do buttons have proper focus states?
   - Are ARIA labels present on interactive elements?

3. **Loading/Error states:**
   - Is there clear feedback during loading?
   - Are errors dismissible?
   - Do optimistic updates feel responsive?

4. **Visual polish:**
   - Is the color scheme consistent across themes?
   - Are hover states clearly visible?
   - Is the calendar readable with many workouts filtered?

---

## 🔧 Specific Code Smells to Address

### In `AppContext.tsx`:

```typescript
// 1. This function is defined but never used - remove or use it
export const canEdit = (authenticated: boolean): boolean => authenticated;

// 2. Magic strings should be constants
case 'SET_LOADING':  // Use enum or const

// 3. Long switch statement - consider reducer helpers
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // 19 cases...
  }
}

// 4. useCallback dependencies might be wrong
const moveWorkout = useCallback(async (...) => {
  const workout = state.workouts.find(w => w.id === workoutId);
  // Uses state.workouts but depends on [state.workouts, isDemo]
  // Is this causing stale closures?
}, [state.workouts, isDemo]);
```

### In `Calendar.tsx`:

```typescript
// 1. Hardcoded months - what if user needs different range?
let current = new Date(2026, 0, 1); // January 2026
const end = new Date(2026, 4, 1);   // May 2026

// 2. Tag filter uses string type but should use WorkoutTag
const tagFilter = state.filters.tag; // Type is string, not WorkoutTag

// 3. useMemo inside sub-component - move to parent or extract
const workoutsByDate = useMemo(() => {
  const map = new Map<string, WorkoutDay>();
  workouts.forEach(w => map.set(w.date, w));
  return map;
}, [workouts]);
```

### In `supabase.ts`:

```typescript
// 1. Placeholder credentials create a client that will fail silently
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// 2. deleteAll uses weird hack - document or simplify
.neq('id', '00000000-0000-0000-0000-000000000000')

// 3. No error handling on the export/import functions
export const importData = async (jsonString: string) => {
  const data = JSON.parse(jsonString); // This can throw!
```

---

## ✅ Definition of Done

After your work, the codebase should:

1. **Pass all linting rules** with zero warnings
2. **Have no TypeScript errors** in strict mode
3. **Load the calendar** in under 500ms on average hardware
4. **Handle all edge cases** gracefully with user-friendly errors
5. **Work offline** in demo mode with full functionality
6. **Be mobile-responsive** with touch-friendly interactions
7. **Have clear separation** between UI, state, and data layers
8. **Include comments** on any complex or non-obvious logic
9. **Remove all dead code** and unused dependencies

---

## 📁 File Structure Reference

```
src/
├── App.tsx                 # Main component - consider splitting
├── main.tsx               # Entry point
├── index.css              # Global styles
├── components/
│   ├── Calendar.tsx       # Custom calendar (436 lines - complex)
│   ├── CheckInForm.tsx    # Daily check-in form
│   ├── FilterBar.tsx      # Filter controls
│   ├── Header.tsx         # App header (if exists)
│   ├── InitializePlan.tsx # First-time setup
│   ├── LoginScreen.tsx    # Passcode entry
│   ├── StatsDashboard.tsx # Charts and stats
│   ├── StatsPanel.tsx     # Stats panel
│   └── WorkoutModal.tsx   # Workout detail modal
├── context/
│   └── AppContext.tsx     # Global state (550 lines - too big!)
├── lib/
│   ├── supabase.ts        # Database client & services
│   ├── theme.ts           # MUI theme config
│   └── utils.ts           # Helper functions
├── plan/
│   └── template.ts        # 17-week workout plan data
└── types/
    └── index.ts           # TypeScript interfaces
```

---

## 🚀 Getting Started

1. **Run the app:** `npm run dev`
2. **Run type check:** `npx tsc --noEmit`
3. **Run linter:** `npm run lint`
4. **Test the app** at http://localhost:5173

**Demo mode:** If no Supabase credentials are set, the app uses localStorage.

**Authenticated mode:** Set `VITE_APP_PASSCODE=yourpasscode` in `.env` to require login.

---

## 💡 Final Notes

- **Don't over-engineer** - fix what's broken, simplify what's complex
- **Preserve existing functionality** - this is a refactor, not a rewrite
- **Test on mobile** - the primary user will use this on their phone
- **Document your changes** - explain what you fixed and why
- **Keep the UI style** - the Material UI + forest green theme should remain

Good luck! The goal is a **fast, simple, reliable** training calendar app. 🏃‍♂️

