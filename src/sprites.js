// Hand-drawn sprites. Each is a list of rows, one character per pixel.
// Rows may be ragged; anything past the end of a row is transparent.
//
//   .  transparent    k  outline        f  foam / white   F  foam shadow
//   s  skin           S  skin shadow    h  hair
//   w  wetsuit        W  wetsuit light  b  board          r  board stripe
//   g  rock light     G  rock dark      o  wood  O  wood dark
//   a  shark          A  shark body (under the surface)
//   M  dolphin back  m  dolphin flank   n  dolphin belly
//   p  shell  P  shell dark             l  pearl  L  pearl dark
//   e  heart  E  heart light            c  water light  C  water mid
//   y  gold
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
  a: '#5c6f84',
  A: '#374553',
  p: '#ffc2d1',
  P: '#e8718f',
  l: '#eef8ff',
  L: '#a9c9dd',
  e: '#e2543c',
  E: '#ff9a86',
  c: '#8be3f7',
  C: '#2f9bd0',
  y: '#ffcf4a',
  M: '#2e4a63',
  m: '#5c87a3',
  n: '#c3dbe8',
};

// --- surfer poses -----------------------------------------------------------
// All four poses share the board position so the figure never jumps between
// frames. The board meets the water at SURFER_PIVOT.
const RIDE = [
  '..........................',
  '.........hhhh.............',
  '........hhssss............',
  '........hssssss...........',
  '........hsSssss...........',
  '.........sssss............',
  '..........sss.............',
  '........wwwww.............',
  '.....s..wwwwww............',
  '....sww.wwwwwww...........',
  '.....wwwwwwwwwwws.........',
  '......wwwwwwwwwsss........',
  '.......wwwwwww............',
  '.......wwwwww.............',
  '.......wwwwww.............',
  '......www..www............',
  '.....www....www...........',
  '.....ww......www..........',
  '....ww........ww..........',
  '....ss........sss.........',
  '..bbbbbbbbbbbbbbbbbb......',
  '.bbbbbbbbbbbbbbbbbbbbbb...',
  'bbrrbbbbbbbbbbbbbbbbbbbb..',
  '.bbbbbbbbbbbbbbbbbbbb.....',
];

const TUCK = [
  '..........................',
  '..........................',
  '..........................',
  '..........hhhh............',
  '.........hhssss...........',
  '.........hssssss..........',
  '.........hsSssss..........',
  '..........sssss...........',
  '.....s.....sss............',
  '....sw...wwwwww...........',
  '.....ww.wwwwwwww..........',
  '......wwwwwwwwwwws........',
  '.......wwwwwwwwwsss.......',
  '.......wwwwwwwww..........',
  '......www....www..........',
  '.....www......www.........',
  '.....ww........ww.........',
  '.....ww........ww.........',
  '....ww..........w.........',
  '....ss........sss.........',
  '..bbbbbbbbbbbbbbbbbb......',
  '.bbbbbbbbbbbbbbbbbbbbbb...',
  'bbrrbbbbbbbbbbbbbbbbbbbb..',
  '.bbbbbbbbbbbbbbbbbbbb.....',
];

const AIR = [
  '..........................',
  '..........................',
  '.........hhhh.............',
  '........hhssss............',
  '........hssssss...........',
  '........hsSssss...........',
  '.........sssss............',
  '..........sss.............',
  '...s....wwwww.............',
  '..ssww..wwwwww............',
  '....wwwwwwwwwww...........',
  '.....wwwwwwwwwwws.........',
  '......wwwwwwwwwsss........',
  '.......wwwwwwww...........',
  '......www...www...........',
  '.....www.....www..........',
  '.....ww.......www.........',
  '.....ww........ww.........',
  '....ww..........w.........',
  '....ss........sss.........',
  '..bbbbbbbbbbbbbbbbbb......',
  '.bbbbbbbbbbbbbbbbbbbbbb...',
  'bbrrbbbbbbbbbbbbbbbbbbbb..',
  '.bbbbbbbbbbbbbbbbbbbb.....',
];

const WIPE = [
  '..........................',
  '....s...............s.....',
  '....ww.............ww.....',
  '.....ww...hhhh....ww......',
  '......ww.hhssss..ww.......',
  '.......w.hssssss.w........',
  '........whsSssssw.........',
  '.........sssssss..........',
  '.........wwwwww...........',
  '........wwwwwwww..........',
  '........wwwwwwww..........',
  '........www..www..........',
  '.......www....www.........',
  '......www......www........',
  '.....www........www.......',
  '....ww............ww......',
  '...ss..............ss.....',
  '..........................',
  '..........................',
  '..........................',
  '..bbbbbbbbbbbbbbbbbb......',
  '.bbbbbbbbbbbbbbbbbbbbbb...',
  'bbrrbbbbbbbbbbbbbbbbbbbb..',
  '.bbbbbbbbbbbbbbbbbbbb.....',
];

