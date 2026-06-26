---
description: Groom project docs/todos markdown for search quality and artifact consistency
---
# Groom Docs

Purpose: review and improve project-local markdown artifacts so they remain human-readable while becoming easier to find through `cg_search_artifacts` and raw `rg`.

Do not change implementation code. Do not rewrite docs wholesale unless the user explicitly asks. Prefer small, reviewable metadata/title/tag/cross-reference edits.

## Package Reference Loading

CRITICAL: Use `cg_read_reference` for Compound Game Dev package reference files.

- Pass package-relative paths such as `references/cg-groom-docs/guidance.md`.
- When an instruction says to load, use, or see a package reference path, call `cg_read_reference` for that path.
- Do NOT use `read` with `references/...`; file tools resolve relative to the current project cwd, not this package.
- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.

## Workflow

1. Resolve artifact roots.
2. Load `references/cg-groom-docs/guidance.md`.
3. Inspect the requested docs/todos scope using `cg_search_artifacts` when available, plus raw `rg` for verification.
4. Identify search-quality issues: weak titles, missing/over-generic tags, missing frontmatter, inconsistent status/priority, missing related-doc links, legacy Unity solution-doc schema fields, or important terms only buried in body text.
5. For Unity solution docs, use schema v2 fields for new/edited docs. Do not perform a bulk legacy `problem_type` migration by hand during grooming; direct the user to `/cg-migrate-unity-docs-schema` or the migrator dry-run/apply workflow.
6. Present proposed edits before applying unless the user explicitly requested automatic cleanup.
7. Apply focused markdown/frontmatter edits only after approval or explicit instruction.
8. Summarize changed files and remaining recommendations.

## Reference Files

1. Grooming guidance -> `references/cg-groom-docs/guidance.md`
2. Artifact root resolution -> `references/_shared/artifact-root-resolution.md`
3. Artifact path contract -> `references/_shared/artifact-path-contract.md`
4. Artifact search docs -> `docs/artifact-search.md`
5. Authoring guidance -> `docs/markdown-artifact-authoring.md`
