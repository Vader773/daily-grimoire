import { useGameStore, League } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Shield, Crown, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const leagueConfig: Record<League, { 
  label: string; 
  icon: React.ReactNode; 
  gradient: string;
  glow: string;
  border: string;
  textClass: string;
}> = {
  bronze: {
    label: 'Bronze',
    icon: <Shield className="w-4 h-4" />,
    gradient: 'from-rank-bronze/20 to-rank-bronze/5',
    glow: '',
    border: 'border-rank-bronze/50',
    textClass: 'text-rank-bronze',
  },
  silver: {
    label: 'Silver',
    icon: <Star className="w-4 h-4" />,
    gradient: 'from-rank-silver/20 to-rank-silver/5',
    glow: '',
    border: 'border-rank-silver/50',
    textClass: 'text-rank-silver',
  },
  gold: {
    label: 'Gold',
    icon: <Crown className="w-4 h-4" />,
    gradient: 'from-rank-gold/20 to-rank-gold/5',
    glow: 'glow-gold',
    border: 'border-rank-gold/50',
    textClass: 'text-gradient-gold',
  },
};

export const LeagueBadge = () => {
  const { getLeague, getLeagueProgress, getMonthlyXP } = useGameStore();
  const league = getLeague();
  const progress = getLeagueProgress();
  const monthlyXP = getMonthlyXP();
  const config = leagueConfig[league];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className={cn(
        "glass rounded-2xl p-4 border",
        config.border,
        config.glow
      )}>
        <div className="flex items-center justify-between mb-3">
          {/* League Badge */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r",
            config.gradient
          )}>
            <span className={config.textClass}>{config.icon}</span>
            <span className={cn("font-heading font-bold text-sm", config.textClass)}>
              {config.label} League
            </span>
          </div>
          
          {/* Monthly XP */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">{monthlyXP} XP this month</span>
          </div>
        </div>

        {/* Progress Bar */}
        {progress.nextLeague && (
          <div className="space-y-2">
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  progress.nextLeague === 'silver' && "bg-rank-silver",
                  progress.nextLeague === 'gold' && "bg-gradient-to-r from-rank-gold to-rank-gold/70"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {progress.needed - progress.current} XP needed for{' '}
              <span className={cn(
                "font-semibold",
                progress.nextLeague === 'silver' && "text-rank-silver",
                progress.nextLeague === 'gold' && "text-rank-gold"
              )}>
                {progress.nextLeague.charAt(0).toUpperCase() + progress.nextLeague.slice(1)}
              </span>
            </p>
          </div>
        )}

        {!progress.nextLeague && (
          <p className="text-xs text-center text-rank-gold font-medium">
            ✨ Maximum League Achieved!
          </p>
        )}
      </div>
    </motion.div>
  );
};
