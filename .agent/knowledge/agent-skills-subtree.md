# Agent Skills Subtree

Read this before editing anything under `.agent/skills/vendor/syncdeck/`.

The shared SyncDeck agent skill lives at `.agent/skills/vendor/syncdeck/` and is
managed as a **git subtree** (not a submodule) backed by the
`syncdeck-agent-skills` remote.

- **Commit model:** edit files inside `.agent/skills/vendor/syncdeck/` normally
  and commit them to the parent repo as you would any other file. The subtree
  has no separate working tree — changes land directly in the parent history.
- **Push upstream after committing:** after committing changes to the parent
  repo, push them back to the subtree remote:
  ```
  git subtree push --prefix=.agent/skills/vendor/syncdeck syncdeck-agent-skills main
  ```
- **Pull upstream changes:** to incorporate updates published to the subtree
  remote:
  ```
  git subtree pull --prefix=.agent/skills/vendor/syncdeck syncdeck-agent-skills main --squash
  ```
- **Do not** run `git subtree push/pull` until the parent repo commit is in
  place — the subtree commands rewrite history based on the current index.
