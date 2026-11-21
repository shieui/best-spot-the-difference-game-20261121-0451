// render.js: drawing only — the game's state and the current screen in,
// pixels out. The 1280x720 field is scaled to fit the window and centred.
// Panels, markers, effects, HUD and every screen are painted here.
import {
  CANVAS_H,
  CANVAS_W,
  FONT,
  GAME_TITLE,
  LEFT_PANEL,
  LEVELS,
  RIGHT_PANEL,
} from './config.js';
import { DIFFERENCES } from './differences.js';
import { drawScene } from './scenes.js';
import {
  SCREEN_FAILED,
  SCREEN_LEVEL,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_VICTORY,
} from './game.js';

export const HINT_BUTTON = { x: 24, y: 606, w: 230, h: 52 };
export const LEVEL_CARDS = [
  { x: 40, y: 296, w: 360, h: 268 },
  { x: 460, y: 296, w: 360, h: 268 },
  { x: 880, y: 296, w: 360, h: 268 },
];

const INK = '#f2ead8';
const MUTED = '#b9b3a4';
const PANEL_EDGE = '#e8d9a0';
const FOUND_GREEN = '#7dff8a';
const HINT_YELLOW = '#ffd166';

function allDiffs(levelIndex) {
  return new Set(DIFFERENCES[levelIndex].map((entry) => entry.id));
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const fonts = new Map();

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / CANVAS_W, height / CANVAS_H);
    view.x = (width - CANVAS_W * view.scale) / 2;
    view.y = (height - CANVAS_H * view.scale) / 2;
  }

  function text(value, x, y, size, color, align, weight) {
    const key = `${weight || ''}${size}`;
    if (!fonts.has(key)) fonts.set(key, `${weight ? `${weight} ` : ''}${size}px ${FONT}`);
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align || 'left';
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  function pill(x, y, w, h, fill, stroke) {
    context.beginPath();
    context.roundRect(x, y, w, h, h / 2);
    context.fillStyle = fill;
    context.fill();
    if (stroke) {
      context.strokeStyle = stroke;
      context.lineWidth = 2;
      context.stroke();
    }
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function drawFoundMarker(x, y, r) {
    context.strokeStyle = FOUND_GREEN;
    context.lineWidth = 4;
    context.beginPath();
    context.arc(x, y, r + 3, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = FOUND_GREEN;
    context.beginPath();
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fill();
    // A small check in the ring's corner.
    context.strokeStyle = FOUND_GREEN;
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(x + r * 0.4, y + r * 0.75);
    context.lineTo(x + r * 0.62, y + r * 0.98);
    context.lineTo(x + r * 1.05, y + r * 0.5);
    context.stroke();
  }

  function drawPanel(panel, levelIndex, state, now) {
    context.save();
    context.translate(panel.x, panel.y);
    drawScene(context, levelIndex, panel === RIGHT_PANEL ? allDiffs(levelIndex) : new Set());
    const diffs = DIFFERENCES[levelIndex];
    for (const diff of diffs) {
      if (state.found.has(diff.id)) drawFoundMarker(diff.x, diff.y, diff.r);
    }
    // Hint pulse on both panels.
    if (state.hintTarget !== null) {
      const diff = diffs.find((entry) => entry.id === state.hintTarget.id);
      if (diff) {
        const pulse = 1 + 0.12 * Math.sin(now * 6);
        context.strokeStyle = HINT_YELLOW;
        context.lineWidth = 4;
        context.setLineDash([10, 8]);
        context.beginPath();
        context.arc(diff.x, diff.y, (diff.r + 6) * pulse, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);
      }
    }
    // Effects: rings, floating points, miss crosses.
    for (const fx of state.fx) {
      const onThisPanel = (fx.panel === 'left') === (panel === LEFT_PANEL);
      if (!onThisPanel) continue;
      const t = fx.age / 1.1;
      if (fx.kind === 'ring') {
        context.strokeStyle = `rgba(125, 255, 138, ${1 - t})`;
        context.lineWidth = 5;
        context.beginPath();
        context.arc(fx.x, fx.y, 10 + t * 34, 0, Math.PI * 2);
        context.stroke();
      } else if (fx.kind === 'float') {
        context.font = `bold 26px ${FONT}`;
        context.fillStyle = `rgba(255, 209, 102, ${1 - t})`;
        context.textAlign = 'center';
        context.fillText(fx.text, fx.x, fx.y - t * 26);
      } else if (fx.kind === 'miss') {
        context.strokeStyle = `rgba(255, 90, 78, ${1 - t})`;
        context.lineWidth = 5;
        context.lineCap = 'round';
        const s = 12;
        context.beginPath();
        context.moveTo(fx.x - s, fx.y - s);
        context.lineTo(fx.x + s, fx.y + s);
        context.moveTo(fx.x + s, fx.y - s);
        context.lineTo(fx.x - s, fx.y + s);
        context.stroke();
      }
    }
    context.restore();
    // Frame and corner label.
    context.strokeStyle = PANEL_EDGE;
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(panel.x - 3, panel.y - 3, panel.w + 6, panel.h + 6, 10);
    context.stroke();
    pill(panel.x + 10, panel.y + 10, 34, 30, 'rgba(13, 15, 22, 0.75)', PANEL_EDGE);
    text(panel === LEFT_PANEL ? 'A' : 'B', panel.x + 27, panel.y + 32, 20, INK, 'center', 'bold');
  }

  function drawHeader(state) {
    const level = LEVELS[state.levelIndex];
    text(GAME_TITLE, 24, 42, 30, INK, 'left', 'bold');
    text(formatTime(state.timeLeft), 24, 64, 15, MUTED, 'left');
    text(level.name, CANVAS_W / 2, 40, 26, INK, 'center', 'bold');
    text(`Scene ${state.levelIndex + 1} of ${LEVELS.length}`, CANVAS_W / 2, 62, 15, MUTED, 'center');
    // Remaining counter — the number the player is hunting toward.
    const left = DIFFERENCES[state.levelIndex].length - state.found.size;
    pill(950, 16, 140, 40, left === 0 ? '#2a9d8f' : '#3d3350', PANEL_EDGE);
    text(left === 0 ? 'ALL FOUND!' : `${left} LEFT`, 1020, 43, 20, INK, 'center', 'bold');
    text(`Score ${state.score}`, 1256, 43, 20, INK, 'right', 'bold');
    if (state.combo >= 2) {
      text(`Combo x${state.combo}`, 1256, 64, 15, HINT_YELLOW, 'right', 'bold');
    }
    // Timer bar.
    const frac = Math.max(0, state.timeLeft / level.timeLimit);
    context.fillStyle = '#2b2f3d';
    context.fillRect(24, 68, CANVAS_W - 48, 8);
    context.fillStyle = frac > 0.5 ? '#7dff8a' : frac > 0.25 ? HINT_YELLOW : '#ff5a4e';
    context.fillRect(24, 68, (CANVAS_W - 48) * frac, 8);
  }

  function drawFooter(state) {
    const hints = state.hintsLeft;
    pill(HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.w, HINT_BUTTON.h, hints > 0 ? '#3d3350' : '#232634', hints > 0 ? PANEL_EDGE : '#555');
    text(
      hints > 0 ? `HINT  (H)  ·  ${hints} left` : 'NO HINTS LEFT',
      HINT_BUTTON.x + HINT_BUTTON.w / 2,
      HINT_BUTTON.y + 33,
      18,
      hints > 0 ? INK : MUTED,
      'center',
      'bold',
    );
    if (state.message !== '') {
      text(state.message, CANVAS_W / 2, 640, 20, HINT_YELLOW, 'center', 'bold');
    }
    text('Click a difference in either picture · H hint · M sound · R restart · P pause', CANVAS_W / 2, 692, 15, MUTED, 'center');
    // Scene dots.
    for (let i = 0; i < LEVELS.length; i += 1) {
      context.fillStyle = i < state.levelIndex ? FOUND_GREEN : i === state.levelIndex ? HINT_YELLOW : '#555';
      context.beginPath();
      context.arc(1180 + i * 28, 632, 7, 0, Math.PI * 2);
      context.fill();
    }
  }

  function dim() {
    context.fillStyle = 'rgba(10, 12, 20, 0.72)';
    context.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  function overlayPanel(title, lines, prompt, accent) {
    const w = 620;
    const h = 150 + lines.length * 36;
    const x = (CANVAS_W - w) / 2;
    const y = (CANVAS_H - h) / 2;
    context.fillStyle = '#1c2030';
    context.beginPath();
    context.roundRect(x, y, w, h, 16);
    context.fill();
    context.strokeStyle = accent || PANEL_EDGE;
    context.lineWidth = 3;
    context.stroke();
    text(title, CANVAS_W / 2, y + 64, 40, INK, 'center', 'bold');
    lines.forEach((line, i) => text(line, CANVAS_W / 2, y + 112 + i * 36, 22, MUTED, 'center'));
    text(prompt, CANVAS_W / 2, y + h - 28, 20, HINT_YELLOW, 'center', 'bold');
  }

  function drawStars(cx, y, count) {
    for (let i = 0; i < 3; i += 1) {
      const x = cx + (i - 1) * 64;
      context.fillStyle = i < count ? HINT_YELLOW : '#3a3f52';
      context.beginPath();
      for (let p = 0; p < 10; p += 1) {
        const r = p % 2 === 0 ? 26 : 11;
        const a = (p * Math.PI) / 5 - Math.PI / 2;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (p === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.closePath();
      context.fill();
    }
  }

  function drawTitle(state) {
    // The garden, dimmed, as a backdrop.
    context.save();
    context.translate(0, 0);
    context.scale(CANVAS_W / 600, CANVAS_H / 470);
    drawScene(context, 0, new Set());
    context.restore();
    context.fillStyle = 'rgba(10, 12, 20, 0.62)';
    context.fillRect(0, 0, CANVAS_W, CANVAS_H);

    text(GAME_TITLE, CANVAS_W / 2, 118, 72, INK, 'center', 'bold');
    text('S P O T   T H E   D I F F E R E N C E', CANVAS_W / 2, 158, 24, HINT_YELLOW, 'center', 'bold');
    text('Two pictures, seven differences. Click what changed — in either picture.', CANVAS_W / 2, 206, 20, INK, 'center');
    text('Find them all before the clock runs out. Wrong clicks cost 5 seconds.', CANVAS_W / 2, 236, 18, MUTED, 'center');

    for (let i = 0; i < LEVELS.length; i += 1) {
      const card = LEVEL_CARDS[i];
      const level = LEVELS[i];
      context.fillStyle = '#1c2030';
      context.beginPath();
      context.roundRect(card.x, card.y, card.w, card.h, 14);
      context.fill();
      context.strokeStyle = PANEL_EDGE;
      context.lineWidth = 2;
      context.stroke();
      // Thumbnail: the scene itself, clipped into the card.
      context.save();
      context.beginPath();
      context.roundRect(card.x + 10, card.y + 10, card.w - 20, 150, 8);
      context.clip();
      context.translate(card.x + 10, card.y + 10);
      context.scale((card.w - 20) / 600, 150 / 470);
      drawScene(context, i, new Set());
      context.restore();
      text(`${i + 1}. ${level.name}`, card.x + 18, card.y + 196, 22, INK, 'left', 'bold');
      text(level.tag, card.x + 18, card.y + 222, 15, MUTED, 'left');
      text(`${formatTime(level.timeLimit)} on the clock · 7 differences`, card.x + 18, card.y + 246, 15, MUTED, 'left');
    }

    text('Click a scene, or press 1, 2 or 3 — then hunt!', CANVAS_W / 2, 612, 20, HINT_YELLOW, 'center', 'bold');
    if (state.best > 0) text(`Best score: ${state.best}`, CANVAS_W / 2, 648, 18, MUTED, 'center');
  }

  function drawPlay(state, now) {
    drawHeader(state);
    drawPanel(LEFT_PANEL, state.levelIndex, state, now);
    drawPanel(RIGHT_PANEL, state.levelIndex, state, now);
    drawFooter(state);
  }

  /** Paint one frame. `now` is seconds, for the pulsing effects. */
  function draw(state, screen, now) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = '#0d0f16';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);

    if (screen === SCREEN_TITLE) {
      drawTitle(state);
      return;
    }
    drawPlay(state, now);
    if (screen === SCREEN_PAUSED) {
      dim();
      overlayPanel('Paused', ['The pictures will wait for you.'], 'Press P or click to keep hunting');
    } else if (screen === SCREEN_LEVEL) {
      dim();
      const level = LEVELS[state.levelIndex];
      drawStars(CANVAS_W / 2, 196, state.stars);
      overlayPanel(
        `${level.name} — complete!`,
        [`Time bonus +${state.levelBonus}`, `Score ${state.score}`],
        'Press Enter or click for the next scene',
      );
    } else if (screen === SCREEN_VICTORY) {
      dim();
      overlayPanel(
        'You found them all!',
        [
          `All ${state.totalFound} differences across 3 scenes`,
          `Best combo x${state.bestCombo}`,
          `Final score ${state.score}   ·   Best ${state.best}`,
        ],
        'Press Enter or click to play again',
        FOUND_GREEN,
      );
    } else if (screen === SCREEN_FAILED) {
      dim();
      overlayPanel(
        'Out of time!',
        [
          `You found ${state.found.size} of ${DIFFERENCES[state.levelIndex].length} differences`,
          `Score ${state.score}`,
        ],
        'Press R or click to try this scene again',
        '#ff5a4e',
      );
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, view };
}
