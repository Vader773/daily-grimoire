import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, getTodayDate, Vice } from '@/stores/gameStore';
import { Skull, Shield, ShieldCheck, AlertCircle, Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ViceTimeline } from './ViceTimeline';
import { ViceCheckIn } from './ViceCheckIn';

// Failure quotes for encouragement
const FAILURE_QUOTES = [
    "Fall seven times, stand up eight.",
    "Every master was once a disaster.",
    "The only real failure is the failure to try.",
    "You're not starting over, you're starting with experience.",
    "Progress, not perfection.",
    "A setback is a setup for a comeback.",
];

export const ViceList = () => {
    const { vices, checkMissedViceDays } = useGameStore();
    const [showQuote, setShowQuote] = useState<string | null>(null);

    // Check for missed days on mount
    useState(() => {
        checkMissedViceDays();
    });

    const today = getTodayDate();
    const activeVice = vices[0]; // Primary vice (One-Vice Rule)
    const needsCheckIn = activeVice && activeVice.lastCheckIn !== today;

    const handleFailure = () => {
        const randomQuote = FAILURE_QUOTES[Math.floor(Math.random() * FAILURE_QUOTES.length)];
        setShowQuote(randomQuote);
        setTimeout(() => setShowQuote(null), 5000);
    };

    // Empty state
    if (vices.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 px-4"
            >
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <Skull className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-heading font-bold text-center mb-2">
                    Select a Target to Eliminate
                </h3>
                <p className="text-muted-foreground text-center text-sm max-w-xs">
                    Choose a vice to conquer. Focus on one enemy at a time for maximum success.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="flex items-center justify-center gap-2 mb-1">
                    {activeVice.currentStreak > 0 ? (
                        <ShieldCheck className="w-8 h-8 text-green-500" />
                    ) : (
                        <Shield className="w-8 h-8 text-red-500/50" />
                    )}
                    <span className="text-4xl font-heading font-black">
                        <motion.span
                            key={activeVice.currentStreak}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-block"
                        >
                            {activeVice.currentStreak}
                        </motion.span>
                    </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                    DAYS CLEAN
                </h2>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <Trophy className="w-3 h-3 text-rank-gold" />
                    Best: {activeVice.longestStreak} Days
                </p>
            </motion.div>

            {/* Vice Title */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
            >
                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-semibold">
                    {activeVice.title}
                </span>
            </motion.div>

            {/* Timeline */}
            <ViceTimeline vice={activeVice} />

            {/* Check-In Card */}
            <AnimatePresence mode="wait">
                {needsCheckIn ? (
                    <ViceCheckIn
                        vice={activeVice}
                        onFailure={handleFailure}
                    />
                ) : (
                    <motion.div
                        key="completed"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center"
                    >
                        <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="font-heading font-bold text-green-500">
                            Today's Report Complete
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Return tomorrow to continue your streak.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Failure Quote */}
            <AnimatePresence>
                {showQuote && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-4 rounded-xl bg-muted/50 border border-border text-center"
                    >
                        <AlertCircle className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm italic text-muted-foreground">
                            "{showQuote}"
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
