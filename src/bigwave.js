import { W, H, PAL, LANE_TOP } from './config.js';
import { hash } from './ocean.js';

// The whitewater chasing the player. Deliberately simple: a wall of foam with a
// curved crest and a few rounded lumps along the top, so it reads at a glance
// as "a wall of water is about to eat you" and nothing else.
//
// `edge` is the leading screen x. Everything to the left of it is inside it.
const RISE = 46;       // px behind the front where the crest tops out
const CREST_TOP = 30;  // how high the crest reaches

/** Screen y of the crest, `d` px behind the leading edge. */
function crest(d) {
  const t = Math.min(1, Math.max(0, d) / RISE);
  const e = 1 - Math.pow(1 - t, 2.2);
  const base = LANE_TOP + 14;
  return base - (base - CREST_TOP) * e;
}

export function drawBigWave(ctx, edge, t) {
  if (edge < -12) return;
  const right = Math.min(Math.floor(edge), W - 1);

  for (let x = right; x >= 0; x--) {
    const d = edge - x;
    // Rounded lumps riding along the crest give it a foamy edge.
    const lump = Math.sin(d * 0.26 + t * 2.2) * 2 + Math.sin(d * 0.11 - t * 1.3) * 1.6;
    const top = Math.round(crest(d) + lump);

    ctx.fillStyle = PAL.bwFoam;
    ctx.fillRect(x, top, 1, H - top);
    ctx.fillStyle = PAL.bwMint;
    ctx.fillRect(x, top + 5, 1, 2);
    ctx.fillStyle = PAL.bwLight;
    ctx.fillRect(x, top + 9, 1, 3);

    // Churn, so the body is not a flat block of white.
    for (let i = 0; i < 3; i++) {
      if (hash(x * 3 + i, Math.floor(t * 9) + i * 7) < 0.11) {
        ctx.fillStyle = PAL.bwFoamSh;
        ctx.fillRect(x, top + 12 + Math.floor(hash(x + i, 2) * (H - top - 14)), 2, 2);
      }
    }
  }

  // Spray flicking off the crest.
  ctx.fillStyle = PAL.bwFoam;
  for (let i = 0; i < 34; i++) {
    const d = 6 + hash(i, 11) * 110;
    const seed = i + Math.floor(t * 5) * 34;
    const x = Math.round(edge - d + hash(seed, 1) * 22);
    if (x < 0 || x >= W) continue;
    const y = Math.round(crest(d) - 2 - hash(seed, 2) * 12);
    if (y < 0) continue;
    ctx.fillRect(x, y, 1, 1);
  }
}
