# SpecFlow Analysis

After structuring the plan outline, the root may analyze flows directly for a small feature or delegate to `cg-spec-flow-analyzer` when the player/editor/content/tool flows are broad enough to benefit from an isolated pass.

Only the root/orchestrator invokes the agent. Use `agentScope: "both"` with project-agent confirmation so project-local package installations remain discoverable.

## Delegation Packet

Provide:

- exact feature description and plan/spec artifact paths or supplied sections
- bounded source roots/files relevant to the feature
- research findings and known evidence limits
- project/platform/input/save/content context
- explicit read-only authority: no edits, VCS writes, tracker actions, editor launches, or nested delegation
- stop condition: analyze implementation-relevant flows only; do not enumerate irrelevant permutations

Require the exact output structure:

- `Flow Analysis`
- `Analysis Basis`
- `Flow Overview`
- `Important Variations`
- `Gaps and Ambiguities`
- `Source Evidence`
- `Provisional Assumptions`

The analyzer must distinguish specified behavior, observed source evidence, and provisional assumptions. Missing repository evidence is a limitation, not permission to invent project behavior.

## Root Synthesis

The root verifies important source citations and decides how findings affect the plan. Incorporate:

- implementation-blocking gaps and questions
- relevant success/failure/recovery and player/editor variations
- updated acceptance or validation criteria
- provisional assumptions that require owner confirmation

Do not treat the analyzer's provisional defaults as approved requirements.
