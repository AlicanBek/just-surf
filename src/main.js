import { W, H } from './config.js';
import { Input } from './input.js';
import { Sfx } from './audio.js';
import { Game } from './game.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const sfx = new Sfx();
const input = new Input();
const game = new Game(sfx, input);

// Every press, not just the first. A context can be suspended again by the
// browser at any point -- a hidden tab, a call arriving on a phone -- and
// start() is idempotent, so this quietly recovers instead of going silent for
// the rest of the session. Capture phase, so it runs before the game reacts.
for (const ev of ['pointerdown', 'keydown']) {
  addEventListener(ev, () => sfx.start(), { capture: true });
}
input.mapPoint = (cx, cy) => {
  const r = canvas.getBoundingClientRect();
  return [((cx - r.left) / r.width) * W, ((cy - r.top) / r.height) * H];
};
input.attach(canvas);

// Fill as much of the visible viewport as the 16:9 playfield allows. The
// upscale is nearest-neighbour, so pixels stay hard-edged at any scale.
//
// Both the stage and the canvas are driven from visualViewport. Sizing alone is
// not enough: iOS Safari's toolbar overlays the layout viewport instead of
// shrinking it, so a stage pinned to the viewport centres the canvas behind the
// toolbar and clips its top. The stage is moved onto the visible region first,
// and the canvas is centred inside that.
const stage = document.getElementById('stage');

function fit() {
  const vv = window.visualViewport;
  const vw = vv ? vv.width : window.innerWidth;
  const vh = vv ? vv.height : window.innerHeight;
  stage.style.left = `${vv ? vv.offsetLeft : 0}px`;
  stage.style.top = `${vv ? vv.offsetTop : 0}px`;
  stage.style.width = `${vw}px`;
  stage.style.height = `${vh}px`;

  const s = Math.min(vw / W, vh / H);
  canvas.style.width = `${Math.round(W * s)}px`;
  canvas.style.height = `${Math.round(H * s)}px`;
}
addEventListener('resize', fit);
addEventListener('orientationchange', () => setTimeout(fit, 120));
if (window.visualViewport) {
  visualViewport.addEventListener('resize', fit);
  visualViewport.addEventListener('scroll', fit);
}
fit();

// On a phone in a browser tab, roughly a quarter of the height goes to browser
// chrome and there is nothing a page can do about it: iPhone Safari has no
// Fullscreen API for ordinary elements. Installing to the Home Screen launches
// without any chrome, so the title screen says so, in the game's own font,
// rather than floating an HTML button over the art.
game.showInstallHint =
  matchMedia('(pointer: coarse)').matches
  && !(window.navigator.standalone === true
    || matchMedia('(display-mode: standalone)').matches
    || matchMedia('(display-mode: fullscreen)').matches);

// Dev hook: lets you poke at the running game from the console, and step it by
// hand when requestAnimationFrame is throttled (background tabs, headless).
window.surf = {
  game, input, ctx, sfx,
  paused: false,
  pause() { this.paused = true; return 'paused'; },
  resume() { this.paused = false; last = performance.now(); acc = 0; return 'running'; },
  step(frames = 60) {
    for (let i = 0; i < frames; i++) {
      game.update(1 / 60, input);
      input.endFrame();
    }
    game.draw(ctx);
  },
};

const STEP = 1 / 60;
let last = performance.now();
let acc = 0;

function frame(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.25) dt = STEP; // came back from a hidden tab; do not fast-forward
  acc += dt;

  let steps = 0;
  while (!window.surf.paused && acc >= STEP && steps < 5) {
    game.update(STEP, input);
    input.endFrame();
    acc -= STEP;
    steps++;
  }
  if (steps === 5 || window.surf.paused) acc = 0;

  game.draw(ctx);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
