# Plan Formatting Guidelines

- Use clear headings and task lists.
- Include code examples in fenced blocks with language tags.
- Add file references in `path:line` format.
- Link to related issues, PRs, and docs.
- Include acceptance criteria that are testable.
- Add diagrams where they clarify architecture (mermaid).

## Scope Assumptions

When a feature appears to replace an existing workflow, name the intended compatibility stance explicitly instead of assuming it:

- **Full replacement**: remove/rename old concepts in current docs, prose, data, code, and cards.
- **Migration/conversion**: convert old data/assets to the new workflow and keep one canonical path afterward.
- **Backward-compatible support**: maintain old and new paths deliberately.
- **Historical alias/reference only**: keep old names only where the user explicitly asks for historical traceability.

Do not add compatibility layers, adapters, old-name prose, migration checks, or legacy aliases unless the user requests them or evidence shows shipped data requires them.

## Unity UI Toolkit Plans

For persistent Unity UI Toolkit work, prefer plans that separate:

- UXML for durable visual structure/templates.
- USS for styling, layout, typography, and interaction-state visuals.
- C# for behavior, data binding, generated content, and editor/runtime integration.

Avoid plans that encode all visual structure and styling in C# unless the UI is truly generated/dynamic or the project pattern requires it.

## Compact File References

Keep evidence useful without repeating long paths.

- Prefer paths relative to the artifact root or project root chosen for the plan.
- If several references share a long prefix, declare it once before the section:
  - `References use paths relative to nor-unity/Assets/02-Game-Dive unless noted.`
- Group multiple locations in the same file with comma-separated lines:
  - `code/Runtime/Gameplay/PlayerMovement.cs:22,158,213`
- Use line ranges for related blocks:
  - `code/Runtime/UI/LocationOverlayViewController.cs:393-476`
- Put evidence at the end of the bullet instead of interrupting the sentence:
  - `Evidence: code/Runtime/UI/MinimapViewController.cs:372,386; code/Runtime/UI/MapNeighborhoodLayoutProjector.cs:10,35,80.`
- For dense plans, create a short evidence index and refer to it from the body:
  - `E1: code/Runtime/Gameplay/PlayerMovement.cs:22,158,213`
  - `Reuse authoritative movement patterns. See E1.`
- Do not hide important evidence completely; every claim that depends on code inspection should still have a resolvable file reference nearby or in the evidence index.
