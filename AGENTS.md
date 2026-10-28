# AGENTS.md

This repository contains HTML slide presentations built with **Reveal.js**, published via GitHub Pages. Shared runtime/plugin code is consumed from the `SyncDeck-Reveal` git submodule at `vendor/SyncDeck-Reveal/`.

Presentation source folders live under `Decks/`, while deployment remaps
their contents to the site root. For example, `Decks/AR1/...` is published as
`/AR1/...`.

## Guides for Specific Work

Read these when the work calls for them; they are not needed for every deck.

| Guide | Read it when |
|---|---|
| `.agent/knowledge/html5-activities-index.md` | a deck needs a custom interactive widget (see "Reusable Activity Index" below) |
| `.agent/knowledge/troubleshooting-activities.md` | planning an activity where students find a hidden fault from evidence |
| `.agent/knowledge/code-tracing.md` | authoring or editing a `data-fragment-trace` code trace |
| `.agent/knowledge/readability-fixes.md` | a slide fails `audit.py` or looks wrong in a screenshot |
| `.agent/knowledge/permalinks-and-projects.md` | adding, moving, or renaming a deck, or working on a repo-wide cleanup project |
| `.agent/knowledge/syncdeck-runtime.md` | working in the `vendor/SyncDeck-Reveal/` submodule, or on storyboard, chalkboard, or iframe sync behavior |
| `.agent/knowledge/agent-skills-subtree.md` | editing anything under `.agent/skills/vendor/syncdeck/` (a git subtree with its own push and pull steps) |

## Adding a New Presentation

1. Create `Decks/<topic>/<subfolder>/presentation-name.html` (subdirectory keeps the repo organised).
2. **Check for a shared `theme.css` in the same folder.** If one exists, link it instead of writing a new `<style>` block:
   ```html
   <link rel="stylesheet" href="theme.css">
   ```
   Only add a `<style>` block after that link for styles that are specific to this presentation. If no `theme.css` exists and the new deck needs its own theme, consider extracting it to a `theme.css` so future decks in the same folder can share it.
   Check the parent folder heirarchy for a `theme.css` and place a new `theme.css` at the highest place
   in the heirarchy that makes sense (e.g. the course level).
   Load every font the theme or deck names. A shared `theme.css` should `@import` its own Google Fonts
   URL at the top, so each deck that links it gets the fonts; a font that is named but never loaded
   silently falls back to whatever the viewer has installed. `node scripts/check-fonts.mjs` (run in CI)
   fails on any deck that uses a font it doesn't load.
3. Load the bundled runtime with a relative path from the deck's published location (`Decks/` is
   remapped to the site root). For the current `Decks/<course>/<unit>/deck.html` layout, use
   `../../runtime/`:
   ```html
   <link rel="stylesheet" href="../../runtime/syncdeck-reveal/dist/syncdeck-reveal.css">
   <script src="../../runtime/syncdeck-reveal/dist/syncdeck-reveal.js"></script>
   ```
   Every deck also needs the storyboard markup inside `<body>`:
   ```html
   <div id="storyboard" class="storyboard" aria-hidden="true">
       <div id="storyboard-track" class="storyboard-track"></div>
   </div>
   ```
   Initialize with `initSyncDeckReveal(...)`, never an inline `Reveal.initialize(...)`, using the
   standard block in `.agent/skills/syncdeck-local.md` (section 5, with `standaloneHosting` and
   `revealOverrides`). Use a unique `deckId` derived from the presentation filename (kebab-case).
   Optional keys are `iframeSyncOverrides`, `chalkboardOverrides`, `storyboard` (`storyboardId`,
   `trackId`, `toggleKey`), and `afterInit: function (Reveal) { ... }` for deck-specific hooks such
   as starting a simulator loop. The bundle provides `Reveal`, `RevealNotes`, `RevealChalkboard`,
   `RevealIframeSync`, `initRevealStoryboard`, and `initSyncDeckReveal`.
   **Do not** add a `chalkboard.storage` value; the host manages drawing state.
