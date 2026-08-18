import { W, PAL, HORIZON, LANE_TOP, LANES, laneY } from './config.js';
import { SPRITES, drawRotated } from './sprites.js';
import { hash } from './ocean.js';

function fillDisc(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(Math.sqrt(r * r - y * y));
    ctx.fillRect(Math.round(cx - half), Math.round(cy + y), half * 2 + 1, 1);
  }
}

function lerpHex(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.substr(i, 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.substr(i, 2), 16));
  const m = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}

export class Scene {
  constructor() {
    this.t = 0;
    this.dolphin = null;
    this.nextDolphin = 5;
    this.splashes = [];
    // Fins cruising across the face of the big wave, purely for atmosphere.
    this.fins = [
      { x: 0, lane: 0.6, speed: 15, phase: 0 },
      { x: 0, lane: 2.4, speed: 11, phase: 2.1 },
    ];
  }

  update(dt, scrollX) {
    this.t += dt;
    this.nextDolphin -= dt;

    // The dolphin lives in screen space, not world space: it overtakes the
    // surfer from behind and porpoises across to the right.
    if (!this.dolphin && this.nextDolphin <= 0) {
      // Kept to the far lanes so it never reads as something to dodge.
      const lane = Math.random() < 0.5 ? 0 : 1;
      this.dolphin = { sx: -36, base: laneY(lane), y: 0, vy: -128, leaps: 2 };
      this.nextDolphin = 11 + Math.random() * 12;
    }

    if (this.dolphin) {
      const d = this.dolphin;
      d.sx += 148 * dt;
      d.y += d.vy * dt;
      d.vy += 190 * dt;
      if (d.y >= 0 && d.vy > 0) {
        d.y = 0;
        this.splash(d.sx, d.base);
        d.leaps -= 1;
        if (d.leaps > 0) d.vy = -104;
        else this.dolphin = null;
      }
      if (this.dolphin && this.dolphin.sx > W + 44) this.dolphin = null;
    }

    for (const s of this.splashes) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 150 * dt;
      s.life -= dt;
    }
    this.splashes = this.splashes.filter((s) => s.life > 0);
  }

  splash(x, y) {
    for (let i = 0; i < 16; i++) {
      this.splashes.push({
        x, y,
        vx: (Math.random() - 0.35) * 70,
        vy: -(20 + Math.random() * 70),
        life: 0.25 + Math.random() * 0.35,
      });
    }
  }

  /** Clean gradient sky, sun, a couple of clouds and a distant island. */
  drawSky(ctx, scrollX) {
    // Painted past the horizon: the wave's lip rises and falls, so the sky has
    // to reach below HORIZON or a gap opens up wherever the crest dips.
    for (let y = 0; y < HORIZON + 20; y++) {
      const t = Math.min(1, y / (HORIZON - 1));
      ctx.fillStyle = t < 0.55
        ? lerpHex(PAL.skyTop, PAL.skyMid, t / 0.55)
        : lerpHex(PAL.skyMid, PAL.skyLow, (t - 0.55) / 0.45);
      ctx.fillRect(0, y, W, 1);
    }

    // Tucked between the barrel meter and the score readout.
    fillDisc(ctx, 232, 13, 10, PAL.sunGlow);
    fillDisc(ctx, 232, 13, 8, PAL.sun);

    this.drawClouds(ctx, scrollX);
    this.drawIsland(ctx, scrollX);
    this.drawGulls(ctx, scrollX);
  }

  drawClouds(ctx, scrollX) {
    const span = 210;
    const first = Math.floor((scrollX * 0.09) / span) - 1;
    for (let i = first; i < first + 4; i++) {
      const x = Math.round(i * span + hash(i, 11) * 110 - scrollX * 0.09);
      if (x > W + 60 || x < -60) continue;
      const y = 2 + Math.round(hash(i, 12) * 7);
      const s = 1 + Math.round(hash(i, 13) * 1.4);
      ctx.fillStyle = PAL.cloud;
      ctx.fillRect(x, y + 3, 20 * s, 3);
      ctx.fillRect(x + 4 * s, y, 11 * s, 3);
      ctx.fillStyle = PAL.cloudSh;
      ctx.fillRect(x + 1, y + 6, 17 * s, 1);
    }
  }

  /**
   * One island at a time, drifting slowly. The span is only a little wider than
   * the screen so there is almost always one in view.
   */
  drawIsland(ctx, scrollX) {
    const span = 430;
    const off = scrollX * 0.045;
    const first = Math.floor(off / span) - 1;
    for (let i = first; i <= first + 2; i++) {
      const x = Math.round(i * span + 150 - off);
      if (x > W + 60 || x < -60) continue;
      const base = HORIZON;
      const big = 12 + Math.round(hash(i, 61) * 5);
      const wide = 26 + Math.round(hash(i, 62) * 10);

      // Two humps so it reads as a landmass rather than a blob.
      for (let dx = -wide; dx <= wide; dx++) {
        const t = dx / wide;
        const h = Math.round(big * Math.cos(t * 1.4) + big * 0.32 * Math.cos(t * 4.2 + 1));
        if (h <= 0) continue;
        ctx.fillStyle = PAL.island;
        ctx.fillRect(x + dx, base - h, 1, h);
        ctx.fillStyle = dx < -2 ? PAL.islandLt : PAL.islandDk;
        ctx.fillRect(x + dx, base - h, 1, Math.max(1, Math.round(h * 0.4)));
      }
      ctx.fillStyle = PAL.islandSand;
      ctx.fillRect(x - wide - 4, base - 1, wide * 2 + 9, 1);

      // Palms.
      for (const [px, ph] of [[-wide + 8, 8], [wide - 10, 6], [2, 10]]) {
        const trunk = base - big - ph + 4;
        ctx.fillStyle = PAL.islandDk;
        ctx.fillRect(x + px, trunk, 1, ph);
        ctx.fillStyle = PAL.island;
        ctx.fillRect(x + px - 3, trunk - 1, 7, 1);
        ctx.fillRect(x + px - 2, trunk - 2, 5, 1);
      }
    }
  }

  drawGulls(ctx, scrollX) {
    for (let i = 0; i < 2; i++) {
      const span = 300;
      const wx = i * 140 + 40 + this.t * (8 + i * 4);
      const x = Math.round(((wx - scrollX * 0.2) % span + span) % span - 20);
      const y = 4 + i * 7 + Math.round(Math.sin(this.t * 0.9 + i) * 2);
      const flap = Math.floor(this.t * 6 + i * 2) % 2 === 0;
      ctx.drawImage(flap ? SPRITES.gullA : SPRITES.gullB, x, y);
    }
  }

  /** Fins patrolling the wave face behind the lanes. */
  drawSharks(ctx, scrollX) {
    for (const f of this.fins) {
      const span = W + 80;
      const x = Math.round(((-scrollX * 0.3 - f.speed * this.t + f.phase * 90) % span + span) % span - 40);
      const y = Math.round(LANE_TOP - 14 + Math.sin(this.t * 0.7 + f.phase) * 3 - f.lane * 3);
      ctx.drawImage(SPRITES.fin, x, y);
      // A little wake trailing behind.
      ctx.fillStyle = PAL.foam;
      ctx.globalAlpha = 0.5;
      for (let i = 1; i < 7; i++) {
        if (hash(i, Math.floor(this.t * 4) + f.phase) < 0.4) continue;
        ctx.fillRect(x + 10 + i * 2, y + 4 + (i % 2), 1, 1);
      }
      ctx.globalAlpha = 1;
    }
  }

  drawDolphin(ctx) {
    ctx.fillStyle = PAL.foam;
    for (const s of this.splashes) {
      ctx.globalAlpha = Math.min(1, s.life * 3);
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
    }
    ctx.globalAlpha = 1;

    const d = this.dolphin;
    if (!d || d.sx < -40 || d.sx > W + 44) return;
    // Nose follows the arc: up on the way out, down on the way back in.
    const angle = Math.atan2(d.vy, 148) * 0.85;
    drawRotated(ctx, SPRITES.dolphin, d.sx, d.base + d.y, angle, { x: 15, y: 8 });
  }
}
