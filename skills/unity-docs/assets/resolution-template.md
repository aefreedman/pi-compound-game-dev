---
module: [Unity subsystem name or specific module]
date: [YYYY-MM-DD]
problem_type: [build_error|editor_crash|runtime_error|performance_issue|asset_import_issue|physics_bug|rendering_bug|ui_bug|audio_bug|animation_bug|input_bug|integration_issue|logic_error|editor_workflow|best_practice|documentation_gap|serialization_issue|platform_specific]
component: [monobehaviour|scriptable_object|prefab|scene|material|shader|animation_controller|timeline|addressable|asset|editor_script|build_script|package|plugin|ui_toolkit|particle_system|terrain|navmesh|lighting|canvas]
symptoms: 
root_cause: [null_reference|lifecycle_timing|serialization_error|missing_reference|circular_dependency|memory_leak|resource_not_loaded|coroutine_stopped|wrong_thread|prefab_override_issue|asset_import_settings|physics_layer_collision|render_pipeline_config|scene_not_loaded|component_disabled|version_incompatibility|logic_error|config_error|missing_validation]
unity_version: [e.g., 2022.3.21f1]
render_pipeline: [Built-in|URP X.X.X|HDRP X.X.X - optional]
platform: [Windows Editor|iOS|Android|WebGL|etc. - optional]
resolution_type: [code_fix|asset_reimport|prefab_revert|config_change|package_update|editor_restart|cache_clear|player_settings_change|build_settings_change|dependency_update|environment_setup|tooling_addition]
severity: [critical|high|medium|low]
tags: [keyword1, keyword2, keyword3]
---
# Troubleshooting: [Clear Problem Title]

## Problem
[1-2 sentence clear description of the issue and what you experienced]

## Environment
- Module: [Unity subsystem or specific module]
- Unity Version: [e.g., 2022.3.21f1]
- Render Pipeline: [Built-in, URP 14.0.8, HDRP 14.0.8]
- Platform: [Windows Editor, iOS, Android, WebGL]
- Affected Component: [e.g., "PlayerController MonoBehaviour", "Enemy Prefab", "MainScene"]
- Date: [YYYY-MM-DD when this was solved]

## Symptoms
- [Observable symptom 1 - what you saw/experienced]
- [Observable symptom 2 - error messages, visual issues, unexpected behavior]
- [Continue as needed - be specific]

## What Didn't Work

**Attempted Solution 1:** [Description of what was tried]
- **Why it failed:** [Technical reason this didn't solve the problem]

**Attempted Solution 2:** [Description of second attempt]
- **Why it failed:** [Technical reason]

[Continue for all significant attempts that DIDN'T work]

[If nothing else was attempted first, write:]
**Direct solution:** The problem was identified and fixed on the first attempt.

## Solution

[The actual fix that worked - provide specific details]

**Code changes** (if applicable):
```csharp
// Before (broken):
void Update()
{
    // Missing null check
    _rigidbody.velocity = Vector3.zero;
}

// After (fixed):
void Update()
{
    if (_rigidbody != null)
    {
        _rigidbody.velocity = Vector3.zero;
    }
}
```

**Asset changes** (if applicable):
```
Prefab: Assets/Prefabs/Player.prefab
- Added Rigidbody component
- Set Collision Detection to Continuous
- Set Interpolate to Interpolate
```

**Project Settings changes** (if applicable):
```
Edit > Project Settings > Physics
- Changed Fixed Timestep from 0.02 to 0.01
- Enabled Enhanced Determinism

Edit > Project Settings > Player
- Changed API Compatibility Level to .NET Standard 2.1
```

**Commands/Actions** (if applicable):
```bash
# Steps taken to fix in Unity:
- Assets > Reimport All
- Edit > Clear All PlayerPrefs
- Build Settings > Switch Platform to Android
- Library folder deleted and regenerated
```

## Why This Works

[Technical explanation of:]
1. What was the ROOT CAUSE of the problem?
2. Why does the solution address this root cause?
3. What was the underlying issue (Unity API misuse, configuration error, version issue, etc.)?

[Be detailed enough that future developers understand the "why", not just the "what"]

## Prevention

[How to avoid this problem in future development:]
- [Specific coding practice, check, or pattern to follow]
- [What to watch out for]
- [How to catch this early]

## Related Issues

[If any similar problems exist in docs/solutions/, link to them:]
- See also: [another-related-issue.md](../category/another-related-issue.md)
- Similar to: [related-problem.md](../category/related-problem.md)

[If no related issues, write:]
No related issues documented yet.
