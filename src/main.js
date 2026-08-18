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

input.onFirstInput = () => sfx.start();
input.mapPoint = (cx, cy) => {
  const r = canvas.getBoundingClientRect();
  return [((cx - r.left) / r.width) * W, ((cy - r.top) / r.height) * H];
};
input.attach(canvas);

// Fill as much of the viewport as the 16:9 playfield allows. The upscale is
// nearest-neighbour, so pixels stay hard-edged even at fractional scales.
function fit() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const s = Math.min(vw / W, vh / H);
  canvas.style.width = `${Math.round(W * s)}px`;
  canvas.style.height = `${Math.round(H * s)}px`;
}
addEventListener('resize', fit);
addEventListener('orientationchange', () => setTimeout(fit, 120));
fit();

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
