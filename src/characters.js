import { SURFER_POSES, makeSprite } from './sprites.js';

// Every character is the same surfer drawing with a different palette, so a new
// one costs a handful of hex codes rather than a new sprite sheet.
export const ROSTER = [
  {
    id: 'grom',
    name: 'THE GROM',
    blurb: 'ALL ELBOWS AND ENTHUSIASM',
    perk: 'FASTEST LANE SWITCH',
    cost: 0,
    colors: { w: '#20407a', W: '#3d6fb8', b: '#f7efd9', r: '#e2543c', h: '#2b1d13' },
    mods: { switchTime: 0.09 },
  },
  {
    id: 'lou',
    name: 'LONGBOARD LOU',
    blurb: 'NEVER RUSHED A SINGLE TURN',
    perk: 'STARTS WITH 4 LIVES',
    cost: 150,
    colors: { w: '#2f6f4f', W: '#4f9c72', b: '#e8c98a', r: '#8a5a34', h: '#6b6b6b' },
    mods: { switchTime: 0.17, lives: 4 },
  },
  {
    id: 'ray',
    name: 'RETRO RAY',
    blurb: 'STILL WAXING A 1978 FIN',
    perk: '+20% SHELLS',
    cost: 400,
    colors: { w: '#7a3f8f', W: '#a967c0', b: '#ffd98a', r: '#ff7a3d', h: '#c8994f' },
    mods: { shellMul: 1.2 },
  },
  {
    id: 'night',
    name: 'NIGHT RIDER',
    blurb: 'SURFS BY MOONLIGHT ONLY',
    perk: 'BOOST LASTS 60% LONGER',
    cost: 900,
    colors: { w: '#1b1f33', W: '#3b4468', b: '#9fb8d0', r: '#5be0ff', h: '#0f0f14' },
    mods: { boostDrain: 0.25 },
  },
  {
    id: 'tube',
    name: 'TUBE PRO',
    blurb: 'NEVER MISSES A SET',
    perk: 'HIGH TIDE FILLS FASTER',
    cost: 1800,
    colors: { w: '#0d5c6e', W: '#17a0b8', b: '#f2fbff', r: '#00d0a4', h: '#2b1d13' },
    mods: { tideNeed: 10 },
  },
  {
    id: 'legend',
    name: 'THE LEGEND',
    blurb: 'NOBODY KNOWS HER REAL NAME',
    perk: 'FREE SHIELD EACH RUN',
    cost: 3000,
    colors: { w: '#5a1030', W: '#a8264f', b: '#ffe9a0', r: '#ffcf4a', h: '#f2e2c0' },
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
