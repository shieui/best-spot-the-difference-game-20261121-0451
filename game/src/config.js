// Lantern Lane — Spot the Difference.
// config.js: the game's fixed numbers and level metadata. One job: constants.
// Everything here is original work written for this entry.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// The two picture panels, in canvas coordinates.
export const PANEL_W = 600;
export const PANEL_H = 470;
export const PANEL_Y = 84;
export const LEFT_PANEL = { x: 24, y: PANEL_Y, w: PANEL_W, h: PANEL_H };
export const RIGHT_PANEL = { x: 656, y: PANEL_Y, w: PANEL_W, h: PANEL_H };

export const HEADER_H = 72;
export const FOOTER_Y = 574;

export const GAME_TITLE = 'Lantern Lane';
export const GAME_SUBTITLE = 'Spot the Difference';

// Levels in play order. timeLimit is seconds; par is the score a perfect
// run earns before the time bonus.
export const LEVELS = [
  {
    id: 'garden',
    name: 'Moonlit Garden',
    tag: 'Easy · a quiet garden under a full moon',
    timeLimit: 150,
    par: 700,
  },
  {
    id: 'harbor',
    name: 'Harbor at Dawn',
    tag: 'Medium · fishing boats wake with the sun',
    timeLimit: 150,
    par: 900,
  },
  {
    id: 'market',
    name: 'Night Market',
    tag: 'Hard · lanterns, steam and a sleepy cat',
    timeLimit: 180,
    par: 1100,
  },
];

export const HINTS_PER_LEVEL = 3;
export const WRONG_CLICK_TIME_PENALTY = 5; // seconds lost on a miss
export const FIND_BASE_POINTS = 100;
export const COMBO_STEP_POINTS = 25; // extra points per step of the streak
export const HINT_COOLDOWN_MS = 4000;

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

// A tiny deterministic RNG (mulberry32) so decorative scatter — stars,
// petals, fireflies — renders identically every run and in screenshots.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
