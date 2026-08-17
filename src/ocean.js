import { W, H, PAL, LANES, LANE_TOP, LANE_H, PLAY_BOTTOM, HORIZON } from './config.js';

/** Cheap deterministic noise, so churn is stable within a frame. */
export function hash(a, b) {
  const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

// Near lanes scroll a touch faster than far ones. It is a small lie, but it
// makes five flat bands read as water receding out to sea.
const PARALLAX = [0.72, 0.82, 0.92, 1.0, 1.1];

export function drawOcean(ctx, scrollX, t) {
  // Distant chop between the horizon and the first lane.
  ctx.fillStyle = PAL.seaFar;
  ctx.fillRect(0, HORIZON, W, LANE_TOP - HORIZON);
  ctx.fillStyle = PAL.foamSh;
  for (let x = 0; x < W; x++) {
    if (hash(x + Math.floor(scrollX * 0.08), Math.floor(t * 2)) < 0.055) {
      ctx.fillRect(x, HORIZON + 1 + Math.floor(hash(x, 5) * 4), 2, 1);
    }
  }

  for (let i = 0; i < LANES; i++) {
    const top = LANE_TOP + i * LANE_H;
    ctx.fillStyle = PAL.lane[i];
    ctx.fillRect(0, top, W, LANE_H);
    // A darker seam under each lane's near edge gives the bands some depth.
    ctx.fillStyle = PAL.laneShade[i];
    ctx.fillRect(0, top + LANE_H - 3, W, 3);
  }

  // Long thin glints streaming down each lane. These, not the lane colours, are
  // what make the ocean feel like it is moving past you.
  for (let i = 0; i < LANES; i++) {
    const top = LANE_TOP + i * LANE_H;
    const off = scrollX * PARALLAX[i];
    const span = 46;
    const first = Math.floor(off / span) - 1;
    for (let n = first; n < first + Math.ceil(W / span) + 2; n++) {
      const x = Math.round(n * span - off + hash(n, i * 7) * 30);
      if (x > W || x < -26) continue;
      const len = 4 + Math.round(hash(n, i + 3) * 6);
      const y = top + 2 + Math.floor(hash(n, i + 11) * (LANE_H - 6));
      ctx.fillStyle = i >= 3 ? PAL.glintNear : PAL.glintFar;
      ctx.fillRect(Math.max(0, x), y, Math.min(len, W - Math.max(0, x)), 1);
    }
  }

  // Chop flecks.
  for (let i = 0; i < LANES; i++) {
    const top = LANE_TOP + i * LANE_H;
    const off = Math.floor(scrollX * PARALLAX[i]);
    ctx.fillStyle = PAL.foamSh;
    for (let x = 0; x < W; x++) {
      const wx = x + off;
      if (hash(wx, i * 31 + Math.floor(t * 1.5)) < 0.012) {
        ctx.fillRect(x, top + 3 + Math.floor(hash(wx, i) * (LANE_H - 6)), 2, 1);
      }
    }
  }

  // Foam lines along every lane boundary. The clearest signal of where the
  // lanes are, so they get to be loud.
  for (let i = 0; i <= LANES; i++) {
    const y = LANE_TOP + i * LANE_H;
    const par = PARALLAX[Math.min(i, LANES - 1)];
    const edge = i === 0 || i === LANES;
    if (edge) {
      ctx.fillStyle = PAL.ink;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(0, y + 1, W, 1);
      ctx.globalAlpha = 1;
      ctx.fillStyle = PAL.foam;
      ctx.fillRect(0, y, W, 1);
      continue;
    }
    const off = Math.floor(scrollX * par) % 30;
    for (let x = -off; x < W; x += 30) {
      const x0 = Math.max(0, x);
      const len = Math.min(21 - (x0 - x), W - x0);
      if (len <= 0) continue;
      ctx.fillStyle = PAL.ink;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(x0, y + 1, len, 1);
      ctx.globalAlpha = 1;
      ctx.fillStyle = PAL.laneEdge;
      ctx.fillRect(x0, y, len, 1);
    }
  }

  drawShore(ctx, scrollX, t);
}

/** Foreground water below the last lane, where the buttons sit. */
function drawShore(ctx, scrollX, t) {
  ctx.fillStyle = PAL.shore;
  ctx.fillRect(0, PLAY_BOTTOM, W, H - PLAY_BOTTOM);
  ctx.fillStyle = PAL.foam;
  const off = Math.floor(scrollX * 1.25) % 14;
  for (let x = -off; x < W; x += 14) {
    const y = PLAY_BOTTOM + 1 + Math.round(Math.sin((x + scrollX) * 0.09) * 1.4);
    ctx.fillRect(Math.max(0, x), y, 8, 1);
  }
  ctx.fillStyle = PAL.foamSh;
  for (let x = 0; x < W; x++) {
    if (hash(x + Math.floor(scrollX * 1.25), Math.floor(t * 6)) < 0.03) {
      ctx.fillRect(x, PLAY_BOTTOM + 4 + Math.floor(hash(x, 9) * 10), 2, 1);
    }
  }
}

/**
 * The whitewater wall chasing the player. `edge` is its leading screen x;
 * everything to the left of it is churning soup.
 */
export function drawFoamWall(ctx, edge, t) {
  if (edge < -24) return;
  const right = Math.min(Math.floor(edge), W - 1);

  for (let x = right; x >= 0; x--) {
    const depth = right - x;
    // The wall stands up a short way behind its leading edge.
    const rise = 4 + 12 * Math.min(1, depth / 22);
    const wobble = Math.sin(t * 6 + x * 0.4) * 1.5;
    const top = Math.round(LANE_TOP - rise + wobble);
    ctx.fillStyle = PAL.foam;
    ctx.fillRect(x, Math.max(HORIZON, top), 1, H - Math.max(HORIZON, top));

    const churn = Math.floor(t * 10);
    for (let i = 0; i < 4; i++) {
      if (hash(x * 3 + i, churn + i * 7) < 0.14) {
        const y = top + 6 + Math.floor(hash(x + i, churn) * (H - top - 8));
        ctx.fillStyle = PAL.foamSh;
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  // Spray flicking off the front of the wall.
  ctx.fillStyle = PAL.foam;
  for (let i = 0; i < 14; i++) {
    const seed = Math.floor(t * 5) * 14 + i;
    const x = right + Math.floor(hash(seed, 1) * 7) - 2;
    if (x < 0 || x >= W) continue;
    const y = LANE_TOP + Math.floor(hash(seed, 2) * (PLAY_BOTTOM - LANE_TOP)) - 12;
    ctx.fillRect(x, Math.max(HORIZON, y), 1, 1);
  }
}
