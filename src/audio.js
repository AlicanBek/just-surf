// Tiny WebAudio noisemaker: a water rumble bed plus a handful of one-shots.
// Everything is synthesised, so there are no assets to load.
export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.noise = null;
    this.rumble = null;
  }

  // Browsers only allow audio after a gesture, so this is called on first input.
  start() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();

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
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.rumble) this.rumble.gain.gain.value = 0;
    return this.muted;
  }

  /** speed01: 0..1, how fast the surfer is going. */
  setRumble(speed01) {
    if (!this.ctx || !this.rumble || this.muted) return;
    const g = 0.02 + speed01 * 0.1;
    this.rumble.gain.gain.setTargetAtTime(g, this.ctx.currentTime, 0.15);
    this.rumble.lp.frequency.setTargetAtTime(360 + speed01 * 900, this.ctx.currentTime, 0.2);
  }

  hushRumble() {
    if (!this.ctx || !this.rumble) return;
    this.rumble.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
  }

  _noiseBurst(dur, f0, f1, vol, type = 'lowpass') {
    if (!this.ctx || this.muted) return;
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
    if (!this.ctx || this.muted) return;
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
