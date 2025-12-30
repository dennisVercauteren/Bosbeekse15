import type { WorkoutDayInput, Intensity, WorkoutTag } from '../types';
import { addDays, format } from 'date-fns';

// Plan start date: January 2, 2026
const PLAN_START = new Date(2026, 0, 2); // January 2, 2026

// Helper to get date string for a specific day offset from plan start
const getDate = (dayOffset: number): string => {
  return format(addDays(PLAN_START, dayOffset), 'yyyy-MM-dd');
};

// Helper to create workout entry
const workout = (
  dayOffset: number,
  title: string,
  details: string,
  phase: string,
  week: number,
  intensity: Intensity,
  tags: WorkoutTag[],
  durationMin?: number | null,
  distanceKm?: number | null
): WorkoutDayInput => ({
  date: getDate(dayOffset),
  title,
  details,
  phase,
  week,
  intensity,
  tags,
  planned_duration_min: durationMin ?? null,
  planned_distance_km: distanceKm ?? null,
});

// Helper for rest days
const rest = (dayOffset: number, week: number, phase: string): WorkoutDayInput => ({
  date: getDate(dayOffset),
  title: 'Rest Day',
  details: 'Rest or light walking. Recovery is when your body adapts and gets stronger.',
  phase,
  week,
  intensity: 'Rest',
  tags: ['rest'],
  planned_duration_min: null,
  planned_distance_km: null,
});

// Helper for strength days
const strength = (dayOffset: number, week: number, phase: string): WorkoutDayInput => ({
  date: getDate(dayOffset),
  title: 'Strength Training',
  details: `20-35 min strength session. Pick 5-7 exercises, 2-3 sets of 8-12 reps:
• Box squat (sit to bench/chair)
• Romanian deadlift (light) or hip hinge
• Step-ups (low step)
• Glute bridge / hip thrust
• Calf raises (slow)
• Side plank
• Dead bug (core)
• Band walks (hip stability)

Keep it "easy-medium" at first. Consistency beats intensity.`,
  phase,
  week,
  intensity: 'Strength',
  tags: ['strength'],
  planned_duration_min: 30,
  planned_distance_km: null,
});

