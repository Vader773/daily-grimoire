import { motion } from 'framer-motion';
import { Target, Sparkles } from 'lucide-react';

export const EmptyGoalState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 sm:py-16 px-4"
    >
      <motion.div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success/10 flex items-center justify-center mb-4 sm:mb-6 relative"
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Target className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
        </motion.div>
      </motion.div>
      
      <h3 className="font-heading font-bold text-base sm:text-lg text-foreground mb-2 text-center">
        Set Your First Goal
      </h3>
      
      <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
        Goals help you build habits with auto-generated daily tasks. 
        Start with fitness, meditation, or create your own!
      </p>
      
      <motion.div 
        className="mt-4 sm:mt-6 flex items-center gap-2 text-success/80"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] sm:text-xs font-medium">Tap + to begin</span>
      </motion.div>
    </motion.div>
  );
};
