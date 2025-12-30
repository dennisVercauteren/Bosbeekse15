### AI Builder Prompt — “Bosbeekse 15” Training Calendar Web App (GitHub + Netlify + Free DB)

You are an **experienced senior full-stack engineer** and will build a **production-ready** web app for a single user (Dennis) to manage a running plan.  
You will deliver a complete GitHub repo + Netlify deployment steps so it runs **for free** on the custom subdomain **`Bosbeekse15.kubu.net`**.

The running plan source is in the repository file **`Loopschema.md`** (English plan). Use it as the baseline schedule template.

---

## 1) Product requirements (must-haves)

### Core UX
- **Calendar-first UI** showing the upcoming months (month grid view by default).
- **Every day is clickable**:
  - Click a day → open a **modal** with that day’s planned workout (or “Rest / No workout”).
  - Modal shows: title, details, intensity, duration/distance, notes, and status.
- **Modify the schedule**:
  - Move a workout from one date to another (drag & drop OR “Move to…” action).
  - “Move to next day” (one-tap) is required.
  - Ensure moving preserves history (store moved-from date).
- **Completion tracking**:
  - Mark workout **Completed** / **Skipped** / **Rescheduled**.
  - Allow manual completion without GPS import.
- **Material style UI**:
  - Clean “basic Material” look using Material UI.
  - Responsive (mobile + desktop).

### Data persistence (database required)
- Must persist:
  - workouts per date
  - status (planned/completed/skipped/rescheduled)
  - notes
  - edits (user modifications)
  - completion timestamps
- Must be **free tier** and compatible with Netlify hosting.

### Hosting (free)
- Code hosted on **GitHub**.
- Frontend hosted on **Netlify Free**.
- Database hosted on a **free tier** provider (choose the best option; see “Tech decisions”).
- App should run at **`Bosbeekse15.kubu.net`** via Netlify custom domain configuration.

---

## 2) Recommended tech decisions (choose and implement)

### Frontend
- **Vite + React + TypeScript**
- **Material UI (MUI)** for components and styling
- Calendar component:
  - Prefer **FullCalendar** (React) for month view + drag/drop support, OR
  - A MUI-based calendar if drag/drop is still solid and accessible.

### Database (free tier)
Choose ONE and implement cleanly:
- **Supabase (recommended)**: Postgres + REST + Row Level Security
  - Use a single-user approach:
    - Either Supabase Auth (email magic link), OR
    - A “shared secret passcode” gate in the app + RLS policy keyed on a single user (still keep DB safe).
- Alternative: **Firebase** (Firestore) if it’s clearly simpler for single-user and free tier.

### API layer
- Prefer direct client SDK (Supabase/Firebase) from frontend (simplest).
- If you need server-side logic, use **Netlify Functions**.

---

## 3) Data model (design + implement)

### Entities
Implement a minimal, future-proof schema. Example (Supabase/Postgres):
- `workout_days`
  - `id` (uuid, pk)
  - `date` (date, unique)
  - `title` (text) — e.g., “Run A (Easy)”
  - `details` (text) — full session description
  - `phase` (text) — e.g., “Phase 2”
  - `week` (int)
  - `tags` (text[]) — e.g., {easy, longrun, tempo}
  - `planned_distance_km` (numeric, nullable)
  - `planned_duration_min` (int, nullable)
  - `intensity` (text) — E/S/T/I/Rest
  - `status` (text) — planned/completed/skipped/rescheduled
  - `completed_at` (timestamptz, nullable)
  - `moved_from_date` (date, nullable)
  - `notes` (text, nullable)
  - `created_at`, `updated_at`

Optional but valuable:
- `checkins`
  - `date`
  - `weight_kg` (numeric)
  - `sleep_hours` (numeric)
  - `steps` (int)
  - `energy_1_10` (int)
  - `pain_0_10` (int) + `pain_location` (text)
  - `notes`

### Seed strategy (critical)
- On first load (empty DB), the app must offer a **“Initialize plan from template”** action that:
  - Creates `workout_days` for the plan range **Jan 2, 2026 → May 2, 2026**
  - Uses the baseline from `Loopschema.md`
  - After initialization, user edits override the template.

Do NOT hardcode the plan only in the UI; it must land in the DB.

---

## 4) Features (required + improvements)

