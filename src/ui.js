import { W, PAL, TUNE } from './config.js';
import { drawText } from './font.js';
import { SPRITES } from './sprites.js';

// Thumb controls. The hit rects are deliberately larger than the drawn circles.
export const BTN = {
  up:    { cx: 24,  cy: 166, r: 12, hit: { x: 2,   y: 146, w: 44, h: 34 } },
  down:  { cx: 60,  cy: 166, r: 12, hit: { x: 46,  y: 146, w: 44, h: 34 } },
  boost: { cx: 292, cy: 166, r: 14, hit: { x: 258, y: 142, w: 60, h: 38 } },
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
  for (let i = 0; i < 4; i++) {
    const wid = i * 2 + 1;
    const y = dir < 0 ? cy - 3 + i : cy + 3 - i;
    ctx.fillRect(cx - i, y, wid, 1);
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

export function button(ctx, r, label, opts = {}) {
  const { active = false, dim = false, scale = 1 } = opts;
  ctx.fillStyle = active ? PAL.accent : dim ? '#123049' : '#17456b';
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = active ? PAL.foam : PAL.foamSh;
  ctx.fillRect(r.x, r.y, r.w, 1);
  ctx.fillRect(r.x, r.y + r.h - 1, r.w, 1);
  ctx.fillRect(r.x, r.y, 1, r.h);
  ctx.fillRect(r.x + r.w - 1, r.y, 1, r.h);
  drawText(ctx, label, r.x + r.w / 2, r.y + (r.h - 7 * scale) / 2 + 1, {
    scale, align: 'center',
    color: active ? PAL.ink : dim ? '#6a8ba5' : PAL.hud,
  });
}

export function meter(ctx, x, y, w, h, frac, color, back = '#0e3350') {
  ctx.fillStyle = back;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, Math.round(w * Math.max(0, Math.min(1, frac))), h);
}

/** The three thumb buttons, with a pressed state driven straight off touches. */
export function drawPad(ctx, input, player, t) {
  const upOn = input.pointerIn(BTN.up.hit) || input.held('up');
  const dnOn = input.pointerIn(BTN.down.hit) || input.held('down');
  const bsOn = player.boosting;

  disc(ctx, BTN.up.cx, BTN.up.cy, BTN.up.r, upOn ? PAL.accent : '#0d2f47');
  disc(ctx, BTN.up.cx, BTN.up.cy, BTN.up.r - 2, upOn ? PAL.accent : '#124565');
  triangle(ctx, BTN.up.cx, BTN.up.cy, -1, upOn ? PAL.ink : PAL.foam);

  disc(ctx, BTN.down.cx, BTN.down.cy, BTN.down.r, dnOn ? PAL.accent : '#0d2f47');
  disc(ctx, BTN.down.cx, BTN.down.cy, BTN.down.r - 2, dnOn ? PAL.accent : '#124565');
  triangle(ctx, BTN.down.cx, BTN.down.cy, 1, dnOn ? PAL.ink : PAL.foam);

  disc(ctx, BTN.boost.cx, BTN.boost.cy, BTN.boost.r, bsOn ? PAL.accent : '#0d2f47');
  disc(ctx, BTN.boost.cx, BTN.boost.cy, BTN.boost.r - 2, bsOn ? PAL.accent : '#124565');
  bolt(ctx, BTN.boost.cx, BTN.boost.cy, bsOn ? PAL.ink : PAL.accent);
  ring(ctx, BTN.boost.cx, BTN.boost.cy, BTN.boost.r + 3, player.boost, PAL.barrel, '#0d2f47');
}

export function drawHud(ctx, game) {
  const p = game.player;

  // Lives.
  for (let i = 0; i < p.maxLives; i++) {
    ctx.drawImage(i < p.lives ? SPRITES.heart : SPRITES.heartDim, 6 + i * 9, 6);
  }

  // Shells this run.
  ctx.drawImage(SPRITES.shell, 6, 15);
  drawText(ctx, String(game.runShells), 17, 16, { color: PAL.hud, shadow: PAL.ink });

  // Score, top right.
  drawText(ctx, String(Math.floor(game.score)), W - 6, 5, {
    scale: 2, align: 'right', color: PAL.hud, outline: PAL.ink,
  });
  drawText(ctx, `BEST ${game.save.best}`, W - 6, 21, {
    align: 'right', color: PAL.foamSh, shadow: PAL.ink,
  });

  // Barrel meter, top centre.
  const need = p.barrelNeed;
  if (p.barrelT > 0) {
    const flash = Math.floor(game.t * 10) % 2 === 0;
    drawText(ctx, 'BARREL!', W / 2, 8, {
      scale: 2, align: 'center',
      color: flash ? PAL.barrel : PAL.foam, outline: PAL.ink,
    });
    meter(ctx, W / 2 - 42, 26, 84, 4, p.barrelT / TUNE.barrelTime, PAL.barrel);
  } else {
    drawText(ctx, 'BARREL', W / 2 - 46, 7, { align: 'right', color: PAL.foamSh, shadow: PAL.ink });
    meter(ctx, W / 2 - 42, 7, 84, 6, p.barrel / need, PAL.barrel);
  }

  // Floating score popups.
  for (const f of game.floaters) {
    ctx.globalAlpha = Math.min(1, f.life * 2);
    drawText(ctx, f.text, f.x, f.y, { align: 'center', color: f.color, shadow: PAL.ink });
    ctx.globalAlpha = 1;
  }
}

