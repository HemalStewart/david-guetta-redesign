#!/usr/bin/env python3
"""
Generates the original atmospheric hero loop used by the concept.

This exists so the hero-video pipeline can be reviewed with a real file
instead of a placeholder, without taking footage from anywhere. Everything is
drawn from scratch: beams from a lighting truss, drifting haze, a crowd line
and a vignette — the same visual language as PlaceholderArt.

Design constraints taken from design.md §7B and §5:
  * seamless loop — every motion is periodic over the clip length
  * no strobe, no hard cuts, no rapid luminance swings
  * no audio track at all
  * dark enough for white type to sit on it

Run:  python3 tools/make-hero-loop.py
Needs: Pillow, numpy, ffmpeg (libx264 + libvpx-vp9)
"""
from __future__ import annotations

import math
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 960, 540          # rendered small and upscaled: beams want to be soft
FPS = 25
SECONDS = 8
FRAMES = FPS * SECONDS
OUT = Path("public/assets/hero")
TMP = Path(".hero-loop-frames")

INK = (12, 11, 10)
SIGNAL = (255, 87, 56)
PAPER = (243, 240, 233)


def beam_polygon(origin_x: float, angle: float, spread: float) -> list[tuple[float, float]]:
    """A light cone from the truss, described by its centre angle and spread."""
    length = H * 2.2
    left = angle - spread
    right = angle + spread
    top_y = H * 0.06
    return [
        (origin_x - 6, top_y),
        (origin_x + 6, top_y),
        (origin_x + math.sin(right) * length, top_y + math.cos(right) * length),
        (origin_x + math.sin(left) * length, top_y + math.cos(left) * length),
    ]


def gradient_base() -> Image.Image:
    """Vertical ground gradient, built once and reused for every frame."""
    y = np.linspace(0.0, 1.0, H, dtype=np.float32)[:, None]
    top = np.array([18, 16, 15], dtype=np.float32)
    mid = np.array([26, 21, 18], dtype=np.float32)
    bottom = np.array([8, 7, 7], dtype=np.float32)
    ramp = np.where(y < 0.55, top + (mid - top) * (y / 0.55), mid + (bottom - mid) * ((y - 0.55) / 0.45))
    field = np.repeat(ramp[:, None, :], W, axis=1)
    return Image.fromarray(field.astype(np.uint8))


def render_frame(index: int, base: Image.Image) -> Image.Image:
    t = index / FRAMES                      # 0..1, wraps seamlessly
    phase = t * 2 * math.pi

    frame = base.copy()

    # --- beams -----------------------------------------------------------
    beams = Image.new("RGB", (W, H), (0, 0, 0))
    draw = ImageDraw.Draw(beams)
    count = 7
    for i in range(count):
        offset = (i - (count - 1) / 2) / count
        origin_x = W * (0.5 + offset * 0.42)
        # Each beam sweeps on its own phase so the group never pulses together.
        angle = offset * 1.15 + math.sin(phase + i * 0.9) * 0.06
        spread = 0.045 + 0.02 * (0.5 + 0.5 * math.sin(phase * 2 + i))
        warm = i % 3 == 0
        colour = SIGNAL if warm else PAPER
        intensity = 0.46 + 0.18 * math.sin(phase + i * 1.4)
        shade = tuple(int(c * intensity) for c in colour)
        draw.polygon(beam_polygon(origin_x, angle, spread), fill=shade)
    beams = beams.filter(ImageFilter.GaussianBlur(9))

    # Beams fade towards the floor rather than ending in a hard edge.
    falloff = np.linspace(1.0, 0.0, H, dtype=np.float32) ** 1.5
    beam_px = np.asarray(beams, dtype=np.float32) * falloff[:, None, None]
    frame_px = np.asarray(frame, dtype=np.float32) + beam_px

    # --- source glow -----------------------------------------------------
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    gx = W * (0.5 + 0.03 * math.sin(phase))
    gy = H * 0.08
    dist = np.sqrt(((xx - gx) / (W * 0.45)) ** 2 + ((yy - gy) / (H * 0.55)) ** 2)
    glow = np.clip(1.0 - dist, 0.0, 1.0) ** 2.2
    glow *= 0.55 + 0.12 * math.sin(phase * 2)
    frame_px += glow[:, :, None] * np.array(SIGNAL, dtype=np.float32) * 0.85

    # --- haze ------------------------------------------------------------
    drift = (t * 2 * math.pi)
    haze = (
        np.sin(yy / 42.0 + drift) * 0.5
        + np.sin(yy / 97.0 - drift * 0.6) * 0.3
        + np.sin(xx / 260.0 + drift * 0.4) * 0.2
    )
    haze = np.clip(haze, 0.0, None) * np.clip((yy / H - 0.25) * 1.4, 0.0, 1.0)
    frame_px += haze[:, :, None] * 7.0

    frame_px = np.clip(frame_px, 0, 255)
    frame = Image.fromarray(frame_px.astype(np.uint8))

    # --- truss and crowd -------------------------------------------------
    fg = ImageDraw.Draw(frame)
    truss_y = H * 0.055
    fg.rectangle([0, truss_y, W, truss_y + 4], fill=(5, 5, 5))
    for i in range(11):
        x = (i + 0.5) * (W / 11)
        fg.rectangle([x - 3, truss_y, x + 3, truss_y + 14 + (i % 3) * 8], fill=(5, 5, 5))

    crowd_top = H * 0.80
    fg.rectangle([0, crowd_top + 8, W, H], fill=(6, 6, 6))
    for i in range(58):
        x = (i / 57) * (W + 40) - 20
        bob = math.sin(phase * 2 + i * 0.7) * 3.0     # a slow sway, not a strobe
        r = 11 + (i % 5) * 2.5
        fg.ellipse([x - r, crowd_top + bob - r, x + r, crowd_top + bob + r], fill=(6, 6, 6))

    # --- vignette --------------------------------------------------------
    vignette = np.clip(1.0 - np.sqrt(((xx - W / 2) / (W * 0.72)) ** 2 + ((yy - H / 2) / (H * 0.85)) ** 2), 0.0, 1.0)
    shaded = np.asarray(frame, dtype=np.float32) * (0.55 + 0.45 * vignette)[:, :, None]
    frame = Image.fromarray(np.clip(shaded, 0, 255).astype(np.uint8))

    return frame.resize((W * 2, H * 2), Image.LANCZOS)


def main() -> int:
    if shutil.which("ffmpeg") is None:
        print("ffmpeg is required", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    if TMP.exists():
        shutil.rmtree(TMP)
    TMP.mkdir()

    base = gradient_base()
    for i in range(FRAMES):
        render_frame(i, base).save(TMP / f"{i:04d}.png")
        if i % 25 == 0:
            print(f"  frame {i}/{FRAMES}")

    # Poster is frame 0, so the still and the first video frame match exactly.
    Image.open(TMP / "0000.png").save(OUT / "hero-loop-poster.jpg", quality=82, optimize=True)

    common = ["-y", "-framerate", str(FPS), "-i", str(TMP / "%04d.png"), "-an"]
    subprocess.run(
        ["ffmpeg", *common, "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
         "-crf", "27", "-preset", "slow", "-movflags", "+faststart", str(OUT / "hero-loop.mp4")],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    subprocess.run(
        ["ffmpeg", *common, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "40", "-row-mt", "1",
         str(OUT / "hero-loop.webm")],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )

    shutil.rmtree(TMP)
    for name in ("hero-loop.mp4", "hero-loop.webm", "hero-loop-poster.jpg"):
        size = (OUT / name).stat().st_size
        print(f"{name:26} {size / 1024:8.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
