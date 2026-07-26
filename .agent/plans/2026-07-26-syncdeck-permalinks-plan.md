# Stable Presentation Permalinks Plan

## Summary
Presentation URLs today are just their file path under `Decks/` as published to
the site root (e.g. `/CSA/Lists/lists.html`). Reorganizing folders breaks any
link built on that path, and the paths can get long. This plan adds a second,
stable link per deck: a short hash-based permalink, generated once and stored
in the deck's HTML, that survives file moves/renames because it never changes
once assigned.

Shape of the system:
- Each deck gets a `<meta name="syncdeck-permalink" content="<hash>">` tag,
  written once by a generator script and never hand-edited.
- The hash is derived from the deck's filename stem at generation time, with a
  deterministic collision-resolution step (not from the live file path, so
  moving/renaming the deck later doesn't change it).
- A committed manifest (`config/permalinks.json`) maps `hash -> current public
  path`, acting as the single source of truth for collision detection and for
  building redirect targets at deploy time.
- At build time, one small static redirect stub is emitted per manifest entry
  at `/p/<hash>.html`. It does an immediate `location.replace()` to the deck's
  real (current) URL. Confirmed with the user that ActiveBits pings the iframe
  again on each `load` event, so the redirect's second `load` still produces a
  successful ping against the fully-initialized deck, i.e. this permalink is
  safe to feed directly into the ActiveBits launcher, not just for humans.
- CI fails the build if any deck is missing the meta tag, if the manifest has
  duplicate hashes, or if the committed manifest disagrees with what's
  derivable from the decks themselves (e.g. a deck moved without the manifest
  being regenerated).
- The existing "Get permalink" button (which builds an ActiveBits
  `permalinkPath` URL wrapping the deck's real URL) is relabeled "Syncdeck
  link" to disambiguate it from the new permalink. A third button/link
  surfaces the new short permalink for copying.

## Implementation Changes

### 1. Hash generation
- Seed string: the deck's filename stem (basename without extension) at the
  time the generator script is first run against it, e.g. `lists` for
  `lists.html`.
- Hash function: FNV-1a (32-bit), base36-encoded. No dependency needed:
  ```js
  function fnv1a(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
  }
  ```
- Collision handling: if the resulting hash already exists in
  `config/permalinks.json` pointing at a *different* deck, re-seed as
  `${stem}#2`, `${stem}#3`, ... and rehash until the result is free. The
  winning seed/hash is then fixed permanently in the deck's meta tag.

### 2. Manifest — `config/permalinks.json`
- Committed JSON file, sibling to `config/site-map.mjs`.
- Shape: `{ "<hash>": { "path": "<public path under Decks/>", "title": "<cached title>" } }`.
  `path` is the same public-path convention `site-indexes.mjs` already uses
  (e.g. `CSA/Lists/lists.html`), so it can be turned directly into a redirect
  target.
- Acts as the single source of truth for collision checks (the generator
  script only needs to consult this file, not scan every deck), and doubles as
  a lookup table for any future feature (analytics, search, a client-side
  resolver) that wants `hash -> deck` without scanning the tree.

### 3. Generator script — `scripts/generate-permalink.mjs`
- Usage: `node scripts/generate-permalink.mjs Decks/CSA/Lists/lists.html`.
- If the deck already has a `syncdeck-permalink` meta tag: no-op, unless the
  manifest's recorded `path` for that hash no longer matches the deck's actual
  location, in which case update the manifest's `path` (the hash itself never
  changes on a move/rename).
- If the deck has no tag: compute the hash (with collision resolution per
  above), insert the meta tag into `<head>`, and add/update the manifest
  entry.
- `--check` mode (used by CI, see below): walk all deck HTML files under
  `Decks/`, and fail with a clear message if:
  - any deck is missing the `syncdeck-permalink` meta tag,
  - any two decks share a hash,
  - the committed manifest has an entry whose `path` doesn't match the deck
    that currently owns that hash (stale manifest, e.g. after a move that
    didn't re-run the script).
  - Exit non-zero with a message telling the author which command to run to
    fix it.

### 4. Redirect stub generation — `scripts/generate-permalink-redirects.mjs`
- Usage: `node scripts/generate-permalink-redirects.mjs .build/site` (same
  invocation pattern as `generate-site-indexes.mjs`).
- Reads `config/permalinks.json` and, for each entry, writes
  `.build/site/p/<hash>.html`.
- Stub content: a script-based `location.replace()` fired as early as
  possible in `<head>`, plus a `<meta http-equiv="refresh">` fallback for the
  no-JS case. Redirect target is computed as a path relative to `p/`, e.g.
  `../CSA/Lists/lists.html`, so it works unmodified under both the local dev
  server (root `/`) and the GitHub Pages project prefix
  (`/Presentations/...`) without hardcoding `siteBaseUrl`.

### 5. CI wiring
- `.github/workflows/static.yml`: add a step before "Stage publishable site":
  `node scripts/generate-permalink.mjs --check` — fails the workflow (and
  therefore blocks deploy) on any of the violations above. Add a step after
  staging (alongside "Generate index.html"):
  `node scripts/generate-permalink-redirects.mjs .build/site`.
- New `.github/workflows/permalinks-check.yml`, triggered on `pull_request`:
  checkout + `node scripts/generate-permalink.mjs --check` only, no build or
  deploy steps. Catches a missing/broken permalink at PR time rather than
  only at merge-to-main deploy time.

### 6. Index page changes — `scripts/site-indexes.mjs`
- Rename the existing "Get permalink" button (the one building an ActiveBits
  `permalinkPath` URL) to "Syncdeck link" in the rendered markup. Internal
  `data-launch="permalink"` attribute can be renamed to
  `data-launch="syncdeck"` for clarity.
- Add a third action that surfaces the new short permalink:
  - Read `config/permalinks.json` (or the deck's own meta tag) when building
    each file entry, alongside the existing `defaultTitleForFile` lookup.
  - Render a "Permalink" link/copy-button pointing at `p/<hash>.html`,
    resolved relative to the current index page's folder depth using the same
    `pathPrefix`/relative-`../` mechanism `renderTree` already uses for
    per-folder back-links, so it resolves correctly regardless of which
    folder's `index.html` is rendering it.

### 7. Docs — `CLAUDE.md`
- Add a step to "Adding a New Presentation": after creating the deck file,
  run `node scripts/generate-permalink.mjs Decks/<path>/<deck>.html` before
  committing, so the deck always ships with a permalink from day one.
- Document the new meta tag and manifest file in the architecture notes table.

## Test Plan
- Unit-style check: run `generate-permalink.mjs` against a fresh deck with no
  tag, confirm meta tag + manifest entry are created and are stable on a
  second run (idempotent).
- Collision test: force two decks to hash to the same value (mock/seed),
  confirm the second gets a `#2`-seeded hash instead and both remain unique.
- `--check` test: manually remove a meta tag from one deck and confirm
  `--check` fails with a clear message; restore it and confirm it passes.
- `--check` test: hand-edit the manifest to point a hash at the wrong path
  and confirm `--check` catches the mismatch.
- Build test: run `stage-site.mjs` + `generate-permalink-redirects.mjs` and
  open `.build/site/p/<hash>.html` directly in a browser, confirm it lands on
  the correct deck with no console errors and correct relative asset loading.
- ActiveBits integration smoke test: launch a session using a permalink URL
  (`/p/<hash>.html`) as the `presentationUrl` fed to
  `launchPath`/`permalinkPath`, confirm the ping/pong handshake still
  succeeds after the redirect (validates the "second `load` event" assumption
  in a real ActiveBits session rather than just in principle).
- Index page smoke test: confirm "Start as instructor", "Syncdeck link", and
  the new "Permalink" all resolve to working URLs from both the root index
  and a nested folder index.

## Assumptions
- ActiveBits re-arms its iframe `load` listener rather than using a one-shot
  listener, so a client-side redirect still produces a ping against the final
  page. Flagged for confirmation in the test plan above since ActiveBits is
  external to this repo.
- Hash seed is the filename stem only (per the original request), not the
  full path; the manifest, not the seed, is what's authoritative once a hash
  is assigned, so this choice only affects the *first* assignment, not
  stability afterward.
- No cryptographic hash is needed since collisions are actively resolved and
  detected, not merely made unlikely.
- Redirect stubs are static files, not real filesystem symlinks (GitHub
  Pages' static artifact upload isn't a reliable place to depend on symlink
  semantics, and relative asset URLs would break under a symlink regardless,
  since the browser resolves relative paths against the URL path, not the
  file the symlink points to).

## Rollout Sequence
1. Add `config/permalinks.json` (empty `{}`) and
   `scripts/generate-permalink.mjs`.
2. Run the generator once across every existing deck under `Decks/` to
   backfill meta tags + manifest entries for all current presentations.
3. Add `scripts/generate-permalink-redirects.mjs` and wire it into
   `static.yml` alongside the existing index-generation step.
4. Add the `--check` step to `static.yml` before staging, and add the new
   `permalinks-check.yml` `pull_request` workflow.
5. Update `scripts/site-indexes.mjs` (rename + new permalink button,
   `data-launch="permalink"` → `data-launch="syncdeck"`) and `CLAUDE.md`
   (new-deck step + architecture notes).
6. Validate a full local build (`stage-site.mjs` →
   `generate-permalink-redirects.mjs` → `generate-site-indexes.mjs`) and spot
   check several permalinks in a browser.
7. Commit, push, and confirm the GitHub Pages deploy succeeds with the new
   CI check in place, and that a test PR triggers `permalinks-check.yml`.
