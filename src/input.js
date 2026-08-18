const KEY_ACTIONS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  Space: 'boost', ShiftLeft: 'boost', ShiftRight: 'boost', KeyK: 'boost',
  Enter: 'confirm', NumpadEnter: 'confirm', KeyR: 'confirm',
  KeyM: 'music', KeyN: 'sfx',
  Escape: 'back',
};

export class Input {
  constructor() {
    this.keys = new Set();
    this.keyHits = new Set();
    this.pointers = new Map();   // pointerId -> { x, y } in internal pixels
    this.taps = [];              // presses that landed this frame
    this.mapPoint = (cx, cy) => [cx, cy];
    this.onFirstInput = null;
  }

  attach(canvas) {
    addEventListener('keydown', (e) => {
      const a = KEY_ACTIONS[e.code];
      if (!a) return;
      e.preventDefault();
      if (!this.keys.has(a)) this.keyHits.add(a);
      this.keys.add(a);
      this._woke();
    }, { passive: false });

    addEventListener('keyup', (e) => {
      const a = KEY_ACTIONS[e.code];
      if (a) this.keys.delete(a);
    });

    addEventListener('blur', () => { this.keys.clear(); this.pointers.clear(); });

    const put = (e) => {
      const [x, y] = this.mapPoint(e.clientX, e.clientY);
      this.pointers.set(e.pointerId, { x, y });
      return { x, y };
    };

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const p = put(e);
      this.taps.push(p);
      this._woke();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (this.pointers.has(e.pointerId)) put(e);
    });
    const drop = (e) => this.pointers.delete(e.pointerId);
    canvas.addEventListener('pointerup', drop);
    canvas.addEventListener('pointercancel', drop);
    canvas.addEventListener('pointerleave', drop);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _woke() {
    if (this.onFirstInput) { this.onFirstInput(); this.onFirstInput = null; }
  }

  held(action) { return this.keys.has(action); }
  hit(action) { return this.keyHits.has(action); }

  /** Is a finger currently resting inside this rect? */
  pointerIn(r) {
    for (const p of this.pointers.values()) {
      if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return true;
    }
    return false;
  }

  /** Did a press land inside this rect during this frame? */
  tapIn(r) {
    return this.taps.some(
      (p) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h,
    );
  }

  get anyTap() { return this.taps.length > 0; }

  endFrame() {
    this.keyHits.clear();
    this.taps.length = 0;
  }
}
