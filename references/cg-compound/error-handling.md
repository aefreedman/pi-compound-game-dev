# Error Handling

## No Solutions Detected

- Explain possible reasons (no confirmed fixes, no explicit confirmation, planning session).
- Suggest rerun with a brief context hint.
- Suggest manual `skill: unity-docs` for a specific solution.

## All Solutions Skipped as Trivial

- Report each skipped solution with skip reason.
- Clarify that trivial fixes are intentionally skipped.

## unity-docs Invocation Failure

- Report error for the specific solution.
- Continue with remaining solutions.
- Suggest verifying `${DOCS_ROOT}/solutions/` exists.

## Partial Completion

- Report progress and what remains.
- Provide steps to continue or document manually.

## docs/solutions Missing

- Create `${DOCS_ROOT}/solutions/` and retry the failed solution.
