import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, X, CheckCircle, Circle, RotateCcw, Check, Target, Trophy } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StreakCelebration } from './StreakCelebration';
import { StreakFlame } from './StreakFlame';

interface FullScreenCalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DayPopupData {
  date: string;
  xp: number;
}

export const FullScreenCalendar = ({ isOpen, onClose }: FullScreenCalendarProps) => {
  const { stats, tasks, goals, addTask } = useGameStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dayPopup, setDayPopup] = useState<DayPopupData | null>(null);
  const [continuedTasks, setContinuedTasks] = useState<Set<string>>(new Set());

  const { days, monthLabel } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const daysInMonth: { date: string; day: number; xp: number; isToday: boolean; isPadding: boolean }[] = [];

    for (let i = 0; i < startPadding; i++) {
      daysInMonth.push({ date: '', day: 0, xp: 0, isToday: false, isPadding: true });
    }

    const today = new Date().toISOString().split('T')[0];

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = stats.dailyXP.find(d => d.date === date);
      daysInMonth.push({
        date,
        day,
        xp: dayData?.xp || 0,
        isToday: date === today,
        isPadding: false,
      });
    }

    const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return { days: daysInMonth, monthLabel };
  }, [currentMonth, stats.dailyXP]);

  // Get goals started/completed on selected date
  const selectedDayGoals = useMemo(() => {
    if (!dayPopup) return { started: [], completed: [] };

    const selectedDate = dayPopup.date;
    const dayStart = new Date(selectedDate).setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate).setHours(23, 59, 59, 999);

    const started = goals.filter(g => g.createdAt >= dayStart && g.createdAt <= dayEnd);
    const completed = goals.filter(g => g.completedAt && g.completedAt >= dayStart && g.completedAt <= dayEnd);

    return { started, completed };
  }, [dayPopup, goals]);

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setDayPopup(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setDayPopup(null);
  };

  const getIntensity = (xp: number): string => {
    if (xp === 0) return 'bg-muted/30';
    if (xp < 25) return 'bg-primary/20';
    if (xp < 50) return 'bg-primary/40';
    if (xp < 100) return 'bg-primary/60';
    return 'bg-primary/90';
  };

  const today = new Date().toISOString().split('T')[0];

  // Get tasks for selected date
  const selectedDayTasks = useMemo(() => {
    if (!dayPopup) return { completed: [], incomplete: [] };

    const dayStart = new Date(dayPopup.date).setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayPopup.date).setHours(23, 59, 59, 999);

    const completed = tasks.filter(t =>
      t.completed &&
      t.completedAt &&
      t.completedAt >= dayStart &&
      t.completedAt <= dayEnd
    );

    const incomplete = tasks.filter(t =>
      !t.completed &&
      t.createdAt >= dayStart &&
      t.createdAt <= dayEnd
    );

    return { completed, incomplete };
  }, [dayPopup, tasks]);

  const handleContinueTask = (taskId: string, title: string, difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'boss') => {
    if (continuedTasks.has(taskId)) return;
    addTask(title, difficulty);
    setContinuedTasks(prev => new Set(prev).add(taskId));
  };

  const isCurrentDay = dayPopup?.date === today;

  const handleDayClick = (date: string, xp: number) => {
    setDayPopup({ date, xp });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background z-50 overflow-auto"
        >
          {/* Header */}
          <div className="sticky top-0 glass-strong border-b border-border/50 z-10">
            <div className="flex items-center justify-between p-4 max-w-screen-lg mx-auto">
              <div className="flex items-center gap-3">
                <StreakFlame streak={stats.streak} size="sm" animated={true} />
                <div>
                  <h1 className="font-heading font-bold text-lg">Streak Calendar</h1>
                  <p className="text-xs text-muted-foreground">
                    {stats.streak} day streak • {stats.dailyXP.length} active days
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="max-w-screen-lg mx-auto p-4 pb-20">
            {/* Streak Celebration Hero */}
            <div className="mb-8">
              <StreakCelebration streak={stats.streak} />
            </div>

            {/* Streak Calendar Component */}
            <div className="mb-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goToPrevMonth}
                  className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="font-heading font-semibold text-xl">{monthLabel}</h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={i} className="text-xs text-muted-foreground text-center font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {days.map((day, i) => (
                  <motion.button
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    onClick={() => !day.isPadding && handleDayClick(day.date, day.xp)}
                    disabled={day.isPadding}
                    className={cn(
                      "aspect-[0.85] w-full rounded-xl flex flex-col items-center justify-between p-1 transition-all duration-300 border relative",
                      day.isPadding && "opacity-0 pointer-events-none",
                      !day.isPadding && (() => {
                        if (day.xp > 0) {
                          if (day.xp > 100) return "bg-orange-500 border-orange-400 shadow-orange-500/20 shadow-lg text-white";
                          if (day.xp > 50) return "bg-orange-400 border-orange-300 text-white";
                          return "bg-orange-300 border-orange-200 text-white";
                        } else if (day.isToday) {
                          return "bg-muted/30 border-orange-500 border-2 text-foreground";
                        }
                        return "bg-muted/10 border-white/5 text-muted-foreground hover:bg-white/5";
                      })(),
                      !day.isPadding && "hover:scale-105 cursor-pointer active:scale-95"
                    )}
                  >
                    {!day.isPadding && (
                      <>
                        {/* Date Label (small on top) */}
                        <span className="text-[10px] font-bold opacity-80">
                          {day.day}
                        </span>

                        {/* Big Checkmark or Dot */}
                        <div className="flex-1 flex items-center justify-center">
                          {day.xp > 0 ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <Check className="w-6 h-6 stroke-[4]" />
                            </motion.div>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />
                          )}
                        </div>
                      </>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-8">
                <span>Less</span>
                <div className="flex gap-1">
                  {['bg-muted/10', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500'].map((color, i) => (
                    <div key={i} className={cn("w-5 h-5 rounded-md", color)} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Day Stats Popup */}
          <AnimatePresence>
            {dayPopup && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDayPopup(null)}
                  className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100]"
                />

                {/* Popup - Properly centered */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                >
                  <div className="glass-strong rounded-2xl border border-border/50 w-full max-w-md max-h-[80vh] overflow-auto">
                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-heading font-semibold">
                          {new Date(dayPopup.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {dayPopup.xp > 0 ? `${dayPopup.xp} XP earned` : 'No activity'}
                        </p>
                      </div>
                      <button
                        onClick={() => setDayPopup(null)}
                        className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Stats Summary */}
                      <div className="flex gap-3">
                        <div className="flex-1 p-3 rounded-xl bg-success/10 border border-success/20 text-center">
                          <p className="font-mono text-xl font-bold text-success">
                            {selectedDayTasks.completed.length}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Completed</p>
                        </div>
                        <div className="flex-1 p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
                          <p className="font-mono text-xl font-bold">
                            {selectedDayTasks.incomplete.length}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Incomplete</p>
                        </div>
                      </div>

                      {/* Goals Started */}
                      {selectedDayGoals.started.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-success" />
                            Goals Started ({selectedDayGoals.started.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedDayGoals.started.map(goal => (
                              <div
                                key={goal.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20"
                              >
                                <Target className="w-4 h-4 text-success shrink-0" />
                                <span className="text-sm flex-1 truncate">{goal.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Goals Achieved */}
                      {selectedDayGoals.completed.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-rank-gold" />
                            Goals Achieved ({selectedDayGoals.completed.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedDayGoals.completed.map(goal => (
                              <div
                                key={goal.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-rank-gold/10 border border-rank-gold/20"
                              >
                                <Trophy className="w-4 h-4 text-rank-gold shrink-0" />
                                <span className="text-sm flex-1 truncate">{goal.title}</span>
                                <span className="text-xs font-mono text-rank-gold">+1000xp</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Completed Tasks */}
                      {selectedDayTasks.completed.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-success" />
                            Completed ({selectedDayTasks.completed.length})
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-auto">
                            {selectedDayTasks.completed.map(task => (
                              <div
                                key={task.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20"
                              >
                                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                                <span className="text-sm line-through text-muted-foreground flex-1 truncate">
                                  {task.title}
                                </span>
                                <span className="text-xs font-mono text-xp">+{task.xp}xp</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Incomplete Tasks */}
                      {selectedDayTasks.incomplete.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                            Incomplete ({selectedDayTasks.incomplete.length})
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-auto">
                            {selectedDayTasks.incomplete.map(task => {
                              const isContinued = continuedTasks.has(task.id);
                              return (
                                <div
                                  key={task.id}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                                >
                                  <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <span className="text-sm flex-1 truncate">{task.title}</span>
                                  {isCurrentDay ? (
                                    <span className="text-xs text-muted-foreground">Today</span>
                                  ) : isContinued ? (
                                    <span className="text-xs text-success flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Continued
                                    </span>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleContinueTask(task.id, task.title, task.difficulty)}
                                      className="text-xs h-7 px-2 gap-1 text-primary hover:text-primary"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      Continue
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selectedDayTasks.completed.length === 0 && selectedDayTasks.incomplete.length === 0 && selectedDayGoals.started.length === 0 && selectedDayGoals.completed.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No activity on this day</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
