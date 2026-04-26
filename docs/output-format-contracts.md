# Output Format Contracts

This package uses templates in two ways: some are workflow contracts, while others are examples or presentation aids. Treat contract changes as behavior changes and double-check them before editing.

## Contracted or contract-adjacent formats

### File todos

Primary files:

- `skills/file-todos/assets/todo-template.md`
- `skills/file-todos/SKILL.md`
- `references/cg-review/synthesis-and-todos.md`
- `references/cg-triage/*`
- `references/cg-resolve-todo-parallel/*`

Contract expectations:

- Todo files are markdown files with YAML frontmatter.
- Frontmatter fields such as `status`, `priority`, `issue_id`, `tags`, and `dependencies` are workflow-significant.
- Filename/status conventions are workflow-significant because triage and resolution workflows distinguish pending, ready, and complete todos.
- The sections are allowed to simplify, but changes must preserve enough information for triage, resolution, acceptance criteria, and work-log updates.

### Plan documents

Primary files:

- `references/cg-plan/assets/plan-template-minimal.md`
- `references/cg-plan/assets/plan-template-standard.md`
- `references/cg-plan/assets/plan-template-comprehensive.md`
- `prompts/cg-plan.md`
- `prompts/cg-work.md`

Contract expectations:

- Plans are durable `docs/plans/` artifacts and should be reviewed carefully before broad template changes.
- `/cg-work` expects a plan/spec/todo path, reads plan checkboxes, and updates completed work.
- Tier names in instructions and filenames must stay consistent.
- The three-tier structure is intentional, but individual sections can be simplified if they do not affect execution.

### Review findings and summaries

Primary files:

- `prompts/cg-review.md`
- `references/cg-review/synthesis-and-todos.md`
- `references/cg-review/assets/summary-template.md`

Contract expectations:

- Review output must preserve severity levels P1/P2/P3.
- Findings that become todos should include enough detail for file-todo creation and later resolution.
- Final summaries should report what happened; they should not include generic next-step menus unless the next step is highly context-relevant and approved.

### Work submission descriptions

Primary files:

- `references/cg-work/assets/pr-template.md`
- `references/cg-work/assets/code-review-template.md`
- `references/cg-work/git-workflow.md`
- `references/cg-work/plastic-workflow.md`

Contract expectations:

- Attribution stays in PR and commit examples.
- Screenshots are required when the change is visual.
- Screenshots/design references are conditional for non-visual changes.
- Git and Plastic flows intentionally differ. Keep the active VCS workflow locked for a run and do not merge generic Git/VCS guidance with Plastic-specific guidance solely to reduce duplication.

### Changelog output

Primary files:

- `prompts/cg-changelog.md`
- `references/cg-changelog/output-template.md`

Contract expectations:

- Changelog entries should stay traceable to available source items such as cards, commits, changesets, or URLs.
- Sections may be simplified, but traceability and concrete user-facing wording are important.

## Non-contract examples and guidance

These can usually be simplified more aggressively after confirming they are not parsed or relied on by another workflow:

- long populated examples inside templates
- section-by-section explanations beneath templates
- illustrative code snippets in plan templates
- specialist-agent output formats, unless a prompt expects exact headings

## Review rule

Before changing a template, classify it as one of:

1. **Contract**: parsed, lifecycle-significant, or directly consumed by another workflow.
2. **Durable doc shape**: not parsed, but affects `docs/` artifacts users keep and maintain.
3. **Example/guidance**: illustrative and safe to simplify when behavior remains clear.

Document the classification in the edit summary when changing output formats.
