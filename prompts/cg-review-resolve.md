---
description: Run review, auto-triage new todos, and resolve them in parallel on a safe branch
---
## Orchestration

- Delegate specialist work only from the root workflow session when helpful.
- Delegated workers must return handoffs rather than spawning more workers.
- Nested delegation is blocked at runtime.

<review_target>$ARGUMENTS</review_target>

Read and follow these local workflow definitions in strict sequence:

1) `prompts/cg-review.md` (`cg-review`)
2) `prompts/cg-resolve-todo-parallel.md` (`cg-resolve-todo-parallel`)

## Execution rules

- Use the same review prompt and input handling as `cg-review`.
- Run non-interactively. Do not ask triage questions.
- Apply safe defaults and continue; if an item cannot be resolved safely, keep it pending and record why.
- Use atomic commits/checkins for each resolved fix (one todo/fix per commit where feasible, no mixed unrelated changes).

## Branch safety (mandatory)

Before running review/triage/resolve steps, detect VCS and enforce branch safety.

- Never perform write operations on top-level branches.
- If already on a sub-branch, continue using it.
- If on a top-level branch, create and switch to a sub-branch from the current branch, then continue.

Top-level branch rules:

- Git top-level: branch name has no `/` segment (examples: `main`, `dev`, `master`, `release`).
- Plastic top-level: branch matches `^/[^/]+$` (examples: `/main`, `/dev`).

Default branch creation when currently on top-level branch:

- Git: create `review-resolve/<YYYYMMDD>-<short-target>` from current branch.
- Plastic: create `<current-branch>/review-resolve-<YYYYMMDD>` from current branch.

## Workflow

1. Resolve artifact roots (at minimum `TODOS_ROOT`).
2. Capture a pre-review snapshot of pending todo files:
   - `${TODOS_ROOT}/*-pending-*.md`
3. Run `cg-review` with `<review_target>`.
4. Capture a post-review snapshot of pending todo files.
5. Compute todo delta and scope triage to newly created pending review todos only.
6. Auto-triage new pending todos (non-interactive):
   - Promote actionable items from `pending` to `ready`.
   - Update frontmatter `status: pending` -> `status: ready` for promoted items.
   - Append a Work Log triage note for each promoted item.
   - Keep items pending when they are ambiguous, blocked, or conflict with protected-artifact guidance.
7. Run `cg-resolve-todo-parallel` for todos promoted to ready in this run.
   - Prefer resolving `p1`, then `p2`, then `p3`.
   - Ensure commits/checkins are atomic per fix before marking todos complete.
8. Report summary:
   - branch used (and whether it was created),
   - new review todos detected,
   - promoted vs kept pending (with reasons),
   - resolved vs blocked.

## Completion criteria

- Review completed with the same behavior as `cg-review`.
- All newly created review todos were triaged without interactive prompts.
- `cg-resolve-todo-parallel` ran for all newly promoted ready todos.
- No write operations were performed on a top-level branch.
