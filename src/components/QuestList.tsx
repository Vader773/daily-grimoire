import { useGameStore } from '@/stores/gameStore';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { AnimatePresence, motion } from 'framer-motion';
import { Swords, Trophy, Sparkles, Repeat, ChevronDown } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface QuestListProps {
  onTaskComplete: (xp: number, leveledUp: boolean) => void;
}

export const QuestList = ({ onTaskComplete }: QuestListProps) => {
  const { getCustomTasks, getGoalTasks, getHabitTasks } = useGameStore();

  const customTasks = getCustomTasks();
  const goalTasks = getGoalTasks();
  const habitTasks = getHabitTasks();

  const activeCustomTasks = customTasks.filter(t => !t.completed);
  const completedCustomTasks = customTasks.filter(t => t.completed);
  const activeGoalTasks = goalTasks.filter(t => !t.completed);
  const completedGoalTasks = goalTasks.filter(t => t.completed);
  const activeHabitTasks = habitTasks.filter(t => !t.completed);
  const completedHabitTasks = habitTasks.filter(t => t.completed);

  // Section State
  const [openSections, setOpenSections] = React.useState({
    main: true,
    recurring: true,
    side: true
  });

  const toggleSection = (section: 'main' | 'recurring' | 'side') => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasNoTasks = customTasks.length === 0 && goalTasks.length === 0 && habitTasks.length === 0;

  if (hasNoTasks) {
    return <EmptyState />;
  }

  const renderTaskSection = (
    title: string,
    subTitle: string,
    activeTasks: typeof goalTasks,
    completedTasks: typeof goalTasks,
    isOpen: boolean,
    onToggle: () => void,
    icon: React.ReactNode,
    colorClass: string,
    isGoalTask: boolean = false,
    isHabitTask: boolean = false
  ) => {
    const totalTasks = activeTasks.length + completedTasks.length;
    if (totalTasks === 0) return null;

    return (
      <div className="space-y-3">
        {/* Header - Always Visible */}
        <div
          onClick={onToggle}
          className="sticky top-0 z-10 py-2 bg-background/80 backdrop-blur-sm -mx-4 px-4 cursor-pointer hover:bg-accent/5 transition-colors flex items-center justify-between group"
        >
          <div>
            <h2 className={cn("font-heading font-semibold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2", colorClass)}>
              {icon}
              {title} ({activeTasks.length}/{totalTasks})
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">{subTitle}</p>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen ? "rotate-180" : "")} />
        </div>

        {/* Content - Collapsible */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 sm:space-y-3 overflow-hidden"
            >
              {/* Active Tasks */}
              <AnimatePresence mode="popLayout">
                {activeTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onComplete={onTaskComplete}
                    isGoalTask={isGoalTask || task.isGoalTask}
                    isHabitTask={isHabitTask || task.isHabitTask}
                  />
                ))}
              </AnimatePresence>

              {/* Completed Tasks Divider & List */}
              {completedTasks.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/50 uppercase tracking-widest pl-1 mb-2">
                    <div className="h-px bg-border/50 flex-1"></div>
                    Completed
                    <div className="h-px bg-border/50 flex-1"></div>
                  </div>
                  <div className={cn("space-y-2 hover:opacity-100 transition-opacity",
                    isHabitTask ? "opacity-85" : "opacity-60"
                  )}>
                    {completedTasks.map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onComplete={onTaskComplete}
                        isGoalTask={isGoalTask || task.isGoalTask}
                        isHabitTask={isHabitTask || task.isHabitTask}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Main Quests - Goal Generated */}
      {renderTaskSection(
        "Main Quests: Goal Oriented Tasks",
        "Your primary objectives linked to long-term goals.",
        activeGoalTasks,
        completedGoalTasks,
        openSections.main,
        () => toggleSection('main'),
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
        "text-success",
        true,
        false
      )}

      {/* Recurring Quests - Habit Generated */}
      {renderTaskSection(
        "Recurring Quests: Habit Oriented Tasks",
        "Daily rituals to build consistency.",
        activeHabitTasks,
        completedHabitTasks,
        openSections.recurring,
        () => toggleSection('recurring'),
        <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
        "text-purple-400",
        false,
        true
      )}

      {/* Side Quests - Quick Custom Tasks */}
      {renderTaskSection(
        "Side Quests: Quick Tasks",
        "Ad-hoc tasks and quick wins.",
        activeCustomTasks,
        completedCustomTasks,
        openSections.side,
        () => toggleSection('side'),
        <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
        "text-blue-400",
        false,
        false
      )}
    </div>
  );
};
