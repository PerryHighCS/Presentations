# Slidedeck Skill Attribution

This skill (`.claude/skills/slidedeck`) is based on the same architecture and
authoring patterns used by the `frontend-slides` skill, then adapted for this
repository's Reveal.js workflow and plugin conventions.

## Source/Lineage
- Base concept: `frontend-slides` skill conventions
- Local adaptation target: `Presentations` repository requirements
  (`AGENTS.md`, local `js/` plugins, iframe sync and storyboard constraints)

## Local Adaptations
- Added repository-specific plugin guidance for:
  - `vendor/SyncDeck-Reveal/js/reveal-storyboard.js`
  - `vendor/SyncDeck-Reveal/js/reveal-iframe-sync.js`
  - `vendor/SyncDeck-Reveal/js/chalkboard/chalkboard.js` and `chalkboard.css`
- Added strict Reveal.js canvas sizing and CSS architecture constraints.
- Added default storyboard integration and iframe-sync contract guidance.
- Added project-specific path guidance for subdirectory decks.
