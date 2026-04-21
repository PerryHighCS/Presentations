# SyncDeck Skill — Presentations-Repo Local Overrides

This file documents the ways the `Presentations` repository differs from the
shared upstream skill at `.agent/skills/vendor/syncdeck/`.

**Reading order for agents:** Read `.agent/skills/vendor/syncdeck/SKILL.md`
first, then apply everything here on top of it. These overrides take precedence
wherever they conflict with the upstream.

---

## 1. Runtime Path

This repo publishes decks from `Decks/<course>/<unit>/deck.html` and serves
the SyncDeck runtime at `/runtime/syncdeck-reveal/`. The relative path from a
deck's published URL (`/<course>/<unit>/deck.html`) to the runtime root is two
levels up, so substitute `{runtime-path}` with `../../runtime`:

```html
<link rel="stylesheet" href="../../runtime/syncdeck-reveal/dist/syncdeck-reveal.css">
<script src="../../runtime/syncdeck-reveal/dist/syncdeck-reveal.js"></script>
```

---

## 2. Shared `theme.css` Convention

Before writing a new `<style>` block, check whether the deck's folder already
has a `theme.css`. If it does, link it first:

```html
<link rel="stylesheet" href="theme.css">
```

Add a `<style>` block **after** that link only for styles specific to this
individual deck. If no `theme.css` exists and the deck needs a theme, extract it
to `theme.css` so future decks in the same folder can share it.

---

## 3. `deckId` Naming Convention

Derive `deckId` from the presentation's filename in kebab-case. For example,
`Decks/AR1/DC_Capacitors_Intro.html` → `deckId: 'dc-capacitors-intro'`.

---

## 4. Extended Style Presets

The upstream `references/STYLE_PRESETS.md` contains the canonical short
reference. For the full 12-preset visual library used in this repo — with
complete CSS token blocks and font pairings — see
`.agent/skills/STYLE_PRESETS_EXTENDED.md`.

---

## 5. Standard `initSyncDeckReveal` Block

Every deck in this repo must include both `standaloneHosting` and `revealOverrides`
in its `initSyncDeckReveal(...)` call. Omitting either causes problems: missing
`standaloneHosting.activeBitsOrigin` suppresses the SyncDeck CTA; missing
`revealOverrides` leaves Reveal.js at its defaults, which do not match this repo's
canvas size, transition style, or navigation expectations.

Use this block verbatim and substitute the correct `deckId`:

```js
initSyncDeckReveal({
  deckId: 'my-deck-name',          // kebab-case from the filename
  standaloneHosting: {
    activeBitsOrigin: 'https://bits.mycode.run',
    // Optional overrides (rarely needed):
    // launchPath: '/util/syncdeck/launch-presentation',
    // presentationUrl: 'https://slides.example/my-deck.html',
    // ctaLabel: 'Activate SyncDeck',
    // ctaTimeoutMs: 9000,
  },
  revealOverrides: {
    hash: true,
    hashOneBasedIndex: true,
    transition: 'fade',
    transitionSpeed: 'fast',
    backgroundTransition: 'none',
    center: false,
    controls: true,
    controlsLayout: 'edges',
    progress: true,
    slideNumber: 'c/t',
    keyboard: true,
    touch: true,
    fragments: true,
    width: 1600,
    height: 900,
    margin: 0.04,
    minScale: 0.2,
    maxScale: 2.5,
  },
});
```

Repo-specific notes:

- `standaloneHosting.activeBitsOrigin` must be `'https://bits.mycode.run'` — this
  is the ActiveBits instance that hosts SyncDeck for this repo.
- The CTA only appears when `activeBitsOrigin` is set; omitting it silently
  suppresses the button.
- In this repo, instructor-facing activity launcher URLs use
  `https://bits.mycode.run/launch/<activity-id>`.
- Add `?start=1` for instructor-authored links that should immediately create a
  new session and redirect to the activity manager.
- The `revealOverrides` block sets the 1600×900 canvas, fade transitions, and
  edge controls that match this repo's slide designs. Do not omit it or Reveal
  will apply its own defaults (wrong canvas size, wrong transition, centered
  layout).
- Omit `presentationUrl` unless the deck has a better canonical URL than the
  current published page URL.
- Do not add `chalkboardOverrides.storage` — the host page owns drawing state.

---

## Summary of Override Hierarchy

| Topic | Upstream says | This repo does |
|-------|---------------|----------------|
| Runtime path | Use `{runtime-path}` placeholder; see local overrides | `../../runtime` (decks live at `Decks/<course>/<unit>/`) |
| Shared theme handling | Optional in general | Reuse folder-level `theme.css` before adding deck-specific `<style>` |
| `deckId` naming | Unique per deck | Derive from the presentation filename in kebab-case |
| Style preset reference | `references/STYLE_PRESETS.md` (short) | Also `.agent/skills/STYLE_PRESETS_EXTENDED.md` |
| Standalone hosting CTA | Optional runtime feature | Always include `standaloneHosting.activeBitsOrigin: 'https://bits.mycode.run'` |
| Reveal.js config | Optional `revealOverrides` | Always include the standard `revealOverrides` block (1600×900, fade, edge controls) |
