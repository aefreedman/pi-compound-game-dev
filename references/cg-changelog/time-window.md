# Time Window Parsing

Parse `$ARGUMENTS` into a normalized window.

## Defaults

- No argument -> `daily` -> last 24 hours
- `daily` -> last 24 hours
- `weekly` -> previous calendar week (Monday 00:00 to Monday 00:00)
- Integer value (for example `14`) -> last N days

## Parsing Rules

1. Start with default: 24h.
2. If `daily` is present, use 24h.
3. If `weekly` is present, use previous week starting Monday (not rolling 7 days).
4. If a positive integer is present, use that many days.
5. If multiple window hints appear, prefer explicit integer, then weekly, then daily.

## Weekly Boundary Definition

For `weekly`, compute a calendar week window in local time:

- `WINDOW_END`: current week Monday at 00:00
- `WINDOW_START`: previous week Monday at 00:00

This yields the full previous Monday-Sunday week.

## Output Variables

- `WINDOW_LABEL`: `Daily`, `Previous Week`, or `Last <N> Days`
- `WINDOW_SUBLABEL`: optional display range, especially for weekly mode (Mon-Sun dates)
- `WINDOW_DAYS`: integer days for filtering
- `WINDOW_START`: timestamp for source queries
- `WINDOW_END`: range end timestamp (`now` for daily/N-days, current Monday 00:00 for weekly)
