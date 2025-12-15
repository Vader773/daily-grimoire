import { motion, AnimatePresence } from 'framer-motion';

interface XPFloaterProps {
  xp: number;
  isVisible: boolean;
  onComplete: () => void;
}

export const XPFloater = ({ xp, isVisible, onComplete }: XPFloaterProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -20, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 1.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onAnimationComplete={onComplete}
        >
          <span className="font-mono font-bold text-4xl text-success drop-shadow-[0_0_20px_hsl(var(--success)/0.8)]">
            +{xp} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
