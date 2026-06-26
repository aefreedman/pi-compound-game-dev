# Quick Reference Commands

## Finding Work

```text
# List highest priority unblocked work
cg_search_artifacts scopes=["todos"] status="ready" priority="p1" query="dependencies: []" rankProfile="todos"

# List all pending items needing triage
cg_search_artifacts scopes=["todos"] status="pending" rankProfile="todos"
```

Shell fallback:

```bash
# List highest priority unblocked work
rg -l --glob '*.md' '^dependencies: \[\]' "${TODOS_ROOT}"/*-ready-p1-*.md

# List all pending items needing triage
find "${TODOS_ROOT}" -maxdepth 1 -type f -name '*-pending-*.md'

# Find next issue ID
find "${TODOS_ROOT}" -maxdepth 1 -type f -name '*.md' -printf '%f\n' | grep -o '^[0-9]\+' | sort -n | tail -1 | awk '{printf "%03d", $1+1}'
```

## Searching

Prefer `cg_search_artifacts` when it is available; it auto-refreshes a project-local index from markdown source files and supports structured todo filters:

```text
# Search by tag
cg_search_artifacts scopes=["todos"] tags="security"

# Search by priority/status
cg_search_artifacts scopes=["todos"] priority="p1" status="ready"

# Full-text search
cg_search_artifacts scopes=["todos"] query="physics"
```

Shell fallback, preferably with `rg`:

```bash
# Search by tag
rg -il --glob '*.md' '^tags:.*security' "${TODOS_ROOT}"

# Search by priority
find "${TODOS_ROOT}" -maxdepth 1 -type f -name '*-p1-*.md'

# Full-text search
rg -i --glob '*.md' 'physics' "${TODOS_ROOT}"
```

If `rg` is unavailable, use equivalent `grep -r --include='*.md'` commands.
