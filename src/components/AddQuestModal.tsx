import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Zap, Timer } from 'lucide-react';
import { Difficulty, useGameStore } from '@/stores/gameStore';
import { DifficultySelector } from './DifficultySelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const AddQuestModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  // Load last used difficulty from localStorage, default to 'easy'
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const saved = localStorage.getItem('questline-last-difficulty');
    return (saved as Difficulty) || 'easy';
  });
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const { addTask } = useGameStore();

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('questline-open-add-quest', handler);
    return () => window.removeEventListener('questline-open-add-quest', handler);
  }, []);

  const showTimerOption = difficulty === 'hard' || difficulty === 'boss';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(title.trim(), difficulty, showTimerOption && timerEnabled ? timerMinutes : undefined);
    setTitle('');
    // Don't reset difficulty - keep the last used one
    setTimerEnabled(false);
    setTimerMinutes(30);
    setIsOpen(false);
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    // Save to localStorage so it persists next time
    localStorage.setItem('questline-last-difficulty', newDifficulty);
    if (newDifficulty !== 'hard' && newDifficulty !== 'boss') {
      setTimerEnabled(false);
    }
  };

  return (
    <>
      {/* FAB Button - Centered using flexbox */}
      <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <motion.button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-primary shadow-lg pointer-events-auto"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 glass-strong rounded-t-3xl p-4 sm:p-6 pb-6 sm:pb-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4 sm:mb-6" />

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full hover:bg-muted/50 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 sm:space-y-6"
                onKeyDown={(e) => {
                  // If Enter pressed on a button (like difficulty selector), manually submit
                  if (e.key === 'Enter' && (e.target as HTMLElement).getAttribute('type') === 'button') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              >
                <div>
                  <h2 className="font-heading font-bold text-lg sm:text-xl mb-1">New Quest</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Initialize your next mission objective</p>
                </div>

                {/* Task Input */}
                <Input
                  type="text"
                  placeholder="Enter Mission Objective..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 sm:h-12 text-sm sm:text-base bg-muted/30 border-muted-foreground/20 focus:border-primary"
                  autoFocus
                />

                {/* Difficulty Selector */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 block">
                    Select Difficulty
                  </label>
                  <DifficultySelector selected={difficulty} onSelect={handleDifficultyChange} />
                </div>

                {/* Focus Timer Option */}
                <AnimatePresence>
                  {showTimerOption && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-primary/20 space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-primary" />
                            <Label htmlFor="timer-toggle" className="text-xs sm:text-sm font-medium cursor-pointer">
                              Focus Timer
                            </Label>
                          </div>
                          <Switch
                            id="timer-toggle"
                            checked={timerEnabled}
                            onCheckedChange={setTimerEnabled}
                          />
                        </div>

                        <AnimatePresence>
                          {timerEnabled && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-2"
                            >
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                Set a timer. You can only complete this quest after starting the timer.
                              </p>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  max="480"
                                  value={timerMinutes}
                                  onChange={(e) => setTimerMinutes(Math.max(1, Math.min(480, parseInt(e.target.value) || 1)))}
                                  className="w-20 sm:w-24 h-9 sm:h-10 font-mono text-center"
                                />
                                <span className="text-xs sm:text-sm text-muted-foreground">minutes</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {[15, 30, 45, 60, 90, 120].map((mins) => (
                                  <button
                                    key={mins}
                                    type="button"
                                    onClick={() => setTimerMinutes(mins)}
                                    className={cn(
                                      "px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono transition-all",
                                      timerMinutes === mins
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                    )}
                                  >
                                    {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!title.trim()}
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-heading font-semibold gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Initiate Quest
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
