#!/usr/bin/env python3
"""
Generates the original atmospheric hero loop.

Everything is drawn from scratch. No footage is taken from anywhere: using the
artist's own videos as a background would be a far larger rights problem than
the stills flagged in ASSET-MANIFEST.md, so this build renders its own.

How it is built, roughly in draw order:

  1. a haze field, advected across the frame, so the beams have something to
     be volumetric *in* — without it, light cones read as flat gradients
  2. beams computed analytically (perpendicular distance to each ray, widening
     with distance) rather than drawn as blurred polygons, which is what makes
     the edges soft and the cores hot
  3. floating motes, lit only where they sit inside a beam
  4. two crowd layers at different scales and sway speeds, for parallax
  5. bloom, grain and a vignette
  6. a slow camera drift, applied by cropping a moving window out of an
     oversized render, so every layer moves together

Constraints from design.md §7B and §5:
  * seamless — every motion is periodic over the clip, and the haze scroll and
    mote wrap are whole numbers of cycles
  * no strobe, no hard cuts, no rapid luminance swings
  * no audio track at all
  * dark enough for white display type to sit on it

Run:      python3 tools/make-hero-loop.py
Preview:  python3 tools/make-hero-loop.py --preview   (3 stills, no encode)
Needs:    Pillow, numpy, ffmpeg (libx264 + libvpx-vp9)
"""
from __future__ import annotations

import math
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT_W, OUT_H = 1920, 1080
# Rendered oversized so the camera has room to drift inside the frame.
OVERSCAN = 1.14
# Render oversized, then crop a full-size window out of it — the margin is the
# room the camera has to move in.
W = int(OUT_W * OVERSCAN) // 2 * 2
H = int(OUT_H * OVERSCAN) // 2 * 2
CROP_W, CROP_H = OUT_W, OUT_H

FPS = 24
SECONDS = 10                               # design.md §7B asks for 6-10 s
FRAMES = FPS * SECONDS

OUT = Path("public/assets/hero")
TMP = Path(".hero-loop-frames")

SIGNAL = np.array([255, 87, 56], dtype=np.float32)
EMBER = np.array([255, 148, 96], dtype=np.float32)
PAPER = np.array([243, 240, 233], dtype=np.float32)

RNG = np.random.default_rng(20260909)

# Pixel grid, reused by every frame.
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)


