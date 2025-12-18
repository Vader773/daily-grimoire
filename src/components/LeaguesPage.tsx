import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Crown, Sparkles, Lock, Check } from 'lucide-react';
import { useGameStore, League } from '@/stores/gameStore';
import { LEAGUE_THRESHOLDS } from '@/config/leagues';
import { LeagueBadge3D } from './LeagueBadge3D';
import { LeagueBadge2D } from './LeagueBadge2D';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LeaguesPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEAGUE_ORDER: League[] = [
  'bronze', 'silver', 'gold', 'platinum', 'diamond',
  'master', 'grandmaster', 'champion', 'legend', 'immortal'
];

const LEAGUE_STYLES: Record<League, {
  text: string;
  bg: string;
  border: string;
  glow: string;
  gradient: string;
}> = {
  bronze: {
    text: 'text-amber-600 dark:text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_40px_rgba(217,119,6,0.4)]',
    gradient: 'from-amber-600/30 to-orange-700/20'
  },
  silver: {
    text: 'text-slate-400 dark:text-slate-300',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/40',
    glow: 'shadow-[0_0_40px_rgba(148,163,184,0.4)]',
    gradient: 'from-slate-400/30 to-slate-500/20'
  },
  gold: {
    text: 'text-yellow-500 dark:text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/40',
    glow: 'shadow-[0_0_40px_rgba(234,179,8,0.5)]',
    gradient: 'from-yellow-500/30 to-amber-600/20'
  },
  platinum: {
    text: 'text-cyan-300 dark:text-cyan-200',
    bg: 'bg-cyan-300/10',
    border: 'border-cyan-300/40',
    glow: 'shadow-[0_0_40px_rgba(103,232,249,0.4)]',
    gradient: 'from-cyan-300/30 to-sky-400/20'
  },
  diamond: {
    text: 'text-sky-400 dark:text-sky-300',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/40',
    glow: 'shadow-[0_0_40px_rgba(56,189,248,0.5)]',
    gradient: 'from-sky-400/30 to-blue-500/20'
  },
  master: {
    text: 'text-purple-500 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
    glow: 'shadow-[0_0_40px_rgba(168,85,247,0.5)]',
    gradient: 'from-purple-500/30 to-violet-600/20'
  },
  grandmaster: {
    text: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.5)]',
    gradient: 'from-red-500/30 to-rose-600/20'
  },
  champion: {
    text: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.5)]',
    gradient: 'from-emerald-500/30 to-teal-600/20'
  },
  legend: {
    text: 'text-indigo-500 dark:text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/40',
    glow: 'shadow-[0_0_40px_rgba(99,102,241,0.5)]',
    gradient: 'from-indigo-500/30 to-violet-600/20'
  },
  immortal: {
    text: 'text-amber-400 dark:text-amber-300',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/40',
    glow: 'shadow-[0_0_50px_rgba(251,191,36,0.6)]',
    gradient: 'from-amber-400/30 to-orange-500/20'
  },
};

