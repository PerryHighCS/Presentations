"""Tile slide screenshots from shots.py into contact sheets for quick review.

Usage:
  python .agent/tools/sheet.py [<slide> ...] [--dir DIR] [--cols N]

Reads <dir>/slide<N>.png (default dir: /tmp/deck-shots, the shots.py
default) and writes <dir>/sheet-<first>-<last>.png, one sheet per cols x cols
slides, each tile labeled with its slide number. With no slide numbers, every
slide<N>.png in the directory is used in numeric order. Prints each sheet's
path; read the sheets to review a whole deck in a few images.
"""
import argparse
import glob
import os
import re

from PIL import Image, ImageDraw

TILE_W, TILE_H = 800, 450  # half of the 1600x900 canvas


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('slides', nargs='*', help='slide numbers (default: every slide<N>.png in --dir)')
    ap.add_argument('--dir', default='/tmp/deck-shots')
    ap.add_argument('--cols', type=int, default=3, help='tiles per row; a sheet holds cols x cols slides')
    args = ap.parse_args()

    slides = args.slides or sorted(
        (re.match(r'slide(\d+)\.png$', os.path.basename(p)).group(1)
         for p in glob.glob(os.path.join(args.dir, 'slide*.png'))
         if re.match(r'slide(\d+)\.png$', os.path.basename(p))),
        key=int)
    per = args.cols * args.cols
    for k in range(0, len(slides), per):
        chunk = slides[k:k + per]
        rows = (len(chunk) + args.cols - 1) // args.cols
        sheet = Image.new('RGB', (args.cols * TILE_W, rows * TILE_H), 'white')
        draw = ImageDraw.Draw(sheet)
        for i, n in enumerate(chunk):
            x, y = (i % args.cols) * TILE_W, (i // args.cols) * TILE_H
            im = Image.open(os.path.join(args.dir, 'slide%s.png' % n)).convert('RGB')
            sheet.paste(im.resize((TILE_W - 4, TILE_H - 4)), (x + 2, y + 2))
            draw.text((x + 8, y + 6), str(n), fill='yellow')
        out = os.path.join(args.dir, 'sheet-%s-%s.png' % (chunk[0], chunk[-1]))
        sheet.save(out)
        print(out)


if __name__ == '__main__':
    main()
