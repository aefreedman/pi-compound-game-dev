# Quick Reference Commands

## Finding Work

```bash
# List highest priority unblocked work
grep -l 'dependencies: \[\]' ${TODOS_ROOT}/*-ready-p1-*.md

# List all pending items needing triage
ls ${TODOS_ROOT}/*-pending-*.md

# Find next issue ID
ls ${TODOS_ROOT}/ | grep -o '^[0-9]\+' | sort -n | tail -1 | awk '{printf "%03d", $1+1}'
```

## Searching

```bash
# Search by tag
grep -l "tags:.*security" ${TODOS_ROOT}/*.md

# Search by priority
ls ${TODOS_ROOT}/*-p1-*.md

# Full-text search
grep -r "physics" ${TODOS_ROOT}/
```
