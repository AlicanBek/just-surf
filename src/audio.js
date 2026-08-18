// Tiny WebAudio noisemaker: a water rumble bed plus a handful of one-shots.
// Everything is synthesised, so there are no assets to load.

// ---- the tropical loop -----------------------------------------------------
// Rendered once into a single buffer and played with loop = true, rather than
// scheduled note by note. That makes the seam sample-accurate, survives a
// throttled timer in a background tab, and costs nothing to keep running.
const MUSIC_VOL = 0.3;
const BPM = 118;
const BARS = 8;
const TAU = Math.PI * 2;

const NOTE = (m) => 440 * Math.pow(2, (m - 69) / 12);

// C - G - Am - F, two bars each: the cheerful one. Held in open voicings with a
// ninth on top, and the bass plays a 3-3-2 tresillo rather than downbeats, which
// is most of what separates an island groove from a waiting room.
// Bass is up at C3/G2/A2/F2 rather than an octave below. The lower octave runs
// 44-65Hz, which a phone speaker simply does not reproduce, and this is a game
// played on a phone.
const PROG = [
  { bass: 48, pad: [60, 64, 67, 74], stab: [64, 67, 72] },
  { bass: 43, pad: [55, 59, 62, 69], stab: [59, 62, 67] },
  { bass: 45, pad: [57, 60, 64, 71], stab: [60, 64, 69] },
  { bass: 41, pad: [53, 57, 60, 67], stab: [57, 60, 65] },
];

// A tune, not an arpeggio: [beat within the loop, midi note, length in beats].
// The off-grid .75 and .25 placements are the lilt.
const MELODY = [
  [0, 76, 0.7], [0.75, 79, 0.7], [1.5, 81, 0.7], [2.25, 79, 0.7], [3, 76, 1],
  [4, 74, 0.7], [5, 76, 0.7], [6, 72, 1.5],
  [8, 74, 0.7], [8.75, 79, 0.7], [9.5, 83, 0.7], [10.25, 81, 0.7], [11, 79, 1],
  [12, 81, 0.7], [13, 79, 0.7], [14, 74, 1.5],
  [16, 72, 0.7], [16.75, 76, 0.7], [17.5, 81, 0.7], [18.25, 79, 0.7], [19, 76, 1],
  [20, 81, 0.7], [21, 84, 0.7], [22, 81, 1.5],
  [24, 77, 0.7], [24.75, 81, 0.7], [25.5, 84, 0.7], [26.25, 81, 0.7], [27, 79, 1],
  [28, 76, 0.7], [29, 74, 0.7], [30, 79, 0.7], [31, 83, 0.9],
];

const TRESILLO = [0, 1.5, 3];        // eighths 0, 3, 6 of the bar
const CONGA = [1.5, 2.5, 3, 3.5];    // answers the bass off the beat

/** Steel pan: bright, metallic on the strike, singing after it. */
function vPan(t, f) {
  const strike = Math.exp(-t * 22);
  return (Math.sin(TAU * f * t)
    + Math.sin(TAU * f * 2 * t) * 0.45
    + Math.sin(TAU * f * 3 * t) * 0.22 * strike
    + Math.sin(TAU * f * 4.6 * t) * 0.16 * strike) * Math.exp(-t * 3.4);
}

/** Marimba: a sine with a short, bright fourth partial on the strike. */
function vMarimba(t, f) {
  return (Math.sin(TAU * f * t)
    + Math.sin(TAU * f * 4 * t) * 0.18 * Math.exp(-t * 14)) * Math.exp(-t * 6.5);
}

/** Pad: three near-unison sines, slow in and out, holding the chord. */
function vPad(t, f, dur) {
  const env = Math.min(1, t / 0.5) * Math.min(1, Math.max(0, (dur - t) / 0.7));
  return (Math.sin(TAU * f * t)
    + Math.sin(TAU * f * 1.006 * t) * 0.6
    + Math.sin(TAU * f * 2 * t) * 0.12) * env;
}

