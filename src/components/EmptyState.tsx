import { motion } from 'framer-motion';
import { Sword, Sparkles, Target } from 'lucide-react';

export const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 w-full"
    >
      <motion.div
        className="relative mb-6 flex flex-col items-center"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Sword - centered above stone */}
        <motion.div
          className="relative z-10"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="relative flex items-center justify-center">
            <Sword className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50" />
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-primary/50" />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Stone base - centered below sword */}
        <div className="w-20 h-6 sm:w-24 sm:h-8 bg-gradient-to-t from-muted to-muted/50 rounded-lg shadow-lg -mt-3" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10" />
      </motion.div>

      <div className="space-y-2 flex flex-col items-center text-center">
        <h3 className="font-heading font-bold text-base sm:text-lg text-muted-foreground flex items-center justify-center gap-2">
          <Target className="w-4 h-4" />
          No Active Quests
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground/70 max-w-[220px] sm:max-w-[250px]">
          Initialize protocols. Your adventure awaits below.
        </p>
      </div>
    </motion.div>
  );
};