# Repository Research Efficiency

Use this reference when planning, reviewing, or delegating repository research. The goal is enough evidence to guide the next planning step, not a complete repository audit.

---

## Root Fast Pass Before Research Routing

The root/orchestrator agent should do a short fast pass before deciding whether to research directly, use deterministic search tools, or launch `cg-repo-researcher` spikes:

1. Read `AGENTS.md` or equivalent local guidance when present.
2. Detect VCS and workspace style:
   - Plastic: `cm status` succeeds or `.plastic/` exists.
   - Git: `.git/` exists and Plastic was not detected.
3. Discover repo-local ignore files such as `ignore.conf`, `cloaked.conf`, `.gitignore`, or engine-specific ignore files.
4. List top-level roots and likely source/content roots.
5. Run one to three focused searches using terms from the feature request.
6. Decide the research route using the rules below.

The root agent remains responsible for the investigation. Subagent output is a parallel evidence source to verify and synthesize, not a substitute for the root agent reading the most relevant files.

The goal is research latency reduction through better routing and parallelism, not deeper individual analysis. Treat repo research agents as short spikes that should usually finish in about 45 seconds or less.

---

## Plastic-Aware Search

`rg` does not automatically honor Plastic SCM ignore/cloak files. In Plastic workspaces, include root ignore files explicitly when present:

```bash
rg --ignore-file ignore.conf --ignore-file cloaked.conf --files .
rg --ignore-file ignore.conf --ignore-file cloaked.conf -n "SearchTerm" .
```

If an ignore file is absent, omit that flag instead of failing the search.

Prefer running searches from the resolved workspace root so relative ignore patterns apply correctly.

---

## Research Routing

### Research Directly by Default

Use root-agent tools directly when the next step is a linear investigation:

- 1-2 obvious roots or files.
- A single subsystem/question.
- Up to roughly 6-8 targeted search/read operations expected.
- The host expects to inspect only a few files before deciding.

Direct `rg`/read work is usually faster than spawning a subagent for small searches.

### Use Deterministic Search/Excerpt Tools When Available

If a package tool exists for repository search spikes, prefer it for mechanical candidate discovery. Such a tool is not better than `rg` at raw search; it is useful when it batches the repeated workflow around `rg`:

- Applies VCS-aware ignore handling.
- Runs several terms across scoped roots in one call.
- Ranks candidate files.
- Returns short line excerpts and line references.
- Reports negative evidence and capped output.

Use this kind of tool when roots/terms are already known and the host needs a structured evidence packet without LLM interpretation.

### Delegate Only for Parallel Research Burden

Use `cg-repo-researcher` only when the root fast pass shows enough independent research burden to benefit from parallelism:

- 2+ independent slices can run in parallel.
- Each slice has its own narrow root/terms/question.
- Serial research would likely take 10+ search/read operations or several minutes of attention.
- Each slice can be bounded to about 45 seconds or less.

When delegating repository research, split broad questions into parallel slices. Invoke package-owned `cg-*` agents with `agentScope: "both"` so project-local installations remain discoverable, while retaining project-agent confirmation. Each `cg-repo-researcher` brief should provide:

- One narrow research question.
- Feature summary only as background, not as the research scope.
- 1-2 candidate roots discovered by the root fast pass.
- 3-6 concrete search terms/symbols for this slice.
- Files already read or known-relevant paths for this slice.
- VCS type and ignore-file instructions.
- Desired depth: `fast`, `focused`, or `deep`.
- Runtime target: about 45 seconds or less.

Default depth is `fast`:

- Search only likely roots first.
- Run only a few targeted searches.
- Read only the top 1-4 high-signal files.
- Stop once there are 2-4 relevant evidence bullets or clear evidence that no local pattern was found in scope.
- Return uncertainty instead of expanding to the whole repo without a reason.

Use `focused` when a known subsystem needs more evidence. Prefer multiple parallel `fast` slices over one broad `focused` slice. Use `deep` only when the user explicitly asks for broad subsystem mapping or the root fast pass shows high architectural risk.

---

## Tool Use

Use the strongest available project/package tools for the source being searched:

- Use `cg_search_artifacts` for project-local Markdown artifacts under `docs/` and `todos/` when it is available; it is faster and more structured than ad hoc Markdown scans.
- Use raw `rg` for source code, assets/content files, exact symbols, exact errors, filenames, and body-text verification.
- Use deterministic repo search/excerpt tools when available for batched `rg` + snippets + candidate ranking; keep final synthesis in the root agent.
- Use VCS-specific tools for VCS facts: Plastic tools/`cm` in Plastic workspaces, Git tools/`git` in Git repositories.
- Use `cg_read_reference` for Compound Game Dev package references rather than reading package files through project-relative paths.
- Use companion engine/package documentation tools when present and relevant, but do not make them hard dependencies.

## Search Strategy

Prefer narrow, staged searches:

1. Search guidance/docs first only when not already covered by the root fast pass: `AGENTS.md`, README, setup docs, package manifests, and project conventions. Use `cg_search_artifacts` for `docs/`/`todos/` when available.
2. Search likely source/content roots with file-type globs.
3. Search exact symbols, filenames, serialized keys, component names, and user-facing terms.
4. Read selected files directly and capture line references.

For broad features that exceed direct-research scope, launch several independent slices in parallel, for example:

- UI surface slice: one UI root and UI terms.
- Runtime behavior slice: one gameplay/runtime root and system symbols.
- Tooling/content slice: one editor/tool/content root and asset or import terms.

Do not make each slice solve the whole feature. The root agent synthesizes after all slices return.

Avoid:

- Repeated whole-repo `rg` scans when a scoped root is known.
- Reading generated, cache, build, dependency, or imported vendor directories unless the feature specifically touches them.
- Mapping every directory in a large project.
- Reading more files after enough evidence has been found for planning.

If a broad search is slow or noisy, report the slow/noisy query and narrow the scope instead of continuing indefinitely.

---

## Output Expectations

Return a concise evidence handoff, not a processed plan:

```markdown
## Repository Research Spike

### Slice
- Question: [narrow slice question]
- Roots searched: [paths]
- Terms/symbols searched: [terms]
- Commands run: [commands]
- VCS/ignore handling: [files/tools used]
- Depth: fast|focused|deep
- Stop reason: found-enough|scoped-not-found|scope-too-broad|time-budget

### Candidate Files
- [path] - [why this file is likely relevant; key lines if known]

### Evidence
- [file:line,line-range] - [observed local pattern or fact]
  > [optional short excerpt]

### Not Found / Uncertain
- [what was searched and not found]

### Next Reads for Root Agent
- [path] - [why the root agent may read it]
```

Prefer evidence shortlists over broad inventories. Include line numbers for claims that influence the plan. Avoid recommendations that require feature-level synthesis; the root agent will do that work.