// Detect iOS for 2D fallback
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const LeaguesPage = ({ isOpen, onClose }: LeaguesPageProps) => {
  const stats = useGameStore(state => state.stats);
  const getLeague = useGameStore(state => state.getLeague);
  const debugLeagueOverride = useGameStore(state => state.debugLeagueOverride);
  const useIOSFallback = isIOS();

  // Calculate current league based on monthly XP - reactive to dailyXP changes
  const monthlyXP = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    let totalXP = 0;

    stats.dailyXP.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        totalXP += entry.xp;
      }
    });

    return totalXP;
  }, [stats.dailyXP]);

  // Use debugLeagueOverride if set, otherwise calculate from monthly XP
  const currentLeague = debugLeagueOverride || getLeague();
  const currentLeagueIndex = LEAGUE_ORDER.indexOf(currentLeague);

  // Get next league info
  const nextLeague = currentLeagueIndex < LEAGUE_ORDER.length - 1
    ? LEAGUE_ORDER[currentLeagueIndex + 1]
    : null;
  const xpToNextLeague = nextLeague
    ? LEAGUE_THRESHOLDS[nextLeague] - monthlyXP
    : 0;
  const nextLeagueThreshold = nextLeague ? LEAGUE_THRESHOLDS[nextLeague] : monthlyXP;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background z-50 overflow-auto"
          style={{ willChange: 'scroll-position' }}
        >
          {/* Header */}
          <div className="sticky top-0 glass-strong border-b border-border/50 z-10">
            <div className="flex items-center justify-between p-4 max-w-screen-lg mx-auto">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Trophy className="w-6 h-6 text-rank-gold" />
                </motion.div>
                <div>
                  <h1 className="font-heading font-bold text-lg">League Hall</h1>
                  <p className="text-xs text-muted-foreground">
                    Monthly XP: <span className="font-mono font-semibold">{monthlyXP.toLocaleString()}</span>
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

          {/* League Grid */}
          <div className="max-w-screen-lg mx-auto p-4 pb-20">
            {/* All Leagues - Vertical List */}
            <div className="space-y-4">
              {LEAGUE_ORDER.map((league, index) => {
                const isPast = index < currentLeagueIndex;
                const isCurrent = index === currentLeagueIndex;
                const isFuture = index > currentLeagueIndex;
                const styles = LEAGUE_STYLES[league];
                const threshold = LEAGUE_THRESHOLDS[league];

                // XP needed to reach THIS league (for current league, show next league progress)
                const xpNeededForThisLeague = isCurrent && nextLeague
                  ? xpToNextLeague
                  : isFuture
                    ? LEAGUE_THRESHOLDS[league] - monthlyXP
                    : 0;

                return (
                  <motion.div
                    key={league}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative p-4 rounded-2xl border-2 transition-all",
                      isCurrent && [
                        "bg-gradient-to-r",
                        styles.gradient,
                        styles.border,
                        styles.glow,
                        "ring-2 ring-offset-2 ring-offset-background"
                      ],
                      isPast && [
                        styles.bg,
                        styles.border,
                        "opacity-80"
                      ],
                      isFuture && [
                        "bg-muted/10 border-muted/20"
                      ]
                    )}
                    style={isCurrent ? { ['--tw-ring-color' as any]: styles.border.replace('border-', '').replace('/40', '') } : {}}
                  >
                    <div className="flex items-center gap-4">
                      {/* Badge Container - NO overflow hidden, sufficient height */}
                      <div
                        className={cn(
                          "relative flex-shrink-0",
                          isCurrent ? "w-28 h-28" : "w-20 h-20"
                        )}
                      >
                        {/* Container with extra space for 3D badge */}
                        <div className="absolute inset-[-30%] w-[160%] h-[160%] flex items-center justify-center">
                          {/* Veiled overlay for locked leagues */}
                          {isFuture && (
                            <div className="absolute inset-0 z-10 pointer-events-none">
                              <div className="w-full h-full rounded-full bg-gradient-to-b from-transparent via-muted/30 to-muted/50" />
                            </div>
                          )}
                          {/* Badge with veiled effect for future leagues */}
                          <div
                            className={cn(
                              "w-full h-full transition-all duration-300",
                              isFuture && "grayscale brightness-[0.3] opacity-50"
                            )}
                            style={{ touchAction: 'pan-y' }}
                          >
                            {useIOSFallback ? (
                              <LeagueBadge2D league={league} />
                            ) : (
                              <LeagueBadge3D league={league} />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn(
                            "text-lg font-heading font-bold capitalize",
                            isCurrent && styles.text,
                            isPast && styles.text,
                            isFuture && "text-muted-foreground"
                          )}>
                            {league}
                          </h3>
                          {isCurrent && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Sparkles className={cn("w-4 h-4", styles.text)} />
                            </motion.div>
                          )}
                          {isPast && (
                            <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                              <Check className="w-3 h-3 text-success-foreground" />
                            </div>
                          )}
                          {isFuture && (
                            <Lock className="w-4 h-4 text-muted-foreground/50" />
                          )}
                        </div>

                        {/* XP Threshold */}
                        <p className="text-sm text-muted-foreground mb-2">
                          Requires <span className="font-mono font-semibold">{threshold.toLocaleString()}</span> monthly XP
                        </p>

                        {/* Current League: Show progress to NEXT league */}
                        {isCurrent && nextLeague && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">
                                To <span className={cn("font-semibold capitalize", LEAGUE_STYLES[nextLeague].text)}>{nextLeague}</span>
                              </span>
                              <span className="font-mono text-foreground">
                                {xpToNextLeague.toLocaleString()} XP needed
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-xp"
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.min(100, ((monthlyXP - threshold) / (nextLeagueThreshold - threshold)) * 100)}%`
                                }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Future League: Show how much XP needed */}
                        {isFuture && (
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            <span className="font-mono">{xpNeededForThisLeague.toLocaleString()}</span> XP to unlock
                          </p>
                        )}

                        {/* Max League Reached */}
                        {isCurrent && !nextLeague && (
                          <p className={cn("text-sm font-semibold mt-2", styles.text)}>
                            ✨ Maximum League Achieved!
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
