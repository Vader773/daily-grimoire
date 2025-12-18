export type GameSfx = 'complete' | 'big' | 'levelup';

let ctx: AudioContext | null = null;

const getCtx = () => {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  return ctx;
};

const now = (c: AudioContext) => c.currentTime;

const env = (gain: GainNode, t0: number, peak: number, decay: number) => {
  gain.gain.cancelScheduledValues(t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
};

export const playGameSfx = (type: GameSfx) => {
  const c = getCtx();
  if (!c) return;

  // iOS requires user gesture to start; we only call this from clicks/completions.
  if (c.state === 'suspended') {
    void c.resume();
  }

  const t0 = now(c);
  const out = c.createGain();
  out.connect(c.destination);

  // soft limiter
  out.gain.setValueAtTime(0.55, t0);

  const makeTone = (freq: number, wave: OscillatorType, peak: number, decay: number) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, t0);

    // Slight pitch drop = juicier
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.85), t0 + decay);

    env(g, t0, peak, decay);

    osc.connect(g);
    g.connect(out);
    osc.start(t0);
    osc.stop(t0 + decay + 0.02);
  };

  if (type === 'complete') {
    makeTone(740, 'triangle', 0.12, 0.13);
    makeTone(1110, 'sine', 0.07, 0.11);
  }

  if (type === 'big') {
    makeTone(520, 'triangle', 0.16, 0.18);
    makeTone(780, 'sine', 0.10, 0.16);
    makeTone(1040, 'sine', 0.05, 0.14);
  }

  if (type === 'levelup') {
    // quick arpeggio
    const freqs = [660, 880, 1320];
    freqs.forEach((f, i) => {
      const t = t0 + i * 0.06;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      osc.connect(g);
      g.connect(out);
      osc.start(t);
      osc.stop(t + 0.14);
    });
  }
};

export const haptic = (pattern: number | number[]) => {
  if (typeof navigator === 'undefined') return;
  if (!('vibrate' in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
};
