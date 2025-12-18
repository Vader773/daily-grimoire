import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Crown, ChevronLeft, Lock, Sparkles } from 'lucide-react';
import { useGameStore, League } from '@/stores/gameStore';
import { LEAGUE_THRESHOLDS } from '@/config/leagues';
import { LeagueBadge3D } from './LeagueBadge3D';
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

const LEAGUE_COLORS: Record<League, { text: string; bg: string; border: string }> = {
    bronze: { text: 'text-rank-bronze', bg: 'bg-rank-bronze/10', border: 'border-rank-bronze/30' },
    silver: { text: 'text-rank-silver', bg: 'bg-rank-silver/10', border: 'border-rank-silver/30' },
    gold: { text: 'text-rank-gold', bg: 'bg-rank-gold/10', border: 'border-rank-gold/30' },
    platinum: { text: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/30' },
    diamond: { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' },
    master: { text: 'text-purple-600', bg: 'bg-purple-600/10', border: 'border-purple-600/30' },
    grandmaster: { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    champion: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    legend: { text: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
    immortal: { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

export const LeaguesPage = ({ isOpen, onClose }: LeaguesPageProps) => {
    const { stats, getLeague, debugLeagueOverride } = useGameStore();

    // Calculate current league based on monthly XP
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

    const currentLeague = debugLeagueOverride || getLeague();
    const currentLeagueIndex = LEAGUE_ORDER.indexOf(currentLeague);

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
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                >
                                    <Trophy className="w-6 h-6 text-rank-gold" />
                                </motion.div>
                                <div>
                                    <h1 className="font-heading font-bold text-lg">League Hall</h1>
                                    <p className="text-xs text-muted-foreground">
                                        Monthly XP: {monthlyXP.toLocaleString()} XP
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
                        {/* Current League Highlight */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "p-6 rounded-2xl border-2 mb-8",
                                LEAGUE_COLORS[currentLeague].bg,
                                LEAGUE_COLORS[currentLeague].border
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Current League</p>
                                    <h2 className={cn("text-2xl font-heading font-bold capitalize", LEAGUE_COLORS[currentLeague].text)}>
                                        {currentLeague}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {currentLeagueIndex < LEAGUE_ORDER.length - 1
                                            ? `${(LEAGUE_THRESHOLDS[LEAGUE_ORDER[currentLeagueIndex + 1]] - monthlyXP).toLocaleString()} XP to Next League`
                                            : 'Max League Reached'
                                        }
                                    </p>
                                </div>
                                <div className="relative w-28 h-28 flex-shrink-0 -mr-4">
                                    <div className="absolute inset-[-40%] w-[180%] h-[180%] flex items-center justify-center pointer-events-none">
                                        <div className="w-full h-full pointer-events-auto">
                                            <LeagueBadge3D league={currentLeague} level={stats.level} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* All Leagues */}
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            All Leagues
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {LEAGUE_ORDER.map((league, index) => {
                                const isPast = index < currentLeagueIndex;
                                const isCurrent = index === currentLeagueIndex;
                                const isFuture = index > currentLeagueIndex;
                                const colors = LEAGUE_COLORS[league];

                                return (
                                    <motion.div
                                        key={league}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "relative p-4 rounded-xl border-2 transition-all flex flex-col items-center overflow-visible",
                                            isCurrent && [colors.bg, colors.border, "ring-2 ring-offset-2 ring-offset-background"],
                                            isPast && [colors.bg, colors.border],
                                            isFuture && "bg-muted/20 border-muted/30 opacity-40"
                                        )}
                                    >
                                        {/* Badge */}
                                        <div className={cn(
                                            "relative w-18 h-18 flex-shrink-0 mb-2",
                                            isFuture && "filter grayscale brightness-[0.4] opacity-70"
                                        )}>
                                            <div className="absolute inset-[-40%] w-[180%] h-[180%] flex items-center justify-center pointer-events-none">
                                                <div className="w-full h-full pointer-events-auto">
                                                    <LeagueBadge3D league={league} level={stats.level} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <span className={cn(
                                            "text-sm font-semibold capitalize text-center",
                                            isCurrent && colors.text,
                                            isPast && colors.text,
                                            isFuture && "text-muted-foreground"
                                        )}>
                                            {league}
                                        </span>

                                        {/* XP Required */}
                                        <span className="text-[10px] text-muted-foreground mt-1">
                                            {LEAGUE_THRESHOLDS[league].toLocaleString()} XP
                                        </span>

                                        {/* Current indicator */}
                                        {isCurrent && (
                                            <motion.div
                                                className="absolute -top-2 -right-2"
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <Sparkles className={cn("w-5 h-5", colors.text)} />
                                            </motion.div>
                                        )}

                                        {/* Checkmark for past leagues */}
                                        {isPast && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                                                <span className="text-white text-[10px]">✓</span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Next League Progress */}
                        {currentLeagueIndex < LEAGUE_ORDER.length - 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 p-4 rounded-xl glass border border-border/50"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Next League</span>
                                    <span className={cn("text-sm font-semibold capitalize", LEAGUE_COLORS[LEAGUE_ORDER[currentLeagueIndex + 1]].text)}>
                                        {LEAGUE_ORDER[currentLeagueIndex + 1]}
                                    </span>
                                </div>
                                <div className="h-3 rounded-full bg-muted overflow-hidden">
                                    <motion.div
                                        className={cn("h-full rounded-full", `bg-gradient-to-r from-${currentLeague === 'bronze' ? 'amber-600' : 'primary'} to-${LEAGUE_COLORS[LEAGUE_ORDER[currentLeagueIndex + 1]].text.replace('text-', '')}`)}
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${Math.min(100, (monthlyXP / LEAGUE_THRESHOLDS[LEAGUE_ORDER[currentLeagueIndex + 1]]) * 100)}%`
                                        }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        style={{
                                            background: `linear-gradient(to right, var(--primary), var(--xp))`
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    {(LEAGUE_THRESHOLDS[LEAGUE_ORDER[currentLeagueIndex + 1]] - monthlyXP).toLocaleString()} XP to go
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div >
            )}
        </AnimatePresence >
    );
};

