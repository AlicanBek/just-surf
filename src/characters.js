import { SURFER_POSES, makeSprite } from './sprites.js';

// Every character is the same surfer drawing with a different palette, so a new
// one costs a handful of hex codes rather than a new sprite sheet. The keys are
// boardshorts (w/W), hair (h/H), skin (s/S) and board (b/r). Boards are kept
// off blue so they never disappear into the water.
export const ROSTER = [
  {
    id: 'grom',
    name: 'THE GROM',
    blurb: 'ALL ELBOWS AND ENTHUSIASM',
    perk: 'FASTEST LANE SWITCH',
    cost: 0,
    colors: { w: '#2fae7a', W: '#7ff0b8', h: '#5c3220', H: '#8a4f30', b: '#ffd24a', r: '#e2543c' },
    mods: { switchTime: 0.09 },
  },
  {
    id: 'lou',
    name: 'LONGBOARD LOU',
    blurb: 'NEVER RUSHED A SINGLE TURN',
    perk: 'STARTS WITH 4 LIVES',
    cost: 150,
    colors: { w: '#e0b44a', W: '#fff0b0', h: '#b0b0b0', H: '#d8d8d8', s: '#d09060', S: '#a86c46', b: '#e8c98a', r: '#8a5a34' },
    mods: { switchTime: 0.17, lives: 4 },
  },
  {
    id: 'ray',
    name: 'RETRO RAY',
    blurb: 'STILL WAXING A 1978 FIN',
    perk: '+20% SHELLS',
    cost: 400,
    colors: { w: '#e05a2a', W: '#ffcf4a', h: '#c8994f', H: '#e8c07a', b: '#ff8a3d', r: '#ffe08a' },
    mods: { shellMul: 1.2 },
  },
  {
    id: 'night',
    name: 'NIGHT RIDER',
    blurb: 'SURFS BY MOONLIGHT ONLY',
    perk: 'BOOST LASTS 60% LONGER',
    cost: 900,
    colors: { w: '#2a2f4a', W: '#5be0ff', h: '#151520', H: '#33334a', s: '#8a6a52', S: '#6a4e3c', b: '#f2e8d0', r: '#ff6b57' },
    mods: { boostDrain: 0.25 },
  },
  {
    id: 'tube',
    name: 'TUBE PRO',
    blurb: 'NEVER MISSES A SET',
    perk: 'HIGH TIDE FILLS FASTER',
    cost: 1800,
    colors: { w: '#00c0a4', W: '#b8fff0', h: '#2b1d13', H: '#4a3020', b: '#fff4dc', r: '#00d0a4' },
    mods: { tideNeed: 12 },
  },
  {
    id: 'legend',
    name: 'THE LEGEND',
    blurb: 'NOBODY KNOWS HER REAL NAME',
    perk: 'FREE SHIELD EACH RUN',
    cost: 3000,
    colors: { w: '#c0264f', W: '#ffcf4a', h: '#f2e2c0', H: '#ffffff', s: '#c88a5e', S: '#a06844', b: '#ffe9a0', r: '#c0264f' },
    mods: { switchTime: 0.10, freeShield: true, shellMul: 1.1 },
  },
];

const SAVE_KEY = 'justsurf.save.v1';

const DEFAULT_SAVE = { shells: 0, best: 0, unlocked: ['grom'], selected: 'grom', runs: 0 };

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const s = JSON.parse(raw);
    return {
      shells: s.shells | 0,
      best: s.best | 0,
      runs: s.runs | 0,
      unlocked: Array.isArray(s.unlocked) && s.unlocked.length ? s.unlocked : ['grom'],
      selected: s.selected || 'grom',
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Private browsing, or storage is full. Losing progress beats crashing.
  }
}

// Sprite sets are built on demand and kept, so switching characters is instant
// after the first look.
const SPRITE_CACHE = {};

export function characterSprites(id) {
  if (SPRITE_CACHE[id]) return SPRITE_CACHE[id];
  const ch = ROSTER.find((c) => c.id === id) || ROSTER[0];
  const set = {};
  for (const pose in SURFER_POSES) set[pose] = makeSprite(SURFER_POSES[pose], ch.colors);
  SPRITE_CACHE[id] = set;
  return set;
}

export function getCharacter(id) {
  return ROSTER.find((c) => c.id === id) || ROSTER[0];
}