def tiling_noise(cells_x: int, cells_y: int, softness: int) -> np.ndarray:
    """Smooth field that wraps horizontally, so scrolling it never seams."""
    grid = RNG.random((cells_y, cells_x)).astype(np.float32)
    grid = np.hstack([grid, grid[:, :1]])                      # wrap column
    img = Image.fromarray((grid * 255).astype(np.uint8)).resize((W + W // cells_x, H), Image.BICUBIC)
    img = img.filter(ImageFilter.GaussianBlur(softness))
    return np.asarray(img, dtype=np.float32)[:, :W] / 255.0


HAZE_A = tiling_noise(9, 5, 26)
HAZE_B = tiling_noise(21, 11, 12)

# Motes: start positions, drift speed as whole cycles so they wrap seamlessly.
MOTE_COUNT = 190
MOTE_X = RNG.random(MOTE_COUNT).astype(np.float32)
MOTE_Y = RNG.random(MOTE_COUNT).astype(np.float32)
MOTE_CYCLES = RNG.integers(1, 3, MOTE_COUNT).astype(np.float32)
MOTE_SIZE = (RNG.random(MOTE_COUNT) * 1.7 + 0.7).astype(np.float32)
MOTE_SWAY = (RNG.random(MOTE_COUNT) * 0.012).astype(np.float32)
MOTE_PHASE = (RNG.random(MOTE_COUNT) * math.tau).astype(np.float32)


def beam_field(phase: float) -> tuple[np.ndarray, np.ndarray]:
    """
    Returns (light, colour) — a scalar intensity field and an RGB field.

    Each beam is a ray from a point on the truss. Intensity falls off with the
    perpendicular distance to that ray, inside a cone that widens as it travels,
    and fades along its length. That is what gives a hot core and a soft edge.
    """
    light = np.zeros((H, W), dtype=np.float32)
    colour = np.zeros((H, W, 3), dtype=np.float32)

    truss_y = H * 0.085
    count = 9
    for i in range(count):
        offset = (i - (count - 1) / 2) / (count - 1)           # -0.5 .. 0.5
        origin_x = W * (0.5 + offset * 0.78)

        # Wide, slow sweep — the whole beam swings, rather than jittering.
        swing = math.sin(phase + i * 0.62) * 0.30
        angle = offset * 0.55 + swing                          # from vertical
        dx, dy = math.sin(angle), math.cos(angle)

        px = XX - origin_x
        py = YY - truss_y
        along = px * dx + py * dy                              # distance down the ray
        perp = np.abs(px * dy - py * dx)                       # distance from the ray

        # Clamped: behind the lens `along` goes negative and the cone width
        # would cross zero, giving 0/0 -> NaN on the beam axis.
        core = np.maximum(9.0 + along * 0.135, 1.0)            # cone widens with distance
        radial = np.exp(-(perp / core) ** 2 * 1.4)
        length = np.clip(1.0 - along / (H * 1.45), 0.0, 1.0) ** 1.7
        shaft = radial * length * (along > 0)

        swell = 0.55 + 0.45 * math.sin(phase * 1.5 + i * 1.1)
        tone = SIGNAL if i % 3 == 0 else (EMBER if i % 3 == 1 else PAPER)
        contribution = shaft * swell

        light += contribution
        colour += contribution[:, :, None] * tone

        # Bloom at the lens itself, so beams look emitted rather than drawn.
        lens = np.exp(-(((XX - origin_x) / 26.0) ** 2 + ((YY - truss_y) / 20.0) ** 2))
        light += lens * swell * 1.5
        colour += (lens * swell * 1.5)[:, :, None] * tone

    return light, colour


def crowd_layer(
    scale: float, sway: float, phase: float, baseline: float, seed: int, ground: bool
) -> Image.Image:
    """
    One row of silhouettes. Two of these at different scales, sway speeds and
    blur radii give the parallax that stops the frame reading as flat.

    Figures are deliberately irregular — varied heights, a jittered spacing and
    only some arms raised. A uniform row of rounded rectangles reads as a fence.
    """
    layer = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(layer)
    rng = np.random.default_rng(seed)
    count = int(64 / scale)

    # Only the near row fills to the bottom edge. Letting the far row do it too
    # produced a hard horizontal band between the two, which read as a fence
    # rather than a crowd.
    if ground:
        draw.rectangle([0, baseline + 70 * scale, W, H], fill=255)

    for i in range(count):
        jitter = float(rng.random() - 0.5) * (W / count) * 0.55
        x = (i / (count - 1)) * (W + 160) - 80 + jitter + math.sin(phase + i * 0.9) * sway
        height = 0.78 + float(rng.random()) * 0.42
        bob = math.sin(phase * 2 + i * 0.8) * 5.0 * scale
        head = (8.5 + float(rng.random()) * 3.5) * scale * height
        y = baseline + bob + (1.0 - height) * 40 * scale

        shoulder = head * 1.45
        draw.ellipse([x - head, y - head, x + head, y + head], fill=255)
        draw.rounded_rectangle(
            [x - shoulder, y + head * 0.35, x + shoulder, y + head * 5.2],
            radius=shoulder * 0.75,
            fill=255,
        )

        # Roughly a third of the crowd has an arm up, at its own height.
        if rng.random() < 0.34:
            lift = 1.0 + 0.3 * math.sin(phase * 2 + i * 1.7)
            aw = head * 0.26
            ax = x + shoulder * (0.85 if i % 2 else -0.85)
            draw.rounded_rectangle(
                [ax - aw, y - head * (2.4 + 1.1 * lift), ax + aw, y + head * 1.2],
                radius=aw,
                fill=255,
            )
            draw.ellipse(
                [ax - aw * 1.5, y - head * (2.4 + 1.1 * lift) - aw * 1.5,
                 ax + aw * 1.5, y - head * (2.4 + 1.1 * lift) + aw * 1.5],
                fill=255,
            )

    return layer


def render_frame(index: int) -> Image.Image:
    t = index / FRAMES
    phase = t * math.tau

    light, colour = beam_field(phase)

    # Haze the beams are travelling through, scrolled by whole frames so the
    # loop closes exactly.
    haze = (
        np.roll(HAZE_A, int(round(t * W)), axis=1) * 0.65
        + np.roll(HAZE_B, -int(round(t * W * 2)), axis=1) * 0.35
    )
    depth = np.clip((YY / H - 0.10) * 1.5, 0.0, 1.0)
    density = 0.55 + 0.45 * haze * depth
    light *= density
    colour *= density[:, :, None]

    # Motes, brightest where they sit inside a beam.
    motes = np.zeros((H, W), dtype=np.float32)
    my = (MOTE_Y + t * MOTE_CYCLES) % 1.0
    mx = (MOTE_X + np.sin(phase + MOTE_PHASE) * MOTE_SWAY) % 1.0
    px = (mx * W).astype(np.int32)
    py = ((0.12 + my * 0.76) * H).astype(np.int32)
    np.add.at(motes, (py, px), MOTE_SIZE)
    # Blur in 8-bit: PIL's gaussian filter does not accept float images.
    scaled = np.clip(motes * 90.0, 0, 255).astype(np.uint8)
    motes = np.asarray(Image.fromarray(scaled, mode="L").filter(ImageFilter.GaussianBlur(1.6)), dtype=np.float32) / 90.0
    lit = np.clip(light, 0, 3) / 3.0
    colour += (motes * (0.25 + 1.5 * lit))[:, :, None] * PAPER

    # Ground: a dark base with a faint warm floor spill.
    base = np.zeros((H, W, 3), dtype=np.float32)
    base += np.array([15, 13, 12], dtype=np.float32)
    base += (np.clip((YY / H - 0.55) * 1.6, 0, 1) ** 2)[:, :, None] * np.array([-9, -8, -7], dtype=np.float32)
    frame = base + colour * 0.95

    # Bloom: blur the bright parts and add them back.
    bright = np.clip(frame - 42.0, 0, None)
    bloom = np.asarray(
        Image.fromarray(np.clip(bright, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(22)),
        dtype=np.float32,
    )
    frame += bloom * 0.7

    frame = np.clip(frame, 0, 255).astype(np.uint8)
    image = Image.fromarray(frame)

    # Crowd, back layer first so the front reads as closer.
    back = crowd_layer(0.58, 4.0, phase, H * 0.815, seed=1, ground=False)
    front = crowd_layer(1.3, 11.0, phase, H * 0.9, seed=2, ground=True)
    image.paste(Image.new("RGB", (W, H), (13, 11, 10)), (0, 0), back.filter(ImageFilter.GaussianBlur(2.6)))
    image.paste(Image.new("RGB", (W, H), (4, 4, 4)), (0, 0), front.filter(ImageFilter.GaussianBlur(1.0)))

    arr = np.asarray(image, dtype=np.float32)

    # Grain, then vignette.
    arr += (RNG.random((H, W, 1)).astype(np.float32) - 0.5) * 5.0
    vignette = np.clip(
        1.0 - np.sqrt(((XX - W / 2) / (W * 0.78)) ** 2 + ((YY - H / 2) / (H * 0.92)) ** 2), 0.0, 1.0
    )
    arr *= (0.64 + 0.36 * vignette)[:, :, None]

    full = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

    # Camera: a slow elliptical drift, sampled out of the oversized render.
    max_x = W - CROP_W
    max_y = H - CROP_H
    cx = int(max_x * (0.5 + 0.5 * math.sin(phase)))
    cy = int(max_y * (0.5 + 0.5 * math.sin(phase * 2 + 1.1)))
    return full.crop((cx, cy, cx + CROP_W, cy + CROP_H))


def main() -> int:
    preview = "--preview" in sys.argv
    if not preview and shutil.which("ffmpeg") is None:
        print("ffmpeg is required", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)

    if preview:
        for i in (0, FRAMES // 3, (FRAMES * 2) // 3):
            render_frame(i).save(f"/tmp/loop-preview-{i:04d}.png")
            print(f"/tmp/loop-preview-{i:04d}.png")
        return 0

    if TMP.exists():
        shutil.rmtree(TMP)
    TMP.mkdir()

    for i in range(FRAMES):
        render_frame(i).save(TMP / f"{i:04d}.png")
        if i % 24 == 0:
            print(f"  frame {i}/{FRAMES}")

    # Poster is frame 0, so the still and the first video frame match exactly.
    Image.open(TMP / "0000.png").save(OUT / "hero-loop-poster.jpg", quality=84, optimize=True, progressive=True)

    common = ["-y", "-framerate", str(FPS), "-i", str(TMP / "%04d.png"), "-an"]
    subprocess.run(
        ["ffmpeg", *common, "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
         "-crf", "26", "-preset", "slow", "-movflags", "+faststart", str(OUT / "hero-loop.mp4")],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    subprocess.run(
        ["ffmpeg", *common, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-row-mt", "1",
         str(OUT / "hero-loop.webm")],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )

    shutil.rmtree(TMP)
    for name in ("hero-loop.mp4", "hero-loop.webm", "hero-loop-poster.jpg"):
        print(f"{name:26} {(OUT / name).stat().st_size / 1024:8.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
