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
      2: '#a9703f',
      s: '#a9703f', S: '#7d4f2a', B: '#a9703f', Z: '#a9703f',
      h: '#3b2415', H: '#5a3a22',
      w: '#3f9c4a', W: '#7fd07a',
      b: '#d9a05b', r: '#2f7f3a',
    },
    mods: { switchTime: 0.09 },
  },
  {
    id: 'mujde',
    name: 'MUJDE',
    blurb: 'LEARNING THE ROPES',
    perk: 'BOOST LASTS LONGER',
    cost: 350,
    colors: {
      s: '#d9a074', S: '#ad7850', 2: '#d9a074', Z: '#d9a074',
      h: '#4a2f1e', H: '#6d4728', 3: '#4a2f1e',
      w: '#fff8ee', W: '#ded2bc', B: '#fff8ee',
      b: '#3f8fd6', r: '#fff8ee',
    },
    mods: { boostDrain: 0.28 },   // 3.6s of boost against the usual 2.5s
  },
  {
    id: 'zeynep',
    name: 'ZEYNEP',
    blurb: 'FIRST OUT EVERY MORNING',
    perk: '+20% SHELLS',
    cost: 1200,
    colors: {
      2: '#f0c49a',
      s: '#f0c49a', S: '#c99a72', Z: '#f0c49a',
      h: '#f0d27a', H: '#fff0b8', 3: '#f0d27a',
      w: '#2f7fd0', W: '#7fc0f0', B: '#2f7fd0',
      b: '#ffc9dd', r: '#2f7fd0',
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
      // A grey cat, not a person: mid fur over the body, darker fur on the
      // crown, ears and tail, cream markings on the muzzle, chin, chest and
      // paws. The muzzle is the 2 region, the chest reuses the bikini region
      // as a bib, and W is fur too so no stripe shows on her hips.
      s: '#8a827b', S: '#5c554f', 2: '#f4efe6',
      h: '#5c554f', H: '#f5d98f', 1: '#5c554f', Z: '#d99aa6', 4: '#7d766f',
      B: '#f4efe6', w: '#8a827b', W: '#8a827b',
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
      2: '#c98a52',
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
