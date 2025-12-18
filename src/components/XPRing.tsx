import { useState, useMemo, useEffect } from 'react';
import { useGameStore, League } from '@/stores/gameStore';
import { LEAGUE_THRESHOLDS } from '@/config/leagues';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { FullScreenStats } from './FullScreenStats';
import { FullScreenCalendar } from './FullScreenCalendar';
import { LeaguesPage } from './LeaguesPage';
import { LeagueBadge3D } from './LeagueBadge3D';
import { LeagueBadge2D } from './LeagueBadge2D';
import { cn } from '@/lib/utils';

// Detect iOS for performance optimization
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

interface XPRingProps {
  isLevelingUp?: boolean;
}

const leagueColors: Record<League, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#B8860B',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
  master: '#9333EA',
  grandmaster: '#EF4444',
  champion: '#10B981',
  legend: '#3B82F6',
  immortal: '#F59E0B',
};

const leagueBgColors: Record<League, string> = {
  bronze: 'bg-[#CD7F32]',
  silver: 'bg-[#C0C0C0]',
  gold: 'bg-[#B8860B]',
  platinum: 'bg-[#E5E4E2]',
  diamond: 'bg-[#B9F2FF]',
  master: 'bg-[#9333EA]',
  grandmaster: 'bg-[#EF4444]',
  champion: 'bg-[#10B981]',
  legend: 'bg-[#3B82F6]',
  immortal: 'bg-[#F59E0B]',
};

const leagueTextClass: Record<League, string> = {
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

// XP formula so Level 1 starts at 0 XP
const getXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.pow((level - 1) / 0.1, 2);
};

