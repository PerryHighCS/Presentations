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
