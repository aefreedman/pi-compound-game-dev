# Error Handling

## Source Availability

- If selected source is unavailable and not explicitly forced, try next viable source.
- If source is explicitly forced and unavailable, return a clear error with recovery steps.

## Data Retrieval Failures

- If detailed metadata fetch fails, still list available items with IDs for manual follow-up.
- Prefer partial output over hard failure.

## Empty Result Window

- Emit the quiet-day changelog message.

## Required Recovery Guidance

Include practical next steps when blocked:
- GitHub path: verify `gh` auth and repository access
- Plastic path: verify workspace and branch visibility
- Codecks path: verify workspace access and card query/search permissions
