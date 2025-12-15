import { Difficulty } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Coffee, FileText, Dumbbell, Sword, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DifficultySelectorProps {
  selected: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

const difficulties: {
  id: Difficulty;
  label: string;
  xp: number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}[] = [
    {
      id: 'trivial',
      label: 'Trivial',
      xp: 5,
      icon: Coffee,
      colorClass: 'text-muted-foreground',
      bgClass: 'bg-muted/50 border-muted-foreground/30'
    },
    {
      id: 'easy',
      label: 'Easy',
      xp: 10,
      icon: FileText,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10 border-primary/30'
    },
    {
      id: 'medium',
      label: 'Medium',
      xp: 25,
      icon: Dumbbell,
      colorClass: 'text-purple-400',
      bgClass: 'bg-purple-500/10 border-purple-500/30'
    },
    {
      id: 'hard',
      label: 'Hard',
      xp: 50,
      icon: Sword,
      colorClass: 'text-rank-bronze',
      bgClass: 'bg-orange-500/10 border-orange-500/30'
    },
    {
      id: 'boss',
      label: 'Boss',
      xp: 100,
      icon: Crown,
      colorClass: 'text-destructive',
      bgClass: 'bg-destructive/10 border-destructive/30'
    },
  ];

export const DifficultySelector = ({ selected, onSelect }: DifficultySelectorProps) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {difficulties.map((diff) => {
        const Icon = diff.icon;
        const isSelected = selected === diff.id;

        return (
          <motion.button
            key={diff.id}
            type="button"
            onClick={() => onSelect(diff.id)}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-colors",
              isSelected
                ? `${diff.bgClass} border-current ${diff.colorClass}`
                : "bg-muted/20 border-transparent hover:border-muted-foreground/20"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
          >
            <Icon className={cn("w-5 h-5 mb-1", isSelected ? diff.colorClass : "text-muted-foreground")} />
            <span className={cn("text-[10px] font-medium uppercase tracking-wide", isSelected ? diff.colorClass : "text-muted-foreground")}>
              {diff.label}
            </span>
            <span className={cn("font-mono text-xs mt-0.5", isSelected ? diff.colorClass : "text-muted-foreground/70")}>
              +{diff.xp}
            </span>

            {isSelected && (
              <motion.div
                layoutId="difficulty-indicator"
                className={cn("absolute inset-0 rounded-xl border-2", diff.colorClass)}
                style={{ borderColor: 'currentColor' }}
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
