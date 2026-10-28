# SyncDeck Runtime and Submodule

Read this when working on the shared runtime in the `vendor/SyncDeck-Reveal/` submodule, or when
a deck needs storyboard, chalkboard, or iframe sync behavior beyond the standard
`initSyncDeckReveal` setup. Decks in this repo load only the bundled `dist/` assets.

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

## Submodule Internal: `vendor/SyncDeck-Reveal/chalkboard/chalkboard.js`

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

## Submodule Internal: `vendor/SyncDeck-Reveal/reveal-iframe-sync.js`

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
