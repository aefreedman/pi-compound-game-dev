# Artifact Search Index

Compound Game Dev keeps `docs/` and `todos/` markdown files as the source of truth. The `cg_search_artifacts` tool adds a generated, project-local index so agents can search those human-readable files with structured filters, ranking, and snippets.

## Index Location

By default the generated index is written to:

```text
${WORKSPACE_ROOT}/.compound-game-dev/artifact-index.json
```

The index path must stay inside `WORKSPACE_ROOT`. Agents should cite the markdown files returned by search results, not the generated index.

The default deliberately uses `.compound-game-dev/` instead of `.pi/` because `.pi/` may be treated as disposable Pi runtime or configuration state by cleanup workflows.

## Version-Control Ignore Guidance

The generated artifact index is project-local cache data, not source documentation. Projects should normally ignore it in version control:

```gitignore
.compound-game-dev/
```

Do not ignore `docs/` or `todos/`; only ignore the generated `.compound-game-dev/` cache directory.

## Staleness Control

`cg_search_artifacts` refreshes the index before every search:

1. Enumerate current `.md` files under `DOCS_ROOT` and `TODOS_ROOT`.
2. Compare indexed path, size, and modified time against the current files.
3. Parse only new or changed files.
4. Remove deleted files from the index.
5. Write the refreshed generated index before returning search results.

Use `rebuild: true` to force a full rebuild.

## In-Memory Cache

Within a running Pi extension session, `cg_search_artifacts` keeps the parsed index object in memory keyed by `indexPath`. The generated index stores normalized metadata/headings/search text and a short body preview, but not full markdown bodies by default; use raw `rg` for detailed body-text verification.

Default freshness mode is `auto`: after a strict refresh validates the index, repeated searches can use the in-memory index for `freshnessTtlMs` milliseconds, provided no docs/todos write was observed and no lock file exists. The extension marks the default project index dirty when Pi `write`/`edit` tools modify files under `docs/` or `todos/`, and conservatively marks it dirty after suspicious shell commands that may mutate markdown artifacts.

Freshness controls:

- `freshnessMode: "auto"` - default dirty-tracking + TTL fast path.
- `freshnessMode: "strict"` - scan markdown files every search.
- `freshnessMode: "memory"` - trust the loaded index when present; fastest, least conservative.
- `freshnessTtlMs` - auto-mode fast-path TTL; defaults to `30000`.

The in-memory cache is intentionally session-local and disposable. Restarting Pi or reloading extensions drops it; the generated project index remains on disk and will be loaded again on demand.

## Concurrent Search Safety

`cg_search_artifacts` serializes index refreshes per `indexPath` in two ways:

1. An in-process queue prevents two tool calls in the same Pi process from refreshing the same index simultaneously.
2. A filesystem lock directory prevents separate Pi/agent processes from writing the same index simultaneously.

The lock directory is created next to the index:

```text
${WORKSPACE_ROOT}/.compound-game-dev/artifact-index.json.lock/
```

Lock acquisition uses atomic directory creation. The tool waits up to 30 seconds for an active lock, checks every 100 ms, and treats locks older than 120 seconds as stale. The lock is released in a `finally` block after refresh completes or fails. After waiting for another process, the tool re-loads/re-checks the index under the lock before writing, preserving the normal freshness guarantees.

## Hybrid Search Workflow

Use the index and raw markdown search together instead of treating either one as the only source:

1. **Index, structured pass** - use `cg_search_artifacts` with `scopes`, status/priority, schema v2 `docType`/`category`/`failureMode`, legacy `problemType`, tags, module, or severity filters to get high-signal candidates. For a metadata-first pass, set `includeBody: false` to reduce body-text noise.
2. **Index, broad recall pass** - for exploratory feature descriptions, use `matchMode: "any"` with a focused synonym list. This catches gotchas that do not contain every term in the user request.
3. **Raw docs verification** - use `cg_search_repo` on the resolved docs/todos roots for final keywords, API names, code symbols, paths, and exact error text. It applies bounded output and explicit negative-evidence semantics; use raw `rg` only when `cg_search_repo` is unavailable or the search shape is unsupported.
4. **Read markdown source** - read the final candidate `.md` files directly before planning or citing evidence. The index is a discovery aid, not a substitute for source docs.

Good default patterns:

```text
# High-signal plan discovery
cg_search_artifacts query="control scheme input prompts" scopes=["plans"] rankProfile="frontmatter" explain=true

# Exploratory gotcha discovery
cg_search_artifacts requiredTerms=["objective"] optionalTerms=["binding","location guid","empty target","dropdown"] scopes=["docs","todos"] matchMode="any" minTermMatches=2 rankProfile="frontmatter" explain=true

# Todo work discovery
cg_search_artifacts query="mission teardown lifecycle" scopes=["todos"] status="pending" priority="p1" rankProfile="todos" includeCompletedTodos=false explain=true

# Raw verification after indexed discovery
cg_search_repo workspaceRoot="${WORKSPACE_ROOT}" roots=["${DOCS_ROOT}","${TODOS_ROOT}"] queries=[{"id":"editor-only","pattern":"UnityEditor|player build|editor-only","literal":false}] globs=["*.md"]
```

Avoid using one broad `matchMode: "all"` query as the only research step for a natural-language feature. It is intentionally precise and may miss useful docs that contain only some of the terms. Conversely, very broad `matchMode: "any"` queries can surface single-term noise; add `requiredTerms` and/or `minTermMatches` when the query has many common terms.

## Search Controls

Important parameters:

