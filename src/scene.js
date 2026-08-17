import { W, H, PAL, HORIZON, LANES, laneY } from './config.js';
import { SPRITES, drawRotated } from './sprites.js';
import { hash } from './ocean.js';

function fillDisc(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(Math.sqrt(r * r - y * y));
    ctx.fillRect(Math.round(cx - half), Math.round(cy + y), half * 2 + 1, 1);
  }
}

// Two checkerboard rows between colour bands: a cheap, very 8-bit gradient.
function dither(ctx, y, color, phase = 0) {
  ctx.fillStyle = color;
  for (let x = phase % 2; x < W; x += 2) ctx.fillRect(x, y, 1, 1);
}

export class Scene {
  constructor() {
    this.t = 0;
    this.dolphin = null;
    this.nextDolphin = 6;
  }

  update(dt, scrollX) {
    this.t += dt;
    this.nextDolphin -= dt;

    if (!this.dolphin && this.nextDolphin <= 0) {
      const lane = 1 + Math.floor(Math.random() * (LANES - 2));
      this.dolphin = { x: scrollX + W + 24, base: laneY(lane), y: 0, vy: -78, life: 0 };
      this.nextDolphin = 12 + Math.random() * 14;
    }

    if (this.dolphin) {
      const d = this.dolphin;
      d.life += dt;
      d.x -= 22 * dt;
      d.y += d.vy * dt;
      d.vy += 190 * dt;
      if ((d.life > 0.4 && d.y > 0) || d.x < scrollX - 40) this.dolphin = null;
    }
  }

  drawSky(ctx, scrollX) {
    ctx.fillStyle = PAL.skyHi;
    ctx.fillRect(0, 0, W, 20);
    dither(ctx, 20, PAL.skyMid);
    dither(ctx, 21, PAL.skyMid, 1);
    ctx.fillStyle = PAL.skyMid;
    ctx.fillRect(0, 22, W, 18);
    dither(ctx, 40, PAL.skyLo);
    dither(ctx, 41, PAL.skyLo, 1);
    ctx.fillStyle = PAL.skyLo;
    ctx.fillRect(0, 42, W, 8);
    dither(ctx, 50, PAL.skyHorz);
    dither(ctx, 51, PAL.skyHorz, 1);
    ctx.fillStyle = PAL.skyHorz;
    ctx.fillRect(0, 52, W, HORIZON - 52);

    // Low on the right, clear of both the title and the score readout.
    fillDisc(ctx, 288, 41, 13, PAL.sunGlow);
    fillDisc(ctx, 288, 41, 11, PAL.sun);

    this.drawClouds(ctx, scrollX);
    this.drawIsland(ctx, scrollX);
    this.drawGulls(ctx, scrollX);
  }

  drawClouds(ctx, scrollX) {
    const span = 190;
    const first = Math.floor((scrollX * 0.1) / span) - 1;
    for (let i = first; i < first + 4; i++) {
      const x = Math.round(i * span + hash(i, 11) * 90 - scrollX * 0.1);
      if (x > W + 70 || x < -70) continue;
      const y = 8 + Math.round(hash(i, 12) * 24);
      const s = 1 + Math.round(hash(i, 13) * 1.5);
      ctx.fillStyle = PAL.cloud;
      ctx.fillRect(x, y, 22 * s, 4);
      ctx.fillRect(x + 4 * s, y - 3, 12 * s, 4);
      ctx.fillRect(x + 2 * s, y + 4, 17 * s, 3);
      ctx.fillStyle = PAL.cloudSh;
      ctx.fillRect(x + 1, y + 7, 18 * s, 1);
    }
  }

  drawIsland(ctx, scrollX) {
    const span = 2600;
    const first = Math.floor((scrollX * 0.055) / span);
    for (let i = first; i <= first + 1; i++) {
      const x = Math.round(i * span + 700 - scrollX * 0.055);
      if (x > W + 70 || x < -70) continue;
      const base = HORIZON;
      ctx.fillStyle = PAL.island;
      for (let dx = -26; dx <= 26; dx++) {
        const h = Math.round(13 * Math.cos((dx / 26) * 1.35));
        if (h > 0) ctx.fillRect(x + dx, base - h, 1, h);
      }
      ctx.fillStyle = PAL.islandDk;
      for (let dx = 3; dx <= 26; dx++) {
        const h = Math.round(13 * Math.cos((dx / 26) * 1.35));
        if (h > 0) ctx.fillRect(x + dx, base - h, 1, Math.max(1, h - 2));
      }
      ctx.fillStyle = PAL.islandSand;
      ctx.fillRect(x - 30, base - 1, 61, 1);
      for (const [px, ph] of [[-14, 9], [11, 7]]) {
        ctx.fillStyle = PAL.islandDk;
        ctx.fillRect(x + px, base - 13 - ph, 1, ph);
        ctx.fillStyle = PAL.island;
        ctx.fillRect(x + px - 3, base - 14 - ph, 7, 1);
        ctx.fillRect(x + px - 2, base - 15 - ph, 5, 1);
      }
    }
  }

  drawGulls(ctx, scrollX) {
    for (let i = 0; i < 3; i++) {
      const span = 300;
      const wx = i * 97 + 40 + this.t * (7 + i * 3);
      const x = Math.round(((wx - scrollX * 0.22) % span + span) % span - 20);
      const y = 14 + i * 10 + Math.round(Math.sin(this.t * 0.9 + i) * 3);
      const flap = Math.floor(this.t * 6 + i * 2) % 2 === 0;
      ctx.drawImage(flap ? SPRITES.gullA : SPRITES.gullB, x, y);
    }
  }

  drawDolphin(ctx, scrollX) {
    const d = this.dolphin;
    if (!d) return;
    const sx = d.x - scrollX;
    if (sx < -20 || sx > W + 20) return;
    const angle = Math.atan2(d.vy, 60) * 0.7;
    drawRotated(ctx, SPRITES.dolphin, sx, d.base + d.y, angle, { x: 9, y: 5 }, true);
  }
}
