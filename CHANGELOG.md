# Changelog

## 0.5.0 - 2026-07-09

### Added

- Added macOS CI coverage for package tests and packed-artifact validation.

### Changed

- Aligned planning, review, work-quality, loop, and parallel todo-resolution guidance with the revised agent applicability, authority, output, and stop contracts.
- Routed package-owned agents with `agentScope: "both"`, made resolver completion status-aware and collision-safe, and made Unity test findings evidence-based rather than automatically P1.
- Added task-sensitive subagent execution-profile guidance so coordinators inherit model/thinking settings by default and use explicit per-slice selections only when cost, latency, ambiguity, or risk warrants them.

## 0.4.0 - 2026-07-09

### Changed

- Consolidated Git and Plastic history research into one bounded `cg-vcs-history-analyzer` with backend-specific on-demand references.
- Reworked research, review, and workflow agents around supported frontmatter, explicit tool/output contracts, evidence thresholds, bounded scope, and safer mutation authority.
- Repurposed `cg-pattern-specialist` as an opt-in cross-codebase consistency audit rather than a routine overlapping PR reviewer.
- Made lint checks read-only by default and made review-comment completion statuses conditional on observed edits and validation.
- Updated review and planning routing guidance to select only applicable specialists and discover project-local package agents with `agentScope: "both"`.

### Fixed

- Guaranteed LF line endings for the packaged git-worktree Bash script so it runs correctly on macOS and Linux.
- Replaced GNU-only file-todo `find` commands with portable top-level glob loops for macOS and POSIX shells.

## 0.3.6 - 2026-07-02

### Added

- Added work-execution guidance for large Unity YAML asset editing, including file-based script workflows instead of fragile inline shell heredocs.

## 0.3.5 - 2026-06-29

### Changed

- Added work-execution guidance to resolve documented project-local Python utility environments from the coordination/project root and verify non-stdlib imports before use.

## 0.3.4 - 2026-06-28

### Changed

- Added planning/work guidance for Unity authored-content design-time validation and avoiding permanent magic-number tests over mutable designer-authored data.
- Added plan-formatting guidance to frame plans as the target design rather than primarily as comparisons against old systems.
- Added Windows command-safety guidance for UTF-8-safe helper scripts and robust `rg` glob usage.

## 0.3.3 - 2026-06-27

### Changed

- Added planning/work guidance to distinguish full replacement, migration/conversion, backward-compatible support, and historical alias preservation before adding compatibility behavior.
- Added Unity UI Toolkit guidance to prefer UXML for structure, USS for styling, and C# for behavior/data binding.

## 0.3.2 - 2026-06-27

### Changed

- Updated work-execution quality guidance to load the `unity-batchmode-tests` skill before Unity batchmode/test validation.
- Updated Plastic workflow guidance to prefer the packaged `plastic_mergeToBranch` helper for requested closeout merges.

## 0.3.1 - 2026-06-27

### Added

- Added `outputMode` for artifact search so callers can choose compact default output or detailed snippets/full metadata.

### Changed

- Made artifact search agent-facing output compact by default to reduce token use while preserving detailed structured result data.

## 0.3.0 - 2026-06-26

### Added

- Added Unity solution-doc schema v2 with separate `doc_type`, `category`, and `failure_mode` classification fields.
- Added `scripts/migrate-unity-docs-schema.ts` and the `migrate:unity-docs-schema` npm script for dry-run-first migration of existing Unity solution docs.
- Added `/cg-migrate-unity-docs-schema` to guide agents through project-specific schema migration with VCS checks, dry-run review, optional mapping overrides, and apply validation.
- Added Unity docs category-selection guidance for schema v2 filing and failure-mode decisions.

### Changed

- Updated the `unity-docs` skill, schema guide, and resolution template to use schema v2 and avoid legacy `problem_type` in new docs.
- Updated artifact-search guidance and filters to support schema v2 `docType`, `category`, and `failureMode` metadata while retaining legacy `problemType` filtering for unmigrated docs.

## 0.2.1 - 2026-06-26

### Added

- Added shared repo-research efficiency guidance for root fast-pass investigation, bounded subagent delegation, Plastic-aware `rg` ignore handling, and package/tool selection during research.
- Added conditional Unity repo-research and review guidance reference files so Unity-specific checks are applied only when Unity is detected.

### Changed

- Updated `/cg-plan` and `cg-repo-researcher` to keep repository research scoped, fast, and evidence-focused instead of mapping whole projects by default.
- Updated review prompts and review agents to focus on changed files and directly related local patterns, while still using relevant package tools such as `cg_search_artifacts`, VCS tools, raw `rg`, and companion documentation tools when available.
- Generalized hard-coded Unity wording in review and learnings guidance while preserving access to this package's Unity solution-doc schema when that skill is in use.

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
