#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_DIR="/workspaces/Presentations"

for safe_dir in \
  "$WORKSPACE_DIR" \
  "$WORKSPACE_DIR/vendor/SyncDeck-Reveal" \
  "$WORKSPACE_DIR/.git" \
  "$WORKSPACE_DIR/.git/modules/vendor/SyncDeck-Reveal"; do
  if ! git config --global --get-all safe.directory | grep -Fxq "$safe_dir"; then
    git config --global --add safe.directory "$safe_dir"
  fi
done

# The skills subtree pushes/pulls through this remote; remotes live in
# .git/config, so a fresh clone doesn't have it.
if ! git -C "$WORKSPACE_DIR" remote get-url syncdeck-agent-skills >/dev/null 2>&1; then
  git -C "$WORKSPACE_DIR" remote add syncdeck-agent-skills https://github.com/PerryHighCS/syncdeck-agent-skills
fi