// Generate the full 17-week plan
export const generatePlanTemplate = (): WorkoutDayInput[] => {
  const plan: WorkoutDayInput[] = [];
  
  // ============================================
  // PHASE 1 (Weeks 1-4): Habit + impact adaptation
  // Focus: easy run-walk, no speed, build consistency
  // ============================================
  
  // Week 1 (Day 0-6, Jan 2-8)
  plan.push(workout(0, 'Run A (Easy)', 
    '25 min total → 1 min run / 1 min walk\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Alternate 1 min running / 1 min walking\nCool-down: 5 min walk\n\nPace should feel almost too easy - you should be able to talk in full sentences.',
    'Phase 1', 1, 'E', ['easy'], 25));
  plan.push(rest(1, 1, 'Phase 1'));
  plan.push(strength(2, 1, 'Phase 1'));
  plan.push(workout(3, 'Run B (Easy)',
    '25 min total → 1 min run / 1 min walk\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Alternate 1 min running / 1 min walking\nCool-down: 5 min walk\n\nKeep the same comfortable pace as Run A.',
    'Phase 1', 1, 'E', ['easy'], 25));
  plan.push(rest(4, 1, 'Phase 1'));
  plan.push(strength(5, 1, 'Phase 1'));
  plan.push(workout(6, 'Long Run (Easy)',
    '35 min total → 1/1 (or 2/1 if it feels easy)\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Run-walk at your chosen ratio. If 1/1 feels too easy, try 2 min run / 1 min walk.\nCool-down: 5 min walk\n\nThis is your first "long" run. Keep it conversational!',
    'Phase 1', 1, 'E', ['easy', 'longrun'], 35));
  
  // Week 2 (Day 7-13, Jan 9-15)
  plan.push(rest(7, 2, 'Phase 1'));
  plan.push(workout(8, 'Run A (Easy)',
    '28 min → 2/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 2 min run / 1 min walk\nCool-down: 5 min walk\n\nSlightly longer than last week. You\'re building the habit!',
    'Phase 1', 2, 'E', ['easy'], 28));
  plan.push(strength(9, 2, 'Phase 1'));
  plan.push(workout(10, 'Run B (Easy)',
    '28 min → 2/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 2 min run / 1 min walk\nCool-down: 5 min walk',
    'Phase 1', 2, 'E', ['easy'], 28));
  plan.push(rest(11, 2, 'Phase 1'));
  plan.push(strength(12, 2, 'Phase 1'));
  plan.push(workout(13, 'Long Run (Easy)',
    '40 min → 2/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 2 min run / 1 min walk throughout\nCool-down: 5 min walk\n\nYour body is adapting. Keep it easy!',
    'Phase 1', 2, 'E', ['easy', 'longrun'], 40));
  
  // Week 3 (Day 14-20, Jan 16-22)
  plan.push(rest(14, 3, 'Phase 1'));
  plan.push(workout(15, 'Run A (Easy)',
    '30 min → 3/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 3 min run / 1 min walk\nCool-down: 5 min walk\n\nLonger run intervals now. Still conversational pace!',
    'Phase 1', 3, 'E', ['easy'], 30));
  plan.push(strength(16, 3, 'Phase 1'));
  plan.push(workout(17, 'Run B (Easy)',
    '30 min → 3/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 3 min run / 1 min walk\nCool-down: 5 min walk',
    'Phase 1', 3, 'E', ['easy'], 30));
  plan.push(rest(18, 3, 'Phase 1'));
  plan.push(strength(19, 3, 'Phase 1'));
  plan.push(workout(20, 'Long Run (Easy)',
    '45 min → 3/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 3 min run / 1 min walk\nCool-down: 5 min walk\n\nGood progress! This is building your aerobic base.',
    'Phase 1', 3, 'E', ['easy', 'longrun'], 45));
  
  // Week 4 - Deload (Day 21-27, Jan 23-29)
  plan.push(rest(21, 4, 'Phase 1'));
  plan.push(workout(22, 'Run A (Easy) - Deload',
    '25-28 min → 3/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 3 min run / 1 min walk\nCool-down: 5 min walk\n\nDeload week - slightly shorter to let your body recover and adapt.',
    'Phase 1', 4, 'E', ['easy', 'deload'], 26));
  plan.push(strength(23, 4, 'Phase 1'));
  plan.push(workout(24, 'Run B (Easy) - Deload',
    '25-28 min → 3/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 3 min run / 1 min walk\nCool-down: 5 min walk',
    'Phase 1', 4, 'E', ['easy', 'deload'], 26));
  plan.push(rest(25, 4, 'Phase 1'));
  plan.push(strength(26, 4, 'Phase 1'));
  plan.push(workout(27, 'Long Run (Easy) - Deload',
    '40 min → 3/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 3 min run / 1 min walk\nCool-down: 5 min walk\n\nRecovery week complete! You should feel fresh for Phase 2.',
    'Phase 1', 4, 'E', ['easy', 'longrun', 'deload'], 40));
  
  // ============================================
  // PHASE 2 (Weeks 5-8): More continuous running + longer easy work
  // Focus: gradually longer, still mostly easy; tiny technique stimulus
  // ============================================
  
  // Week 5 (Day 28-34, Jan 30 - Feb 5)
  plan.push(rest(28, 5, 'Phase 2'));
  plan.push(workout(29, 'Run A (Easy)',
    '32 min → 4/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 4 min run / 1 min walk\nCool-down: 5 min walk\n\nPhase 2 begins! Longer continuous running intervals.',
    'Phase 2', 5, 'E', ['easy'], 32));
  plan.push(strength(30, 5, 'Phase 2'));
  plan.push(workout(31, 'Run B (Easy + Strides)',
    '32 min easy + 4×15 sec slightly faster\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 4/1 run-walk ratio for about 25 min\nStrides: 4×15 sec slightly faster (not sprinting!) with easy jog/walk recovery between\nCool-down: 5 min walk\n\nFirst introduction of faster leg turnover!',
    'Phase 2', 5, 'E', ['easy'], 32));
  plan.push(rest(32, 5, 'Phase 2'));
  plan.push(strength(33, 5, 'Phase 2'));
  plan.push(workout(34, 'Long Run (Easy)',
    '50 min → 4/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 4 min run / 1 min walk\nCool-down: 5 min walk\n\nBiggest long run yet! Stay patient and conversational.',
    'Phase 2', 5, 'E', ['easy', 'longrun'], 50));
  
  // Week 6 (Day 35-41, Feb 6-12)
  plan.push(rest(35, 6, 'Phase 2'));
  plan.push(workout(36, 'Run A (Easy)',
    '35 min → 5/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 5 min run / 1 min walk\nCool-down: 5 min walk\n\n5 minutes of continuous running at a time now!',
    'Phase 2', 6, 'E', ['easy'], 35));
  plan.push(strength(37, 6, 'Phase 2'));
  plan.push(workout(38, 'Run B (Easy + Strides)',
    '35 min easy + 4×20 sec slightly faster\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 5/1 run-walk ratio\nStrides: 4×20 sec slightly faster with easy recovery\nCool-down: 5 min walk',
    'Phase 2', 6, 'E', ['easy'], 35));
  plan.push(rest(39, 6, 'Phase 2'));
  plan.push(strength(40, 6, 'Phase 2'));
  plan.push(workout(41, 'Long Run (Easy)',
    '55 min → 5/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 5 min run / 1 min walk\nCool-down: 5 min walk\n\nGreat endurance building here!',
    'Phase 2', 6, 'E', ['easy', 'longrun'], 55));
  
  // Week 7 (Day 42-48, Feb 13-19)
  plan.push(rest(42, 7, 'Phase 2'));
  plan.push(workout(43, 'Run A (Easy)',
    '38 min → 6/1 (or stay at 5/1 if needed)\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 6 min run / 1 min walk (or 5/1 if that feels better)\nCool-down: 5 min walk\n\nListen to your body on the ratio choice.',
    'Phase 2', 7, 'E', ['easy'], 38));
  plan.push(strength(44, 7, 'Phase 2'));
  plan.push(workout(45, 'Run B (Easy)',
    '35-38 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Your chosen run-walk ratio\nCool-down: 5 min walk',
    'Phase 2', 7, 'E', ['easy'], 36));
  plan.push(rest(46, 7, 'Phase 2'));
  plan.push(strength(47, 7, 'Phase 2'));
  plan.push(workout(48, 'Long Run (Easy)',
    '60 min → 6/1 ratio\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 6 min run / 1 min walk\nCool-down: 5 min walk\n\nYour first hour-long run! This is a milestone.',
    'Phase 2', 7, 'E', ['easy', 'longrun'], 60));
  
  // Week 8 - Deload (Day 49-55, Feb 20-26)
  plan.push(rest(49, 8, 'Phase 2'));
  plan.push(workout(50, 'Run A (Easy) - Deload',
    '30-32 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Easy run-walk at comfortable ratio\nCool-down: 5 min walk\n\nDeload week - recovery before Phase 3.',
    'Phase 2', 8, 'E', ['easy', 'deload'], 31));
  plan.push(strength(51, 8, 'Phase 2'));
  plan.push(workout(52, 'Run B (Easy) - Deload',
    '30-32 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Easy run-walk\nCool-down: 5 min walk',
    'Phase 2', 8, 'E', ['easy', 'deload'], 31));
  plan.push(rest(53, 8, 'Phase 2'));
  plan.push(strength(54, 8, 'Phase 2'));
  plan.push(workout(55, 'Long Run (Easy) - Deload',
    '50-55 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Easy run-walk\nCool-down: 5 min walk\n\nPhase 2 complete! Great foundation built.',
    'Phase 2', 8, 'E', ['easy', 'longrun', 'deload'], 52));
  
  // ============================================
  // PHASE 3 (Weeks 9-13): Base fitness + gentle "quality" sessions
  // Focus: 1 light quality session/week; long run grows toward 12-14 km
  // ============================================
  
  // Week 9 (Day 56-62, Feb 27 - Mar 5)
  plan.push(rest(56, 9, 'Phase 3'));
  plan.push(workout(57, 'Run A (Easy)',
    '40 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Continuous or run-walk as needed\nCool-down: 5 min walk\n\nPhase 3 - now we add some quality!',
    'Phase 3', 9, 'E', ['easy'], 40));
  plan.push(strength(58, 9, 'Phase 3'));
  plan.push(workout(59, 'Run B (Steady Blocks)',
    '10 min easy + 3×(4 min steady / 2 min easy) + 5 min easy\n\nWarm-up: 10 min easy running\nMain: 3 blocks of 4 min at steady effort (RPE 6/10, short sentences) with 2 min easy between\nCool-down: 5 min easy\n\nFirst quality session! Steady means "comfortably challenging".',
    'Phase 3', 9, 'S', ['steady'], 33));
  plan.push(rest(60, 9, 'Phase 3'));
  plan.push(strength(61, 9, 'Phase 3'));
  plan.push(workout(62, 'Long Run (Easy)',
    '8 km easy (run-walk ok)\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 8 km at conversational pace. Use run-walk if needed.\nCool-down: 5 min walk\n\nFirst distance-based long run!',
    'Phase 3', 9, 'E', ['easy', 'longrun'], null, 8));
  
  // Week 10 (Day 63-69, Mar 6-12)
  plan.push(rest(63, 10, 'Phase 3'));
  plan.push(workout(64, 'Run A (Easy)',
    '42 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Easy continuous running or run-walk\nCool-down: 5 min walk',
    'Phase 3', 10, 'E', ['easy'], 42));
  plan.push(strength(65, 10, 'Phase 3'));
  plan.push(workout(66, 'Run B (Steady Blocks)',
    '10 min easy + 4×(3 min steady / 2 min easy) + 5 min easy\n\nWarm-up: 10 min easy\nMain: 4 blocks of 3 min steady (RPE 6/10) with 2 min easy\nCool-down: 5 min easy',
    'Phase 3', 10, 'S', ['steady'], 35));
  plan.push(rest(67, 10, 'Phase 3'));
  plan.push(strength(68, 10, 'Phase 3'));
  plan.push(workout(69, 'Long Run (Easy)',
    '9 km easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 9 km at easy, conversational pace\nCool-down: 5 min walk',
    'Phase 3', 10, 'E', ['easy', 'longrun'], null, 9));
  
  // Week 11 (Day 70-76, Mar 13-19)
  plan.push(rest(70, 11, 'Phase 3'));
  plan.push(workout(71, 'Run A (Easy)',
    '45 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Easy running\nCool-down: 5 min walk',
    'Phase 3', 11, 'E', ['easy'], 45));
  plan.push(strength(72, 11, 'Phase 3'));
  plan.push(workout(73, 'Run B (Steady Blocks)',
    '10 min easy + 2×(8 min steady / 3 min easy) + 5 min easy\n\nWarm-up: 10 min easy\nMain: 2 longer blocks of 8 min steady with 3 min easy recovery\nCool-down: 5 min easy\n\nLonger steady blocks now - building race fitness!',
    'Phase 3', 11, 'S', ['steady'], 37));
  plan.push(rest(74, 11, 'Phase 3'));
  plan.push(strength(75, 11, 'Phase 3'));
  plan.push(workout(76, 'Long Run (Easy)',
    '10 km easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 10 km easy - double digits!\nCool-down: 5 min walk\n\nCongratulations on hitting 10k in training!',
    'Phase 3', 11, 'E', ['easy', 'longrun'], null, 10));
  
  // Week 12 - Deload (Day 77-83, Mar 20-26)
  plan.push(rest(77, 12, 'Phase 3'));
  plan.push(workout(78, 'Run A (Easy) - Deload',
    '35-40 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Easy running\nCool-down: 5 min walk\n\nDeload week before the final push.',
    'Phase 3', 12, 'E', ['easy', 'deload'], 37));
  plan.push(strength(79, 12, 'Phase 3'));
  plan.push(workout(80, 'Run B (Easy + Strides) - Deload',
    '30-35 min easy + 4×20 sec relaxed faster strides\n\nWarm-up: 5-8 min easy\nMain: Easy running\nStrides: 4×20 sec at a relaxed faster pace (not sprinting)\nCool-down: 5 min walk',
    'Phase 3', 12, 'E', ['easy', 'deload'], 32));
  plan.push(rest(81, 12, 'Phase 3'));
  plan.push(strength(82, 12, 'Phase 3'));
  plan.push(workout(83, 'Long Run (Easy) - Deload',
    '8-9 km easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 8-9 km easy\nCool-down: 5 min walk',
    'Phase 3', 12, 'E', ['easy', 'longrun', 'deload'], null, 8.5));
  
  // Week 13 (Day 84-90, Mar 27 - Apr 2)
  plan.push(rest(84, 13, 'Phase 3'));
  plan.push(workout(85, 'Run A (Easy)',
    '45 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Easy running\nCool-down: 5 min walk',
    'Phase 3', 13, 'E', ['easy'], 45));
  plan.push(strength(86, 13, 'Phase 3'));
  plan.push(workout(87, 'Run B (Tempo)',
    'Option 1: 10 min easy + 15 min tempo + 10 min easy\nOption 2 (easier): 3×5 min tempo with 2 min easy between\n\nWarm-up: 10 min easy\nMain: Choose your option. Tempo = RPE 7/10, controlled hard, 20-30 min sustainable\nCool-down: 10 min easy\n\nFirst real tempo work! This builds race confidence.',
    'Phase 3', 13, 'T', ['tempo'], 35));
  plan.push(rest(88, 13, 'Phase 3'));
  plan.push(strength(89, 13, 'Phase 3'));
  plan.push(workout(90, 'Long Run (Easy)',
    '12 km easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 12 km at easy pace\nCool-down: 5 min walk\n\n12k - you\'re really building toward 15k now!',
    'Phase 3', 13, 'E', ['easy', 'longrun'], null, 12));
  
  // ============================================
  // PHASE 4 (Weeks 14-16): Specific build to 15 km
  // Focus: long run to 15-17 km; quality stays controlled
  // ============================================
  
  // Week 14 (Day 91-97, Apr 3-9)
  plan.push(rest(91, 14, 'Phase 4'));
  plan.push(workout(92, 'Run A (Easy)',
    '45-50 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Easy running\nCool-down: 5 min walk\n\nPhase 4 - final build phase!',
    'Phase 4', 14, 'E', ['easy'], 47));
  plan.push(strength(93, 14, 'Phase 4'));
  plan.push(workout(94, 'Run B (Steady Blocks)',
    '10 min easy + 4×(5 min steady / 2 min easy) + 5 min easy\n\nWarm-up: 10 min easy\nMain: 4 blocks of 5 min steady with 2 min recovery\nCool-down: 5 min easy',
    'Phase 4', 14, 'S', ['steady'], 43));
  plan.push(rest(95, 14, 'Phase 4'));
  plan.push(strength(96, 14, 'Phase 4'));
  plan.push(workout(97, 'Long Run (Easy)',
    '13 km easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 13 km at easy pace\nCool-down: 5 min walk\n\n13k long run - so close to your goal!',
    'Phase 4', 14, 'E', ['easy', 'longrun'], null, 13));
  
  // Week 15 (Day 98-104, Apr 10-16)
  plan.push(rest(98, 15, 'Phase 4'));
  plan.push(workout(99, 'Run A (Easy)',
    '50 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Easy running\nCool-down: 5 min walk',
    'Phase 4', 15, 'E', ['easy'], 50));
  plan.push(strength(100, 15, 'Phase 4'));
  plan.push(workout(101, 'Run B (Tempo)',
    'Option 1: 10 min easy + 20 min tempo + 10 min easy\nOption 2: 4×5 min tempo with 2 min easy\n\nWarm-up: 10 min easy\nMain: Tempo at RPE 7/10\nCool-down: 10 min easy\n\n20 minutes of tempo builds serious race readiness!',
    'Phase 4', 15, 'T', ['tempo'], 40));
  plan.push(rest(102, 15, 'Phase 4'));
  plan.push(strength(103, 15, 'Phase 4'));
  plan.push(workout(104, 'Long Run (Easy)',
    '14-15 km easy (run-walk is fine)\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 14-15 km at easy pace. Use run-walk if needed!\nCool-down: 5 min walk\n\nThis is race distance! You CAN do 15k.',
    'Phase 4', 15, 'E', ['easy', 'longrun'], null, 14.5));
  
  // Week 16 - Peak Week (Day 105-111, Apr 17-23)
  plan.push(rest(105, 16, 'Phase 4'));
  plan.push(workout(106, 'Run A (Easy)',
    '45 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Easy running\nCool-down: 5 min walk\n\nPeak week - controlled workload.',
    'Phase 4', 16, 'E', ['easy'], 45));
  plan.push(strength(107, 16, 'Phase 4'));
  plan.push(workout(108, 'Run B (Steady Blocks)',
    '10 min easy + 6×(2 min steady / 2 min easy) + 5 min easy\n\nWarm-up: 10 min easy\nMain: 6 short steady blocks to keep legs sharp\nCool-down: 5 min easy',
    'Phase 4', 16, 'S', ['steady'], 39));
  plan.push(rest(109, 16, 'Phase 4'));
  plan.push(strength(110, 16, 'Phase 4'));
  plan.push(workout(111, 'Long Run (Easy)',
    '16-17 km easy (only if recovery is good; otherwise cap at 15 km)\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Your longest run! Only go to 17k if you feel great. 15-16k is perfectly fine.\nCool-down: 5 min walk\n\nPEAK LONG RUN! After this, we taper.',
    'Phase 4', 16, 'E', ['easy', 'longrun'], null, 16));
  
  // ============================================
  // PHASE 5 (Week 17): Taper - arrive fresh
  // Focus: reduce volume, keep legs awake
  // ============================================
  
  // Week 17 - Taper (Day 112-120, Apr 24 - May 2)
  plan.push(rest(112, 17, 'Phase 5'));
  plan.push(workout(113, 'Run A (Easy) - Taper',
    '35-40 min easy\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: Easy running - enjoy this!\nCool-down: 5 min walk\n\nTaper week! Volume drops, freshness increases.',
    'Phase 5', 17, 'E', ['easy', 'deload'], 37));
  plan.push(rest(114, 17, 'Phase 5'));
  plan.push(workout(115, 'Run B (Easy + Strides) - Taper',
    '25-30 min easy + 4×20 sec relaxed faster strides\n\nWarm-up: 5-8 min easy\nMain: Short, easy running\nStrides: 4×20 sec relaxed fast to keep legs sharp\nCool-down: 5 min walk',
    'Phase 5', 17, 'E', ['easy', 'deload'], 27));
  plan.push(rest(116, 17, 'Phase 5'));
  plan.push(workout(117, 'Last Long Run - Taper',
    '10-12 km easy (~7 days before race)\n\nWarm-up: 5-8 min brisk walk + very easy jog\nMain: 10-12 km nice and easy\nCool-down: 5 min walk\n\nLast longer effort before race day. Keep it controlled and confident.',
    'Phase 5', 17, 'E', ['easy', 'longrun', 'deload'], null, 11));
  plan.push(rest(118, 17, 'Phase 5'));
  plan.push(workout(119, 'Easy Shakeout',
    '20-25 min very easy\n\nJust a short, easy jog to keep legs loose. Maybe include 4×15 sec strides.\n\nDay before race - stay relaxed!',
    'Phase 5', 17, 'E', ['easy', 'deload'], 22));
  plan.push(workout(120, '🏃 RACE DAY - Bosbeekse 15',
    'RACE DAY - Bosbeekse 15!\n\nPacing strategy:\n• Km 1-3: VERY easy (slower than you think)\n• Km 4-12: Steady, controlled\n• Last 3 km: Only push if you still feel good\n\nRun-walk on race day is totally acceptable:\n• Example: 8-10 min run / 1 min walk from the start can feel amazing at 15 km\n\nYou\'ve done the work. Trust your training. ENJOY IT! 🎉',
    'Phase 5', 17, 'S', ['race'], null, 15));
  
  return plan;
};

// Export the plan template
export const planTemplate = generatePlanTemplate();

// Export plan metadata
export const PLAN_METADATA = {
  startDate: '2026-01-02',
  endDate: '2026-05-02',
  totalWeeks: 17,
  goalDistance: 15,
  goalEvent: 'Bosbeekse 15',
  phases: [
    { name: 'Phase 1', weeks: '1-4', focus: 'Habit + impact adaptation' },
    { name: 'Phase 2', weeks: '5-8', focus: 'More continuous running + longer easy work' },
    { name: 'Phase 3', weeks: '9-13', focus: 'Base fitness + gentle quality sessions' },
    { name: 'Phase 4', weeks: '14-16', focus: 'Specific build to 15 km' },
    { name: 'Phase 5', weeks: '17', focus: 'Taper - arrive fresh' },
  ],
};

