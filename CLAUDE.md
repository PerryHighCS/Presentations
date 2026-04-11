# AGENTS.md

This repository contains HTML slide presentations built with **Reveal.js**, published via GitHub Pages. Shared runtime/plugin code is consumed from the `SyncDeck-Reveal` git submodule at `vendor/SyncDeck-Reveal/`.

Presentation source folders now live under `Decks/`, while deployment remaps
their contents to the site root. For example, `Decks/AR1/...` is published as
`/AR1/...`.

## Agent Skills Subtree

The shared SyncDeck agent skill lives at `.agent/skills/vendor/syncdeck/` and is
managed as a **git subtree** (not a submodule) backed by the
`syncdeck-agent-skills` remote.

- **Commit model:** edit files inside `.agent/skills/vendor/syncdeck/` normally
  and commit them to the parent repo as you would any other file. The subtree
  has no separate working tree — changes land directly in the parent history.
- **Push upstream after committing:** after committing changes to the parent
  repo, push them back to the subtree remote:
  ```
  git subtree push --prefix=.agent/skills/vendor/syncdeck syncdeck-agent-skills main
  ```
- **Pull upstream changes:** to incorporate updates published to the subtree
  remote:
  ```
  git subtree pull --prefix=.agent/skills/vendor/syncdeck syncdeck-agent-skills main --squash
  ```
- **Do not** run `git subtree push/pull` until the parent repo commit is in
  place — the subtree commands rewrite history based on the current index.

---

## Runtime Source

- Shared runtime source: `vendor/SyncDeck-Reveal/` git submodule.
- CI readiness: `.github/workflows/static.yml` is configured with `submodules: recursive` so Pages deployments include submodule contents.
- Local submodule workflow: for local testing, edit files directly in `vendor/SyncDeck-Reveal/`; the parent repo will use those working-tree changes immediately.
- Detached HEAD warning: submodules are often checked out at a raw commit hash, which makes local commits easy to lose track of. Before committing inside the submodule, create or switch to a branch, e.g. `git -C vendor/SyncDeck-Reveal switch -c fix/my-bug`.
- Commit model: commit and push code changes from inside the submodule repo first, then commit the updated submodule pointer in the parent repo with `git add vendor/SyncDeck-Reveal`.

## Shared Runtime

Presentations load the bundled public runtime from
`runtime/syncdeck-reveal/dist/` in the published site. The bundler, source
entrypoint, and npm workflow live in `vendor/SyncDeck-Reveal/`; the parent repo
should only reference the built assets through the public runtime path.

**Required HTML inside the presentation:**
```html
<div id="storyboard" class="storyboard" aria-hidden="true">
    <div id="storyboard-track" class="storyboard-track"></div>
</div>
```

**Initialise with the bundled runtime:**

The runtime lives at `/runtime/syncdeck-reveal/` in the published site. Use a
relative path from the deck's published location (eg. `/Decks/CSA/2DArrays/2d-arrays.html` will publish to `/CSA/2DArrays/2d-arrays.html` and use the following):

```html
<link rel="stylesheet" href="../../runtime/syncdeck-reveal/dist/syncdeck-reveal.css">
<script src="../../runtime/syncdeck-reveal/dist/syncdeck-reveal.js"></script>
<script>
initSyncDeckReveal({
    deckId: 'your-deck-name',
});
</script>
```

**DOM events (dispatched on `window`):**

| Event | Detail | Effect |
|-------|--------|--------|
| `reveal-storyboard-toggle` | — | Toggle open/closed |
| `reveal-storyboard-set` | `{ open: true\|false }` | Explicitly show or hide |

These events are the integration point for `reveal-iframe-sync.js` and any container-page UI.

---

### Submodule Internal: `vendor/SyncDeck-Reveal/chalkboard/chalkboard.js`

This section is for contributors working inside the `SyncDeck-Reveal` submodule. Presentations in this repo should continue to load only the bundled `dist/` assets described above.

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

### Submodule Internal: `vendor/SyncDeck-Reveal/reveal-iframe-sync.js`

This section is for contributors working inside the `SyncDeck-Reveal` submodule. Presentations in this repo should continue to load only the bundled `dist/` assets described above.

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

Full message schema: `vendor/SyncDeck-Reveal/reveal-iframe-sync-message-schema.md`

