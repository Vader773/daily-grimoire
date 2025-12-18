import { motion } from 'framer-motion';
import { League } from '@/stores/gameStore';
import { Shield, Star, Crown, Gem, Swords, Flame, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeagueBadge2DProps {
  league: League;
  level?: number;
}

const leagueConfig: Record<League, {
  icon: React.ElementType;
  gradient: string;
  glowColor: string;
  borderColor: string;
  iconColor: string;
}> = {
  bronze: {
    icon: Shield,
    gradient: 'from-amber-700 via-amber-600 to-amber-800',
    glowColor: 'shadow-amber-600/50',
    borderColor: 'border-amber-500/50',
    iconColor: 'text-amber-900',
  },
  silver: {
    icon: Star,
    gradient: 'from-slate-300 via-slate-200 to-slate-400',
    glowColor: 'shadow-slate-400/50',
    borderColor: 'border-slate-300/50',
    iconColor: 'text-slate-600',
  },
  gold: {
    icon: Crown,
    gradient: 'from-yellow-500 via-yellow-400 to-yellow-600',
    glowColor: 'shadow-yellow-500/50',
    borderColor: 'border-yellow-400/50',
    iconColor: 'text-yellow-800',
  },
  platinum: {
    icon: Gem,
    gradient: 'from-cyan-200 via-white to-cyan-300',
    glowColor: 'shadow-cyan-300/50',
    borderColor: 'border-cyan-200/50',
    iconColor: 'text-cyan-600',
  },
  diamond: {
    icon: Gem,
    gradient: 'from-blue-400 via-cyan-300 to-blue-500',
    glowColor: 'shadow-blue-400/50',
    borderColor: 'border-blue-300/50',
    iconColor: 'text-blue-700',
  },
  master: {
    icon: Swords,
    gradient: 'from-purple-600 via-purple-500 to-purple-700',
    glowColor: 'shadow-purple-500/50',
    borderColor: 'border-purple-400/50',
    iconColor: 'text-purple-900',
  },
  grandmaster: {
    icon: Flame,
    gradient: 'from-red-600 via-red-500 to-red-700',
    glowColor: 'shadow-red-500/50',
    borderColor: 'border-red-400/50',
    iconColor: 'text-red-900',
  },
  champion: {
    icon: Sparkles,
    gradient: 'from-emerald-500 via-emerald-400 to-emerald-600',
    glowColor: 'shadow-emerald-500/50',
    borderColor: 'border-emerald-400/50',
    iconColor: 'text-emerald-900',
  },
  legend: {
    icon: Zap,
    gradient: 'from-indigo-600 via-purple-500 to-pink-500',
    glowColor: 'shadow-indigo-500/50',
    borderColor: 'border-indigo-400/50',
    iconColor: 'text-white',
  },
  immortal: {
    icon: Crown,
    gradient: 'from-amber-500 via-orange-400 to-red-500',
    glowColor: 'shadow-orange-500/60',
    borderColor: 'border-orange-400/50',
    iconColor: 'text-white',
  },
};

export const LeagueBadge2D = ({ league }: LeagueBadge2DProps) => {
  const config = leagueConfig[league];
  const Icon = config.icon;

  return (
    <motion.div
      className="relative flex items-center justify-center w-full h-full"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      {/* Outer glow */}
      <motion.div
        className={cn(
          "absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full blur-xl opacity-60",
          `bg-gradient-to-br ${config.gradient}`
        )}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Badge container */}
      <motion.div
        className={cn(
          "relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center",
          "border-2 shadow-lg",
          `bg-gradient-to-br ${config.gradient}`,
          config.borderColor,
          config.glowColor
        )}
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
        animate={{
          rotateY: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Inner highlight */}
        <div className="absolute inset-1 rounded-xl bg-white/20" />
        
        {/* Icon */}
        <Icon className={cn("w-10 h-10 sm:w-12 sm:h-12 relative z-10", config.iconColor)} />
      </motion.div>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      >
        <motion.div
          className="absolute w-8 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: [-100, 200],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  );
};
