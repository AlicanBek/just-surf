#!/usr/bin/env python3
"""Generate the app icons: Zeyna riding, against the game's own sunset.

Run from the repo root:  python3 tools/make-icons.py

Sprite rows and palettes are read out of src/, so the icon cannot drift from
what the game actually draws. Each size is rendered natively at a whole-number
sprite scale rather than resampled from one big image, so the pixels stay square.
"""
import math
import os
import re
import struct
import sys
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(name):
    with open(os.path.join(ROOT, 'src', name)) as fh:
        return fh.read()


def block(src, pattern):
    m = re.search(pattern, src, re.S)
    if not m:
        sys.exit('could not find %s' % pattern)
    return m.group(1)


def hexes(text):
    # \w+ so this reads both the multi-word PAL keys and the single-character
    # sprite palette keys.
    return dict(re.findall(r"(\w+):\s*'(#[0-9a-fA-F]{6})'", text))


def rgb(h):
    return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16))


def mix(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


SPRITES = read('sprites.js')
CHARS = read('characters.js')
CONFIG = read('config.js')

RIDE = re.findall(r"'([^']*)'", block(SPRITES, r'const RIDE = \[(.*?)\n\];'))
BASE = hexes(block(SPRITES, r'const BASE_COLORS = \{(.*?)\n\};'))
ZEYNA = hexes(block(CHARS, r"id: 'zeyna',[^}]*?colors: \{(.*?)\n    \},"))
PAL = hexes(block(CONFIG, r'export const PAL = \{(.*?)\n\};'))
LANES = re.findall(r"'(#[0-9a-fA-F]{6})'", block(CONFIG, r'lane:\s*\[(.*?)\]'))

PALETTE = dict(BASE)
PALETTE.update(ZEYNA)

PIVOT_Y = int(re.search(r'SURFER_PIVOT = \{ x: \d+, y: (\d+)', SPRITES).group(1))


def png(path, pix, w, h):
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            raw.extend(pix[y * w + x])

    def chunk(tag, data):
        body = tag + data
        return (struct.pack('>I', len(data)) + body
                + struct.pack('>I', zlib.crc32(body) & 0xffffffff))

    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    with open(path, 'wb') as fh:
        fh.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr)
                 + chunk(b'IDAT', zlib.compress(bytes(raw), 9))
                 + chunk(b'IEND', b''))


def icon(size, scale, path):
    pix = [(0, 0, 0)] * (size * size)

    def put(x, y, colour):
        if 0 <= x < size and 0 <= y < size:
            pix[y * size + x] = colour

    water_y = round(size * 0.66)

    # Sky, the same four-stop sunset the game paints.
    top, mid, low, haze = (rgb(PAL[k]) for k in ('skyTop', 'skyMid', 'skyLow', 'skyHaze'))
    for y in range(water_y):
        t = y / max(1, water_y - 1)
        if t < 0.42:
            c = mix(top, mid, t / 0.42)
        elif t < 0.78:
            c = mix(mid, low, (t - 0.42) / 0.36)
        else:
            c = mix(low, haze, (t - 0.78) / 0.22)
        for x in range(size):
            put(x, y, c)

    # Sun, sitting on the horizon and cut off by it. Pushed off centre, the way
    # the game places it: dead centre put a cream disc directly behind her and
    # her skin and board vanished into it.
    sun, edge = rgb(PAL['sun']), rgb(PAL['sunEdge'])
    cx, cy, r = round(size * 0.70), round(size * 0.58), round(size * 0.20)
    for dy in range(-r - 2, r + 3):
        for dx in range(-r - 2, r + 3):
            d = (dx * dx + dy * dy) ** 0.5
            if d > r + 2 or cy + dy >= water_y:
                continue
            put(cx + dx, cy + dy, sun if d <= r else edge)

    # Sun rays, the same wedge fan the game draws across the sky. Two passes,
    # the second stopping short, so they are brightest near the sun.
    ray = rgb(PAL['ray'])
    rays, step = 13, math.pi / 13
    half = step * 0.36
    for reach, alpha in ((size * 0.95, 0.30), (size * 0.42, 0.22)):
        for y in range(water_y):
            for x in range(size):
                dx, dy = x - cx, y - cy
                if dy > 0:
                    continue                      # above the sun only
                d = (dx * dx + dy * dy) ** 0.5
                if d < r + 3 or d > reach:
                    continue
                a = math.atan2(-dy, dx)
                phase = a % step
                if min(phase, step - phase) > half:
                    continue
                pix[y * size + x] = mix(pix[y * size + x], ray, alpha)

    # Water: banded lanes, darkest at the horizon.
    bands = [rgb(h) for h in LANES]
    for y in range(water_y, size):
        t = (y - water_y) / max(1, size - water_y - 1)
        for x in range(size):
            put(x, y, bands[min(len(bands) - 1, int(t * len(bands)))])

    # A few foam dashes, so the water is not a flat block.
    foam = rgb(PAL['foam'])
    step = max(3, size // 26)
    for i, fy in enumerate(range(water_y + step, size, step * 2)):
        for run in range(3):
            x0 = int(size * (0.06 + 0.33 * run) + (i % 3) * size * 0.07)
            for x in range(x0, min(size, x0 + max(4, size // 14))):
                for yy in range(max(1, size // 180)):
                    put(x, fy + yy, foam)

    # Zeyna, board sitting on the waterline.
    sw = max(len(row) for row in RIDE)
    ox = (size - sw * scale) // 2
    oy = water_y - PIVOT_Y * scale
    for gy, row in enumerate(RIDE):
        for gx, ch in enumerate(row):
            col = PALETTE.get(ch)
            if not col:
                continue
            c = rgb(col)
            for yy in range(scale):
                for xx in range(scale):
                    put(ox + gx * scale + xx, oy + gy * scale + yy, c)

    png(os.path.join(ROOT, path), pix, size, size)
    print('%s  %dx%d  sprite scale %d' % (path, size, size, scale))


# 512 is declared maskable, so the sprite stays inside the middle 80% that
# Android promises not to crop. 180 is the iOS touch icon, which is only
# rounded, so it can run wider.
icon(512, 10, 'icon-512.png')
icon(180, 4, 'icon-180.png')
