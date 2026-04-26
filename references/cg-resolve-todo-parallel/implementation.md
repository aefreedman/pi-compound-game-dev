# Implementation Flow (Reference)

## Step 0: Detect VCS

Load detection logic from ../_shared/vcs-detection.md.

## Step 1: Collect Ready Todos

- Resolve roots first, then list `${TODOS_ROOT}/*-ready-*.md`.
- Filter protected artifacts using ../_shared/protected-artifacts.md.
- If user provided an ID or pattern, filter to matches.

## Step 2: Dependency Analysis

- Parse `dependencies:` from each todo.
- Group by dependency level.
- Execute level-by-level in parallel.

## Step 3: Resolve in Parallel Batches

- Launch one agent per todo in the same level.
- Provide todo content and acceptance criteria.
- Include resolved `WORKSPACE_ROOT` and `TODOS_ROOT` in each agent prompt.
- Agents should not mark complete.

## Step 4: Commit/Checkin

- Prefer atomic commits/checkins per resolved todo (one logical fix per change unit) when feasible.
- Do not mix unrelated fixes in one commit/checkin.
- Git: stage related files only, then commit per resolved fix; use a grouped commit only when changes are tightly coupled.
- Plastic: checkin per resolved fix when feasible; use grouped checkin only when fixes cannot be separated safely.

## Step 5: Mark Todos Complete

- Update todo file contents before any rename:
  - Set frontmatter status fields to completed state.
  - Mark acceptance checklist items with actual completion state.
  - Add a work log entry summarizing implementation and validation.
- Rename files to `*-complete-*` only after content updates are saved.

## Step 6: Push/Sync

- Git: push branch.
- Plastic: changes already synced on checkin.

## Step 7: Summary

Use ./summary-template.md.
