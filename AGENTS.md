# AGENTS.md

This repository contains HTML slide presentations built with **Reveal.js**, published via GitHub Pages. Shared runtime/plugin code is consumed from the `SyncDeck-Reveal` git submodule at `vendor/SyncDeck-Reveal/js/`.

## Runtime Source

- Shared runtime source: `vendor/SyncDeck-Reveal/js/` git submodule.
- CI readiness: `.github/workflows/static.yml` is configured with `submodules: recursive` so Pages deployments include submodule contents.
- Local submodule workflow: for local testing, edit files directly in `vendor/SyncDeck-Reveal/js/`; the parent repo will use those working-tree changes immediately.
- Detached HEAD warning: submodules are often checked out at a raw commit hash, which makes local commits easy to lose track of. Before committing inside the submodule, create or switch to a branch, e.g. `git -C vendor/SyncDeck-Reveal/js switch -c fix/my-bug`.
- Commit model: commit and push code changes from inside the submodule repo first, then commit the updated submodule pointer in the parent repo with `git add vendor/SyncDeck-Reveal/js`.

## Shared Plugins

Both plugins are plain IIFE scripts — no build step, no npm. Reference them with a `<script>` tag relative to the presentation file (for decks inside a subdirectory, use `../vendor/SyncDeck-Reveal/js/...`).

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

### `vendor/SyncDeck-Reveal/js/chalkboard/chalkboard.js`

Vendored and extended copy of the [reveal.js-plugins chalkboard](https://github.com/rajgoel/reveal.js-plugins/tree/master/chalkboard). **Do not replace with a CDN link** — the local copy has two additions required for iframe sync:

**Key constraint — do not set `storage`:** the plugin's built-in `sessionStorage` persistence is intentionally disabled. The **host page** is the source of truth for drawing state (snapshot + delta buffer). Do not add `chalkboard: { storage: '...' }` to `Reveal.initialize()` — doing so would cause the local in-memory state and the host's buffer to diverge after a reload.

**Student canvas is read-only:** when the plugin receives `setRole: student` it calls `RevealChalkboard.configure({ readOnly: true })` automatically via `reveal-iframe-sync.js`. No manual config needed.

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

---

### `vendor/SyncDeck-Reveal/js/reveal-iframe-sync.js`

Registers a Reveal.js **plugin** (`RevealIframeSync`) that syncs navigation and state between an instructor page and one or more student iframes via `window.postMessage`.

**Register as a Reveal plugin:**
```js
Reveal.initialize({
    plugins: [RevealIframeSync],
    iframeSync: {
        deckId: 'my-deck',
        hostOrigin: '*',
        allowedOrigins: ['*'],
    }
});
```

> **Role lifecycle:** the plugin always initialises as `'standalone'` regardless of any `role` config field. The host must explicitly promote the iframe via a `setRole` command (`instructor` or `student`). This prevents boundary controls from appearing in direct-browser or VS Code preview contexts.


**Supported commands (host → iframe):** `next`, `prev`, `slide`, `setState`, `togglePause`, `pause`, `resume`, `setRole`, `allowStudentForwardTo`, `setStudentBoundary`, `toggleOverview`, `showOverview`, `hideOverview`, `chalkboardCall`, `toggleChalkboard`, `toggleNotesCanvas`, `clearChalkboard`, `resetChalkboard`, `chalkboardStroke`, `chalkboardState`, `requestChalkboardState`, `ping`

Full message schema: `vendor/SyncDeck-Reveal/js/reveal-iframe-sync-message-schema.md`

**Vertical stack pattern:** a vertical Reveal stack can be used as a student-controlled series once the instructor reaches that horizontal position. Treat vertical stacks as the planned release mechanism, and use storyboard boundary controls as the ad hoc release mechanism. The host/plugin should treat the stack as a bounded local-navigation region rather than unlocking the whole deck. When YouTube slides appear inside such a stack, local student playback control may be enabled if the stack/slide config allows it; student audio mode should still be honored unless the instructor changes it from the host toolbar. The storyboard should highlight the full released region and represent vertical stacks with clear grouping rather than a flat list of indistinguishable thumbnails.

---

## Adding a New Presentation

1. Create `<topic>/presentation-name.html` (subdirectory keeps the repo organised).
2. **Check for a shared `theme.css` in the same folder.** If one exists, link it instead of writing a new `<style>` block:
   ```html
   <link rel="stylesheet" href="theme.css">
   ```
   Only add a `<style>` block after that link for styles that are specific to this presentation. If no `theme.css` exists and the new deck needs its own theme, consider extracting it to a `theme.css` so future decks in the same folder can share it.
3. Load the shared plugins with relative paths:
   - For decks in subdirectories: `../vendor/SyncDeck-Reveal/js/...`
   - For root-level decks: `vendor/SyncDeck-Reveal/js/...`
   ```html
   <link rel="stylesheet" href="../vendor/SyncDeck-Reveal/js/chalkboard/chalkboard.css">
   <script src="https://unpkg.com/reveal.js@5/dist/reveal.js"></script>
   <script src="../vendor/SyncDeck-Reveal/js/chalkboard/chalkboard.js"></script>
   <script src="../vendor/SyncDeck-Reveal/js/reveal-storyboard.js"></script>
   <script src="../vendor/SyncDeck-Reveal/js/reveal-iframe-sync.js"></script>
   <script src="../vendor/SyncDeck-Reveal/js/syncdeck-bootstrap.js"></script>
   ```
   All shared plugins are required for every deck. Use `initSyncDeckReveal(...)` from `syncdeck-bootstrap.js` instead of writing `Reveal.initialize(...)` inline. Use a unique `deckId` derived from the presentation filename (kebab-case). `RevealNotes` is optional and auto-included only when notes.js is loaded. **Do not** add a `chalkboard.storage` value — the host manages drawing state.
   ```js
   initSyncDeckReveal({
       deckId: 'your-deck-name', // kebab-case, unique per deck
       iframeSyncOverrides: {
           // Optional per-deck iframeSync overrides
       },
       revealOverrides: {
           // Optional per-deck Reveal overrides
       },
       chalkboardOverrides: {
           // Optional per-deck chalkboard overrides (no storage)
       },
       storyboard: {
           // Optional: storyboardId / trackId / toggleKey
       },
       afterInit: function (Reveal) {
           // Optional deck-specific hooks/listeners
       },
   });
   ```
4. Follow the architecture in `.claude/skills/frontend-slides/SKILL.md` — in particular:
   - Apply theme colors with explicit CSS rules on `.reveal-viewport`, `.reveal`, `.reveal h1-h6`, etc. — **not** `--r-*` CSS variables (those only work with Reveal's bundled theme files)
   - Use **`px`** for all font sizes and spacing in CSS custom properties (not `em`/`clamp`/`vw`) — Reveal scales the canvas via CSS transform; `em` values double-scale
   - Never set `position` on `.reveal .slides > section` — Reveal needs `position: absolute` there for fade transitions; put padding/centering in a `.slide-inner` div inside each section instead
5. Check the style tokens for the chosen preset in `.claude/skills/frontend-slides/STYLE_PRESETS.md`.

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
| No `chalkboard.storage` | The vendored chalkboard plugin does not write to `sessionStorage`. The host page is the source of truth (snapshot + delta buffer). Setting `storage` would cause divergence on reload. |
| Role starts as `standalone` | `reveal-iframe-sync.js` always initialises in `standalone` mode. The host must send `setRole` to promote to `instructor` or `student`. Never rely on the `role` config field. |
