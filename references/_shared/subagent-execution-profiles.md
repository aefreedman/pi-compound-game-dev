# Subagent Execution Profiles

Use model and thinking selections as task-sensitive execution controls, not as fixed status markers for an agent class.

## Default

Leave `model` and `thinking` unset unless a bounded slice has a clear cost, latency, or complexity reason to differ. Unpinned agents then inherit the coordinating session's model and thinking level.

Agent frontmatter model declarations are hard pins and take precedence. Do not attempt to override them.

## Explicit Selection

The root/orchestrator may set call-wide defaults or per-item values in `subagent` calls:

- `model`: exact available `provider/model` identifier
- `thinking`: `off | minimal | low | medium | high | xhigh`

Prefer per-item values when parallel tasks differ materially. Pi may clamp thinking to the selected model's capabilities.

Before choosing a non-parent model, call `subagent_list` with `agentScope: "both"` and `includeModels: true`, then use one of its exact available identifiers. Do not guess model identifiers, switch providers merely for novelty, or maximize thinking by default.

## Task-Sensitive Guidance

- Low or medium: bounded repository/learnings/VCS searches, check-only linting, and other easily verified reconnaissance.
- Medium or high: focused flow analysis, planning, implementation, and review with moderate ambiguity.
- High or xhigh: genuinely ambiguous architecture, security, data-integrity, migration, or risky resolution work where deeper reasoning is worth the added cost.

These are heuristics, not automatic class mappings. Increase or decrease effort based on the actual slice, evidence quality, risk, and validation burden.

## Project-Agent Trust

Use `agentScope: "both"` when project-installed/package agents are intended. Rely on the runtime's trust-aware policy:

- Pi-trusted projects run without an extra package prompt.
- Otherwise, leave `confirmProjectAgents` unset or `true` to allow one fallback approval/denial per project and Pi session.
- Setting `confirmProjectAgents: false` denies untrusted project-agent execution; it does not authorize it.
- Untrusted non-interactive workflows must use saved Pi trust or an explicit Pi `--approve` launch.

Do not add workflow-level repeated approval prompts. Project trust is an input-loading guard, not a sandbox or additional tool authority.

## Delegation Record

When selecting a non-inherited profile, include a short reason in the root's orchestration notes or delegation packet. Use the returned selected model/thinking metadata, together with any Pi capability clamping noted by the run, when reporting cost or comparing agent performance.
