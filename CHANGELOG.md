# Changelog

## 0.2.0 - 2026-06-25

### Added

- Added `cg_search_artifacts`, an indexed project-local search tool for Compound Game Dev `docs/` and `todos/` markdown files.
- Added automatic index refresh before every artifact search so generated search data cannot silently become stale.
- Added structured search filters for artifact scope, todo status/priority, solution tags, module, component, problem type, and severity.
- Added ranking controls via `rankProfile`, `matchMode`, `includeBody`, `includeCompletedTodos`, and `explain`.
- Added `docs/artifact-search.md` documenting index location, freshness behavior, search controls, and ranking weights.
- Store the generated index under `${WORKSPACE_ROOT}/.compound-game-dev/artifact-index.json` instead of `.pi/` so Pi runtime/config cleanup does not remove it.
- Normalize legacy todo `status: completed` values to `complete` for structured artifact search filters and ranking.
- Keep the parsed artifact index in memory during the active Pi extension session while preserving pre-search freshness checks.
- Document that projects should normally ignore the generated `.compound-game-dev/` artifact-index cache directory in version control.
- Add per-index in-process queueing and filesystem lock directories to serialize concurrent artifact index refreshes across Pi/agent processes.
- Document the recommended hybrid research pattern: structured indexed search, broad `matchMode="any"` recall, raw `rg` verification, then source markdown reads.
- Add `requiredTerms`, `optionalTerms`, `searchFields`, and `minTermMatches` for broad artifact searches, de-duplicate query terms before scoring, normalize common query separators, and report uncapped total, prepared, and returned result counts separately.
- Store normalized per-field metadata/search text plus body previews in the generated index instead of full markdown bodies, add suggested raw `rg` verification commands, support result grouping by kind, and support directly linked/linking related artifacts when markdown contains explicit project-relative links.
- Add `freshnessMode` and `freshnessTtlMs` so repeated searches can use a dirty-tracked in-memory fast path instead of scanning every markdown file.

### Changed

- Updated learnings and file-todo search guidance to prefer `cg_search_artifacts` when available.
- Updated shell fallback guidance to prefer `rg` over recursive `grep` for markdown artifact searches.