**Vertical stack pattern:** a vertical Reveal stack can be used as a student-controlled series once the instructor reaches that horizontal position. Treat vertical stacks as the planned release mechanism, and use storyboard boundary controls as the ad hoc release mechanism. The host/plugin should treat the stack as a bounded local-navigation region rather than unlocking the whole deck. When YouTube slides appear inside such a stack, local student playback control may be enabled if the stack/slide config allows it; student audio mode should still be honored unless the instructor changes it from the host toolbar. The storyboard should highlight the full released region and represent vertical stacks with clear grouping rather than a flat list of indistinguishable thumbnails.

---

## Adding a New Presentation

1. Create `Decks/<topic>/<subfolder>/presentation-name.html` (subdirectory keeps the repo organised).
2. **Check for a shared `theme.css` in the same folder.** If one exists, link it instead of writing a new `<style>` block:
   ```html
   <link rel="stylesheet" href="theme.css">
   ```
   Only add a `<style>` block after that link for styles that are specific to this presentation. If no `theme.css` exists and the new deck needs its own theme, consider extracting it to a `theme.css` so future decks in the same folder can share it.
3. Load the bundled runtime with a relative path from the deck's published
   location. For the current `Decks/<course>/<unit>/deck.html` layout, use
   `../../runtime/`:
   ```html
   <link rel="stylesheet" href="../../runtime/syncdeck-reveal/dist/syncdeck-reveal.css">
   <script src="../../runtime/syncdeck-reveal/dist/syncdeck-reveal.js"></script>
   ```
   Use `initSyncDeckReveal(...)` from the bundled runtime instead of writing `Reveal.initialize(...)` inline. Use a unique `deckId` derived from the presentation filename (kebab-case). The bundle provides `Reveal`, `RevealNotes`, `RevealChalkboard`, `RevealIframeSync`, `initRevealStoryboard`, and `initSyncDeckReveal`. **Do not** add a `chalkboard.storage` value — the host manages drawing state.
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
4. Follow the architecture in `.agent/skills/vendor/syncdeck/SKILL.md` and the repo-specific overrides in `.agent/skills/syncdeck-local.md` — in particular:
   - Apply theme colors with explicit CSS rules on `.reveal-viewport`, `.reveal`, `.reveal h1-h6`, etc. — **not** `--r-*` CSS variables (those only work with Reveal's bundled theme files)
   - Use **`px`** for all font sizes and spacing in CSS custom properties (not `em`/`clamp`/`vw`) — Reveal scales the canvas via CSS transform; `em` values double-scale
   - Never set `position` on `.reveal .slides > section` — Reveal needs `position: absolute` there for fade transitions; put padding/centering in a `.slide-inner` div inside each section instead
5. Check the style tokens for the chosen preset in `.agent/skills/STYLE_PRESETS_EXTENDED.md` (full library) or `.agent/skills/vendor/syncdeck/references/STYLE_PRESETS.md` (short reference).

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

## Writing Style

- **No em dashes (—).** Always substitute context-appropriate punctuation: colon for introductory/defining clauses, comma for parenthetical asides or conjunctions, semicolon for contrasting independent clauses, period for abrupt follow-up sentences.
- **Sentences not fragments.** Avoid telegraphic style; write in full sentences for clarity and professionalism. Students may miss class and need to read the slides independently, so they should be as self-contained and clear as possible. Sentences and short paragraphs  improve readability and break up large blocks of text.
- **Inline color emphasis over bullets.** Prefer prose sentences with key terms highlighted via a theme color span (e.g. `<span style="color:var(--phosphor);">`) over bullet lists. Check the deck's theme for available color tokens before writing spans. Color-pop the term or phrase that carries the weight of the sentence, not the whole sentence. Use `.bullets` lists only when the items are genuinely enumerable and parallel; otherwise, fold the ideas into sentences and let inline emphasis do the work of drawing the eye. Keep color usage semantically consistent within a deck: if one color is used for a concept (e.g. a keyword, a class name, an action), use that same color for the same concept throughout the presentation.
- **Interactivity**: use Reveal's built-in interactivity features (fragments, nested sections, etc.) to pace the information flow and keep students engaged. Avoid overwhelming slides with too much information at once. Use syncdeck's embedded activities to encourage active learning and exploration.

## Local Preview

- Use `npm run dev` from the repo root for day-to-day presentation authoring.
- The dev server serves the deployed site layout directly from source mounts:
  `Decks/AR1 -> /AR1`, `Decks/CSA -> /CSA`, and
  `vendor/SyncDeck-Reveal -> /runtime/syncdeck-reveal`.
- Refresh the browser after edits; no separate staging step is needed for
  normal deck work.
