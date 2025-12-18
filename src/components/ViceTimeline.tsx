import { motion } from 'framer-motion';
import { Vice, getTodayDate, DEBUG_DATE_OFFSET } from '@/stores/gameStore';
import { Shield, ShieldCheck, Skull, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViceTimelineProps {
    vice: Vice;
}

// Get the last 7 days including today
const getLast7Days = (): string[] => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() + DEBUG_DATE_OFFSET - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
};

const getDayLabel = (dateStr: string): string => {
    const today = getTodayDate();
    const date = new Date(dateStr);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - date.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const ViceTimeline = ({ vice }: ViceTimelineProps) => {
    const days = getLast7Days();
    const today = getTodayDate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
        >
            {/* Scrollable container */}
            <div className="overflow-x-auto scrollbar-hide pb-2">
                <div className="flex items-center justify-between min-w-[400px] px-2">
                    {/* Track line */}
                    <div className="absolute left-4 right-4 top-1/2 h-1 bg-gradient-to-r from-red-500/20 via-red-500/40 to-red-500/20 rounded-full -translate-y-1/2 z-0" />

                    {days.map((date, index) => {
                        const status = vice.history[date];
                        const isToday = date === today;
                        const isPending = isToday && vice.lastCheckIn !== today;

                        return (
                            <motion.div
                                key={date}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * index }}
                                className="relative z-10 flex flex-col items-center"
                            >
                                {/* Node */}
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                                        status === 'clean' && "bg-green-500/20 border-2 border-green-500 shadow-lg shadow-green-500/30",
                                        status === 'relapsed' && "bg-red-900/50 border-2 border-red-500/50",
                                        isPending && "bg-orange-500/20 border-2 border-orange-400 animate-pulse",
                                        !status && !isPending && "bg-muted/30 border-2 border-muted"
                                    )}
                                >
                                    {status === 'clean' && (
                                        <ShieldCheck className="w-6 h-6 text-green-500" />
                                    )}
                                    {status === 'relapsed' && (
                                        <Skull className="w-6 h-6 text-red-500" />
                                    )}
                                    {isPending && (
                                        <Circle className="w-6 h-6 text-orange-400 fill-orange-400/30" />
                                    )}
                                    {!status && !isPending && (
                                        <Shield className="w-5 h-5 text-muted-foreground/50" />
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        "text-[10px] mt-2 font-medium",
                                        isToday ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {getDayLabel(date)}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};
