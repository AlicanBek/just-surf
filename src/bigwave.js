import { W, H, PAL, LANE_TOP } from './config.js';
import { hash } from './ocean.js';

// The wave chasing the player. It is not a flat wall of foam: it rises out of
// the left edge, towers up through the sky, and throws clawed foam fingers
// forward over the lanes. Everything to the left of `edge` is inside it.
//
// `edge` is the leading screen x. Claws and spray reach past it, so a hint of
// the wave stays on screen even when the front itself is just off it.
// The crest has to top out inside the width that is actually on screen, or the
// towering part of the wave is always just past the left edge.
const RISE = 34;       // px behind the front where the crest tops out
const CREST_TOP = 4;   // how close the crest gets to the top of the screen
// Anchors spaced up the steep face, from the waterline to the crest. The
// fingers hook forward off these and hang over the water ahead.
const CLAWS = [3, 7, 12, 18, 25, 33, 44, 58];

/** Screen y of the wave's crest, `d` px behind the leading edge. */
function crest(d) {
  const t = Math.min(1, Math.max(0, d) / RISE);
  const e = 1 - Math.pow(1 - t, 2.4);
  const base = LANE_TOP + 10;
  return base - (base - CREST_TOP) * e;
}

export function drawBigWave(ctx, edge, t) {
  // Claws reach ~30px forward, so start drawing a little before the front.
  if (edge < -34) return;

  const right = Math.min(Math.floor(edge), W - 1);

  for (let x = right; x >= 0; x--) {
    const d = edge - x;
    const top = Math.round(crest(d) + Math.sin(t * 3 + x * 0.16) * 0.8);

    // Crest foam, then mint, then the face darkening as it drops away.
    ctx.fillStyle = PAL.bwFoam;
    ctx.fillRect(x, top, 1, 4);
    ctx.fillStyle = PAL.bwMint;
    ctx.fillRect(x, top + 4, 1, 4);
    ctx.fillStyle = PAL.bwLight;
    ctx.fillRect(x, top + 8, 1, 9);
    ctx.fillStyle = PAL.bwMid;
    ctx.fillRect(x, top + 17, 1, 16);
    ctx.fillStyle = PAL.bwDeep;
    ctx.fillRect(x, top + 33, 1, H - top - 33);

    // Mint streaks sheeting down the face, the way the reference draws them.
    if (hash(Math.floor(d / 7), 3) < 0.32) {
      ctx.fillStyle = PAL.bwMint;
      const len = 6 + Math.round(hash(Math.floor(d / 7), 5) * 16);
      ctx.fillRect(x, top + 9, 1, Math.min(len, H - top - 9));
    }
    // Churn in the body.
    for (let i = 0; i < 3; i++) {
      if (hash(x * 3 + i, Math.floor(t * 8) + i * 7) < 0.1) {
        ctx.fillStyle = PAL.bwFoamSh;
        ctx.fillRect(x, top + 10 + Math.floor(hash(x + i, 2) * (H - top - 12)), 2, 2);
      }
    }
  }

  drawClaws(ctx, edge, t);
  drawSpray(ctx, edge, t);
}

/**
 * The curling lip: foam fingers that hook forward off the crest and hang over
 * the water ahead. This is the shape that makes it read as a breaking wave.
 */
function drawClaws(ctx, edge, t) {
  CLAWS.forEach((d, i) => {
    const ax = edge - d;
    const ay = crest(d) + Math.sin(t * 2.6 + i * 1.1) * 1.8;
    // Reaches well past the leading edge: tips land 12-40px ahead of the front.
    const reach = d + 14 + i * 5 + Math.round(Math.sin(t * 1.7 + i) * 3);

    for (let s = 0; s <= reach; s++) {
      const x = Math.round(ax + s);
      if (x < 0 || x >= W) continue;
      const p = s / reach;
      // Hooks over and curls down as it reaches out.
      const y = Math.round(ay + p * p * (14 + i * 3));
      if (y < 0 || y > H) continue;
      const thick = Math.max(1, Math.round(5 - p * 4));
      ctx.fillStyle = PAL.bwFoam;
      ctx.fillRect(x, y, 1, thick);
      if (thick > 2) {
        ctx.fillStyle = PAL.bwMint;
        ctx.fillRect(x, y + thick, 1, 1);
      }
      // Blobs shaken loose along the underside of the finger.
      if (p > 0.35 && hash(i * 31 + s, Math.floor(t * 6)) < 0.07) {
        ctx.fillStyle = PAL.bwFoam;
        ctx.fillRect(x, y + thick + 2 + Math.floor(hash(s, i) * 5), 2, 2);
      }
      // A blunt tip, so the finger ends in a curl rather than a point.
      if (s === reach) {
        ctx.fillStyle = PAL.bwFoam;
        ctx.fillRect(x - 1, y - 1, 3, 4);
        ctx.fillStyle = PAL.bwMint;
        ctx.fillRect(x - 1, y + 3, 3, 1);
      }
    }
  });
}

/** Spit and spray thrown off the crest into the sky. */
function drawSpray(ctx, edge, t) {
  ctx.fillStyle = PAL.bwFoam;
  for (let i = 0; i < 56; i++) {
    const d = 6 + hash(i, 11) * 140;
    const seed = i + Math.floor(t * 5) * 56;
    const x = Math.round(edge - d + hash(seed, 1) * (d * 0.55 + 20));
    if (x < 0 || x >= W) continue;
    const y = Math.round(crest(d) - 2 - hash(seed, 2) * 14);
    if (y < 0) continue;
    ctx.fillRect(x, y, 1, 1);
  }
}
