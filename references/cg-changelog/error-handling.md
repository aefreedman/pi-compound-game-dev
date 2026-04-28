# Error Handling

## Source Availability

- If a selected single source is unavailable and not explicitly forced, try the next viable source.
- If a source is explicitly forced and unavailable, return a clear error with recovery steps.
- If the user requested multiple sources, collect each source independently and report source status separately.

## Source Status Reporting

Use these labels in changelog synthesis when helpful, especially for multi-source requests:

- `available`: preferred source evidence was queried successfully.
- `empty`: source queried successfully and found no in-window records.
- `partial`: source produced usable metadata but not the preferred evidence type.
- `failed`: source query failed or required tooling was unavailable.
- `not requested`: source was intentionally not used.

Example:

```markdown
## Source Status

- Plastic: available — target-branch changesets queried and filtered.
- Codecks: partial — card metadata enriched from referenced short codes; done-transition timeframe query failed.

Confidence note: Codecks transition evidence was unavailable, so this changelog may omit cards completed in the window that were not referenced from Plastic changesets.
```

If only one requested source succeeds, mark reduced confidence and avoid implying full cross-source verification.

## Data Retrieval Failures

- If detailed metadata fetch fails, still list available items with IDs for manual follow-up.
- Prefer partial output over hard failure when at least one requested source succeeded.
- Clearly distinguish preferred evidence from fallback metadata enrichment.

## Empty Result Window

- Emit the quiet-day changelog message for sources that successfully return no records.
- Do not treat an empty successful query as a failed source.

## Required Recovery Guidance

Include practical next steps when blocked:
- GitHub path: verify `gh` auth and repository access
- Plastic path: verify workspace and branch visibility; if date filtering fails, try the documented bounded recent-list fallback and filter manually with reduced confidence
- Codecks path: verify workspace access, card query/search permissions, and that `codecks_card_list_done_within_timeframe` receives `since` and `until` ISO datetime arguments
