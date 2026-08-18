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

// The sun never moves, so every sky pixel's angle and distance from it are
// computed once. That makes a hard-edged, per-pixel sunburst cheap enough to
// redraw every frame: at run time the ray test is just a modulo.
const SKY_A = new Float32Array(W * HORIZON);
const SKY_R = new Float32Array(W * HORIZON);
for (let y = 0; y < HORIZON; y++) {
  for (let x = 0; x < W; x++) {
    const dx = x - SUN.x;
    const dy = y - SUN.y;
    const i = y * W + x;
    SKY_R[i] = Math.hypot(dx, dy);
    // 0 is due right along the horizon, PI/2 straight up, PI due left.
    SKY_A[i] = Math.atan2(-dy, dx);
  }
}

const RAYS = 13;                      // wedges across the half circle
const RAY_STEP = Math.PI / RAYS;
const RAY_HALF = RAY_STEP * 0.36;     // wide enough to be bold, with clear gaps

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

  /**
   * A sunburst filling the whole half circle of sky, horizon to horizon. Drawn
   * per pixel rather than as strips: a strip is only the cross-section of a ray
   * that happens to point upward, and smears along its own length once the ray
   * lies flat.
   *
   * Two passes at the same alpha, the second stopping short, so the wedges are
   * brightest near the sun and fade outward without needing per-pixel alpha.
   */
  drawRays(ctx) {
    const spin = Math.sin(this.t * 0.16) * 0.03;
    ctx.fillStyle = PAL.ray;
    for (const [maxR, alpha] of [[240, 0.34], [104, 0.24]]) {
      ctx.globalAlpha = alpha;
      for (let y = 0; y < HORIZON; y++) {
        for (let x = 0; x < W; x++) {
          const i = y * W + x;
          const a = SKY_A[i];
          if (a < 0) continue;                    // sky above the sun only
          const r = SKY_R[i];
          if (r < SUN.r + 3 || r > maxR) continue;
          const phase = ((a + spin) % RAY_STEP + RAY_STEP) % RAY_STEP;
          if (Math.min(phase, RAY_STEP - phase) > RAY_HALF) continue;
          ctx.fillRect(x, y, 1, 1);
        }
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

      // Palms along the shore, drawn after the cone so they silhouette against
      // both the slope and the sky. Each leans away from the peak, and they are
      // spaced so their crowns stay separate.
      for (const f of [-0.95, -0.60, 0.58, 0.92]) {
        const art = f < 0 ? SPRITES.palmB : SPRITES.palmA;
        const px = x + Math.round(wide * f) - (art.width >> 1);
        ctx.drawImage(art, px, HORIZON - art.height);
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
    const angle = Math.atan2(d.vy, 88) * 0.86;
    drawRotated(ctx, SPRITES.dolphin, d.sx, d.base + d.y, angle, { x: 15, y: 12 });
  }
}
