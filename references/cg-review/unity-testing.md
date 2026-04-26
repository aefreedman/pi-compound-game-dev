# Unity Testing (Optional)

## Detect Unity Projects

Indicators:
- `Assets/`, `ProjectSettings/`, `Packages/manifest.json`
- `*.unity` scene files
- Unity C# projects (`Assembly-CSharp.csproj`)

## Offer Tests

Prompt after summary:

1. Run Edit Mode tests
2. Run Play Mode tests
3. Run both
4. Skip

If user accepts, spawn a subagent to run Unity Test Framework
and create P1 todos for any failing tests.
