// Hand-drawn sprites. Each is a list of rows, one character per pixel.
// Rows may be ragged; anything past the end of a row is transparent.
//
//   .  transparent    k  outline        f  foam / white   F  foam shadow
//   s  skin           S  skin shadow    h  hair
//   w  wetsuit        W  wetsuit light  b  board          r  board stripe
//   g  rock light     G  rock dark      o  wood  O  wood dark
//   a  shark          A  shark dark
//   p  shell  P  shell dark             l  pearl  L  pearl dark
//   e  heart  E  heart light            c  water light  C  water mid
const BASE_COLORS = {
  k: '#122033',
  s: '#f6c092',
  S: '#cf8f66',
  h: '#2b1d13',
  w: '#20407a',
  W: '#3d6fb8',
  b: '#f7efd9',
  r: '#e2543c',
  f: '#ffffff',
  F: '#bfe6f7',
  g: '#7d8a97',
  G: '#49545f',
  o: '#8a5a34',
  O: '#5d3a20',
  a: '#61748a',
  A: '#3a4653',
  p: '#ffc2d1',
  P: '#e8718f',
  l: '#eef8ff',
  L: '#a9c9dd',
  e: '#e2543c',
  E: '#ff9a86',
  c: '#8be3f7',
  C: '#2f9bd0',
  y: '#ffcf4a',
};

// --- surfer poses -----------------------------------------------------------
// All four poses share the board position so the figure never jumps between
// frames. The board meets the water at SURFER_PIVOT.
const RIDE = [
  '....................',
  '.......hhh..........',
  '......hssss.........',
  '......hsSss.........',
  '.......sss..........',
  '.......www..........',
  '....s..wwww.........',
  '.....swwwwwws.......',
  '.......wwww.........',
  '.......wwww.........',
  '......ww.ww.........',
  '.....ww...ww........',
  '....ww.....ww.......',
  '....ss.....ss..bb...',
  '..bbbbbbbbbbbbbb....',
  '.bbrrbbbbbbbbbbbbbb.',
  '..bbbbbbbbbbbbbb....',
  '...k................',
];

const TUCK = [
  '....................',
  '....................',
  '....................',
  '........hhh.........',
  '.......hssss........',
  '.......hsSss........',
  '.....s..sss.........',
  '....sw.wwwww........',
  '.....wwwwwwws.......',
  '......wwwwww........',
  '.....ww...www.......',
  '....ww.....ww.......',
  '....ww.....ww.......',
  '....ss.....ss..bb...',
  '..bbbbbbbbbbbbbb....',
  '.bbrrbbbbbbbbbbbbbb.',
  '..bbbbbbbbbbbbbb....',
  '...k................',
];

const AIR = [
  '....................',
  '....................',
  '....................',
  '........hhh.........',
  '.......hssss........',
  '.......hsSss........',
  '........sss.........',
  '...s...wwwww........',
  '....swwwwwww........',
  '......wwwwwws.......',
  '.....wwwwww.........',
  '....ww....ww........',
  '....ww.....w........',
  '....ss.....ss..bb...',
  '..bbbbbbbbbbbbbb....',
  '.bbrrbbbbbbbbbbbbbb.',
  '..bbbbbbbbbbbbbb....',
  '...k................',
];

const WIPE = [
  '....................',
  '....................',
  '...s.........s......',
  '....w.......w.......',
  '.....w.hhh.w........',
  '......whssssw.......',
  '.......hsSss........',
  '.......wwww.........',
  '......wwwwww........',
  '......ww..ww........',
  '.....ww....ww.......',
  '....ww......ww......',
  '...ss........ss.....',
  '....................',
  '..bbbbbbbbbbbbbb....',
  '.bbrrbbbbbbbbbbbbbb.',
  '..bbbbbbbbbbbbbb....',
  '...k................',
];

export const SURFER_POSES = { ride: RIDE, tuck: TUCK, air: AIR, wipe: WIPE };
export const SURFER_PIVOT = { x: 9, y: 15 };

