# SyncDeck-Reveal Migration Plan

## Status Snapshot (2026-02-27)
- Completed now:
  - Enabled submodule checkout in Pages workflow: `.github/workflows/static.yml` uses `actions/checkout@v4` with `submodules: recursive`.
  - Created `SyncDeck-Reveal` and pushed history-preserving `js/` split.
  - Added `SyncDeck-Reveal` submodule at `vendor/SyncDeck-Reveal/js`.
  - Rewrote deck and template asset paths to `vendor/SyncDeck-Reveal/js/...`.
  - Removed legacy local `js/` directory from `Presentations`.
- Pending:
  - Validate runtime behavior in browser (storyboard, iframe sync, chalkboard assets).

## Goal
Move shared JavaScript runtime/plugin code out of `Presentations` into a separate repo (`SyncDeck-Reveal`), then consume it here as a git submodule so this repo focuses on slide content only.

## Scope
- Move shared code currently under `js/`:
  - `js/reveal-storyboard.js`
  - `js/reveal-iframe-sync.js`
  - `js/chalkboard/*`
- Keep all deck HTML/CSS/content in `Presentations`.
- Update docs/templates so path references point to the submodule location.

## Target Layout (Presentations)
```text
Presentations/
├── vendor/
│   └── SyncDeck-Reveal/
│       └── js/            # git submodule
├── CSA/
│   └── 2d-arrays.html
├── index.html
└── AGENTS.md
```

## Phase 1: Create New Repo
1. Create `SyncDeck-Reveal` repository.
2. Copy `js/` content into that repo.
3. Preserve history (optional):
   - Use `git filter-repo --path js/` from a clone if history retention is required.
4. Add README and versioning policy (tag releases if needed).

## Phase 2: Add Submodule Here
1. In `Presentations`, add submodule:
   - `git submodule add <syncdeck-reveal-url> vendor/SyncDeck-Reveal/js`
2. Verify submodule status:
   - `git submodule status`
3. Ensure `.gitmodules` is committed.
4. Confirm Pages workflow checkout includes submodules:
   - `actions/checkout@v4` with `submodules: recursive` (already done).

## Phase 3: Update Paths in Decks
1. Update deck/plugin references from local `../js/...` to submodule paths.
2. For nested deck files (example `CSA/2d-arrays.html`):
   - `../vendor/SyncDeck-Reveal/js/chalkboard/chalkboard.css`
   - `../vendor/SyncDeck-Reveal/js/chalkboard/chalkboard.js`
   - `../vendor/SyncDeck-Reveal/js/reveal-storyboard.js`
   - `../vendor/SyncDeck-Reveal/js/reveal-iframe-sync.js`
3. Keep Reveal core references as-is (CDN or later migration decision).

## Phase 4: Update Documentation/Templates
1. Update `AGENTS.md`:
   - Repository layout
   - Shared plugin paths
   - Initialization snippets
2. Update skill templates:
   - `.claude/skills/slidedeck/SKILL.md`
   - Any other slide templates/snippets that mention `js/...`
3. Add a short contributor note on submodule init/update:
   - `git submodule update --init --recursive`

## Phase 5: Validation
1. Open at least one deck locally and confirm:
   - Storyboard toggles (`M`)
   - Iframe sync plugin loads without path errors
   - Chalkboard assets/images load
2. Check browser console for missing file 404s.
3. Verify GitHub Pages path behavior with relative URLs.

## Phase 6: Cleanup and Commit
1. Remove old in-repo `js/` directory after all references are migrated.
2. Commit in `Presentations`:
   - Submodule pointer
   - Path rewrites
   - Docs/template updates
3. Tag/announce migration in changelog or repo notes.

## Rollback Plan
- If migration breaks path resolution:
  1. Revert path rewrite commit.
  2. Re-add local `js/` temporarily.
  3. Fix relative paths and retest before reapplying.

## Risks
- Broken relative paths for decks in different directory depths.
- Contributors forgetting to initialize submodules.
- Drift between `Presentations` docs and submodule API changes.

## Success Criteria
- No presentation in this repo depends on local `js/`.
- All shared plugin/runtime code is loaded from `vendor/SyncDeck-Reveal`.
- Docs and templates consistently reflect the submodule architecture.
