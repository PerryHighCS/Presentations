# AGENTS.md

This repository contains HTML slide presentations built with **Reveal.js**, published via GitHub Pages. Two shared JavaScript plugins in `js/` extend every deck with a slide-preview storyboard and iframe-based instructor/student synchronization.

---

## Repository Layout

```
Presentations/
├── js/
│   ├── reveal-storyboard.js       # Toggleable slide-preview strip (bottom panel)
│   ├── reveal-iframe-sync.js      # Instructor/student sync via postMessage
│   └── chalkboard/
│       ├── chalkboard.js          # Vendored reveal.js-plugins chalkboard (extended)
│       ├── chalkboard.css         # Chalkboard styles
│       └── img/                   # Cursor and background images for chalkboard
│
├── CSA/
│   └── 2d-arrays.html             # Computer Science A — 2D Arrays (Java)
│
├── index.html                     # GitHub Pages landing page (auto-generated)
│
└── .claude/
    ├── reveal-iframe-sync-message-schema.md   # Full postMessage protocol reference
    └── skills/
        └── frontend-slides/
            ├── SKILL.md           # How to generate new presentations
            └── STYLE_PRESETS.md   # Visual style reference (colors, fonts, tokens)
```

---

## Shared Plugins

Both plugins are plain IIFE scripts — no build step, no npm. Reference them with a `<script>` tag relative to the presentation file (e.g. `../js/reveal-storyboard.js` for decks inside a subdirectory).

### `js/reveal-storyboard.js`

Adds a **slide-preview strip** that slides up from the bottom of the screen. Hidden by default; toggle with the `M` key (configurable).

**Features:**
- Thumbnail previews built from cloned `<section>` nodes (design styles preserved)
- Click-to-navigate and active-slide highlight
- Aware of `RevealIframeSyncAPI` — hides locked slides for student role
- Responds to `reveal-storyboard-toggle` and `reveal-storyboard-set` DOM events (see below)

**Required HTML inside the presentation:**
```html
<div id="storyboard" class="storyboard" aria-hidden="true">
    <div id="storyboard-track" class="storyboard-track"></div>
</div>
```

**Initialise after `Reveal.initialize()`:**
```js
if (window.initRevealStoryboard) {
    window.initRevealStoryboard({
        reveal: Reveal,
        storyboardId: 'storyboard',
        trackId: 'storyboard-track',
        toggleKey: 'm',
    });
}
```

**DOM events (dispatched on `window`):**

| Event | Detail | Effect |
|-------|--------|--------|
| `reveal-storyboard-toggle` | — | Toggle open/closed |
| `reveal-storyboard-set` | `{ open: true\|false }` | Explicitly show or hide |

These events are the integration point for `reveal-iframe-sync.js` and any container-page UI.

---

### `js/reveal-iframe-sync.js`

Registers a Reveal.js **plugin** (`RevealIframeSync`) that syncs navigation and state between an instructor page and one or more student iframes via `window.postMessage`.

**Roles:**
- `instructor` — publishes deck state changes to the parent page
- `student` — receives commands from the parent; can be restricted from navigating past the instructor's current position

**Register as a Reveal plugin:**
```js
Reveal.initialize({
    plugins: [RevealIframeSync],
    iframeSync: {
        role: 'instructor',   // or 'student'
        deckId: 'my-deck',
        hostOrigin: '*',
        allowedOrigins: ['*'],
    }
});
```

**Overview / storyboard routing:**
Reveal.js's built-in grid overview (`O` key) is intentionally **not** propagated to students as a native Reveal overview. Instead, `overview: true/false` in any `setState` command is stripped from the Reveal state and converted to `reveal-storyboard-set` DOM events — so the custom storyboard strip appears on the student side rather than Reveal's grid.

The container site can also trigger the storyboard directly by sending a command:
```js
// From the container/host page
iframe.contentWindow.postMessage({
    type: 'reveal-sync',
    action: 'command',
    payload: { name: 'toggleOverview' }   // or showOverview / hideOverview
}, '*');
```

**Supported commands (host → iframe):** `next`, `prev`, `slide`, `setState`, `togglePause`, `pause`, `resume`, `setRole`, `allowStudentForwardTo`, `setStudentBoundary`, `toggleOverview`, `showOverview`, `hideOverview`, `chalkboardCall`, `toggleChalkboard`, `toggleNotesCanvas`, `clearChalkboard`, `resetChalkboard`, `chalkboardStroke`, `chalkboardState`, `requestChalkboardState`, `ping`

Full message schema: `.claude/reveal-iframe-sync-message-schema.md`

---

## Adding a New Presentation

1. Create `<topic>/presentation-name.html` (subdirectory keeps the repo organised).
2. Load the shared plugins with relative paths:
   ```html
   <link rel="stylesheet" href="../js/chalkboard/chalkboard.css">
   <script src="../js/chalkboard/chalkboard.js"></script>
   <script src="../js/reveal-storyboard.js"></script>
   <script src="../js/reveal-iframe-sync.js"></script>  <!-- only if needed -->
   ```
3. Follow the architecture in `.claude/skills/frontend-slides/SKILL.md` — in particular:
   - Apply theme colors with explicit CSS rules on `.reveal-viewport`, `.reveal`, `.reveal h1-h6`, etc. — **not** `--r-*` CSS variables (those only work with Reveal's bundled theme files)
   - Use **`px`** for all font sizes and spacing in CSS custom properties (not `em`/`clamp`/`vw`) — Reveal scales the canvas via CSS transform; `em` values double-scale
   - Never set `position` on `.reveal .slides > section` — Reveal needs `position: absolute` there for fade transitions; put padding/centering in a `.slide-inner` div inside each section instead
4. Check the style tokens for the chosen preset in `.claude/skills/frontend-slides/STYLE_PRESETS.md`.

---

## Key Architecture Notes

| Rule | Why |
|------|-----|
| `px` for all font/spacing tokens | Reveal scales slides via `transform: scale()`. `em` values also respond to Reveal's JS-computed base font-size (~28 px at 720 px viewport height), causing double-shrinking. `px` bypasses this. |
| No `position` on `<section>` | Reveal sets `position: absolute` on sections to layer and fade them. Overriding with `position: relative` makes every slide after the first appear blank. |
| Explicit CSS rules, not `--r-*` | `--r-background-color` etc. are only consumed by Reveal's bundled CSS theme files. Without one, those variables are ignored. |
| `max-height: none` on `pre code` | Reveal's base CSS caps code blocks at 400 px. |
| `box-shadow: none; width: auto` on `pre` | Reveal's base CSS adds a drop shadow and forces `width: 90%`. |
| Overview → storyboard | `overview: true` in any synced state is intercepted and routed to `reveal-storyboard-set` rather than `deck.setState()`, so students see the custom strip, not Reveal's grid. |
