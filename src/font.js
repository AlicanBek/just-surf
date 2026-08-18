// A hand-drawn 5x7 bitmap font. '#' is a lit pixel, '.' is empty.
const GLYPHS = {
  A: '.###./#...#/#...#/#####/#...#/#...#/#...#',
  B: '####./#...#/#...#/####./#...#/#...#/####.',
  C: '.###./#...#/#..../#..../#..../#...#/.###.',
  D: '####./#...#/#...#/#...#/#...#/#...#/####.',
  E: '#####/#..../#..../####./#..../#..../#####',
  F: '#####/#..../#..../####./#..../#..../#....',
  G: '.###./#...#/#..../#..##/#...#/#...#/.###.',
  H: '#...#/#...#/#...#/#####/#...#/#...#/#...#',
  I: '.###./..#../..#../..#../..#../..#../.###.',
  J: '..###/...#./...#./...#./...#./#..#./.##..',
  K: '#...#/#..#./#.#../##.../#.#../#..#./#...#',
  L: '#..../#..../#..../#..../#..../#..../#####',
  M: '#...#/##.##/#.#.#/#...#/#...#/#...#/#...#',
  N: '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#',
  O: '.###./#...#/#...#/#...#/#...#/#...#/.###.',
  P: '####./#...#/#...#/####./#..../#..../#....',
  Q: '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#',
  R: '####./#...#/#...#/####./#.#../#..#./#...#',
  S: '.####/#..../#..../.###./....#/....#/####.',
  T: '#####/..#../..#../..#../..#../..#../..#..',
  U: '#...#/#...#/#...#/#...#/#...#/#...#/.###.',
  V: '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
  W: '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#',
  X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
  Y: '#...#/#...#/.#.#./..#../..#../..#../..#..',
  Z: '#####/....#/...#./..#../.#.../#..../#####',
  0: '.###./#...#/#..##/#.#.#/##..#/#...#/.###.',
  1: '..#../.##../..#../..#../..#../..#../.###.',
  2: '.###./#...#/....#/...#./..#../.#.../#####',
  3: '####./....#/....#/.###./....#/....#/####.',
  4: '...#./..##./.#.#./#..#./#####/...#./...#.',
  5: '#####/#..../####./....#/....#/#...#/.###.',
  6: '..##./.#.../#..../####./#...#/#...#/.###.',
  7: '#####/....#/...#./..#../.#.../.#.../.#...',
  8: '.###./#...#/#...#/.###./#...#/#...#/.###.',
  9: '.###./#...#/#...#/.####/....#/...#./.##..',
  '.': '...../...../...../...../...../...../..#..',
  ',': '...../...../...../...../...../..#../.#...',
  '!': '..#../..#../..#../..#../..#../...../..#..',
  '?': '.###./#...#/....#/...#./..#../...../..#..',
  ':': '...../..#../...../...../...../..#../.....',
  '-': '...../...../...../#####/...../...../.....',
  "'": '..#../..#../...../...../...../...../.....',
  '/': '....#/....#/...#./..#../.#.../#..../#....',
  '+': '...../..#../..#../#####/..#../..#../.....',
  '%': '#...#/....#/...#./..#../.#.../#..../#...#',
  '*': '...../.#.#./..#../#####/..#../.#.#./.....',
  '<': '...#./..#../.#.../#..../.#.../..#../...#.',
  '>': '.#.../..#../...#./....#/...#./..#../.#...',
};

export const GLYPH_W = 5;
export const GLYPH_H = 7;
const TRACKING = 1;

// char -> array of [x,y] lit pixels, built once.
const CACHE = {};
for (const ch in GLYPHS) {
  const px = [];
  GLYPHS[ch].split('/').forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === '#') px.push([x, y]);
  });
  CACHE[ch] = px;
}

