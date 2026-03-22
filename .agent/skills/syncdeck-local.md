# SyncDeck Skill — Presentations-Repo Local Overrides

This file documents the ways the `Presentations` repository differs from the
shared upstream skill at `.agent/skills/vendor/syncdeck/`.

**Reading order for agents:** Read `.agent/skills/vendor/syncdeck/SKILL.md`
first, then apply everything here on top of it. These overrides take precedence
wherever they conflict with the upstream.

---

## 1. Shared `theme.css` Convention

Before writing a new `<style>` block, check whether the deck's folder already
has a `theme.css`. If it does, link it first:

```html
<link rel="stylesheet" href="theme.css">
```

Add a `<style>` block **after** that link only for styles specific to this
individual deck. If no `theme.css` exists and the deck needs a theme, extract it
to `theme.css` so future decks in the same folder can share it.

---

## 2. `deckId` Naming Convention

Derive `deckId` from the presentation's filename in kebab-case. For example,
`classes/AR1/DC_Capacitors_Intro.html` → `deckId: 'dc-capacitors-intro'`.

---

## 3. Extended Style Presets

The upstream `references/STYLE_PRESETS.md` contains the canonical short
reference. For the full 12-preset visual library used in this repo — with
complete CSS token blocks and font pairings — see
`.agent/skills/STYLE_PRESETS_EXTENDED.md`.

---

## Summary of Override Hierarchy

| Topic | Upstream says | This repo does |
|-------|---------------|----------------|
| Shared theme handling | Optional in general | Reuse folder-level `theme.css` before adding deck-specific `<style>` |
| `deckId` naming | Unique per deck | Derive from the presentation filename in kebab-case |
| Style preset reference | `references/STYLE_PRESETS.md` (short) | Also `.agent/skills/STYLE_PRESETS_EXTENDED.md` |
