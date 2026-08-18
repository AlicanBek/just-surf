import { W, LANES, laneY } from './config.js';
import { SPRITES } from './sprites.js';

// w/h are the hitbox, centred on the lane line. `base` is how far below the
// lane line the sprite's bottom edge sits, so things look like they float.
const KINDS = {
  rock:     { sprite: 'rock',     w: 14, h: 9,  base: 6, solid: true },
  buoy:     { sprite: 'buoy',     w: 8,  h: 9,  base: 6, solid: true },
  log:      { sprite: 'log',      w: 22, h: 8,  base: 5, solid: true },
  shark:    { sprite: 'shark',    w: 16, h: 9,  base: 7, solid: true, drifts: true, chomps: true },
  shell:    { sprite: 'shell',    w: 10, h: 10, base: 5, pickup: 'shell' },
  pearl:    { sprite: 'pearl',    w: 10, h: 10, base: 4, pickup: 'pearl' },
  icecream: { sprite: 'icecream', w: 11, h: 11, base: 6, pickup: 'icecream' },
  heart:    { sprite: 'heart',    w: 10, h: 10, base: 4, pickup: 'heart' },
  ramp:     { sprite: 'ramp',     w: 15, h: 10, base: 6, ramp: true },
};

export const OBSTACLES = ['rock', 'buoy', 'log', 'rock', 'shark'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function distinctLanes(n) {
  const pool = [0, 1, 2, 3, 4];
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

export class Field {
  constructor() {
    this.items = [];
    this.nextX = W + 60;
  }

  reset() {
    this.items.length = 0;
    this.nextX = W + 60;
  }

  spawn(kind, lane, x) {
    const k = KINDS[kind];
    const e = {
      kind, lane, x, laneF: lane, k,
      sprite: SPRITES[k.sprite],
      dead: false, bob: Math.random() * 6.28,
    };
    if (k.drifts) {
      e.dir = Math.random() < 0.5 ? -1 : 1;
      e.timer = 0.4 + Math.random() * 0.6;
    }
    if (k.chomps) {
      e.chomp = 0.6 + Math.random() * 2.2;
      e.gaping = false;
    }
    this.items.push(e);
    return e;
  }

  update(dt, scrollX, elapsed, wantsHeart) {
    for (const e of this.items) {
      e.bob += dt * 3;
      if (e.k.drifts) {
        e.timer -= dt;
        if (e.timer <= 0) {
          e.timer = 0.55 + Math.random() * 0.5;
          if (e.lane + e.dir < 0 || e.lane + e.dir > LANES - 1) e.dir *= -1;
          e.lane += e.dir;
        }
      }
      if (e.k.chomps) {
        e.chomp -= dt;
        if (e.chomp <= 0) {
          e.gaping = !e.gaping;
          e.chomp = e.gaping ? 0.7 + Math.random() * 0.5 : 1.4 + Math.random() * 2.2;
        }
      }
      e.laneF += (e.lane - e.laneF) * Math.min(1, dt * 7);
    }

    // Drop anything that has scrolled off the left edge.
    this.items = this.items.filter((e) => !e.dead && e.x - scrollX > -46);

    while (this.nextX < scrollX + W + 90) {
      this.spawnRow(this.nextX, elapsed, wantsHeart);
      const gap = Math.max(92, 196 - elapsed * 1.15) + Math.random() * 46;
      this.nextX += gap;
    }
  }

  spawnRow(x, elapsed, wantsHeart) {
    const hard = Math.min(1, elapsed / 90);
    const count = Math.min(3, 1 + Math.floor(elapsed / 26));
    const roll = Math.random();

    if (wantsHeart && roll < 0.05) {
      this.spawn('heart', Math.floor(Math.random() * LANES), x);
      return;
    }

    if (roll < 0.2) {
      // A trail of shells that weaves across a couple of lanes.
      let lane = Math.floor(Math.random() * LANES);
      const n = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        this.spawn('shell', lane, x + i * 15);
        if (Math.random() < 0.3) {
          lane = Math.max(0, Math.min(LANES - 1, lane + (Math.random() < 0.5 ? -1 : 1)));
        }
      }
      return;
    }

    if (roll < 0.27) {
      // Ice cream, boxed in on both sides. The best pickup in the game should
      // never be free.
      const lane = 1 + Math.floor(Math.random() * (LANES - 2));
      this.spawn('icecream', lane, x);
      this.spawn(pick(OBSTACLES), lane - 1, x);
      this.spawn(pick(OBSTACLES), lane + 1, x);
      this.spawn(pick(OBSTACLES), lane, x + 74);
      return;
    }

    if (roll < 0.3 + hard * 0.08) {
      // Ramp, then obstacles in the same lane: reward for taking the launch.
      const lane = Math.floor(Math.random() * LANES);
      this.spawn('ramp', lane, x);
      this.spawn(pick(OBSTACLES), lane, x + 62);
      this.spawn(pick(OBSTACLES), lane, x + 92);
      this.spawn('pearl', lane, x + 77);
      return;
    }

    if (roll < 0.4) {
      // Pearl walled in by obstacles either side.
      const lane = 1 + Math.floor(Math.random() * (LANES - 2));
      this.spawn('pearl', lane, x);
      this.spawn(pick(OBSTACLES), lane - 1, x);
      this.spawn(pick(OBSTACLES), lane + 1, x);
      return;
    }

    // Plain blockers. Never more than three lanes, so there is always a way out.
    const lanes = distinctLanes(count);
    for (const lane of lanes) this.spawn(pick(OBSTACLES), lane, x);
    if (Math.random() < 0.5) {
      const free = [0, 1, 2, 3, 4].filter((l) => !lanes.includes(l));
      if (free.length) this.spawn('shell', pick(free), x + 8);
    }
  }

  draw(ctx, scrollX) {
    // Far lanes first, so nearer things overlap them.
    const sorted = [...this.items].sort((a, b) => a.laneF - b.laneF);
    for (const e of sorted) {
      const sx = Math.round(e.x - scrollX);
      if (sx < -30 || sx > W + 30) continue;
      const y = laneY(e.laneF);
      const bob = e.k.pickup ? Math.round(Math.sin(e.bob) * 1.5) : 0;
      const top = Math.round(y + e.k.base - e.sprite.height + bob);
      const art = e.k.chomps && !e.gaping ? SPRITES.sharkShut : e.sprite;
      ctx.drawImage(art, Math.round(sx - art.width / 2), top);
    }
  }
}
