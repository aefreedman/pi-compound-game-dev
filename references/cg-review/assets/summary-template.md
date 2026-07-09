# Code Review Summary Template

Use this template to generate the final summary report after findings have been synthesized and todo files created.

```markdown
## Code Review Complete

**Review Target:** [PR #XXXX / Branch: branch-name / Code Review: cr:123]
**Title:** [PR/Review Title]
**VCS:** [Git / PlasticSCM]

### Findings Summary

- **Total Findings:** [X]
- **P1 Critical:** [count] - blocks merge/release until resolved or explicitly accepted
- **P2 Important:** [count] - should be resolved before shipping when practical
- **P3 Nice-to-Have:** [count] - improvements or cleanup

### Created Todo Files

**P1 Critical:**
- `001-pending-p1-{finding}.md` - {description}

**P2 Important:**
- `002-pending-p2-{finding}.md` - {description}

**P3 Nice-to-Have:**
- `003-pending-p3-{finding}.md` - {description}

### Review Agents Used

List only selected specialists and preserve their actual contract outcome:

- `{agent}` — {verdict/result/status} — {reviewed scope or blocker reason}

If `cg-pattern-specialist` ran, include the explicitly requested cross-codebase audit question. Record migration and deployment specialists only when their conditional criteria applied.

### Status Constraints

- P1 findings block merge/release unless explicitly accepted by the user/project owner.
- P2 findings should be handled before shipping when they affect stability, maintainability, or user experience.
- P3 findings are optional improvements.
```

## Variables to Populate

- `[PR #XXXX / Branch: branch-name / Code Review: cr:123]` - review target identifier
- `[PR/Review Title]` - title from PR, branch, or code review
- `[Git / PlasticSCM]` - detected VCS type
- `[X]` / `[count]` - finding counts
- `{finding}` - short kebab-case finding summary
- `{description}` - concise finding description
- `{verdict/result/status}` - the selected agent's actual reported outcome
