// Internal resolution. Everything is drawn at this size, then scaled up so the
// pixels stay square and chunky. Landscape, phone-friendly.
export const W = 320;
export const H = 180;

// Vertical budget, top to bottom:
//   0..28    clean sky, with the sun, an island and the HUD over it
//   28..64   the barrel: a big wave standing behind the whole playfield
//   64..154  five lanes of rideable water
//   154..180 foreground water, where the thumb buttons sit
export const HORIZON = 28;

export const LANES = 5;
export const LANE_TOP = 64;
export const LANE_H = 18;
export const PLAY_BOTTOM = LANE_TOP + LANES * LANE_H; // 154
export const laneY = (i) => LANE_TOP + i * LANE_H + Math.floor(LANE_H / 2);

// The surfer holds this screen x while the ocean scrolls past.
export const PLAYER_X = 74;

export const PAL = {
  // Sky is a smooth vertical ramp between these three stops. No banding.
  skyTop:   '#2b78bd',
  skyMid:   '#7ec6e8',
  skyLow:   '#d7f1fb',
  sun:      '#fff6cf',
  sunGlow:  '#ffdf8e',
  cloud:    '#ffffff',
  cloudSh:  '#cfe6f5',
  island:   '#2c6b57',
  islandDk: '#1b4839',
  islandLt: '#3f8f6c',
  islandSand: '#e6d7a8',

  // The barrel standing behind the lanes.
  waveLip:   '#ffffff',
  waveEdge:  '#9fe1f5',
  waveGlass: '#6fd8f0',
  // Shadow thrown by the overhanging lip. This is what makes the wave read
  // as pitching over rather than as a flat blue stripe.
  waveShadow: '#072f4d',
  waveFace: ['#5cbde6', '#2f9ad0', '#1c78b4', '#155f96'],
  waveWash:  '#dff4fd',
  tubeIn:    '#06263c',
  tubeMid:   '#0c4165',
  tubeRim:   '#b6ecfb',

  // Lane water, far (top) to near (bottom). Brighter as it comes toward you.
  lane:      ['#0b3a63', '#0f4a7a', '#145d95', '#1a72b0', '#2189cb'],
  laneShade: ['#082e50', '#0b3c66', '#104d7d', '#155f95', '#1a73ad'],
  glintFar:  '#1d5c8a',
  glintNear: '#3d92c4',
  laneEdge:  '#8ddcf7',

  foam:     '#ffffff',
  foamSh:   '#c9edfb',
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
  rampHeight:   28,

  // The whitewater runs at its own pace. Note the ramp is steeper than
  // speedRamp: past about half a minute the foam is quicker than your cruising
  // speed, so late runs live or die on the boost.
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
