import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'boss';
export type League = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster' | 'champion' | 'legend' | 'immortal';
export type GoalType = 'progressive' | 'accumulator' | 'frequency';
export type GoalTemplate = 'fitness' | 'meditation' | 'reading' | 'custom';

// Exercise/Task within a goal
export interface GoalExercise {
  id: string;
  name: string;           // "Pushups"
  targetAmount: number;   // 100 (end goal)
  startAmount: number;    // 30 (baseline ability)
  currentAmount: number;  // 35 (current working target - ONLY updates after task completion)
  unit: 'reps' | 'minutes' | 'pages' | 'sessions' | 'books' | 'items';
  daysAtCurrentTarget: number; // For progressive: 3 days = increment
}

export interface Task {
  id: string;
  title: string;
  difficulty: Difficulty;
  xp: number;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
  // Timer fields for hard/boss tasks
  timerEnabled?: boolean;
  timerDuration?: number; // in seconds
  timerStartedAt?: number;
  timerCompleted?: boolean;
  // Goal-related fields
  goalId?: string;
  isGoalTask?: boolean;
  goalType?: GoalType;
  dueDate?: 'daily' | 'weekly';
  requiredAmount?: number; // For progressive: "Do 35 pushups"
  actualAmount?: number; // For overclock: they did 40
  overclocked?: boolean;
  unit?: string;
  exerciseId?: string; // Which exercise in the goal this is for
  // Display fields
  goalTitle?: string; // "Get Abs" - for showing subtitle
  exerciseName?: string; // "Pushups" - for better task naming
  finalGoal?: number; // 100 - for showing "Goal: 100 pushups"
  // Habit-related fields
  habitId?: string;
  isHabitTask?: boolean;
  // Accumulator progress
  currentProgress?: number;
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  template?: GoalTemplate;
  exercises: GoalExercise[]; // Array of exercises/tasks
  params: {
    // Frequency (Habits with intensity)
    frequency: 'daily' | 'weekly';
    weeklyTarget?: number;    // e.g., 3 times per week
    weeklyProgress?: number;  // e.g., 2/3 done
    lastWeekReset?: string;   // Track when weekly counter reset

    // Accumulator
    totalCompleted?: number;  // How many completed so far
    targetValue?: number;     // Target total
    deadline?: string;        // ISO date string
    unit?: string;
  };
  consecutiveDays: number;    // For progressive overload (3 days = increment)
  history: { date: string; value: number; exerciseId?: string }[];
  createdAt: number;
  completedAt?: number; // Timestamp when goal was completed (all targets met)
  // Shame Badge / Streak Logic
  streakBrokenDate?: string; // Date string when streak was broken
  previousStreak?: number; // The streak count before it was broken
  completed: boolean;
  rewardsClaimed?: boolean;
}

export interface Habit {
  id: string;
  title: string;
  originGoalId?: string;
  exercises: GoalExercise[];
  frequency: 'daily' | 'weekly';
  weeklyTarget?: number;
  weeklyProgress?: number; // Track progress toward weekly target
  lastWeekReset?: string; // ISO date when weekly counter was last reset
  streak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  history: { date: string; value: number; exerciseId?: string }[];
  createdAt: number;
  streakBrokenDate?: string;
  previousStreak?: number;
}

export type ViceTemplate = 'dopamine' | 'vitality' | 'substance' | 'custom';

export interface Vice {
  id: string;
  title: string;
  template: ViceTemplate;
  startDate: string; // ISO Date
  currentStreak: number;
  longestStreak: number;
  history: Record<string, 'clean' | 'relapsed'>; // Date -> Status
  lastCheckIn: string; // ISO Date
}

export interface UserStats {
  currentXP: number;
  totalLifetimeXP: number;
  level: number;
  streak: number;
  longestStreak?: number; // Track all-time high
  lastActiveDate: string | null;
  dailyXP: { date: string; xp: number }[];
  taskHistory: { date: string; count: number }[]; // Persist completion counts
}

interface GameState {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  vices: Vice[];
  stats: UserStats;
  theme: 'dark' | 'light';
  activeView: 'tasks' | 'goals' | 'habits' | 'vices';

  // Actions
  addTask: (title: string, difficulty: Difficulty, timerMinutes?: number) => void;
  completeTask: (id: string) => { xp: number; leveledUp: boolean; newLevel: number };
  deleteTask: (id: string) => void;
  startTimer: (id: string) => void;
  completeTimer: (id: string) => void;
  toggleTheme: () => void;
  setActiveView: (view: 'tasks' | 'goals' | 'habits' | 'vices') => void;

  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'consecutiveDays' | 'history' | 'streakBrokenDate' | 'previousStreak'>) => void;
  deleteGoal: (id: string) => void;
  completeGoalTask: (taskId: string, actualAmount?: number) => { xp: number; leveledUp: boolean; newLevel: number; bonusXP?: number };
  overclockTask: (taskId: string, actualAmount: number) => { bonusXP: number };
  updateAccumulatorProgress: (taskId: string, amount: number) => void;
  checkAndGenerateDailyTasks: () => void;
  moveGoalToHabit: (goalId: string) => void;
  claimGoalRewards: (goalId: string) => void;

  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'longestStreak' | 'history'>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string) => { xp: number; leveledUp: boolean; newLevel: number };
  completeHabitTask: (taskId: string) => { xp: number; leveledUp: boolean; newLevel: number };

  // Vice actions
  addVice: (vice: Omit<Vice, 'id' | 'startDate' | 'currentStreak' | 'longestStreak' | 'history' | 'lastCheckIn'>) => void;
  deleteVice: (id: string) => void;
  checkInVice: (id: string, status: 'clean' | 'relapsed') => { xp: number; leveledUp: boolean; newLevel: number };
  checkMissedViceDays: () => void;

  // Getters
  getXPForNextLevel: () => number;
  getCurrentLevelProgress: () => number;
  getLeague: () => League;
  getLeagueProgress: () => { current: number; needed: number; nextLeague: League | null; percent: number };
  getWeeklyAverageXP: () => number;
  getMonthlyXP: () => number;
  getGoalTasks: () => Task[];
  getCustomTasks: () => Task[];
  getHabitTasks: () => Task[];

  // Debug
  debugLeagueOverride?: League;
  debugIncreaseStreak: (days: number) => void;
  debugAddXP: (amount: number) => void;
  debugCycleLeague: (direction: 'next' | 'prev') => void;
  debugAdvanceDay: () => void;
  debugResetAll: () => void; // New reset function
}

const XP_VALUES: Record<Difficulty, number> = {
  trivial: 5,
  easy: 10,
  medium: 25,
  hard: 50,
  boss: 100,
};

// Monthly league thresholds (based on monthly XP, resets each month)
const LEAGUE_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000,
  diamond: 5000,
  master: 8000,
  grandmaster: 12000,
  champion: 18000,
  legend: 25000,
  immortal: 35000,
};

// Level formula so Level 1 starts at 0 XP
const calculateLevel = (totalXP: number): number => {
  return Math.max(1, Math.floor(0.1 * Math.sqrt(totalXP)) + 1);
};

// XP required to START a level (Level 1 starts at 0)
const getXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.pow((level - 1) / 0.1, 2);
};