export const XPRing = ({ isLevelingUp = false }: XPRingProps) => {
  const [showStats, setShowStats] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showLeagueHall, setShowLeagueHall] = useState(false);
  const [useSimpleBadge, setUseSimpleBadge] = useState(false);

  // Detect iOS on mount for performance optimization
  useEffect(() => {
    setUseSimpleBadge(isIOS());
  }, []);

  // CRITICAL: Subscribe directly to the data that changes
  const stats = useGameStore(state => state.stats);
  const activeView = useGameStore(state => state.activeView);
  const dailyXP = stats.dailyXP;
  const totalLifetimeXP = stats.totalLifetimeXP;
  const level = stats.level;

  // Use store getters to keep League Hall + hero ring perfectly in sync
  const monthlyXP = useGameStore(state => state.getMonthlyXP());
  const league = useGameStore(state => state.getLeague());
  const leagueProgress = useGameStore(state => state.getLeagueProgress());

  const getCurrentLevelProgress = useGameStore(state => state.getCurrentLevelProgress);
  const xpProgress = getCurrentLevelProgress();

  // Calculate XP display values
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const xpInCurrentLevel = Math.max(0, Math.round(totalLifetimeXP - currentLevelXP));
  const xpNeededForLevel = Math.round(nextLevelXP - currentLevelXP);

  // LARGER Ring calculations - user approved bigger avatar
  const outerRadius = 125;
  const innerRadius = 105;
  const center = 150;

  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const safeXPProgress = Math.max(0, Math.min(xpProgress, 1));
  const safeLeagueProgress = Math.max(0, Math.min(leagueProgress.percent / 100, 1));

  const outerStrokeDashoffset = outerCircumference * (1 - safeXPProgress);
  const innerStrokeDashoffset = innerCircumference * (1 - safeLeagueProgress);

  return (
    <>
      <motion.div
        className="relative flex flex-col items-center justify-center cursor-pointer"
        onClick={() => setShowStats(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Outer glow effect based on league */}
        <motion.div
          className={cn(
            "absolute rounded-full blur-2xl transition-all duration-500",
            "w-[250px] h-[250px] sm:w-[290px] sm:h-[290px]",
            leagueBgColors[league] ? leagueBgColors[league].replace('bg-', 'bg-opacity-20 bg-') : "bg-primary/20"
          )}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* SVG Dual Rings - overflow-visible to prevent badge clipping */}
        <svg
          className="w-[270px] h-[270px] sm:w-[310px] sm:h-[310px] transform -rotate-90 pointer-events-none overflow-visible"
          viewBox="0 0 300 300"
        >
          <defs>
            {/* XP Gradient (outer ring) - GREEN for XP, RED for Vices */}
            {activeView === 'vices' ? (
              <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" /> {/* Red-500 */}
                <stop offset="100%" stopColor="#991b1b" /> {/* Red-800 */}
              </linearGradient>
            ) : (
              <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" /> {/* Green-400 */}
                <stop offset="100%" stopColor="#16a34a" /> {/* Green-600 */}
              </linearGradient>
            )}

            {/* Metallic League Gradient (inner ring) */}
            <linearGradient id="league-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={leagueColors[league]} />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="60%" stopColor={leagueColors[league]} />
              <stop offset="100%" stopColor={leagueColors[league]} stopOpacity="0.8" />
            </linearGradient>

            {/* Gloss Filter for Metallic Look */}
            <filter id="gloss-metal">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
              <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="20" lightingColor="#ffffff" result="specOut">
                <fePointLight x="-5000" y="-10000" z="20000" />
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
              <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
              <feMerge>
                <feMergeNode in="litPaint" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer ring background (XP) */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            className="opacity-20"
          />

          {/* Outer ring progress (XP - Level) */}
          <motion.circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="url(#xp-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={outerCircumference}
            animate={{ strokeDashoffset: outerStrokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            filter="url(#glow)"
          />

          {/* Inner ring background (League) */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
            className="opacity-20"
          />

          {/* Inner ring progress (League) - Metallic */}
          <motion.circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke="url(#league-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={innerCircumference}
            animate={{ strokeDashoffset: innerStrokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            filter="url(#gloss-metal)"
          />
        </svg>

        {/* Center content - League Badge - allow overflow for big badges */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto overflow-visible">
          {/* Badge Container - sized for centered badge, overflow allowed */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto overflow-visible">
            <div className="w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] flex items-center justify-center overflow-visible">
              {useSimpleBadge ? (
                <LeagueBadge2D league={league} level={level} />
              ) : (
                <LeagueBadge3D league={league} level={level} />
              )}
            </div>
          </div>

          {/* Level Display Below Badge */}
          <div className="absolute bottom-[45px] sm:bottom-[50px] pointer-events-none">
            <span className="text-[10px] font-bold text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10 shadow-sm">
              LVL {level}
            </span>
          </div>
        </div>

        {/* Level up flash effect */}
        {isLevelingUp && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-xp"
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              className="absolute -top-2 -right-2"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
            >
              <Sparkles className="w-6 h-6 text-xp" />
            </motion.div>
          </>
        )}

      </motion.div>

      {/* Legend below the ring */}
      <div className="mt-1 flex flex-col items-center gap-1">
        {/* Dual progress indicators */}
        <div className="flex items-center gap-3 text-[10px]">
          {/* XP Progress */}
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="font-mono text-muted-foreground">
              XP: {xpInCurrentLevel} / {xpNeededForLevel}
            </span>
          </div>

          {/* League Progress */}
          <div className="flex items-center gap-1">
            <div className={cn("w-1.5 h-1.5 rounded-full",
              leagueBgColors[league] ? leagueBgColors[league] : "bg-primary"
            )} />
            <span className={cn("font-mono capitalize", leagueTextClass[league])}>
              {league}: {monthlyXP} / {leagueProgress.needed}
            </span>
          </div>
        </div>
      </div>

      <FullScreenStats
        isOpen={showStats}
        league={league} // Sync visuals
        onClose={() => setShowStats(false)}
        onNavigateToStreak={() => {
          setShowStats(false);
          setShowCalendar(true);
        }}
        onOpenLeagueHall={() => {
          setShowStats(false);
          setTimeout(() => setShowLeagueHall(true), 150);
        }}
      />
      <FullScreenCalendar
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
      />
      <LeaguesPage
        isOpen={showLeagueHall}
        onClose={() => setShowLeagueHall(false)}
      />
    </>
  );
};
