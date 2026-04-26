# Conditional Agents

These agents are run ONLY when the PR or code review matches specific criteria. Check the changed files list to determine if they apply.

---

## When to Run Migration Agents

Run migration agents when changes contain:
- Save system data structures
- ScriptableObject schemas or asset serialization
- Asset migration scripts or Unity upgrade paths
- Asset import settings or addressable configurations
- Build settings, platform configs, or deployment pipelines
- Title/description mentions: migration, asset upgrade, save data, build config

---

## Decision Criteria

**Check the following indicators:**

1. **File patterns:**
   - `*Migration.cs`, `*Migrator.cs`
   - `*.asset` (ScriptableObjects)
   - `*.unity` (Scene files)
   - `ProjectSettings/*.asset`
   - `Assets/AddressableAssetsData/`
   - Build configuration files

2. **Code patterns (grep for):**
   - `[SerializeField]` changes
   - `SaveData`, `SaveSystem`
   - `ScriptableObject` schema modifications
   - `AssetDatabase` operations
   - `BuildPipeline`, `BuildTarget`

3. **Title/description keywords:**
   - "migration", "migrate"
   - "asset upgrade", "schema change"
   - "save data", "save format"
   - "build config", "deployment"
   - "addressables", "asset bundles"

---

## Conditional Agent Definitions

### 9. cg-data-migration-reviewer

Validate data migration safety and compatibility.

**Run when:** Changes affect save data, ScriptableObjects, or asset serialization.

If you delegate to `cg-data-migration-reviewer`, pass it a brief like:

```text
Review data migration safety in:
$CHANGED_FILES

Title: $PR_TITLE

Validate:
- Save data format migrations and versioning
- ScriptableObject schema changes and backward compatibility
- Asset serialization changes
- Migration script correctness (prevents ID swaps, data loss)
- Rollback procedures and recovery paths
- Player data impact assessment

Check for:
- Version numbering and migration paths
- Data transformation correctness
- Edge cases in existing player data
- Missing migration steps
- Orphaned data or broken references

Return findings with:
- Severity: P1 (data loss risk), P2 (compatibility issue), P3 (migration improvement)
- File:line references
- Test data scenarios (new players, existing players, edge cases)
- Rollback procedure validation
```

---

### 10. cg-deployment-verifier

Create build verification and deployment checklist.

**Run when:** Changes affect build configuration, platform settings, or deployment pipelines.

If you delegate to `cg-deployment-verifier`, pass it a brief like:

```text
Create deployment verification plan for:
$CHANGED_FILES

Title: $PR_TITLE

Generate checklist for:
- Pre-build verification steps
- Build configuration validation (platform-specific)
- Post-build testing procedures
- Asset bundle validation (if applicable)
- Platform-specific checks (iOS, Android, PC, Console)
- Deployment smoke tests
- Rollback procedures
- Monitoring and alerting verification

Return:
- Executable checklist with pass/fail criteria
- Platform-specific validation steps
- Automated test scripts (where possible)
- Rollback plan with specific steps
- Monitoring dashboard recommendations

Format as P1 (critical pre-deploy checks), P2 (important validations), P3 (nice-to-have verifications)
```

---

## Implementation

### Detect Applicability

Use any harness-appropriate detection step to decide whether migration or deployment specialists are needed. The key behavior is:

- if migration indicators are present, run `cg-data-migration-reviewer`
- if deployment indicators are present, run `cg-deployment-verifier`
- if both apply, run both specialists
- if neither applies, skip conditional specialists

Root/orchestrator guidance:

- If only migration indicators apply, run `cg-data-migration-reviewer` with the migration brief above.
- If only deployment indicators apply, run `cg-deployment-verifier` with the deployment brief above.
- If both apply, run both specialists in parallel from the root session.

---

## What These Agents Check

**cg-data-migration-reviewer:**
- Verifies save format migrations match real player data (prevents ID swaps)
- Checks versioning and backward compatibility
- Validates data transformation correctness
- Ensures rollback procedures exist

**cg-deployment-verifier:**
- Produces executable pre/post-build checklists with verification steps
- Creates platform-specific validation procedures
- Documents rollback procedures
- Provides monitoring and alerting recommendations
