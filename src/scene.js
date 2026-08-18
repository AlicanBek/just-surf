import { W, PAL, HORIZON, LANES, laneY } from './config.js';
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

const SUN = { x: 168, y: 58, r: 26 };

export class Scene {
  constructor() {
    this.t = 0;
    this.dolphin = null;
    this.nextDolphin = 5;
    this.splashes = [];
  }

  update(dt, scrollX) {
    this.t += dt;
    this.nextDolphin -= dt;

    // One arc per appearance: in from the left, up, down, gone.
    if (!this.dolphin && this.nextDolphin <= 0) {
      const lane = Math.random() < 0.5 ? 0 : 1;
      this.dolphin = { sx: -36, base: laneY(lane), y: 0, vy: -146 };
      this.nextDolphin = 10 + Math.random() * 12;
    }

    if (this.dolphin) {
      const d = this.dolphin;
      d.sx += 150 * dt;
      d.y += d.vy * dt;
      d.vy += 215 * dt;
      if ((d.y >= 0 && d.vy > 0) || d.sx > W + 44) {
        if (d.y >= 0) this.splash(d.sx, d.base);
        this.dolphin = null;
      }
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
    for (let i = 0; i < 18; i++) {
      this.splashes.push({
        x, y,
        vx: (Math.random() - 0.35) * 80,
        vy: -(20 + Math.random() * 80),
        life: 0.25 + Math.random() * 0.35,
      });
    }
  }

  drawSky(ctx, scrollX) {
    for (let y = 0; y < HORIZON; y++) {
      const t = y / (HORIZON - 1);
      ctx.fillStyle = t < 0.42
        ? lerpHex(PAL.skyTop, PAL.skyMid, t / 0.42)
        : t < 0.78
          ? lerpHex(PAL.skyMid, PAL.skyLow, (t - 0.42) / 0.36)
          : lerpHex(PAL.skyLow, PAL.skyHaze, (t - 0.78) / 0.22);
      ctx.fillRect(0, y, W, 1);
    }

    this.drawRays(ctx);

    // Sun sitting on the horizon, half swallowed by the sea.
    fillDisc(ctx, SUN.x, SUN.y, SUN.r + 2, PAL.sunEdge);
    fillDisc(ctx, SUN.x, SUN.y, SUN.r, PAL.sun);

    this.drawIsland(ctx, scrollX);
    this.drawClouds(ctx, scrollX);
    this.drawGulls(ctx, scrollX);
  }

  /** Wedges fanning up out of the sun, as in the reference. */
  drawRays(ctx) {
    const count = 9;
    ctx.fillStyle = PAL.ray;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < count; i++) {
      // Fixed fan, gently breathing so it is not dead still.
      const a = -Math.PI / 2 + (i - (count - 1) / 2) * 0.30
        + Math.sin(this.t * 0.25 + i) * 0.012;
      const spread = 0.055;
      for (let r = 12; r < 130; r += 1) {
        const half = Math.max(1, r * spread);
        const cx = SUN.x + Math.cos(a) * r;
        const cy = SUN.y + Math.sin(a) * r;
        if (cy < -4) continue;
        ctx.fillRect(Math.round(cx - half), Math.round(cy), Math.round(half * 2), 1);
      }
    }
    ctx.globalAlpha = 1;
  }

  drawClouds(ctx, scrollX) {
    const span = 230;
    const first = Math.floor((scrollX * 0.09) / span) - 1;
    for (let i = first; i < first + 4; i++) {
      const x = Math.round(i * span + hash(i, 11) * 120 - scrollX * 0.09);
      if (x > W + 60 || x < -60) continue;
      const y = 6 + Math.round(hash(i, 12) * 16);
      const s = 1 + Math.round(hash(i, 13) * 1.4);
      ctx.fillStyle = PAL.cloud;
      ctx.fillRect(x, y + 3, 20 * s, 3);
      ctx.fillRect(x + 4 * s, y, 11 * s, 3);
      ctx.fillStyle = PAL.cloudSh;
      ctx.fillRect(x + 1, y + 6, 17 * s, 1);
    }
  }

  /** A volcanic cone on the horizon, snow-capped and backlit. */
  drawIsland(ctx, scrollX) {
    const span = 460;
    const off = scrollX * 0.045;
    const first = Math.floor(off / span) - 1;
    for (let i = first; i <= first + 2; i++) {
      const x = Math.round(i * span + 150 - off);
      if (x > W + 70 || x < -70) continue;
      const peak = 20 + Math.round(hash(i, 61) * 6);
      const wide = 34 + Math.round(hash(i, 62) * 12);

      for (let dx = -wide; dx <= wide; dx++) {
        const t = Math.abs(dx) / wide;
        const h = Math.round(peak * (1 - Math.pow(t, 1.45)));
        if (h <= 0) continue;
        ctx.fillStyle = dx < -1 ? PAL.islandLt : PAL.island;
        ctx.fillRect(x + dx, HORIZON - h, 1, h);
        if (dx > wide * 0.35) {
          ctx.fillStyle = PAL.islandDk;
          ctx.fillRect(x + dx, HORIZON - h, 1, h);
        }
        // Snow on the top few pixels of the cone.
        if (h > peak - 6) {
          ctx.fillStyle = PAL.islandSnow;
          ctx.fillRect(x + dx, HORIZON - h, 1, Math.min(3, h));
        }
      }
    }
  }

  drawGulls(ctx, scrollX) {
    for (let i = 0; i < 2; i++) {
      const span = 320;
      const wx = i * 150 + 40 + this.t * (8 + i * 4);
      const x = Math.round(((wx - scrollX * 0.2) % span + span) % span - 20);
      const y = 10 + i * 9 + Math.round(Math.sin(this.t * 0.9 + i) * 2);
      const flap = Math.floor(this.t * 6 + i * 2) % 2 === 0;
      ctx.drawImage(flap ? SPRITES.gullA : SPRITES.gullB, x, y);
    }
  }

  drawDolphin(ctx) {
    ctx.fillStyle = PAL.foam;
    for (const s of this.splashes) {
      ctx.globalAlpha = Math.min(1, s.life * 3);
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
      ctx.globalAlpha = 1;
    }

    const d = this.dolphin;
    if (!d || d.sx < -40 || d.sx > W + 44) return;
    // Leaves the water already pitched up and comes back down headfirst. The
    // sprite is drawn arched, so it carries some pitch of its own; this is
    // dialled back to suit rather than measured off the true velocity angle.
    const angle = Math.atan2(d.vy, 96) * 0.72;
    drawRotated(ctx, SPRITES.dolphin, d.sx, d.base + d.y, angle, { x: 15, y: 12 });
  }
}
