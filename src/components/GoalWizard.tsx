import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, X, Target, Dumbbell, Brain, BookOpen, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { GoalType, GoalTemplate, GoalExercise, useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const templates: {
  value: GoalTemplate;
  label: string;
  icon: typeof Target;
  description: string;
  defaultType: GoalType;
}[] = [
    { value: 'fitness', label: 'Fitness', icon: Dumbbell, description: 'Progressive overload training', defaultType: 'progressive' },
    { value: 'reading', label: 'Reading', icon: BookOpen, description: 'Track books, pages, or learning', defaultType: 'accumulator' },
    { value: 'meditation', label: 'Habits', icon: Brain, description: 'Build consistent habits', defaultType: 'frequency' },
    { value: 'custom', label: 'Custom', icon: Target, description: 'Create your own goal', defaultType: 'progressive' },
  ];

const goalTypes: { value: GoalType; label: string; description: string }[] = [
  { value: 'progressive', label: 'Progressive', description: 'Starts easy, increases over time (fitness)' },
  { value: 'accumulator', label: 'Accumulator', description: 'Track total volume (reading, savings)' },
  { value: 'frequency', label: 'Frequency', description: 'X times per week with optional intensity' },
];

const unitPresets: Record<GoalTemplate, { label: string; value: GoalExercise['unit'] }[]> = {
  fitness: [
    { label: 'Reps', value: 'reps' },
    { label: 'Minutes', value: 'minutes' },
    { label: 'Sessions', value: 'sessions' },
  ],
  reading: [
    { label: 'Pages', value: 'pages' },
    { label: 'Books', value: 'books' },
    { label: 'Minutes', value: 'minutes' },
  ],
  meditation: [
    { label: 'Minutes', value: 'minutes' },
  ],
  custom: [
    { label: 'Reps', value: 'reps' },
    { label: 'Minutes', value: 'minutes' },
    { label: 'Pages', value: 'pages' },
    { label: 'Items', value: 'items' },
  ],
};

export const GoalWizard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<GoalTemplate>('custom');
  const [goalType, setGoalType] = useState<GoalType>('progressive');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  // Form Exercises allow string inputs for flexibility
  type FormExercise = {
    name: string;
    startAmount: string;
    targetAmount: string;
    unit: GoalExercise['unit'];
  };

  // Exercises/Tasks for the goal
  const [exercises, setExercises] = useState<FormExercise[]>([]);

  // Frequency fields
  const [weeklyTarget, setWeeklyTarget] = useState(3);

  // Accumulator fields - use string for input flexibility
  const [accumulatorTarget, setAccumulatorTarget] = useState('12');
  const [accumulatorUnit, setAccumulatorUnit] = useState<GoalExercise['unit']>('books');

  const { addGoal, activeView } = useGameStore();

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setTemplate('custom');
    setGoalType('progressive');
    setFrequency('daily');
    setExercises([]);
    setWeeklyTarget(3);
    setExercises([]);
    setWeeklyTarget(3);
    setAccumulatorTarget('12');
    setAccumulatorUnit('books');
  };

  const handleTemplateSelect = (t: typeof templates[0]) => {
    setTemplate(t.value);
    setGoalType(t.defaultType);

    // Pre-fill based on template
    if (t.value === 'fitness') {
      setFrequency('daily');
      setExercises([{ name: '', startAmount: '10', targetAmount: '50', unit: 'reps' }]);
    } else if (t.value === 'reading') {
      setFrequency('weekly');
      setAccumulatorUnit('books');
    } else if (t.value === 'meditation') {
      // Atomic Habits: Start with 2-minute rule, daily by default
      setFrequency('daily');
      setWeeklyTarget(7);
      // Start at 2 minutes (Two-Minute Rule), target set by user (default 30 mins)
      setExercises([{ name: '', startAmount: '2', targetAmount: '30', unit: 'minutes' }]);
    } else {
      setExercises([]);
    }

    setStep(2);
  };

  const addExercise = () => {
    const defaultUnit = template === 'fitness' ? 'reps' : template === 'meditation' ? 'minutes' : 'reps';
    setExercises([...exercises, { name: '', startAmount: '10', targetAmount: '50', unit: defaultUnit }]);
  };

  const updateExercise = (index: number, updates: Partial<FormExercise>) => {
    setExercises(exercises.map((e, i) => i === index ? { ...e, ...updates } : e));
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Build exercises array with proper IDs
    let builtExercises: GoalExercise[];

    try {
      builtExercises = exercises
        .filter(e => e.name?.trim())
        .map(e => {
          // Atomic Habits (Two-Minute Rule): For habits with minutes, always start at 2 mins
          const isAtomicHabit = template === 'meditation' && e.unit === 'minutes';

          // Parse amounts with fallback to 1 as requested if empty/0
          const parsedStart = parseInt(e.startAmount) || 1;
          const parsedTarget = parseInt(e.targetAmount) || 1;

          const startingAmount = isAtomicHabit ? 2 : parsedStart;

          // Validation: Target must be > Start (unless Atomic Habit which handles itself)
          if (!isAtomicHabit && parsedTarget <= startingAmount) {
            throw new Error(`Target for "${e.name}" must be higher than Start amount (${startingAmount})`);
          }

          // Validation: Target is required
          if (!parsedTarget || parsedTarget <= 0) {
            throw new Error(`Target Goal for "${e.name}" is required`);
          }

          return {
            id: crypto.randomUUID(),
            name: e.name.trim(),
            targetAmount: parsedTarget,
            startAmount: parsedStart, // Keep original for reference
            // Atomic Habits: Start at 2 mins regardless of input
            currentAmount: startingAmount,
            unit: e.unit || 'reps',
            daysAtCurrentTarget: 0,
          };
        });

    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
      return;
    }

    addGoal({
      title: title.trim(),
      type: goalType,
      template,
      exercises: builtExercises,
      params: {
        frequency,
        weeklyTarget: (goalType === 'frequency' || frequency === 'weekly') ? weeklyTarget : undefined,
        weeklyProgress: 0,
        targetValue: goalType === 'accumulator' ? (parseInt(accumulatorTarget) || 1) : undefined,
        totalCompleted: 0,
        unit: goalType === 'accumulator' ? accumulatorUnit : undefined,
      },
    });

    resetForm();
    setIsOpen(false);
  };

  // Only show in goals view
  if (activeView !== 'goals') return null;

  return (
    <>
      {/* FAB Button - Green for goals */}
      <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 flex justify-center items-center z-40 pointer-events-none">
        {/* Backdrop Glow */}
        <div className="absolute w-20 h-20 bg-black/40 blur-xl rounded-full" />
        <motion.button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-success text-success-foreground flex items-center justify-center glow-success shadow-lg pointer-events-auto relative"
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
              onClick={() => { setIsOpen(false); resetForm(); }}
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
                onClick={() => { setIsOpen(false); resetForm(); }}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full hover:bg-muted/50 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step 1: Template Selection */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="font-heading font-bold text-lg sm:text-xl mb-1 text-success">New Goal</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">Choose a template to get started</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((t) => (
                        <motion.button
                          key={t.value}
                          type="button"
                          onClick={() => handleTemplateSelect(t)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-left group hover:border-success/50",
                            "border-border/50 bg-card/50"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <t.icon className="w-6 h-6 mb-2 text-success group-hover:scale-110 transition-transform" />
                          <div className="font-heading font-semibold text-sm">{t.label}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">{t.description}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Configuration */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Back button */}
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>

                      <div>
                        <h2 className="font-heading font-bold text-lg sm:text-xl mb-1 text-success">Configure Goal</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">Set up your {template} goal</p>
                      </div>

                      {/* Goal Title */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">Goal Name</label>
                        <Input
                          type="text"
                          placeholder={template === 'fitness' ? "e.g., Get Stronger" : template === 'reading' ? "e.g., Read 12 Books" : "e.g., Daily Meditation"}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="h-11 text-base bg-muted/30 border-muted-foreground/20 focus:border-success"
                          autoFocus
                        />
                      </div>

                      {/* Goal Type (for custom) */}
                      {template === 'custom' && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">Goal Type</label>
                          <div className="space-y-2">
                            {goalTypes.map((type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => {
                                  setGoalType(type.value);
                                  if (type.value === 'progressive' || type.value === 'frequency') {
                                    if (exercises.length === 0) {
                                      setExercises([{ name: '', startAmount: '10', targetAmount: '50', unit: 'reps' }]);
                                    }
                                  } else {
                                    setExercises([]);
                                  }
                                }}
                                className={cn(
                                  "w-full p-3 rounded-xl border text-left transition-all",
                                  goalType === type.value
                                    ? "border-success bg-success/10"
                                    : "border-border/50 bg-muted/30 hover:bg-muted/50"
                                )}
                              >
                                <div className="font-medium text-sm">{type.label}</div>
                                <div className="text-[10px] text-muted-foreground">{type.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Frequency for habits/intensity */}
                      {goalType === 'frequency' && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">Schedule</label>
                          <div className="flex gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => { setFrequency('daily'); setWeeklyTarget(7); }}
                              className={cn(
                                "flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all",
                                frequency === 'daily'
                                  ? "border-success bg-success/10 text-success"
                                  : "border-border/50 text-muted-foreground hover:bg-muted/50"
                              )}
                            >
                              Daily
                            </button>
                            <button
                              type="button"
                              onClick={() => setFrequency('weekly')}
                              className={cn(
                                "flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all",
                                frequency === 'weekly'
                                  ? "border-success bg-success/10 text-success"
                                  : "border-border/50 text-muted-foreground hover:bg-muted/50"
                              )}
                            >
                              Weekly
                            </button>
                          </div>

                          {frequency === 'weekly' && (
                            <div>
                              <label className="text-[10px] text-muted-foreground mb-2 block">Days per Week</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => setWeeklyTarget(n)}
                                    className={cn(
                                      "flex-1 h-10 rounded-lg font-mono text-sm transition-all",
                                      weeklyTarget === n
                                        ? "bg-success text-success-foreground"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                    )}
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Exercises/Tasks (for progressive and frequency with intensity) */}
                      {(goalType === 'progressive' || (goalType === 'frequency' && template === 'meditation')) && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground">
                              {goalType === 'progressive' ? 'Exercises / Daily Tasks' : 'Habit with Intensity'}
                            </label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={addExercise}
                              className="text-xs h-7 text-success hover:text-success"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Task
                            </Button>
                          </div>

                          {exercises.map((exercise, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-3"
                            >
                              <div className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  placeholder="e.g., Pushups, Meditation, Reading..."
                                  value={exercise.name || ''}
                                  onChange={(e) => updateExercise(index, { name: e.target.value })}
                                  className="h-9 text-sm flex-1"
                                />
                                {exercises.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeExercise(index)}
                                    className="h-9 w-9 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-muted-foreground mb-1 block">Start At</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={exercise.startAmount}
                                    onChange={(e) => updateExercise(index, { startAmount: e.target.value })}
                                    className="h-8 text-sm font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground mb-1 block">Target Goal</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={exercise.targetAmount}
                                    onChange={(e) => updateExercise(index, { targetAmount: e.target.value })}
                                    className="h-8 text-sm font-mono"
                                  />
                                </div>
                              </div>

                              {/* Unit preset chips */}
                              <div className="flex flex-wrap gap-1">
                                {unitPresets[template].map((preset) => (
                                  <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => updateExercise(index, { unit: preset.value })}
                                    className={cn(
                                      "px-2 py-1 rounded-full text-[10px] font-medium transition-all",
                                      exercise.unit === preset.value
                                        ? "bg-success text-success-foreground"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                    )}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          ))}

                          {exercises.length === 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addExercise}
                              className="w-full h-20 border-dashed border-2 text-muted-foreground hover:text-foreground hover:border-success/50"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Your First Task
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Accumulator Fields */}
                      {goalType === 'accumulator' && (
                        <>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Target Total</label>
                            <Input
                              type="number"
                              min="0"
                              value={accumulatorTarget}
                              onChange={(e) => setAccumulatorTarget(e.target.value)}
                              className="h-10 font-mono"
                            />
                          </div>

                          {/* Unit chips for accumulator */}
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Unit</label>
                            <div className="flex flex-wrap gap-2">
                              {unitPresets[template].map((preset) => (
                                <button
                                  key={preset.value}
                                  type="button"
                                  onClick={() => setAccumulatorUnit(preset.value)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                    accumulatorUnit === preset.value
                                      ? "bg-success text-success-foreground"
                                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                  )}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Frequency selector (for progressive/accumulator) */}
                      {(goalType === 'progressive' || goalType === 'accumulator') && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">Task Frequency</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setFrequency('daily')}
                              className={cn(
                                "flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all",
                                frequency === 'daily'
                                  ? "border-success bg-success/10 text-success"
                                  : "border-border/50 text-muted-foreground hover:bg-muted/50"
                              )}
                            >
                              Daily
                            </button>
                            <button
                              type="button"
                              onClick={() => setFrequency('weekly')}
                              className={cn(
                                "flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all",
                                frequency === 'weekly'
                                  ? "border-success bg-success/10 text-success"
                                  : "border-border/50 text-muted-foreground hover:bg-muted/50"
                              )}
                            >
                              Weekly
                            </button>
                          </div>
                        </div>
                      )}


                      {/* Weekly frequency target */}
                      {(goalType === 'progressive' || goalType === 'accumulator') && frequency === 'weekly' && (
                        <div className="mt-4">
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">Days per Week</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setWeeklyTarget(n)}
                                className={cn(
                                  "flex-1 h-10 rounded-lg font-mono text-sm transition-all",
                                  weeklyTarget === n
                                    ? "bg-success text-success-foreground"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                )}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preview */}
                      {title && exercises.length > 0 && exercises[0].name && (goalType === 'progressive' || goalType === 'frequency') && (
                        <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                          <p className="text-xs text-success font-medium mb-1">First Tasks:</p>
                          {exercises.filter(e => e.name).map((ex, i) => {
                            // Atomic Habits logic for preview
                            const isAtomic = template === 'meditation' && ex.unit === 'minutes';
                            const displayStart = isAtomic ? '2' : (ex.startAmount || '1');
                            const displayTarget = ex.targetAmount || '50';

                            return (
                              <p key={i} className="text-xs text-muted-foreground">
                                • {ex.name}: <span className="font-mono font-bold text-foreground">{displayStart}/{displayTarget} {ex.unit}</span>
                                <span className="text-muted-foreground/70 ml-1">({frequency === 'daily' ? 'Daily' : 'Weekly'})</span>
                              </p>
                            );
                          })}
                          <p className="text-[10px] text-muted-foreground mt-2">
                            Increases by 5% every 3 successful completions
                          </p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={!title.trim() || ((goalType === 'progressive' || (goalType === 'frequency' && template === 'meditation')) && exercises.filter(e => e.name?.trim()).length === 0)}
                        className="w-full h-11 text-base font-heading font-semibold gap-2 bg-success hover:bg-success/90 text-success-foreground"
                      >
                        <Target className="w-4 h-4" />
                        Create Goal
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
