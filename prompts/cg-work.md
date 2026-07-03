---
description: Execute work plans while adapting to the project game-dev stack
---
## Input Document

<input_document> $ARGUMENTS </input_document>

If no document provided, ask for the plan/spec/todo file path.

## Slash-Command Intent Handling

- If the user mentions a command in prose or as a question (for example, asking what `cg-work` does), explain the command and expected behavior.
- Execute command workflows only when user intent to run is explicit.
- Do not treat quoted or example command text as execution intent.

## Package Reference Loading

CRITICAL: Use `cg_read_reference` for Compound Game Dev package reference files.

- Pass package-relative paths such as `references/cg-plan/research-agents.md`.
- When an instruction says to load, use, or see a package reference path, call `cg_read_reference` for that path.
- Do NOT use `read` with `references/...`; file tools resolve relative to the current project cwd, not this package.
- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- For long files, use `cg_read_reference` with `offset`/`limit` to load only needed sections.

## Workflow

### Phase 1: Quick Start

1. Read the plan and clarify ambiguities.
2. Detect VCS using references/_shared/vcs-detection.md.
3. Load ONLY the VCS workflow that applies to the project. Do not load both.
   - IF Git: references/cg-work/git-workflow.md
   - IF Plastic: references/cg-work/plastic-workflow.md
4. Lock the selected VCS workflow for this run.
   - Set `ACTIVE_VCS_WORKFLOW` to `git` or `plastic`.
   - Do not load or apply instructions from the other VCS workflow.
   - If guidance conflicts, the active workflow file controls VCS write behavior.

### Phase 2: Execute

- Always create a branch. Use the configured issue tracker to inform the name. Do not work directly on /dev or /main
- Follow plan steps and existing patterns.
- For tasks that create or edit Unity serialized text assets (`.unity`, `.prefab`, `.asset`, `.mat`, `.controller`, `.meta`, etc.), load and follow references/cg-work/unity-yaml-assets.md before generating or transforming large YAML-like content.
- Update and check off plan checkboxes.
- Create incremental, atomic VCS writes based on active workflow and branch type.
  - Git: commits on sub-branches by default; top-level branches require explicit user instruction.
  - Plastic: checkins on sub-branches by default; top-level branches require explicit user instruction.
- Use conventional commits: references/_shared/conventional-commits.md.

### Phase 3: Quality Check

Ensure the new work compiles and utilize tests and CLI tools to debug until the issues are resolved.
For Unity projects, Unity batchmode compile validation is mandatory in this phase, even when no tests exist.
Run Unity batchmode and Unity Test Framework invocations serially per project folder; do not launch multiple Unity processes for the same project in parallel.
Run tests, linting, and manual verification using:

- references/cg-work/quality-checklist.md

Ensure that all phases and todo items in the plan are complete.

### Phase 4: Ship

1. If visual changes and workflow supports, capture screenshots using the companion `capturing-screenshots-unity` skill from `pi-unity` when available. If `pi-unity` is unavailable or the project is not a Unity project, skip screenshot capture with a concise note.
2. Create final commit/checkin and PR/code review using VCS workflow:
   - IF Git: references/cg-work/assets/pr-template.md
   - IF Plastic: Do NOT create a code review automatically
3. Summarize outcomes.
