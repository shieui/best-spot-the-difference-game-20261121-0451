// game.js: the rules and the state, with no drawing and no browser in it.
// Screens: title, play, paused, level (level complete), victory, failed.
// step() advances the clock and the effects; the caller drains events()
// for sounds and announcements. Nothing here allocates after createGame
// returns, except the small effect records a find or a miss adds.
import {
  COMBO_STEP_POINTS,
  FIND_BASE_POINTS,
  HINTS_PER_LEVEL,
  LEVELS,
  WRONG_CLICK_TIME_PENALTY,
} from './config.js';
import { DIFFERENCES } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL = 'level';
export const SCREEN_VICTORY = 'victory';
export const SCREEN_FAILED = 'failed';

export const EVENT_FIND = 1;
export const EVENT_WRONG = 2;
export const EVENT_HINT = 4;
export const EVENT_WIN = 8;
export const EVENT_TICK = 16;

const BEST_KEY = 'lantern-lane.best';

export function createGame() {
  const state = {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    score: 0,
    combo: 0,
    bestCombo: 0,
    timeLeft: LEVELS[0].timeLimit,
    hintsLeft: HINTS_PER_LEVEL,
    hintTarget: null, // { id, until } while a hint is pulsing
    hintReadyAt: 0,
    message: '',
    messageUntil: 0,
    levelBonus: 0,
    stars: 0,
    totalFound: 0,
    fx: [], // { kind: 'ring' | 'float' | 'miss', panel, x, y, text, age }
    elapsed: 0,
    best: 0,
  };
  let events = 0;
  let lastTickSecond = -1;

  try {
    state.best = Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    state.best = 0;
  }

  function saveBest() {
    try {
      window.localStorage.setItem(BEST_KEY, String(state.best));
    } catch {
      // Storage can be off: the best score then lasts this visit only.
    }
  }

  function level() {
    return LEVELS[state.levelIndex];
  }

  function remaining() {
    return DIFFERENCES[state.levelIndex].length - state.found.size;
  }

  function startLevel(index) {
    state.levelIndex = index;
    state.found = new Set();
    state.combo = 0;
    state.timeLeft = LEVELS[index].timeLimit;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hintTarget = null;
    state.fx = [];
    state.message = '';
    state.screen = SCREEN_PLAY;
    lastTickSecond = -1;
  }

  function startGame() {
    state.score = 0;
    state.totalFound = 0;
    startLevel(0);
  }

  function note(message, seconds) {
    state.message = message;
    state.messageUntil = state.elapsed + seconds;
  }

  /** A click landed on an unfound difference in scene coordinates. */
  function find(id, panel, x, y) {
    if (state.screen !== SCREEN_PLAY || state.found.has(id)) return;
    state.found.add(id);
    state.totalFound += 1;
    const points = FIND_BASE_POINTS + state.combo * COMBO_STEP_POINTS;
    state.score += points;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    events |= EVENT_FIND;
    const diff = DIFFERENCES[state.levelIndex].find((entry) => entry.id === id);
    note(`Found: ${diff.name}  +${points}`, 2.2);
    for (const side of ['left', 'right']) {
      state.fx.push({ kind: 'ring', panel: side, x, y, age: 0 });
    }
    state.fx.push({ kind: 'float', panel, x, y: y - 18, text: `+${points}`, age: 0 });
    if (state.hintTarget !== null && state.hintTarget.id === id) state.hintTarget = null;
    if (state.found.size === DIFFERENCES[state.levelIndex].length) {
      state.levelBonus = Math.round(state.timeLeft) * 10;
      state.score += state.levelBonus;
      state.stars = state.timeLeft > level().timeLimit * 0.6 ? 3 : state.timeLeft > level().timeLimit * 0.3 ? 2 : 1;
      events |= EVENT_WIN;
      if (state.levelIndex === LEVELS.length - 1) {
        state.screen = SCREEN_VICTORY;
        if (state.score > state.best) {
          state.best = state.score;
          saveBest();
        }
      } else {
        state.screen = SCREEN_LEVEL;
      }
    }
  }

  /** A click landed on no difference. */
  function miss(panel, x, y) {
    if (state.screen !== SCREEN_PLAY) return;
    state.combo = 0;
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_CLICK_TIME_PENALTY);
    events |= EVENT_WRONG;
    note(`Not quite — ${WRONG_CLICK_TIME_PENALTY}s lost`, 1.6);
    state.fx.push({ kind: 'miss', panel, x, y, age: 0 });
  }

  /** Spend a hint: pulse one difference the player has not found yet. */
  function useHint(nowMs) {
    if (state.screen !== SCREEN_PLAY) return;
    if (state.hintsLeft <= 0) {
      note('No hints left in this scene', 1.6);
      return;
    }
    if (nowMs < state.hintReadyAt) return;
    const pool = DIFFERENCES[state.levelIndex].filter((entry) => !state.found.has(entry.id));
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    state.hintsLeft -= 1;
    state.hintTarget = { id: pick.id, until: state.elapsed + 2.5 };
    state.hintReadyAt = nowMs + 4000;
    events |= EVENT_HINT;
    note(`Hint: ${pick.hint}`, 2.5);
  }

  function nextLevel() {
    if (state.screen === SCREEN_LEVEL) startLevel(state.levelIndex + 1);
  }

  function retryLevel() {
    startLevel(state.levelIndex);
  }

  function pause() {
    if (state.screen === SCREEN_PLAY) state.screen = SCREEN_PAUSED;
  }

  function resume() {
    if (state.screen === SCREEN_PAUSED) state.screen = SCREEN_PLAY;
  }

  function toTitle() {
    state.screen = SCREEN_TITLE;
  }

  /** One fixed step. `nowMs` is the wall clock, for the hint cooldown. */
  function step(dt, nowMs) {
    state.elapsed += dt;
    if (state.screen === SCREEN_PLAY) {
      state.timeLeft -= dt;
      const whole = Math.ceil(state.timeLeft);
      if (state.timeLeft <= 10.5 && whole !== lastTickSecond && state.timeLeft > 0) {
        lastTickSecond = whole;
        events |= EVENT_TICK;
      }
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.screen = SCREEN_FAILED;
        note('Out of time!', 3);
      }
    }
    if (state.hintTarget !== null && state.elapsed >= state.hintTarget.until) state.hintTarget = null;
    if (state.message !== '' && state.elapsed >= state.messageUntil) state.message = '';
    for (let i = state.fx.length - 1; i >= 0; i -= 1) {
      state.fx[i].age += dt;
      if (state.fx[i].age > 1.1) state.fx.splice(i, 1);
    }
  }

  return {
    state,
    level,
    remaining,
    startGame,
    startLevel,
    find,
    miss,
    useHint,
    nextLevel,
    retryLevel,
    pause,
    resume,
    toTitle,
    step,
    /** The events since the last call, as EVENT_* flags. */
    takeEvents() {
      const taken = events;
      events = 0;
      return taken;
    },
  };
}