4. Follow the architecture in `.agent/skills/vendor/syncdeck/SKILL.md` and the repo-specific overrides in `.agent/skills/syncdeck-local.md`. In particular:
   - Apply theme colors with explicit CSS rules on `.reveal-viewport`, `.reveal`, `.reveal h1-h6`, etc., **not** `--r-*` CSS variables (those only work with Reveal's bundled theme files)
   - Use **`px`** for all font sizes and spacing in CSS custom properties (not `em`/`clamp`/`vw`); Reveal scales the canvas via CSS transform, so `em` values double-scale
   - Never set `position` on `.reveal .slides > section`; Reveal needs `position: absolute` there for fade transitions, so put padding/centering in a `.slide-inner` div inside each section instead
5. Check the style tokens for the chosen preset in `.agent/skills/STYLE_PRESETS_EXTENDED.md` (full library) or `.agent/skills/vendor/syncdeck/references/STYLE_PRESETS.md` (short reference).
6. If the deck needs a custom interactive widget (drag-and-drop, a classification/matching exercise, a code trace, a timed prompt game, a scored scenario, etc.), check `.agent/knowledge/html5-activities-index.md` first for an existing engine to copy and re-skin before building one from scratch.
7. Run `node scripts/generate-permalink.mjs Decks/<path>/<deck>.html` to give the new deck a stable
   permalink before committing, then mark it done for the projects in `config/projects.json` it
   already meets with `node scripts/project-status.mjs mark <id> Decks/<path>/<deck>.html`. Never
   hand-edit the `syncdeck-permalink` or `syncdeck-projects` meta tags or `config/permalinks.json`;
   CI checks both. Details: `.agent/knowledge/permalinks-and-projects.md`.
8. Run `python3 .agent/skills/vendor/syncdeck/scripts/validate-deck.py Decks/<path>/<deck>.html`
   before considering the deck done, and again after any edit that touches activity JSON or slide
   order. It checks two things:
   - Every `data-activity-options` block (resonance, mobcode, postboard, etc.) must parse. A raw
     `'` in Python source or FRQ/MCQ text silently breaks the `data-activity-options='...'`
     attribute, so write every apostrophe or single quote as `&#39;`; mobcode Python string
     literals should otherwise prefer double quotes.
   - Every `<!-- SLIDE NN · ... -->` comment must match the flattened document-order position of
     the `<section>` it precedes, which is what Reveal's `slideNumber: 'c/t'` displays (vertical
     stack children count as later slides in that order). After inserting or deleting a slide,
     run the validator with `--renumber` instead of renumbering by hand.
9. Give every Resonance question a `responseTimeLimitMs` unless the user explicitly asks for an
   untimed question.
10. Put embedded activities (`data-activity-id`, e.g. Resonance) only on dedicated question
   slides whose content is just the prompt and its options. A running activity covers the slide
   for students, so never attach one to a teaching or worked-example slide (fragments, figures,
   explanations) that students still need to see. If a content slide needs a check-in question,
   give the question its own slide right after it.
11. **Vary the position of the correct answer** in every multiple-choice question (Resonance
   `options` arrays, fallback `.mcq-opts` lists, and any printed answer choices). Never leave the
   correct option first by default; across a deck's questions the correct answers must land in
   varied, unpredictable positions (A, B, C, D), so students cannot learn a pattern. Keep option
   `id`s in display order (`q1a`, `q1b`, ...) after reordering, and refer to answers by content,
   not letter, in speaker notes. When editing an existing deck, check its MCQs for this and fix
   any where the correct answers share a position.

## Reusable Activity Index

`.agent/knowledge/html5-activities-index.md` (symlinked from `.claude/knowledge/`) catalogs the
substantial, reusable custom HTML5 activities/widgets already built inline into decks. This
index must stay current: whenever you add a new substantial interactive widget, or materially
redesign an existing one's mechanism, update the index in the same change, whether that work
happens on a brand-new deck or an edit to an existing one. Don't wait to be asked. A one-off
trivial fragment reveal doesn't need an entry; a distinct, reusable interaction mechanism does.

## Key Architecture Notes

