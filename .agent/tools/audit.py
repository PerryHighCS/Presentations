"""Audit deck slides for overflow, overlapping text, and text below the size floors.

Usage:
  python .agent/tools/audit.py <deck> [<slide> ...] [--port N]

With no slide numbers, every slide is checked. Each slide is shown with all
fragments revealed. Checks, in 1600x900 canvas coordinates:

  OVERFLOW  a visible element extends past the canvas edge
  OVERLAP   two separate text blocks (or a text block and an image) intersect
  SIZE      text below the AGENTS.md floors: under 22px (under 24px for code)
            fails; 22-29px inside a paragraph or list item is flagged for a
            role check, since body text should be 30px. Sub/superscripts are
            measured against 75% of their parent. .slide-tag eyebrows and the
            slide counter are exempt.

The audit only measures; it cannot judge layout. Always look at screenshots
(shots.py) of every slide you change, and click through interactive widgets.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from deck_page import goto_slide, open_deck, slide_count  # noqa: E402

AUDIT_JS = r"""
() => {
  const slide = Reveal.getCurrentSlide();
  // The current <section> spans the whole scaled WxH canvas, so measure from it.
  // (Don't use document.querySelector('.reveal'): the storyboard holds cloned
  // thumbnail decks that can match first.)
  const box = slide.getBoundingClientRect();
  const scale = Reveal.getScale();
  const W = Reveal.getConfig().width, H = Reveal.getConfig().height;
  const ox = box.left, oy = box.top;
  const canvas = r => ({
    l: (r.left - ox) / scale, t: (r.top - oy) / scale,
    r: (r.right - ox) / scale, b: (r.bottom - oy) / scale,
  });
  const visible = e => {
    if (e.closest('aside.notes, #storyboard, .slide-number')) return false;
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    let o = 1;
    for (let a = e; a && a !== document.body; a = a.parentElement) o *= parseFloat(getComputedStyle(a).opacity);
    if (o < 0.15) return false;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const label = e => {
    const t = (e.textContent || e.getAttribute('alt') || '').trim().replace(/\s+/g, ' ');
    const cls = typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0] : '';
    return e.tagName.toLowerCase() + cls + ' "' + t.slice(0, 50) + '"';
  };
  const out = { overflow: [], overlap: [], size: [] };

  // Elements that own text directly
  const textEls = [...slide.querySelectorAll('*')].filter(e =>
    [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && visible(e));

  // OVERFLOW
  for (const e of [...textEls, ...slide.querySelectorAll('img, svg, table, button')]) {
    if (!visible(e) || e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
    const c = canvas(e.getBoundingClientRect());
    if (c.b > H + 0.5 || c.r > W + 0.5 || c.l < -0.5 || c.t < -0.5) {
      out.overflow.push(label(e) + ' at [' + [c.l, c.t, c.r, c.b].map(Math.round) + ']');
    }
  }

  // SIZE
  for (const e of textEls) {
    if (e.closest('.slide-tag')) continue;
    const cs = getComputedStyle(e);
    let px = parseFloat(cs.fontSize);
    const svg = e.closest('svg');
    if (svg && e.getScreenCTM) {
      const m = e.getScreenCTM();
      px = px * Math.hypot(m.a, m.b) / scale;
    }
    const isCode = !!e.closest('pre, code, [class*="code"], [class*="formula"], [class*="tok"]');
    const subsup = e.closest('sub, sup');
    let floor = isCode ? 24 : 22;
    if (subsup && subsup.parentElement) floor = Math.min(floor, parseFloat(getComputedStyle(subsup.parentElement).fontSize) * 0.75);
    const where = svg ? ' (svg)' : '';
    if (px < floor - 0.5) {
      out.size.push('FAIL ' + px.toFixed(1) + 'px' + where + ' ' + label(e));
    } else if (!isCode && !subsup && !svg && px < 29.5 && e.closest('p, li') &&
               !e.closest('[class*="-num"], [class*="-tag"], [class*="-label"], [class*="badge"], [class*="chip"]')) {
      out.size.push('CHECK ' + px.toFixed(1) + 'px body text? ' + label(e));
    }
  }

  // OVERLAP: text blocks and images that intersect without nesting
  const blocks = [...textEls.filter(e => !e.closest('svg')), ...[...slide.querySelectorAll('img')].filter(visible)];
  const boxes = blocks.map(e => {
    const rs = [...e.getClientRects()];
    return { e, rs: rs.length ? rs : [e.getBoundingClientRect()] };
  });
  const hit = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 4 &&
                        Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const A = boxes[i], B = boxes[j];
      if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
      if (A.rs.some(a => B.rs.some(b => hit(a, b)))) out.overlap.push(label(A.e) + '  x  ' + label(B.e));
    }
  }
  return out;
}
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('deck')
    ap.add_argument('slides', nargs='*', type=int)
    ap.add_argument('--port', type=int, default=4173)
    args = ap.parse_args()

    problems = 0
    with open_deck(args.deck, args.port) as page:
        nums = args.slides or range(1, slide_count(page) + 1)
        for n in nums:
            goto_slide(page, n)
            res = page.evaluate(AUDIT_JS)
            lines = (['OVERFLOW ' + x for x in res['overflow']] +
                     ['OVERLAP  ' + x for x in res['overlap']] +
                     ['SIZE     ' + x for x in res['size']])
            if lines:
                print('Slide %d' % n)
                for line in lines:
                    print('  ' + line)
                problems += sum(1 for l in lines if not l.startswith('SIZE     CHECK'))
        for e in page.errors:
            print('page error:', e)
    print('%d problem(s) (CHECK lines need a human role check and are not counted)' % problems)
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