// A bold numeral set, hand-drawn at the size the HUD needs.
//
// The 5x7 font cannot be scaled by 1.5 without wrecking the digits: blit()
// snaps every glyph pixel from its own edges, so at 1.5 the columns come out
// 2,1,2,1 wide and the rows 2,1,2,1 tall. Stems end up different weights within
// one digit, and the eight-way outline offset by 1.5 smears on top. Scaling the
// strokes down to match instead would close the counters in 0, 6, 8 and 9.
// So these are drawn once, at 7x9, with even two-pixel strokes.
const NUMERALS = {
  0: '.#####./##...##/##...##/##...##/##...##/##...##/##...##/##...##/.#####.',
  1: '..###../.####../...##../...##../...##../...##../...##../...##../.#####.',
  2: '.#####./##...##/.....##/.....##/..####./.##..../##...../##...../#######',
  3: '.#####./##...##/.....##/.....##/..####./.....##/.....##/##...##/.#####.',
  4: '....##./...###./..####./.##.##./##..##./#######/....##./....##./....##.',
  5: '#######/##...../##...../##...../######./.....##/.....##/##...##/.#####.',
  6: '..####./.##..../##...../##...../######./##...##/##...##/##...##/.#####.',
  7: '#######/##...##/.....##/....##./...##../...##../..##.../..##.../..##...',
  8: '.#####./##...##/##...##/##...##/.#####./##...##/##...##/##...##/.#####.',
  9: '.#####./##...##/##...##/##...##/.######/.....##/.....##/....##./.####..',
};

export const NUM_W = 7;
export const NUM_H = 9;
const NUM_TRACK = 1;

const NUM_CACHE = {};
for (const ch in NUMERALS) {
  const px = [];
  NUMERALS[ch].split('/').forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === '#') px.push([x, y]);
  });
  NUM_CACHE[ch] = px;
}

export function numberWidth(value) {
  const n = String(value).length;
  return n ? n * (NUM_W + NUM_TRACK) - NUM_TRACK : 0;
}

/**
 * Draw a whole number in the bold numeral set. Drawn at 1:1, so the outline is
 * a single pixel and the strokes stay even.
 */
export function drawNumber(ctx, value, x, y, opts = {}) {
  const { color = '#fff', outline = null, align = 'left' } = opts;
  const s = String(value);
  const w = numberWidth(s);
  let ox = Math.round(align === 'right' ? x - w : align === 'center' ? x - w / 2 : x);
  const oy = Math.round(y);

  const put = (dx, dy, col) => {
    ctx.fillStyle = col;
    let pen = ox + dx;
    for (const ch of s) {
      const px = NUM_CACHE[ch];
      if (px) for (const [gx, gy] of px) ctx.fillRect(pen + gx, oy + dy + gy, 1, 1);
      pen += NUM_W + NUM_TRACK;
    }
  };

  if (outline) {
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1],
                            [-1, -1], [1, -1], [-1, 1], [1, 1]]) put(dx, dy, outline);
  }
  put(0, 0, color);
  return w;
}

export function textWidth(str, scale = 1) {
  if (!str.length) return 0;
  return (str.length * (GLYPH_W + TRACKING) - TRACKING) * scale;
}

/**
 * Draw a string of pixel text. Coordinates are the top-left corner.
 * `shadow` draws the same text one pixel down-right first, for legibility.
 */
export function drawText(ctx, str, x, y, opts = {}) {
  const { scale = 1, color = '#fff', shadow = null, outline = null, align = 'left' } = opts;
  const s = String(str).toUpperCase();
  let ox = Math.round(x);
  if (align === 'center') ox = Math.round(x - textWidth(s, scale) / 2);
  if (align === 'right') ox = Math.round(x - textWidth(s, scale));
  const oy = Math.round(y);

  // An outline keeps big text readable over busy water; a shadow is enough for
  // small labels.
  if (outline) {
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      blit(ctx, s, ox + dx * scale, oy + dy * scale, scale, outline);
    }
  }
  if (shadow) blit(ctx, s, ox + scale, oy + scale, scale, shadow);
  blit(ctx, s, ox, oy, scale, color);
  return textWidth(s, scale);
}

function blit(ctx, s, x, y, scale, color) {
  ctx.fillStyle = color;
  let pen = x;
  for (const ch of s) {
    const px = CACHE[ch];
    // Each glyph pixel is snapped from its own edges rather than drawn at a
    // fixed size, so fractional scales like 1.5 still land on whole pixels.
    if (px) for (const [gx, gy] of px) {
      const x0 = Math.round(pen + gx * scale);
      const y0 = Math.round(y + gy * scale);
      ctx.fillRect(x0, y0,
        Math.round(pen + (gx + 1) * scale) - x0,
        Math.round(y + (gy + 1) * scale) - y0);
    }
    pen += (GLYPH_W + TRACKING) * scale;
  }
}
