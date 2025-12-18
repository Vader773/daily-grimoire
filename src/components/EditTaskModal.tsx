import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Timer } from 'lucide-react';
import { Task, Difficulty, useGameStore } from '@/stores/gameStore';
import { DifficultySelector } from './DifficultySelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
}

const XP_VALUES: Record<Difficulty, number> = {
    trivial: 5,
    easy: 10,
    medium: 25,
    hard: 50,
    boss: 100,
};

export const EditTaskModal = ({ isOpen, onClose, task }: EditTaskModalProps) => {
    const [title, setTitle] = useState(task.title);
    const [difficulty, setDifficulty] = useState<Difficulty>(task.difficulty);
    const [timerEnabled, setTimerEnabled] = useState(task.timerEnabled || false);
    const [timerMinutes, setTimerMinutes] = useState(task.timerDuration ? Math.round(task.timerDuration / 60) : 30);

    // Update state when task changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle(task.title);
            setDifficulty(task.difficulty);
            setTimerEnabled(task.timerEnabled || false);
            setTimerMinutes(task.timerDuration ? Math.round(task.timerDuration / 60) : 30);
        }
    }, [isOpen, task]);

    const showTimerOption = difficulty === 'hard' || difficulty === 'boss';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        // Update task directly in store
        useGameStore.setState(state => ({
            tasks: state.tasks.map(t =>
                t.id === task.id
                    ? {
                        ...t,
                        title: title.trim(),
                        difficulty,
                        xp: t.completed ? t.xp : XP_VALUES[difficulty],
                        timerEnabled: showTimerOption && timerEnabled,
                        timerDuration: showTimerOption && timerEnabled ? timerMinutes * 60 : undefined
                    }
                    : t
            )
        }));

        onClose();
    };

    const handleDifficultyChange = (newDifficulty: Difficulty) => {
        setDifficulty(newDifficulty);
        if (newDifficulty !== 'hard' && newDifficulty !== 'boss') {
            setTimerEnabled(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="p-4 sm:p-6 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="font-heading font-bold text-lg">Edit Quest</h2>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Quest Title"
                                        className="font-medium"
                                    />

                                    <div>
                                        <Label className="text-xs text-muted-foreground mb-2 block">Difficulty</Label>
                                        <DifficultySelector selected={difficulty} onSelect={handleDifficultyChange} />
                                    </div>

                                    <AnimatePresence>
                                        {showTimerOption && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-3 rounded-lg border bg-muted/20 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Timer className="w-4 h-4 text-primary" />
                                                            <Label htmlFor="edit-timer" className="text-sm font-medium">Timer</Label>
                                                        </div>
                                                        <Switch id="edit-timer" checked={timerEnabled} onCheckedChange={setTimerEnabled} />
                                                    </div>

                                                    {timerEnabled && (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                value={timerMinutes}
                                                                onChange={e => {
                                                                    const val = parseInt(e.target.value);
                                                                    setTimerMinutes(isNaN(val) ? 0 : val);
                                                                }}
                                                                className="w-20"
                                                            />
                                                            <span className="text-xs text-muted-foreground">minutes</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="pt-2 flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                                        <Button type="submit">
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
