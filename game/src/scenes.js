// scenes.js: the pictures themselves. One job: draw a scene.
// Three original scenes, painted fresh with the canvas 2D API — no image
// files, no copied art. drawScene(ctx, level, applied) paints one panel:
// `applied` is a Set of difference ids that are switched on, so the left
// picture calls it with an empty set and the right picture with all seven.
// Scene space is 600 x 470.
import { mulberry32 } from './config.js';

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function star(ctx, x, y, r, points, inner) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Level 0 — Moonlit Garden
// ---------------------------------------------------------------------------
function drawGarden(ctx, d) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 470);
  sky.addColorStop(0, '#141b3d');
  sky.addColorStop(0.55, '#274b63');
  sky.addColorStop(1, '#3f6d5e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 470);

  // Stars, fixed by seed so both panels agree.
  const rng = mulberry32(20261121);
  ctx.fillStyle = '#e8ecff';
  for (let i = 0; i < 46; i += 1) {
    const x = 20 + rng() * 560;
    const y = 12 + rng() * 200;
    const r = 0.8 + rng() * 1.6;
    circle(ctx, x, y, r);
  }

  // The moon, and its crater — the difference.
  ctx.fillStyle = '#f6e7a1';
  circle(ctx, 470, 70, 42);
  ctx.fillStyle = '#e3cd7d';
  circle(ctx, 452, 56, 8);
  circle(ctx, 486, 86, 6);
  if (d.has('crater')) {
    circle(ctx, 478, 52, 9);
  }
  ctx.fillStyle = 'rgba(246, 231, 161, 0.18)';
  circle(ctx, 470, 70, 56);

  // Rolling hills.
  ctx.fillStyle = '#2c5a3c';
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.lineTo(0, 360);
  ctx.quadraticCurveTo(180, 300, 360, 360);
  ctx.quadraticCurveTo(500, 405, 600, 350);
  ctx.lineTo(600, 470);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#24492f';
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.lineTo(0, 420);
  ctx.quadraticCurveTo(220, 370, 420, 420);
  ctx.quadraticCurveTo(520, 442, 600, 420);
  ctx.lineTo(600, 470);
  ctx.closePath();
  ctx.fill();

  // The pond and its fish, which swims one way or the other.
  ctx.fillStyle = '#2e6f8e';
  ellipse(ctx, 150, 392, 112, 34);
  ctx.fillStyle = '#7fc4d8';
  ctx.beginPath();
  ctx.ellipse(150, 392, 96, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  for (const [rx, ry, rw] of [[110, 384, 46], [170, 402, 38], [96, 404, 30]]) {
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Fish: body, tail and eye; the variant flips its heading.
  const fx = 152;
  const fy = 392;
  const dir = d.has('fish') ? -1 : 1;
  ctx.fillStyle = '#ff9d5c';
  ctx.beginPath();
  ctx.ellipse(fx, fy, 20, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  poly(ctx, [
    [fx - dir * 18, fy],
    [fx - dir * 30, fy - 9],
    [fx - dir * 30, fy + 9],
  ]);
  ctx.fillStyle = '#1d2b33';
  circle(ctx, fx + dir * 9, fy - 2, 2.2);

  // The old tree, left, with a branch reaching out for a lantern.
  ctx.fillStyle = '#4a3220';
  ctx.beginPath();
  ctx.moveTo(78, 470);
  ctx.quadraticCurveTo(84, 330, 92, 210);
  ctx.quadraticCurveTo(96, 180, 110, 168);
  ctx.lineTo(128, 186);
  ctx.quadraticCurveTo(116, 240, 116, 330);
  ctx.quadraticCurveTo(116, 420, 122, 470);
  ctx.closePath();
  ctx.fill();
  // Branch to the right.
  line(ctx, 104, 220, 300, 150, 10, '#4a3220');
  // Canopy blobs.
  ctx.fillStyle = '#2e6b34';
  circle(ctx, 90, 150, 62);
  circle(ctx, 150, 120, 48);
  circle(ctx, 50, 118, 40);
  circle(ctx, 108, 96, 44);
  ctx.fillStyle = '#3a7d3f';
  circle(ctx, 78, 132, 30);
  circle(ctx, 132, 104, 24);

  // Paper lantern on the branch — present, or gone.
  if (!d.has('lantern')) {
    line(ctx, 300, 152, 300, 164, 3, '#2b2118');
    ctx.fillStyle = '#ff5a4e';
    ellipse(ctx, 300, 182, 17, 21);
    ctx.fillStyle = '#ffd166';
    rr(ctx, 293, 172, 14, 6, 2);
    rr(ctx, 293, 196, 14, 5, 2);
    ctx.fillStyle = '#ff8a7a';
    ellipse(ctx, 300, 182, 9, 15);
  }

  // The fence the cat sits on.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(30, 258, 540, 10);
  ctx.fillRect(30, 282, 540, 8);
  for (const px of [48, 130, 214, 300, 386, 472, 548]) {
    ctx.fillRect(px - 5, 246, 10, 58);
    poly(ctx, [[px - 5, 246], [px + 5, 246], [px, 234]]);
  }

  // The garden cat: body, head, ears — and a tail held high, or curled low.
  const cx = 150;
  const cy = 236;
  ctx.fillStyle = '#3d3d4d';
  ellipse(ctx, cx, cy + 8, 26, 15);
  circle(ctx, cx + 16, cy - 8, 13);
  poly(ctx, [[cx + 6, cy - 16], [cx + 10, cy - 28], [cx + 15, cy - 17]]);
  poly(ctx, [[cx + 18, cy - 18], [cx + 24, cy - 29], [cx + 27, cy - 17]]);
  ctx.fillStyle = '#ffd166';
  circle(ctx, cx + 20, cy - 10, 2);
  circle(ctx, cx + 12, cy - 10, 2);
  ctx.strokeStyle = '#3d3d4d';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (d.has('tail')) {
    // Tail curled low along the fence.
    ctx.moveTo(cx - 24, cy + 12);
    ctx.quadraticCurveTo(cx - 44, cy + 16, cx - 52, cy + 4);
  } else {
    // Tail held high.
    ctx.moveTo(cx - 24, cy + 6);
    ctx.quadraticCurveTo(cx - 40, cy - 14, cx - 34, cy - 30);
  }
  ctx.stroke();

  // Flowers along the bottom, one of which changes colour.
  const flowerSpots = [
    [60, 438, '#ff6b9d'], [110, 452, '#c084fc'], [200, 440, '#ff6b9d'],
    [300, 452, '#c084fc'], [352, 402, d.has('flower') ? '#ffd166' : '#ff5a4e'],
    [420, 446, '#ff6b9d'], [480, 438, '#c084fc'], [540, 452, '#ff6b9d'],
  ];
  for (const [fx2, fy2, col] of flowerSpots) {
    ctx.strokeStyle = '#3a7d3f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fx2, fy2 + 6);
    ctx.lineTo(fx2, fy2 + 16);
    ctx.stroke();
    ctx.fillStyle = col;
    for (let p = 0; p < 5; p += 1) {
      const a = (p * Math.PI * 2) / 5 - Math.PI / 2;
      circle(ctx, fx2 + Math.cos(a) * 7, fy2 + Math.sin(a) * 7, 5);
    }
    ctx.fillStyle = '#fff3b0';
    circle(ctx, fx2, fy2, 4);
  }

  // A mushroom beside the pond — there, or not.
  if (!d.has('mushroom')) {
    ctx.fillStyle = '#f5ead6';
    rr(ctx, 246, 424, 10, 14, 3);
    ctx.fillStyle = '#e2574c';
    ctx.beginPath();
    ctx.arc(251, 424, 15, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3f0';
    circle(ctx, 245, 416, 3);
    circle(ctx, 256, 419, 2.4);
  }

  // A night butterfly near the lantern — fluttering, or away.
  if (!d.has('butterfly')) {
    const bx = 432;
    const by = 218;
    ctx.fillStyle = '#b79cff';
    ellipse(ctx, bx - 8, by - 6, 9, 12);
    ellipse(ctx, bx + 8, by - 6, 9, 12);
    ellipse(ctx, bx - 6, by + 8, 6, 8);
    ellipse(ctx, bx + 6, by + 8, 6, 8);
    ctx.fillStyle = '#5b4a8a';
    rr(ctx, bx - 2, by - 12, 4, 26, 2);
  }

  // Fireflies drifting over the grass.
  const frng = mulberry32(777);
  for (let i = 0; i < 12; i += 1) {
    const x = 30 + frng() * 540;
    const y = 300 + frng() * 150;
    ctx.fillStyle = 'rgba(255, 240, 130, 0.9)';
    circle(ctx, x, y, 2.4);
    ctx.fillStyle = 'rgba(255, 240, 130, 0.25)';
    circle(ctx, x, y, 6);
  }
}

export { drawGarden };

// ---------------------------------------------------------------------------
// Level 1 — Harbor at Dawn
// ---------------------------------------------------------------------------
function drawHarbor(ctx, d) {
  // Sunrise sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#7d5ba6');
  sky.addColorStop(0.45, '#e08a7e');
  sky.addColorStop(1, '#ffc98a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 260);

  // The rising sun and its rays.
  ctx.fillStyle = '#fff0b8';
  circle(ctx, 90, 80, 34);
  ctx.strokeStyle = 'rgba(255, 240, 184, 0.7)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    line(ctx, 90 + Math.cos(a) * 44, 80 + Math.sin(a) * 44, 90 + Math.cos(a) * 58, 80 + Math.sin(a) * 58, 4, 'rgba(255, 240, 184, 0.7)');
  }

  // Clouds.
  ctx.fillStyle = 'rgba(255, 235, 220, 0.85)';
  for (const [cx2, cy2, s] of [[330, 60, 1], [440, 110, 0.8], [180, 150, 0.7]]) {
    ellipse(ctx, cx2, cy2, 46 * s, 14 * s);
    ellipse(ctx, cx2 - 28 * s, cy2 + 6 * s, 28 * s, 10 * s);
    ellipse(ctx, cx2 + 30 * s, cy2 + 6 * s, 30 * s, 10 * s);
  }

  // Gulls: two always, a third that may or may not join them.
  function gull(gx, gy, s) {
    ctx.strokeStyle = '#3d3350';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(gx - 12 * s, gy);
    ctx.quadraticCurveTo(gx - 4 * s, gy - 9 * s, gx, gy);
    ctx.quadraticCurveTo(gx + 4 * s, gy - 9 * s, gx + 12 * s, gy);
    ctx.stroke();
  }
  gull(140, 70, 1);
  gull(262, 112, 0.9);
  if (!d.has('gull')) gull(198, 88, 0.85);

  // The sea.
  const sea = ctx.createLinearGradient(0, 240, 0, 470);
  sea.addColorStop(0, '#3d7ea6');
  sea.addColorStop(1, '#1d4e6e');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 240, 600, 230);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  const srng = mulberry32(4242);
  for (let i = 0; i < 14; i += 1) {
    const wy = 258 + srng() * 180;
    const wx = 20 + srng() * 520;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + 18, wy - 5, wx + 40, wy);
    ctx.stroke();
  }
  // Sun glitter on the water.
  ctx.fillStyle = 'rgba(255, 220, 140, 0.5)';
  for (let i = 0; i < 10; i += 1) {
    const gy2 = 260 + i * 18;
    ctx.fillRect(78 - i * 2, gy2, 26 + i * 4, 3);
  }

  // The lighthouse, right: tower, lamp room, flag — and its beam.
  ctx.fillStyle = '#f5ead6';
  poly(ctx, [[482, 330], [492, 130], [508, 130], [518, 330]]);
  ctx.fillStyle = '#d95f4b';
  poly(ctx, [[486, 282], [488, 236], [512, 236], [514, 282]]);
  poly(ctx, [[490, 178], [492, 150], [508, 150], [510, 178]]);
  ctx.fillStyle = '#3d3350';
  rr(ctx, 488, 108, 24, 26, 4);
  ctx.fillStyle = '#ffd166';
  rr(ctx, 492, 113, 16, 16, 3);
  poly(ctx, [[486, 108], [514, 108], [500, 92]]);
  // Flag on the lamp room: red, or blue.
  line(ctx, 500, 92, 500, 66, 3, '#3d3350');
  ctx.fillStyle = d.has('flag') ? '#3d7bd9' : '#d95f4b';
  poly(ctx, [[500, 66], [528, 73], [500, 82]]);
  // The beam, sweeping out to sea — on, or off.
  if (!d.has('beam')) {
    ctx.fillStyle = 'rgba(255, 240, 170, 0.28)';
    poly(ctx, [[492, 121], [300, 84], [300, 168]]);
    ctx.fillStyle = 'rgba(255, 240, 170, 0.16)';
    poly(ctx, [[492, 121], [330, 60], [330, 190]]);
  }
  // Rocks at its foot.
  ctx.fillStyle = '#5b5b6b';
  poly(ctx, [[470, 330], [530, 330], [545, 360], [458, 360]]);
  circle(ctx, 478, 348, 12);
  circle(ctx, 522, 352, 10);

  // The big sailboat, centre: hull, mast, sail — striped, or plain.
  ctx.fillStyle = '#8a5a33';
  poly(ctx, [[252, 330], [352, 330], [332, 358], [272, 358]]);
  ctx.fillStyle = '#6e4525';
  ctx.fillRect(252, 330, 100, 8);
  line(ctx, 302, 330, 302, 226, 6, '#5b3a22');
  ctx.fillStyle = '#fff8e7';
  poly(ctx, [[306, 232], [306, 326], [352, 326]]);
  if (!d.has('stripe')) {
    ctx.fillStyle = '#d95f4b';
    poly(ctx, [[306, 268], [306, 284], [330, 284]]);
  }
  ctx.fillStyle = '#ffd166';
  poly(ctx, [[298, 232], [298, 326], [262, 326]]);

  // A little rowboat, left.
  ctx.fillStyle = '#7a4a2b';
  poly(ctx, [[120, 368], [196, 368], [182, 388], [134, 388]]);
  ctx.fillStyle = '#5b3a22';
  ctx.fillRect(132, 366, 52, 5);
  line(ctx, 168, 366, 196, 330, 4, '#5b3a22');

  // The buoy, bobbing — there, or gone.
  if (!d.has('buoy')) {
    ctx.fillStyle = '#e2574c';
    circle(ctx, 420, 384, 12);
    ctx.fillStyle = '#fff3f0';
    ctx.fillRect(410, 380, 20, 7);
    ctx.fillStyle = '#e2574c';
    poly(ctx, [[416, 372], [424, 372], [420, 360]]);
  }

  // The dock along the bottom, with crates and the anchor.
  ctx.fillStyle = '#8a6a42';
  ctx.fillRect(0, 400, 600, 70);
  ctx.fillStyle = '#75572f';
  for (let x = 0; x < 600; x += 60) ctx.fillRect(x, 400, 4, 70);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, 400, 600, 8);

  // Crate with a star mark — marked, or blank.
  ctx.fillStyle = '#b98a4e';
  rr(ctx, 496, 398, 52, 52, 4);
  ctx.strokeStyle = '#8a6a42';
  ctx.lineWidth = 3;
  ctx.strokeRect(496, 398, 52, 52);
  line(ctx, 496, 398, 548, 450, 3, '#8a6a42');
  line(ctx, 548, 398, 496, 450, 3, '#8a6a42');
  if (!d.has('star')) {
    ctx.fillStyle = '#ffd166';
    star(ctx, 522, 424, 13, 5, 0.45);
  }

  // Anchor on the dock — or just a coil of rope where it lay.
  if (!d.has('anchor')) {
    ctx.strokeStyle = '#3d3d4d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(92, 412, 10, 0, Math.PI * 2);
    ctx.stroke();
    line(ctx, 92, 422, 92, 448, 5, '#3d3d4d');
    ctx.beginPath();
    ctx.arc(92, 440, 12, 0.3, Math.PI - 0.3);
    ctx.stroke();
    line(ctx, 80, 432, 86, 448, 5, '#3d3d4d');
    line(ctx, 104, 432, 98, 448, 5, '#3d3d4d');
  } else {
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 5;
    for (const r of [14, 9, 4]) {
      ctx.beginPath();
      ctx.arc(92, 428, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// ---------------------------------------------------------------------------
// Level 2 — Night Market
// ---------------------------------------------------------------------------
function drawMarket(ctx, d) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 470);
  sky.addColorStop(0, '#0e1330');
  sky.addColorStop(0.6, '#1d2a52');
  sky.addColorStop(1, '#3a2f5e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 470);
  const srng = mulberry32(99);
  ctx.fillStyle = '#dfe6ff';
  for (let i = 0; i < 40; i += 1) {
    circle(ctx, 16 + srng() * 568, 10 + srng() * 120, 0.8 + srng() * 1.4);
  }

  // String lights sagging across the top, one bulb dark or lit.
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 34);
  ctx.quadraticCurveTo(300, 96, 600, 30);
  ctx.stroke();
  const bulbs = [60, 130, 200, 250, 320, 390, 460, 530];
  for (const bx of bulbs) {
    const t = bx / 600;
    const by = 34 + (96 - 34) * 4 * t * (1 - t) * 0.9 + 6;
    const lit = !(d.has('bulb') && bx === 250);
    ctx.fillStyle = lit ? '#ffd166' : '#4a4a58';
    circle(ctx, bx, by + 10, lit ? 7 : 6);
    if (lit) {
      ctx.fillStyle = 'rgba(255, 209, 102, 0.25)';
      circle(ctx, bx, by + 10, 14);
    }
  }

  // Cobble ground.
  ctx.fillStyle = '#4a3f55';
  ctx.fillRect(0, 380, 600, 90);
  ctx.fillStyle = '#5b4d68';
  const crng = mulberry32(1234);
  for (let i = 0; i < 60; i += 1) {
    ellipse(ctx, 12 + crng() * 576, 392 + crng() * 66, 12 + crng() * 10, 6 + crng() * 4);
  }

  // Stall helper: awning, posts, counter.
  function stall(x, w, awning, signColor) {
    ctx.fillStyle = awning;
    poly(ctx, [[x, 150], [x + w, 150], [x + w - 14, 118], [x + 14, 118]]);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let sx = x + 16; sx < x + w - 10; sx += 34) {
      poly(ctx, [[sx, 150], [sx + 16, 150], [sx + 12, 118], [sx + 4, 118]]);
    }
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(x + 6, 150, 8, 190);
    ctx.fillRect(x + w - 14, 150, 8, 190);
    ctx.fillStyle = '#8a5a33';
    ctx.fillRect(x, 300, w, 44);
    ctx.fillStyle = '#6e4525';
    ctx.fillRect(x, 300, w, 8);
    if (signColor) {
      ctx.fillStyle = signColor;
      rr(ctx, x + w / 2 - 34, 158, 68, 34, 6);
    }
  }

  // Left stall: dumplings. Its sign shows a circle, or a star.
  stall(56, 168, '#d95f4b', '#fff3d6');
  ctx.fillStyle = '#3d3350';
  if (d.has('glyph')) star(ctx, 152, 175, 11, 5, 0.45);
  else circle(ctx, 152, 175, 11);
  // Steamer baskets and their steam — puffing, or still.
  ctx.fillStyle = '#b98a4e';
  rr(ctx, 118, 268, 66, 16, 4);
  rr(ctx, 122, 252, 58, 16, 4);
  ctx.fillStyle = '#8a6a42';
  ctx.fillRect(118, 282, 66, 4);
  if (!d.has('steam')) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    circle(ctx, 140, 238, 9);
    circle(ctx, 152, 226, 11);
    circle(ctx, 164, 212, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    circle(ctx, 148, 240, 6);
  }
  // Dumplings on the counter.
  ctx.fillStyle = '#fff3d6';
  for (const [dx, dy] of [[210, 292], [228, 296], [246, 292], [262, 296]]) {
    ellipse(ctx, dx, dy, 10, 7);
  }

  // Centre stall: lanterns. One hanging lantern, red or green.
  stall(240, 160, '#3d7bd9', '#fff3d6');
  ctx.fillStyle = '#3d3350';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('灯', 320, 182);
  line(ctx, 300, 196, 300, 206, 3, '#2b2118');
  ctx.fillStyle = d.has('lantern') ? '#3fae6a' : '#ff5a4e';
  ellipse(ctx, 300, 224, 16, 20);
  ctx.fillStyle = '#ffd166';
  rr(ctx, 293, 214, 14, 6, 2);
  rr(ctx, 293, 236, 14, 5, 2);
  // Lanterns for sale on the counter.
  for (const [lx, col] of [[262, '#ff5a4e'], [290, '#ffd166'], [344, '#ff5a4e'], [372, '#3fae6a']]) {
    ctx.fillStyle = col;
    ellipse(ctx, lx, 288, 11, 13);
  }

  // Right stall: toys. Its awning stripe is teal, or orange.
  stall(416, 168, d.has('awning') ? '#e07b39' : '#2a9d8f', '#fff3d6');
  ctx.fillStyle = '#3d3350';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('玩', 500, 182);
  // Toys on the counter: a spinning top, a ball, a kite.
  ctx.fillStyle = '#e2574c';
  poly(ctx, [[452, 292], [468, 292], [460, 276]]);
  ctx.fillStyle = '#ffd166';
  circle(ctx, 486, 290, 9);
  ctx.fillStyle = '#3d7bd9';
  poly(ctx, [[510, 292], [528, 292], [528, 272], [510, 272]]);
  line(ctx, 510, 292, 528, 272, 2, '#3d7bd9');

  // A cat asleep on the right stall's roof — there, or out prowling.
  if (!d.has('roofcat')) {
    const cx = 452;
    const cy = 112;
    ctx.fillStyle = '#e8a34c';
    ellipse(ctx, cx, cy, 24, 11);
    circle(ctx, cx + 20, cy - 6, 10);
    poly(ctx, [[cx + 12, cy - 12], [cx + 15, cy - 22], [cx + 19, cy - 13]]);
    poly(ctx, [[cx + 22, cy - 13], [cx + 27, cy - 22], [cx + 29, cy - 12]]);
    ctx.strokeStyle = '#e8a34c';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy + 4);
    ctx.quadraticCurveTo(cx - 34, cy + 10, cx - 30, cy - 2);
    ctx.stroke();
    ctx.fillStyle = '#3d3350';
    circle(ctx, cx + 23, cy - 7, 1.6);
  }

  // The bicycle leaning by the right stall — with a bell, or without.
  const bx0 = 522;
  const by0 = 378;
  ctx.strokeStyle = '#3d3d4d';
  ctx.lineWidth = 4;
  circle(ctx, bx0 - 26, by0 + 26, 16);
  circle(ctx, bx0 + 26, by0 + 26, 16);
  ctx.beginPath();
  ctx.moveTo(bx0 - 26, by0 + 26);
  ctx.lineTo(bx0 - 4, by0 - 8);
  ctx.lineTo(bx0 + 26, by0 + 26);
  ctx.moveTo(bx0 - 4, by0 - 8);
  ctx.lineTo(bx0 + 8, by0 + 26);
  ctx.moveTo(bx0 - 4, by0 - 8);
  ctx.lineTo(bx0 - 14, by0 - 20);
  ctx.moveTo(bx0 - 14, by0 - 20);
  ctx.lineTo(bx0 + 2, by0 - 20);
  ctx.stroke();
  line(ctx, bx0 + 2, by0 - 20, bx0 + 14, by0 - 30, 4, '#3d3d4d');
  ctx.fillStyle = '#3d3d4d';
  circle(ctx, bx0 + 14, by0 - 30, 4);
  if (!d.has('bell')) {
    ctx.fillStyle = '#ffd166';
    circle(ctx, bx0 - 6, by0 - 20, 6);
    ctx.fillStyle = '#fff3b0';
    circle(ctx, bx0 - 6, by0 - 21, 2.5);
  }
  // Paper lanterns strung between the stalls.
  for (const [lx, ly, col] of [[232, 210, '#ff5a4e'], [408, 210, '#ffd166']]) {
    ctx.fillStyle = col;
    ellipse(ctx, lx, ly, 12, 15);
    ctx.fillStyle = '#ffd166';
    rr(ctx, lx - 5, ly - 12, 10, 4, 2);
  }
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------
export function drawScene(ctx, levelIndex, applied) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 600, 470);
  ctx.clip();
  if (levelIndex === 0) drawGarden(ctx, applied);
  else if (levelIndex === 1) drawHarbor(ctx, applied);
  else drawMarket(ctx, applied);
  ctx.restore();
}
