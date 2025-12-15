import { useState, useCallback, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Header } from '@/components/Header';
import { XPRing } from '@/components/XPRing';
import { QuestList } from '@/components/QuestList';
import { GoalList } from '@/components/GoalList';
import { HabitList } from '@/components/HabitList';
import { AddQuestModal } from '@/components/AddQuestModal';
import { GoalWizard } from '@/components/GoalWizard';
import { HabitWizard } from '@/components/HabitWizard';
import { ViewToggle } from '@/components/ViewToggle';
import { XPFloater } from '@/components/XPFloater';

import { useGameStore } from '@/stores/gameStore';
import { AnimatePresence, motion } from 'framer-motion';

const Index = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXPFloater, setShowXPFloater] = useState(false);
  const [floaterXP, setFloaterXP] = useState(0);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const { activeView, checkAndGenerateDailyTasks } = useGameStore();

  // Check for daily task generation on mount
  useEffect(() => {
    checkAndGenerateDailyTasks();
  }, [checkAndGenerateDailyTasks]);

  const handleTaskComplete = useCallback((xp: number, leveledUp: boolean) => {
    // Show XP floater
    setFloaterXP(xp);
    setShowXPFloater(true);

    // Show confetti for level up or boss tasks
    if (leveledUp || xp >= 50) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // Trigger level up animation
    if (leveledUp) {
      setIsLevelingUp(true);
      setTimeout(() => setIsLevelingUp(false), 500);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 400}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
          recycle={false}
          numberOfPieces={150}
          gravity={0.3}
          colors={['#10b981', '#3b82f6', '#eab308', '#f97316']}
        />
      )}

      {/* XP Floater */}
      <XPFloater
        xp={floaterXP}
        isVisible={showXPFloater}
        onComplete={() => setShowXPFloater(false)}
      />

      <Header />

      <main className="w-full max-w-screen-lg mx-auto px-4 pt-16 sm:pt-20">
        {/* Compact Hero Section - XP Ring with integrated League */}
        <section className="py-4 sm:py-6 flex flex-col items-center">
          <XPRing isLevelingUp={isLevelingUp} />
        </section>

        {/* View Toggle - Protocol Selector */}
        <section className="mt-2 mb-6">
          <ViewToggle />
        </section>



        {/* Content based on active view with slide animation */}
        <section className="mt-2">
          <AnimatePresence mode="wait">
            {activeView === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <QuestList onTaskComplete={handleTaskComplete} />
              </motion.div>
            )}
            {activeView === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <GoalList />
              </motion.div>
            )}
            {activeView === 'habits' && (
              <motion.div
                key="habits"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <HabitList />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Add Quest FAB (shows in tasks view) */}
      <AddQuestModal />

      {/* Goal Wizard FAB (shows in goals view) */}
      <GoalWizard />

      {/* Habit Wizard FAB (shows in habits view) */}
      <HabitWizard />
    </div>
  );
};

export default Index;