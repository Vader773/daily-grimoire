import { create } from 'zustand';
// import { persist } from 'zustand/middleware'; // DISABLED FOR TESTING

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
  completedAt?: number;
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  originGoalId?: string;
  exercises: GoalExercise[];
  frequency: 'daily' | 'weekly';
  weeklyTarget?: number;
  streak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  history: { date: string; value: number; exerciseId?: string }[];
  createdAt: number;
}

export interface UserStats {
  currentXP: number;
  totalLifetimeXP: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  dailyXP: { date: string; xp: number }[];
}

interface GameState {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  stats: UserStats;
  theme: 'dark' | 'light';
  activeView: 'tasks' | 'goals' | 'habits';

  // Actions
  addTask: (title: string, difficulty: Difficulty, timerMinutes?: number) => void;
  completeTask: (id: string) => { xp: number; leveledUp: boolean; newLevel: number };
  deleteTask: (id: string) => void;
  startTimer: (id: string) => void;
  completeTimer: (id: string) => void;
  toggleTheme: () => void;
  setActiveView: (view: 'tasks' | 'goals' | 'habits') => void;

  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'consecutiveDays' | 'history'>) => void;
  deleteGoal: (id: string) => void;
  completeGoalTask: (taskId: string, actualAmount?: number) => { xp: number; leveledUp: boolean; newLevel: number; bonusXP?: number };
  overclockTask: (taskId: string, actualAmount: number) => { bonusXP: number };
  updateAccumulatorProgress: (taskId: string, amount: number) => void;
  checkAndGenerateDailyTasks: () => void;
  moveGoalToHabit: (goalId: string) => void;

  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'longestStreak'>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string) => { xp: number; leveledUp: boolean; newLevel: number };
  completeHabitTask: (taskId: string) => { xp: number; leveledUp: boolean; newLevel: number };

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

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getStartOfWeek = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  return startOfWeek.toISOString().split('T')[0];
};

const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
};

