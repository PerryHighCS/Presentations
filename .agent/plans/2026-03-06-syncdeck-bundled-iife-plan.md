# Bundled IIFE Runtime Plan (SyncDeck-Reveal + Presentations)

## Summary
Build and ship a single browser IIFE runtime from the `vendor/SyncDeck-Reveal/js` submodule that includes Reveal core, Reveal Notes, and all SyncDeck plugins. Migrate all presentation decks and the submodule manual regression deck to import that single runtime script.

Target deck HTML shape:

```html
<link rel="stylesheet" href="../vendor/SyncDeck-Reveal/js/chalkboard/chalkboard.css">
<script src="../vendor/SyncDeck-Reveal/js/dist/syncdeck-runtime.iife.js"></script>
<script>
  initSyncDeckReveal({ deckId: 'your-deck-id' });
</script>
```

## Implementation Changes

### 1. Submodule bundler pipeline
- Add bundler config in `vendor/SyncDeck-Reveal/js` (Rollup preferred for stable IIFE output).
- Add source entrypoint `src/syncdeck-runtime.js` that imports and wires:
  - Reveal core (`reveal.js/dist/reveal.esm.js`)
  - Reveal Notes (`reveal.js/plugin/notes/notes.esm.js`)
  - `chalkboard/chalkboard.js`
  - `reveal-storyboard.js`
  - `reveal-iframe-sync.js`
  - `syncdeck-bootstrap.js`
- Emit one output artifact:
  - `dist/syncdeck-runtime.iife.js` (stable filename, no hash)
- Keep `chalkboard/chalkboard.css` as separate stylesheet (do not inject CSS via JS).

### 2. Runtime/global API contract
- Ensure bundle defines globals expected by existing decks:
  - `window.Reveal`
  - `window.RevealNotes`
  - `window.RevealChalkboard`
  - `window.RevealIframeSync`
  - `window.initRevealStoryboard`
  - `window.initSyncDeckReveal`
- Keep current `initSyncDeckReveal(config)` interface unchanged:
  - `deckId` required
  - optional `revealOverrides`, `iframeSyncOverrides`, `chalkboardOverrides`, `storyboard`, `afterInit`
- Preserve existing safeguard: `chalkboard.storage` must be stripped/ignored.

### 3. Submodule scripts and guardrails
- Update `vendor/SyncDeck-Reveal/js/package.json` scripts:
  - `build`: bundle IIFE runtime
  - `build:check`: fail if `dist/syncdeck-runtime.iife.js` is out of date vs source
  - `ship`: `lint && test && build && build:check`
- Add bundler dependencies and Reveal package dependency in submodule lockfile.
- Optional but recommended: submodule pre-commit hook runs `build` on relevant source changes.

### 4. Presentation deck migration (parent repo)
- Update all 4 decks:
  - `AR1/DC_Capacitors_Intro.html`
  - `AR1/Soldering_and_Measuring_Resistance.html`
  - `AR1/Parallel_and_Mixed_Circuits.html`
  - `CSA/2d-arrays.html`
- For each:
  - remove Reveal CDN script
  - remove Notes CDN script
  - remove individual plugin scripts (`chalkboard.js`, `reveal-storyboard.js`, `reveal-iframe-sync.js`, `syncdeck-bootstrap.js`)
  - add single bundled script: `../vendor/SyncDeck-Reveal/js/dist/syncdeck-runtime.iife.js`
  - keep `initSyncDeckReveal(...)` call and deck-specific overrides/hook behavior intact.

### 5. Submodule test presentation update
- Update `vendor/SyncDeck-Reveal/js/test/manual-regression-lab.html` imports to use bundled runtime script instead of separate Reveal/Notes/plugin scripts.
- Keep deck behavior, controls, and `deckId: 'manual-regression-lab'` unchanged.

### 6. Docs updates
- Update `AGENTS.md` in parent repo with new import pattern (single runtime JS + chalkboard CSS + `initSyncDeckReveal`).
- Update submodule docs/README or AGENTS to reflect:
  - bundler ownership in submodule
  - required `build`/`ship` flow
  - `dist` committed in submodule
  - parent repo only updates submodule pointer.

## Test Plan

### Submodule validation
- Run `npm run ship` in `vendor/SyncDeck-Reveal/js`.
- Confirm `dist/syncdeck-runtime.iife.js` is generated and committed.
- Verify static smoke in browser for `test/manual-regression-lab.html`:
  - deck loads without console errors
  - storyboard toggles
  - sync ready/state traffic works
  - ping command returns pong.

### Parent deck validation
- Open each of the 4 decks and confirm:
  - slide render/navigation/fragments work
  - storyboard toggle works (`m`)
  - sync handshake and commands still work (`ready`, `ping`/`pong`, `setRole`)
  - `AR1/Parallel_and_Mixed_Circuits` custom `afterInit` animation logic still works.

### Regression checks
- Ensure no deck includes old multiple runtime script imports.
- Ensure no `chalkboard.storage` settings are introduced.
- Ensure all deck paths resolve from subdirectories correctly.

## Assumptions
- Reveal core and Notes are bundled into submodule runtime (no CDN runtime dependency).
- Bundled JS uses a stable filename (`syncdeck-runtime.iife.js`) without hash.
- `dist` artifacts are committed in submodule git history.
- Presentations deploy workflow remains static publish with recursive submodules; it does not run bundling.

## Rollout Sequence
1. Implement and commit bundler + runtime output in submodule.
2. Push submodule branch/commit.
3. Update parent deck imports + docs.
4. Commit parent submodule pointer and deck/document changes.
5. Validate GitHub Pages deployment with updated submodule commit.
