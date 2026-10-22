"""Shared Playwright helpers for driving a deck served by `npm run dev`.

Both shots.py and audit.py import this. It can also be used directly for
one-off checks, e.g. clicking through an interactive widget and comparing
element positions between states (see README.md, "Stability checks").
"""
from contextlib import contextmanager
from urllib.parse import quote

from playwright.sync_api import sync_playwright

CANVAS_W, CANVAS_H = 1600, 900
NO_MOTION_CSS = '*{transition:none!important;animation-duration:0s!important}'


def deck_url(deck, port=4173):
    """Accept either a repo path (Decks/AR1/X/y.html) or a site path (AR1/X/y.html)."""
    path = deck.lstrip('/')
    if path.startswith('Decks/'):
        path = path[len('Decks/'):]
    return 'http://localhost:%d/%s' % (port, quote(path))


@contextmanager
def open_deck(deck, port=4173, settle_ms=1500):
    """Open a deck at the 1600x900 canvas size with transitions disabled.

    Yields the Playwright page. Page errors are collected on page.errors.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': CANVAS_W, 'height': CANVAS_H})
        page.errors = []
        page.on('pageerror', lambda e: page.errors.append(str(e)))
        page.goto(deck_url(deck, port))
        page.wait_for_timeout(settle_ms)
        page.add_style_tag(content=NO_MOTION_CSS)
        try:
            yield page
        finally:
            browser.close()


def slide_count(page):
    return page.evaluate('Reveal.getTotalSlides()')


def goto_slide(page, n, all_fragments=True, settle_ms=400):
    """Go to 1-based slide n (Reveal's flattened c/t numbering), optionally revealing every fragment."""
    page.evaluate(
        """([n, all]) => {
            const s = Reveal.getSlides()[n - 1];
            const i = Reveal.getIndices(s);
            Reveal.slide(i.h, i.v);
            if (all) { while (Reveal.nextFragment()) {} }
        }""",
        [n, all_fragments],
    )
    page.wait_for_timeout(settle_ms)


def click_in_slide(page, selector, index=0):
    """Click an element inside the current slide.

    Uses a DOM click rather than page.click(): the storyboard keeps cloned
    copies of every slide, and its track can intercept real pointer events.
    """
    page.evaluate(
        "([sel, i]) => Reveal.getCurrentSlide().querySelectorAll(sel)[i].click()",
        [selector, index],
    )


def rects(page, selectors):
    """Canvas-space [left, top, width, height] for the first match of each selector in the current slide."""
    return page.evaluate(
        """(sels) => {
            const s = Reveal.getCurrentSlide();
            const out = {};
            for (const sel of sels) {
                const e = s.querySelector(sel);
                if (!e) { out[sel] = null; continue; }
                const r = e.getBoundingClientRect();
                out[sel] = [r.left, r.top, r.width, r.height].map(Math.round);
            }
            return out;
        }""",
        selectors,
    )
