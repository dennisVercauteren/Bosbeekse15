# 🏃 Bosbeekse 15 - Training Plan Calendar

A beautiful, responsive web app for tracking your 17-week running plan leading up to the Bosbeekse 15 race on May 2, 2026.

![Bosbeekse 15](https://img.shields.io/badge/Goal-15km-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)

## ✨ Features

### Core Features
- 📅 **Interactive Calendar** - Month/week view with drag-and-drop workout rescheduling
- 💪 **Workout Details** - Full workout descriptions, intensity levels, and duration/distance
- ✅ **Status Tracking** - Mark workouts as Completed, Skipped, or Rescheduled
- 📝 **Notes** - Add personal reflections and observations to each workout
- ↩️ **Undo** - One-click undo for move and status changes
- 🔍 **Filtering** - Filter by status, intensity, or workout type

### Improvements
- 📊 **Stats Dashboard** - Completion rate, streaks, weekly progress charts
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📋 **Daily Check-Ins** - Track weight, sleep, steps, energy, and pain levels
- 💾 **Export** - Download your data as JSON backup or iCal calendar
- 🔐 **Passcode Protection** - Simple authentication for single-user access
- 📱 **Fully Responsive** - Works great on mobile and desktop

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A [Supabase](https://supabase.com) account (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dennisVercauteren/Bosbeekse15.git
   cd Bosbeekse15
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase** (see [Database Setup](#database-setup) below)

4. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_PASSCODE=your-secret-passcode  # Optional
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open** http://localhost:5173

## 🗄️ Database Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and give it a name (e.g., `bosbeekse15`)
3. Choose a secure database password and save it
4. Select the region closest to you
5. Wait for the project to be created (~2 minutes)

### Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/schema.sql` and paste it
4. Click "Run" to execute the schema

### Get API Credentials

1. Go to **Settings** → **API**
2. Copy the **Project URL** → use as `VITE_SUPABASE_URL`
3. Copy the **anon/public** key → use as `VITE_SUPABASE_ANON_KEY`

## 🌐 Deployment (Netlify)

### Deploy to Netlify Free

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/dennisVercauteren/Bosbeekse15.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Build settings (should auto-detect from `netlify.toml`):
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_APP_PASSCODE` (optional)

4. **Trigger Deploy**
   - Go to Deploys → Trigger deploy → Deploy site

### Custom Domain (Bosbeekse15.kubuz.net)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter `Bosbeekse15.kubuz.net`
4. Follow the DNS configuration instructions:
   - Add a CNAME record pointing to your Netlify subdomain
   - Or configure Netlify DNS

5. Wait for SSL certificate (automatic, ~5 minutes)

## 📁 Project Structure

```
bosbeekse15/
├── public/
│   └── vite.svg           # App icon
├── src/
│   ├── components/        # React components
│   │   ├── Calendar.tsx       # FullCalendar integration
│   │   ├── WorkoutModal.tsx   # Day detail modal
│   │   ├── StatsPanel.tsx     # Statistics dashboard
│   │   ├── FilterBar.tsx      # Workout filters
│   │   ├── Header.tsx         # App header
│   │   ├── CheckInForm.tsx    # Daily check-in
│   │   ├── LoginScreen.tsx    # Passcode entry
│   │   └── InitializePlan.tsx # First-time setup
│   ├── context/
│   │   └── AppContext.tsx     # Global state management
│   ├── lib/
│   │   ├── supabase.ts        # Database client & services
│   │   ├── theme.ts           # MUI theme configuration
│   │   └── utils.ts           # Helper functions
│   ├── plan/
│   │   └── template.ts        # 17-week workout plan data
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── supabase/
│   └── schema.sql             # Database schema
├── .env.example               # Environment template
├── netlify.toml               # Netlify config
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Customization

### Modify the Training Plan

Edit `src/plan/template.ts` to customize workouts. Each workout has:
- `date` - ISO date string
- `title` - Short name (e.g., "Run A (Easy)")
- `details` - Full workout description
- `phase` - Training phase (1-5)
- `week` - Week number (1-17)
- `intensity` - E (Easy), S (Steady), T (Tempo), I (Intervals), Rest, Strength
- `tags` - Categories for filtering
- `planned_duration_min` - Duration in minutes
- `planned_distance_km` - Distance in km

### Theme Colors

Edit `src/lib/theme.ts` to change the color palette. The app uses a forest green theme by default.

## 🔒 Security Notes

- The `VITE_APP_PASSCODE` is a simple single-user protection layer
- For production, consider using Supabase Auth with magic links
- Never commit `.env` files with real credentials
- Database RLS policies allow public access by default (suitable for single-user with passcode)

## 📱 Demo Mode

The app works without Supabase! If no database credentials are provided, it runs in "demo mode" using localStorage. This is great for testing but data won't persist across devices.

## 🤝 Contributing

This is a personal training app, but feel free to fork it for your own training plans!

## 📄 License

MIT License - feel free to use and modify for your own projects.

---

**Good luck with your training, Dennis! 🏃‍♂️💪**

*Goal: Run 15 km comfortably on May 2, 2026*

