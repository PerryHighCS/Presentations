# SyncDeck Skill — Presentations-Repo Local Overrides

This file documents the ways the `Presentations` repository differs from the
shared upstream skill at `.agent/skills/vendor/syncdeck/`.

**Reading order for agents:** Read `.agent/skills/vendor/syncdeck/SKILL.md`
first, then apply everything here on top of it. These overrides take precedence
wherever they conflict with the upstream.

---

## 1. Runtime Path

This repo publishes decks from `classes/<course>/<unit>/deck.html` and serves
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
`classes/AR1/DC_Capacitors_Intro.html` → `deckId: 'dc-capacitors-intro'`.

---

## 4. Extended Style Presets

The upstream `references/STYLE_PRESETS.md` contains the canonical short
reference. For the full 12-preset visual library used in this repo — with
complete CSS token blocks and font pairings — see
`.agent/skills/STYLE_PRESETS_EXTENDED.md`.

---

## 5. Standalone Hosting Opt-In

Decks in this repo should opt into the standalone top-right CTA by passing
`standaloneHosting.activeBitsOrigin` to `initSyncDeckReveal(...)`:

```html
<script>
initSyncDeckReveal({
  deckId: 'my-deck-name',
  standaloneHosting: {
    activeBitsOrigin: 'https://bits.mycode.run',
    // Optional:
    // launchPath: '/util/syncdeck/launch-presentation',
    // presentationUrl: 'https://slides.example/my-deck.html',
    // ctaLabel: 'Activate SyncDeck',
    // ctaTimeoutMs: 9000,
  },
});
</script>
```

Repo-specific notes:

- the CTA is opt-in; it does not appear unless `standaloneHosting.activeBitsOrigin` is set
- the runtime opens ActiveBits at `/util/syncdeck/launch-presentation`
- omit `presentationUrl` unless the deck has a better canonical URL than the current published page URL
- the runtime bundle copies `assets/syncdeck.png` into `dist/assets/`, so decks should keep loading the bundled runtime rather than linking the button asset directly

---

## Summary of Override Hierarchy

| Topic | Upstream says | This repo does |
|-------|---------------|----------------|
| Runtime path | Use `{runtime-path}` placeholder; see local overrides | `../../runtime` (decks live at `classes/<course>/<unit>/`) |
| Shared theme handling | Optional in general | Reuse folder-level `theme.css` before adding deck-specific `<style>` |
| `deckId` naming | Unique per deck | Derive from the presentation filename in kebab-case |
| Style preset reference | `references/STYLE_PRESETS.md` (short) | Also `.agent/skills/STYLE_PRESETS_EXTENDED.md` |
| Standalone hosting CTA | Optional runtime feature | Opt in with `standaloneHosting.activeBitsOrigin` |
