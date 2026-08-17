// Internal resolution. Everything is drawn at this size, then scaled up so the
// pixels stay square and chunky. Landscape, phone-friendly.
export const W = 320;
export const H = 180;

export const HORIZON = 56;

// Five lanes of open ocean. Lane 0 is furthest out to sea, lane 4 nearest shore.
export const LANES = 5;
export const LANE_TOP = 62;
export const LANE_H = 18;
export const PLAY_BOTTOM = LANE_TOP + LANES * LANE_H; // 152
export const laneY = (i) => LANE_TOP + i * LANE_H + Math.floor(LANE_H / 2);

// The surfer holds this screen x while the ocean scrolls past.
export const PLAYER_X = 74;

export const PAL = {
  skyHi:    '#2f7cc0',
  skyMid:   '#5aa8de',
  skyLo:    '#9ad6f2',
  skyHorz:  '#d5f0fb',
  sun:      '#fff6cf',
  sunGlow:  '#ffdf8e',
  cloud:    '#ffffff',
  cloudSh:  '#c9e4f4',
  island:   '#2c6b57',
  islandDk: '#1c4a3d',
  islandSand: '#e6d7a8',
  seaFar:   '#155a8a',
  // Lane water, far (top) to near (bottom). Brighter as it comes toward you.
  lane:      ['#0b3a63', '#0f4a7a', '#145d95', '#1a72b0', '#2189cb'],
  laneShade: ['#082e50', '#0b3c66', '#104d7d', '#155f95', '#1a73ad'],
  glintFar:  '#1d5c8a',
  glintNear: '#3d92c4',
  laneEdge:  '#8ddcf7',
  foam:     '#ffffff',
  foamSh:   '#bfe6f7',
  shore:    '#0a3557',
  ink:      '#07202f',
  hud:      '#ffffff',
  accent:   '#ffcf4a',
  bad:      '#ff6b57',
  good:     '#7ff0a8',
  barrel:   '#8be8ff',
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
  rampHeight:   26,

  // The whitewater runs at its own pace. It ramps slightly slower than the
  // player's base speed, so a clean run pulls away and every mistake gives
  // ground back. Boosting is how you buy breathing room.
  // Note the ramp is steeper than speedRamp: past about half a minute the foam
  // is quicker than your cruising speed, so late runs live or die on the boost.
  foamStart:    86,
  foamRamp:     2.6,
  foamSpeedMax: 320,
  foamLeash:    132,    // it never trails off further than this
  foamSurge:    34,     // px it lunges forward on every hit
  foamBite:     10,

  barrelNeed:   28,     // shells needed to fill the barrel meter
  barrelTime:   6,
  barrelMul:    3,

  metersPerPx:  0.1,
};
