import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { StreakFlame } from './StreakFlame';

export const StreakCalendar = () => {
  const { stats } = useGameStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { days, monthLabel, streak } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    // Day names for the header
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const daysInMonth: { date: string; day: number; xp: number; isToday: boolean; isPadding: boolean; dayName: string }[] = [];

    // Padding days
    for (let i = 0; i < startPadding; i++) {
      daysInMonth.push({ date: '', day: 0, xp: 0, isToday: false, isPadding: true, dayName: '' });
    }

    const today = new Date().toISOString().split('T')[0];

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = stats.dailyXP.find(d => d.date === dateStr);
      const dateObj = new Date(year, month, day);

      daysInMonth.push({
        date: dateStr,
        day,
        xp: dayData?.xp || 0,
        isToday: dateStr === today,
        isPadding: false,
        dayName: dayNames[dateObj.getDay()],
      });
    }

    const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return { days: daysInMonth, monthLabel, streak: stats.streak };
  }, [currentMonth, stats.dailyXP, stats.streak]);

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDayStatus = (xp: number, isToday: boolean) => {
    if (xp > 0) return 'completed';
    if (isToday) return 'current';
    // Check if it's a past day missed (streak freeze logic could go here later)
    return 'missed';
  };

  return (
    <div className="p-6 rounded-3xl glass border border-border/50 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <StreakFlame streak={streak} size="sm" animated={false} />
          <span className="font-heading font-bold text-lg">Streak Calendar</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 rounded-full p-1 border border-white/5">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold min-w-[100px] text-center">
            {monthLabel}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-xs font-bold text-muted-foreground/60 text-center uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          if (day.isPadding) {
            return <div key={i} className="aspect-square" />;
          }

          const status = getDayStatus(day.xp, day.isToday);
          const isCompleted = status === 'completed';

          // Get intensity color for background if completed
          let bgClass = "bg-muted/10 border-white/5";
          if (isCompleted) {
            if (day.xp > 100) bgClass = "bg-orange-500 border-orange-400 shadow-orange-500/20 shadow-lg";
            else if (day.xp > 50) bgClass = "bg-orange-400 border-orange-300";
            else bgClass = "bg-orange-300 border-orange-200";
          } else if (day.isToday) {
            bgClass = "bg-muted/30 border-orange-500 border-2";
          }

          return (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className="relative aspect-[0.85] w-full"
            >
              <div
                className={cn(
                  "w-full h-full rounded-xl border flex flex-col items-center justify-between p-1 transition-all duration-300",
                  bgClass,
                  isCompleted ? "text-white" : "text-muted-foreground"
                )}
              >
                {/* Date Label (small on top) */}
                <span className="text-[10px] font-bold opacity-80">
                  {day.day}
                </span>

                {/* Big Checkmark or Dot */}
                <div className="flex-1 flex items-center justify-center">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-6 h-6 stroke-[4]" />
                    </motion.div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
