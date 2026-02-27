# Chalkboard Plugin Attribution

This folder contains a vendored copy of the Reveal.js chalkboard plugin with
local modifications for iframe synchronization.

## Upstream Source
- Project: reveal.js-plugins (chalkboard plugin)
- Maintainer: Asvin Goel
- Upstream URL: https://github.com/rajgoel/reveal.js-plugins/tree/master/chalkboard
- License: MIT (see `LICENSE.md` in this folder)

## Local Modifications
This repository includes extensions used by `reveal-iframe-sync.js`, including:
- `replayStroke(mode, slide, event)` to apply individual remote draw/erase events
  without recording duplicate local strokes.
- `loadState(jsonString)` to replace local drawing storage from a host snapshot
  and redraw the current slide.

These changes are maintained in this repository and are not guaranteed to match
upstream behavior.
