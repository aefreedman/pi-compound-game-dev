---
name: git-worktree
description: Manage Git worktrees for isolated parallel development
---
# Git Worktree Manager

Use the manager script for all worktree operations.

## Critical Rule

Never call `git worktree add` directly. Use the package manager script at `skills/git-worktree/scripts/worktree-manager.sh`. Resolve that package path before execution instead of assuming it exists under the current project cwd.

## Commands

- create <branch-name> [from-branch]
- list | ls
- switch | go [name]
- copy-env | env [name]
- cleanup | clean

## Package Reference Loading

CRITICAL: Use `cg_read_reference` for Compound Game Dev package reference files.

- Pass package-relative paths such as `skills/git-worktree/references/examples.md`.
- When an instruction says to load, use, or see a package reference path, call `cg_read_reference` for that path.
- Do NOT use `read` with package-reference paths; file tools resolve relative to the current project cwd, not this package.
- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- For long files, use `cg_read_reference` with `offset`/`limit` to load only needed sections.

## Reference Files (Load On Demand)

1. Manager script -> `skills/git-worktree/scripts/worktree-manager.sh`
2. Examples -> `skills/git-worktree/references/examples.md`
3. Troubleshooting -> `skills/git-worktree/references/troubleshooting.md`
