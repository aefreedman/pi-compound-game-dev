# Markdown Artifact Authoring Guidance

Compound Game Dev uses human-readable markdown files under project `docs/` and `todos/` as canonical planning, todo, and learning artifacts. Generated indexes can accelerate search, but source markdown should remain useful on its own.

## Authoring for Search

Write for both humans and retrieval:

- Put the main searchable concept in the title.
- Use specific tags and aliases in frontmatter.
- Include exact error messages, API names, asset names, scene names, and subsystem names when they matter.
- Add related-doc links so plans, todos, and solutions reinforce each other.
- Use stable names consistently across docs.

## Recommended Frontmatter

For solution/learning docs, include structured fields when applicable:

```yaml
---
title: Objective GUID dropdown saved empty target
module: Editor Tools
problem_type: editor_workflow
component: editor_script
severity: high
tags: [objective-guid, objective-dropdown, empty-target, mission-authoring]
---
```

For todos, keep filename and frontmatter aligned:

```yaml
---
status: pending
priority: p2
issue_id: 123
tags: [mission-teardown, objective-modal, lifecycle]
dependencies: []
---
```

Use `status: complete`, not `status: completed`, when editing todo files.

## Tags

Good tags are specific enough to distinguish a problem:

- `mission-teardown`
- `objective-modal`
- `ui-toolkit`
- `batchmode-screenshot`
- `action-definition`
- `asset-migration`

Broad tags are useful only when paired with specifics:

- `runtime`
- `ui`
- `validation`
- `cleanup`
- `architecture`

## Aliases

Add aliases when the project uses multiple spellings:

```yaml
tags: [actiondefinition, action-definition, asset-migration]
```

Body text can also include aliases naturally:

```markdown
This applies to ActionDefinition assets (also referred to as action definitions in older docs).
```

## Related Artifacts

Prefer explicit project-relative links. `cg_search_artifacts includeRelated=true` can only connect artifacts when docs mention resolvable `docs/...md` or `todos/...md` paths.

```markdown
## Related Issues

- Related plan: docs/plans/YYYY-MM-DD-feature-objective-binding-plan.md
- Follow-up todo: todos/123-pending-p1-plan-action-asset-migration.md
- Similar solution: docs/solutions/editor-workflow/objective-guid-dropdown-saved-empty-target-YYYYMMDD.md
```

## Body Structure

For solution docs, include:

- Problem
- Environment or affected system
- Symptoms
- What did not work
- Solution
- Why this works
- Prevention
- Related issues

For plans and todos, include enough searchable context that a future agent can tell whether the artifact is relevant without reading implementation code first.

## Search Validation Before Saving Important Docs

Before finishing important docs, test likely search terms:

```text
cg_search_artifacts query="objective guid dropdown empty target" scopes=["docs","todos"] matchMode="any" minTermMatches=2 explain=true
```

Then verify exact body text if needed:

```bash
rg -i --glob '*.md' 'objective guid|empty target|ObjectiveGuid' "${DOCS_ROOT}" "${TODOS_ROOT}"
```
