import {
  W, H, PAL, TUNE, LANE_TOP, PLAY_BOTTOM, laneY, PLAYER_X,
} from './config.js';
import { drawText } from './font.js';
import { SPRITES, SURFER_PIVOT, drawRotated } from './sprites.js';
import { Scene } from './scene.js';
import { drawOcean, drawFoamWall } from './ocean.js';
import { drawWave } from './wave.js';
import { Field } from './entities.js';
import { Player } from './player.js';
import { ROSTER, getCharacter, loadSave, writeSave, characterSprites } from './characters.js';
import { BTN, drawPad, drawHud, panel, button, meter } from './ui.js';

const R = {
  play:     { x: 112, y: 154, w: 96, h: 22 },
  surfers:  { x: 8,   y: 156, w: 76, h: 18 },
  sound:    { x: 282, y: 156, w: 30, h: 18 },
  prev:     { x: 8,   y: 76,  w: 24, h: 30 },
  next:     { x: 96,  y: 76,  w: 24, h: 30 },
  action:   { x: 176, y: 154, w: 136, h: 22 },
  back:     { x: 8,   y: 154, w: 68,  h: 22 },
  retry:    { x: 52,  y: 150, w: 96, h: 24 },
  toShop:   { x: 172, y: 150, w: 96, h: 24 },
};

export class Game {
  constructor(sfx, input) {
    this.sfx = sfx;
    this.input = input;
    this.save = loadSave();
    this.scene = new Scene();
    this.field = new Field();
    this.player = new Player();
    this.floaters = [];
    this.t = 0;
    this.menuScroll = 0;
    this.state = 'menu';
    this.browse = Math.max(0, ROSTER.findIndex((c) => c.id === this.save.selected));
    this.notice = 0;
    this.applyCharacter();
    this.resetRun();
  }

  applyCharacter() {
    this.player.setCharacter(getCharacter(this.save.selected));
  }

  resetRun() {
    this.player.reset();
    this.field.reset();
    this.floaters.length = 0;
    this.scrollX = 0;
    this.speed = TUNE.startSpeed;
    this.elapsed = 0;
    this.score = 0;
    this.dist = 0;
    this.runShells = 0;
    this.wipeT = 0;
    this.foamX = PLAYER_X - TUNE.foamLeash;
    this.earned = 0;
    this.newBest = false;
    this.caught = false;
  }

  float(text, x, y, color = PAL.hud) {
    this.floaters.push({ text, x, y, color, life: 0.85 });
  }

  // --- update ---------------------------------------------------------------
  update(dt, input) {
    this.t += dt;
    if (input.hit('mute')) this.sfx.toggleMute();

    for (const f of this.floaters) { f.y -= 22 * dt; f.life -= dt; }
    this.floaters = this.floaters.filter((f) => f.life > 0);

    switch (this.state) {
      case 'menu': this.updateMenu(dt, input); break;
      case 'shop': this.updateShop(dt, input); break;
      case 'play': this.updatePlay(dt, input); break;
      case 'over': this.updateOver(dt, input); break;
    }
  }

  updateMenu(dt, input) {
    this.menuScroll += 46 * dt;
    this.scene.update(dt, this.menuScroll);
    if (input.tapIn(R.play) || input.hit('confirm')) this.startRun();
    else if (input.tapIn(R.surfers)) this.state = 'shop';
    else if (input.tapIn(R.sound)) this.sfx.toggleMute();
  }

  updateShop(dt, input) {
    this.menuScroll += 26 * dt;
    this.scene.update(dt, this.menuScroll);
    if (this.notice > 0) this.notice -= dt;

    const step = (d) => {
      this.browse = (this.browse + d + ROSTER.length) % ROSTER.length;
    };
    if (input.tapIn(R.prev) || input.hit('up')) step(-1);
    if (input.tapIn(R.next) || input.hit('down')) step(1);
    if (input.tapIn(R.back) || input.hit('back')) { this.state = 'menu'; return; }

    if (input.tapIn(R.action) || input.hit('confirm')) {
      const ch = ROSTER[this.browse];
      const owned = this.save.unlocked.includes(ch.id);
      if (owned) {
        this.save.selected = ch.id;
        this.applyCharacter();
        writeSave(this.save);
        this.sfx.trick(3);
        this.state = 'menu';
      } else if (this.save.shells >= ch.cost) {
        this.save.shells -= ch.cost;
        this.save.unlocked.push(ch.id);
        this.save.selected = ch.id;
        this.applyCharacter();
        writeSave(this.save);
        this.sfx.trick(5);
      } else {
        this.notice = 1.4;
        this.sfx.bump();
      }
    }
  }

  startRun() {
    this.resetRun();
    this.state = 'play';
    this.sfx.start();
  }

