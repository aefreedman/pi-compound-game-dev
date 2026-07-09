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

## Orchestration and Authority

- Only the root/orchestrator session may invoke subagents. Delegated workers must perform their bounded task directly or return a parent handoff; they must not launch this workflow or nested specialists.
- Invoke package-owned `cg-pr-comment-resolver` workers with `agentScope: "both"` and project-agent confirmation enabled.
- Resolver workers may make only explicitly authorized workspace edits. They may not commit/check in, push, mutate todo lifecycle/status, or change review threads; the root owns those operations.

## Workflow

1. Resolve artifact roots.
2. Detect VCS (load references/_shared/vcs-detection.md).
3. Collect ready todos from `${TODOS_ROOT}` and filter protected artifacts.
4. Analyze dependencies and target-file overlap. Group only dependency-independent, file-disjoint work for parallel execution; serialize overlapping or unknown scopes.
5. Delegate one todo per `cg-pr-comment-resolver` worker using the contract in the implementation reference. For Unity projects, coordinate same-project batchmode/test validation serially from the root session.
6. Gate follow-up on resolver status. Only a validated `Resolved` result is eligible for completion; keep `Partial`, `Blocked`, and `Not Applied` items open with their reasons.
7. Review each scoped diff, then commit/check in eligible changes atomically when authorized.
8. Mark eligible todos complete and update work logs from observed evidence.
9. Push/sync only when explicitly requested or required by the controlling project workflow.
10. Generate summary.

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