- `workspaceRoot` - project root; defaults to the current Pi cwd.
- `docsRoot` - docs root; defaults to `${WORKSPACE_ROOT}/docs`.
- `todosRoot` - todos root; defaults to `${WORKSPACE_ROOT}/todos`.
- `indexPath` - generated index path; defaults to `${WORKSPACE_ROOT}/.compound-game-dev/artifact-index.json`.
- `scopes` - one or more of `all`, `docs`, `solutions`, `plans`, `todos`.
- `query` - plain-text search query; quoted phrases are kept as single terms.
- `requiredTerms` - one or more terms/phrases that must be present. Use this for system names, feature names, or identifiers that define the search.
- `optionalTerms` - extra terms/phrases used for matching/scoring in addition to `query`.
- `matchMode` - `all`, `any`, or `phrase`. Use `all` for precise searches, `any` for exploratory recall/gotcha discovery, and `phrase` for exact phrase validation.
- `minTermMatches` - minimum number of unique query/optional terms that must match. Use this with `matchMode: "any"` to reduce noise from single common terms while keeping broad recall.

Query matching normalizes common separators, so `ui-toolkit`, `ui_toolkit`, `ui/toolkit`, and `ui toolkit` can match the same indexed text. The index stores normalized per-field search text at build time so repeated searches do not have to recompute normalization for every field. Structured filters such as `docType`, `category`, `failureMode`, and legacy `problemType` still use frontmatter values rather than query-term normalization.

Search results include a suggested raw `rg` verification command when query terms are present. Use it as a starting point for exact source-text validation; refine the pattern for API names, file paths, or error strings when needed.

By default, agent-facing output uses `outputMode: "compact"`: one line per result, no snippets, and no full generated index path. Use `outputMode: "detailed"` when you need verbose snippets, full frontmatter fields, and the index path in the text response. Structured result details still include paths, snippets, metadata, and index path for programmatic consumers.

- `includeBody` - include body preview text in query matching; defaults to `true`. Full body text is intentionally not stored in the index by default; use raw `rg` for full-body verification.
- `searchFields` - explicit fields to search/score: `path`, `title`, `tags`, `frontmatter`, `headings`, `body`. Use `searchFields: ["title","tags","frontmatter","path"]` for low-noise metadata discovery, then raw `rg` or a body-inclusive index pass for detailed verification.
- `includeRelated` - include directly linked/linking artifacts when markdown references point to other `docs/...md` or `todos/...md` files.
- `relatedLimit` - maximum related artifacts per result; defaults to `5`.
- `groupByKind` - group displayed results by artifact kind (`plan`, `solution`, `todo`, etc.) while preserving score order inside each group.
- `includeCompletedTodos` - include completed todos when no explicit status filter is supplied; defaults to `true`.
- `status`, `priority`, `tags`, `module`, `component`, `docType`, `category`, `failureMode`, `problemType`, `severity` - structured frontmatter filters. `docType`, `category`, and `failureMode` target Unity solution-doc schema v2; `problemType` remains for legacy/unmigrated solution docs. Todo status normalizes legacy `completed` values to `complete`.
- `limit` - maximum displayed results; defaults to `20`.
- `maxSnippetChars` - approximate maximum snippet characters; defaults to `220`.
- `explain` - include scoring reasons for each result.
- `outputMode` - `compact` or `detailed`; compact is the default to reduce agent token use.
- `freshnessMode` - `auto`, `strict`, or `memory`; controls whether searches can use the in-memory fast path.
- `freshnessTtlMs` - auto-mode TTL for skipping full markdown scans after a recent validated refresh.

## Related Artifact Links

When `includeRelated` is true, `cg_search_artifacts` looks for markdown references to `docs/...md` and `todos/...md` in indexed files and returns direct `linksTo` / `linkedFrom` artifacts for matching results. This works best when docs use explicit project-relative links in related-issues sections.

If related results are empty, the usual cause is that the markdown files mention concepts but do not include explicit `docs/...md` or `todos/...md` links. Use `/cg-groom-docs` to add useful cross-references.

## Ranking Controls

`rankProfile` controls result ranking:

- `balanced` - default ranking for mixed docs/todos search.
- `frontmatter` - boosts title, tags, and other frontmatter; reduces body-text influence.
- `recency` - adds a recency boost from file modification time.
- `todos` - boosts todo status/priority and slightly increases title/frontmatter influence.

Default field weights:

| Signal | Weight |
| --- | ---: |
| title | 10 |
| tags | 8 |
| frontmatter | 6 |
| headings | 4 |
| path | 3 |
| body | 1 |
| exact phrase bonus | 5 |

Boosts:

| Signal | Boost |
| --- | ---: |
| severity: critical | +3 |
| severity: high | +2 |
| severity: medium | +1 |
| severity: low | +0.25 |
| todo status: ready | +3 |
| todo status: pending | +2 |
| todo status: complete | -0.5 |
| todo status: blocked | -1 |
| todo priority: p1 | +3 |
| todo priority: p2 | +1.5 |
| todo priority: p3 | +0.5 |

Set `explain: true` when you need to audit why an agent ranked results in a particular order.

## Examples

```text
cg_search_artifacts query="ui toolkit validation" scopes=["solutions"] rankProfile="frontmatter" explain=true
cg_search_artifacts scopes=["todos"] status="ready" priority="p1" includeCompletedTodos=false
cg_search_artifacts query="Addressables build" scopes=["docs","todos"] matchMode="all" limit=10
cg_search_artifacts scopes=["solutions"] category=["ui","serialization_data"] failureMode="runtime_exception"

cg_search_artifacts scopes=["solutions"] severity=["critical","high"] tags="validation"
```

## Fallback

If `cg_search_artifacts` is unavailable, use `rg` as the shell fallback:

```bash
rg -il --glob '*.md' 'physics' "${DOCS_ROOT}" "${TODOS_ROOT}"
```

Use `grep -r --include='*.md'` only when `rg` is unavailable.
