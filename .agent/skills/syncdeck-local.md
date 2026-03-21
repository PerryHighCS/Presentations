# SyncDeck Skill — Presentations-Repo Local Overrides

This file documents the ways the `Presentations` repository differs from the
shared upstream skill at `.agent/skills/vendor/syncdeck/`.

**Reading order for agents:** Read `.agent/skills/vendor/syncdeck/SKILL.md`
first, then apply everything here on top of it. These overrides take precedence
wherever they conflict with the upstream.

---

## 1. Bundled Runtime (Critical Override)

The upstream skill references individual files:

```
vendor/SyncDeck-Reveal/js/reveal-storyboard.js
vendor/SyncDeck-Reveal/js/reveal-iframe-sync.js
vendor/SyncDeck-Reveal/js/chalkboard/chalkboard.js
```

**This repo does NOT use those paths.** All runtime code is pre-bundled. Load
only:

```html
<link rel="stylesheet" href="../vendor/SyncDeck-Reveal/dist/syncdeck-reveal.css">
<script src="../vendor/SyncDeck-Reveal/dist/syncdeck-reveal.js"></script>
```

Use `vendor/SyncDeck-Reveal/dist/...` (no leading `../`) for root-level decks.
Use `../vendor/SyncDeck-Reveal/dist/...` for decks inside a subdirectory.

The bundle simultaneously provides `Reveal`, `RevealNotes`, `RevealChalkboard`,
`RevealIframeSync`, `initRevealStoryboard`, and `initSyncDeckReveal`. Do **not**
add any unpkg CDN links for Reveal.js or its plugins.

---

## 2. Init Function (Critical Override)

The upstream skill shows `Reveal.initialize({...})` inline. **Do not use this
in the Presentations repo.** Use the bundled wrapper instead:

```html
<script src="../vendor/SyncDeck-Reveal/dist/syncdeck-reveal.js"></script>
<script>
initSyncDeckReveal({
    deckId: 'my-deck-name',         // kebab-case, unique per deck
    iframeSyncOverrides: {
        // Optional per-deck iframeSync overrides
    },
    revealOverrides: {
        // Optional per-deck Reveal overrides
    },
    chalkboardOverrides: {
        // No storage — host owns persistence
    },
    storyboard: {
        // Optional: storyboardId / trackId / toggleKey
    },
    afterInit: function (Reveal) {
        // Optional deck-specific hooks
    },
});
</script>
```

`initSyncDeckReveal` calls `Reveal.initialize()` internally and registers all
plugins. There is **no need** to list `plugins: [...]` or call
`initRevealStoryboard(...)` separately — the bootstrap handles both.

---

## 3. No `chalkboard.storage`

Do not set `chalkboard: { storage: '...' }` anywhere. The host page is the
source of truth for drawing state. Setting `storage` would cause the in-memory
state and the host buffer to diverge on reload.

---

## 4. Required Storyboard HTML

Include the storyboard container markup in every deck:

```html
<div id="storyboard" class="storyboard" aria-hidden="true">
    <div id="storyboard-track" class="storyboard-track"></div>
</div>
```

Place it as a sibling of `.reveal`, not inside `.slides`.

---

## 5. Shared `theme.css` Convention

Before writing a new `<style>` block, check whether the deck's folder already
has a `theme.css`. If it does, link it first:

```html
<link rel="stylesheet" href="theme.css">
```

Add a `<style>` block **after** that link only for styles specific to this
individual deck. If no `theme.css` exists and the deck needs a theme, extract it
to `theme.css` so future decks in the same folder can share it.

---

## 6. `deckId` Naming Convention

Derive `deckId` from the presentation's filename in kebab-case. For example,
`AR1/DC_Capacitors_Intro.html` → `deckId: 'dc-capacitors-intro'`.

---

## 7. Role Lifecycle

Decks always initialise in `standalone` mode. The host must send `setRole` to
promote to `instructor` or `student`. Never rely on the `role` config field to
set initial role.

---

## 8. Overview → Storyboard Routing

Reveal.js's built-in grid overview (`O` key) is intercepted and routed to the
storyboard strip, not the native Reveal grid. `overview: true/false` in any
`setState` command is converted to `reveal-storyboard-set` DOM events on the
student side.

---

## 9. Extended Style Presets

The upstream `references/STYLE_PRESETS.md` contains the canonical short
reference. For the full 12-preset visual library used in this repo — with
complete CSS token blocks and font pairings — see
`.agent/skills/STYLE_PRESETS_EXTENDED.md`.

---

## 10. Stale Paths in AGENTS.md / CLAUDE.md

`AGENTS.md` and `CLAUDE.md` contain references such as:

```
.claude/skills/frontend-slides/SKILL.md
.claude/skills/frontend-slides/STYLE_PRESETS.md
```

These are stale. The canonical skill is now
`.agent/skills/vendor/syncdeck/SKILL.md`. Ignore the old paths; follow this
file and the vendored upstream instead.

---

## Summary of Override Hierarchy

| Topic | Upstream says | This repo does |
|-------|---------------|----------------|
| Storyboard/sync script loading | `vendor/SyncDeck-Reveal/js/*.js` | `dist/syncdeck-reveal.js` + `dist/syncdeck-reveal.css` |
| Initialization | `Reveal.initialize({...})` inline | `initSyncDeckReveal({deckId: '...'})` |
| Plugin registration | Manual `plugins: [...]` array | Bundle handles it automatically |
| CDN Reveal.js | `https://unpkg.com/reveal.js@5/...` | Not used; bundled |
| Chalkboard storage | Not set | Not set (same) |
| Role init | Standalone | Standalone (same) |
| Style preset reference | `references/STYLE_PRESETS.md` (short) | Also `.agent/skills/STYLE_PRESETS_EXTENDED.md` |
