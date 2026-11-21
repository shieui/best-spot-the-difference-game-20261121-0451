// input.js: keyboard and pointer input. One job: turn raw events into
// game actions. Clicks are reported in 1280x720 field coordinates; one-shot
// key presses are queued as bit flags and taken once by the loop, so a
// press between two frames is never lost.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_MUTE = 8;
export const ACTION_RESTART = 16;
export const ACTION_LEVEL_1 = 32;
export const ACTION_LEVEL_2 = 64;
export const ACTION_LEVEL_3 = 128;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const HINT = new Set(['KeyH']);
const MUTE = new Set(['KeyM']);
const RESTART = new Set(['KeyR']);
const LEVEL_KEYS = { Digit1: ACTION_LEVEL_1, Digit2: ACTION_LEVEL_2, Digit3: ACTION_LEVEL_3 };

export function createInput(canvas, view) {
  let actions = 0;
  const clicks = [];

  window.addEventListener('keydown', (event) => {
    if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (HINT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_HINT;
    } else if (MUTE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_MUTE;
    } else if (RESTART.has(event.code)) {
      if (!event.repeat) actions |= ACTION_RESTART;
    } else if (LEVEL_KEYS[event.code] !== undefined) {
      if (!event.repeat) actions |= LEVEL_KEYS[event.code];
    } else return;
    event.preventDefault();
  });

  // Report every click in 1280x720 field coordinates; the caller routes
  // it by screen, because the title cards overlap the picture area.
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const px = (event.clientX - rect.left) * (canvas.width / rect.width);
    const py = (event.clientY - rect.top) * (canvas.height / rect.height);
    const lx = (px - view.x) / view.scale;
    const ly = (py - view.y) / view.scale;
    clicks.push({ x: lx, y: ly });
  });

  return {
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** Clicks since the last call, in 1280x720 field coordinates. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}