/** Off-beat chord stab, the upstroke that sits between the beats. */
function vStab(t, f) {
  return (Math.sin(TAU * f * t)
    + Math.sin(TAU * f * 2 * t) * 0.3
    + Math.sin(TAU * f * 3 * t) * 0.12) * Math.exp(-t * 15) * Math.min(1, t / 0.004);
}

function vBass(t, f) {
  return (Math.sin(TAU * f * t) + Math.sin(TAU * f * 2 * t) * 0.2)
    * Math.exp(-t * 3.6) * Math.min(1, t / 0.01);
}

/** Conga: a pitched skin with a slap of noise on the hit. */
function vConga(t, f) {
  return (Math.sin(TAU * (f + 90 * Math.exp(-t * 45)) * t)
    + (Math.random() * 2 - 1) * 0.14 * Math.exp(-t * 70)) * Math.exp(-t * 13);
}

/** Shaker: flipping the sign of the noise each sample pushes its energy up
 *  towards Nyquist, so it hisses without needing a filter. */
function vShaker(t, dur, i) {
  return (Math.random() * 2 - 1) * (i & 1 ? 1 : -1) * Math.exp(-t * 46);
}

function vKick(t) {
  return Math.sin(TAU * (58 + 46 * Math.exp(-t * 28)) * t) * Math.exp(-t * 8.5);
}

export class Sfx {
  constructor() {
    this.ctx = null;
    this.sfxOn = true;
    this.musicOn = true;
    this.music = null;
    this.noise = null;
    this.rumble = null;
  }

  // Browsers only allow audio after a gesture, so this is called from a press.
  // Safe to call on every press: after the first it just resumes a context the
  // browser has suspended behind our back.
  start() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this._unlock();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this._unlock();

    const len = Math.floor(this.ctx.sampleRate * 2);
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    src.connect(lp).connect(gain).connect(this.ctx.destination);
    src.start();
    this.rumble = { gain, lp };

