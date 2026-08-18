// Hand-drawn sprites. Each is a list of rows, one character per pixel.
// Rows may be ragged; anything past the end of a row is transparent.
//
//   .  transparent    k  outline        f  foam / white   F  foam shadow
//   s  skin           S  skin shadow    h  hair
//   w  boardshorts    W  shorts stripe   b  board          r  board stripe
//   H  hair highlight
//   g  rock light     G  rock dark      o  wood  O  wood dark
//   a  shark          A  shark body (under the surface)
//   M  dolphin back  m  dolphin flank   n  dolphin belly
//   R  deep red       q  mint  Q  mint dark   j  cone  J  cone dark
//   p  shell  P  shell dark             l  pearl  L  pearl dark
//   e  heart  E  heart light            c  water light  C  water mid
//   y  gold
const BASE_COLORS = {
  k: '#122033',
  s: '#e0a070',
  S: '#b87850',
  h: '#5c3220',
  H: '#8a4f30',
  w: '#20407a',
  W: '#3d6fb8',
  b: '#f7efd9',
  r: '#e2543c',
  f: '#ffffff',
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
  R: '#b3202a',
  q: '#8fe8c0',
  Q: '#5fc49a',
  j: '#f0b96a',
  J: '#c9873f',
  v: '#ff9ec4',
  V: '#ec6fa0',
  u: '#fff4dc',
  D: '#3d1f52',
  F: '#cfeef0',
  x: '#a8e0f5',
  X: '#5fb4de',
  Y: '#2f7fb8',
};