| Rule | Why |
|------|-----|
| `px` for all font/spacing tokens | Reveal scales slides via `transform: scale()`. `em` values also respond to Reveal's JS-computed base font-size (~28 px at 720 px viewport height), causing double-shrinking. `px` bypasses this. |
| Contrast of at least 7:1 | Per WCAG guidelines, ensure sufficient contrast for all readers. Text that is intentionally de-emphasized (not-yet-run lines in a code trace, completed steps, dimmed hints) may drop to 4.5:1 so it still reads as dimmer, but never lower. |
| Text at least 30px; captions/labels at least 22px; code at least 24px | On the 1600×900 canvas, 30px matches 18pt on a widescreen PowerPoint slide, the usual floor for projected text. 30px applies to body copy, card text, questions, and steps; 22px to captions, figure labels, and chips; 24px to code blocks and inline code. Subscripts and superscripts may render at 75% of their surrounding text. Small eyebrow `.slide-tag`s and the slide counter are exempt. After enlarging anything, check every slide still fits the canvas: fix overflow by tightening spacing, resizing images, rebalancing columns, or splitting the slide, never by shrinking text back below the floor. |
| No `position` on `<section>` | Reveal sets `position: absolute` on sections to layer and fade them. Overriding with `position: relative` makes every slide after the first appear blank. |
| Explicit CSS rules, not `--r-*` | `--r-background-color` etc. are only consumed by Reveal's bundled CSS theme files. Without one, those variables are ignored. |
| `max-height: none` on `pre code` | Reveal's base CSS caps code blocks at 400 px. |
| `box-shadow: none; width: auto` on `pre` | Reveal's base CSS adds a drop shadow and forces `width: 90%`. |
| Overview → storyboard | `overview: true` in any synced state is intercepted and routed to `reveal-storyboard-set` rather than `deck.setState()`, so students see the custom strip, not Reveal's grid. |
| No `chalkboard.storage` | The vendored chalkboard plugin does not write to `sessionStorage`. The host page is the source of truth (snapshot + delta buffer). Setting `storage` would cause divergence on reload. |
| Role starts as `standalone` | `reveal-iframe-sync.js` always initialises in `standalone` mode. The host must send `setRole` to promote to `instructor` or `student`. Never rely on the `role` config field. |
| Load every font you name | A font that is named in `font-family` but never loaded falls back to the viewer's installed fonts, so text widths, wrapping, and overflow differ from machine to machine, and a slide that fits on one screen spills over on another. `scripts/check-fonts.mjs` (CI) checks the first family of every declaration against Google Fonts links/imports, `@font-face`, and a short list of fonts every OS ships. |
| Never hand-edit `syncdeck-permalink` meta tag or `config/permalinks.json` | The hash is generated once by `scripts/generate-permalink.mjs` and must stay stable across moves/renames. CI (`--check`) fails if a deck's tag and the manifest disagree. |

## Writing Style

- **No em dashes (—).** Always substitute context-appropriate punctuation: colon for introductory/defining clauses, comma for parenthetical asides or conjunctions, semicolon for contrasting independent clauses, period for abrupt follow-up sentences.
- **Sentences not fragments.** Avoid telegraphic style; write in full sentences for clarity and professionalism. Students may miss class and need to read the slides independently, so they should be as self-contained and clear as possible. Sentences and short paragraphs  improve readability and break up large blocks of text.
- **Inline color emphasis over bullets.** Prefer prose sentences with key terms highlighted via a theme color span (e.g. `<span style="color:var(--phosphor);">`) over bullet lists. Check the deck's theme for available color tokens before writing spans. Color-pop the term or phrase that carries the weight of the sentence, not the whole sentence. Use `.bullets` lists only when the items are genuinely enumerable and parallel; otherwise, fold the ideas into sentences and let inline emphasis do the work of drawing the eye. Keep color usage semantically consistent within a deck: if one color is used for a concept (e.g. a keyword, a class name, an action), use that same color for the same concept throughout the presentation.
- **Interactivity**: use Reveal's built-in interactivity features (fragments, nested sections, etc.) to pace the information flow and keep students engaged. Avoid overwhelming slides with too much information at once. Use syncdeck's embedded activities to encourage active learning and exploration. Embedded activities hide the slide content while they run, so give each one its own question slide (see step 10 above).
- **No clever paired-phrase slide titles.** Avoid the "X, Y" cutesy-contrast construction (e.g. "Three Stages, One Habit", "One STEP Bus, Not Four NOTs"). Prefer a direct, descriptive title that plainly states what the slide is about (e.g. "The Build Process", "The STEP Bus").
- **Troubleshooting activities where they fit.** When a topic has a "something is wrong, find out
  what" angle (a bug, a faulty circuit, a failing setup), prefer an activity where students find
  a hidden fault from evidence over another observe-and-explain simulator. Build it to the
  principles in `.agent/knowledge/troubleshooting-activities.md`.

