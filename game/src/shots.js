// shots.js: the screenshot scenes behind ?shot=start|play|end. One job:
// stage a fixed, deterministic frame of the real game, so a screenshot is
// a render of the game's own code, never a mock-up.
//   start — the title screen, scenes on their cards.
//   play  — level 1 mid-hunt: 3 of 7 found (ringed on both pictures),
//           4 still to find, the counter reading "4 LEFT", clock at 1:47.
//   end   — the victory screen after all three scenes are cleared.
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_VICTORY } from './game.js';
import { DIFFERENCES } from './differences.js';

const PLAY_FOUND = ['crater', 'tail', 'flower'];
const PLAY_TIME_LEFT = 107; // 1:47 on the clock
const END_SCORE = 2940;

export function stageShot(name, game) {
  const state = game.state;
  if (name === 'play') {
    game.startGame();
    for (const id of PLAY_FOUND) {
      const diff = DIFFERENCES[0].find((entry) => entry.id === id);
      game.find(id, 'left', diff.x, diff.y);
    }
    // The finds stamped their rings and floating points; clear the
    // one-shot effects — the found markers themselves are drawn from
    // state.found, so they stay exactly on the differences.
    state.fx = [];
    state.timeLeft = PLAY_TIME_LEFT;
    state.message = 'Found: Flower colour  +150';
    return SCREEN_PLAY;
  }
  if (name === 'end') {
    game.startGame();
    state.screen = SCREEN_VICTORY;
    state.score = END_SCORE;
    state.best = END_SCORE;
    state.totalFound = 21;
    state.bestCombo = 7;
    state.levelIndex = 2;
    return SCREEN_VICTORY;
  }
  game.toTitle();
  return SCREEN_TITLE;
}