export const SURFER_POSES = { ride: RIDE, tuck: TUCK, air: AIR, wipe: WIPE };
export const SURFER_PIVOT = { x: 12, y: 21 };

// --- obstacles --------------------------------------------------------------
const ROCK = [
  '.......GGGG.......',
  '.....GGggggGG.....',
  '...GGgggggggGG....',
  '..GggggggggggGG...',
  '.GgggggggggggggG..',
  '.GggggggggggggggG.',
  'GGgggggggggggggGG.',
  '.GGgggggggggggGG..',
  '..fGGGGGGGGGGGf...',
  '.fff.fffff.ffff...',
  '..f...ff....f.....',
];

const BUOY = [
  '....rr....',
  '...rrrr...',
  '...r..r...',
  '...rrrr...',
  '....ff....',
  '...ffff...',
  '..rrrrrr..',
  '..rrrrrr..',
  '.rrrrrrrr.',
  '.ffffffff.',
  '.ffffffff.',
  '.rrrrrrrr.',
  '.rrrrrrrr.',
  '..ffffff..',
  '..kkkkkk..',
  '.ffffffff.',
  'ff.ffff.ff',
];

const LOG = [
  '....OOOOOOOOOOOOOOOOOO....',
  '..OOoooooooooooooooooooO..',
  '.OooooooooooooooooooooooO.',
  '.OoooOooooooooOoooooooooO.',
  '.OooooooooooooooooooooooO.',
  '..OOooooooooooooooooooOO..',
  '....OOOOOOOOOOOOOOOOOO....',
  '..ff...fff....ff...fff....',
];

// Fin above the waterline, body showing through the water below it.
const SHARK = [
  '........aa........',
  '.......aaaa.......',
  '......aaaaa.......',
  '.....aaaaaaa......',
  '....aaaaaaaaa.....',
  '.ff.AAAAAAAAA.ff..',
  'fffAAAAAAAAAAAfff.',
  '.fAAAAAAAAAAAAAAf.',
  '..AAAAAAAAAAAAAA..',
  '...AAAAAAAAAAA....',
  '.....AAAAAAA......',
  '.......AAA........',
];

// --- pickups ----------------------------------------------------------------
const SHELL = [
  '...pppp...',
  '..pPppPp..',
  '.pPpPpPpP.',
  'pPpPpPpPpP',
  'pPpPpPpPpP',
  '.pPpPpPpP.',
  '..pPpPpP..',
  '...pPpP...',
  '....pp....',
];

const PEARL = [
  '...lll...',
  '..lllLL..',
  '.llllLLL.',
  'llllLLLLL',
  'lllLLLLLL',
  '.llLLLLL.',
  '..lLLLL..',
  '...LLL...',
];

const HEART = [
  '..ee.ee..',
  '.eEEeEEe.',
  'eEEEEEEEe',
  'eEEEEEEEe',
  '.eEEEEEe.',
  '..eEEEe..',
  '...eEe...',
  '....e....',
];

const RAMP = [
  '........yy........',
  '.......yyyy.......',
  '......yy..yy......',
  '..................',
  '....ffffffffff....',
  '...fcccccccccf....',
  '..fcccccccccccf...',
  '.fcccCCCCCCCcccf..',
  'fccCCCCCCCCCCCccf.',
  '.fcCCCCCCCCCCCcf..',
  '..fCCCCCCCCCCCf...',
  '...ffffffffffff...',
];

// --- scenery ----------------------------------------------------------------
// Leaping bottlenose, facing right: raked dorsal, forked flukes, pectoral fin
// below the head, and a slim rostrum. Drawn nose-level; the leap angle comes
// from rotating it to match its velocity.
const DOLPHIN = [
  '...........MM..................',
  '...........MMM.................',
  '..........MMMMM................',
  'MM........MMMMMM...............',
  '.MM......MMMMMMMM..............',
  '..MM....MMMMMMMMMMMM...........',
  '...MMMMMMMMMMMMMMMMMMMM........',
  '....MMMMMMMMMMMMMMMMMMkMM......',
  '....mmmmmmmmmmmmmmmmmmmmmMMMMMM',
  '....mmmmmmmmmmmmmmmmmmmmmnnnnn.',
  '.....nnnnnnnnnnnnnnnnnnn.......',
  '...MMnnnnnnnnnnnnnnnnnn........',
  '..MM....nnnnnnnnnnnMMMM........',
  '.MM................MMMM........',
  'MM.................MMM.........',
  '..................MMM..........',
];

// A cruising fin for the background, smaller than the obstacle shark.
const FIN = [
  '....aa....',
  '...aaa....',
  '..aaaa....',
  '.aAAaaa...',
  'fffAAAAff.',
  '.f.ffff...',
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
  fin: makeSprite(FIN),
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
