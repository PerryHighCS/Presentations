"""Screenshot deck slides at the 1600x900 canvas size.

Usage:
  python .agent/tools/shots.py <deck> <slide> [<slide> ...] [--out DIR] [--no-fragments] [--port N]
  python .agent/tools/shots.py <deck> all

<deck> is a repo path (Decks/AR1/DCCircuits/EX7.html) or a site path
(AR1/DCCircuits/EX7.html). Slides use Reveal's flattened numbering (the c/t
counter). By default every fragment is revealed first. Files are written as
<out>/slide<N>.png (default out: /tmp/deck-shots).
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from deck_page import goto_slide, open_deck, slide_count  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('deck')
    ap.add_argument('slides', nargs='+', help='slide numbers, or "all"')
    ap.add_argument('--out', default='/tmp/deck-shots')
    ap.add_argument('--no-fragments', action='store_true', help='do not reveal fragments')
    ap.add_argument('--port', type=int, default=4173)
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    with open_deck(args.deck, args.port) as page:
        nums = range(1, slide_count(page) + 1) if args.slides == ['all'] else [int(s) for s in args.slides]
        for n in nums:
            goto_slide(page, n, all_fragments=not args.no_fragments)
            path = os.path.join(args.out, 'slide%d.png' % n)
            page.screenshot(path=path)
            print(path)
        for e in page.errors:
            print('page error:', e, file=sys.stderr)


if __name__ == '__main__':
    main()