// --- surfer poses -----------------------------------------------------------
// All four poses share the board position so the figure never jumps between
// frames. The board meets the water at SURFER_PIVOT.
const RIDE = [
  '..............................',
  '..............................',
  '..............................',
  '..........h...hh..............',
  '.........hhhhhhhh.............',
  '........hhhhhhhhhh............',
  '........hhhssssHh.............',
  '........h.hsSsssh.............',
  '..........ssssss..............',
  '..........ssssss..............',
  '...........sss................',
  '.........ssssssss.............',
  '.....sssssssssssssss..........',
  '.......sssssssssssss..........',
  '.........ssssssss.............',
  '.........ssssssss.............',
  '..........ssssss..............',
  '.........wwwwwww..............',
  '........wwWwwwWww.............',
  '........wwwwwwwww.............',
  '.........ss...ss..............',
  '........ss.....ss.............',
  '.......ss.......ss............',
  '.......ss.......sss...........',
  '...bbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

const TUCK = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..........h...hh..............',
  '.........hhhhhhhh.............',
  '........hhhhhhhhhh............',
  '........hhhssssHh.............',
  '........h.hsSsssh.............',
  '..........ssssss..............',
  '..........ssssss..............',
  '.......sssssssssssss..........',
  '.........sssssssssss..........',
  '.........ssssssss.............',
  '.........ssssssss.............',
  '..........ssssss..............',
  '..........wwwwwww.............',
  '.........wwWwwwWww............',
  '.........wwwwwwwww............',
  '........sss.....ss............',
  '.......ss........ss...........',
  '......ss..........ss..........',
  '......sss.........sss.........',
  '...bbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

const AIR = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..........h...hh..............',
  '.........hhhhhhhh.............',
  '........hhhhhhhhhh............',
  '........hhhssssHh.............',
  '........h.hsSsssh.............',
  '..........ssssss..............',
  '..........ssssss..............',
  '....s....sssssss..............',
  '...ssss.sssssssssss...........',
  '......ssssssssssssss..........',
  '.........sssssssss............',
  '.........ssssssss.............',
  '..........ssssss..............',
  '.........wwwwwww..............',
  '........wwWwwwWww.............',
  '........wwwwwwwww.............',
  '.......sss.....sss............',
  '......ss.........ss...........',
  '......ss.........ss...........',
  '.......ss.......sss...........',
  '...bbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

const WIPE = [
  '..............................',
  '.....s...................s....',
  '.....ss.................ss....',
  '......ss...h...hh......ss.....',
  '.......ss.hhhhhhhh....ss......',
  '........shhhhhhhhhh..ss.......',
  '.........hhhssssHh..ss........',
  '.........h.hsSsssh.ss.........',
  '...........ssssss.............',
  '..........ssssssss............',
  '..........ssssssss............',
  '..........ssssssss............',
  '..........wwwwwwww............',
  '.........wwWwwwWww............',
  '.........wwwwwwwww............',
  '........sss.....sss...........',
  '.......ss..........ss.........',
  '......ss............ss........',
  '.....ss..............ss.......',
  '.....s................s.......',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '...bbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

// Catch: the arm sweeps forward and down, hand entering the water
// ahead of the nose.
const PADDLE_A = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '....................hh........',
  '..................hhhhhh......',
  '.................hhhssss......',
  '..........sssssssssssSs.......',
  '......sswwwwwwssssssss.s......',
  '...sssssswwwwwwwsssss..ss.....',
  '..sssssss.wwwww.........ss....',
  '...ssss..................ss...',
  '...bbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

// Recovery: the hand is carried forward at shoulder height. It used to
// reach four rows above the head, which read as an arm thrown straight up
// rather than a stroke.
const PADDLE_B = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '....................hh........',
  '..................hhhhhh......',
  '.................hhhssss...ss.',
  '..........sssssssssssSs.ss....',
  '......sswwwwwwssssssss.s......',
  '...sssssswwwwwwwsssss.........',
  '..sssssss.wwwww...............',
  '...ssss.......................',
  '...bbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

// Halfway up: deep crouch, hands still near the rail.
const RISE = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..........h...hh..............',
  '.........hhhhhhhh.............',
  '........hhhhhhhhhh............',
  '........hhhssssHh.............',
  '........h.hsSsssh.............',
  '..........ssssss..............',
  '..........ssssss..............',
  '....ssssssssssssss............',
  '......ssssssssssss............',
  '........ssssssss..............',
  '.........ssssss...............',
  '.........wwwwwww..............',
  '........wwWwwwWww.............',
  '........wwwwwwwww.............',
  '........ss.....ss.............',
  '.......ss.......ss............',
  '.......ss.......ss............',
  '.......ss.......sss...........',
  '...bbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

export const SURFER_POSES = {
  ride: RIDE, tuck: TUCK, air: AIR, wipe: WIPE,
  paddleA: PADDLE_A, paddleB: PADDLE_B, rise: RISE,
};
export const SURFER_PIVOT = { x: 15, y: 25 };

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
// Head on: it surfaces facing you, jaws open. The mouth shuts between gapes.
const SHARK = [
  '.........GGGG.........',
  '........GGggGG........',
  '.......GGgggggG.......',
  '......GGgggggggG......',
  '.....GGgggggggggG.....',
  '....GGggggggggggGG....',
  '...GGgkkggggggkkgGG...',
  '..GGggkkggggggkkggGG..',
  '..GgggggggggggggggGG..',
  '.GGffffffffffffffffGG.',
  '.Gf.RRRRRRRRRRRRRR.fG.',
  '.GfRRfRRfRRfRRfRRfRfG.',
  '.GfRRRRRRRRRRRRRRRRfG.',
  '.GffRRfRRfRRfRRfRRffG.',
  '..GffffffffffffffffG..',
  '...GGGGGGGGGGGGGGGG...',
];

// Same head with the jaws closed, so it can chomp on a timer.
const SHARK_SHUT = [
  '.........GGGG.........',
  '........GGggGG........',
  '.......GGgggggG.......',
  '......GGgggggggG......',
  '.....GGgggggggggG.....',
  '....GGggggggggggGG....',
  '...GGgkkggggggkkgGG...',
  '..GGggkkggggggkkggGG..',
  '..GgggggggggggggggGG..',
  '.GGgggggggggggggggGG..',
  '.Gfffffffffffffffffg..',
  '.GfRRRRRRRRRRRRRRRfG..',
  '.Gffffffffffffffffff..',
  '..Ggggggggggggggggg...',
  '..GggggggggggggggG....',
  '...GGGGGGGGGGGGGG.....',
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

// A kicker: you meet the low left edge and launch off the lip.
// A kicker: you meet the low left edge and launch off the lip. Kept white so
// it does not read as more water.
const RAMP = [
  '................yy',
  '..............yyff',
  '............yyffff',
  '..........yyffffff',
  '........yyffffffff',
  '......yyffffffffff',
  '....yyffffffffffff',
  '..yyffffffffffffff',
  'yyffffffffffffffff',
  'yfffffffffffffffff',
  'FFffffffffffffffFF',
  '.FFFFFFFFFFFFFFFF.',
  '..FF..FFF...FF..FF',
];

// Top of the pickup ladder: worth a dozen shells.
// Strawberry over vanilla on a waffle cone. Top of the pickup ladder.
const ICECREAM = [
  '...DDDD...',
  '..DvvvvD..',
  '.DvvvvvvD.',
  'DVvvvvvvvD',
  'DVVvvvvvVD',
  'DDVVVVVVDD',
  '.DuuuuuuD.',
  'DuffffffuD',
  'DuffffffuD',
  'DuuffffuuD',
  '.DuuuuuuD.',
  '..DjjjjD..',
  '..DjJjJD..',
  '...DjJD...',
  '...DjjD...',
  '....DD....',
];

// --- scenery ----------------------------------------------------------------
// Leaping bottlenose, facing right: raked dorsal, forked flukes, pectoral fin
// below the head, and a slim rostrum. Drawn nose-level; the leap angle comes
// from rotating it to match its velocity.
// Blunt beak, sickle dorsal, forked flukes. Faces right.
// Curled into a leap: head up at the right, body arching back and down to the
// flukes at lower left.
const DOLPHIN = [
  '....................MMM.......',
  '...................MMMMM......',
  '..................MMMMMMMM....',
  '.................MMMMMMMMMMM..',
  '...............MMMMMMMMMMMMMM.',
  '.............MMMMMMMMkMMMMMMMM',
  '...........MMMMMMMmmmmmmMMMMMM',
  '.........MMMMMMmmmmmmmmmmnnnnn',
  '........MMMMMmmmmmmmmmnnnnnn..',
  '.......MMMMmmmmmmmmmnnnnn.....',
  '......MMMMmmmmmmmnnnnn........',
  '.....MMMMmmmmmmnnnnn..........',
  '.....MMMmmmmmnnnnnMM..........',
  '....MMMmmmmmnnnnMMMM..........',
  '....MMMmmmmnnnnMMM............',
  '...MMMmmmmnnnn................',
  '...MMMmmmnnn..................',
  '..MMMmmmnnn...................',
  '..MMMmmnnn....................',
  '.MMMmmnnn.....................',
  '.MMMmmnn......................',
  'MMMMmnn.......................',
  'MMMMMM........................',
  'MM..MMM.......................',
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
  sharkShut: makeSprite(SHARK_SHUT),
  shell: makeSprite(SHELL),
  pearl: makeSprite(PEARL),
  heart: makeSprite(HEART),
  heartDim: makeSprite(HEART, { e: '#1d3550', E: '#2b4a68' }),
  ramp: makeSprite(RAMP),
  icecream: makeSprite(ICECREAM),
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
