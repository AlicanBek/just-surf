import { W, PAL, TUNE } from './config.js';
import { drawText, textWidth, GLYPH_H } from './font.js';
import { SPRITES } from './sprites.js';

// Thumb controls. Drawn inside the foreground strip below the last lane so they
// never cover water you are riding on, and kept clear of the screen edges: the
// old boost ring was drawn at a radius that ran off the bottom and the right.
// `hit` is deliberately larger than `box`, so fingers get a generous target.
export const BTN = {
  up:    { box: { x: 8,   y: 155, w: 40, h: 21 }, hit: { x: 0,   y: 138, w: 46, h: 42 } },
  down:  { box: { x: 52,  y: 155, w: 40, h: 21 }, hit: { x: 46,  y: 138, w: 46, h: 42 } },
  boost: { box: { x: 246, y: 155, w: 66, h: 21 }, hit: { x: 238, y: 138, w: 82, h: 42 } },
};

export function disc(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(Math.sqrt(r * r - y * y));
    ctx.fillRect(Math.round(cx - half), Math.round(cy + y), half * 2 + 1, 1);
  }
}

function ring(ctx, cx, cy, r, frac, on, off) {
  const n = 44;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    ctx.fillStyle = i / n < frac ? on : off;
    ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 2, 2);
  }
}

function triangle(ctx, cx, cy, dir, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const wid = i * 2 + 1;
    const y = dir < 0 ? cy - 4 + i : cy + 4 - i;
    ctx.fillRect(Math.round(cx) - i, Math.round(y), wid, 1);
  }
}

const BOLT = ['....ff', '...ff.', '..ff..', '.fffff', '..ff..', '.ff...', 'ff....'];

function bolt(ctx, cx, cy, color) {
  ctx.fillStyle = color;
  BOLT.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === 'f') ctx.fillRect(cx - 3 + x, cy - 3 + y, 1, 1);
    }
  });
}

/** A framed panel; the workhorse for every menu. */
export function panel(ctx, x, y, w, h, alpha = 0.82) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
  ctx.fillStyle = PAL.foamSh;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
}

// One button style for the whole game: same height, same text size, on every
// screen. Rows differ in width only, because their labels do.
export const BTN_H = 24;
export const BTN_SCALE = 1.5;
const PAD_X = 10;
const PAD_Y = 8;

function fits(label, r, scale) {
  return textWidth(label, scale) <= r.w - PAD_X && GLYPH_H * scale <= r.h - PAD_Y;
}

export function button(ctx, r, label, opts = {}) {
  const { active = false, dim = false } = opts;
  // Always the house size, unless a label genuinely will not fit, in which case
  // shrink rather than spill out of the box.
  const scale = fits(label, r, BTN_SCALE) ? BTN_SCALE : 1;

  ctx.fillStyle = active ? PAL.accent : dim ? '#123049' : '#17456b';
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = active ? PAL.foam : PAL.foamSh;
  ctx.fillRect(r.x, r.y, r.w, 1);
  ctx.fillRect(r.x, r.y + r.h - 1, r.w, 1);
  ctx.fillRect(r.x, r.y, 1, r.h);
  ctx.fillRect(r.x + r.w - 1, r.y, 1, r.h);
  drawText(ctx, label, r.x + r.w / 2, r.y + (r.h - GLYPH_H * scale) / 2 + 1, {
    scale, align: 'center',
    color: active ? PAL.ink : dim ? '#6a8ba5' : PAL.hud,
  });
}

/**
 * A shell icon sitting right against its count, drawn as one unit so the two
 * never drift apart.
 */
export function shellCount(ctx, rightX, y, value, scale = 1.5, color = PAL.accent) {
  const text = String(value);
  const tw = textWidth(text, scale);
  const icon = SPRITES.shell;
  drawText(ctx, text, rightX, y, { align: 'right', scale, color, outline: PAL.ink });
  ctx.drawImage(icon, Math.round(rightX - tw - icon.width - 2), Math.round(y));
}

export function meter(ctx, x, y, w, h, frac, color, back = '#0e3350') {
  ctx.fillStyle = back;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, Math.round(w * Math.max(0, Math.min(1, frac))), h);
}

