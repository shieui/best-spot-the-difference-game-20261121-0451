// audio.js: every sound is synthesized with the Web Audio API — no audio
// files, no network. One job: small original bleeps and chimes.
// The context is created on the first user gesture, so nothing plays
// before the player interacts.

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        context = new AC();
      } catch {
        context = null;
      }
    }
    if (context !== null && context.state === 'suspended') context.resume();
    return context;
  }

  function tone(freq, start, duration, type, gain) {
    const ac = ensure();
    if (ac === null || muted) return;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0, ac.currentTime + start);
    amp.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + duration);
    osc.connect(amp);
    amp.connect(ac.destination);
    osc.start(ac.currentTime + start);
    osc.stop(ac.currentTime + start + duration + 0.05);
  }

  return {
    /** Call from any pointer/key handler so the context may start. */
    unlock() {
      ensure();
    },
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    // A bright two-note chime when a difference is found.
    find() {
      tone(880, 0, 0.16, 'sine', 0.22);
      tone(1318.5, 0.09, 0.24, 'sine', 0.2);
    },
    // A low buzz for a wrong click.
    wrong() {
      tone(160, 0, 0.18, 'square', 0.12);
      tone(120, 0.1, 0.2, 'square', 0.1);
    },
    // A soft blip when a hint fires.
    hint() {
      tone(660, 0, 0.1, 'triangle', 0.16);
      tone(990, 0.07, 0.14, 'triangle', 0.14);
    },
    // A rising arpeggio for a finished level.
    win() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.3, 'sine', 0.2));
    },
    // A short tick when the clock drops under ten seconds.
    tick() {
      tone(1200, 0, 0.05, 'square', 0.06);
    },
  };
}
