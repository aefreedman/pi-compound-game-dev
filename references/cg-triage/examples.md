# Example Interaction

```
Progress: 1/3 completed

---
Issue #042: player-dash-collision
Severity: P1 critical
Tags: physics, gameplay
Dependencies: none

Problem:
Player dash can pass through thin colliders at high speed.

Findings:
Dash movement bypasses the existing collision sweep used by normal movement.

Proposed action:
Route dash movement through the same collision sweep and add a regression test scene.

Decision? yes / skip / delete / custom
```