/** A control-pad key: dark frame, lit face, and an optional fill level. */
function pad(ctx, b, on, fill = 0) {
  const { x, y, w, h } = b;
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = on ? PAL.accent : '#123f5e';
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  // Boost shows how much is left as a bar behind its glyph.
  if (fill > 0 && !on) {
    ctx.fillStyle = '#1e6f9c';
    ctx.fillRect(x + 1, y + 1, Math.round((w - 2) * Math.min(1, fill)), h - 2);
  }
  // Top edge highlight, bottom edge shadow: enough to read as a key.
  ctx.fillStyle = on ? PAL.foam : '#2a7ba8';
  ctx.fillRect(x + 1, y + 1, w - 2, 1);
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
  ctx.globalAlpha = 1;
  // Clipped corners, so the keys are not hard rectangles.
  ctx.fillStyle = PAL.shore;
  for (const [cx, cy] of [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]]) {
    ctx.fillRect(cx, cy, 1, 1);
  }
}

export function drawPad(ctx, input, player, t) {
  const upOn = input.pointerIn(BTN.up.hit) || input.held('up');
  const dnOn = input.pointerIn(BTN.down.hit) || input.held('down');
  const bsOn = player.boosting;
  const empty = player.boost <= 0.02;

  pad(ctx, BTN.up.box, upOn);
  triangle(ctx, BTN.up.box.x + BTN.up.box.w / 2, BTN.up.box.y + 10, -1,
    upOn ? PAL.ink : PAL.foam);

  pad(ctx, BTN.down.box, dnOn);
  triangle(ctx, BTN.down.box.x + BTN.down.box.w / 2, BTN.down.box.y + 11, 1,
    dnOn ? PAL.ink : PAL.foam);

  pad(ctx, BTN.boost.box, bsOn, player.boost);
  const b = BTN.boost.box;
  const ink = bsOn ? PAL.ink : empty ? '#5c7f95' : PAL.accent;
  bolt(ctx, b.x + 12, b.y + 10, ink);
  drawText(ctx, 'BOOST', b.x + 22, b.y + 7, {
    color: bsOn ? PAL.ink : empty ? '#5c7f95' : PAL.foam,
  });
}

export function drawHud(ctx, game) {
  const p = game.player;

  // Lives.
  for (let i = 0; i < p.maxLives; i++) {
    ctx.drawImage(i < p.lives ? SPRITES.heart : SPRITES.heartDim, 6 + i * 9, 5);
  }

  // Shells this run, icon tight against the number.
  ctx.drawImage(SPRITES.shell, 5, 16);
  drawText(ctx, String(game.runShells), 17, 17, {
    scale: 1.5, color: PAL.accent, outline: PAL.ink,
  });

  // Score, top right.
  drawText(ctx, String(Math.floor(game.score)), W - 6, 5, {
    scale: 1.5, align: 'right', color: PAL.hud, outline: PAL.ink,
  });
  drawText(ctx, `BEST ${game.save.best}`, W - 6, 18, {
    align: 'right', color: PAL.foamSh, shadow: PAL.ink,
  });

  // HIGH TIDE meter, top centre. Loud when live, since the whole point is
  // that you can see it paying out.
  if (p.tideT > 0) {
    const flash = Math.floor(game.t * 10) % 2 === 0;
    drawText(ctx, 'HIGH TIDE  X3', W / 2, 8, {
      scale: 2, align: 'center',
      color: flash ? PAL.tide : PAL.foam, outline: PAL.ink,
    });
    meter(ctx, W / 2 - 52, 26, 104, 4, p.tideT / TUNE.tideTime, PAL.tide);
  } else {
    drawText(ctx, 'HIGH TIDE', W / 2 - 46, 7, {
      align: 'right', color: PAL.foamSh, shadow: PAL.ink,
    });
    meter(ctx, W / 2 - 42, 7, 84, 6, p.tide / p.tideNeed, PAL.tide);
  }

  // Floating score popups.
  for (const f of game.floaters) {
    ctx.globalAlpha = Math.min(1, f.life * 2);
    drawText(ctx, f.text, f.x, f.y, { align: 'center', color: f.color, shadow: PAL.ink });
    ctx.globalAlpha = 1;
  }
}

