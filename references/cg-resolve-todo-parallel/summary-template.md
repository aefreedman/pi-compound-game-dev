```markdown
## Todo Resolution Summary

**VCS:** [Git / PlasticSCM / None]
**Branch/workspace:** [identifier]
**Todos considered:** [count]

### Resolver Outcomes

| Todo | Resolver status | Scope | Validation | Todo state | VCS write |
|------|-----------------|-------|------------|------------|-----------|
| #001 | Resolved | [files/symbols] | [evidence] | complete | [commit/changeset or none] |
| #002 | Partial | [files/symbols] | [missing/failed evidence] | remains open | none |
| #003 | Blocked | [scope] | [blocker] | remains open | none |
| #004 | Not Applied | [scope] | [reason] | pending/closed by root decision | none |

### Completed Todos

- #001: [description] — [changed files] — [validation]

### Open or Unapplied Todos

- #002 — Partial — [remaining work and next step]
- #003 — Blocked — [blocker and owner/input needed]
- #004 — Not Applied — [reason and root/user disposition]

### VCS Writes

- [commit/changeset ID]: [todo and message]
- Remote publication: pushed/synced | local only | not applicable | failed ([reason])

### Todo File Updates

- [todo]: [frontmatter/checklist/work-log/rename evidence]
- Confirm that only validated `Resolved` todos were completed.

### Validation

- `[command or manual check]` — [result and affected todo(s)]
- [exclusive Unity/project validation was serialized, when applicable]

### Safety and Remaining Constraints

- Unexpected/pre-existing workspace changes: [preserved details or none]
- Unresolved P1/P2 items: [list and release impact]
- External/review-thread actions: [explicitly authorized result or none]

### Statistics

- Parallel batches: [count]
- Serialized overlap groups: [count]
- Resolved / Partial / Blocked / Not Applied: [counts]
- Files modified: [count]
```
