/**
 * Web Audio completion chime for the focus timer.
 * Browsers require AudioContext to be resumed after a user gesture before
 * scheduled sounds will play reliably.
 */

let context = null;

function contextOrNull() {
  if (typeof window === "undefined") return null;
  if (!context) {
    try {
      context = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return context;
}

/** Call from Start / preset / pause / reset so the context is unlocked for end-of-timer playback. */
export function primeFocusAudioContext() {
  const ctx = contextOrNull();
  if (!ctx || ctx.state !== "suspended") return Promise.resolve();
  return ctx.resume().catch(() => {});
}

/** Short two-tone chime when the focus session completes. */
export function playFocusCompleteSound() {
  const ctx = contextOrNull();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.12;
  master.connect(ctx.destination);

  function tone(freq, start, duration) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(1, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(g);
    g.connect(master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  tone(523.25, now, 0.18);
  tone(659.25, now + 0.12, 0.22);
}
