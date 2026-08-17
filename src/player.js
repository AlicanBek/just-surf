import { LANES, laneY, PLAYER_X, TUNE, PAL } from './config.js';
import { SURFER_PIVOT, drawRotated } from './sprites.js';
import { characterSprites } from './characters.js';

/** A filled disc, or just its outline when `outline` is set. */
function glow(ctx, cx, cy, r, alpha, color, outline = false) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)));
    if (outline) {
      ctx.fillRect(Math.round(cx - half), Math.round(cy + y), 1, 1);
      ctx.fillRect(Math.round(cx + half), Math.round(cy + y), 1, 1);
    } else {
      ctx.fillRect(Math.round(cx - half), Math.round(cy + y), half * 2 + 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

export class Player {
  constructor() {
    this.sprites = characterSprites('grom');
    this.mods = {};
    this.parts = [];
    this.reset();
  }

  setCharacter(ch) {
    this.sprites = characterSprites(ch.id);
    this.mods = ch.mods || {};
  }

  get switchTime() { return this.mods.switchTime ?? TUNE.switchTime; }
  get maxLives() { return this.mods.lives ?? TUNE.lives; }
  get boostDrain() { return this.mods.boostDrain ?? TUNE.boostDrain; }
  get barrelNeed() { return this.mods.barrelNeed ?? TUNE.barrelNeed; }
  get shellMul() { return this.mods.shellMul ?? 1; }

  reset() {
    this.lane = 2;
    this.laneF = 2;
    this.state = 'ride';
    this.timer = 0;
    this.airT = 0;
    this.airHeight = 0;
    this.angle = 0;
    this.lives = this.maxLives;
    this.invuln = 0;
    this.boost = 1;
    this.boosting = false;
    this.shield = !!this.mods.freeShield;
    this.barrel = 0;      // shells banked toward the next barrel
    this.barrelT = 0;     // seconds of barrel left
    this.drift = 0;       // knocked-back screen offset after a hit
    this.spawnRate = 0;
    this.parts.length = 0;
  }

  get x() { return PLAYER_X - this.drift; }
  get y() { return laneY(this.laneF) - this.airHeight; }
  get airborne() { return this.state === 'air'; }
  get invincible() { return this.invuln > 0 || this.barrelT > 0 || this.state === 'air'; }

  moveLane(dir) {
    if (this.state === 'stagger' || this.state === 'wipe') return false;
    const next = Math.max(0, Math.min(LANES - 1, this.lane + dir));
    if (next === this.lane) return false;
    this.lane = next;
    return true;
  }

  launch() {
    if (this.state !== 'ride') return false;
    this.state = 'air';
    this.airT = TUNE.rampAir;
    return true;
  }

  stagger() {
    this.state = 'stagger';
    this.timer = 0.34;
    this.invuln = TUNE.hitInvuln;
    this.drift = 12;
  }

  wipeout() {
    this.state = 'wipe';
    this.timer = 0;
    this.boosting = false;
  }

  startBarrel() {
    this.barrelT = TUNE.barrelTime;
    this.barrel = 0;
  }

  update(dt, input, speed01) {
    // Lane changes: one lane per press, on both keyboard and buttons.
    if (input.laneUp) this.moveLane(-1);
    if (input.laneDown) this.moveLane(1);

    const rate = dt / this.switchTime;
    const target = this.lane;
    if (Math.abs(target - this.laneF) < rate) this.laneF = target;
    else this.laneF += Math.sign(target - this.laneF) * rate;

    // Boost.
    const wants = input.boostHeld && this.state !== 'wipe' && this.boost > 0.02;
    this.boosting = wants;
    if (wants) this.boost = Math.max(0, this.boost - this.boostDrain * dt);
    else this.boost = Math.min(1, this.boost + TUNE.boostRefill * dt);

    if (this.invuln > 0) this.invuln -= dt;
    if (this.barrelT > 0) this.barrelT -= dt;
    if (this.drift > 0) this.drift = Math.max(0, this.drift - 26 * dt);

    switch (this.state) {
      case 'air': {
        this.airT -= dt;
        const p = 1 - Math.max(0, this.airT) / TUNE.rampAir;
        this.airHeight = Math.sin(p * Math.PI) * TUNE.rampHeight;
        this.angle = -0.34 * Math.cos(p * Math.PI);
        if (this.airT <= 0) {
          this.state = 'ride';
          this.airHeight = 0;
          this.angle = 0;
          this.splash(10);
        }
        break;
      }
      case 'stagger':
        this.timer -= dt;
        this.angle = -0.28;
        if (this.timer <= 0) { this.state = 'ride'; this.angle = 0; }
        break;
      case 'wipe':
        this.timer += dt;
        this.angle += 7 * dt;
        this.airHeight = Math.max(0, 10 * Math.sin(Math.min(Math.PI, this.timer * 3.2)));
        break;
      default:
        this.angle += (0 - this.angle) * Math.min(1, dt * 10);
    }

    this.emitSpray(dt, speed01);
    this.stepParts(dt);
  }

  emitSpray(dt, speed01) {
    if (this.state === 'air' || this.state === 'wipe') return;
    const rate = (this.boosting ? 44 : 16) * (0.4 + speed01);
    this.spawnRate = (this.spawnRate || 0) + rate * dt;
    while (this.spawnRate >= 1) {
      this.spawnRate -= 1;
      this.parts.push({
        x: this.x - 9, y: this.y + 2 + (Math.random() * 3 - 1),
        vx: -(30 + Math.random() * 70), vy: (Math.random() - 0.5) * 22,
        life: 0.22 + Math.random() * 0.3,
      });
    }
  }

  splash(n) {
    for (let i = 0; i < n; i++) {
      this.parts.push({
        x: this.x, y: this.y + 2,
        vx: -(20 + Math.random() * 90), vy: (Math.random() - 0.5) * 70,
        life: 0.3 + Math.random() * 0.3,
      });
    }
  }

  stepParts(dt) {
    for (const p of this.parts) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.parts = this.parts.filter((p) => p.life > 0);
  }

  draw(ctx, t) {
    ctx.fillStyle = PAL.foam;
    for (const p of this.parts) {
      ctx.globalAlpha = Math.min(1, p.life * 3.5);
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
    ctx.globalAlpha = 1;

    // Shadow on the water while airborne, so the landing lane is obvious.
    if (this.airHeight > 1) {
      const sy = laneY(this.laneF) + 4;
      const wid = Math.max(6, 16 - Math.round(this.airHeight / 4));
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = PAL.ink;
      ctx.fillRect(Math.round(this.x - wid / 2), Math.round(sy), wid, 2);
      ctx.globalAlpha = 1;
    }

    // Blink through the post-hit invulnerability.
    if (this.invuln > 0 && this.state !== 'wipe' && Math.floor(t * 18) % 2 === 0) return;

    let pose = 'ride';
    if (this.state === 'air') pose = 'air';
    else if (this.state === 'wipe' || this.state === 'stagger') pose = 'wipe';
    else if (this.boosting) pose = 'tuck';

    if (this.barrelT > 0) {
      const r = 13 + Math.sin(t * 12) * 1.5;
      glow(ctx, this.x, this.y - 6, r, 0.22, PAL.barrel);
      glow(ctx, this.x, this.y - 6, r, 0.55, PAL.barrel, true);
    }

    drawRotated(ctx, this.sprites[pose], this.x, this.y, this.angle, SURFER_PIVOT);

    if (this.shield) {
      ctx.strokeStyle = PAL.good;
      ctx.globalAlpha = 0.7 + Math.sin(t * 6) * 0.2;
      ctx.strokeRect(Math.round(this.x - 10) + 0.5, Math.round(this.y - 14) + 0.5, 20, 20);
      ctx.globalAlpha = 1;
    }
  }
}
