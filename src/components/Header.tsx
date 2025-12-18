import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Menu, Flame, Sun, Moon, Trophy, Zap, Target, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { StreakFlame } from '@/components/StreakFlame';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { FullScreenCalendar } from './FullScreenCalendar';
import { FullScreenStats } from './FullScreenStats';
import { LeaguesPage } from './LeaguesPage';

export const Header = () => {
  const { stats, theme, toggleTheme, getLeague, getWeeklyAverageXP } = useGameStore();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showLeagueHall, setShowLeagueHall] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasStreak = stats.streak > 0;
  const league = getLeague();
  const weeklyAvg = getWeeklyAverageXP();

  const leagueColors: Record<string, string> = {
    bronze: 'text-rank-bronze',
    silver: 'text-rank-silver',
    gold: 'text-rank-gold',
    platinum: 'text-slate-300',
    diamond: 'text-cyan-400',
    master: 'text-purple-600',
    grandmaster: 'text-red-500',
    champion: 'text-emerald-500',
    legend: 'text-indigo-500',
    immortal: 'text-amber-500',
  };

  const handleOpenCalendar = () => {
    setSheetOpen(false);
    setTimeout(() => setShowCalendar(true), 150);
  };

  const handleOpenStats = () => {
    setSheetOpen(false);
    setTimeout(() => setShowStats(true), 150);
  };

  const handleOpenLeagueHall = () => {
    setShowStats(false);
    setTimeout(() => setShowLeagueHall(true), 150);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between">
          {/* Left section - Menu and Theme Toggle */}
          <div className="flex items-center gap-1">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 sm:w-10 sm:h-10 text-muted-foreground hover:text-foreground">
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="glass-strong w-[300px] sm:w-[340px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="font-heading flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    QuestLine
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Menu Options */}
                  <div className="space-y-2">
                    <button
                      onClick={handleOpenCalendar}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-rank-bronze/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-rank-bronze" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Streak Calendar</p>
                        <p className="text-xs text-muted-foreground">{stats.streak} day streak</p>
                      </div>
                    </button>

                    <button
                      onClick={handleOpenStats}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Statistics</p>
                        <p className="text-xs text-muted-foreground">View detailed stats</p>
                      </div>
                    </button>
                  </div>

                  {/* Stats Card */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <h3 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-xp" />
                          Total XP
                        </span>
                        <span className="font-mono text-sm text-xp font-medium">{stats.totalLifetimeXP.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-primary" />
                          Level
                        </span>
                        <span className="font-mono text-sm font-medium">{stats.level}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-2">
                          <Flame className="w-3.5 h-3.5 text-rank-bronze" />
                          Streak
                        </span>
                        <span className="font-mono text-sm text-rank-bronze font-medium">{stats.streak} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-2">
                          <Trophy className={cn("w-3.5 h-3.5", leagueColors[league])} />
                          League
                        </span>
                        <span className={cn("font-mono text-sm font-medium capitalize", leagueColors[league])}>
                          {league}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Weekly Avg</span>
                        <span className="font-mono text-sm text-muted-foreground">{weeklyAvg} XP/day</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Theme Toggle Button - Next to hamburger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 text-muted-foreground hover:text-foreground"
            >
              <motion.div
                key={theme}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </motion.div>
            </Button>
          </div>

          {/* Logo - Center */}
          <h1 className="font-heading font-bold text-base sm:text-lg tracking-tight flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Quest<span className="text-primary">Line</span>
          </h1>

          {/* Feedback Button & Streak - Right */}
          <div className="flex items-center gap-1">
            {/* Feedback Button */}
            <a
              href="https://forms.gle/pnGsGjrtvE5YCRnX6"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors",
                theme === 'dark'
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="hidden sm:inline">Feedback</span>
            </a>

            {/* Streak Button */}
            <motion.button
              className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10"
              onClick={() => setShowCalendar(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated flame for active streak */}
              <div className="flex items-center justify-center">
                <StreakFlame streak={stats.streak} size="sm" animated={hasStreak} />
              </div>
              {hasStreak && (
                <motion.span
                  className="absolute -bottom-0.5 -right-0.5 text-[9px] sm:text-[10px] font-mono font-bold text-rank-bronze bg-background/80 rounded-full px-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {stats.streak}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Full Screen Calendar */}
      <FullScreenCalendar isOpen={showCalendar} onClose={() => setShowCalendar(false)} />

      {/* Full Screen Stats */}
      <FullScreenStats
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        onNavigateToStreak={() => {
          setShowStats(false);
          setTimeout(() => setShowCalendar(true), 150);
        }}
        onOpenLeagueHall={handleOpenLeagueHall}
      />

      {/* League Hall */}
      <LeaguesPage isOpen={showLeagueHall} onClose={() => setShowLeagueHall(false)} />
    </>
  );
};