---
description: Resolve ready todos using safe parallel processing
---
# Resolve Todo Parallel

## Package Reference Loading

CRITICAL: Use `cg_read_reference` for Compound Game Dev package reference files.

- Pass package-relative paths such as `references/cg-plan/research-agents.md`.
- When an instruction says to load, use, or see a package reference path, call `cg_read_reference` for that path.
- Do NOT use `read` with `references/...`; file tools resolve relative to the current project cwd, not this package.
- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- For long files, use `cg_read_reference` with `offset`/`limit` to load only needed sections.

## Workflow

1. Resolve artifact roots.
2. Detect VCS (load references/_shared/vcs-detection.md).
3. Collect ready todos from `${TODOS_ROOT}` and filter protected artifacts.
4. Analyze dependencies and group by level.
5. Resolve todos in parallel batches. For Unity projects, do not run Unity batchmode/test validation in parallel against the same project folder; coordinate those validation runs serially from the root session.
6. Commit/checkin changes using atomic commits.
7. Mark todos complete and update work logs.
8. Push/sync (Git/Plastic).
9. Generate summary.

## Reference Files (Load On Demand)

1. VCS detection -> references/_shared/vcs-detection.md
2. Implementation flow -> references/cg-resolve-todo-parallel/implementation.md
3. Guidance -> references/cg-resolve-todo-parallel/guidance.md
4. Error handling -> references/cg-resolve-todo-parallel/error-handling.md
5. Summary template -> references/cg-resolve-todo-parallel/summary-template.md
6. Artifact root resolution -> references/_shared/artifact-root-resolution.md
7. Artifact path contract -> references/_shared/artifact-path-contract.md

On-demand:

- Protected artifacts -> references/_shared/protected-artifacts.md
