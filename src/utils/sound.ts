// Web Audio API Synthesizer for UI sound effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays a short, subtle futuristic "pop" / sci-fi chime when sending a message
 * Duration: ~140ms
 */
export function playSendSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Primary Tone Oscillator (futuristic pleasant upward chime)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Frequency ramp: starts at 580Hz and sweeps quickly up to 1040Hz
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(1040, now + 0.08);

    // Harmonic subtle chime layer
    const harmOsc = ctx.createOscillator();
    const harmGain = ctx.createGain();
    harmOsc.type = 'triangle';
    harmOsc.frequency.setValueAtTime(1160, now);
    harmOsc.frequency.exponentialRampToValueAtTime(1760, now + 0.06);

    // Envelope for primary oscillator (fast attack, smooth exponential decay)
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    // Envelope for harmonic oscillator (very subtle shimmer)
    harmGain.gain.setValueAtTime(0.001, now);
    harmGain.gain.linearRampToValueAtTime(0.04, now + 0.012);
    harmGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);

    // Routing
    osc.connect(gainNode);
    harmOsc.connect(harmGain);

    gainNode.connect(ctx.destination);
    harmGain.connect(ctx.destination);

    // Play & cleanup
    osc.start(now);
    harmOsc.start(now);

    osc.stop(now + 0.15);
    harmOsc.stop(now + 0.12);
  } catch (err) {
    // Non-blocking fallback if browser denies audio
    console.debug('Web Audio playback skipped:', err);
  }
}