## Code Tracing

On `data-fragment-trace` slides the highlighted "current" line is always the **next line about to
execute**, not the line that just ran; a line's effects appear one step later. The full convention,
including crashing lines, is in `.agent/knowledge/code-tracing.md`.

## Local Preview

- Use `npm run dev` from the repo root for day-to-day presentation authoring.
- The dev server serves the deployed site layout directly from source mounts:
  `Decks/AR1 -> /AR1`, `Decks/CSA -> /CSA`, and
  `vendor/SyncDeck-Reveal -> /runtime/syncdeck-reveal`.
- Refresh the browser after edits; no separate staging step is needed for
  normal deck work.
- Do not kill a running dev server unless requested.

## Documents (Markdown Pages)

Every Markdown file under `Decks/` is published as a document page, such as a lesson plan:
`plan.md` becomes `plan.html` beside the decks, both at deploy time (`scripts/stage-site.mjs`) and on
request in the dev server, using one shared renderer (`scripts/markdown-pages.mjs`). The index pages
list a folder's documents under "Documents", above its "Slide Decks", without presentation links.
Because of that:

- Markdown under `Decks/` is public. Keep working notes, outlines, and agent plans elsewhere (for
  example `.agent/plans/`), or exclude a file with an `exclude` rule in `.pages-manifest`.
- Separate blocks (paragraphs, lists, code, tables, `---` dividers) with blank lines. Lines without a
  blank line between them merge into one paragraph, and text directly above `---` turns into a
  heading. Start the document with one `#` title. The contents list shows the next two heading
  levels below it (for example each `##` section with its `###` parts listed underneath).
- A document cannot share a name with a deck in the same folder; staging fails if `plan.md` would
  overwrite `plan.html`. `index.md` is reserved too, because `index.html` is each folder's
  generated listing.
- The dev server loads the renderer when it starts, so restart it after changing
  `scripts/markdown-pages.mjs`.

## Agent Tools (Checking Decks in a Browser)

`.agent/tools/` holds Playwright scripts for checking decks against the dev
server. `scripts/` is for the site's build and dev scripts; put reusable agent
tooling in `.agent/tools/` instead of a temp folder, so it survives between
sessions. See `.agent/tools/README.md` for setup (preinstalled in the
devcontainer; a throwaway virtualenv elsewhere) and usage.

- `shots.py <deck> <slide>...` screenshots slides at the 1600×900 canvas with
  fragments revealed. Look at the screenshot of every slide you change.
- `audit.py <deck> [<slide>...]` reports overflow past the canvas, overlapping
  text, and text below the size floors in Key Architecture Notes.
- `deck_page.py` has shared helpers for one-off checks, such as clicking
  through an interactive widget and confirming nothing moves between states.

The audit measures but does not judge. Pair it with screenshots, and for
interactive widgets, drive every state (see "Stability checks" in the README).

When a slide fails the audit or looks wrong, `.agent/knowledge/readability-fixes.md` collects the
fixes that have worked (dimming, splits, code cards, widgets that jump, and more).

## PDF Image Extraction Helper

- Use `scripts/extract-pdf-images.sh` to extract embedded images from each PDF
  into a separate sibling folder named `<pdf-name>_images`.
- Default target folder is the current working directory.
- Optional custom folder usage:
  `scripts/extract-pdf-images.sh Decks/AR1/LockTronics`
- Dependency: `pdfimages` from `poppler-utils`.

## Photos Added to a Deck

Any photo added under a deck's `media/` folder (phone camera photos especially)
**must** have EXIF metadata stripped before it is committed, and should be
downscaled to a reasonable display size at the same time. Camera photos
routinely embed GPS coordinates, device identifiers, and timestamps; this
repo publishes to a public GitHub Pages site, so leaving that metadata in
place leaks real-world location and device data. Re-saving through Pillow
without passing an `exif` argument strips it:

```python
from PIL import Image, ImageOps

im = Image.open(path)
im = ImageOps.exif_transpose(im)  # bake in orientation before stripping EXIF
w, h = im.size
MAX_EDGE = 1600
scale = MAX_EDGE / max(w, h)
if scale < 1:
    im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
im.save(path, format='JPEG', quality=85, optimize=True)
```

Verify the strip worked with `Image.open(path).getexif()` (should be empty)
before considering the photo done.
