# Error Handling

## No Pending Todos

- Report that there are no pending todos.
- Suggest running `/cg-review` or creating todos manually.

## Invalid Todo Structure

- If required sections are missing, warn and recommend skip.
- Reference ../../skills/file-todos/assets/todo-template.md.

## VCS Unavailable

- If no Git/Plastic detected, skip commit/checkin options.

## Commit/Checkin Failures

- Report failure without blocking.
- Suggest manual commit/checkin later.
