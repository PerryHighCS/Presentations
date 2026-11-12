"""Screenshot a slide after each of several fragment steps.

Usage: trace_steps.py <deck> <slide> <step> [<step>...] [--out DIR]

Steps count Reveal.next() calls from the slide's first state, so step 0 is the
slide on arrival. Useful for stepped widgets such as the Unit 4 list trace
boards, where the shots.py default (every fragment shown) only shows the end.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from deck_page import open_deck, goto_slide  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('deck')
ap.add_argument('slide', type=int)
ap.add_argument('steps', type=int, nargs='+')
ap.add_argument('--out', default='/tmp/deck-shots')
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
with open_deck(a.deck) as page:
    for n in a.steps:
        goto_slide(page, a.slide)
        page.evaluate('() => Reveal.navigateFragment(-1)')
        for _ in range(n):
            page.evaluate('() => Reveal.nextFragment()')
        page.wait_for_timeout(300)
        path = os.path.join(a.out, f'slide{a.slide}-step{n}.png')
        page.screenshot(path=path)
        print(path)
