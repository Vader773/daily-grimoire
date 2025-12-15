import { motion } from 'framer-motion';
import { Swords, Target, Repeat } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

export const ViewToggle = () => {
  const { activeView, setActiveView } = useGameStore();

  const views = [
    { key: 'tasks' as const, label: 'Tasks', icon: Swords, color: 'bg-primary', textColor: 'text-primary-foreground' },
    { key: 'goals' as const, label: 'Goals', icon: Target, color: 'bg-success', textColor: 'text-success-foreground' },
    { key: 'habits' as const, label: 'Habits', icon: Repeat, color: 'bg-purple-500', textColor: 'text-white' },
  ];

  const activeIndex = views.findIndex(v => v.key === activeView);

  return (
    <div className="flex justify-center">
      <motion.div
        className="relative inline-flex items-center p-1.5 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg overflow-hidden"
        layout
      >
        {/* Animated background indicator */}
        <motion.div
          className={cn(
            "absolute h-[calc(100%-12px)] rounded-xl transition-colors duration-300",
            views[activeIndex]?.color || 'bg-primary'
          )}
          layout
          initial={false}
          animate={{
            x: `${activeIndex * 100}%`,
            width: `calc(${100 / views.length}% - 4px)`,
          }}
          style={{ left: 6 }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />

        {/* Scanline effect overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.1) 2px, hsl(var(--foreground) / 0.1) 4px)',
          }}
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 0.1, repeat: 0 }}
          key={activeView} // Trigger on view change
        />

        {views.map((view) => (
          <motion.button
            key={view.key}
            onClick={() => setActiveView(view.key)}
            className={cn(
              "relative z-10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 min-w-[90px] justify-center",
              activeView === view.key
                ? view.textColor
                : "text-muted-foreground hover:text-foreground"
            )}
            whileTap={{ scale: 0.95 }}
          >
            <view.icon className="w-4 h-4" />
            <span>{view.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};
