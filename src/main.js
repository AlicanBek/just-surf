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
//
// visualViewport, not innerHeight: on iOS Safari innerHeight reports the height
// with the toolbar hidden, so sizing to it makes the canvas taller than what you
// can actually see and clips the top of the screen.
function fit() {
  const vv = window.visualViewport;
  const vw = vv ? vv.width : window.innerWidth;
  const vh = vv ? vv.height : window.innerHeight;
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

// Fullscreen. iPhone Safari has no Fullscreen API for ordinary elements, so
// there the only route is installing to the Home Screen; everywhere else gets a
// button. Neither is offered once already running without browser chrome.
const installed = window.navigator.standalone === true
  || matchMedia('(display-mode: standalone)').matches
  || matchMedia('(display-mode: fullscreen)').matches;

if (!installed) {
  const chrome = document.getElementById('chrome');
  const btn = document.getElementById('full');
  const el = document.documentElement;
  const request = el.requestFullscreen || el.webkitRequestFullscreen;
  chrome.hidden = false;
  // Out of the way as soon as you start playing.
  canvas.addEventListener('pointerdown', () => { chrome.hidden = true; }, { once: true });
  if (request) {
    btn.hidden = false;
    btn.addEventListener('click', () => {
      const done = request.call(el);
      if (done && done.then) done.then(fit).catch(() => {});
      chrome.hidden = true;
    });
    document.addEventListener('fullscreenchange', () => {
      btn.textContent = document.fullscreenElement ? 'EXIT FULLSCREEN' : 'FULLSCREEN';
      fit();
    });
  } else {
    document.getElementById('ios').hidden = false;
  }
}

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
