import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type Rect = { top: number; left: number; width: number; height: number } | null;

type Props = {
  targetSelector?: string | null;
  className?: string;
  padding?: number;
};

export const OnboardingOverlay = ({ targetSelector, className, padding = 10 }: Props) => {
  const [rect, setRect] = useState<Rect>(null);

  useEffect(() => {
    if (!targetSelector) {
      setRect(null);
      return;
    }

    const compute = () => {
      const el = document.querySelector(targetSelector) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: Math.max(0, r.top - padding),
        left: Math.max(0, r.left - padding),
        width: Math.min(window.innerWidth, r.width + padding * 2),
        height: Math.min(window.innerHeight, r.height + padding * 2),
      });
    };

    compute();
    window.addEventListener('resize', compute, { passive: true });
    window.addEventListener('scroll', compute, { passive: true, capture: true } as any);

    const interval = window.setInterval(compute, 250);

    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, { capture: true } as any);
      window.clearInterval(interval);
    };
  }, [targetSelector, padding]);

  const cutoutStyle = useMemo(() => {
    if (!rect) return undefined;
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      boxShadow: '0 0 0 9999px transparent',
    } as React.CSSProperties;
  }, [rect]);

  return (
    <div className={cn('fixed inset-0 z-[60] pointer-events-none', className)} aria-hidden="true">
      {/* Screen dim - REMOVED */}
      {/* <div className="absolute inset-0 bg-background/60" /> */}

      {/* Spotlight cutout */}
      {rect && (
        <div
          className="absolute rounded-2xl border border-primary/30"
          style={cutoutStyle}
        />
      )}
    </div>
  );
};
