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
for todo in "${TODOS_ROOT}"/*-pending-*.md; do
  [ -f "${todo}" ] || continue
  printf '%s\n' "${todo}"
done

# Find next issue ID
for todo in "${TODOS_ROOT}"/*.md; do
  [ -f "${todo}" ] || continue
  printf '%s\n' "${todo##*/}"
done | grep -o '^[0-9]\+' | sort -n | tail -1 | awk '{printf "%03d", $1+1}'
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
for todo in "${TODOS_ROOT}"/*-p1-*.md; do
  [ -f "${todo}" ] || continue
  printf '%s\n' "${todo}"
done

# Full-text search
rg -i --glob '*.md' 'physics' "${TODOS_ROOT}"
```

If `rg` is unavailable, use equivalent `grep -r --include='*.md'` commands.
