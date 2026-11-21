// Boot and the one loop: clicks and keys are read every frame, the game
// advances in fixed 1/60 s steps, and the renderer paints what is there.
// The game moves between six screens: title, play, paused, level
// complete, victory and failed.
//
// ?shot=start|play|end stages that scene instead of running the loop,
// paints it twice and sets window.__shotReady for a screenshot.
import { LEFT_PANEL, LEVELS, RIGHT_PANEL } from './config.js';
import { DIFFERENCES } from './differences.js';
import {
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_LEVEL_1,
  ACTION_LEVEL_2,
  ACTION_LEVEL_3,
  ACTION_MUTE,
  ACTION_PAUSE,
  ACTION_RESTART,
  createInput,
} from './input.js';
import { createAudio } from './audio.js';
import {
  EVENT_FIND,
  EVENT_HINT,
  EVENT_TICK,
  EVENT_WIN,
  EVENT_WRONG,
  SCREEN_FAILED,
  SCREEN_LEVEL,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_VICTORY,
  createGame,
} from './game.js';
import { HINT_BUTTON, LEVEL_CARDS, createRenderer } from './render.js';
import { stageShot } from './shots.js';

const STEP = 1 / 60;
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const game = createGame();
const renderer = createRenderer(canvas);
const input = createInput(canvas, renderer.view);
const audio = createAudio();

function announce(message) {
  status.textContent = message;
}

function inside(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

/** A click on a picture: find the difference under it, or miss. */
function handlePictureClick(click) {
  const state = game.state;
  if (state.screen !== SCREEN_PLAY) return;
  const diffs = DIFFERENCES[state.levelIndex];
  for (const diff of diffs) {
    if (state.found.has(diff.id)) continue;
    const dx = click.x - diff.x;
    const dy = click.y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      game.find(diff.id, click.panel, diff.x, diff.y);
      return;
    }
  }
  game.miss(click.panel, click.x, click.y);
}

/** What a click (or Enter/Space) does on a screen that is not the pictures. */
function confirm() {
  const state = game.state;
  if (state.screen === SCREEN_TITLE) {
    game.startGame();
    announce(`Playing ${LEVELS[0].name}. Find 7 differences.`);
  } else if (state.screen === SCREEN_LEVEL) {
    game.nextLevel();
    announce(`Playing ${LEVELS[game.state.levelIndex].name}.`);
  } else if (state.screen === SCREEN_VICTORY) {
    game.startGame();
    announce(`Playing ${LEVELS[0].name}. Find 7 differences.`);
  } else if (state.screen === SCREEN_FAILED) {
    game.retryLevel();
    announce(`Retrying ${LEVELS[game.state.levelIndex].name}.`);
  } else if (state.screen === SCREEN_PAUSED) {
    game.resume();
    announce('Playing.');
  }
}

/** Route the clicks since the last frame. The title cards overlap the
 * picture area, so routing is by screen: on the title screen a click
 * picks a scene card, in play a click inside a picture hunts, and the
 * hint pill is a button of its own. */
function handleClicks() {
  for (const click of input.takeClicks()) {
    audio.unlock();
    const state = game.state;
    if (state.screen === SCREEN_TITLE) {
      for (let i = 0; i < LEVEL_CARDS.length; i += 1) {
        if (inside(LEVEL_CARDS[i], click.x, click.y)) {
          game.startLevel(i);
          announce(`Playing ${LEVELS[i].name}. Find 7 differences.`);
          return;
        }
      }
      confirm();
      continue;
    }
    if (state.screen === SCREEN_PLAY) {
      if (inside(HINT_BUTTON, click.x, click.y)) {
        game.useHint(performance.now());
        continue;
      }
      for (const [panel, name] of [[LEFT_PANEL, 'left'], [RIGHT_PANEL, 'right']]) {
        if (inside(panel, click.x, click.y)) {
          handlePictureClick({ panel: name, x: click.x - panel.x, y: click.y - panel.y });
          break;
        }
      }
      continue;
    }
    confirm();
  }
}

function handleActions() {
  const actions = input.takeActions();
  if (actions === 0) return;
  audio.unlock();
  if (actions & ACTION_MUTE) {
    const muted = audio.toggleMute();
    announce(muted ? 'Sound off.' : 'Sound on.');
  }
  if (actions & ACTION_HINT) game.useHint(performance.now());
  if (actions & ACTION_RESTART && (game.state.screen === SCREEN_PLAY || game.state.screen === SCREEN_FAILED)) {
    game.retryLevel();
    announce(`Retrying ${LEVELS[game.state.levelIndex].name}.`);
  }
  if (actions & ACTION_LEVEL_1 && game.state.screen === SCREEN_TITLE) game.startLevel(0);
  if (actions & ACTION_LEVEL_2 && game.state.screen === SCREEN_TITLE) game.startLevel(1);
  if (actions & ACTION_LEVEL_3 && game.state.screen === SCREEN_TITLE) game.startLevel(2);
  if (actions & ACTION_PAUSE) {
    if (game.state.screen === SCREEN_PLAY) {
      game.pause();
      announce('Paused.');
    } else if (game.state.screen === SCREEN_PAUSED) {
      game.resume();
      announce('Playing.');
    }
  }
  if (actions & ACTION_CONFIRM) confirm();
}

function playEvents() {
  const events = game.takeEvents();
  if (events & EVENT_FIND) audio.find();
  if (events & EVENT_WRONG) audio.wrong();
  if (events & EVENT_HINT) audio.hint();
  if (events & EVENT_WIN) audio.win();
  if (events & EVENT_TICK) audio.tick();
  if (events & (EVENT_FIND | EVENT_WRONG | EVENT_HINT | EVENT_WIN)) {
    announce(game.state.message || 'Playing.');
  }
}

function runShot(name) {
  const screen = stageShot(name, game);
  let painted = 0;
  function paint() {
    renderer.draw(game.state, screen, 1.2);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let accumulator = 0;
  let last = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleClicks();
    handleActions();
    while (accumulator >= STEP) {
      game.step(STEP, now);
      accumulator -= STEP;
    }
    playEvents();
    renderer.draw(game.state, game.state.screen, now / 1000);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state.screen === SCREEN_PLAY) {
      game.pause();
      announce('Paused.');
    }
  });

  announce('Lantern Lane, spot the difference. Press Space or click a scene to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
