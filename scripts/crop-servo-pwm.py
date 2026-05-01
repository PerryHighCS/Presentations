#!/usr/bin/env python3
"""Split the servo PWM reference image into three row diagrams.

The source has uneven whitespace between diagram rows, so CSS percentage
cropping is fragile. This script detects the non-white row bands, adds margin,
and writes consistently sized cropped assets for use in the deck.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


DEFAULT_LABELS = ("0deg", "90deg", "180deg")


def is_content_pixel(pixel: tuple[int, int, int, int], threshold: int) -> bool:
    r, g, b, a = pixel
    return a > 0 and (r < threshold or g < threshold or b < threshold)


def find_runs(values: list[int], max_gap: int) -> list[tuple[int, int]]:
    if not values:
        return []

    raw_runs: list[list[int]] = []
    start = prev = values[0]
    for value in values[1:]:
        if value == prev + 1:
            prev = value
        else:
            raw_runs.append([start, prev])
            start = prev = value
    raw_runs.append([start, prev])

    merged: list[list[int]] = []
    for start, end in raw_runs:
        if not merged or start - merged[-1][1] > max_gap:
            merged.append([start, end])
        else:
            merged[-1][1] = end

    return [(start, end) for start, end in merged]


def detect_row_boxes(
    image: Image.Image,
    *,
    threshold: int,
    min_pixels_per_row: int,
    max_gap: int,
) -> list[tuple[int, int, int, int]]:
    width, height = image.size
    pixels = image.load()

    content_rows: list[int] = []
    for y in range(height):
        count = 0
        for x in range(width):
            if is_content_pixel(pixels[x, y], threshold):
                count += 1
        if count >= min_pixels_per_row:
            content_rows.append(y)

    boxes: list[tuple[int, int, int, int]] = []
    for top, bottom in find_runs(content_rows, max_gap):
        xs: list[int] = []
        for y in range(top, bottom + 1):
            for x in range(width):
                if is_content_pixel(pixels[x, y], threshold):
                    xs.append(x)
        boxes.append((min(xs), top, max(xs) + 1, bottom + 1))

    return boxes


def expand_box(
    box: tuple[int, int, int, int],
    *,
    margin: int,
    image_width: int,
    image_height: int,
) -> tuple[int, int, int, int]:
    left, top, right, bottom = box
    return (
        max(0, left - margin),
        max(0, top - margin),
        min(image_width, right + margin),
        min(image_height, bottom + margin),
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "source",
        nargs="?",
        default="Decks/AR1/Final Project/Signals_and_Motion_Assets/servo-position-pwm.png",
        help="Source PNG containing the three servo PWM rows.",
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Directory for generated crops. Defaults to the source image directory.",
    )
    parser.add_argument("--margin", type=int, default=60, help="Pixels to keep around each detected row.")
    parser.add_argument(
        "--threshold",
        type=int,
        default=245,
        help="RGB threshold below which a pixel counts as diagram content.",
    )
    parser.add_argument(
        "--min-pixels-per-row",
        type=int,
        default=20,
        help="Minimum non-white pixels required for a row to count as content.",
    )
    parser.add_argument(
        "--max-gap",
        type=int,
        default=220,
        help="Merge detected content runs separated by this many pixels or fewer.",
    )
    args = parser.parse_args()

    source = Path(args.source)
    output_dir = Path(args.output_dir) if args.output_dir else source.parent
    output_dir.mkdir(parents=True, exist_ok=True)

    image = Image.open(source).convert("RGBA")
    boxes = detect_row_boxes(
        image,
        threshold=args.threshold,
        min_pixels_per_row=args.min_pixels_per_row,
        max_gap=args.max_gap,
    )
    if len(boxes) != 3:
        raise SystemExit(f"Expected 3 diagram rows, detected {len(boxes)}: {boxes}")

    image_width, image_height = image.size
    expanded = [
        expand_box(box, margin=args.margin, image_width=image_width, image_height=image_height)
        for box in boxes
    ]

    union_left = min(box[0] for box in expanded)
    union_right = max(box[2] for box in expanded)
    output_width = union_right - union_left
    output_height = max(box[3] - box[1] for box in expanded)

    for label, box in zip(DEFAULT_LABELS, expanded):
        _left, top, _right, bottom = box
        row_crop = image.crop((union_left, top, union_right, bottom))
        canvas = Image.new("RGBA", (output_width, output_height), (255, 255, 255, 255))
        y_offset = (output_height - row_crop.height) // 2
        canvas.alpha_composite(row_crop, (0, y_offset))
        output_path = output_dir / f"servo-position-pwm-{label}.png"
        canvas.convert("RGB").save(output_path, optimize=True)
        print(f"{output_path} <- crop x={union_left}:{union_right} y={top}:{bottom}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
