import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'questline-onboarding-v1';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const OnboardingTour = () => {
  const tasks = useGameStore(s => s.tasks);
  const goals = useGameStore(s => s.goals);
  const habits = useGameStore(s => s.habits);
  const vices = useGameStore(s => s.vices);
  const activeView = useGameStore(s => s.activeView);
  const setActiveView = useGameStore(s => s.setActiveView);

  const hasAnyTasks = useMemo(() => tasks.length > 0, [tasks.length]);
  const hasCompletedAnyTask = useMemo(() => tasks.some(t => t.completed), [tasks]);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        setOpen(true);
        setStep(0);
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-advance after first task is created
  useEffect(() => {
    if (!open) return;
    if (step !== 1) return;
    if (!hasAnyTasks) return;
    setStep(2);
  }, [open, step, hasAnyTasks]);

  // Auto-advance after first task is completed ("claim" the XP)
  useEffect(() => {
    if (!open) return;
    if (step !== 2) return;
    if (!hasCompletedAnyTask) return;
    setStep(3);
  }, [open, step, hasCompletedAnyTask]);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setOpen(false);
  };

  const goNext = () => setStep(s => (s < 6 ? ((s + 1) as Step) : s));
  const goPrev = () => setStep(s => (s > 0 ? ((s - 1) as Step) : s));

  const openCreateTask = () => {
    if (activeView !== 'tasks') setActiveView('tasks');
    window.dispatchEvent(new Event('questline-open-add-quest'));
    setStep(1);
  };

  const stepTitle =
    step === 0
      ? 'Welcome, Agent.'
      : step === 1
        ? 'Create your first quest'
        : step === 2
          ? 'Claim your first XP'
          : step === 3
            ? 'XP vs Leagues'
            : step === 4
              ? 'Goals = auto quests'
              : step === 5
                ? 'Habits (recurring quests)'
                : 'Vices (anti-streaks)';

  const stepBody =
    step === 0
      ? 'Complete quests to earn XP, level up, and climb monthly leagues. Ready to initialize your first mission?'
      : step === 1
        ? 'Tap the + button to create a quest. Once you create one, this tutorial continues automatically.'
        : step === 2
          ? 'Now complete any quest in your list to claim the XP reward. As soon as you finish one, we’ll continue automatically.'
          : step === 3
            ? 'Outer ring = Level XP (lifetime). Inner ring = League XP (monthly). Leagues reset monthly and determine your rank (Bronze → Immortal). Tap your avatar ring to open Statistics + the League Hall.'
            : step === 4
              ? `When you create a Goal, Questline auto-generates quests for it. Progress your goal by completing those goal-quests. (You currently have ${goals.length} goals.)`
              : step === 5
                ? `Finished goals can be promoted into Habits: recurring quests that repeat daily/weekly. Keep streaks alive. (You currently have ${habits.length} habits.)`
                : `Vices work like anti-streaks. You check in clean/relapse daily, and Questline tracks your streak + history. (You currently have ${vices.length} vices.)`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm"
            onClick={() => {
              // Clicking backdrop does nothing; user must choose skip/finish.
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-[61]"
          >
            <div className="max-w-screen-sm mx-auto p-4">
              <div className={cn('glass-strong rounded-3xl border border-border/60 p-5')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Onboarding</p>
                      <h2 className="font-heading font-bold text-lg leading-tight">{stepTitle}</h2>
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" onClick={finish} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{stepBody}</p>

                <div className="mt-5 flex items-center justify-between gap-2">
                  <Button variant="ghost" onClick={finish} className="text-muted-foreground">
                    Skip
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={goPrev} disabled={step === 0}>
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>

                    {step === 0 && (
                      <Button onClick={openCreateTask}>
                        Begin
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}

                    {step === 1 && (
                      <Button onClick={openCreateTask} variant="secondary">
                        Open Creator
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}

                    {step === 2 && (
                      <Button onClick={goNext} disabled={!hasCompletedAnyTask}>
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}

                    {step >= 3 && step < 6 && (
                      <Button onClick={goNext}>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}

                    {step === 6 && (
                      <Button onClick={finish} className="bg-success text-success-foreground hover:bg-success/90">
                        Finish
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 w-6 rounded-full transition-colors',
                        step === i ? 'bg-primary' : 'bg-muted/60'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
