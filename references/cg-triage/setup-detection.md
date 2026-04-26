# Setup and Detection

## Prerequisites

- Resolve artifact roots first using ../_shared/artifact-root-resolution.md.
- `${TODOS_ROOT}` directory exists.
- ../../skills/file-todos/assets/todo-template.md for expected sections.

## Pending Todo Discovery

- List pending todos with a glob on `${TODOS_ROOT}/*-pending-*.md`.
- If none found, report that there is nothing to triage and stop.
- Track total count for progress reporting.

## VCS Detection (Optional)

- Detect VCS using ../_shared/vcs-detection.md.
- Detect branch type (top-level vs sub-branch) before offering commit/checkin actions.
- Top-level branches: offer commit/checkin only when the user explicitly requests it.
- Sub-branches (for example, `feat/*`, `fix/*`, `bugfix/*`, `task/*`): follow atomic commit/checkin policy by default (one logical change per commit/checkin, no unrelated mixing), especially when the branch was created by the agent in the current run.