// --- obstacles --------------------------------------------------------------
const ROCK = [
  '.....GGGG.....',
  '...GGggggGG...',
  '..GgggggggGG..',
  '.GgggggggggGG.',
  '.GggggggggggG.',
  'GGggggggggggGG',
  '.GGggggggggGG.',
  '..fGGGGGGGGf..',
  '.fff.ffff.fff.',
];

const BUOY = [
  '...rr...',
  '..rrrr..',
  '..r..r..',
  '..rrrr..',
  '...ff...',
  '..ffff..',
  '.rrrrrr.',
  '.rrrrrr.',
  '.ffffff.',
  '.ffffff.',
  '.rrrrrr.',
  '..rrrr..',
  '..kkkk..',
  '.ffffff.',
  'ff.ff.ff',
];

const LOG = [
  '...OOOOOOOOOOOOOOO..',
  '..OoooooooooooooooO.',
  '.OooooooooooooooooO.',
  '.OooOoooooooOoooooO.',
  '..OoooooooooooooooO.',
  '...OOOOOOOOOOOOOOO..',
  '..ff..fff...ff..ff..',
];

const SHARK = [
  '.....aa.....',
  '....aaa.....',
  '...aaaa.....',
  '...AAaaa....',
  '..AAAaaaa...',
  '..AAAAaaaa..',
  '.ffAAAAAAAf.',
  'fff.ffff.fff',
];

// --- pickups ----------------------------------------------------------------
const SHELL = [
  '..pppp..',
  '.pPppPp.',
  'pPpPpPpP',
  'pPpPpPpP',
  '.pPpPpP.',
  '..pPpP..',
  '...pp...',
];

const PEARL = [
  '..lll..',
  '.lllLL.',
  'llllLLL',
  'lllLLLL',
  '.llLLL.',
  '..lll..',
];

const HEART = [
  '.ee.ee.',
  'eEEeEEe',
  'eEEEEEe',
  '.eEEEe.',
  '..eEe..',
  '...e...',
];

// A curling lip with a gold chevron over it, so "launch here" reads instantly.
const RAMP = [
  '......yy......',
  '.....yyyy.....',
  '....yy..yy....',
  '..............',
  '...ffffffff...',
  '..fccccccccf..',
  '.fcccCCCCcccf.',
  'fccCCCCCCCCccf',
  '.fCCCCCCCCCCf.',
  '..ffffffffff..',
];

// --- scenery ----------------------------------------------------------------
const DOLPHIN = [
  '..................',
  '.......AA.........',
  '.....AAAAAA.......',
  '...AAAAAAAAAAA....',
  '..aaaaaaaaaakaaa..',
  '.aaaaaaaaaaaaaaaa.',
  'aa.aaaaaaaaaaaaa..',
  'aa...aaaaaaa......',
  '......aa..........',
];

const GULL_A = ['.f...f.', '..f.f..', '...f...'];
const GULL_B = ['.......', 'f.....f', '.f...f.', '..fff..'];

export function makeSprite(rows, overrides = null) {
  const colors = overrides ? { ...BASE_COLORS, ...overrides } : BASE_COLORS;
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const c = cv.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = colors[row[x]];
      if (col) {
        c.fillStyle = col;
        c.fillRect(x, y, 1, 1);
      }
    }
  });
  return cv;
}

export const SPRITES = {
  rock: makeSprite(ROCK),
  buoy: makeSprite(BUOY),
  log: makeSprite(LOG),
  shark: makeSprite(SHARK),
  shell: makeSprite(SHELL),
  pearl: makeSprite(PEARL),
  heart: makeSprite(HEART),
  heartDim: makeSprite(HEART, { e: '#1d3550', E: '#2b4a68' }),
  ramp: makeSprite(RAMP),
  dolphin: makeSprite(DOLPHIN),
  gullA: makeSprite(GULL_A),
  gullB: makeSprite(GULL_B),
};

/** Draw a sprite rotated about a pivot, snapped to whole pixels. */
export function drawRotated(ctx, sprite, x, y, angle, pivot, flip = false) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (angle) ctx.rotate(angle);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(sprite, -pivot.x, -pivot.y);
  ctx.restore();
}
