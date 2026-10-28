# Presentation Permalinks and Project Tracking

Read this when adding, moving, or renaming a deck, or when working on a repo-wide cleanup project.

## Presentation Permalinks

Every deck under `Decks/` carries a `<meta name="syncdeck-permalink" content="<hash>">` tag,
written once by `scripts/generate-permalink.mjs` and never hand-edited. The hash is derived
from the deck's filename stem when first generated (with automatic collision resolution) and
never changes afterward, even if the deck is later moved or renamed, so it's safe to share as
a stable short link.

- `config/permalinks.json` is the committed manifest (`hash -> { path, title }`) and the single
  source of truth for collision detection.
- `node scripts/generate-permalink.mjs Decks/<path>/<deck>.html` assigns a permalink to a new
  deck, or re-syncs the manifest's cached path if an existing deck was moved.
- `node scripts/generate-permalink.mjs --all` does the same across every deck; safe to re-run.
- `node scripts/generate-permalink.mjs --check` (run in CI on every PR and before deploy) fails
  if any deck is missing the tag, two decks share a hash, or the manifest disagrees with the
  decks themselves.
- At build time, `scripts/generate-permalink-redirects.mjs` emits a static redirect stub per
  manifest entry at `/p/<hash>.html` that immediately `location.replace()`s to the deck's real,
  current URL — this is what makes the permalink stable across reorganization.
- The index pages (`scripts/site-indexes.mjs`) surface three links per deck: "Start as
  instructor" and "Syncdeck link" (both ActiveBits-hosted, built from the deck's real current
  URL) and "Permalink" (the short `/p/<hash>.html` link, safe to share or feed into the
  ActiveBits launcher directly).

## Project Tracking

Repo-wide cleanup projects (for example #11, readability, and #13, em dashes) are tracked per
deck with a `<meta name="syncdeck-projects" content="<id> <id>">` tag listing the projects the
deck is **done** for. A project missing from the list is not done yet. The tag sits right after
the permalink tag; edit it with the script below rather than by hand.

- `config/projects.json` is the registry: `id -> { title, issue, symbol, scope?, complete? }`. `symbol` is
  the short badge text shown on the index pages, and the optional `scope` is a list of public
  path prefixes (`"CSP/"`, `"HPy/Unit 2 - Loops and Strings/"`) the project applies to; omit it
  for projects that cover every deck. To start a new project, add an entry there.
- When a project is finished, set `"complete": true` on its entry rather than deleting it. Its id
  stays valid in deck tags (so `--check` still passes without touching every deck), but the index
  pages drop its badge and filter, the report skips it unless it's named, and `mark`/`unmark`
  refuse it. Remove `complete` to reopen the project.
- `node scripts/project-status.mjs mark <id> Decks/<path>/<deck>.html ...` marks decks done;
  `unmark` reverses it. Mark a deck in the same commit as the work that finishes it.
- `node scripts/project-status.mjs [<id>...] [--pending|--done] [--under <path>]` prints
  done/total per course, and with `--pending` or `--done` lists the matching decks.
- `node scripts/project-status.mjs --check` (run in CI next to the permalink check) fails on
  unknown project ids or a deck marked done for a project outside its scope.
- The index pages show one badge per applicable project on each deck (solid when done, dashed
  when not) and a filter for project and status on every folder page. The filter is kept in the
  query string (`?project=<id>&status=pending`), so a filtered view of a subtree can be shared
  as a link and stays applied when moving between folder pages.
- A new deck built to the current rules should be marked done for every registered project it
  already satisfies. Completed projects are the exception: don't add their ids to new decks.
