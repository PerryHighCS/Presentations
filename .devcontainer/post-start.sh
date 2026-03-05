#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_DIR="/workspaces/Presentations"

for safe_dir in \
  "/workspaces/Presentations" \
  "/workspaces/Presentations/vendor/SyncDeck-Reveal/js" \
  "/workspaces/Presentations/.git" \
  "/workspaces/Presentations/.git/modules/vendor/SyncDeck-Reveal/js"; do
  if ! git config --global --get-all safe.directory | grep -Fxq "$safe_dir"; then
    git config --global --add safe.directory "$safe_dir"
  fi
done
