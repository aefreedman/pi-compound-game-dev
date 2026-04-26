---
name: git-worktree
description: Manage Git worktrees for isolated parallel development
---
# Git Worktree Manager

Use the manager script for all worktree operations.

## Critical Rule

Never call `git worktree add` directly. Always use:

```
bash skills/git-worktree/scripts/worktree-manager.sh
```

## Commands

- create <branch-name> [from-branch]
- list | ls
- switch | go [name]
- copy-env | env [name]
- cleanup | clean

## External File Loading

CRITICAL: Use relative path references and load files only when needed for the current step.

- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- Follow nested `@...` references recursively only when relevant.
- For long files, use Read with `offset`/`limit` to load only needed sections.

## Reference Files (Load On Demand)

1. Manager script -> ../git-worktree/scripts/worktree-manager.sh
2. Examples -> ../git-worktree/references/examples.md
3. Troubleshooting -> ../git-worktree/references/troubleshooting.md
