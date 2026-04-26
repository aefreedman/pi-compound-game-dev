# Decision Handling

## Approve (yes)

1. Rename file from `pending` to `ready` in the filename.
2. Update frontmatter: `status: pending` -> `status: ready`.
3. Append a Work Log entry noting triage approval.

## Skip (skip)

1. Leave the todo as pending.
2. Track the skipped item for summary.

## Delete (delete)

1. Confirm deletion.
2. Delete the todo file.
3. Track the deleted item for summary.

## Modify (custom)

Ask what to change:

- Priority
- Description/filename
- Problem Statement
- Proposed Solutions
- Tags/Category
- Dependencies

Apply changes, present the updated todo, and ask again.

## Protected Artifacts

Before approving, check for findings that suggest deleting or ignoring
`docs/plans/` or `docs/solutions/` under the resolved `DOCS_ROOT`. If detected,
recommend skipping or deleting:

- ../_shared/protected-artifacts.md
