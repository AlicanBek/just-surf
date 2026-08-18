import { SURFER_POSES, makeSprite } from './sprites.js';

// One body, five heads. Every character is the same drawing with a different
// palette, plus the optional regions in the poses: 1 ears, N cap, 3 side
// hair, B chest band, Z nose, 4 tail. A region with no colour is simply not
// drawn, so a character only pays for the parts it uses.
export const ROSTER = [
  {
    id: 'jungle',
    name: 'JUNGLE BOY',
    blurb: 'RAISED BY THE REEF',
    perk: 'FASTEST LANE SWITCH',
    cost: 0,
    colors: {
      s: '#a9703f', S: '#7d4f2a', B: '#a9703f', Z: '#a9703f',
      h: '#3b2415', H: '#5a3a22',
      w: '#3f9c4a', W: '#7fd07a',
      b: '#d9a05b', r: '#2f7f3a',
    },
    mods: { switchTime: 0.09 },
  },
  {
    id: 'tin',
    name: 'TIN WOODMAN',
    blurb: 'RUSTS BUT NEVER STOPS',
    perk: 'STARTS WITH 4 LIVES',
    cost: 400,
    colors: {
      s: '#9aa3ab', S: '#6c757d', B: '#9aa3ab', Z: '#9aa3ab',
      // No hair: the head is the same plate as the body, with a cone on top.
      h: '#9aa3ab', H: '#c8d0d8', N: '#7d868e',
      w: '#7d868e', W: '#c8d0d8',
      b: '#c8d0d8', r: '#4a5058',
    },
    mods: { lives: 4, switchTime: 0.17 },
  },
  {
    id: 'zeynep',
    name: 'ZEYNEP',
    blurb: 'FIRST OUT EVERY MORNING',
    perk: '+20% SHELLS',
    cost: 1200,
    colors: {
      s: '#f0c49a', S: '#c99a72', Z: '#f0c49a',
      h: '#f0d27a', H: '#fff0b8', 3: '#f0d27a',
      w: '#2f7fd0', W: '#7fc0f0', B: '#2f7fd0',
      b: '#fff4dc', r: '#2f7fd0',
    },
    mods: { shellMul: 1.2 },
  },
  {
    id: 'cindy',
    name: 'CINDY',
    blurb: 'NINE LIVES, ONE BOARD',
    perk: 'HIGH TIDE FILLS FASTER',
    cost: 2600,
    colors: {
      s: '#4a5560', S: '#333c45', B: '#4a5560',
      // Head is fur like the rest of her, H and W are the white patches, and the
      // shorts region is fur too: a cat does not wear shorts.
      h: '#4a5560', H: '#f2f5f7', 1: '#4a5560', Z: '#ffb3c6', 4: '#4a5560',
      w: '#4a5560', W: '#f2f5f7',
      b: '#e0342a', r: '#fff4dc',
    },
    mods: { tideNeed: 12 },
  },
  {
    id: 'zeyna',
    name: 'ZEYNA',
    blurb: 'ZEYNEP AFTER THE STORM',
    perk: 'FREE SHIELD EACH RUN',
    cost: 5000,
    colors: {
      s: '#c98a52', S: '#a06a3a', Z: '#c98a52',
      h: '#3fd07a', H: '#8fffb8', 3: '#3fd07a',
      w: '#d0ff3f', W: '#ffff8f', B: '#d0ff3f',
      b: '#2fae6a', r: '#d0ff3f',
    },
    mods: { freeShield: true, switchTime: 0.10, shellMul: 1.1 },
  },
];

const SAVE_KEY = 'justsurf.save.v1';
const FIRST = ROSTER[0].id;

const DEFAULT_SAVE = { shells: 0, best: 0, unlocked: [FIRST], selected: FIRST, runs: 0 };

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const s = JSON.parse(raw);
    // The roster changed, so drop ids that no longer exist rather than resetting
    // the save: shells and best score are worth keeping.
    const known = new Set(ROSTER.map((c) => c.id));
    const unlocked = (Array.isArray(s.unlocked) ? s.unlocked : []).filter((id) => known.has(id));
    if (!unlocked.includes(FIRST)) unlocked.unshift(FIRST);
    return {
      shells: s.shells | 0,
      best: s.best | 0,
      runs: s.runs | 0,
      unlocked,
      selected: known.has(s.selected) ? s.selected : FIRST,
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
  const ch = getCharacter(id);
  const set = {};
  for (const pose in SURFER_POSES) set[pose] = makeSprite(SURFER_POSES[pose], ch.colors);
  SPRITE_CACHE[ch.id] = set;
  return set;
}

export function getCharacter(id) {
  return ROSTER.find((c) => c.id === id) || ROSTER[0];
}
