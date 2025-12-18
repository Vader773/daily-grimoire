import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Trophy, Crown } from 'lucide-react';
import { useGameStore, League } from '@/stores/gameStore';
import { LEAGUE_THRESHOLDS } from '@/config/leagues';
import { LeagueBadge3D } from './LeagueBadge3D';
import { LeagueBadge2D } from './LeagueBadge2D';
import { cn } from '@/lib/utils';

interface CurrentLeagueCardProps {
  onClick: () => void;
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
    glow: 'shadow-[0_0_30px_rgba(217,119,6,0.3)]',
    gradient: 'from-amber-600/20 to-orange-700/10'
  },
  silver: { 
    text: 'text-slate-400 dark:text-slate-300', 
    bg: 'bg-slate-400/10', 
    border: 'border-slate-400/40',
    glow: 'shadow-[0_0_30px_rgba(148,163,184,0.3)]',
    gradient: 'from-slate-400/20 to-slate-500/10'
  },
  gold: { 
    text: 'text-yellow-500 dark:text-yellow-400', 
    bg: 'bg-yellow-500/10', 
    border: 'border-yellow-500/40',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]',
    gradient: 'from-yellow-500/20 to-amber-600/10'
  },
  platinum: { 
    text: 'text-cyan-300 dark:text-cyan-200', 
    bg: 'bg-cyan-300/10', 
    border: 'border-cyan-300/40',
    glow: 'shadow-[0_0_30px_rgba(103,232,249,0.3)]',
    gradient: 'from-cyan-300/20 to-sky-400/10'
  },
  diamond: { 
    text: 'text-sky-400 dark:text-sky-300', 
    bg: 'bg-sky-400/10', 
    border: 'border-sky-400/40',
    glow: 'shadow-[0_0_30px_rgba(56,189,248,0.4)]',
    gradient: 'from-sky-400/20 to-blue-500/10'
  },
  master: { 
    text: 'text-purple-500 dark:text-purple-400', 
    bg: 'bg-purple-500/10', 
    border: 'border-purple-500/40',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    gradient: 'from-purple-500/20 to-violet-600/10'
  },
  grandmaster: { 
    text: 'text-red-500 dark:text-red-400', 
    bg: 'bg-red-500/10', 
    border: 'border-red-500/40',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]',
    gradient: 'from-red-500/20 to-rose-600/10'
  },
  champion: { 
    text: 'text-emerald-500 dark:text-emerald-400', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]',
    gradient: 'from-emerald-500/20 to-teal-600/10'
  },
  legend: { 
    text: 'text-indigo-500 dark:text-indigo-400', 
    bg: 'bg-indigo-500/10', 
    border: 'border-indigo-500/40',
    glow: 'shadow-[0_0_30px_rgba(99,102,241,0.4)]',
    gradient: 'from-indigo-500/20 to-violet-600/10'
  },
  immortal: { 
    text: 'text-amber-400 dark:text-amber-300', 
    bg: 'bg-amber-400/10', 
    border: 'border-amber-400/40',
    glow: 'shadow-[0_0_40px_rgba(251,191,36,0.5)]',
    gradient: 'from-amber-400/20 to-orange-500/10'
  },
};

// Detect iOS for 2D fallback
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const CurrentLeagueCard = ({ onClick }: CurrentLeagueCardProps) => {
  // Subscribe to raw data only to avoid infinite loops
  const stats = useGameStore(state => state.stats);
  const debugLeagueOverride = useGameStore(state => state.debugLeagueOverride);

  // Compute monthlyXP locally
  const monthlyXP = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    let total = 0;
    stats.dailyXP.forEach(entry => {
      const d = new Date(entry.date);
      if (d.getFullYear() === year && d.getMonth() === month) total += entry.xp;
    });
    return total;
  }, [stats.dailyXP]);

  // Compute league locally
  const currentLeague = useMemo((): League => {
    if (debugLeagueOverride) return debugLeagueOverride;
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
  }, [monthlyXP, debugLeagueOverride]);

  const currentLeagueIndex = LEAGUE_ORDER.indexOf(currentLeague);
  const nextLeague = currentLeagueIndex < LEAGUE_ORDER.length - 1 
    ? LEAGUE_ORDER[currentLeagueIndex + 1] 
    : null;
  
  const xpToNextLeague = nextLeague 
    ? LEAGUE_THRESHOLDS[nextLeague] - monthlyXP 
    : 0;
  
  const nextLeagueThreshold = nextLeague ? LEAGUE_THRESHOLDS[nextLeague] : monthlyXP;
  const currentLeagueThreshold = LEAGUE_THRESHOLDS[currentLeague];
  const progressPercent = nextLeague 
    ? Math.min(100, ((monthlyXP - currentLeagueThreshold) / (nextLeagueThreshold - currentLeagueThreshold)) * 100)
    : 100;

  const styles = LEAGUE_STYLES[currentLeague];
  const useIOS = isIOS();
  const isMaxLeague = currentLeague === 'immortal';
  const LeagueIcon = isMaxLeague ? Crown : Trophy;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-5 rounded-2xl border-2 cursor-pointer transition-all group overflow-visible",
        "bg-gradient-to-r",
        styles.gradient,
        styles.border,
        styles.glow
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: League Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <LeagueIcon className={cn("w-5 h-5", styles.text)} />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Current League</span>
          </div>
          
          <h3 className={cn("text-2xl font-heading font-bold capitalize mb-2", styles.text)}>
            {currentLeague}
          </h3>
          
          {nextLeague ? (
            <>
              <p className="text-sm text-foreground/80 mb-3">
                <span className="font-mono font-semibold">{monthlyXP.toLocaleString()}</span>
                <span className="text-muted-foreground"> / </span>
                <span className="font-mono">{nextLeagueThreshold.toLocaleString()}</span>
                <span className="text-muted-foreground"> XP to </span>
                <span className={cn("font-semibold capitalize", LEAGUE_STYLES[nextLeague].text)}>
                  {nextLeague}
                </span>
              </p>
              
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", styles.bg.replace('/10', ''))}
                  style={{ backgroundColor: `hsl(var(--primary))` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </>
          ) : (
            <p className={cn("text-sm font-semibold", styles.text)}>
              ✨ Maximum League Achieved!
            </p>
          )}
        </div>

        {/* Right: 3D Badge */}
        <div className="relative w-24 h-24 flex-shrink-0">
          {/* Container with NO overflow hidden */}
          <div className="absolute inset-[-20%] w-[140%] h-[140%] flex items-center justify-center">
            {useIOS ? (
              <LeagueBadge2D league={currentLeague} />
            ) : (
              <LeagueBadge3D league={currentLeague} />
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0" />
      </div>
    </motion.div>
  );
};
