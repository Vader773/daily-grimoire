import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/stores/gameStore';
import { toast } from 'sonner';

interface AccumulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  goalTitle: string;
  unit: string;
}

export const AccumulatorModal = ({ isOpen, onClose, taskId, goalTitle, unit }: AccumulatorModalProps) => {
  const [amount, setAmount] = useState('1');
  const { updateAccumulatorProgress, completeTask } = useGameStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(amount);

    if (isNaN(value) || value <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    // Only update progress - DON'T complete the task
    // The task stays active until the GOAL is complete
    updateAccumulatorProgress(taskId, value);

    toast.success(`Added ${value} ${unit} to ${goalTitle}!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative z-10 glass-strong rounded-2xl p-6 border-2 border-primary/30 w-[90%] max-w-sm mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="font-heading font-bold text-lg">Log Progress</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            How much did you complete for "{goalTitle}"?
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Amount completed:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-lg font-mono text-center"
                  autoFocus
                />
                <span className="text-sm text-muted-foreground">{unit}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={parseInt(amount) <= 0}
              className="w-full h-12 font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Progress
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};