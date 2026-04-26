---
description: Triage findings for the file-based todo system
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

# Triage Skill

Purpose: triage pending todo items before implementation. Do not implement fixes.

## When to Use

- After code review or audits that generated pending todos.
- Before running `/cg-resolve-todo-parallel`.

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
2. Detect pending todos and VCS.
3. Present each todo for user decision.
4. Apply decisions (approve/skip/modify).
5. Summarize results.

## Reference Files (Load On Demand)

1. Setup and detection -> references/cg-triage/setup-detection.md
2. Presentation format -> references/cg-triage/presentation-format.md
3. Decision handling -> references/cg-triage/decision-handling.md
4. Summary and next actions -> references/cg-triage/summary.md
5. Error handling -> references/cg-triage/error-handling.md
6. Artifact root resolution -> references/_shared/artifact-root-resolution.md
7. Artifact path contract -> references/_shared/artifact-path-contract.md

On-demand:

- Examples -> references/cg-triage/examples.md
- Protected artifacts -> references/_shared/protected-artifacts.md
- Todo template -> skills/file-todos/assets/todo-template.md
