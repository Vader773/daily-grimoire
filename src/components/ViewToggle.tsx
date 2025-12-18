import { motion } from 'framer-motion';
import { Swords, Target, Repeat, Skull } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

export const ViewToggle = () => {
  const { activeView, setActiveView } = useGameStore();

  const views = [
    { key: 'tasks' as const, label: 'Tasks', icon: Swords, color: 'bg-primary', textColor: 'text-primary-foreground' },
    { key: 'goals' as const, label: 'Goals', icon: Target, color: 'bg-success', textColor: 'text-success-foreground' },
    { key: 'habits' as const, label: 'Habits', icon: Repeat, color: 'bg-purple-500', textColor: 'text-white' },
    { key: 'vices' as const, label: 'Vices', icon: Skull, color: 'bg-red-500', textColor: 'text-white' },
  ];

  const activeIndex = views.findIndex(v => v.key === activeView);
  const buttonWidth = 100 / views.length; // Each button takes equal percentage

  return (
    <div className="flex justify-center px-2">
      <motion.div
        className="relative inline-flex items-center p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg overflow-hidden w-full max-w-md sm:max-w-none sm:w-auto"
        layout
      >
        {/* Animated background indicator - use left percentage instead of transform */}
        <motion.div
          className={cn(
            "absolute top-1 bottom-1 sm:top-1.5 sm:bottom-1.5 rounded-lg sm:rounded-xl transition-colors duration-300",
            views[activeIndex]?.color || 'bg-primary'
          )}
          initial={false}
          animate={{
            left: `calc(${activeIndex * buttonWidth}% + 4px)`,
            width: `calc(${buttonWidth}% - 8px)`,
          }}
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
          key={activeView}
        />

        {views.map((view) => (
          <motion.button
            key={view.key}
            onClick={() => setActiveView(view.key)}
            className={cn(
              "relative z-10 flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1 sm:gap-2 justify-center",
              activeView === view.key
                ? view.textColor
                : "text-muted-foreground hover:text-foreground"
            )}
            whileTap={{ scale: 0.95 }}
          >
            <view.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{view.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};
