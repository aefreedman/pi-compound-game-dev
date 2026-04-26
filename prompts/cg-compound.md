---
description: Capture solved problems and compound team knowledge
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

# cg-compound Skill

Purpose: detect multiple solved problems in a session and document each using `unity-docs` sequentially.

## Package Reference Loading

CRITICAL: Use `cg_read_reference` for Compound Game Dev package reference files.

- Pass package-relative paths such as `references/cg-plan/research-agents.md`.
- When an instruction says to load, use, or see a package reference path, call `cg_read_reference` for that path.
- Do NOT use `read` with `references/...`; file tools resolve relative to the current project cwd, not this package.
- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- For long files, use `cg_read_reference` with `offset`/`limit` to load only needed sections.

## Workflow

### Step 0: Resolve Artifact Roots

Load references/_shared/artifact-root-resolution.md and
references/_shared/artifact-path-contract.md.

### Step 1: Detect Solved Problems

- Scan conversation for confirmation phrases.
- Extract context windows and problem indicators.
- Create a short description per solution.

See references/cg-compound/detection-phrases.md.

### Step 2: Document Each Solution (Sequential)

- Invoke `unity-docs` one solution at a time.
- Provide a focus hint (problem, timestamp, confirmation phrase).
- Wait for completion before moving on.

### Step 3: Summary Report

Use references/cg-compound/summary-template.md.

## Error Handling

See references/cg-compound/error-handling.md.

## Reference Files (Load On Demand)

1. Detection phrases -> references/cg-compound/detection-phrases.md
2. Summary -> references/cg-compound/summary-template.md
3. Artifact root resolution -> references/_shared/artifact-root-resolution.md
4. Artifact path contract -> references/_shared/artifact-path-contract.md

On-demand:

- Examples -> references/cg-compound/examples.md
- Best practices -> references/cg-compound/best-practices.md
- Future enhancements -> references/cg-compound/future-enhancements.md
