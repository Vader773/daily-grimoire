import { create } from 'zustand';

export type TutorialStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const STORAGE_KEY = 'questline_tutorial_complete';

type TutorialState = {
  open: boolean;
  step: TutorialStep;
  spotlightTaskId: string | null;
  tasksCountAtStep2: number | null;

  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  finish: () => void;

  setSpotlightTaskId: (id: string | null) => void;
  setTasksCountAtStep2: (n: number | null) => void;
  hydrateFromStorage: () => void;
};

export const useTutorialStore = create<TutorialState>((set, get) => ({
  open: false,
  step: 0,
  spotlightTaskId: null,
  tasksCountAtStep2: null,

  hydrateFromStorage: () => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (done === 'true') {
        set({ open: false });
        return;
      }
      set({ open: true, step: 0 });
    } catch {
      set({ open: true, step: 0 });
    }
  },

  start: () => set({ open: true, step: 0 }),

  next: () =>
    set((s) => ({
      step: (Math.min(6, (s.step + 1) as TutorialStep) as TutorialStep),
    })),

  prev: () =>
    set((s) => ({
      step: (Math.max(0, (s.step - 1) as TutorialStep) as TutorialStep),
    })),

  skip: () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    set({ open: false });
  },

  finish: () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    set({ open: false });
  },

  setSpotlightTaskId: (id) => set({ spotlightTaskId: id }),
  setTasksCountAtStep2: (n) => set({ tasksCountAtStep2: n }),
}));
