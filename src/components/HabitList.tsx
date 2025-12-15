import { useState } from 'react';
import { useGameStore, Habit } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, Trash2, Flame, Trophy, Plus, X, Check, ChevronDown, BarChart3, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineGraph } from './LineGraph';

// Empty state component
const EmptyHabitState = () => (
  <div className="text-center py-12">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
        <Repeat className="w-10 h-10 text-purple-500/50" />
      </div>
      <div>
        <h3 className="font-heading font-semibold text-lg text-muted-foreground">No Habits Yet</h3>
        <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs mx-auto">
          Tap the <span className="text-purple-500 font-semibold">+</span> button below to create your first habit!
        </p>
      </div>
    </motion.div>
  </div>
);

// Habit card component
const HabitCard = ({ habit, index, onComplete, onDelete }: {
  habit: Habit;
  index: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const completedToday = habit.lastCompletedDate === today;

  // Calculate weekly progress
  const getWeeklyProgress = () => {
    if (habit.frequency !== 'weekly') return 0;
    if (!habit.history || habit.history.length === 0) return 0;

    // Calculate completions since last Monday
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    // Filter history for dates >= monday
    // Note: string comparison works if format is YYYY-MM-DD
    const mondayStr = monday.toISOString().split('T')[0];

    return habit.history.filter(h => h.date >= mondayStr).length;
  };

  const weeklyProgress = getWeeklyProgress();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      // REMOVED opacity-60 and completedToday check for dimming
      className={cn(
        "glass rounded-xl overflow-hidden transition-all border-2 border-purple-500/30",
        completedToday && "bg-purple-500/5"
      )}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          {/* Status indicator REMOVED as per request - habits tracked via Tasks tab */}

          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500">
            <Repeat className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className={cn(
              "font-heading font-semibold",
              // REMOVED opacity-80
            )}>{habit.title}</h3>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                {habit.frequency === 'daily'
                  ? 'Daily'
                  : `${weeklyProgress}/${habit.weeklyTarget} this week`
                }
              </span>

              {completedToday && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Done for today
                </span>
              )}

              {habit.streak > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {habit.streak} day streak
                </span>
              )}
            </div>
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

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-purple-500/30"
          >
            <div className="p-4 space-y-4">
              {/* Exercises List */}
              {habit.exercises.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Daily Tasks:</div>
                  {habit.exercises.map((exercise) => (
                    <div key={exercise.id} className="p-2 rounded-lg bg-muted/30 flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">{exercise.name}</span>
                      <span className="font-mono text-purple-400">
                        {exercise.currentAmount} {exercise.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold font-mono">
                    {habit.history?.length || 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Completions</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold font-mono">
                    {habit.streak}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Current Streak</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold font-mono">
                    {habit.longestStreak}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Best Streak</div>
                </div>
              </div>

              {/* History Graph */}
              {(habit.history && habit.history.length > 0) ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BarChart3 className="w-4 h-4" />
                    Last 2 Weeks Activity
                  </div>
                  <div className="h-20 w-full bg-purple-500/5 rounded-lg border border-purple-500/10 p-2">
                    <LineGraph
                      data={habit.history.slice(-14).map(h => ({ date: h.date, value: h.value }))}
                      color="purple"
                      height={60}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-muted-foreground py-4">
                  Complete tasks to see your history graph
                </div>
              )}
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(habit.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Habit
              </Button>
            </div >
          </motion.div >
        )}
      </AnimatePresence >
    </motion.div >
  );
};

// Create Habit Modal
const CreateHabitModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { addHabit } = useGameStore();
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [weeklyTarget, setWeeklyTarget] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHabit({
      title: title.trim(),
      exercises: [],
      frequency,
      weeklyTarget: frequency === 'weekly' ? weeklyTarget : undefined,
      history: [],
    });

    setTitle('');
    setFrequency('daily');
    setWeeklyTarget(3);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative z-10 glass-strong rounded-2xl p-6 border-2 border-purple-500/30 w-[90%] max-w-sm mx-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Repeat className="w-6 h-6 text-purple-500" />
            <h2 className="font-heading font-bold text-lg">New Habit</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Habit Name</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Meditation"
              className="h-12"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Frequency</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                  frequency === 'daily'
                    ? "bg-purple-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                  frequency === 'weekly'
                    ? "bg-purple-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Weekly
              </button>
            </div>
          </div>

          {frequency === 'weekly' && (
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Times per week</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setWeeklyTarget(num)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      weeklyTarget === num
                        ? "bg-purple-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {num}x
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={!title.trim()}
            className="w-full h-12 font-bold bg-purple-500 hover:bg-purple-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Habit
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export const HabitList = () => {
  const { habits, deleteHabit, completeHabit } = useGameStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleComplete = (habitId: string) => {
    if (completeHabit) {
      completeHabit(habitId);
    }
  };

  return (
    <div className="space-y-4">
      {habits.length === 0 ? (
        <EmptyHabitState />
      ) : (
        <>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Trophy className="w-4 h-4 text-purple-500" />
            <span>Your daily/weekly habits</span>
          </div>

          <AnimatePresence mode="popLayout">
            {habits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                index={index}
                onComplete={handleComplete}
                onDelete={deleteHabit}
              />
            ))}
          </AnimatePresence>
        </>
      )}

      <CreateHabitModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
};