# Conditional Migration and Deployment Agents

Run these agents only when their specialized artifact is needed. When invoking package-owned `cg-*` agents, use `agentScope: "both"` so project-local package agents remain discoverable.

## `cg-data-migration-reviewer`

Use for an actual persisted-data transformation or compatibility transition, such as:

- save/schema version migration
- field, enum, key, ID, or GUID mapping
- backfill or repair pass
- dual-read/write compatibility window
- asset/content conversion that transforms existing serialized state

Do not run it merely because a serialized type or asset changed. General save/serialization/reference correctness belongs to `cg-data-integrity-reviewer` unless existing data must be transformed.

### Migration brief

```text
Read-only migration review for:
$CHANGED_FILES

Title: $PR_TITLE
Source and target versions/formats: [known details]
Representative evidence available: [schemas, fixtures, anonymized samples, tests]
Reachability/reversibility/blast radius: [known details]
Authorized external checks: [normally none]

Verify mappings, unknown/default values, ordering, reruns, interruption, compatibility, reconciliation, and recovery proportionally to risk. Distinguish observed evidence from production verification still required. Do not execute the migration.
```

## `cg-deployment-verifier`

Use when a real release, rollout, build delivery, migration deployment, platform/configuration change, or content update needs an operational checklist.

Do not run it for routine code review without a planned rollout. It produces an artifact; it does not deploy or mark checks complete.

Typical indicators include:

- build/platform configuration or signing changes
- CI/release pipeline changes
- addressable/bundle/content catalog rollout
- migration release ordering
- feature flag/config rollout
- explicit launch, release, or deployment request

### Deployment brief

```text
Create a read-only deployment verification artifact for:
$CHANGED_FILES

Release unit/title: $PR_TITLE
Targets/environments/platforms: [known details]
Existing CI/runbooks/checks: [paths or summary]
Accepted migration/security/integrity findings: [inputs]
Known owners, baselines, and recovery capabilities: [details]

Produce evidence-backed preflight, rollout, immediate verification, monitoring, and rollback/forward-recovery steps. Mark unknown commands, owners, thresholds, dashboards, access, or backups as TBD/blockers. Do not invent or execute them.
```

## Routing Logic

- Actual data transformation only: run `cg-data-migration-reviewer`.
- Real release/rollout artifact only: run `cg-deployment-verifier`.
- Both: run both in parallel with separate bounded briefs, then let deployment consume accepted migration controls during synthesis.
- Neither: skip both.

Use migration findings for transformation correctness and deployment findings for operational sequencing. Do not duplicate general data-integrity, security, architecture, or performance review inside either specialist.
