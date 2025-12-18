import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';
import { useTutorialStore } from '@/stores/tutorialStore';
import { OnboardingOverlay } from './OnboardingOverlay';

type StepConfig = {
  title: string;
  body: string;
  selector: string | null;
  canGoNext: boolean;
  primaryLabel: string;
  onPrimary: () => void;
};

export const PlayableTutorial = () => {
  const tasks = useGameStore((s) => s.tasks);
  const activeView = useGameStore((s) => s.activeView);
  const setActiveView = useGameStore((s) => s.setActiveView);

  const open = useTutorialStore((s) => s.open);
  const step = useTutorialStore((s) => s.step);
  const hydrateFromStorage = useTutorialStore((s) => s.hydrateFromStorage);
  const next = useTutorialStore((s) => s.next);
  const prev = useTutorialStore((s) => s.prev);
  const skip = useTutorialStore((s) => s.skip);
  const finish = useTutorialStore((s) => s.finish);
  const spotlightTaskId = useTutorialStore((s) => s.spotlightTaskId);
  const setSpotlightTaskId = useTutorialStore((s) => s.setSpotlightTaskId);
  const tasksCountAtStep2 = useTutorialStore((s) => s.tasksCountAtStep2);
  const setTasksCountAtStep2 = useTutorialStore((s) => s.setTasksCountAtStep2);

  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // Ensure we're on tasks view for the early tutorial steps.
  useEffect(() => {
    if (!open) return;
    if (step <= 3 && activeView !== 'tasks') setActiveView('tasks');
  }, [open, step, activeView, setActiveView]);

  // Listen for Add Quest modal open/close
  useEffect(() => {
    const onOpen = () => setAddModalOpen(true);
    const onClose = () => setAddModalOpen(false);
    window.addEventListener('questline-add-quest-opened', onOpen);
    window.addEventListener('questline-add-quest-closed', onClose);
    return () => {
      window.removeEventListener('questline-add-quest-opened', onOpen);
      window.removeEventListener('questline-add-quest-closed', onClose);
    };
  }, []);

  // Step 2 baseline: tasks count at entry.
  useEffect(() => {
    if (!open) return;
    if (step !== 2) return;
    if (tasksCountAtStep2 !== null) return;
    setTasksCountAtStep2(tasks.length);
  }, [open, step, tasks.length, tasksCountAtStep2, setTasksCountAtStep2]);

  // Auto-advance: Step 1 -> Step 2 once modal is opened
  useEffect(() => {
    if (!open) return;
    if (step !== 1) return;
    if (!addModalOpen) return;
    next();
  }, [open, step, addModalOpen, next]);

  // Auto-advance: Step 2 -> Step 3 once task is created
  useEffect(() => {
    if (!open) return;
    if (step !== 2) return;
    if (tasksCountAtStep2 === null) return;
    if (tasks.length <= tasksCountAtStep2) return;

    // Spotlight the newest task (tasks are prepended).
    const newest = tasks[0];
    if (newest?.id) setSpotlightTaskId(newest.id);
    next();
  }, [open, step, tasks.length, tasksCountAtStep2, tasks, next, setSpotlightTaskId]);

  // Auto-advance: Step 3 -> Step 4 when a task is completed ("claim XP")
  useEffect(() => {
    if (!open) return;
    if (step !== 3) return;

    const handler = () => {
      next();
    };

    window.addEventListener('questline-tutorial-task-completed', handler);
    return () => window.removeEventListener('questline-tutorial-task-completed', handler);
  }, [open, step, next]);

  // Cleanup spotlight id when leaving Step 3
  useEffect(() => {
    if (!open) return;
    if (step === 3) return;
    if (spotlightTaskId) setSpotlightTaskId(null);
  }, [open, step, spotlightTaskId, setSpotlightTaskId]);

  const stepConfig: StepConfig = useMemo(() => {
    if (step === 0) {
      return {
        title: 'Welcome, Initiate.',
        body: "This interface tracks your life progression. Let’s calibrate your first protocol.",
        selector: null,
        canGoNext: true,
        primaryLabel: 'Start',
        onPrimary: next,
      };
    }

    if (step === 1) {
      return {
        title: 'Initiation (Create Task)',
        body: "Tap the '+' button to initialize a new Quest.",
        selector: '#add-task-btn',
        canGoNext: false,
        primaryLabel: 'Open +',
        onPrimary: () => {
          window.dispatchEvent(new Event('questline-open-add-quest'));
        },
      };
    }

    if (step === 2) {
      return {
        title: 'Calibration (Input)',
        body: 'Define your objective. Select a Difficulty Tier to determine the XP reward.',
        selector: '#add-task-modal',
        canGoNext: false,
        primaryLabel: 'Waiting…',
        onPrimary: () => {},
      };
    }

    if (step === 3) {
      return {
        title: 'Execution (Claiming)',
        body: 'Excellent. Now execute the protocol: check the circle to claim your XP.',
        selector: spotlightTaskId ? '#tutorial-task-card' : null,
        canGoNext: false,
        primaryLabel: 'Waiting…',
        onPrimary: () => {},
      };
    }

    if (step === 4) {
      return {
        title: 'The Economy (XP & Leagues)',
        body: 'XP fills your ring. Consistency determines your League (Bronze, Silver, Gold). Slacking off leads to demotion.',
        selector: '#xp-ring',
        canGoNext: true,
        primaryLabel: 'Next',
        onPrimary: next,
      };
    }

    if (step === 5) {
      return {
        title: 'Automation (Goals & Habits)',
        body: "Switch to 'Goals' to set long-term targets. The system auto-generates quests for you. Finished goals can be promoted into Habits (daily/weekly recurring quests).",
        selector: '#view-toggle-goals',
        canGoNext: true,
        primaryLabel: 'Next',
        onPrimary: next,
      };
    }

    return {
      title: 'Corruption (Vices)',
      body: "The 'Vices' tab tracks negative habits. Use the Timeline to maintain purity streaks. Good luck, Hunter.",
      selector: '#view-toggle-vices',
      canGoNext: true,
      primaryLabel: 'Finish',
      onPrimary: finish,
    };
  }, [step, next, finish, spotlightTaskId]);

  const messagePlacement = useMemo(() => {
    if (!stepConfig.selector) return 'bottom';
    const el = document.querySelector(stepConfig.selector) as HTMLElement | null;
    if (!el) return 'bottom';
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.45 ? 'bottom' : 'top';
  }, [stepConfig.selector]);

  if (!open) return null;

  return (
    <>
      <OnboardingOverlay targetSelector={stepConfig.selector} />

      {/* Companion message box (clickable) */}
      <div
        className={cn(
          'fixed left-0 right-0 z-[61] pointer-events-none',
          messagePlacement === 'top' ? 'top-14 sm:top-16' : 'bottom-4'
        )}
      >
        <div className="max-w-screen-sm mx-auto px-4 pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className={cn('glass-strong rounded-3xl border border-primary/30 p-5', 'shadow-lg')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Tutorial</p>
                    <h2 className="font-heading font-bold text-lg leading-tight">{stepConfig.title}</h2>
                  </div>
                </div>

                <Button variant="ghost" size="icon" onClick={skip} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{stepConfig.body}</p>

              <div className="mt-5 flex items-center justify-between gap-2">
                <Button variant="ghost" onClick={skip} className="text-muted-foreground">
                  Skip Tutorial
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={prev} disabled={step === 0}>
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>

                  <Button
                    onClick={stepConfig.onPrimary}
                    disabled={!stepConfig.canGoNext && stepConfig.primaryLabel !== 'Open +'}
                    variant={step === 1 ? 'secondary' : step === 6 ? 'default' : 'default'}
                  >
                    {stepConfig.primaryLabel}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 w-6 rounded-full transition-colors',
                      step === i ? 'bg-primary' : 'bg-muted/60'
                    )}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};
