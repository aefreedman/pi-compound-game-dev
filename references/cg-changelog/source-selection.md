# Source Selection

Select changelog sources without hard-coding GitHub as a requirement.

## Step 1: Detect Signals

1. Parse explicit overrides from `$ARGUMENTS`:
   - `source:github`
   - `source:plastic`
   - `source:codecks`
   - natural-language multi-source requests such as `use both plastic and codecks`
2. Detect issue tracker preference from `AGENTS.md` (`issue_tracker: github|codecks|none`).
3. Detect VCS using ../_shared/vcs-detection.md.
4. Detect runtime availability:
   - GitHub path requires Git + `gh`
   - Plastic path requires Plastic workspace access (`cm`/`plastic_*` tools)
   - Codecks path requires Codecks tool availability

## Step 2: Choose Requested Sources

If the user explicitly asks for multiple sources, collect each requested source independently when available. Do not collapse a multi-source request into one selected source.

For single-source/default selection, use this order:

1. Explicit `source:` override (if valid and available)
2. `issue_tracker: codecks` -> Codecks
3. Plastic workspace detected -> Plastic
4. Git + `gh` available -> GitHub
5. Otherwise -> no source available (return actionable guidance)

## Step 3: Source-Specific Defaults

- GitHub: merged PRs to repo default branch (`main`/`master`)
- Plastic: merge changesets into `/dev` by default (override with `branch:`)
- Codecks: cards moved to done/completed in the selected time window

## Step 4: Source Status and Fallback Behavior

Track each source separately with one of these statuses:

- `available`: preferred evidence was queried successfully.
- `empty`: source queried successfully and returned no in-window records.
- `partial`: source returned usable metadata but not preferred evidence.
- `failed`: source could not be queried or returned an unrecoverable error.
- `not requested`: source was intentionally not used.

Fallback rules:

- If a selected single source fails and was not explicitly forced, attempt next viable source in priority order and report the fallback.
- If one source in a multi-source request fails, continue with successful requested sources and report reduced confidence.
- Do not treat metadata enrichment as equivalent to independent source evidence. For example, Codecks card details found from Plastic comments do not prove Codecks done-transition collection succeeded.
- If no source can be queried, emit guidance from error handling reference.