  updateOver(dt, input) {
    this.scene.update(dt, this.scrollX);
    if (input.tapIn(R.retry) || input.hit('confirm')) this.startRun();
    else if (input.tapIn(R.toShop)) this.state = 'shop';
  }

  updatePlay(dt, input) {
    const p = this.player;
    const fatal = p.state === 'wipe';

    if (fatal) {
      this.wipeT += dt;
      if (this.wipeT > 1.15) { this.endRun(); return; }
    } else {
      this.elapsed += dt;
    }

    // Scroll speed: ramps with time, multiplied by boost, cut while reeling.
    const base = Math.min(TUNE.maxSpeed, TUNE.startSpeed + this.elapsed * TUNE.speedRamp);
    let sp = base;
    if (p.boosting) sp *= TUNE.boostMul;
    if (p.barrelT > 0) sp *= 1.12;
    if (p.state === 'stagger') sp *= 0.55;
    if (fatal) sp *= Math.max(0, 1 - this.wipeT * 1.5);
    this.speed = sp;
    this.scrollX += sp * dt;

    const speed01 = Math.max(0, Math.min(1,
      (sp - TUNE.startSpeed) / (TUNE.maxSpeed * TUNE.boostMul - TUNE.startSpeed)));
    this.sfx.setRumble(speed01);

    p.update(dt, {
      laneUp: !fatal && (input.hit('up') || input.tapIn(BTN.up.hit)),
      laneDown: !fatal && (input.hit('down') || input.tapIn(BTN.down.hit)),
      boostHeld: !fatal && (input.held('boost') || input.pointerIn(BTN.boost.hit)),
    }, speed01);

    const px = this.scrollX + PLAYER_X;
    this.field.update(dt, this.scrollX, this.elapsed, p.lives < p.maxLives);
    this.scene.update(dt, this.scrollX);

    if (!fatal) {
      this.collide(px);
      const mult = p.barrelT > 0 ? TUNE.barrelMul : 1;
      const metres = sp * dt * TUNE.metersPerPx;
      this.dist += metres;
      this.score += metres * mult;
    }

    // The whitewater, running to its own clock.
    const foamSpeed = Math.min(TUNE.foamSpeedMax, TUNE.foamStart + this.elapsed * TUNE.foamRamp);
    this.foamX += foamSpeed * dt;
    this.foamX = Math.max(this.foamX, px - TUNE.foamLeash);
    if (!fatal && px - this.foamX < TUNE.foamBite) {
      p.wipeout();
      this.wipeT = 0;
      this.caught = true;
      this.sfx.wipeout();
    }
  }

  collide(px) {
    const p = this.player;
    const pyLane = laneY(p.laneF);

    for (const e of this.field.items) {
      if (e.dead) continue;
      if (Math.abs(e.x - px) > (e.k.w + 12) / 2) continue;
      if (Math.abs(laneY(e.laneF) - pyLane) > (e.k.h + 9) / 2) continue;

      const sx = Math.round(e.x - this.scrollX);

      if (e.k.pickup) {
        e.dead = true;
        if (e.kind === 'shell') {
          this.runShells += 1;
          p.barrel += 1;
          this.score += 12;
          this.sfx.trick(Math.min(5, Math.floor(p.barrel / 6)));
        } else if (e.kind === 'pearl') {
          this.runShells += 5;
          p.barrel += 3;
          this.score += 60;
          this.float('PEARL', sx, laneY(e.laneF) - 16, PAL.barrel);
          this.sfx.trick(5);
        } else if (e.kind === 'heart') {
          if (p.lives < p.maxLives) {
            p.lives += 1;
            this.float('+1 LIFE', sx, laneY(e.laneF) - 16, PAL.bad);
          } else {
            this.score += 120;
            this.float('+120', sx, laneY(e.laneF) - 16, PAL.accent);
          }
          this.sfx.trick(4);
        }
        if (p.barrel >= p.barrelNeed && p.barrelT <= 0) {
          p.startBarrel();
          this.float('BARREL TIME', W / 2, 60, PAL.barrel);
          this.sfx.launch();
        }
        continue;
      }

      if (e.k.ramp) {
        if (p.launch()) {
          this.score += 40;
          this.float('AIR!', sx, laneY(e.laneF) - 24, PAL.foam);
          this.sfx.launch();
        }
        continue;
      }

      // Solid.
      if (p.state === 'air') continue;
      if (p.barrelT > 0) {
        e.dead = true;
        this.score += 30;
        this.float('SMASH', sx, laneY(e.laneF) - 16, PAL.barrel);
        this.sfx.land();
        continue;
      }
      if (p.invuln > 0) continue;

      e.dead = true;
      if (p.shield) {
        p.shield = false;
        p.invuln = TUNE.hitInvuln;
        this.float('SHIELD!', sx, laneY(e.laneF) - 16, PAL.good);
        this.sfx.land();
        continue;
      }

      p.lives -= 1;
      this.foamX += TUNE.foamSurge;
      p.splash(14);
      if (p.lives <= 0) {
        p.wipeout();
        this.wipeT = 0;
        this.sfx.wipeout();
      } else {
        p.stagger();
        this.float('OUCH', sx, laneY(e.laneF) - 18, PAL.bad);
        this.sfx.bump();
      }
    }
  }

