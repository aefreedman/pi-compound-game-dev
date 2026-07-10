# Implementation Flow

## Step 0: Detect VCS and Establish Authority

Load `references/_shared/vcs-detection.md`. Confirm the root session is on a safe writable branch/workspace and record whether commit/checkin and push/sync are authorized.

Only the root/orchestrator invokes subagents. Resolver workers never perform VCS writes, todo lifecycle mutations, review-thread actions, or nested delegation.

## Step 1: Collect Ready Todos

- Resolve `WORKSPACE_ROOT`, `DOCS_ROOT`, and `TODOS_ROOT`.
- List `${TODOS_ROOT}/*-ready-*.md`.
- Filter protected artifacts using `references/_shared/protected-artifacts.md`.
- If the user supplied an ID or pattern, filter to matches.

## Step 2: Dependency and Collision Analysis

- Parse `dependencies:` and likely target files/symbols from each todo.
- Group by dependency level.
- Within each level, run in parallel only when target files are disjoint and validation does not require the same exclusive resource.
- Serialize overlapping or unknown edit scopes.
- Unity agents may prepare disjoint changes in parallel, but the root must serialize batchmode compile/test validation for one project folder.

## Step 3: Delegate Bounded Resolutions

Launch one `cg-pr-comment-resolver` per eligible todo from the root session using `agentScope: "both"` and project-agent confirmation. Follow references/_shared/subagent-execution-profiles.md: inherit by default, and select higher thinking only for resolution slices whose ambiguity or risk justifies it.

Each delegation packet must include:

- the exact todo/finding and acceptance criteria
- target files/symbols and explicit file allowlist
- resolved `WORKSPACE_ROOT`, `DOCS_ROOT`, and `TODOS_ROOT`
- known baseline and pre-existing workspace changes
- explicit authority for minimal workspace edits
- permitted validation and exclusive-resource constraints
- explicit denial of branch, commit/checkin, push/sync, todo rename/status, and review-thread mutations
- stop condition and required `Review Comment Resolution` output contract

The root inspects every worker result and scoped diff. Do not infer success from an edit alone.

## Step 4: Gate by Resolver Status

- `Resolved`: eligible for root validation and completion only when the reported validation is sufficient and the scoped diff matches the todo.
- `Partial`: preserve useful edits when safe, but keep the todo open and record remaining work/validation.
- `Blocked`: keep open and record the blocker and suggested next step.
- `Not Applied`: keep open, return to pending, or close as unwarranted only through a root/user decision supported by the reason.

If an agent output omits required sections or evidence, treat it as `Partial` or `Blocked`, not `Resolved`.

## Step 5: Root Validation and Atomic VCS Writes

- Run or confirm the narrow validation required by each eligible todo.
- Inspect status/diff and preserve unrelated work.
- Commit/check in one logical resolved fix per change unit when feasible and authorized.
- Do not mix unrelated fixes. If concurrent edits cannot be isolated, serialize or stop.

## Step 6: Complete Eligible Todos

Only after validated `Resolved` work and any required atomic VCS write:

- update todo frontmatter to completed state
- mark acceptance items according to observed evidence
- append a work log with implementation, validation, resolver status, and commit/changeset ID when applicable
- rename to `*-complete-*` after content updates are saved

Keep all non-resolved todos open with status/reason recorded.

## Step 7: Push or Sync

- Git: push only when explicitly requested or required by the controlling workflow.
- Plastic: a checkin is already server-visible; run any additional sync action only when explicitly required.
- If remote publication is not authorized, report local commits/checkins awaiting the next action.

## Step 8: Summary

Use `references/cg-resolve-todo-parallel/summary-template.md`.
