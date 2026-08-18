// Internal resolution. Everything is drawn at this size, then scaled up so the
// pixels stay square and chunky. Landscape, phone-friendly.
export const W = 320;
export const H = 180;

// Vertical budget, top to bottom:
//   0..64    sunset sky: sun, rays, clouds, a volcanic island on the horizon
//   64..154  five lanes of rideable water
//   154..180 foreground water, where the thumb buttons sit
// The big wave is not a band of its own: it rises out of the left edge and
// chases the player up through the sky.
export const HORIZON = 64;

export const LANES = 5;
export const LANE_TOP = 64;
export const LANE_H = 18;
export const PLAY_BOTTOM = LANE_TOP + LANES * LANE_H; // 154
export const laneY = (i) => LANE_TOP + i * LANE_H + Math.floor(LANE_H / 2);

// The surfer holds this screen x while the ocean scrolls past.
export const PLAYER_X = 74;

export const PAL = {
  // Sunset: lavender overhead down through orchid and pink to a pale haze.
  skyTop:   '#8b7fd0',
  skyMid:   '#d885c8',
  skyLow:   '#f79ac4',
  skyHaze:  '#ffc9d8',
  // Near-white, not pink: a pink ray is only ~18 luminance above the pink
  // sky it sits on, so no amount of alpha makes it read near the horizon.
  ray:      '#fff4fa',
  sun:      '#fff2d8',
  sunEdge:  '#ffd9a8',
  cloud:    '#ffdcea',
  cloudSh:  '#e9a6c8',
  // Volcanic island, silhouetted against the sunset.
  island:   '#7a4fa8',
  islandDk: '#5a3580',
  islandLt: '#9a6cc4',
  islandSnow: '#efe4fb',
  // Darker than the cone, so palms read against the slope and the sky alike.
  palm:     '#3f2560',

  // Water stays deep blue with white and mint foam, the way the reference
  // handles blue water under a pink sky.
  lane:      ['#0d3660', '#114679', '#165893', '#1c6dae', '#2283c6'],
  laneShade: ['#0a2a4e', '#0d3a66', '#124b80', '#175d99', '#1c72b0'],
  glintFar:  '#26688f',
  glintNear: '#4fc9a6',
  laneEdge:  '#b8f4dc',
  mint:      '#7fe6bd',

  // The big wave chasing from behind.
  bwDeep:   '#0a2a4e',
  bwMid:    '#12457a',
  // White-dominant on purpose: the blue-green streaks carry the colour, the
  // body stays foam white. A blue tint on the body was tried and read worse.
  bwLight:  '#3f95cf',
  bwMint:   '#7fe6bd',
  bwFoam:   '#ffffff',
  bwFoamSh: '#c9eef0',
  tubeIn:   '#06263c',
  tubeMid:  '#0c4165',
  tubeRim:  '#b6ecfb',

  foam:     '#ffffff',
  foamSh:   '#cfeef0',
  shore:    '#0a3050',
  ink:      '#0b1a2e',
  hud:      '#ffffff',
  accent:   '#ffcf4a',
  bad:      '#ff6b57',
  good:     '#7ff0a8',
  tide:     '#8fe8ff',
};

export const TUNE = {
  startSpeed:   96,
  speedRamp:    2.3,    // px/s of scroll gained per second alive
  maxSpeed:     280,
  boostMul:     1.55,
  boostDrain:   0.40,   // meter per second while held
  boostRefill:  0.115,  // meter per second while off
  switchTime:   0.12,   // seconds to slide between lanes

  lives:        3,
  hitInvuln:    1.4,

  rampAir:      1.05,   // seconds of air off a wave lip
  rampHeight:   28,

  // The big wave runs at its own pace. Note the ramp is steeper than
  // speedRamp: past about half a minute it is quicker than your cruising
  // speed, so late runs live or die on the boost.
  foamStart:    86,
  foamRamp:     2.6,
  foamSpeedMax: 320,
  // Back to the original spacing: it sits well behind you when you are riding
  // clean and only looms into view once you are in trouble.
  foamLeash:    132,
  foamSurge:    34,     // px it lunges forward on every hit
  foamBite:     10,

  // HIGH TIDE: fills as you collect, then triples the value of everything you
  // pick up for a few seconds.
  tideNeed:     20,
  tideTime:     7,
  tideMul:      3,

  metersPerPx:  0.1,
};
