import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Repeat, Dumbbell, Brain, BookOpen, ChevronRight, ChevronLeft, Trash2, Heart } from 'lucide-react';
import { GoalExercise, useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type HabitTemplate = 'fitness' | 'mindfulness' | 'learning' | 'custom';

const templates: {
    value: HabitTemplate;
    label: string;
    icon: typeof Repeat;
    description: string;
}[] = [
        { value: 'fitness', label: 'Fitness', icon: Dumbbell, description: 'Daily exercise routines' },
        { value: 'mindfulness', label: 'Mindfulness', icon: Brain, description: 'Meditation & wellness' },
        { value: 'learning', label: 'Learning', icon: BookOpen, description: 'Reading & skill building' },
        { value: 'custom', label: 'Custom', icon: Heart, description: 'Create your own habit' },
    ];

const unitPresets: Record<HabitTemplate, { label: string; value: GoalExercise['unit'] }[]> = {
    fitness: [
        { label: 'Reps', value: 'reps' },
        { label: 'Minutes', value: 'minutes' },
    ],
    mindfulness: [
        { label: 'Minutes', value: 'minutes' },
        { label: 'Sessions', value: 'sessions' },
    ],
    learning: [
        { label: 'Pages', value: 'pages' },
        { label: 'Minutes', value: 'minutes' },
        { label: 'Books', value: 'books' },
    ],
    custom: [
        { label: 'Reps', value: 'reps' },
        { label: 'Minutes', value: 'minutes' },
        { label: 'Pages', value: 'pages' },
        { label: 'Sessions', value: 'sessions' },
    ],
};

export const HabitWizard = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);

    // Form state
    const [title, setTitle] = useState('');
    const [template, setTemplate] = useState<HabitTemplate>('custom');
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
    const [weeklyTarget, setWeeklyTarget] = useState(3);

    // Exercises for the habit
    const [exercises, setExercises] = useState<Partial<GoalExercise>[]>([]);

    const { addHabit, activeView } = useGameStore();

    const resetForm = () => {
        setStep(1);
        setTitle('');
        setTemplate('custom');
        setFrequency('daily');
        setWeeklyTarget(3);
        setExercises([]);
    };

    const handleTemplateSelect = (t: typeof templates[0]) => {
        setTemplate(t.value);

        // Pre-fill based on template
        if (t.value === 'fitness') {
            setFrequency('daily');
            setExercises([{ name: '', currentAmount: 30, unit: 'reps' }]);
        } else if (t.value === 'mindfulness') {
            setFrequency('daily');
            setExercises([{ name: '', currentAmount: 10, unit: 'minutes' }]);
        } else if (t.value === 'learning') {
            setFrequency('daily');
            setExercises([{ name: '', currentAmount: 20, unit: 'pages' }]);
        } else {
            setExercises([]);
        }

        setStep(2);
    };

    const addExercise = () => {
        setExercises([...exercises, { name: '', currentAmount: 10, unit: 'minutes' }]);
    };

    const updateExercise = (index: number, updates: Partial<GoalExercise>) => {
        setExercises(exercises.map((e, i) => i === index ? { ...e, ...updates } : e));
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        // Build exercises array with proper IDs
        const builtExercises: GoalExercise[] = exercises
            .filter(e => e.name?.trim())
            .map(e => ({
                id: crypto.randomUUID(),
                name: e.name!.trim(),
                targetAmount: e.currentAmount || 10,
                startAmount: e.currentAmount || 10,
                currentAmount: e.currentAmount || 10,
                unit: e.unit || 'reps',
                daysAtCurrentTarget: 0,
            }));

        addHabit({
            title: title.trim(),
            exercises: builtExercises,
            frequency,
            weeklyTarget: frequency === 'weekly' ? weeklyTarget : undefined,
        });

        resetForm();
        setIsOpen(false);
    };

    // Only show in habits view
    if (activeView !== 'habits') return null;

    return (
        <>
            {/* FAB Button - Purple for habits */}
            <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
                <motion.button
                    onClick={() => setIsOpen(true)}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 pointer-events-auto"
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
                                            <h2 className="font-heading font-bold text-lg sm:text-xl mb-1 text-purple-500">New Habit</h2>
                                            <p className="text-xs sm:text-sm text-muted-foreground">Choose a template to get started</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {templates.map((t) => (
                                                <motion.button
                                                    key={t.value}
                                                    type="button"
                                                    onClick={() => handleTemplateSelect(t)}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 transition-all text-left group hover:border-purple-500/50",
                                                        "border-border/50 bg-card/50"
                                                    )}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <t.icon className="w-6 h-6 mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
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
                                                <h2 className="font-heading font-bold text-lg sm:text-xl mb-1 text-purple-500">Configure Habit</h2>
                                                <p className="text-xs sm:text-sm text-muted-foreground">Set up your {template} habit</p>
                                            </div>

                                            {/* Habit Title */}
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground mb-2 block">Habit Name</label>
                                                <Input
                                                    type="text"
                                                    placeholder={template === 'fitness' ? "e.g., Morning Workout" : template === 'mindfulness' ? "e.g., Meditation" : "e.g., Read Daily"}
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    className="h-11 text-base bg-muted/30 border-muted-foreground/20 focus:border-purple-500"
                                                    autoFocus
                                                />
                                            </div>

                                            {/* Frequency selector */}
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground mb-2 block">Frequency</label>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFrequency('daily')}
                                                        className={cn(
                                                            "flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all",
                                                            frequency === 'daily'
                                                                ? "border-purple-500 bg-purple-500/10 text-purple-500"
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
                                                                ? "border-purple-500 bg-purple-500/10 text-purple-500"
                                                                : "border-border/50 text-muted-foreground hover:bg-muted/50"
                                                        )}
                                                    >
                                                        Weekly
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Weekly target (if weekly) */}
                                            {frequency === 'weekly' && (
                                                <div>
                                                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Times per Week</label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5, 6].map((n) => (
                                                            <button
                                                                key={n}
                                                                type="button"
                                                                onClick={() => setWeeklyTarget(n)}
                                                                className={cn(
                                                                    "flex-1 h-10 rounded-lg font-mono text-sm transition-all",
                                                                    weeklyTarget === n
                                                                        ? "bg-purple-500 text-white"
                                                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                                                )}
                                                            >
                                                                {n}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Exercises/Tasks */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-medium text-muted-foreground">
                                                        Daily Tasks (Optional)
                                                    </label>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={addExercise}
                                                        className="text-xs h-7 text-purple-500 hover:text-purple-500"
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
                                                                <label className="text-[10px] text-muted-foreground mb-1 block">Daily Amount</label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={exercise.currentAmount || 10}
                                                                    onChange={(e) => updateExercise(index, { currentAmount: parseInt(e.target.value) || 10 })}
                                                                    className="h-8 text-sm font-mono"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-muted-foreground mb-1 block">Unit</label>
                                                                <div className="flex flex-wrap gap-1">
                                                                    <div className="px-2 py-1 rounded-full text-[10px] font-medium bg-purple-500 text-white">
                                                                        Minutes
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}

                                                {exercises.length === 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={addExercise}
                                                        className="w-full h-16 border-dashed border-2 text-muted-foreground hover:text-foreground hover:border-purple-500/50"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add a Task with Amount
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                disabled={!title.trim()}
                                                className="w-full h-11 text-base font-heading font-semibold gap-2 bg-purple-500 hover:bg-purple-600 text-white"
                                            >
                                                <Repeat className="w-4 h-4" />
                                                Create Habit
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
