#!/usr/bin/env python3
"""
pptx-extract.py — Extract slide text, notes, image refs, and media from a .pptx file.

Usage:
    python3 pptx-extract.py <path-to.pptx>
    python3 pptx-extract.py <path-to.pptx> --extract-media
    python3 pptx-extract.py <path-to.pptx> --extract-media --out-dir MyAssets/

Flags:
    --extract-media     Write all embedded media files to disk.
    --out-dir DIR       Destination for extracted media (default: <pptx-stem>-assets/).

Output (stdout):
    Per-slide summary: text content, image references, and speaker notes.
    With --extract-media: list of extracted filenames.

Typical workflow when converting a PPTX to a SyncDeck HTML deck:
    1. Run with --extract-media to pull out images and understand slide content.
    2. Use the per-slide output to plan which slides need timers, diagrams, or
       activity embeds, and which images are worth reusing.
    3. Copy the output directory next to the HTML file and reference the images
       with relative paths (e.g. MyAssets/image3.png).
"""

import sys
import os
import re
import zipfile
import xml.etree.ElementTree as ET
import argparse


def _texts(xml_content):
    """Return all non-empty text runs from a PPTX XML file, joined by spaces."""
    root = ET.fromstring(xml_content)
    parts = []
    for t in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t'):
        if t.text and t.text.strip():
            parts.append(t.text.strip())
    return ' '.join(parts)


def _image_names(rels_content):
    """Return base filenames of all image relationships in a slide .rels file."""
    root = ET.fromstring(rels_content)
    names = []
    for rel in root:
        if 'image' in rel.get('Type', ''):
            target = rel.get('Target', '')
            names.append(os.path.basename(target))
    return names


def main():
    parser = argparse.ArgumentParser(
        description='Extract content from a PPTX file for SyncDeck conversion.'
    )
    parser.add_argument('pptx', help='Path to the .pptx file')
    parser.add_argument(
        '--extract-media',
        action='store_true',
        help='Write all embedded media files to disk',
    )
    parser.add_argument(
        '--out-dir',
        default=None,
        help='Directory for extracted media (default: <pptx-stem>-assets/)',
    )
    args = parser.parse_args()

    pptx_path = args.pptx
    stem = os.path.splitext(os.path.basename(pptx_path))[0]
    out_dir = args.out_dir or (stem + '-assets')

    with zipfile.ZipFile(pptx_path) as z:
        all_files = set(z.namelist())

        slide_paths = sorted(
            (f for f in all_files
             if f.startswith('ppt/slides/slide')
             and f.endswith('.xml')
             and '_rels' not in f),
            key=lambda p: int(re.search(r'slide(\d+)\.xml$', p).group(1)),
        )

        print(f'PPTX: {pptx_path}')
        print(f'Slides: {len(slide_paths)}')
        print()

        for i, slide_path in enumerate(slide_paths, 1):
            slide_xml  = z.read(slide_path).decode('utf-8')
            rels_path  = f'ppt/slides/_rels/{os.path.basename(slide_path)}.rels'
            rels_xml   = z.read(rels_path).decode('utf-8') if rels_path in all_files else '<Relationships/>'
            notes_path = f'ppt/notesSlides/notesSlide{i}.xml'
            notes_xml  = z.read(notes_path).decode('utf-8') if notes_path in all_files else None

            text   = _texts(slide_xml)
            images = _image_names(rels_xml)
            notes  = _texts(notes_xml) if notes_xml else ''

            print(f'=== Slide {i} ===')
            if text:
                print(f'  Text:   {text[:500]}')
            else:
                print(f'  Text:   (none — possibly Nearpod embed or image-only slide)')
            if images:
                print(f'  Images: {images}')
            if notes:
                print(f'  Notes:  {notes[:300]}')
            print()

        if args.extract_media:
            media_files = [f for f in all_files if f.startswith('ppt/media/')]
            os.makedirs(out_dir, exist_ok=True)
            print(f'Extracting {len(media_files)} media file(s) to {out_dir}/')
            for mf in sorted(media_files):
                filename = os.path.basename(mf)
                out_path = os.path.join(out_dir, filename)
                with z.open(mf) as src, open(out_path, 'wb') as dst:
                    dst.write(src.read())
                print(f'  {filename}')


if __name__ == '__main__':
    main()
