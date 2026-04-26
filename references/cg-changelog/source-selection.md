# Source Selection

Select a changelog source without hard-coding GitHub as a requirement.

## Step 1: Detect Signals

1. Parse explicit override from `$ARGUMENTS`:
   - `source:github`
   - `source:plastic`
   - `source:codecks`
2. Detect issue tracker preference from `AGENTS.md` (`issue_tracker: github|codecks|none`).
3. Detect VCS using ../_shared/vcs-detection.md.
4. Detect runtime availability:
   - GitHub path requires Git + `gh`
   - Plastic path requires Plastic workspace access (`cm`/`plastic_*` tools)
   - Codecks path requires Codecks tool availability

## Step 2: Choose Source

Selection order:

1. Explicit `source:` override (if valid and available)
2. `issue_tracker: codecks` -> Codecks
3. Plastic workspace detected -> Plastic
4. Git + `gh` available -> GitHub
5. Otherwise -> no source available (return actionable guidance)

## Step 3: Source-Specific Defaults

- GitHub: merged PRs to repo default branch (`main`/`master`)
- Plastic: merge changesets into `/dev` by default (override with `branch:`)
- Codecks: cards moved to done/completed in the selected time window

## Step 4: Fallback Behavior

- If selected source fails, attempt next viable source in priority order unless user explicitly forced one source.
- If no source can be queried, emit guidance from error handling reference.
