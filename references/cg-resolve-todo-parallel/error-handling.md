# Error Handling

## No Ready Todos

Report that no matching ready todos were found, including the resolved `TODOS_ROOT` and any ID/pattern filter. Do not mutate todo files.

## Resolver Outcomes Other Than `Resolved`

For each todo, preserve the exact `cg-pr-comment-resolver` outcome:

- `Partial` — useful work exists, but required changes or validation remain
- `Blocked` — a concrete dependency, conflict, missing capability, or unsafe overlap prevented completion
- `Not Applied` — no warranted/authorized workspace change was made

Keep these todos open. Report the worker's `Unresolved or Out of Scope` and `Workspace and External Actions` sections. Do not commit, complete, rename, or silently reclassify the todo based only on partial edits.

Suggested next actions may include narrowing the scope, obtaining clarification, serializing an overlap, running missing validation, or resolving manually. Re-run only after the relevant input changes.

## Invalid or Incomplete Agent Output

If required resolver sections/status are missing, treat the result as `Partial` or `Blocked`. Inspect the workspace for unexpected edits, preserve unrelated work, and do not infer success from process exit alone.

## Commit or Checkin Failures

- Keep the todo open until the root verifies whether the implementation remains safely present.
- Git: inspect `git status` and a text diff; report hook/conflict/no-change evidence.
- Plastic: inspect `plastic_status`; use text-only Plastic diff tools when a revision comparison is needed. Do not run `cm diff`, which may launch a GUI.
- Never discard pre-existing work to make a VCS write succeed.

## Push or Sync Failures

Report that local commits/checkins exist and remote publication failed. Include the branch/workspace and identifiers, but do not retry destructively or pull/merge automatically without workflow authorization.

## Dependency or File-Overlap Conflicts

- Circular dependency: keep affected todos open and report the cycle.
- Overlapping/unknown target files: move the work out of the parallel batch and serialize it.
- Concurrent unexpected edits: stop affected workers, inspect the workspace, and preserve all unrelated changes.

## Unity Validation Contention

Never run concurrent Unity processes against one project folder. If the project is busy or locked, let the root inspect project status and either serialize validation, use a separate project copy, or report the blocker. Do not delete Unity lockfiles automatically.