const getCurrentMonthDays = (): string[] => {
  const days: string[] = [];
  const now = new Date();
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
      finalGoal: exercise.currentAmount,
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
  // PERSISTENCE DISABLED FOR TESTING
  // persist(
  (set, get) => ({
    tasks: [],
    goals: [],
    habits: [],
    stats: {
      currentXP: 0,
      totalLifetimeXP: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      dailyXP: [],
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
      const updatedDailyXP = [...state.stats.dailyXP];
      const todayEntry = updatedDailyXP.find(d => d.date === today);
      if (todayEntry) {
        todayEntry.xp += xpGained;
      } else {
        updatedDailyXP.push({ date: today, xp: xpGained });

        // --- STREAK LOGIC FIX ---
        // If this is the FIRST task of the day (no entry existed before this push),
        // we check if we should increment streak or reset to 1.

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (state.stats.lastActiveDate === yesterdayStr) {
          // Continued streak
          newStreak += 1;
        } else if (state.stats.lastActiveDate !== today) {
          // Not yesterday, and not today (obv, since no entry existed)
          // Means we broke the streak or it's day 1.
          // However, if lastActiveDate WAS today, we wouldn't be in this 'else' block 
          // (unless we manually manipulated stats, but generally safe).
          newStreak = 1;
        }
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

        // After 3 consecutive days at this target, increase by 5%
        if (newDaysAtTarget >= 3) {
          newCurrentAmount = Math.ceil(exercise.currentAmount * 1.05);
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
              }
              : g
          ),
        }));

        // Award bonus XP for completing the goal
        // Award bonus XP for completing the goal
        // Use result.xp (task XP) + current total as base, or ensure we add to the LATEST value
        // result.xp is returned by completeTask logic? No, completeTask returns { xp: ... }
        // We are INSIDE completeTask.
        if (isGoalComplete) {
          const bonusXP = 1000;
          const currentTotalXP = get().stats.totalLifetimeXP; // This should include task XP if set() was called previously
          const newTotalXP = currentTotalXP + bonusXP;
          const newLevel = calculateLevel(newTotalXP);

          const updatedDailyXP = [...get().stats.dailyXP];
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
            // For frequency, increase intensity every 2 completed weeks (14 sessions for 7x/week)
            const sessionsForIncrease = weeklyTarget * 2;
            let newCurrentAmount = exercise.currentAmount;

            if (newDaysAtTarget >= sessionsForIncrease) {
              newCurrentAmount = Math.min(
                Math.ceil(exercise.currentAmount * 1.1), // 10% increase
                exercise.targetAmount
              );
            }

            updatedExercises = goal.exercises.map(e =>
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
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (habit.lastCompletedDate === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        if (newStreak > newLongestStreak) {
          newLongestStreak = newStreak;
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
              longestStreak: newLongestStreak,
              lastCompletedDate: today,
              history: [...(h.history || []), historyEntry]
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

      // Calculate streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = habit.streak;
      if (habit.lastCompletedDate === yesterdayStr) {
        newStreak = habit.streak + 1;
      } else if (habit.lastCompletedDate !== today) {
        newStreak = 1;
      }

      const newLongestStreak = Math.max(habit.longestStreak, newStreak);

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
          lastActiveDate: today,
          dailyXP: updatedDailyXP,
        },
      });

      return { xp: xpGained, leveledUp, newLevel };
    },

    checkAndGenerateDailyTasks: () => {
      const state = get();
      const today = getTodayDate();
      const todayStart = new Date(today).getTime();
      const startOfWeek = getStartOfWeek();

      state.goals.forEach(goal => {
        if (goal.completed) return;

        // Reset weekly progress if new week for frequency goals
        if (goal.type === 'frequency' && goal.params.lastWeekReset !== startOfWeek) {
          set((state) => ({
            goals: state.goals.map(g =>
              g.id === goal.id
                ? {
                  ...g,
                  params: { ...g.params, weeklyProgress: 0, lastWeekReset: startOfWeek }
                }
                : g
            ),
          }));
        }

        if (goal.type === 'progressive') {
          // Generate task for each exercise that doesn't have one today
          goal.exercises.forEach(exercise => {
            const existingTask = state.tasks.find(
              t => t.goalId === goal.id &&
                t.exerciseId === exercise.id &&
                !t.completed &&
                t.createdAt >= todayStart
            );

            if (!existingTask && goal.params.frequency === 'daily') {
              const newTask = generateGoalTask(goal, exercise);
              if (newTask) {
                set((state) => ({
                  tasks: [newTask, ...state.tasks],
                }));
              }
            }
          });
        }

        if (goal.type === 'accumulator' && goal.params.frequency === 'daily') {
          const existingTask = state.tasks.find(
            t => t.goalId === goal.id && !t.completed && t.createdAt >= todayStart
          );

          if (!existingTask) {
            const newTask = generateGoalTask(goal);
            if (newTask) {
              set((state) => ({
                tasks: [newTask, ...state.tasks],
              }));
            }
          }
        }

        if (goal.type === 'frequency') {
          const weeklyProgress = goal.params.weeklyProgress || 0;
          const weeklyTarget = goal.params.weeklyTarget || 3;

          if (weeklyProgress < weeklyTarget) {
            // Check if task exists for today
            const existingTask = state.tasks.find(
              t => t.goalId === goal.id && !t.completed && t.createdAt >= todayStart
            );

            if (!existingTask) {
              if (goal.exercises.length > 0) {
                goal.exercises.forEach(exercise => {
                  const newTask = generateGoalTask(goal, exercise);
                  if (newTask) {
                    set((state) => ({
                      tasks: [newTask, ...state.tasks],
                    }));
                  }
                });
              } else {
                const newTask = generateGoalTask(goal);
                if (newTask) {
                  set((state) => ({
                    tasks: [newTask, ...state.tasks],
                  }));
                }
              }
            }
          }
        }
      });

      // Generate habit tasks
      state.habits.forEach(habit => {
        // Check if habit was already completed today
        if (habit.lastCompletedDate === today) return;

        if (habit.exercises.length > 0) {
          // Generate task for each exercise
          habit.exercises.forEach(exercise => {
            const existingTask = state.tasks.find(
              t => t.habitId === habit.id && t.exerciseId === exercise.id && !t.completed && t.createdAt >= todayStart
            );

            if (!existingTask) {
              const newTask = generateHabitTask(habit, exercise);
              if (newTask) {
                set((state) => ({
                  tasks: [newTask, ...state.tasks],
                }));
              }
            }
          });
        } else {
          // Simple habit without exercises
          const existingTask = state.tasks.find(
            t => t.habitId === habit.id && !t.completed && t.createdAt >= todayStart
          );

          if (!existingTask) {
            const newTask = generateHabitTask(habit);
            if (newTask) {
              set((state) => ({
                tasks: [newTask, ...state.tasks],
              }));
            }
          }
        }
      });
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
      const currentLeague = get().getLeague();
      const tiers: League[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'champion', 'legend', 'immortal'];
      const index = tiers.indexOf(currentLeague);
      let nextIndex = direction === 'next' ? index + 1 : index - 1;

      if (nextIndex >= tiers.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = tiers.length - 1;

      const nextLeague = tiers[nextIndex];

      // To force visual update, we simply calculate needed XP and add it.
      // Downward is hard. 
      // INSTAD: Let's add a `debugLeagueOverride` to the store state? 
      // User asked for "Next league" button which "just shows the badge".
      // It's purely visual. I will add `debugLeagueOverride` to GameState.
      set(state => ({ debugLeagueOverride: nextLeague }));
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

    // DEBUGGING TOOLS
    debugIncreaseStreak: (days: number) => {
      set(state => ({
        stats: {
          ...state.stats,
          streak: state.stats.streak + days
        }
      }));
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

    getGoalTasks: () => {
      return get().tasks.filter(t => t.isGoalTask);
    },

    getCustomTasks: () => {
      return get().tasks.filter(t => !t.isGoalTask && !t.isHabitTask);
    },

    getHabitTasks: () => {
      return get().tasks.filter(t => t.isHabitTask);
    },
  })
  // PERSISTENCE DISABLED FOR TESTING
  // {
  //   name: 'questlife-storage',
  //   onRehydrateStorage: () => (state) => {
  //     if (state) {
  //       document.documentElement.classList.toggle('dark', state.theme === 'dark');
  //     }
  //   },
  // }
  // )
);

// Initialize dark mode
document.documentElement.classList.add('dark');
