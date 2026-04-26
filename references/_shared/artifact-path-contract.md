# Artifact Path Contract

This contract keeps artifact behavior consistent across all skills.

## Cross-Skill Requirements

1. Any skill that reads or writes `docs/` or `todos/` MUST first load:
   - ./artifact-root-resolution.md
2. Shared skill references MUST stay project-agnostic.
3. Project-specific workspace conventions MUST live in
   `artifact-roots.config.yaml` at the coordination root.
4. Logical names remain stable across projects:
   - `docs/...`
   - `todos/...`

## Subagent Requirements

- When launching subagents from coordination contexts, pass resolved
  `WORKSPACE_ROOT`, `DOCS_ROOT`, and `TODOS_ROOT` explicitly in the prompt.
- Subagents must not infer workspace roots by guesswork when multiple candidates
  exist.

## Example and Snippet Requirements

- Prefer `${DOCS_ROOT}` and `${TODOS_ROOT}` in shell snippets.
- If using logical `docs/...` or `todos/...` examples, label them as
  "workspace-root relative".
- Do not include snippets that could create root-level coordination artifacts.

## Protected Artifact Requirements

- Protected artifact checks must match path segments, not only root-relative
  string prefixes.
- Equivalent paths such as `docs/plans/...` and `<workspace>/docs/plans/...` must both
  be treated as protected artifact locations.

## Change Management

- If updating any artifact-related skill, verify this contract still holds.
- If switching from workspace-scoped mode to shared mode later, update only
  project adapter values, not global logical path conventions.
