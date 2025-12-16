import { useGameStore, getTodayDate } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Trophy, Flame, Target, TrendingUp, Star,
  Calendar, Award, Sparkles, CheckCircle, Clock, X,
  ChevronRight, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { StreakCelebration } from './StreakCelebration';
import { StreakFlame } from './StreakFlame';
import { LeagueBadge3D } from './LeagueBadge3D';

interface FullScreenStatsProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToStreak?: () => void; // Added prompt for navigation
  league?: any; // Accepting League type
}

export const FullScreenStats = ({ isOpen, onClose, onNavigateToStreak, league: leagueProp }: FullScreenStatsProps) => {
  const { stats, getLeague, getWeeklyAverageXP, getCurrentLevelProgress, tasks, goals, habits } = useGameStore();
  const [showHistory, setShowHistory] = useState(false);

  const league = leagueProp || getLeague();
  const weeklyAvg = getWeeklyAverageXP();
  const progress = getCurrentLevelProgress();

  // Calculate time-based stats
  const timeStats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const completedTasks = tasks.filter(t => t.completed && t.completedAt);

    const todayTasks = completedTasks.filter(t => {
      const taskDate = new Date(t.completedAt!).toISOString().split('T')[0];
      return taskDate === today;
    });

    const weekTasks = completedTasks.filter(t =>
      new Date(t.completedAt!) >= startOfWeek
    );

    const monthTasks = completedTasks.filter(t =>
      new Date(t.completedAt!) >= startOfMonth
    );

    const yearTasks = completedTasks.filter(t =>
      new Date(t.completedAt!) >= startOfYear
    );

    return {
      today: todayTasks.length,
      week: weekTasks.length,
      month: monthTasks.length,
      year: yearTasks.length,
      total: completedTasks.length,
      weeklyHabits: completedTasks.filter(t => t.isHabitTask && new Date(t.completedAt!) >= startOfWeek).length,
    };
  }, [tasks]);

  // Get completion history grouped by date
  const completionHistory = useMemo(() => {
    const completed = tasks.filter(t => t.completed && t.completedAt);
    const grouped: Record<string, typeof completed> = {};

    completed.forEach(task => {
      const date = new Date(task.completedAt!).toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(task);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 10);
  }, [tasks]);

  // Expanded League Config
  const leagueConfig: Record<string, { color: string; bg: string; icon: any }> = {
    bronze: { icon: Trophy, color: 'text-rank-bronze', bg: 'bg-rank-bronze/10' },
    silver: { icon: Trophy, color: 'text-rank-silver', bg: 'bg-rank-silver/10' },
    gold: { icon: Trophy, color: 'text-rank-gold', bg: 'bg-rank-gold/10' },
    platinum: { icon: Trophy, color: 'text-slate-300', bg: 'bg-slate-300/10' },
    diamond: { icon: Trophy, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    master: { icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-600/10' },
    grandmaster: { icon: Trophy, color: 'text-red-500', bg: 'bg-red-500/10' },
    champion: { icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    legend: { icon: Trophy, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    immortal: { icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10' }, // Changed to Crown
  };

  const currentLeague = leagueConfig[league] || leagueConfig.bronze;
  const LeagueIcon = currentLeague.icon;

  // Calculate XP for next level
  const getXPForLevel = (level: number) => Math.pow(level / 0.1, 2);
  const xpToNextLevel = Math.round(getXPForLevel(stats.level + 1) - stats.totalLifetimeXP);

  // Debug state
  // Debug state
  const debugIncreaseStreak = useGameStore(state => state.debugIncreaseStreak);
  const debugAdvanceDay = useGameStore(state => state.debugAdvanceDay);
  const debugDate = getTodayDate();

  const handleStreakClick = () => {
    onClose();
    if (onNavigateToStreak) {
      // Delay slightly to allow close animation to start/finish gracefully
      setTimeout(() => {
        onNavigateToStreak();
      }, 100);
    }
  };

  const debugCycleLeague = useGameStore(state => state.debugCycleLeague);

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
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-primary" />
                </motion.div>
                <div>
                  <h1 className="font-heading font-bold text-lg">
                    {showHistory ? 'Quest History' : 'Player Statistics'}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Level {stats.level} • {stats.totalLifetimeXP.toLocaleString()} total XP
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showHistory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(false)}
                    className="text-xs"
                  >
                    Back
                  </Button>
                )}
                <motion.div
                  className={cn("px-3 py-1 rounded-full flex items-center gap-1.5", currentLeague.bg)}
                  whileHover={{ scale: 1.05 }}
                >
                  <LeagueIcon className={cn("w-4 h-4", currentLeague.color)} />
                  <span className={cn("text-xs font-semibold capitalize", currentLeague.color)}>
                    {league}
                  </span>
                </motion.div>
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
          </div>

          <div className="max-w-screen-lg mx-auto p-4 pb-20">
            <AnimatePresence mode="wait">
              {showHistory ? (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {completionHistory.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No completed quests yet</p>
                    </div>
                  ) : (
                    completionHistory.map(([date, dateTasks]) => (
                      <div key={date} className="glass rounded-xl border border-border/50 overflow-hidden">
                        <div className="p-3 border-b border-border/30 bg-muted/20">
                          <h4 className="text-sm font-medium">
                            {new Date(date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {dateTasks.length} quest{dateTasks.length > 1 ? 's' : ''} completed
                          </p>
                        </div>
                        <div className="p-3 space-y-2">
                          {dateTasks.map(task => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
                            >
                              <CheckCircle className="w-4 h-4 text-success shrink-0" />
                              <span className="text-sm flex-1 truncate">{task.title}</span>
                              <span className="text-xs font-mono text-xp">+{task.xp}xp</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Clean Streak Div */}
                  <div
                    onClick={handleStreakClick}
                    className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 cursor-pointer hover:border-orange-500/40 transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="group-hover:scale-110 transition-transform">
                          <StreakFlame streak={stats.streak} size="md" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-orange-500 transition-colors">
                            {stats.streak} Days
                          </h3>
                          <p className="text-sm text-muted-foreground">Current Streak</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Debug Tools (Testing Only) */}
                  <div className="p-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/10">
                    <h4 className="text-xs font-mono text-muted-foreground mb-3 text-center uppercase tracking-widest">Debug Console</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" onClick={() => debugIncreaseStreak(1)}>+1 Day</Button>
                        <Button variant="outline" size="sm" onClick={() => debugIncreaseStreak(5)}>+5 Days</Button>
                        <Button variant="outline" size="sm" onClick={() => debugIncreaseStreak(30)}>+30 Days</Button>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" onClick={() => debugCycleLeague('prev')}>Prev League</Button>
                        <Button variant="outline" size="sm" onClick={() => debugCycleLeague('next')}>Next League</Button>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={debugAdvanceDay}
                          className="w-full max-w-[200px]"
                        >
                          Simulate Next Day ({debugDate})
                        </Button>
                      </div>
                      <div className="flex gap-2 justify-center items-center">
                        <input
                          type="number"
                          id="debug-xp-input"
                          placeholder="XP Amount"
                          className="w-24 h-9 text-sm text-center rounded-md border border-input bg-background px-2"
                          defaultValue={500}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById('debug-xp-input') as HTMLInputElement;
                            const amount = parseInt(input?.value || '0', 10);
                            if (amount > 0) {
                              useGameStore.getState().debugAddXP(amount);
                            }
                          }}
                        >
                          Get XP
                        </Button>
                      </div>
                      <div className="flex gap-2 justify-center pt-2 border-t border-dashed border-muted-foreground/30">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('ARE YOU SURE? This will wipe ALL data including streaks, tasks, and history.')) {
                              useGameStore.getState().debugResetAll();
                              onClose();
                            }
                          }}
                          className="w-full bg-red-900/50 hover:bg-red-900 text-red-100"
                        >
                          RESET ALL DATA
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-xp/10 border border-primary/20">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Level {stats.level}
                      </span>
                      <span className="text-sm font-mono text-xp">
                        {Math.round(progress * 100)}%
                      </span>
                    </div>
                    <div className="h-4 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-xp rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      {xpToNextLevel > 0 ? `${xpToNextLevel} XP to Level ${stats.level + 1}` : 'Max level reached!'}
                    </p>
                  </div>

                  {/* Quest Completion Stats */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Quests Completed
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Today', value: timeStats.today, icon: Calendar, color: 'text-primary' },
                        { label: 'This Week', value: timeStats.week, icon: Target, color: 'text-xp' },
                        { label: 'This Month', value: timeStats.month, icon: CheckCircle, color: 'text-success' },
                        { label: 'This Year', value: timeStats.year, icon: Trophy, color: 'text-rank-gold' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-4 rounded-xl glass border border-border/50 text-center"
                        >
                          <stat.icon className={cn("w-6 h-6 mx-auto mb-2", stat.color)} />
                          <p className="font-mono text-2xl font-bold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Other Stats */}
                  <div className="glass rounded-2xl border border-border/50 overflow-hidden">
                    <h3 className="text-sm font-medium text-muted-foreground p-4 border-b border-border/30 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Lifetime Stats
                    </h3>
                    <div className="divide-y divide-border/30">
                      {[
                        { label: 'Total XP', value: stats.totalLifetimeXP.toLocaleString(), icon: Zap, color: 'text-xp' },
                        { label: 'Day Streak', value: `${stats.streak} days`, icon: Flame, color: 'text-rank-bronze' },
                        { label: 'Weekly Avg', value: `${weeklyAvg} XP/day`, icon: Calendar, color: 'text-muted-foreground' },
                        { label: 'All Time Quests', value: timeStats.total.toString(), icon: CheckCircle, color: 'text-success' },
                        { label: 'Active Goals', value: goals.filter(g => !g.completed).length.toString(), icon: Target, color: 'text-success' },
                        { label: 'Goals Completed', value: goals.filter(g => g.completed).length.toString(), icon: Trophy, color: 'text-rank-gold' },
                        { label: 'Active Habits', value: habits.length.toString(), icon: TrendingUp, color: 'text-purple-500' },
                        { label: 'Weekly Habits', value: timeStats.weeklyHabits.toString(), icon: CheckCircle, color: 'text-purple-500' },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.05 }}
                          className="flex items-center justify-between p-4"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={cn("w-5 h-5", item.color)} />
                            <span className="text-muted-foreground">{item.label}</span>
                          </div>
                          <span className="font-mono font-medium">{item.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* View History Button */}
                  <Button
                    variant="outline"
                    className="w-full justify-between h-14 text-base"
                    onClick={() => setShowHistory(true)}
                  >
                    <span className="flex items-center gap-3">
                      <Clock className="w-5 h-5" />
                      View Quest History
                    </span>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
