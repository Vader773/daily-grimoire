import { Task, Difficulty, useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Check, Timer, Zap, Coffee, FileText, Dumbbell, Sword, Crown, Target, Sparkles, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { TaskTimer } from './TaskTimer';
import { OverclockModal } from './OverclockModal';
import { AccumulatorModal } from './AccumulatorModal';
import { EditTaskModal } from './EditTaskModal';
import { toast } from 'sonner';

interface TaskCardProps {
  task: Task;
  index: number;
  onComplete: (xp: number, leveledUp: boolean) => void;
  isGoalTask?: boolean;
  isHabitTask?: boolean;
}

const difficultyConfig: Record<Difficulty, {
  label: string;
  colorClass: string;
  bgClass: string;
  icon: React.ReactNode;
}> = {
  trivial: {
    label: 'TRIVIAL',
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
    icon: <Coffee className="w-3 h-3" />
  },
  easy: {
    label: 'EASY',
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
    icon: <FileText className="w-3 h-3" />
  },
  medium: {
    label: 'MEDIUM',
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10',
    icon: <Dumbbell className="w-3 h-3" />
  },
  hard: {
    label: 'HARD',
    colorClass: 'text-rank-bronze',
    bgClass: 'bg-rank-bronze/10',
    icon: <Sword className="w-3 h-3" />
  },
  boss: {
    label: 'BOSS',
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/10',
    icon: <Crown className="w-3 h-3" />
  },
};

export const TaskCard = ({ task, index, onComplete, isGoalTask, isHabitTask }: TaskCardProps) => {
  const {
    completeTask,
    completeGoalTask,
    completeHabitTask,
    deleteTask,
    startTimer,
    completeTimer,
  } = useGameStore();

  const [isCompleting, setIsCompleting] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showOverclock, setShowOverclock] = useState(false);
  const [showAccumulator, setShowAccumulator] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const config = difficultyConfig[task.difficulty];
  const goal = task.goalId ? useGameStore(state => state.goals.find(g => g.id === task.goalId)) : null;
  const habit = task.habitId ? useGameStore(state => state.habits.find(h => h.id === task.habitId)) : null;

  const getWeeklyProgress = () => {
    if (!habit || habit.frequency !== 'weekly') return null;
    if (!habit.history || habit.history.length === 0) return 0;

    // Calculate completions this week (starting Monday)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const mondayStr = monday.toISOString().split('T')[0];

    return habit.history.filter(h => h.date >= mondayStr).length;
  };

  const weeklyCount = getWeeklyProgress();

  // Calculate Percentage for Goal Tasks
  const getProgressPercentage = () => {
    if (!task.isGoalTask || !task.finalGoal) return null;
    const current = task.currentProgress || task.requiredAmount || 0;
    const target = task.finalGoal || 1;

    if (task.goalType === 'accumulator') {
      return Math.round((current / target) * 100);
    }
    return null;
  };

  const percentage = getProgressPercentage();
  const isCompleted = task.completed;

  // Check if task can be completed
  const canComplete = !task.timerEnabled || task.timerCompleted;

  const handleComplete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (task.completed || !canComplete) return;

    // For accumulator tasks, show the progress modal
    if (task.goalType === 'accumulator' && goal) {
      setShowAccumulator(true);
      return;
    }

    setIsCompleting(true);
    setShowParticles(true);

    setTimeout(() => {
      let result;
      if (task.isGoalTask && task.goalId) {
        result = completeGoalTask(task.id);

        // Check if this task completion finished the goal (compare exercises to targets)
        // We need to re-fetch the goal after completion to check its status
        const updatedGoal = useGameStore.getState().goals.find(g => g.id === task.goalId);
        if (updatedGoal?.completed && updatedGoal.completedAt) {
          // Goal was just completed! Show the jackpot toast
          toast.success('🔥 GOAL DESTROYED! +1000 XP', {
            description: `You crushed "${updatedGoal.title}"!`,
            duration: 5000,
          });
        }
      } else if (task.isHabitTask && task.habitId) {
        result = completeHabitTask(task.id);
      } else {
        result = completeTask(task.id);
      }
      onComplete(result.xp, result.leveledUp);
    }, 300);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  const handleTimerStart = () => {
    startTimer(task.id);
  };

  const handleTimerComplete = () => {
    completeTimer(task.id);
  };

  const handleOverclock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOverclock(true);
  };

  const showOverclockButton = task.completed && (task.goalType === 'progressive' || task.goalType === 'frequency') && !task.overclocked && task.requiredAmount;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{ opacity: 0, x: -100, scale: 0.9 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
          layout: { duration: 0.3 }
        }}
        className={cn(
          "relative group glass rounded-2xl p-4 transition-all",
          isCompleting && "glow-success",
          task.isGoalTask && "bg-success/5 border-l-4 border-l-success",
          task.isHabitTask && "bg-purple-500/5 border-l-4 border-l-purple-500",
          !task.isGoalTask && !task.isHabitTask && "bg-blue-500/5 border-l-4 border-l-blue-500"
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4 relative">
          {/* Come back tomorrow overlay for weekly habits/goals */}
          {task.completed && ((habit && habit.frequency === 'weekly') || (goal && goal.params?.frequency === 'weekly')) && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-2xl -m-2 pointer-events-none">
              <span className="font-heading font-bold text-sm text-foreground/80 transform -rotate-2 px-3 py-1 bg-background/80 rounded-lg border border-border/50 shadow-sm">
                Come back Tomorrow
              </span>
            </div>
          )}

          {/* Checkbox Button */}
          <button
            onClick={handleComplete}
            disabled={task.completed || !canComplete}
            className={cn(
              "relative flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all mt-0.5",
              task.completed
                ? task.isGoalTask
                  ? "bg-success border-success"
                  : task.isHabitTask
                    ? "bg-purple-500 border-purple-500"
                    : "bg-blue-500 border-blue-500"
                : canComplete
                  ? task.isGoalTask
                    ? "border-success/30 hover:border-success hover:bg-success/10"
                    : task.isHabitTask
                      ? "border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10"
                      : "border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10"
                  : "border-muted-foreground/20 cursor-not-allowed opacity-50",
              task.completed && "opacity-50"
            )}
          >
            <AnimatePresence>
              {(task.completed || isCompleting) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Particle burst effect */}
            {showParticles && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success"
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * Math.PI * 2) / 8) * 25,
                      y: Math.sin((i * Math.PI * 2) / 8) * 25,
                      opacity: [1, 0],
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                ))}
              </>
            )}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className={cn("flex-1", task.completed && !habit?.weeklyTarget && "opacity-50 line-through decoration-border")}>
                <p className={cn("font-semibold text-sm sm:text-base transition-all break-words",
                  task.completed && habit?.weeklyTarget && "text-muted-foreground"
                )}>
                  {task.title}
                </p>
                {habit && habit.frequency === 'weekly' && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400">
                      Progress: {weeklyCount}/{habit.weeklyTarget || 3}
                    </span>
                    {task.completed && (
                      <span className="text-[10px] text-muted-foreground">Done for today</span>
                    )}
                  </div>
                )}
                {task.finalGoal && task.goalTitle && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    Goal: {task.finalGoal} {task.unit} • {task.goalTitle}
                  </p>
                )}
              </div>

              {/* Actions: Overclock, Edit, Delete */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Overclock - needs opacity-100 to override parent dimming */}
                {showOverclockButton && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleOverclock}
                    className="py-1.5 px-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs flex items-center gap-1 transition-all shadow-lg shadow-yellow-500/30 !opacity-100"
                    style={{ opacity: 1 }}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Overclock</span>
                  </motion.button>
                )}

                {/* Edit button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 rounded-lg hover:bg-muted/10 text-muted-foreground hover:text-primary transition-all"
                >
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Delete button */}
                <button
                  onClick={handleDelete}
                  className="opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Badges and Metadata */}
            <div className={cn("flex flex-wrap items-center gap-2", task.completed && "opacity-50")}>
              {/* Goal task indicator */}
              {isGoalTask && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-success px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
                  <Target className="w-3 h-3" />
                  {task.dueDate === 'daily' ? 'Daily' : 'Weekly'}
                </span>
              )}

              {/* Difficulty Badge */}
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                config.bgClass,
                config.colorClass
              )}>
                {config.icon}
                {config.label} +{task.xp}XP
              </span>

              {/* Percentage Badge */}
              {percentage !== null && !isCompleted && (
                <span className="flex items-center gap-0.5 text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                  <Target className="w-2.5 h-2.5" />
                  {percentage}%
                </span>
              )}

              {/* Timer Badge */}
              {task.timerEnabled && !task.timerStartedAt && !task.timerCompleted && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  <Timer className="w-3 h-3" />
                  Focus Required
                </span>
              )}
            </div>

            {/* Timer Component */}
            {task.timerEnabled && !task.completed && (
              <div className="pt-2">
                <TaskTimer
                  duration={task.timerDuration || 0}
                  startedAt={task.timerStartedAt}
                  onStart={handleTimerStart}
                  onComplete={handleTimerComplete}
                  isCompleted={task.timerCompleted || false}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <OverclockModal
        isOpen={showOverclock}
        onClose={() => setShowOverclock(false)}
        taskId={task.id}
        requiredAmount={task.requiredAmount || 0}
        unit={task.unit || 'reps'}
      />

      {goal && (
        <AccumulatorModal
          isOpen={showAccumulator}
          onClose={() => setShowAccumulator(false)}
          taskId={task.id}
          goalTitle={goal.title}
          unit={goal.params.unit || 'items'}
        />
      )}

      <EditTaskModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        task={task}
      />
    </>
  );
};