### Required features (ship these)
- **Month calendar** with:
  - color-coded workouts by intensity/status
  - icons/badges for Completed/Skipped
  - hover/preview (desktop) if easy
- **Day modal**:
  - workout display
  - edit fields (title, details, duration/distance, intensity, notes)
  - status controls (planned/completed/skipped)
  - move actions (move to next day, pick a date)
- **Drag & drop rescheduling** (or a robust alternative):
  - On move, update both dates appropriately, keep `moved_from_date`
  - Prevent accidental data loss (confirm if overwriting another workout)
- **Undo** for last move (at least one-step undo) OR a “history” log
- **Fast filtering**:
  - show only runs / only strength / only completed, etc.
- **Simple authentication / protection** suitable for single user:
  - If using Supabase Auth: only Dennis logs in
  - If using passcode: store passcode as Netlify env var; never commit it

### Add improvements that make it meaningfully better (implement at least 5)
Pick from (and implement well):
- **Stats dashboard**:
  - weekly completed runs
  - completion rate
  - longest streak
  - total distance/time (planned vs completed)
- **Weekly view** toggle in calendar
- **Notes & reflections** per workout + global journal
- **Check-in tracking** (weight, sleep, pain) with simple charts
- **Export/backup**:
  - export all data as JSON
  - import JSON backup
- **iCal export** for planned workouts
- **PWA offline support** (read-only offline; queue edits if feasible)
- **Dark mode toggle**
- **Reminder support** (email is optional; local notifications if PWA)

---

## 5) Non-functional requirements
- **TypeScript strict**.
- Clean project structure (`src/` with `components/`, `pages/`, `lib/`, `types/`).
- Accessibility:
  - keyboard reachable modal
  - clear focus states
  - proper ARIA for dialogs
- Error handling:
  - show friendly errors on DB failures
  - loading states and optimistic updates where safe
- Performance:
  - keep calendar snappy
  - avoid unnecessary rerenders

---

## 6) Implementation details you must include

### Repository deliverables
- A complete GitHub repo containing:
  - working frontend
  - DB schema/migrations (Supabase SQL) or Firebase rules/structure
  - clear README for local dev + deployment
  - `.env.example` with required keys
  - Netlify configuration (`netlify.toml`) if needed

### Local development
- `npm install`
- `npm run dev`
- Instructions to create the free DB project (Supabase/Firebase), then set env vars.

### Deployment (Netlify free)
Include step-by-step:
- connect GitHub repo to Netlify
- build command + publish directory
- required env vars in Netlify
- how to set custom domain **`Bosbeekse15.kubu.net`**
- HTTPS enforced
- any SPA routing config (redirects) so refresh works

---

## 7) Acceptance criteria (definition of done)
- App deploys successfully on Netlify free and loads at `Bosbeekse15.kubu.net`.
- Calendar shows the full plan range with workouts per day.
- Clicking any day opens a modal with correct data.
- User can:
  - edit a workout
  - move it to next day
  - move it to an arbitrary date
  - mark it completed/skipped
  - see changes persist after refresh (DB-backed)
- UI is Material-like, clean, responsive, and accessible.
- README is complete enough that a new developer can deploy in <30 minutes.

---

## 8) Use the existing plan text (Loopschema.md)
You must extract/encode the plan content from `Loopschema.md` into a structured template used for initialization.
Implementation suggestion:
- Create `src/plan/template.ts` that exports an array of day objects keyed by ISO date.
- Or write a simple parser script that converts the markdown to JSON (only if it’s reliable).

Important: keep the human-readable description in the workout details so the modal shows the full instruction text.

---

## 9) Build order (execute in this order)
1. Scaffold Vite + React + TS + MUI
2. Implement calendar UI + modal with mock data
3. Choose DB (Supabase recommended) and implement schema + RLS/auth strategy
4. Implement CRUD + initialization from template
5. Implement move/drag-drop + status controls + undo/history
6. Add at least 5 improvements (stats, export, check-ins, etc.)
7. Final polish: accessibility, responsive, error states
8. Write README + deployment instructions (GitHub + Netlify + custom domain)

---

## 10) Constraints / warnings
- Must remain **free** (Netlify free + DB free tier).
- Do not require paid services or private servers.
- Do not store secrets in GitHub.
- Ensure the DB is protected appropriately even for single-user.


