import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal, useGameStore, getTodayDate, DEBUG_DATE_OFFSET } from '@/stores/gameStore';
import { Target, Dumbbell, Brain, BookOpen, Trash2, ChevronDown, Flame, BarChart3, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LineGraph } from './LineGraph';

interface GoalCardProps {
  goal: Goal;
  index: number;
}

const templateIcons = {
  fitness: Dumbbell,
  meditation: Brain,
  reading: BookOpen,
  custom: Target,
};

const templateColors = {
  fitness: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
  meditation: 'text-purple-500 border-purple-500/30 bg-purple-500/10',
  reading: 'text-blue-500 border-blue-500/30 bg-blue-500/10',
  custom: 'text-success border-success/30 bg-success/10',
};

const typeLabels = {
  progressive: 'Progressive',
  accumulator: 'Volume',
  frequency: 'Frequency',
};

export const GoalCard = ({ goal, index }: GoalCardProps) => {
  const { deleteGoal, moveGoalToHabit, claimGoalRewards } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const Icon = templateIcons[goal.template || 'custom'];
  const colorClasses = templateColors[goal.template || 'custom'];

  // Calculate progress based on goal type - FIXED: Only count completed history entries
  let progress = 0;
  let progressLabel = '';

  if (goal.type === 'progressive') {
    // For progressive: calculate based on current/target amounts
    // Progress = startAmount/targetAmount as BASELINE (e.g. 10/50 = 20%)
    if (goal.exercises.length > 0) {
      let totalProgress = 0;
      goal.exercises.forEach(exercise => {
        const current = exercise.currentAmount;
        const target = exercise.targetAmount;
        // Progress = current/target * 100 (gives 20% for 10/50)
        const exerciseProgress = (current / target) * 100;
        totalProgress += exerciseProgress;
      });
      progress = totalProgress / goal.exercises.length;

      // Show primary exercise progress
      const mainExercise = goal.exercises[0];
      progressLabel = `${mainExercise.currentAmount}/${mainExercise.targetAmount} ${mainExercise.unit}`;
    }
  } else if (goal.type === 'accumulator') {
    const total = goal.params.totalCompleted || 0;
    const target = goal.params.targetValue || 100;
    progress = (total / target) * 100;
    progressLabel = `${total}/${target} ${goal.params.unit || 'items'}`;
  } else if (goal.type === 'frequency') {
    if (goal.params.frequency === 'daily') {
      const isDoneToday = goal.history.some(h => h.date === getTodayDate());
      progress = isDoneToday ? 100 : 0;
      progressLabel = isDoneToday ? 'Completed Today' : 'Daily Goal';
    } else {
      const weeklyProgress = goal.params.weeklyProgress || 0;
      const weeklyTarget = goal.params.weeklyTarget || 3;
      progress = (weeklyProgress / weeklyTarget) * 100;
      progressLabel = `${weeklyProgress}/${weeklyTarget} this week`;
    }

    // If frequency has exercises with intensity, show that too
    if (goal.exercises.length > 0) {
      const exercise = goal.exercises[0];
      progressLabel += ` • ${exercise.currentAmount} ${exercise.unit}`;
    }
  }

  const handleMoveToHabits = () => {
    moveGoalToHabit(goal.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "glass rounded-xl overflow-hidden transition-all border-2",
        goal.completed ? "border-rank-gold/50 bg-rank-gold/5" : "border-border/50",
        colorClasses.split(' ')[1] // Get border color
      )}
    >
      {/* Completed Banner */}
      {goal.completed && (
        <div className="bg-gradient-to-r from-rank-gold/20 to-rank-gold/10 px-4 py-2 flex items-center justify-between border-b border-rank-gold/20">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-rank-gold" />
            <span className="text-xs font-semibold text-rank-gold">GOAL ACHIEVED! +1000 XP</span>
          </div>
          <div className="flex gap-2">
            {!goal.rewardsClaimed && (
              <Button
                size="sm"
                onClick={(e) => { e.stopPropagation(); claimGoalRewards(goal.id); }}
                className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white font-bold animate-pulse"
              >
                Claim 1000 XP
              </Button>
            )}
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleMoveToHabits(); }}
              className="h-7 text-xs bg-gradient-to-r from-rank-gold to-yellow-500 text-black font-semibold hover:opacity-90 transition-opacity"
            >
              Move to Habits <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            colorClasses
          )}>
            <Icon className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-heading font-semibold text-sm sm:text-base truncate",
                goal.completed && "text-rank-gold"
              )}>
                {goal.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                {typeLabels[goal.type]}
              </span>
              {/* Show streak badge for ALL daily goals */}
              {goal.params.frequency === 'daily' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {goal.consecutiveDays > 0 ? `${goal.consecutiveDays} day streak` : 'Start streak!'}
                </span>
              )}
              {/* For weekly goals, still show if they have a streak */}
              {goal.params.frequency === 'weekly' && goal.consecutiveDays > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {goal.consecutiveDays} week streak
                </span>
              )}

              {/* Shame Badge Logic */}
              {(() => {
                if (!goal.streakBrokenDate) return null;
                const today = new Date(getTodayDate());
                const brokenDate = new Date(goal.streakBrokenDate);
                // Calculate diff in days
                const diffTime = Math.abs(today.getTime() - brokenDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 3) {
                  return (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive flex items-center gap-1 font-bold animate-pulse">
                      Streak Broken (Prev: {goal.previousStreak})
                    </span>
                  );
                }
                return null;
              })()}
              {goal.exercises.length > 1 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {goal.exercises.length} tasks
                </span>
              )}
            </div>

            {/* Progress bar */}
            {!goal.completed && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{progressLabel}</span>
                  <span>{Math.round(Math.min(100, Math.max(0, progress)))}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      goal.template === 'fitness' && "bg-gradient-to-r from-orange-500 to-red-500",
                      goal.template === 'reading' && "bg-gradient-to-r from-blue-500 to-cyan-500",
                      goal.template === 'meditation' && "bg-gradient-to-r from-purple-500 to-pink-500",
                      goal.template === 'custom' && "bg-gradient-to-r from-success to-emerald-400",
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Expand button */}
          <div className="flex items-center gap-1">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded content - History */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/30"
          >
            <div className="p-4 space-y-3">
              {/* Exercises list (for progressive goals) */}
              {goal.exercises.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Tasks:</div>
                  {goal.exercises.map((exercise) => {
                    const exerciseHistory = goal.history.filter(h => h.exerciseId === exercise.id);
                    const exerciseProgress = exerciseHistory.length > 0
                      ? ((exercise.currentAmount - exercise.startAmount) / (exercise.targetAmount - exercise.startAmount)) * 100
                      : 0;
                    return (
                      <div key={exercise.id} className="p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{exercise.name}</span>
                          <span className="font-mono text-muted-foreground">
                            {exercise.currentAmount}/{exercise.targetAmount} {exercise.unit}
                          </span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-success rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, exerciseProgress))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold font-mono">
                    {goal.history.length}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Sessions</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold font-mono">
                    {goal.consecutiveDays}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Streak</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold font-mono">
                    {Math.round(Math.min(100, Math.max(0, progress)))}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">Complete</div>
                </div>
              </div>

              {/* History graph */}
              {goal.history.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BarChart3 className="w-4 h-4" />
                    Recent Activity
                  </div>
                  <div className={cn(
                    "h-24 w-full rounded-lg border p-2",
                    goal.template === 'fitness' && "bg-orange-500/5 border-orange-500/10",
                    goal.template === 'reading' && "bg-blue-500/5 border-blue-500/10",
                    goal.template === 'meditation' && "bg-purple-500/5 border-purple-500/10",
                    goal.template === 'custom' && "bg-emerald-500/5 border-emerald-500/10",
                  )}>
                    <LineGraph
                      data={goal.history.slice(-14).map(h => ({ date: h.date, value: h.value }))}
                      color={
                        goal.template === 'fitness' ? 'orange' :
                          goal.template === 'reading' ? 'blue' :
                            goal.template === 'meditation' ? 'purple' : 'green'
                      }
                      height={80}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No activity yet. Complete your first task!
                </div>
              )}

              {/* Move to Habits button (for completed goals) */}
              {goal.completed && (
                <Button
                  onClick={handleMoveToHabits}
                  className="w-full bg-gradient-to-r from-rank-gold to-yellow-500 text-black font-semibold"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Move to Habits
                </Button>
              )}

              {/* Delete button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Goal
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
