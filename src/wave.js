import { W, PAL, HORIZON, LANE_TOP } from './config.js';
import { hash } from './ocean.js';

// A single enormous wave stands behind the lanes for the whole run: lip along
// the top, glassy face below it, and a barrel that opens up every so often.
// It scrolls slower than the lanes, which is what makes it read as far away.
const PARALLAX = 0.42;
const CREST = HORIZON + 6;
const WASH = 5;          // whitewater where the face meets the flat water
const TUBE_SPAN = 430;   // world px between barrel openings
const TUBE_HW = 62;       // barrel half-width
const TUBE_H = 24;        // how far the barrel mouth hangs below the lip
const LIP = 3;            // thickness of the white lip
const SHADE = 4;          // depth of the shadow under the overhang

/** Height of the wave's lip at a given world x. */
function crestY(wx) {
  return CREST
    + Math.sin(wx / 210) * 8
    + Math.sin(wx / 67 + 1.4) * 2.2;
}

export function drawWave(ctx, scrollX, t) {
  const off = scrollX * PARALLAX;

  for (let x = 0; x < W; x++) {
    const wx = x + off;
    const top = Math.round(crestY(wx));

    // Lip: a hard white edge with a soft rim above it.
    ctx.fillStyle = PAL.waveEdge;
    ctx.fillRect(x, top - 1, 1, 1);
    ctx.fillStyle = PAL.waveLip;
    ctx.fillRect(x, top, 1, LIP);

    // The shadow the pitching lip throws down the face.
    ctx.fillStyle = PAL.waveShadow;
    ctx.fillRect(x, top + LIP, 1, SHADE);

    // Face: dark under the overhang, brightening toward the base where the
    // water thins out.
    const faceTop = top + LIP + SHADE;
    const washTop = LANE_TOP - WASH - (hash(Math.floor(wx / 3), 9) < 0.4 ? 1 : 0);
    const seg = (washTop - faceTop) / 4;
    for (let i = 0; i < 4; i++) {
      const y0 = Math.round(faceTop + i * seg);
      const y1 = Math.round(faceTop + (i + 1) * seg);
      ctx.fillStyle = PAL.waveFace[3 - i];
      ctx.fillRect(x, y0, 1, Math.max(1, y1 - y0));
    }

    ctx.fillStyle = PAL.waveWash;
    ctx.fillRect(x, washTop, 1, LANE_TOP - washTop);
  }

  drawSheets(ctx, off);
  drawTubes(ctx, off);
  drawSpray(ctx, off, t);

  // Churn along the base, where the wave keeps breaking.
  for (let x = 0; x < W; x++) {
    if (hash(x + Math.floor(off), Math.floor(t * 7)) < 0.3) {
      ctx.fillStyle = PAL.foam;
      ctx.fillRect(x, LANE_TOP - WASH - 1 - Math.floor(hash(x, 3) * 2), 1, 2);
    }
  }
}

/** Water sheeting down the face. Sells the height of the thing. */
function drawSheets(ctx, off) {
  const span = 17;
  const first = Math.floor(off / span) - 1;
  for (let n = first; n < first + Math.ceil(W / span) + 2; n++) {
    const wx = n * span + hash(n, 21) * 12;
    const x = Math.round(wx - off);
    if (x < 0 || x >= W) continue;
    const top = Math.round(crestY(wx)) + LIP + SHADE;
    const len = 5 + Math.round(hash(n, 22) * 14);
    ctx.fillStyle = hash(n, 23) < 0.4 ? PAL.waveGlass : PAL.waveEdge;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x, top, 1, Math.min(len, LANE_TOP - WASH - top));
    ctx.globalAlpha = 1;
  }
}

/** The barrel mouths: almond hollows tucked under the lip. */
function drawTubes(ctx, off) {
  const first = Math.floor(off / TUBE_SPAN) - 1;
  for (let n = first; n <= first + 2; n++) {
    const cx = n * TUBE_SPAN + 150;
    if (cx - off < -TUBE_HW - 4 || cx - off > W + TUBE_HW + 4) continue;

    for (let dx = -TUBE_HW; dx <= TUBE_HW; dx++) {
      const x = Math.round(cx + dx - off);
      if (x < 0 || x >= W) continue;
      const tt = dx / TUBE_HW;
      const h = Math.round(TUBE_H * Math.pow(1 - tt * tt, 0.62));
      if (h < 1) continue;
      const top = Math.round(crestY(cx + dx)) + LIP;

      for (let i = 0; i < h; i++) {
        ctx.fillStyle = i < h * 0.5 ? PAL.tubeIn : PAL.tubeMid;
        ctx.fillRect(x, top + i, 1, 1);
      }
      // Bright rim where the barrel spins closed again.
      ctx.fillStyle = PAL.tubeRim;
      ctx.fillRect(x, top + h, 1, 2);
      // Curling foam at the two corners of the mouth.
      if (Math.abs(tt) > 0.78) {
        ctx.fillStyle = PAL.waveLip;
        ctx.fillRect(x, top, 1, 3);
      }
    }
  }
}

/** Spit and spray flicking off the lip into the sky. */
function drawSpray(ctx, off, t) {
  ctx.fillStyle = PAL.waveLip;
  const span = 23;
  const first = Math.floor(off / span) - 1;
  for (let n = first; n < first + Math.ceil(W / span) + 2; n++) {
    if (hash(n, 31) > 0.5) continue;
    const wx = n * span;
    const x = Math.round(wx - off);
    if (x < 0 || x >= W) continue;
    const top = Math.round(crestY(wx));
    const lift = 2 + Math.round((Math.sin(t * 3 + n) * 0.5 + 0.5) * 5);
    for (let i = 1; i <= lift; i++) {
      if (hash(n * 7 + i, Math.floor(t * 6)) < 0.5) continue;
      ctx.fillRect(x + Math.round(hash(n + i, 41) * 3 - 1), top - i, 1, 1);
    }
  }
}