    // Rendering nineteen seconds of audio takes a few hundred milliseconds, and
    // start() runs on the first tap. Do it off the critical path so the tap is
    // never the frame that stalls; the loop fades in a moment later.
    setTimeout(() => this._startMusic(), 0);
  }

  /**
   * iOS keeps the output shut until a sound that was started inside a user
   * gesture has played, and it does not count one started from a timer. The
   * music buffer is rendered on a timeout to keep the first press cheap, so
   * without this it stayed silent until the first one-shot of a run opened the
   * output. A single silent sample, started synchronously here, is enough.
   */
  _unlock() {
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
      src.connect(this.ctx.destination);
      src.start(0);
    } catch {
      // Nothing to recover from: this is only ever a hint to the platform.
    }
  }

  _startMusic() {
    if (!this.ctx || this.music) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const gain = this.ctx.createGain();
    gain.gain.value = this.musicOn ? MUSIC_VOL : 0;
    gain.connect(this.ctx.destination);
    const src = this.ctx.createBufferSource();
    src.buffer = this._buildMusic();
    src.loop = true;
    src.connect(gain);
    src.start();
    this.music = { gain, src };
  }

  /** Render the whole loop into one buffer. */
  _buildMusic() {
    const sr = Math.max(8000, Math.round(this.ctx.sampleRate / 2));
    const beat = 60 / BPM;
    const n = Math.round(BARS * 4 * beat * sr);
    const buf = this.ctx.createBuffer(1, n, sr);
    const out = buf.getChannelData(0);

    // Tails wrap past the end of the buffer instead of being cut, so a note
    // ringing over the loop point carries into the next pass and the seam
    // cannot be heard.
    const add = (atBeat, lenBeats, vol, voice) => {
      const s0 = Math.round(atBeat * beat * sr);
      const len = Math.round(lenBeats * beat * sr);
      const dur = lenBeats * beat;
      for (let i = 0; i < len; i++) out[(s0 + i) % n] += voice(i / sr, dur, i) * vol;
    };

    for (let bar = 0; bar < BARS; bar++) {
      const ch = PROG[Math.floor(bar / 2) % PROG.length];
      const b0 = bar * 4;

      for (const m of ch.pad) {
        const f = NOTE(m);
        add(b0, 4, 0.04, (t, d) => vPad(t, f, d));
      }

      // Bass on the tresillo, so it pushes rather than marches.
      const bf = NOTE(ch.bass);
      for (const off of TRESILLO) add(b0 + off, 1.4, 0.32, (t) => vBass(t, bf));

      // Chord stabs on every off-beat.
      for (let e = 1; e < 8; e += 2) {
        for (const m of ch.stab) {
          const f = NOTE(m);
          add(b0 + e * 0.5, 0.5, 0.05, (t) => vStab(t, f));
        }
      }

      // Sixteenth shaker, accented on the beat, for lift.
      for (let x = 0; x < 16; x++) {
        add(b0 + x * 0.25, 0.3, x % 4 === 0 ? 0.055 : 0.03, vShaker);
      }

      for (const off of CONGA) {
        add(b0 + off, 0.7, 0.2, (t) => vConga(t, off === 1.5 ? 210 : 158));
      }

      add(b0, 1, 0.45, vKick);
      add(b0 + 2.5, 1, 0.36, vKick);          // the and-of-three, not the downbeat

      // A marimba counter-line under the pan, doubling the bass note high up.
      add(b0 + 3.5, 0.5, 0.05, (t) => vMarimba(t, NOTE(ch.bass + 24)));
    }

    // The tune, over the top.
    for (const [at, m, len] of MELODY) {
      const f = NOTE(m);
      add(at, Math.max(len, 1.1), 0.13, (t) => vPan(t, f));
    }

    // Normalise, so however the voices happen to stack up it cannot clip.
    let peak = 0;
    for (let i = 0; i < n; i++) if (Math.abs(out[i]) > peak) peak = Math.abs(out[i]);
    if (peak > 0) {
      const k = 0.85 / peak;
      for (let i = 0; i < n; i++) out[i] *= k;
    }
    return buf;
  }

  toggleSfx() {
    this.sfxOn = !this.sfxOn;
    if (!this.sfxOn && this.rumble) this.rumble.gain.gain.value = 0;
    return this.sfxOn;
  }

  toggleMusic() {
    this.musicOn = !this.musicOn;
    if (this.music) {
      this.music.gain.gain.setTargetAtTime(
        this.musicOn ? MUSIC_VOL : 0, this.ctx.currentTime, 0.08);
    }
    return this.musicOn;
  }

  /** speed01: 0..1, how fast the surfer is going. */
  setRumble(speed01) {
    if (!this.ctx || !this.rumble || !this.sfxOn) return;
    const g = 0.02 + speed01 * 0.1;
    this.rumble.gain.gain.setTargetAtTime(g, this.ctx.currentTime, 0.15);
    this.rumble.lp.frequency.setTargetAtTime(360 + speed01 * 900, this.ctx.currentTime, 0.2);
  }

  hushRumble() {
    if (!this.ctx || !this.rumble) return;
    this.rumble.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
  }

  _noiseBurst(dur, f0, f1, vol, type = 'lowpass') {
    if (!this.ctx || !this.sfxOn) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filt = this.ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.setValueAtTime(f0, now);
    filt.frequency.exponentialRampToValueAtTime(Math.max(40, f1), now + dur);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);
    src.connect(filt).connect(gain).connect(this.ctx.destination);
    src.start(now);
    src.stop(now + dur + 0.02);
  }

  _blip(freq, dur, vol = 0.09, type = 'square') {
    if (!this.ctx || !this.sfxOn) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  launch() { this._noiseBurst(0.3, 700, 2400, 0.12, 'bandpass'); }
  bump() {
    this._noiseBurst(0.26, 520, 120, 0.16);
    this._blip(130, 0.13, 0.07, 'sawtooth');
  }
  land()   { this._noiseBurst(0.22, 1600, 200, 0.14); this._blip(180, 0.07, 0.05); }
  wipeout() {
    this._noiseBurst(0.7, 900, 90, 0.2);
    this._blip(90, 0.4, 0.1, 'sawtooth');
  }
  trick(step) {
    const scale = [523, 659, 784, 988, 1175, 1319];
    this._blip(scale[Math.min(step, scale.length - 1)], 0.11, 0.07);
  }
}
