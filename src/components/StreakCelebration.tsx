import { motion } from 'framer-motion';
import { StreakFlame } from './StreakFlame';

interface StreakCelebrationProps {
    streak: number;
}

const milestones = [7, 14, 30, 60, 100];

const getMotivationalText = (streak: number): string => {
    if (streak >= 100) return "LEGENDARY! You're unstoppable! 🏆";
    if (streak >= 60) return "Incredible dedication! 💪";
    if (streak >= 30) return "You're on fire! Keep blazing! 🔥";
    if (streak >= 14) return "Two weeks strong! Amazing! ✨";
    if (streak >= 7) return "One week down! Great start! 🌟";
    if (streak >= 3) return "Building momentum! 💫";
    if (streak >= 1) return "Every journey starts with day one! 🚀";
    return "Start your streak today! 💪";
};

export const StreakCelebration = ({ streak }: StreakCelebrationProps) => {
    const currentMilestone = milestones.find(m => streak < m) || milestones[milestones.length - 1];
    const previousMilestone = milestones[milestones.indexOf(currentMilestone) - 1] || 0;
    const progress = streak >= 100 ? 100 : ((streak - previousMilestone) / (currentMilestone - previousMilestone)) * 100;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500/10 to-orange-600/5 border border-orange-500/20 p-6">
            {/* Background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-orange-400/30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                {/* Large Flame */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                >
                    <StreakFlame streak={streak} size="lg" animated={true} />
                </motion.div>

                {/* Big Streak Number */}
                <motion.div
                    className="relative"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="font-heading font-black text-6xl sm:text-7xl bg-gradient-to-b from-orange-400 to-orange-600 bg-clip-text text-transparent">
                        {streak}
                    </span>
                    <span className="block text-sm text-muted-foreground font-medium tracking-wide">
                        DAY STREAK
                    </span>
                </motion.div>

                {/* Motivational Text */}
                <motion.p
                    className="text-lg font-semibold text-foreground/90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {getMotivationalText(streak)}
                </motion.p>

                {/* Progress Timeline */}
                <motion.div
                    className="w-full max-w-sm mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-muted-foreground">
                            {previousMilestone === 0 ? 'Start' : `${previousMilestone} days`}
                        </span>
                        <span className="text-xs font-semibold text-orange-500">
                            {currentMilestone} days
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                        />
                    </div>

                    {/* Milestone markers */}
                    <div className="flex justify-between mt-3">
                        {milestones.map((milestone) => (
                            <div key={milestone} className="flex flex-col items-center">
                                <motion.div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${streak >= milestone
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                    animate={streak >= milestone ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.5 }}
                                >
                                    {streak >= milestone ? '✓' : milestone}
                                </motion.div>
                                <span className="text-[10px] text-muted-foreground mt-1 hidden sm:block">
                                    {milestone}d
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
