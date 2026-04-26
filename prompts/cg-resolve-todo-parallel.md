---
description: Resolve ready todos using safe parallel processing
---
## Orchestration

- Delegate specialist work only from the root workflow session when helpful.
- Delegated workers must return handoffs rather than spawning more workers.
- Nested delegation is blocked at runtime.

## Game-Development Stack Awareness

- Read project-specific stack guidance from `AGENTS.md` or a similar project-local guidance file when present.
- Detect what can be detected about the engine, VCS, project tracker, build/test pipeline, and content pipeline.
- Ask targeted questions for missing stack facts instead of assuming Git, GitHub, Unity, PlasticSCM, Codecks, or any other tool.
- Use companion Pi packages when available and relevant; otherwise provide a clear fallback.

# Resolve Todo Parallel

## External File Loading

CRITICAL: Use relative path references and load files only when needed for the current step.

- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- Follow nested `@...` references recursively only when relevant.
- For long files, use Read with `offset`/`limit` to load only needed sections.

## Workflow

1. Resolve artifact roots.
2. Detect VCS (load ../references/_shared/vcs-detection.md).
3. Collect ready todos from `${TODOS_ROOT}` and filter protected artifacts.
4. Analyze dependencies and group by level.
5. Resolve todos in parallel batches.
6. Commit/checkin changes using atomic commits.
7. Mark todos complete and update work logs.
8. Push/sync (Git/Plastic).
9. Generate summary.

## Reference Files (Load On Demand)

1. VCS detection -> ../references/_shared/vcs-detection.md
2. Implementation flow -> ../references/cg-resolve-todo-parallel/implementation.md
3. Guidance -> ../references/cg-resolve-todo-parallel/guidance.md
4. Error handling -> ../references/cg-resolve-todo-parallel/error-handling.md
5. Summary template -> ../references/cg-resolve-todo-parallel/summary-template.md
6. Artifact root resolution -> ../references/_shared/artifact-root-resolution.md
7. Artifact path contract -> ../references/_shared/artifact-path-contract.md

On-demand:

- Protected artifacts -> ../references/_shared/protected-artifacts.md
