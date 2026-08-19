/**
 * Programmatic sound effects using Web Audio API
 * Generates clear, high-quality audio notifications without needing external audio files.
 */

export function playOrderChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic two-tone doorbell chime (E5 -> G#5)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.setValueAtTime(830.61, now + 0.15); // G#5

    osc2.frequency.setValueAtTime(659.25 / 2, now);
    osc2.frequency.setValueAtTime(830.61 / 2, now + 0.15);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.85);
    osc2.stop(now + 0.85);
  } catch (err) {
    console.warn('Audio chime playback blocked or not supported:', err);
  }
}
