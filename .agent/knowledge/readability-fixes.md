# Readability Fixes That Worked

These came out of the size, contrast, and fit work (issue #11). They aren't
rules, but they fix the problems that come up most often when a slide fails
`audit.py` or looks wrong in a screenshot.

- **Dimming:** never dim code with `opacity`. It multiplies already-dim
  tokens (comments, line numbers) below 4.5:1. Give not-yet-run trace lines
  one uniform `--text-dim` color, and keep completed lines at about 0.8
  opacity at most. Use `--text-dim` only for intentionally dimmed text, never
  for labels, captions, console output, or side notes; those need 7:1.
- **Tinted backgrounds:** check muted text against the darkest tinted callout
  the theme uses, not just `--bg-card`.
- **Code cards:** set `flex-shrink: 0` on code cards inside flex columns, or
  they clip their last line silently. When 24px code runs out of height,
  prefer K&R braces over Allman, and size console cards to their longest
  line instead of a fixed width.
- **Splits:** give the wider column to whatever actually needs width (a
  schematic or code, rarely calculation steps). With larger text, widen the
  text side of a `.split-40` (e.g. `1.35fr 1fr`) and cap image heights. On
  trace slides, putting the code on the right at full height with the console
  under the explanation usually fits.
- **Content below a split:** a callout placed after a `.split` can overlap
  it. Move it into the column with spare room, or set the split to
  `flex: 0 0 auto` so the new row gets its own space.
- **Fragment order:** unindexed fragments come after all indexed ones. After
  moving fragments between columns, check the reveal order, and give every
  fragment on the slide an explicit `data-fragment-index` if needed (or swap
  the columns so they read left first).
- **Splitting and shortening:** split slides that cover two ideas (two `<h2>`s
  is a strong sign) and run `validate-deck.py --renumber` afterward.
  Tightening wording is a legitimate fix before any layout change.
- **Diagrams:** redraw low-resolution raster diagrams with CSS-positioned
  labels as inline SVG with labels at ≥22px rendered. If labels collide,
  give the diagram more room; enlarging it alone doesn't help. Crop the
  blank margins of any raster image you keep so it can render larger.
- **MCQ options:** flex-layout options split text around inline code into
  separate columns. Use block layout with a hanging indent instead.
- **Interactive widgets that jump:** reserve space instead of toggling it
  (`visibility: hidden`, not `display: none`), give feedback boxes a fixed
  height sized for the longest message (computed from the data for
  randomized widgets), give status chips a `min-width` in `ch`, use
  `table-layout: fixed` for logs whose cells fill in, top-align columns that
  change height (`align-items: start`), and set `min-height` on
  variable-length prompts to exactly lines × line-height. Panels with
  `overflow: auto` hide content on a projector; use an accordion or pager
  instead (see the "Accordion variant" in the activities index). Put feedback
  beside its button in a flex row rather than under an absolutely positioned
  button.
- **`text-indent` is inherited:** a hanging indent shifts every inline-block
  inside it. Reset it on children (`.x * { text-indent: 0; }`).
