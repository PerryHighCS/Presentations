# Agent tools

Playwright scripts for checking decks in a real browser. They drive the dev
server (`npm run dev`, port 4173) at the 1600x900 canvas size, with
transitions turned off so screenshots and measurements never catch a fade
mid-frame.

## Setup

In the devcontainer there is nothing to set up. The image is Microsoft's
Playwright image, which ships the browsers in `/ms-playwright`, and
`onCreateCommand` installs the Python packages in
`.devcontainer/requirements.txt` (Playwright pinned to the image's version, plus
Pillow and NumPy). Run the scripts from the repo root:

```bash
python3 .agent/tools/shots.py Decks/AR1/DCCircuits/EX7_Parallel_and_Mixed_Circuits.html 25
```

If `import playwright` fails, the container was created before that file
existed: rebuild it, or run the `onCreateCommand` from
`.devcontainer/devcontainer.json` by hand.

Outside the devcontainer, install Playwright into a throwaway virtualenv outside
the repo and let it download its own browser:

```bash
python3 -m venv /tmp/deck-venv
/tmp/deck-venv/bin/pip install playwright pillow numpy
/tmp/deck-venv/bin/python -m playwright install --with-deps chromium
/tmp/deck-venv/bin/python .agent/tools/shots.py Decks/AR1/DCCircuits/EX7_Parallel_and_Mixed_Circuits.html 25
```

Deck paths can be repo paths (`Decks/AR1/...`) or site paths (`AR1/...`).
Slide numbers are Reveal's flattened numbering, the same as the `c/t` counter
and the `<!-- SLIDE NN -->` comments.

## Scripts

| Script | What it does |
|---|---|
| `shots.py <deck> <n>... [--out DIR] [--no-fragments]` | Screenshot slides (or `all`), with every fragment revealed by default. Writes `slide<N>.png` to `--out` (default `/tmp/deck-shots`). Read the PNGs to see the result. |
| `audit.py <deck> [<n>...]` | Reports, per slide, elements running off the canvas (OVERFLOW; bordered boxes like code cards count, so a card whose bottom edge runs off is caught even when its text still fits), separate text blocks or images that intersect (OVERLAP), content cut off inside an `overflow: hidden` box such as a code card (CLIPPED), text below the AGENTS.md size floors (SIZE FAIL; SIZE CHECK for 22-29px text in paragraphs and list items that may need to be body size), and text contrast composited over its ancestor backgrounds (CONTRAST FAIL under 4.5:1; CONTRAST CHECK for 4.5-7:1, which only intentionally dimmed text may use). Exits non-zero if anything but CHECK lines is found. |
| `deck_page.py` | Shared helpers: `open_deck`, `goto_slide`, `click_in_slide`, `rects`. Import it for one-off checks. |

The audit measures; it does not judge. OVERLAP can include layers that are
stacked on purpose (before/after animation frames), CHECK lines need a human
decision about each element's role, and squeezed diagrams or labels colliding
with lines inside an SVG don't show up at all. Always look at screenshots of
every slide you change.

## Stability checks for interactive widgets

Simulators, games, and reveal panels can jump as their content changes. To
check one, drive it through every state and confirm the key elements never
move:

```python
import sys; sys.path.insert(0, '.agent/tools')
from deck_page import open_deck, goto_slide, click_in_slide, rects

with open_deck('AR2/ShopSafety/Making_Warnings_Unnecessary.html') as page:
    goto_slide(page, 5)
    seen = set()
    for stage in range(4):
        click_in_slide(page, '.beyond-stage-label', stage)
        r = rects(page, ['.beyond-panel', '.beyond-pager'])
        seen.add(tuple(map(tuple, r.values())))
    print('stable' if len(seen) == 1 else seen)
```

Also check that the panel never needs to scroll
(`el.scrollHeight > el.clientHeight`) and that feedback text fits its box
in its longest state. Randomized widgets need many runs, or compute the
longest possible message directly from the data.

## Gotchas

- The storyboard keeps cloned copies of every slide and a thumbnail copy of
  the deck. Query inside `Reveal.getCurrentSlide()`, never
  `document.querySelector('.reveal ...')`, and click with `click_in_slide`
  (a DOM click) because the storyboard track can intercept real clicks.
- CONTRAST only sees CSS backgrounds. Text drawn on SVG shapes, images, or
  gradients is measured against the nearest solid `background-color`, so
  check those by eye.
- SVG text renders at the SVG's scale. Its rendered size is the computed
  font size times `getScreenCTM()` scale divided by `Reveal.getScale()`.
  `audit.py` does this for you.
