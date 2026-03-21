# `.agent/skills/` — Agent Skill Library

This directory holds agent skills used by GitHub Copilot and other AI agents
in this repository.

---

## Shared Upstream Skill (Subtree)

The core SyncDeck/slidedeck skill is managed as a **git subtree** pulled from the
shared upstream repository:

| Item | Value |
|------|-------|
| Local prefix | `.agent/skills/vendor/syncdeck/` |
| Remote name | `syncdeck-agent-skills` |
| Remote URL | `https://github.com/PerryHighCS/syncdeck-agent-skills.git` |
| Branch | `main` |

The subtree was added with:

```bash
git remote add syncdeck-agent-skills https://github.com/PerryHighCS/syncdeck-agent-skills.git
git subtree add \
  --prefix=.agent/skills/vendor/syncdeck \
  syncdeck-agent-skills main --squash
```

### Pulling upstream updates

```bash
git fetch syncdeck-agent-skills
git subtree pull \
  --prefix=.agent/skills/vendor/syncdeck \
  syncdeck-agent-skills main --squash
```

### Publishing local edits back upstream

Only edits inside `.agent/skills/vendor/syncdeck/` are eligible to push back.
Do not push repo-specific files from `.agent/skills/` root.

```bash
git subtree push \
  --prefix=.agent/skills/vendor/syncdeck \
  syncdeck-agent-skills main
```

---

## Repo-Specific Files

| File | Purpose |
|------|---------|
| `syncdeck-local.md` | Presentations-repo overrides and differences from upstream |
| `STYLE_PRESETS_EXTENDED.md` | Full 12-preset visual library (extends the shorter upstream `references/STYLE_PRESETS.md`) |

These files are **not** part of the subtree and are edited directly in this
repository.

---

## Reading Order for Agents

1. `.agent/skills/vendor/syncdeck/SKILL.md` — shared upstream skill (canonical)
2. `.agent/skills/syncdeck-local.md` — repo-specific overrides (apply on top)
3. `.agent/skills/vendor/syncdeck/references/STYLE_PRESETS.md` — short preset reference
4. `.agent/skills/STYLE_PRESETS_EXTENDED.md` — full preset library for visual exploration
