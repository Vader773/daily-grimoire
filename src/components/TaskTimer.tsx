import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, CheckCircle, Timer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskTimerProps {
  duration: number; // in seconds
  startedAt?: number;
  onStart: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

export const TaskTimer = ({ duration, startedAt, onStart, onComplete, isCompleted }: TaskTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);

  const isRunning = !!startedAt && !isPaused && !isCompleted;

  const calculateTimeLeft = useCallback(() => {
    if (!startedAt) return duration;
    const elapsed = Math.floor((Date.now() - startedAt - pausedTime) / 1000);
    return Math.max(0, duration - elapsed);
  }, [startedAt, duration, pausedTime]);

  useEffect(() => {
    if (!startedAt || isPaused || isCompleted) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, isPaused, isCompleted, calculateTimeLeft, onComplete]);

  useEffect(() => {
    if (startedAt) {
      setTimeLeft(calculateTimeLeft());
    }
  }, [startedAt, calculateTimeLeft]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = startedAt ? ((duration - timeLeft) / duration) * 100 : 0;

  if (isCompleted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success"
      >
        <CheckCircle className="w-4 h-4" />
        <span className="font-mono text-sm font-medium">Timer Complete</span>
      </motion.div>
    );
  }

  if (!startedAt) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onStart}
        className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
      >
        <Play className="w-4 h-4" />
        <span className="font-mono">{formatTime(duration)}</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Timer display with progress ring */}
      <div className="relative">
        <svg width="48" height="48" className="-rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="3"
            className="opacity-30"
          />
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={125.66}
            strokeDashoffset={125.66 * (1 - progress / 100)}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Timer className={cn(
            "w-4 h-4",
            isRunning ? "text-primary animate-pulse" : "text-muted-foreground"
          )} />
        </div>
      </div>

      {/* Time remaining */}
      <span className={cn(
        "font-mono text-lg font-bold",
        timeLeft < 60 ? "text-destructive" : "text-foreground"
      )}>
        {formatTime(timeLeft)}
      </span>

      {/* Done early button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onComplete}
        className="gap-1.5 text-success hover:bg-success/10 hover:text-success"
      >
        <CheckCircle className="w-4 h-4" />
        Done
      </Button>
    </div>
  );
};
