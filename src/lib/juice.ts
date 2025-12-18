export type GameSfx = 'complete' | 'big' | 'levelup';
export type UiSfx = 'click' | 'open' | 'close' | 'slide';

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

const ensureRunning = (c: AudioContext) => {
  if (c.state === 'suspended') void c.resume();
};

const connectOut = (c: AudioContext, gainValue: number) => {
  const out = c.createGain();
  out.gain.setValueAtTime(gainValue, now(c));
  out.connect(c.destination);
  return out;
};

const makeTone = (c: AudioContext, out: GainNode, t0: number, freq: number, wave: OscillatorType, peak: number, decay: number) => {
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

const makeClick = (c: AudioContext, out: GainNode, t0: number, brightness: number) => {
  // A tight "tick" (triangle) + a tiny "snap" (filtered noise)
  makeTone(c, out, t0, 920 + brightness * 140, 'triangle', 0.06, 0.06);

  const bufferSize = Math.floor(c.sampleRate * 0.03);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);

  const src = c.createBufferSource();
  src.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200 + brightness * 900, t0);
  filter.Q.setValueAtTime(10, t0);

  const g = c.createGain();
  env(g, t0, 0.05, 0.04);

  src.connect(filter);
  filter.connect(g);
  g.connect(out);

  src.start(t0);
  src.stop(t0 + 0.05);
};

export const playGameSfx = (type: GameSfx) => {
  const c = getCtx();
  if (!c) return;
  ensureRunning(c);

  const t0 = now(c);
  const out = connectOut(c, 0.55);

  if (type === 'complete') {
    makeTone(c, out, t0, 740, 'triangle', 0.12, 0.13);
    makeTone(c, out, t0, 1110, 'sine', 0.07, 0.11);
  }

  if (type === 'big') {
    makeTone(c, out, t0, 520, 'triangle', 0.16, 0.18);
    makeTone(c, out, t0, 780, 'sine', 0.10, 0.16);
    makeTone(c, out, t0, 1040, 'sine', 0.05, 0.14);
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

export const playUiSfx = (type: UiSfx) => {
  const c = getCtx();
  if (!c) return;
  ensureRunning(c);

  const t0 = now(c);
  const out = connectOut(c, 0.22);

  if (type === 'click') makeClick(c, out, t0, 0.9);
  if (type === 'open') makeClick(c, out, t0, 1.1);
  if (type === 'close') makeClick(c, out, t0, 0.7);
  if (type === 'slide') makeClick(c, out, t0, 0.8);
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

