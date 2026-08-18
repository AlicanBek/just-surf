# JUST SURF

A pixel-art endless surfing game for the browser. Five lanes of open ocean, no
brakes, and a wall of whitewater that never gets tired.

Built for phones held sideways, but it plays fine on a desktop keyboard too.
No frameworks, no build step, no dependencies — open `index.html` and go.

## How it plays

You ride one of five lanes while the ocean scrolls past. Dodge what floats in
the way, hoover up shells, and keep ahead of the foam.

- **Shells** are the currency. Spend them on new surfers.
- **Pearls** are worth five shells and are usually guarded.
- **Ice cream** is the best pickup in the game at twelve shells, and is always
  boxed in by obstacles. Nothing that good is free.
- **Hearts** give a life back, and only turn up when you have lost one.
- **Ramps** (the gold chevron) launch you over everything in that lane. You can
  still steer in the air.
- **Boost** buys distance from the whitewater. The key itself is the gauge: it
  fills as the meter recharges and its bolt greys out when there is nothing
  left. Drains fast, refills slowly, so save it for when the foam is breathing
  down your neck.
- **HIGH TIDE** fires automatically once its meter fills. For seven seconds every
  pickup you grab is worth **triple** — an ice cream during HIGH TIDE is 36 shells
  — and nothing can hurt you: obstacles break up on contact instead of costing a
  life, and they cannot make the whitewater surge forward either.
  It is a payout, not a shield: obstacles still hurt.

Three hits ends the run — but so does the whitewater behind you. It runs to its
own clock and ramps faster than your cruising speed, so from about half a minute
in the only thing keeping you ahead is how well you spend the boost. It stays
well back while you ride clean and rears into view once you start taking hits.

## Controls

| | Touch | Keyboard |
|---|---|---|
| Change lane | ▲ / ▼ keys, bottom left | `↑` `↓` or `W` `S` |
| Boost | hold the BOOST key, bottom right | hold `Space` or `Shift` |
| Confirm / retry | on-screen buttons | `Enter` or `R` |
| Mute | sound button on the title screen | `M` |

Both thumbs work at once — you can hold boost and change lanes together.

## Surfers

Each one is a palette swap of the same drawing with a single perk attached.
Progress is saved to `localStorage`.

| Surfer | Cost | Perk |
|---|---|---|
| Jungle Boy | free | Fastest lane switch |
| Mujde | 350 | Longer mercy after a hit |
| Zeynep | 1200 | +20% shells |
| Cindy | 2600 | HIGH TIDE fills faster |
| Zeyna | 5000 | Free shield each run |

## Running it

Because it uses ES modules, it needs to be served over HTTP rather than opened
from the filesystem.

```bash
python3 -m http.server 5178
```

Then visit `http://localhost:5178`. It also works as-is on GitHub Pages —
point Pages at the default branch root.

## How it is put together

Everything is drawn at 320×180 and scaled up with nearest-neighbour, so the
pixels stay square. There are no image files: every sprite is a list of strings
in `src/sprites.js`, and the 5×7 font is a list of strings in `src/font.js`.
Sound is synthesised on the fly with WebAudio.

| File | What lives there |
|---|---|
| `src/config.js` | Resolution, lane geometry, palette, all gameplay tuning |
| `src/game.js` | State machine, collisions, scoring, every screen |
| `src/player.js` | Lane movement, boost, air, hit and wipeout states |
| `src/entities.js` | Obstacle and pickup definitions, and the row spawner |
| `src/bigwave.js` | The whitewater chasing you, and its curling lip |
| `src/ocean.js` | The five lanes and the water |
| `src/scene.js` | Sunset sky, sun and rays, clouds, the island, gulls, the dolphin |
| `src/sprites.js` | Every sprite, as character grids |
| `src/font.js` | The 5×7 bitmap font |
| `src/ui.js` | Thumb buttons, HUD, shared widgets |
| `src/characters.js` | The roster, perks, and the save file |
| `src/input.js` | Keyboard and multi-touch, mapped into game pixels |
| `src/audio.js` | Synthesised sound effects and the water rumble |

Tuning lives in one place: `TUNE` in `src/config.js`. Speed ramp, foam pace,
boost drain, barrel length and lane-switch time are all there.

The screen is carved up vertically: sunset sky down to the horizon, then the five
rideable lanes, then foreground water where the thumb buttons sit. Those bounds
all come from `src/config.js`, so moving them moves everything. The whitewater is
not a band of its own — it rises out of the left edge, and how far onto the
screen it has come is how much trouble you are in.

Runs open with the surfer prone and paddling, then a crouch, then upright: three
frames over 0.9 seconds, invulnerable until they are on their feet.

Every surfer is the same drawing in a different palette: shorts (`w`/`W`), hair
(`h`/`H`), skin (`s`/`S`), board (`b`/`r`). On top of that the poses carry
optional regions — `1` ears, `2` light marking, `N` cap, `3` side hair, `B`
chest band, `Z` nose, `4` tail — which are only drawn if a character gives them
a colour. That is how a cat comes out of the same body as four humans without a
second sprite sheet. Adding a surfer is still a handful of hex codes in
`src/characters.js`. `N` is currently unclaimed: it drew the Tin Woodman's cone
before he was cut, and the pixels are still in the sheet waiting for a hat.

A region that sits on top of skin (`2`, `B`, `Z`) has to be filled in by every
character, with their own skin colour if they do not want the marking, or it
punches a transparent hole in them. A region that sits on empty space (`1`, `N`,
`3`, `4`) is free: only the characters that define it see anything, so Cindy's
ears can be reshaped without touching the other four.

Pick region keys that nothing else in the sheet uses. `E`, `L` and `X` were
already heart-highlight, pearl-dark and wave-blue, so using them meant every
character wore stray pink ears and a blue tail.

The font takes fractional scales — `scale: 1.5` snaps each glyph pixel from its
own edges, so half steps still land on whole pixels.

Every button in the game is one style: `BTN_H` tall, `BTN_SCALE` text, on every
screen. `button()` only shrinks a label if it genuinely will not fit, which
should not happen — widths are set to suit the longest label each one carries.
Rows share a baseline so they line up from screen to screen.

`window.surf` is exposed for poking at a running game from the console.
`surf.step(120)` advances 120 frames by hand and `surf.pause()` / `surf.resume()`
freeze the loop — both handy when the tab is backgrounded and
`requestAnimationFrame` is throttled.
