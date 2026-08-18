import { W, H, PAL, LANE_TOP } from './config.js';
import { hash } from './ocean.js';
import { SPRITES } from './sprites.js';

// The whitewater chasing the player: a churning white wall, capped by a curling
// lip that hooks forward over the water. It sits well behind you while you ride
// clean and rears into view once you are in trouble.
//
// `edge` is the leading screen x. Everything to the left of it is inside it.
const RISE = 40;       // px behind the front where the crest tops out
const CREST_TOP = 28;  // how high the wall's crest reaches
const CURL_BACK = 34;  // how far behind the front the curl sits

/** Screen y of the wall's crest, `d` px behind the leading edge. */
function crest(d) {
  const t = Math.min(1, Math.max(0, d) / RISE);
  const e = 1 - Math.pow(1 - t, 2.3);
  const base = LANE_TOP + 12;
  return base - (base - CREST_TOP) * e;
}

export function drawBigWave(ctx, edge, t) {
  if (edge < -20) return;
  const right = Math.min(Math.floor(edge), W - 1);

  for (let x = right; x >= 0; x--) {
    const d = edge - x;
    const top = Math.round(crest(d) + Math.sin(t * 3 + x * 0.15) * 0.8);

    // Solid whitewater, so there is never any doubt what it is.
    ctx.fillStyle = PAL.bwFoam;
    ctx.fillRect(x, top, 1, H - top);

    // A little colour just under the crest keeps it from reading as a slab.
    ctx.fillStyle = PAL.bwMint;
    ctx.fillRect(x, top + 4, 1, 2);
    if (hash(Math.floor(d / 6), 3) < 0.34) {
      ctx.fillStyle = PAL.bwMint;
      const len = 5 + Math.round(hash(Math.floor(d / 6), 5) * 14);
      ctx.fillRect(x, top + 7, 1, len);
    }

    // Churn.
    const churn = Math.floor(t * 10);
    for (let i = 0; i < 4; i++) {
      if (hash(x * 3 + i, churn + i * 7) < 0.13) {
        ctx.fillStyle = PAL.bwFoamSh;
        ctx.fillRect(x, top + 8 + Math.floor(hash(x + i, 2) * (H - top - 10)), 2, 2);
      }
    }
  }

  // The lip, sitting on top of the crest so it reads against the sky rather
  // than disappearing into the white of the wall.
  const art = SPRITES.waveCurl;
  const cx = Math.round(edge - CURL_BACK);
  const cy = Math.round(crest(CURL_BACK) - art.height + 5 + Math.sin(t * 2.4) * 0.8);
  if (cx + art.width > 0 && cx < W) ctx.drawImage(art, cx, cy);

  drawSpray(ctx, edge, t);
}

/** Spit and spray thrown off the crest into the sky. */
function drawSpray(ctx, edge, t) {
  ctx.fillStyle = PAL.bwFoam;
  for (let i = 0; i < 46; i++) {
    const d = 8 + hash(i, 11) * 120;
    const seed = i + Math.floor(t * 5) * 46;
    const x = Math.round(edge - d + hash(seed, 1) * 34);
    if (x < 0 || x >= W) continue;
    const y = Math.round(crest(d) - 3 - hash(seed, 2) * 16);
    if (y < 0) continue;
    ctx.fillRect(x, y, 1, 1);
  }
}
