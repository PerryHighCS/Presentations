#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_DIR="/workspaces/Presentations"
PERSIST_SSH_DIR="$WORKSPACE_DIR/.devcontainer-data/ssh"
HOME_SSH_DIR="$HOME/.ssh"

mkdir -p "$HOME_SSH_DIR" "$PERSIST_SSH_DIR"
chmod 700 "$HOME_SSH_DIR" "$PERSIST_SSH_DIR"

if [[ ! -f "$PERSIST_SSH_DIR/id_ed25519" && -f "$HOME_SSH_DIR/id_ed25519" ]]; then
  cp "$HOME_SSH_DIR/id_ed25519" "$PERSIST_SSH_DIR/id_ed25519"
  cp "$HOME_SSH_DIR/id_ed25519.pub" "$PERSIST_SSH_DIR/id_ed25519.pub"
fi

if [[ ! -f "$PERSIST_SSH_DIR/id_ed25519" ]]; then
  ssh-keygen -t ed25519 -C "pwuser@codespaces" -f "$PERSIST_SSH_DIR/id_ed25519" -N ""
fi

install -m 600 "$PERSIST_SSH_DIR/id_ed25519" "$HOME_SSH_DIR/id_ed25519"
install -m 644 "$PERSIST_SSH_DIR/id_ed25519.pub" "$HOME_SSH_DIR/id_ed25519.pub"

touch "$HOME_SSH_DIR/config"
if ! grep -q "^Host github.com$" "$HOME_SSH_DIR/config"; then
  cat >> "$HOME_SSH_DIR/config" <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
EOF
fi
chmod 600 "$HOME_SSH_DIR/config"

touch "$HOME_SSH_DIR/known_hosts"
if ! ssh-keygen -F github.com -f "$HOME_SSH_DIR/known_hosts" >/dev/null; then
  ssh-keyscan -t ed25519 github.com >> "$HOME_SSH_DIR/known_hosts" 2>/dev/null || true
fi
chmod 644 "$HOME_SSH_DIR/known_hosts"

for safe_dir in \
  "/workspaces/Presentations" \
  "/workspaces/Presentations/vendor/SyncDeck-Reveal/js" \
  "/workspaces/Presentations/.git" \
  "/workspaces/Presentations/.git/modules/vendor/SyncDeck-Reveal/js"; do
  if ! git config --global --get-all safe.directory | grep -Fxq "$safe_dir"; then
    git config --global --add safe.directory "$safe_dir"
  fi
done
