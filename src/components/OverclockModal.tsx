import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/stores/gameStore';
import { toast } from 'sonner';

interface OverclockModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  requiredAmount: number;
  unit: string;
}

export const OverclockModal = ({ isOpen, onClose, taskId, requiredAmount, unit }: OverclockModalProps) => {
  const [actualAmount, setActualAmount] = useState(requiredAmount.toString());
  const { overclockTask } = useGameStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(actualAmount);

    if (isNaN(amount) || amount <= requiredAmount) {
      toast.error('Enter a value higher than required to overclock!');
      return;
    }

    const { bonusXP } = overclockTask(taskId, amount);

    if (bonusXP > 0) {
      toast.success(
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="font-bold">POWER SURGE! +{bonusXP} BONUS XP</span>
        </div>,
        {
          duration: 3000,
          className: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50',
        }
      );
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Flex container for centering */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-[90%] max-w-sm"
            >
              <div className="glass-strong rounded-2xl p-6 border-2 border-yellow-500/30">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                    <h2 className="font-heading font-bold text-lg text-yellow-400">Overclock</h2>
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
                    Did more than required? Enter the actual amount to earn bonus XP and fast-track your progress!
                  </p>

                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Required:</span>
                      <span className="font-mono font-bold">{requiredAmount} {unit}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">
                        Actual amount completed:
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={requiredAmount + 1}
                          value={actualAmount}
                          onChange={(e) => setActualAmount(e.target.value)}
                          className="h-12 text-lg font-mono text-center"
                          autoFocus
                        />
                        <span className="text-sm text-muted-foreground">{unit}</span>
                      </div>
                    </div>

                    {parseInt(actualAmount) > requiredAmount && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400">
                            +{Math.min((parseInt(actualAmount) - requiredAmount) * 2, 100)} Bonus XP
                          </span>
                        </div>
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      disabled={parseInt(actualAmount) <= requiredAmount}
                      className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Activate Overclock
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
