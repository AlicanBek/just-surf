// Hand-drawn sprites. Each is a list of rows, one character per pixel.
// Rows may be ragged; anything past the end of a row is transparent.
//
//   .  transparent    k  outline        f  foam / white   F  foam shadow
//   s  skin           S  skin shadow    h  hair
//   w  boardshorts    W  shorts stripe   b  board          r  board stripe
//   H  hair highlight  2  light marking (optional region)
//   g  rock light     G  rock dark      o  wood  O  wood dark
//   a  shark          A  shark body (under the surface)
//   M  dolphin back  m  dolphin flank   n  dolphin belly
//   R  deep red       q  mint  Q  mint dark   j  cone  J  cone dark
//   p  shell  P  shell dark             l  pearl  L  pearl dark
//   e  heart  E  heart light            c  water light  C  water mid
//   y  gold          T  palm silhouette
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
  T: '#3f2560',
};

// --- surfer poses -----------------------------------------------------------
// All four poses share the board position so the figure never jumps between
// frames. The board meets the water at SURFER_PIVOT, which is also what the
// sprite rotates about, so the pivot stays on the tail even though the rider
// stands forward of it.
const RIDE = [
  '................N...................',
  '...........11.NNNNN.11..............',
  '..........111NNNNNNN111.............',
  '...........1hhh1hhh11...............',
  '............hhhhhhhh................',
  '...........hhhhhhhhhh...............',
  '...........hhhsssssHh...............',
  '...........h.hsSsssh................',
  '...........33.sss22Z................',
  '...........33.ss2222................',
  '..............222...................',
  '............s222222s................',
  '........ssssBBB22BBBsss.............',
  '..........ssBBBBBBBBss..............',
  '............ssssssss................',
  '............ssssssss................',
  '.............ssssss.................',
  '............wwwwwww.................',
  '........444wwWwwwWww................',
  '......444..wwwwwwwww................',
  '.....44.....ss...ss.................',
  '.....44....ss.....ss................',
  '......44..ss.......ss...............',
  '..........22.......222..............',
  '...bbbbbbbbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

const TUCK = [
  '....................................',
  '....................................',
  '................N...................',
  '...........11.NNNNN.11..............',
  '..........111NNNNNNN111.............',
  '...........1hhh1hhh11...............',
  '............hhhhhhhh................',
  '...........hhhhhhhhhh...............',
  '...........hhhsssssHh...............',
  '...........h.hsSsssh................',
  '...........33.sss22Z................',
  '...........33.ss2222................',
  '..........ssss22222ssss.............',
  '........ssssBBB22BBBss..............',
  '..........ssBBBBBBBBs...............',
  '............ssssssss................',
  '.............ssssss.................',
  '.............wwwwwww................',
  '............wwWwwwWww...............',
  '.........444wWwwwWww................',
  '.......444.sss.....ss...............',
  '......44..ss........ss..............',
  '......44.ss..........ss.............',
  '.......44222.........222............',
  '...bbbbbbbbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

const AIR = [
  '....................................',
  '................N...................',
  '...........11.NNNNN.11..............',
  '..........111NNNNNNN111.............',
  '...........1hhh1hhh11...............',
  '............hhhhhhhh................',
  '...........hhhhhhhhhh...............',
  '...........hhhsssssHh...............',
  '...........h.hsSsssh................',
  '...........33.sss22Z................',
  '...........33.ss2222................',
  '.......s....ss222ss.................',
  '......ssss.sssssssssss..............',
  '.........sssBBB22BBBBss.............',
  '............BBBBBBBBB...............',
  '............ssssssss................',
  '.............ssssss.................',
  '............wwwwwww.................',
  '...........wwWwwwWww................',
  '........444wwwwwwww.................',
  '......444.sss.....sss...............',
  '.....44..ss.........ss..............',
  '.....44..ss.........ss..............',
  '......44422.......222...............',
  '...bbbbbbbbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

const WIPE = [
  '....................................',
  '........s.....11NNNN11.....s........',
  '........ss...111NNNN111...ss........',
  '.........ss...h111hh1.....ss........',
  '..........ss.hhhhhhhh....ss.........',
  '...........shhhhhhhhhh..ss..........',
  '............hhhssssHh..ss...........',
  '............h.hsSsssh.ss............',
  '..............sss22Z................',
  '.............sss2222s...............',
  '.............BBB22BBB...............',
  '.............BBBBBBBB...............',
  '.......444444wwwwwwww...............',
  '.....444....wwWwwwWww...............',
  '.....44.....wwwwwwwww...............',
  '...........sss.....sss..............',
  '..........ss..........ss............',
  '.........ss............ss...........',
  '........ss..............ss..........',
  '........s................s..........',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '...bbbbbbbbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

// Catch: the arm sweeps forward and down, hand entering the water
// ahead of the nose.
const PADDLE_A = [
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '......................11NNN11.......',
  '.....................111NNN111......',
  '....................hhhhh111........',
  '...................hhhhhhhh.........',
  '..................hhhssss22Z........',
  '.............sssssssssssSs..........',
  '...444...sswwwwwwssssssss...........',
  '....444.sssssswwwwwwwsssss..........',
  '.....sssssss.wwwww.........ss.......',
  '......ssss..................ss......',
  '...bbbbbbbbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

// Recovery: the hand is carried forward at shoulder height. It used to
// reach four rows above the head, which read as an arm thrown straight up
// rather than a stroke.
const PADDLE_B = [
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '......................1.NNN.1.......',
  '.....................111NNN111......',
  '....................hhhhh111........',
  '...................hhhhhhhh.........',
  '..................hhhssss22Z........',
  '.............sssssssssssSs.ss.......',
  '...444...sswwwwwwssssssss...........',
  '....444.sssssswwwwwwwsssss..........',
  '.....sssssss.wwwww..................',
  '......ssss..........................',
  '...bbbbbbbbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb...',
];

// Halfway up: deep crouch, hands still near the rail.
const RISE = [
  '....................................',
  '....................................',
  '....................................',
  '................N...................',
  '...........11.NNNNN.11..............',
  '..........111NNNNNNN111.............',
  '...........1hhh1hhh11...............',
  '............hhhhhhhh................',
  '...........hhhhhhhhhh...............',
  '...........hhhsssssHh...............',
  '...........h.hsSsssh................',
  '...........33.sss22Z................',
  '...........33.ss2222................',
  '.......sssssss22222ss...............',
  '.........sssBBB22BBBs...............',
  '............BBBBBBBB................',
  '............ssssss..................',
  '............wwwwwww.................',
  '...........wwWwwwWww................',
  '...........wwwwwwwww................',
  '...........ss.....ss................',
  '..........ss.......ss...............',
  '..........ss.......ss...............',
  '..........22.......222..............',
  '...bbbbbbbbbbbbbbbbbbbbbbbbbbbb.....',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  'bbrrbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb...',
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

// Palms in silhouette for the island. Hand-drawn rather than generated: at ten
// pixels tall, procedural fronds merge into a solid bar instead of reading as
// separate leaves. One leans right, one leans left.
const PALM_A = [
  '..T...T..',
  '.T.TTT.T.',
  'T..TTT..T',
  '...TTT...',
  '....T....',
  '....T....',
  '....T....',
  '...T.....',
  '...T.....',
  '..T......',
];

const PALM_B = [
  '.T..T..T.',
  '..TTTTT..',
  'T.TTTTT.T',
  '...TTT...',
  '....T....',
  '.....T...',
  '.....T...',
  '.....T...',
  '......T..',
  '......T..',
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
  palmA: makeSprite(PALM_A),
  palmB: makeSprite(PALM_B),
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
