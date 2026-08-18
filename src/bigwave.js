import { W, H, PAL, LANE_TOP } from './config.js';
import { hash } from './ocean.js';

// The whitewater chasing the player. Deliberately simple: a wall of foam with a
// curved crest and a few rounded lumps along the top, so it reads at a glance
// as "a wall of water is about to eat you" and nothing else.
//
// `edge` is the leading screen x. Everything to the left of it is inside it.
const RISE = 46;       // px behind the front where the crest tops out
const CREST_TOP = 30;  // how high the crest reaches
const BAND = 9;        // px from one blue-green streak to the next

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

    // Blue-green streaks all the way down the face instead of one band under
    // the lip. They hang off `top`, so they follow the curve of the crest the
    // way foam lines follow a real wave face, and the phase drifts with x and
    // time so they flow rather than reading as a fixed barcode.
    const phase = Math.sin(x * 0.07 + t * 1.5) * 2 + Math.sin(x * 0.021 - t * 0.8) * 1.5;
    let k = 0;
    for (let y = top + 5 + Math.round(phase); y < H; y += BAND, k++) {
      // Broken into dashes, the way the lane lines are, or continuous rules
      // across the whole wall read as corduroy rather than moving water. The
      // dash index counts from the leading edge, not from screen x, so the
      // dashes travel with the wave instead of crawling across it.
      const seg = Math.floor((d + k * 11) / 6);
      if (hash(seg, k * 7 + 1) < 0.42) continue;
      const yy = Math.max(top, y);
      ctx.fillStyle = PAL.bwMint;
      ctx.fillRect(x, yy, 1, 2);
      // Only every other streak gets the darker blue under it, so the face
      // keeps some plain foam between the lines.
      if (k % 2 === 0) {
        ctx.fillStyle = PAL.bwLight;
        ctx.fillRect(x, yy + 3, 1, 1);
      }
    }

    // Churn, so the body is not a flat block of white.
    for (let i = 0; i < 3; i++) {
      if (hash(x * 3 + i, Math.floor(t * 9) + i * 7) < 0.11) {
        ctx.fillStyle = PAL.bwFoamSh;
        ctx.fillRect(x, top + 12 + Math.floor(hash(x + i, 2) * (H - top - 14)), 2, 2);
      }
    }
  }

  // The wall is ploughing into flat water, so the leading edge is a boiling
  // fringe of foam rather than a clean cut. Only what lands ahead of the edge
  // is worth drawing: bubbles inside the wall would be white on white. The
  // field is indexed by distance ahead of the edge, so it travels with the
  // wave and boils in place instead of sliding across the screen.
  const frontTop = Math.round(crest(0)) - 5;
  const depth = H - frontTop;
  const boil = Math.floor(t * 10);
  for (let y = frontTop; y < H; y++) {
    // Widest low down, where the wall has the most water to push through.
    const reach = 8 + Math.round(((y - frontTop) / depth) * 12);
    for (let i = 0; i < reach; i++) {
      const x = Math.round(edge) + i;
      if (x < 0 || x >= W) continue;
      // Packed against the edge, thinning out ahead of it.
      const p = 0.88 - (i / reach) * 0.82;
      if (hash(i * 13 + y * 7, boil + (y & 3)) > p) continue;
      const big = hash(i + y * 5, boil) < 0.3;
      ctx.fillStyle = hash(i * 3 + y, 5) < 0.3 ? PAL.bwFoamSh : PAL.bwFoam;
      ctx.fillRect(x, y, big ? 2 : 1, big ? 2 : 1);
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
