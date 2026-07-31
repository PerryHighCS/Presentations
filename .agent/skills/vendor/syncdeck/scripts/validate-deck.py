#!/usr/bin/env python3
"""
validate-deck.py — Validate a SyncDeck/Reveal.js HTML presentation.

Usage:
    python3 validate-deck.py <path-or-url>
    python3 validate-deck.py <path> --renumber

    # File path
    python3 validate-deck.py Decks/CSP/Algorithms/my-deck.html

    # Dev-server URL (run `npm run dev` first)
    python3 validate-deck.py http://127.0.0.1:4173/CSP/Algorithms/my-deck.html

    # Auto-fix drifted "SLIDE NN" comment numbers (local file only)
    python3 validate-deck.py Decks/CSP/Algorithms/my-deck.html --renumber

Checks:
    - Balanced <section> open/close tags (each pair = one slide)
    - All data-activity-options values parse as valid JSON
    - Required structural elements present: #storyboard, initSyncDeckReveal,
      standaloneHosting, revealOverrides
    - Presence of data-activity-instance-key attributes (warns if none found)
    - "<!-- SLIDE NN · ... -->" comments match the flattened position of the
      <section> they immediately precede. This mirrors Reveal's slideNumber
      'c/t' counter, which counts every <section> in document order,
      including nested vertical-stack children — a stack's children simply
      appear later in that same flattened sequence, so no separate h/v
      notation is needed for the comment to stay accurate.

--renumber rewrites every drifted "SLIDE NN" comment in place to match its
section's true flattened position and leaves all other comment text alone.
It's a no-op if numbering is already correct. Decks that don't use the
SLIDE-comment convention at all are skipped silently (no error, no warning).

Exit code:
    0 — all checks passed (warnings allowed)
    1 — one or more errors found
"""

import sys
import re
import json
import bisect
import argparse


def load_html(source):
    if source.startswith('http://') or source.startswith('https://'):
        import urllib.request
        with urllib.request.urlopen(source) as resp:
            return resp.read().decode('utf-8')
    with open(source, encoding='utf-8') as f:
        return f.read()


def line_of(html, offset):
    return html.count('\n', 0, offset) + 1


def check_slide_numbering(html):
    """Find every '<!-- ... SLIDE NN ... -->' block and compare NN against
    the 1-based rank, in document order, of the <section> it precedes.

    Returns (comments, mismatches): comments is every SLIDE-comment found
    (each a dict with comment_number/expected_number/line/offset/width);
    mismatches is the subset whose comment_number is wrong.
    """
    section_starts = [m.start() for m in re.finditer(r'<section\b', html)]
    comments = []
    for block in re.finditer(r'<!--(.*?)-->', html, re.DOTALL):
        text = block.group(1)
        num_match = re.search(r'\bSLIDE\s+(\d+)\b', text)
        if not num_match:
            continue
        number_offset = block.start(1) + num_match.start(1)
        idx = bisect.bisect_right(section_starts, block.end())
        expected_number = idx + 1 if idx < len(section_starts) else None
        comments.append({
            'comment_number': int(num_match.group(1)),
            'expected_number': expected_number,
            'line': line_of(html, block.start()),
            'offset': number_offset,
            'width': len(num_match.group(1)),
        })
    mismatches = [
        c for c in comments
        if c['expected_number'] is not None and c['comment_number'] != c['expected_number']
    ]
    return comments, mismatches


def renumber_slides(html, mismatches):
    """Rewrite drifted 'SLIDE NN' numbers in place. Returns new html."""
    for m in sorted(mismatches, key=lambda c: c['offset'], reverse=True):
        new_text = f"{m['expected_number']:02d}"
        start, end = m['offset'], m['offset'] + m['width']
        html = html[:start] + new_text + html[end:]
    return html


def main():
    parser = argparse.ArgumentParser(
        description='Validate (and optionally renumber) a SyncDeck/Reveal.js presentation.')
    parser.add_argument('source', help='Local file path or dev-server URL')
    parser.add_argument('--renumber', action='store_true',
                         help='Rewrite drifted "SLIDE NN" comment numbers in place (local files only).')
    args = parser.parse_args()

    source = args.source
    try:
        html = load_html(source)
    except Exception as e:
        print(f'ERR Could not load "{source}": {e}', file=sys.stderr)
        sys.exit(1)

    if args.renumber:
        if source.startswith('http://') or source.startswith('https://'):
            print('ERR --renumber requires a local file path, not a URL.', file=sys.stderr)
            sys.exit(1)
        _, mismatches = check_slide_numbering(html)
        if not mismatches:
            print('OK  Slide comment numbering already correct. Nothing to renumber.')
            sys.exit(0)
        for m in sorted(mismatches, key=lambda c: c['offset']):
            print(f"Renumbering line {m['line']}: SLIDE {m['comment_number']:02d} -> SLIDE {m['expected_number']:02d}")
        with open(source, 'w', encoding='utf-8') as f:
            f.write(renumber_slides(html, mismatches))
        print(f'Renumbered {len(mismatches)} slide comment(s) in {source}.')
        sys.exit(0)

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

    # ── Slide comment numbering ────────────────────────────────────────
    comments, mismatches = check_slide_numbering(html)
    if comments:
        if mismatches:
            for m in mismatches:
                errors.append(
                    f"Slide comment numbering: line {m['line']} says SLIDE {m['comment_number']:02d} "
                    f"but its <section> is actually slide {m['expected_number']} in document order "
                    f"(run with --renumber to fix)"
                )
        else:
            print(f'OK  Slide comment numbering ({len(comments)} comments)')

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
