import {
  W, H, PAL, TUNE, LANE_TOP, PLAY_BOTTOM, laneY, PLAYER_X,
} from './config.js';
import { drawText } from './font.js';
import { SPRITES, SURFER_PIVOT, drawRotated } from './sprites.js';
import { Scene } from './scene.js';
import { drawOcean } from './ocean.js';
import { drawBigWave } from './bigwave.js';
import { Field } from './entities.js';
import { Player } from './player.js';
import { ROSTER, getCharacter, loadSave, writeSave, characterSprites } from './characters.js';
import { BTN, drawPad, drawHud, panel, button, meter, shellCount } from './ui.js';

// Every button is BTN_H tall and shares one baseline, so the rows line up
// across screens. Only widths differ, because the labels do.
const R = {
  surfers:  { x: 8,   y: 152, w: 116, h: 24 },
  play:     { x: 132, y: 152, w: 116, h: 24 },
  sound:    { x: 272, y: 152, w: 40,  h: 24 },
  prev:     { x: 8,   y: 74,  w: 24,  h: 28 },
  next:     { x: 88,  y: 74,  w: 24,  h: 28 },
  back:     { x: 8,   y: 152, w: 148, h: 24 },
  action:   { x: 164, y: 152, w: 148, h: 24 },
  retry:    { x: 44,  y: 152, w: 112, h: 24 },
  toShop:   { x: 164, y: 152, w: 112, h: 24 },
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
    // Set by main.js when running in a browser tab on a touch device.
    this.showInstallHint = false;
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
      const metres = sp * dt * TUNE.metersPerPx;
      this.dist += metres;
      this.score += metres;
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
        const mult = p.tideT > 0 ? TUNE.tideMul : 1;
        const ey = laneY(e.laneF) - 16;

        if (e.kind === 'heart') {
          if (p.lives < p.maxLives) {
            p.lives += 1;
            this.float('+1 LIFE', sx, ey, PAL.bad);
          } else {
            this.score += 120 * mult;
            this.float(`+${120 * mult}`, sx, ey, PAL.accent);
          }
          this.sfx.trick(4);
          continue;
        }

        // Shells, pearls and ice cream all pay out in shells and score, and
        // all bank toward the next HIGH TIDE. The meter itself is never
        // multiplied, or the mode would keep re-triggering itself.
        const V = {
          shell:    { shells: 1,  score: 12,  tide: 1, note: null },
          pearl:    { shells: 5,  score: 60,  tide: 3, note: 'PEARL' },
          icecream: { shells: 12, score: 150, tide: 6, note: 'ICE CREAM!' },
        }[e.kind];

        this.runShells += V.shells * mult;
        this.score += V.score * mult;
        p.tide += V.tide;

        if (mult > 1) {
          // During HIGH TIDE every single pickup shows its tripled value, so
          // the mode is visibly doing something.
          this.float(`+${V.shells * mult}`, sx, ey, PAL.tide);
        } else if (V.note) {
          this.float(V.note, sx, ey, e.kind === 'icecream' ? PAL.accent : PAL.tide);
        }
        this.sfx.trick(e.kind === 'icecream' ? 5 : Math.min(5, Math.floor(p.tide / 6)));

        if (p.tide >= p.tideNeed && p.tideT <= 0) {
          p.startTide();
          this.float('HIGH TIDE!', W / 2, 62, PAL.tide);
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
    drawOcean(ctx, sx, this.t);
    this.scene.drawDolphin(ctx);
    this.field.draw(ctx, sx);
    // Outside a run the live surfer is stale (very likely still mid-wipeout),
    // and the menu and shop draw their own preview instead.
    if (inRun) {
      this.player.draw(ctx, this.t);
      this.drawDanger(ctx, this.foamX - sx);
      drawBigWave(ctx, this.foamX - sx, this.t);
      if (this.player.tideT > 0) this.drawTide(ctx);
    }
  }

  /** Tint and edge streaks while HIGH TIDE is paying out. */
  drawTide(ctx) {
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = PAL.tide;
    ctx.fillRect(0, LANE_TOP, W, PLAY_BOTTOM - LANE_TOP);
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = PAL.foam;
    for (let x = 0; x < W; x += 3) {
      ctx.fillRect(x, LANE_TOP + 2 + Math.round(Math.sin(x * 0.05 + this.t * 6) * 2), 2, 1);
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

    // Waiting out the back, paddling.
    const paddling = Math.floor(this.t * 3) % 2 ? 'paddleB' : 'paddleA';
    drawRotated(ctx, characterSprites(ch.id)[paddling], 74, laneY(2), 0, SURFER_PIVOT);

    // Only route to real fullscreen on a phone, so the title screen mentions it.
    if (this.showInstallHint) {
      drawText(ctx, 'ADD TO HOME SCREEN FOR FULLSCREEN', W / 2, 143, {
        align: 'center', color: PAL.foamSh, shadow: PAL.ink,
      });
    }

    button(ctx, R.surfers, 'SURFERS');
    button(ctx, R.play, 'PADDLE OUT', { active: true });
    button(ctx, R.sound, this.sfx.muted ? 'OFF' : 'ON', { dim: this.sfx.muted });
  }

  drawShop(ctx) {
    this.drawWorld(ctx);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    const ch = ROSTER[this.browse];
    const owned = this.save.unlocked.includes(ch.id);
    const selected = this.save.selected === ch.id;
    const afford = this.save.shells >= ch.cost;

    drawText(ctx, 'SURFERS', 8, 6, { scale: 2, color: PAL.hud, outline: PAL.ink });
    shellCount(ctx, W - 8, 7, this.save.shells);

    // Preview, at double size so the palette reads.
    panel(ctx, 8, 26, 104, 118, 0.7);
    const art = characterSprites(ch.id).ride;
    const bob = Math.round(Math.sin(this.t * 2.5) * 2);
    ctx.drawImage(
      art, 0, 0, art.width, art.height,
      60 - SURFER_PIVOT.x * 2, 104 + bob - SURFER_PIVOT.y * 2,
      art.width * 2, art.height * 2,
    );
    ctx.fillStyle = PAL.laneEdge;
    ctx.fillRect(22, 104 + bob, 76, 1);
    drawText(ctx, `${this.browse + 1} / ${ROSTER.length}`, 60, 132, {
      align: 'center', color: PAL.foamSh,
    });
    button(ctx, R.prev, '<', { scale: 2 });
    button(ctx, R.next, '>', { scale: 2 });

    panel(ctx, 120, 26, 192, 118);
    drawText(ctx, ch.name, 130, 33, { scale: 2, color: owned ? PAL.accent : PAL.hud });
    drawText(ctx, ch.blurb, 130, 53, { color: PAL.foamSh });

    drawText(ctx, 'PERK', 130, 70, { color: PAL.foamSh });
    drawText(ctx, ch.perk, 130, 82, { color: PAL.good });

    if (owned) {
      drawText(ctx, selected ? 'RIDING NOW' : 'UNLOCKED', 130, 108, {
        scale: 1.5, color: selected ? PAL.tide : PAL.hud,
      });
    } else {
      drawText(ctx, 'COST', 130, 102, { color: PAL.foamSh });
      ctx.drawImage(SPRITES.shell, 160, 100);
      drawText(ctx, String(ch.cost), 173, 102, { color: afford ? PAL.accent : PAL.bad });
      meter(ctx, 130, 116, 172, 5, this.save.shells / ch.cost, afford ? PAL.accent : PAL.bad);
      drawText(ctx, `YOU HAVE ${this.save.shells}`, 302, 124, {
        align: 'right', color: PAL.foamSh,
      });
    }

    const label = owned ? (selected ? 'READY' : 'SELECT')
      : afford ? 'UNLOCK' : 'NOT ENOUGH';
    button(ctx, R.back, 'BACK');
    button(ctx, R.action, label, {
      active: owned ? !selected : afford, dim: !owned && !afford,
    });

    if (this.notice > 0) {
      drawText(ctx, 'GO COLLECT MORE SHELLS!', W / 2, 146, {
        align: 'center', color: PAL.bad, outline: PAL.ink,
      });
    }
  }

  drawOver(ctx) {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    panel(ctx, 40, 14, 240, 132);

    drawText(ctx, this.caught ? 'EATEN ALIVE' : 'WIPEOUT', W / 2, 20, {
      scale: 2, align: 'center', color: PAL.bad, outline: PAL.ink,
    });

    // Twelve pixels under the title, eight above the label: the number needs to
    // sit on its own rather than touching either. It goes gold on a record, to
    // match the label beneath it.
    drawText(ctx, String(Math.floor(this.score)), W / 2, 46, {
      scale: 4, align: 'center',
      color: this.newBest ? PAL.accent : PAL.hud, outline: PAL.ink,
    });
    // One label, swapped out on a record.
    if (this.newBest) {
      const flash = Math.floor(this.t * 6) % 2 === 0;
      drawText(ctx, 'NEW BEST SCORE!', W / 2, 82, {
        align: 'center', color: flash ? PAL.accent : PAL.foam,
      });
    } else {
      drawText(ctx, 'SCORE', W / 2, 82, { align: 'center', color: PAL.foamSh });
    }

    // Two columns: what you did on the left, your standing on the right.
    drawText(ctx, `DISTANCE ${Math.floor(this.dist)}M`, 52, 102, { color: PAL.hud });
    ctx.drawImage(SPRITES.shell, 52, 114);
    drawText(ctx, `+${this.earned} SHELLS`, 65, 116, { color: PAL.accent });

    drawText(ctx, `BEST SCORE ${this.save.best}`, 268, 102, {
      align: 'right', color: this.newBest ? PAL.accent : PAL.foamSh,
    });
    // Your shell bank, iconed to match the row opposite: left column is this
    // run, right column is all time. "TOTAL" read like a total score.
    shellCount(ctx, 268, 116, this.save.shells, 1, PAL.foamSh);

    button(ctx, R.retry, 'AGAIN', { active: true });
    button(ctx, R.toShop, 'SURFERS');
  }
}