  endRun() {
    const p = this.player;
    this.earned = Math.round(this.runShells * p.shellMul);
    this.save.shells += this.earned;
    this.save.runs += 1;
    const final = Math.floor(this.score);
    this.newBest = final > this.save.best;
    if (this.newBest) this.save.best = final;
    writeSave(this.save);
    this.sfx.hushRumble();
    this.state = 'over';
  }

  // --- draw ----------------------------------------------------------------
  draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    switch (this.state) {
      case 'menu': this.drawMenu(ctx); break;
      case 'shop': this.drawShop(ctx); break;
      case 'play': this.drawWorld(ctx); this.drawPlayUi(ctx); break;
      case 'over': this.drawWorld(ctx); this.drawOver(ctx); break;
    }
  }

  drawWorld(ctx) {
    // The menu and shop scroll their own idle camera, and have no run in
    // progress, so the chasing whitewater has no meaningful position there.
    const inRun = this.state === 'play' || this.state === 'over';
    const sx = inRun ? this.scrollX : this.menuScroll;

    this.scene.drawSky(ctx, sx);
    drawWave(ctx, sx, this.t);
    this.scene.drawSharks(ctx, sx);
    drawOcean(ctx, sx, this.t);
    this.scene.drawDolphin(ctx);
    this.field.draw(ctx, sx);
    // Outside a run the live surfer is stale (very likely still mid-wipeout),
    // and the menu and shop draw their own preview instead.
    if (inRun) {
      this.player.draw(ctx, this.t);
      this.drawDanger(ctx, this.foamX - sx);
      drawFoamWall(ctx, this.foamX - sx, this.t);
      if (this.player.barrelT > 0) this.drawBarrel(ctx);
    }
  }

  drawBarrel(ctx) {
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = PAL.barrel;
    ctx.fillRect(0, LANE_TOP, W, PLAY_BOTTOM - LANE_TOP);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = PAL.foam;
    for (let x = 0; x < W; x += 3) {
      const y = LANE_TOP + 2 + Math.round(Math.sin(x * 0.05 + this.t * 6) * 2);
      ctx.fillRect(x, y, 2, 1);
      ctx.fillRect(x, PLAY_BOTTOM - 3 - Math.round(Math.sin(x * 0.05 - this.t * 6) * 2), 2, 1);
    }
    ctx.globalAlpha = 1;
  }

  /**
   * A red pulse down the left edge that warns while the whitewater is still
   * off screen, then gets out of the way once the wall itself is visible.
   */
  drawDanger(ctx, edge) {
    if (edge < -60 || edge > 6) return;
    const near = Math.min(1, (edge + 60) / 66);
    const pulse = 0.5 + 0.5 * Math.sin(this.t * 11);
    ctx.fillStyle = PAL.bad;
    for (let x = 0; x < 22; x++) {
      ctx.globalAlpha = near * (0.15 + pulse * 0.3) * (1 - x / 22);
      ctx.fillRect(x, LANE_TOP, 1, PLAY_BOTTOM - LANE_TOP);
    }
    ctx.globalAlpha = 1;
  }

  drawPlayUi(ctx) {
    drawPad(ctx, this.input, this.player, this.t);
    drawHud(ctx, this);
  }

  drawMenu(ctx) {
    this.drawWorld(ctx);

    drawText(ctx, 'JUST SURF', W / 2, 8, {
      scale: 3, align: 'center', color: PAL.hud, outline: PAL.ink,
    });
    drawText(ctx, 'FIVE LANES. NO BRAKES.', W / 2, 34, {
      align: 'center', color: PAL.accent, outline: PAL.ink,
    });

    const ch = getCharacter(this.save.selected);
    panel(ctx, 150, 64, 162, 54);
    drawText(ctx, ch.name, 158, 70, { color: PAL.accent });
    drawText(ctx, ch.perk, 158, 82, { color: PAL.hud });
    drawText(ctx, `BEST ${this.save.best}`, 158, 96, { color: PAL.foamSh });
    ctx.drawImage(SPRITES.shell, 158, 104);
    drawText(ctx, String(this.save.shells), 169, 105, { color: PAL.hud });

    drawRotated(ctx, characterSprites(ch.id).ride, 74, laneY(2), 0, SURFER_PIVOT);

    button(ctx, R.play, 'PADDLE OUT', { active: true, scale: 1 });
    button(ctx, R.surfers, 'SURFERS');
    button(ctx, R.sound, this.sfx.muted ? 'OFF' : 'ON', { dim: this.sfx.muted });
  }

  drawShop(ctx) {
    this.drawWorld(ctx);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    const ch = ROSTER[this.browse];
    const owned = this.save.unlocked.includes(ch.id);
    const selected = this.save.selected === ch.id;
    const afford = this.save.shells >= ch.cost;

    drawText(ctx, 'SURFERS', 8, 8, { scale: 2, color: PAL.hud, outline: PAL.ink });
    ctx.drawImage(SPRITES.shell, W - 58, 8);
    drawText(ctx, String(this.save.shells), W - 8, 9, {
      align: 'right', scale: 2, color: PAL.accent, shadow: PAL.ink,
    });

    // Preview, drawn at double size so the palette actually reads.
    panel(ctx, 8, 34, 112, 108, 0.7);
    const art = characterSprites(ch.id).ride;
    const bob = Math.round(Math.sin(this.t * 2.5) * 2);
    ctx.drawImage(
      art, 0, 0, art.width, art.height,
      64 - SURFER_PIVOT.x * 2, 108 + bob - SURFER_PIVOT.y * 2,
      art.width * 2, art.height * 2,
    );
    ctx.fillStyle = PAL.laneEdge;
    ctx.fillRect(26, 108 + bob, 76, 1);
    drawText(ctx, `${this.browse + 1}/${ROSTER.length}`, 64, 128, {
      align: 'center', color: PAL.foamSh,
    });
    button(ctx, R.prev, '<', { scale: 1 });
    button(ctx, R.next, '>', { scale: 1 });

    panel(ctx, 128, 34, 184, 108);
    drawText(ctx, ch.name, 136, 42, { scale: 2, color: owned ? PAL.accent : PAL.hud });
    drawText(ctx, ch.blurb, 136, 62, { color: PAL.foamSh });
    drawText(ctx, 'PERK', 136, 78, { color: PAL.foamSh });
    drawText(ctx, ch.perk, 136, 90, { color: PAL.good });

    if (owned) {
      drawText(ctx, selected ? 'RIDING NOW' : 'UNLOCKED', 136, 112, {
        color: selected ? PAL.barrel : PAL.hud,
      });
    } else {
      drawText(ctx, 'COST', 136, 112, { color: PAL.foamSh });
      drawText(ctx, `${ch.cost} SHELLS`, 172, 112, { color: afford ? PAL.accent : PAL.bad });
      meter(ctx, 136, 126, 168, 4, this.save.shells / ch.cost, afford ? PAL.accent : PAL.bad);
    }

    const label = owned ? (selected ? 'READY' : 'RIDE THIS ONE')
      : afford ? `UNLOCK  ${ch.cost}` : 'NOT ENOUGH SHELLS';
    button(ctx, R.action, label, { active: owned ? !selected : afford, dim: !owned && !afford });
    button(ctx, R.back, 'BACK');

    if (this.notice > 0) {
      drawText(ctx, 'GO COLLECT MORE SHELLS!', W / 2, 146, {
        align: 'center', color: PAL.bad, shadow: PAL.ink,
      });
    }
  }

  drawOver(ctx) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    panel(ctx, 44, 22, 232, 118);
    drawText(ctx, this.caught ? 'EATEN ALIVE' : 'WIPEOUT', W / 2, 30, {
      scale: 3, align: 'center', color: PAL.bad, outline: PAL.ink,
    });

    drawText(ctx, String(Math.floor(this.score)), W / 2, 56, {
      scale: 3, align: 'center', color: PAL.hud, outline: PAL.ink,
    });
    drawText(ctx, 'SCORE', W / 2, 78, { align: 'center', color: PAL.foamSh });

    drawText(ctx, `DISTANCE ${Math.floor(this.dist)}M`, 60, 94, { color: PAL.hud });
    ctx.drawImage(SPRITES.shell, 60, 106);
    drawText(ctx, `+${this.earned}`, 72, 107, { color: PAL.accent });

    if (this.newBest) {
      const flash = Math.floor(this.t * 6) % 2 === 0;
      drawText(ctx, 'NEW BEST!', 260, 94, {
        align: 'right', color: flash ? PAL.accent : PAL.foam,
      });
    } else {
      drawText(ctx, `BEST ${this.save.best}`, 260, 94, { align: 'right', color: PAL.foamSh });
    }
    drawText(ctx, `TOTAL ${this.save.shells}`, 260, 107, { align: 'right', color: PAL.foamSh });

    button(ctx, R.retry, 'AGAIN', { active: true });
    button(ctx, R.toShop, 'SURFERS');
  }
}
