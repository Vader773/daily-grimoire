import { useGameStore } from '@/stores/gameStore';
import { GoalCard } from './GoalCard';
import { EmptyGoalState } from './EmptyGoalState';
import { AnimatePresence, motion } from 'framer-motion';
import { Target, Trophy, TrendingUp } from 'lucide-react';

export const GoalList = () => {
  const { goals } = useGameStore();
  
  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  if (goals.length === 0) {
    return <EmptyGoalState />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 px-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <h2 className="font-heading font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
              Active Goals ({activeGoals.length})
            </h2>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {activeGoals.map((goal, index) => (
                <GoalCard key={goal.id} goal={goal} index={index} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 px-1">
            <Trophy className="w-4 h-4 text-rank-gold" />
            <h2 className="font-heading font-semibold text-xs sm:text-sm text-muted-foreground/70 uppercase tracking-wider">
              Achieved ({completedGoals.length})
            </h2>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {completedGoals.slice(0, 3).map((goal, index) => (
                <GoalCard key={goal.id} goal={goal} index={index} />
              ))}
            </AnimatePresence>
          </div>
          {completedGoals.length > 3 && (
            <p className="text-xs text-muted-foreground/50 text-center">
              +{completedGoals.length - 3} more achieved goals
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};
