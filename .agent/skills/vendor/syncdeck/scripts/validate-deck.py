#!/usr/bin/env python3
"""
validate-deck.py — Validate a SyncDeck/Reveal.js HTML presentation.

Usage:
    python3 validate-deck.py <path-or-url>

    # File path
    python3 validate-deck.py Decks/CSP/Algorithms/my-deck.html

    # Dev-server URL (run `npm run dev` first)
    python3 validate-deck.py http://127.0.0.1:4173/CSP/Algorithms/my-deck.html

Checks:
    - Balanced <section> open/close tags (each pair = one slide)
    - All data-activity-options values parse as valid JSON
    - Required structural elements present: #storyboard, initSyncDeckReveal,
      standaloneHosting, revealOverrides
    - Presence of data-activity-instance-key attributes (warns if none found)

Exit code:
    0 — all checks passed (warnings allowed)
    1 — one or more errors found
"""

import sys
import re
import json


def load_html(source):
    if source.startswith('http://') or source.startswith('https://'):
        import urllib.request
        with urllib.request.urlopen(source) as resp:
            return resp.read().decode('utf-8')
    with open(source, encoding='utf-8') as f:
        return f.read()


def main():
    if len(sys.argv) < 2:
        print(f'Usage: python3 {sys.argv[0]} <path-or-url>', file=sys.stderr)
        sys.exit(1)

    source = sys.argv[1]
    try:
        html = load_html(source)
    except Exception as e:
        print(f'ERR Could not load "{source}": {e}', file=sys.stderr)
        sys.exit(1)

    errors   = []
    warnings = []

    # ── Slide count ────────────────────────────────────────────────────
    opens  = html.count('<section')
    closes = html.count('</section')
    if opens == closes:
        print(f'OK  Slides: {opens}')
    else:
        errors.append(f'Unbalanced <section> tags: {opens} opens, {closes} closes')

    # ── Activity options JSON ──────────────────────────────────────────
    opts = re.findall(r"data-activity-options='(\{.*?\})'", html, re.DOTALL)
    print(f'OK  Activity option blocks: {len(opts)}')
    for idx, raw in enumerate(opts, 1):
        try:
            json.loads(raw)
        except json.JSONDecodeError as e:
            errors.append(f'Invalid JSON in activity-options block {idx}: {e}')

    # ── Required structural elements ───────────────────────────────────
    required = {
        '#storyboard div':    'id="storyboard"',
        'initSyncDeckReveal': 'initSyncDeckReveal',
        'standaloneHosting':  'standaloneHosting',
        'revealOverrides':    'revealOverrides',
    }
    for label, pattern in required.items():
        if pattern in html:
            print(f'OK  {label}')
        else:
            errors.append(f'Missing required element: {label} (pattern: {pattern!r})')

    # ── Activity instance keys ─────────────────────────────────────────
    keys = re.findall(r'data-activity-instance-key="([^"]+)"', html)
    if keys:
        print(f'OK  Instance keys ({len(keys)}): {keys}')
    else:
        warnings.append(
            'No data-activity-instance-key attributes found. '
            'Add one per activity slide to prevent duplicate session creation.'
        )

    # ── Summary ────────────────────────────────────────────────────────
    print()
    for w in warnings:
        print(f'WRN {w}')
    for e in errors:
        print(f'ERR {e}')

    if not errors and not warnings:
        print('All checks passed.')
    elif not errors:
        print(f'No errors. {len(warnings)} warning(s) above.')
    else:
        print(f'{len(errors)} error(s) found.')
        sys.exit(1)


if __name__ == '__main__':
    main()