// DEBUG: Offset for date simulation - persisted in localStorage
const loadDebugDateOffset = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem('questlife-debug-date-offset');
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

export let DEBUG_DATE_OFFSET = loadDebugDateOffset();

export const setDebugDateOffset = (offset: number) => {
  DEBUG_DATE_OFFSET = offset;
  if (typeof window !== 'undefined') {
    localStorage.setItem('questlife-debug-date-offset', String(offset));
  }
};

export const getTodayDate = (): string => {
  const now = new Date();
  now.setDate(now.getDate() + DEBUG_DATE_OFFSET);
  return now.toISOString().split('T')[0];
};

const getStartOfWeek = (): string => {
  const now = new Date();
  now.setDate(now.getDate() + DEBUG_DATE_OFFSET);
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  return startOfWeek.toISOString().split('T')[0];
};

const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + DEBUG_DATE_OFFSET - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
};

const getCurrentMonthDays = (): string[] => {
  const days: string[] = [];
  const now = new Date();
  now.setDate(now.getDate() + DEBUG_DATE_OFFSET);
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);

  for (let d = new Date(firstDay); d <= now; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

// Auto-assign difficulty based on required amount and unit
const getDifficultyForAmount = (amount: number, unit: string): Difficulty => {
  if (unit === 'reps' || unit === 'pages') {
    if (amount < 20) return 'easy';
    if (amount < 50) return 'medium';
    if (amount < 80) return 'hard';
    return 'boss';
  }
  if (unit === 'minutes') {
    if (amount < 10) return 'easy';
    if (amount < 30) return 'medium';
    if (amount < 60) return 'hard';
    return 'boss';
  }
  if (unit === 'books') {
    return 'hard'; // Books are always hard
  }
  return 'medium';
};

// Generate goal task based on goal type
const generateGoalTask = (goal: Goal, exercise?: GoalExercise): Task | null => {
  if (goal.type === 'progressive' && exercise) {
    // Task shows current target, not updated until completion
    const difficulty = getDifficultyForAmount(exercise.currentAmount, exercise.unit);
    return {
      id: `goal-task-${goal.id}-${exercise.id}-${Date.now()}`,
      title: `Do ${exercise.currentAmount} ${exercise.name.toLowerCase()}`,
      difficulty,
      xp: XP_VALUES[difficulty],
      completed: false,
      createdAt: Date.now(),
      goalId: goal.id,
      isGoalTask: true,
      goalType: 'progressive',
      dueDate: 'daily',
      requiredAmount: exercise.currentAmount,
      unit: exercise.unit,
      exerciseId: exercise.id,
      goalTitle: goal.title,
      exerciseName: exercise.name,
      finalGoal: exercise.targetAmount,
    };
  }

  if (goal.type === 'accumulator') {
    const unit = goal.params.unit || 'items';
    const currentProgress = goal.params.totalCompleted || 0;
    const targetValue = goal.params.targetValue || 0;
    return {
      id: `goal-task-${goal.id}-${Date.now()}`,
      title: `${goal.title} (${currentProgress}/${targetValue} ${unit})`,
      difficulty: 'medium',
      xp: XP_VALUES.medium,
      completed: false,
      createdAt: Date.now(),
      goalId: goal.id,
      isGoalTask: true,
      goalType: 'accumulator',
      dueDate: goal.params.frequency,
      unit,
      goalTitle: goal.title,
      finalGoal: targetValue,
      currentProgress,
    };
  }

  if (goal.type === 'frequency') {
    const progress = goal.params.weeklyProgress || 0;
    const target = goal.params.weeklyTarget || 3;

    // If there are exercises with intensity, use the first one
    if (goal.exercises.length > 0) {
      const exercise = goal.exercises[0];
      const difficulty = getDifficultyForAmount(exercise.currentAmount, exercise.unit);
      return {
        id: `goal-task-${goal.id}-${exercise.id}-${Date.now()}`,
        title: `${exercise.name}: ${exercise.currentAmount} ${exercise.unit}`,
        difficulty,
        xp: XP_VALUES[difficulty],
        completed: false,
        createdAt: Date.now(),
        goalId: goal.id,
        isGoalTask: true,
        goalType: 'frequency',
        dueDate: 'weekly',
        requiredAmount: exercise.currentAmount,
        unit: exercise.unit,
        exerciseId: exercise.id,
        goalTitle: `${goal.title} (${progress + 1}/${target})`,
        exerciseName: exercise.name,
        finalGoal: exercise.targetAmount,
      };
    }

    return {
      id: `goal-task-${goal.id}-${Date.now()}`,
      title: `${goal.title} (${progress + 1}/${target})`,
      difficulty: 'medium',
      xp: XP_VALUES.medium,
      completed: false,
      createdAt: Date.now(),
      goalId: goal.id,
      isGoalTask: true,
      goalType: 'frequency',
      dueDate: 'weekly',
      goalTitle: goal.title,
    };
  }

  return null;
};

// Generate habit task
const generateHabitTask = (habit: Habit, exercise?: GoalExercise): Task | null => {
  if (exercise) {
    const difficulty = getDifficultyForAmount(exercise.currentAmount, exercise.unit);
    return {
      id: `habit-task-${habit.id}-${exercise.id}-${Date.now()}`,
      title: `Do ${exercise.currentAmount} ${exercise.name.toLowerCase()}`,
      difficulty,
      xp: XP_VALUES[difficulty],
      completed: false,
      createdAt: Date.now(),
      habitId: habit.id,
      isHabitTask: true,
      dueDate: 'daily',
      requiredAmount: exercise.currentAmount,
      unit: exercise.unit,
      exerciseId: exercise.id,
      goalTitle: habit.title,
      exerciseName: exercise.name,
      finalGoal: exercise.targetAmount, // Assuming targetAmount is mapped to WannaDo
    };
  }

  // Simple habit without exercises
  return {
    id: `habit-task-${habit.id}-${Date.now()}`,
    title: habit.title,
    difficulty: 'medium',
    xp: XP_VALUES.medium,
    completed: false,
    createdAt: Date.now(),
    habitId: habit.id,
    isHabitTask: true,
    dueDate: 'daily',
    goalTitle: habit.title,
  };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      tasks: [],
      goals: [],
      habits: [],
      vices: [],
      stats: {
        currentXP: 0,
        totalLifetimeXP: 0,
        level: 1,
        streak: 0,
        lastActiveDate: null,
        dailyXP: [],
        taskHistory: [],
      },
      theme: 'dark',
      activeView: 'tasks',

      setActiveView: (view) => set({ activeView: view }),

      addTask: (title, difficulty, timerMinutes) => {
        const needsTimer = (difficulty === 'hard' || difficulty === 'boss') && timerMinutes && timerMinutes > 0;
        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          difficulty,
          xp: XP_VALUES[difficulty],
          completed: false,
          createdAt: Date.now(),
          timerEnabled: needsTimer,
          timerDuration: needsTimer ? timerMinutes * 60 : undefined,
          timerStartedAt: undefined,
          timerCompleted: false,
          isGoalTask: false,
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },

      startTimer: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, timerStartedAt: Date.now() } : t
          ),
        }));
      },

      completeTimer: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, timerCompleted: true } : t
          ),
        }));
      },

      completeTask: (id) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === id);
        if (!task || task.completed) return { xp: 0, leveledUp: false, newLevel: state.stats.level };

        const xpGained = task.xp;
        const newTotalXP = state.stats.totalLifetimeXP + xpGained;
        const oldLevel = state.stats.level;
        const newLevel = calculateLevel(newTotalXP);
        const leveledUp = newLevel > oldLevel;

        const today = getTodayDate();
        // Streak logic moved inside dailyXP check to ensure it triggers correctly on first activity
        // Removing the old block to avoid double counting for task completion vs first daily action
        // const today = getTodayDate(); // Already defined above
        let newStreak = state.stats.streak;

        // Update daily XP tracking - THIS IS CRITICAL FOR LEAGUE PROGRESS
        // --- GLOBAL STREAK LOGIC FIXED ---
        // Check if we have already recorded XP/Activity for "today"
        // We check if there is an entry in dailyXP for today.
        // NOTE: We do this check BEFORE adding the new XP to dailyXP in the logic below, 
        // but to be safe and handle the "first action" correctly, we check if today's entry exists.

        const updatedDailyXP = [...state.stats.dailyXP];
        const existingTodayEntry = updatedDailyXP.find(d => d.date === today);

        // If NO entry existed for today (or it was 0), this is the FIRST action of the day.
        // REFINED LOGIC: Always rely on lastActiveDate to determine if streak should update.
        if (state.stats.lastActiveDate !== today) {
          // This is the first significant action of the day
          // Check streak continuity
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1 + DEBUG_DATE_OFFSET); // Respect debug offset
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (state.stats.lastActiveDate === yesterdayStr) {
            newStreak += 1;
          } else {
            // Break streak if not yesterday (and not today, which we checked)
            newStreak = 1;
          }
        }

        if (existingTodayEntry) {
          existingTodayEntry.xp += xpGained;
        } else {
          updatedDailyXP.push({ date: today, xp: xpGained });
        }
        // Keep only last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const filteredDailyXP = updatedDailyXP.filter(d => new Date(d.date) >= thirtyDaysAgo);

        set({
          debugLeagueOverride: undefined,
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: true, completedAt: Date.now() } : t
          ),
          stats: {
            ...state.stats,
            currentXP: state.stats.currentXP + xpGained,
            totalLifetimeXP: newTotalXP,
            level: newLevel,
            streak: newStreak,
            longestStreak: Math.max(state.stats.longestStreak || 0, newStreak),
            lastActiveDate: today,
            dailyXP: filteredDailyXP,
          },
        });

        return { xp: xpGained, leveledUp, newLevel };
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
          return { theme: newTheme };
        });
      },

      // Goal Actions
      addGoal: (goalData) => {
        const newGoal: Goal = {
          ...goalData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          completed: false,
          consecutiveDays: 0,
          history: [],
        };

        // Generate initial tasks for all exercises
        const newTasks: Task[] = [];

        if (newGoal.type === 'progressive') {
          // For progressive goals, generate a task for each exercise
          newGoal.exercises.forEach(exercise => {
            const task = generateGoalTask(newGoal, exercise);
            if (task) newTasks.push(task);
          });
        } else if (newGoal.type === 'frequency' && newGoal.exercises.length > 0) {
          // For frequency with intensity, generate tasks for exercises
          newGoal.exercises.forEach(exercise => {
            const task = generateGoalTask(newGoal, exercise);
            if (task) newTasks.push(task);
          });
        } else {
          // For accumulator or simple frequency
          const task = generateGoalTask(newGoal);
          if (task) newTasks.push(task);
        }

        set((state) => ({
          goals: [newGoal, ...state.goals],
          tasks: [...newTasks, ...state.tasks],
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          tasks: state.tasks.filter((t) => t.goalId !== id),
        }));
      },

      completeGoalTask: (taskId, actualAmount) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task?.goalId) return { xp: 0, leveledUp: false, newLevel: state.stats.level };

        // Complete the task first and get XP
        const result = get().completeTask(taskId);

        const goal = get().goals.find(g => g.id === task.goalId);
        if (!goal) return result;

        const today = getTodayDate();

        // Handle based on goal type
        if (goal.type === 'progressive' && task.exerciseId) {
          // Find the exercise and update it
          const exercise = goal.exercises.find(e => e.id === task.exerciseId);
          if (!exercise) return result;

          const newDaysAtTarget = exercise.daysAtCurrentTarget + 1;
          let newCurrentAmount = exercise.currentAmount;

          // After 3 consecutive days at this target, increase by 10% of the GAP (Target - Current)
          // Formula: IncreaseAmount = Math.max(Math.ceil((Goal - Current) * 0.10), MinStep).
          if (newDaysAtTarget >= 3) {
            const gap = exercise.targetAmount - exercise.currentAmount;
            const minStep = 2; // Minimum increment of 2 for meaningful progress
            const increment = Math.max(Math.ceil(gap * 0.10), minStep);

            newCurrentAmount = exercise.currentAmount + increment;
            // Don't exceed target
            newCurrentAmount = Math.min(newCurrentAmount, exercise.targetAmount);
          }

          const updatedExercises = goal.exercises.map(e =>
            e.id === task.exerciseId
              ? {
                ...e,
                currentAmount: newCurrentAmount,
                daysAtCurrentTarget: newDaysAtTarget >= 3 ? 0 : newDaysAtTarget
              }
              : e
          );

          // Check if goal is complete (all exercises reached target)
          const isGoalComplete = updatedExercises.every(e => e.currentAmount >= e.targetAmount);

          set((state) => ({
            goals: state.goals.map(g =>
              g.id === task.goalId
                ? {
                  ...g,
                  exercises: updatedExercises,
                  consecutiveDays: goal.consecutiveDays + 1,
                  history: [...g.history, { date: today, value: actualAmount || task.requiredAmount || 0, exerciseId: task.exerciseId }],
                  completed: isGoalComplete,
                  completedAt: isGoalComplete ? Date.now() : undefined,
                  streakBrokenDate: undefined, // Clear streak broken status on completion
                  previousStreak: undefined,
                }
                : g
            ),
          }));

          // Award bonus XP for completing the goal
          if (isGoalComplete) {
            const bonusXP = 1000;
            // IMPORTANT: Re-get state to ensure we have latest XP values from the task completion above
            const currentState = get();
            const currentTotalXP = currentState.stats.totalLifetimeXP;
            const newTotalXP = currentTotalXP + bonusXP;
            const newLevel = calculateLevel(newTotalXP);

            const updatedDailyXP = [...currentState.stats.dailyXP];
            const todayEntry = updatedDailyXP.find(d => d.date === today);
            if (todayEntry) {
              todayEntry.xp += bonusXP;
            } else {
              updatedDailyXP.push({ date: today, xp: bonusXP });
            }

            set((state) => ({
              stats: {
                ...state.stats,
                totalLifetimeXP: newTotalXP,
                level: newLevel,
                dailyXP: updatedDailyXP,
              }
            }));

            // Trigger a toast or similar if needed, but UI handles that usually via level up or checking completed status
          }
        }

        if (goal.type === 'frequency') {
          const newProgress = (goal.params.weeklyProgress || 0) + 1;
          const weeklyTarget = goal.params.weeklyTarget || 3;
          const isWeeklyComplete = newProgress >= weeklyTarget;

          // Update exercise intensity if there's an exercise
          let updatedExercises = [...goal.exercises];
          if (task.exerciseId) {
            const exercise = goal.exercises.find(e => e.id === task.exerciseId);
            if (exercise) {
              const newDaysAtTarget = exercise.daysAtCurrentTarget + 1;
              let newCurrentAmount = exercise.currentAmount;

              // Frequency Progression: Use Adaptive Gap Formula
              // User requested: "completion should be based on day not week" AND faster progression
              // So we check simply for 3 successful completions (days/sessions), regardless of weeks.
              const sessionsForIncrease = 3;

              if (newDaysAtTarget >= sessionsForIncrease) {
                const gap = exercise.targetAmount - exercise.currentAmount;
                const minStep = 2; // Minimum increment of 2
                const increment = Math.max(Math.ceil(gap * 0.10), minStep);

                newCurrentAmount = Math.min(
                  exercise.currentAmount + increment,
                  exercise.targetAmount
                );
              }

              updatedExercises = updatedExercises.map(e =>
                e.id === task.exerciseId
                  ? {
                    ...e,
                    currentAmount: newCurrentAmount,
                    daysAtCurrentTarget: newDaysAtTarget >= sessionsForIncrease ? 0 : newDaysAtTarget
                  }
                  : e
              );
            }
          }

          set((state) => ({
            goals: state.goals.map(g =>
              g.id === task.goalId
                ? {
                  ...g,
                  exercises: updatedExercises,
                  params: { ...g.params, weeklyProgress: newProgress },
                  history: [...g.history, { date: today, value: 1 }],
                  completed: isWeeklyComplete,
                  completedAt: isWeeklyComplete ? Date.now() : undefined,
                  consecutiveDays: (() => {
                    if (g.params.frequency === 'daily') {
                      // For daily goals, increment if not done today (history check)
                      const doneToday = g.history.some(h => h.date === today);
                      return !doneToday ? g.consecutiveDays + 1 : g.consecutiveDays;
                    }
                    return (!g.completed && isWeeklyComplete) ? g.consecutiveDays + 1 : g.consecutiveDays;
                  })(),
                  streakBrokenDate: undefined, // Clear streak broken status on completion
                  previousStreak: undefined,
                }
                : g
            ),
          }));

          // Award weekly bonus if completed
          if (isWeeklyComplete) {
            const weeklyBonus = 50;
            const newTotalXP = get().stats.totalLifetimeXP + weeklyBonus;
            const newLevel = calculateLevel(newTotalXP);

            const updatedDailyXP = [...get().stats.dailyXP];
            const todayEntry = updatedDailyXP.find(d => d.date === today);
            if (todayEntry) {
              todayEntry.xp += weeklyBonus;
            } else {
              updatedDailyXP.push({ date: today, xp: weeklyBonus });
            }

            set((state) => ({
              stats: {
                ...state.stats,
                totalLifetimeXP: newTotalXP,
                level: newLevel,
                dailyXP: updatedDailyXP,
              }
            }));
          }
        }

        if (goal.type === 'accumulator') {
          // Accumulator progress is handled by updateAccumulatorProgress
        }

        return result;
      },

      claimGoalRewards: (goalId: string) => {
        const state = get();
        const goal = state.goals.find(g => g.id === goalId);
        if (!goal || !goal.completed || goal.rewardsClaimed) return;

        const xpBonus = 1000;
        const newTotalXP = state.stats.totalLifetimeXP + xpBonus;
        const newLevel = calculateLevel(newTotalXP);
        const today = getTodayDate();

        const updatedDailyXP = [...state.stats.dailyXP];
        const todayEntry = updatedDailyXP.find(d => d.date === today);
        if (todayEntry) {
          todayEntry.xp += xpBonus;
        } else {
          updatedDailyXP.push({ date: today, xp: xpBonus });
        }

        set(state => ({
          goals: state.goals.map(g => g.id === goalId ? { ...g, rewardsClaimed: true } : g),
          stats: {
            ...state.stats,
            totalLifetimeXP: newTotalXP,
            level: newLevel,
            dailyXP: updatedDailyXP
          }
        }));
      },

      overclockTask: (taskId, actualAmount) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task?.goalId || !task.requiredAmount) return { bonusXP: 0 };

        const goal = state.goals.find(g => g.id === task.goalId);
        if (!goal) return { bonusXP: 0 };

        const excess = actualAmount - task.requiredAmount;
        if (excess <= 0) return { bonusXP: 0 };

        // Calculate bonus XP: 2 XP per excess unit, capped at 100
        const bonusXP = Math.min(excess * 2, 100);

        const today = getTodayDate();
        const newTotalXP = state.stats.totalLifetimeXP + bonusXP;
        const oldLevel = state.stats.level;
        const newLevel = calculateLevel(newTotalXP);

        // Update daily XP
        const updatedDailyXP = [...state.stats.dailyXP];
        const todayEntry = updatedDailyXP.find(d => d.date === today);
        if (todayEntry) {
          todayEntry.xp += bonusXP;
        } else {
          updatedDailyXP.push({ date: today, xp: bonusXP });
        }

        // Fast-track the exercise if progressive
        if (goal.type === 'progressive' && task.exerciseId) {
          const boost = Math.ceil(excess * 0.5);
          const exercise = goal.exercises.find(e => e.id === task.exerciseId);
          if (exercise) {
            const newCurrentAmount = Math.min(
              exercise.targetAmount,
              exercise.currentAmount + boost
            );

            // Create updated exercises and check if goal is now complete
            const updatedExercises = goal.exercises.map(e =>
              e.id === task.exerciseId
                ? { ...e, currentAmount: newCurrentAmount, daysAtCurrentTarget: 0 }
                : e
            );

            // Check if ALL exercises have reached their targets
            const isGoalComplete = updatedExercises.every(e => e.currentAmount >= e.targetAmount);

            set({
              debugLeagueOverride: undefined,
              tasks: state.tasks.map(t =>
                t.id === taskId
                  ? { ...t, overclocked: true, actualAmount }
                  : t
              ),
              goals: state.goals.map(g =>
                g.id === task.goalId
                  ? {
                    ...g,
                    exercises: updatedExercises,
                    completed: isGoalComplete,
                    completedAt: isGoalComplete ? Date.now() : undefined,
                    streakBrokenDate: undefined, // Clear streak broken status on completion
                    previousStreak: undefined,
                  }
                  : g
              ),
              stats: {
                ...state.stats,
                totalLifetimeXP: newTotalXP,
                level: newLevel,
                dailyXP: updatedDailyXP,
              },
            });

            // Award goal completion bonus if just completed
            // Award goal completion bonus if just completed
            if (isGoalComplete) {
              const goalBonus = 1000;
              // Use newTotalXP (which includes overclock bonus) + goalBonus
              const finalXP = newTotalXP + goalBonus;
              const finalLevel = calculateLevel(finalXP);
              set((state) => ({
                stats: {
                  ...state.stats,
                  totalLifetimeXP: finalXP,
                  level: finalLevel,
                }
              }));
            }
          }
        } else {
          set({
            debugLeagueOverride: undefined,
            tasks: state.tasks.map(t =>
              t.id === taskId
                ? { ...t, overclocked: true, actualAmount }
                : t
            ),
            stats: {
              ...state.stats,
              totalLifetimeXP: newTotalXP,
              level: newLevel,
              dailyXP: updatedDailyXP,
            },
          });
        }

        return { bonusXP };
      },

      completeHabitTask: (taskId) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task?.habitId || task.completed) return { xp: 0, leveledUp: false, newLevel: state.stats.level };

        const habit = state.habits.find(h => h.id === task.habitId);
        if (!habit) return { xp: 0, leveledUp: false, newLevel: state.stats.level };

        // Complete the task first
        const result = get().completeTask(taskId);

        const today = getTodayDate();

        // Update habit stats (streak, history)
        // Only prevent double counting if the habit was already marked completed today via the 'completeHabit' call
        // But if there are multiple tasks for a habit (e.g. multiple exercises), we might want to track them all

        const isAlreadyCompletedToday = habit.lastCompletedDate === today;
        let newStreak = habit.streak;
        let newLongestStreak = habit.longestStreak;

        if (!isAlreadyCompletedToday) {
          // Check if streak is continuous
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1 + DEBUG_DATE_OFFSET);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (habit.lastCompletedDate === yesterdayStr) {
            newStreak += 1;
          } else if (habit.lastCompletedDate !== today) {
            // If not yesterday and not today, streak resets
            newStreak = 1;
          }

          if (newStreak > newLongestStreak) {
            newLongestStreak = newStreak;
          }
        }

        // Update Habit Exercise Progression (Atomic Habits Logic)
        let updatedExercises = habit.exercises || [];
        if (task.exerciseId) {
          const exercise = updatedExercises.find(e => e.id === task.exerciseId);
          if (exercise) {
            const newDaysAtTarget = exercise.daysAtCurrentTarget + 1;
            let newCurrentAmount = exercise.currentAmount;

            // Atomic Habits: Start small (2 mins) for first 3 days (handled in wizard/creation)
            // Here we handle progression: after 3 days at current, increase.

            // If we are in the "Atomic Phase" (e.g. amount is <= 2 mins) behavior is standard progression
            // But we should follow the "Adaptive Gap" formula now for everything.

            if (newDaysAtTarget >= 3) {
              const gap = exercise.targetAmount - exercise.currentAmount;
              const minStep = 2; // Min step 2
              // If gap is positive, increase
              if (gap > 0) {
                const increment = Math.max(Math.ceil(gap * 0.10), minStep);
                newCurrentAmount = Math.min(exercise.currentAmount + increment, exercise.targetAmount);
              }
            }

            updatedExercises = updatedExercises.map(e =>
              e.id === task.exerciseId
                ? { ...e, currentAmount: newCurrentAmount, daysAtCurrentTarget: newDaysAtTarget >= 3 ? 0 : newDaysAtTarget }
                : e
            );
          }
        }

        // Add to history
        const historyEntry = {
          date: today,
          value: task.actualAmount || task.requiredAmount || 1,
          exerciseId: task.exerciseId
        };

        set((state) => ({
          habits: state.habits.map(h =>
            h.id === habit.id
              ? {
                ...h,
                streak: newStreak,
                exercises: updatedExercises,
                longestStreak: newLongestStreak,
                lastCompletedDate: today,
                history: [...(h.history || []), historyEntry],
                // Increment weekly progress for weekly habits
                weeklyProgress: h.frequency === 'weekly'
                  ? (h.weeklyProgress || 0) + 1
                  : h.weeklyProgress
              }
              : h
          )
        }));

        return result;
      },

      updateAccumulatorProgress: (taskId, amount) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task?.goalId) return;

        const goal = state.goals.find(g => g.id === task.goalId);
        if (!goal || goal.type !== 'accumulator') return;

        const today = getTodayDate();
        const newTotal = (goal.params.totalCompleted || 0) + amount;
        const targetValue = goal.params.targetValue || 0;
        const isCompleted = newTotal >= targetValue;
        const unit = goal.params.unit || 'items';

        // Update goal progress
        set((state) => ({
          goals: state.goals.map(g =>
            g.id === task.goalId
              ? {
                ...g,
                params: { ...g.params, totalCompleted: newTotal },
                history: [...g.history, { date: today, value: amount }],
                completed: isCompleted,
                completedAt: isCompleted ? Date.now() : undefined,
                consecutiveDays: !g.completed && isCompleted ? g.consecutiveDays + 1 : g.consecutiveDays,
                streakBrokenDate: undefined, // Clear streak broken status on completion
                previousStreak: undefined,
              }
              : g
          ),
          // Update task title to show new progress
          tasks: state.tasks.map(t =>
            t.id === taskId
              ? {
                ...t,
                title: `${goal.title} (${newTotal}/${targetValue} ${unit})`,
                currentProgress: newTotal,
                // Complete the task ONLY when goal is complete
                completed: isCompleted,
                completedAt: isCompleted ? Date.now() : undefined,
              }
              : t
          ),
        }));

        // Award XP for daily contribution + bonus for completing the goal
        const xpGained = isCompleted ? XP_VALUES.medium + 1000 : XP_VALUES.trivial;
        const newTotalXP = get().stats.totalLifetimeXP + xpGained;
        const newLevel = calculateLevel(newTotalXP);

        const updatedDailyXP = [...get().stats.dailyXP];
        const todayEntry = updatedDailyXP.find(d => d.date === today);
        if (todayEntry) {
          todayEntry.xp += xpGained;
        } else {
          updatedDailyXP.push({ date: today, xp: xpGained });
        }

        set((state) => ({
          stats: {
            ...state.stats,
            totalLifetimeXP: newTotalXP,
            level: newLevel,
            dailyXP: updatedDailyXP,
          }
        }));
      },

      moveGoalToHabit: (goalId) => {
        const state = get();
        const goal = state.goals.find(g => g.id === goalId);
        if (!goal || !goal.completed) return;

        const newHabit: Habit = {
          id: crypto.randomUUID(),
          title: goal.title,
          originGoalId: goal.id,
          exercises: goal.exercises.map(e => ({
            ...e,
            // Keep the final target amount as the daily goal
            currentAmount: e.targetAmount,
          })),
          frequency: goal.params.frequency,
          weeklyTarget: goal.params.weeklyTarget,
          streak: 0,
          longestStreak: 0,
          history: [],
          createdAt: Date.now(),
        };

        set((state) => ({
          habits: [newHabit, ...state.habits],
          goals: state.goals.filter(g => g.id !== goalId),
          tasks: state.tasks.filter(t => t.goalId !== goalId),
        }));
      },

      addHabit: (habitData) => {
        const newHabit = {
          ...habitData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          streak: 0,
          longestStreak: 0,
          history: [],
        };

        set((state) => ({
          habits: [newHabit, ...state.habits],
        }));

        // Generate task immediately if applicable
        const state = get();
        if (newHabit.exercises.length > 0) {
          newHabit.exercises.forEach(exercise => {
            const newTask = generateHabitTask(newHabit, exercise);
            if (newTask) {
              set((state) => ({ tasks: [newTask, ...state.tasks] }));
            }
          });
        } else {
          const newTask = generateHabitTask(newHabit);
          if (newTask) {
            set((state) => ({ tasks: [newTask, ...state.tasks] }));
          }
        }
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        }));
      },

      completeHabit: (id) => {
        const state = get();
        const habit = state.habits.find(h => h.id === id);
        if (!habit) return { xp: 0, leveledUp: false, newLevel: state.stats.level };

        const today = getTodayDate();
        if (habit.lastCompletedDate === today) {
          return { xp: 0, leveledUp: false, newLevel: state.stats.level };
        }

        // Award XP for completing habit (medium difficulty by default)
        const xpGained = 25;
        const newTotalXP = state.stats.totalLifetimeXP + xpGained;
        const oldLevel = state.stats.level;
        const newLevel = calculateLevel(newTotalXP);
        const leveledUp = newLevel > oldLevel;

        // Calculate habit streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1 + DEBUG_DATE_OFFSET);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = habit.streak;
        if (habit.lastCompletedDate === yesterdayStr) {
          newStreak = habit.streak + 1;
        } else if (habit.lastCompletedDate !== today) {
          newStreak = 1;
        }

        const newLongestStreak = Math.max(habit.longestStreak, newStreak);

        // --- GLOBAL STREAK LOGIC ---
        let newGlobalStreak = state.stats.streak;
        // Check if this is the first activity of the day
        if (state.stats.lastActiveDate !== today) {
          if (state.stats.lastActiveDate === yesterdayStr) {
            newGlobalStreak += 1;
          } else {
            // Broken streak (if not today and not yesterday)
            newGlobalStreak = 1;
          }
        }

        // Update daily XP tracking
        const updatedDailyXP = [...state.stats.dailyXP];
        const todayEntry = updatedDailyXP.find(d => d.date === today);
        if (todayEntry) {
          todayEntry.xp += xpGained;
        } else {
          updatedDailyXP.push({ date: today, xp: xpGained });
        }

        set({
          habits: state.habits.map(h =>
            h.id === id
              ? { ...h, lastCompletedDate: today, streak: newStreak, longestStreak: newLongestStreak }
              : h
          ),
          stats: {
            ...state.stats,
            currentXP: state.stats.currentXP + xpGained,
            totalLifetimeXP: newTotalXP,
            level: newLevel,
            streak: newGlobalStreak,
            longestStreak: Math.max(state.stats.longestStreak || 0, newGlobalStreak),
            lastActiveDate: today,
            dailyXP: updatedDailyXP,
          },
        });

        return { xp: xpGained, leveledUp, newLevel };
      },

      // --- VICE ACTIONS ---
      addVice: (viceData) => {
        const today = getTodayDate();
        const newVice = {
          ...viceData,
          id: crypto.randomUUID(),
          startDate: today,
          currentStreak: 0,
          longestStreak: 0,
          history: {},
          lastCheckIn: '', // No check-in yet
        };

        set((state) => ({
          vices: [newVice, ...state.vices],
        }));
      },

      deleteVice: (id) => {
        set((state) => ({
          vices: state.vices.filter((v) => v.id !== id),
        }));
      },

      checkInVice: (id, status) => {
        const state = get();
        const vice = state.vices.find(v => v.id === id);
        if (!vice) return { xp: 0, leveledUp: false, newLevel: state.stats.level };

        const today = getTodayDate();

        // Prevent double check-in
        if (vice.lastCheckIn === today) {
          return { xp: 0, leveledUp: false, newLevel: state.stats.level };
        }

        let newStreak = vice.currentStreak;
        let xpGained = 0;

        if (status === 'clean') {
          newStreak = vice.currentStreak + 1;
          xpGained = 50; // +50 XP for staying clean
        } else {
          newStreak = 0; // Relapse resets streak
        }

        const newLongestStreak = Math.max(vice.longestStreak, newStreak);
        const newHistory = { ...vice.history, [today]: status };

        // Update XP and levels
        const newTotalXP = state.stats.totalLifetimeXP + xpGained;
        const oldLevel = state.stats.level;
        const newLevel = calculateLevel(newTotalXP);
        const leveledUp = newLevel > oldLevel;

        // Update daily XP
        const updatedDailyXP = [...state.stats.dailyXP];
        if (xpGained > 0) {
          const todayEntry = updatedDailyXP.find(d => d.date === today);
          if (todayEntry) {
            todayEntry.xp += xpGained;
          } else {
            updatedDailyXP.push({ date: today, xp: xpGained });
          }
        }

        // Global streak logic
        let newGlobalStreak = state.stats.streak;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1 + DEBUG_DATE_OFFSET);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (state.stats.lastActiveDate !== today) {
          if (state.stats.lastActiveDate === yesterdayStr) {
            newGlobalStreak += 1;
          } else {
            newGlobalStreak = 1;
          }
        }

        set({
          vices: state.vices.map(v =>
            v.id === id
              ? {
                ...v,
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
                history: newHistory,
                lastCheckIn: today,
              }
              : v
          ),
          stats: {
            ...state.stats,
            totalLifetimeXP: newTotalXP,
            level: newLevel,
            streak: newGlobalStreak,
            longestStreak: Math.max(state.stats.longestStreak || 0, newGlobalStreak),
            lastActiveDate: today,
            dailyXP: updatedDailyXP,
          },
        });

        return { xp: xpGained, leveledUp, newLevel };
      },

      checkMissedViceDays: () => {
        const state = get();
        const today = getTodayDate();

        const updatedVices = state.vices.map(vice => {
          if (!vice.lastCheckIn) return vice; // Never checked in yet

          // Calculate missed days between lastCheckIn and today
          const lastDate = new Date(vice.lastCheckIn);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 1) return vice; // No missed days (yesterday or today)

          // Mark all missed days as relapsed
          const newHistory = { ...vice.history };
          for (let i = 1; i < diffDays; i++) {
            const missedDate = new Date(lastDate);
            missedDate.setDate(lastDate.getDate() + i);
            const missedDateStr = missedDate.toISOString().split('T')[0];
            if (!newHistory[missedDateStr]) {
              newHistory[missedDateStr] = 'relapsed';
            }
          }

          // Streak is broken if any days were missed
          return {
            ...vice,
            history: newHistory,
            currentStreak: 0, // Reset streak due to missed days
          };
        });

        set({ vices: updatedVices });
      },

      debugResetAll: () => {
        set({
          tasks: [],
          goals: [],
          habits: [],
          vices: [],
          stats: {
            currentXP: 0,
            totalLifetimeXP: 0,
            level: 1,
            streak: 0,
            longestStreak: 0,
            lastActiveDate: null, // Reset this so streak logic works like new
            dailyXP: [],
            taskHistory: [],
          },
          debugLeagueOverride: undefined,
          theme: 'dark'
        });
        // Also reset debug offset
        DEBUG_DATE_OFFSET = 0;
        console.log("Full Reset Completed");
      },

      checkAndGenerateDailyTasks: () => {
        const state = get();
        const today = getTodayDate();
        const todayStart = new Date(today).getTime();
        const startOfWeek = getStartOfWeek();

        // --- GLOBAL STREAK RESET CHECK ---
        let newGlobalStreak = state.stats.streak;
        if (state.stats.streak > 0) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1 + DEBUG_DATE_OFFSET);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (state.stats.lastActiveDate !== yesterdayStr && state.stats.lastActiveDate !== today) {
            console.log("Global streak broken! Last active:", state.stats.lastActiveDate, "Yesterday:", yesterdayStr);
            newGlobalStreak = 0;
          }
        }

        // --- HABIT STREAK RESET CHECK ---
        let habitsUpdated = false;
        let updatedHabits = state.habits.map(habit => {
          let needsUpdate = false;
          let updatedHabit = { ...habit };

          // Check for streak reset (missed a day)
          if (habit.streak > 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1 + DEBUG_DATE_OFFSET);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (habit.lastCompletedDate !== yesterdayStr && habit.lastCompletedDate !== today) {
              needsUpdate = true;
              updatedHabit.streak = 0;
              updatedHabit.history = [...(updatedHabit.history || []), { date: yesterdayStr, value: 0 }];
            }
          }

          // Reset weekly progress at start of new week for weekly habits
          if (habit.frequency === 'weekly' && habit.lastWeekReset !== startOfWeek) {
            needsUpdate = true;
            updatedHabit.weeklyProgress = 0;
            updatedHabit.lastWeekReset = startOfWeek;
          }

          if (needsUpdate) {
            habitsUpdated = true;
            return updatedHabit;
          }
          return habit;
        });

        // Archive completed tasks to history
        const completedTasksToDelete = state.tasks.filter(task => {
          if (task.completed) {
            if (!task.completedAt) return false;
            return new Date(task.completedAt).toISOString().split('T')[0] !== today;
          }
          return false;
        });

        const historyUpdates: Record<string, number> = {};
        completedTasksToDelete.forEach(task => {
          const date = new Date(task.completedAt!).toISOString().split('T')[0];
          historyUpdates[date] = (historyUpdates[date] || 0) + 1;
        });

        let updatedTaskHistory = [...(state.stats.taskHistory || [])];
        Object.entries(historyUpdates).forEach(([date, count]) => {
          const existing = updatedTaskHistory.find(h => h.date === date);
          if (existing) {
            existing.count += count;
          } else {
            updatedTaskHistory.push({ date, count });
          }
        });

        const cleanedTasks = state.tasks.filter(task => {
          if (task.completed) {
            if (!task.completedAt) return false;
            return new Date(task.completedAt).toISOString().split('T')[0] === today;
          }
          if (task.isGoalTask || task.isHabitTask || task.dueDate === 'daily') {
            return task.createdAt >= todayStart;
          }
          return true;
        });

        let newTasks = [...cleanedTasks];
        let goalsUpdated = false;
        let updatedGoals = [...state.goals];

        // Reset weekly progress if new week for frequency goals
        updatedGoals = updatedGoals.map(g => {
          if (g.type === 'frequency' && g.params.lastWeekReset !== startOfWeek) {
            goalsUpdated = true;
            return {
              ...g,
              completed: false,
              rewardsClaimed: false,
              params: { ...g.params, weeklyProgress: 0, lastWeekReset: startOfWeek }
            };
          }
          return g;
        });

        // --- GENERATION LOGIC ---
        updatedGoals.forEach(goal => {
          if (goal.completed) return;

          let goalNeedsUpdate = false;
          let newStreak = goal.consecutiveDays;
          let streakBrokenDate = goal.streakBrokenDate;
          let previousStreak = goal.previousStreak;

          if (goal.params.frequency === 'daily' && goal.consecutiveDays > 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1 + DEBUG_DATE_OFFSET);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const doneYesterday = goal.history.some(h => h.date === yesterdayStr);
            const doneToday = goal.history.some(h => h.date === today);

            if (!doneYesterday && !doneToday) {
              previousStreak = goal.consecutiveDays;
              newStreak = 0;
              streakBrokenDate = today;
              goalNeedsUpdate = true;
            }

            if (!doneYesterday) {
              const alreadyHasEntry = goal.history.some(h => h.date === yesterdayStr);
              if (!alreadyHasEntry) {
                goal.history.push({ date: yesterdayStr, value: 0 });
              }
            }
          }

          // Update volatile fields in the local goal object reference (it's safe here as we map later if updated)
          // Actually, we use 'updatedGoals' array which is a shallow copy. 
          // If we mutate 'goal' here, it mutates the object inside the array.
          // Since we are going to set proper state, direct mutation of the object in the COPY array is fine 
          // as long as we use that copy.
          goal.consecutiveDays = newStreak;
          goal.streakBrokenDate = streakBrokenDate;
          goal.previousStreak = previousStreak;

          if (goal.type === 'progressive') {
            goal.exercises.forEach(exercise => {
              const existingTask = newTasks.find(
                t => t.goalId === goal.id &&
                  t.exerciseId === exercise.id &&
                  t.createdAt >= todayStart
              );

              if (!existingTask && goal.params.frequency === 'daily') {
                const newTask = generateGoalTask(goal, exercise);
                if (newTask) newTasks.push(newTask);
              }
            });
          }

          if (goal.type === 'accumulator' && goal.params.frequency === 'daily') {
            const existingTask = newTasks.find(
              t => t.goalId === goal.id && t.createdAt >= todayStart
            );
            if (!existingTask) {
              const newTask = generateGoalTask(goal);
              if (newTask) newTasks.push(newTask);
            }
          }

          if (goal.type === 'frequency') {
            const weeklyProgress = goal.params.weeklyProgress || 0;
            const weeklyTarget = goal.params.weeklyTarget || 3;

            if (weeklyProgress < weeklyTarget) {
              if (goal.exercises.length > 0) {
                goal.exercises.forEach(exercise => {
                  const existingTask = newTasks.find(
                    t => t.goalId === goal.id && t.exerciseId === exercise.id && t.createdAt >= todayStart
                  );
                  if (!existingTask) {
                    const newTask = generateGoalTask(goal, exercise);
                    if (newTask) newTasks.push(newTask);
                  }
                });
              } else {
                const existingTask = newTasks.find(
                  t => t.goalId === goal.id && t.createdAt >= todayStart
                );
                if (!existingTask) {
                  const newTask = generateGoalTask(goal);
                  if (newTask) newTasks.push(newTask);
                }
              }
            }
          }
        });

        updatedHabits.forEach(habit => {
          if (habit.lastCompletedDate === today) return;

          // For weekly habits, check if weekly target is already met
          if (habit.frequency === 'weekly') {
            const weeklyProgress = habit.weeklyProgress || 0;
            const weeklyTarget = habit.weeklyTarget || 3;
            if (weeklyProgress >= weeklyTarget) {
              // Weekly target met, don't generate new tasks this week
              return;
            }
          }

          if (habit.exercises.length > 0) {
            habit.exercises.forEach(exercise => {
              const existingTask = newTasks.find(
                t => t.habitId === habit.id && t.exerciseId === exercise.id && t.createdAt >= todayStart
              );
              if (!existingTask) {
                const newTask = generateHabitTask(habit, exercise);
                if (newTask) newTasks.push(newTask);
              }
            });
          } else {
            const existingTask = newTasks.find(
              t => t.habitId === habit.id && t.createdAt >= todayStart
            );
            if (!existingTask) {
              const newTask = generateHabitTask(habit);
              if (newTask) newTasks.push(newTask);
            }
          }
        });

        const finalStats = { ...state.stats, taskHistory: updatedTaskHistory };
        if (newGlobalStreak !== state.stats.streak) {
          finalStats.streak = newGlobalStreak;
        }

        set((state) => ({
          tasks: newTasks,
          goals: goalsUpdated ? updatedGoals : state.goals,
          habits: habitsUpdated ? updatedHabits : state.habits,
          stats: finalStats
        }));
      },

      getXPForNextLevel: () => {
        const { stats } = get();
        const nextLevelXP = getXPForLevel(stats.level + 1);
        return Math.ceil(nextLevelXP);
      },

      getCurrentLevelProgress: () => {
        const { stats } = get();
        const currentLevelXP = getXPForLevel(stats.level);
        const nextLevelXP = getXPForLevel(stats.level + 1);
        const xpInCurrentLevel = stats.totalLifetimeXP - currentLevelXP;
        const xpNeededForNextLevel = nextLevelXP - currentLevelXP;

        if (xpNeededForNextLevel <= 0) return 0;
        const progress = xpInCurrentLevel / xpNeededForNextLevel;
        return Math.min(Math.max(progress, 0), 1);
      },

      getWeeklyAverageXP: () => {
        const { stats } = get();
        const last7Days = getLast7Days();
        let totalXP = 0;

        last7Days.forEach(date => {
          const dayData = stats.dailyXP.find(d => d.date === date);
          if (dayData) {
            totalXP += dayData.xp;
          }
        });

        return Math.round(totalXP / 7);
      },

      getMonthlyXP: () => {
        const { stats } = get();
        const currentMonthDays = getCurrentMonthDays();
        let totalXP = 0;

        currentMonthDays.forEach(date => {
          const dayData = stats.dailyXP.find(d => d.date === date);
          if (dayData) {
            totalXP += dayData.xp;
          }
        });

        return totalXP;
      },

      // DEBUGGING TOOL
      debugIncreaseStreak: (days: number) => {
        set(state => ({
          stats: {
            ...state.stats,
            streak: state.stats.streak + days
          }
        }));
      },

      debugSetLeague: (league: League) => {
        // We can't easily force the computed league without changing XP.
        // So we'll add enough XP to reach that league's threshold.
        const thresholds = LEAGUE_THRESHOLDS;
        const targetXP = thresholds[league];
        const currentXP = get().getMonthlyXP();
        const diff = targetXP - currentXP;

        if (diff > 0) {
          set(state => ({
            stats: {
              ...state.stats,
              dailyXP: [
                ...state.stats.dailyXP,
                { date: new Date().toISOString().split('T')[0], xp: diff }
              ]
            }
          }));
        } else {
          // Reset to 0 then add target (hacky but works for debug)
          // Actually, reducing XP is hard with the current append-only log structure without filtering.
          // For now, let's just assume we only go UP or clear everything. 
          // A better way for VISUAL debug is to override the return of getLeague, but that requires state.
          // Let's just create a temporary override in the store if needed, or better:
          // Just accept we only test going UP for now, or use a "visual override" state field.
        }
      },

      debugCycleLeague: (direction: 'next' | 'prev') => {
        const tiers: League[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'champion', 'legend', 'immortal'];

        // Use override for visual testing - get current override or actual league
        const state = get();
        const currentLeague = state.debugLeagueOverride || state.getLeague();
        const index = tiers.indexOf(currentLeague);
        let nextIndex = direction === 'next' ? index + 1 : index - 1;

        if (nextIndex >= tiers.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = tiers.length - 1;

        const nextLeague = tiers[nextIndex];

        // Simply set the override - no XP manipulation needed for visual testing
        set({ debugLeagueOverride: nextLeague });
      },

      getLeague: () => {
        const state = get();
        if (state.debugLeagueOverride) return state.debugLeagueOverride;

        const monthlyXP = state.getMonthlyXP();
        if (monthlyXP >= LEAGUE_THRESHOLDS.immortal) return 'immortal';
        if (monthlyXP >= LEAGUE_THRESHOLDS.legend) return 'legend';
        if (monthlyXP >= LEAGUE_THRESHOLDS.champion) return 'champion';
        if (monthlyXP >= LEAGUE_THRESHOLDS.grandmaster) return 'grandmaster';
        if (monthlyXP >= LEAGUE_THRESHOLDS.master) return 'master';
        if (monthlyXP >= LEAGUE_THRESHOLDS.diamond) return 'diamond';
        if (monthlyXP >= LEAGUE_THRESHOLDS.platinum) return 'platinum';
        if (monthlyXP >= LEAGUE_THRESHOLDS.gold) return 'gold';
        if (monthlyXP >= LEAGUE_THRESHOLDS.silver) return 'silver';
        return 'bronze';
      },

      getLeagueProgress: () => {
        const monthlyXP = get().getMonthlyXP();
        const currentLeague = get().getLeague();

        const thresholds = LEAGUE_THRESHOLDS;
        const tiers: League[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'champion', 'legend', 'immortal'];

        // If we are at max league (immortal), show full progress or progress to next theoretical infinite tier
        if (currentLeague === 'immortal') {
          return { current: monthlyXP, needed: thresholds.immortal, nextLeague: null, percent: 100 };
        }

        const currentIndex = tiers.indexOf(currentLeague);
        const nextLeague = tiers[currentIndex + 1];
        const currentThreshold = thresholds[currentLeague];
        const nextThreshold = thresholds[nextLeague];

        const xpInCurrentTier = monthlyXP - currentThreshold;
        const xpNeededForNextTier = nextThreshold - currentThreshold;

        const progress = (xpInCurrentTier / xpNeededForNextTier) * 100;
        const minProgress = monthlyXP > 0 ? Math.max(3, progress) : 0;

        return {
          current: monthlyXP,
          needed: nextThreshold,
          nextLeague: nextLeague,
          percent: Math.min(Math.max(minProgress, 0), 100)
        };
      },



      debugAddXP: (amount: number) => {
        const state = get();
        const today = getTodayDate();
        const newTotalXP = state.stats.totalLifetimeXP + amount;
        const newLevel = calculateLevel(newTotalXP);

        const updatedDailyXP = [...state.stats.dailyXP];
        const todayEntry = updatedDailyXP.find(d => d.date === today);
        if (todayEntry) {
          todayEntry.xp += amount;
        } else {
          updatedDailyXP.push({ date: today, xp: amount });
        }

        set({
          debugLeagueOverride: undefined, // Clear override so XP determines league
          stats: {
            ...state.stats,
            currentXP: state.stats.currentXP + amount,
            totalLifetimeXP: newTotalXP,
            level: newLevel,
            dailyXP: updatedDailyXP,
          },
        });
      },

      debugAdvanceDay: () => {
        setDebugDateOffset(DEBUG_DATE_OFFSET + 1); // Increment and persist
        get().checkAndGenerateDailyTasks(); // Run daily logic for the "new" day

        // Trigger a dummy update to force re-render
        set((state) => ({ theme: state.theme }));
      },

      getGoalTasks: () => {
        return get().tasks.filter(t => t.isGoalTask);
      },

      getCustomTasks: () => {
        return get().tasks.filter(t => !t.isGoalTask && !t.isHabitTask);
      },

      getHabitTasks: () => {
        return get().tasks.filter(t => t.isHabitTask);
      },
    }),
    {
      name: 'questlife-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.theme === 'dark');
        }
      },
    }
  )
);

// Initialize dark mode
document.documentElement.classList.add('dark');
