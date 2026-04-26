# YAML Frontmatter Schema

**See ../../unity-docs/schema.yaml for the complete schema specification.**

## Required Fields

- **module** (string): Unity subsystem or module name (e.g., "Physics", "Rendering", "UI")
- **date** (string): ISO 8601 date (YYYY-MM-DD)
- **problem_type** (enum): One of [build_error, editor_crash, runtime_error, performance_issue, asset_import_issue, physics_bug, rendering_bug, ui_bug, audio_bug, animation_bug, input_bug, integration_issue, logic_error, editor_workflow, best_practice, documentation_gap, serialization_issue, platform_specific]
- **component** (enum): One of [monobehaviour, scriptable_object, prefab, scene, material, shader, animation_controller, timeline, addressable, asset, editor_script, build_script, package, plugin, ui_toolkit, particle_system, terrain, navmesh, lighting, canvas]
- **symptoms** (array): 1-5 specific observable symptoms
- **root_cause** (enum): One of [null_reference, lifecycle_timing, serialization_error, missing_reference, circular_dependency, memory_leak, resource_not_loaded, coroutine_stopped, wrong_thread, prefab_override_issue, asset_import_settings, physics_layer_collision, render_pipeline_config, scene_not_loaded, component_disabled, version_incompatibility, logic_error, config_error, missing_validation]
- **resolution_type** (enum): One of [code_fix, asset_reimport, prefab_revert, config_change, package_update, editor_restart, cache_clear, player_settings_change, build_settings_change, dependency_update, environment_setup, tooling_addition]
- **severity** (enum): One of [critical, high, medium, low]

## Optional Fields

- **unity_version** (string): Unity version (e.g., '2022.3.21f1')
- **render_pipeline** (string): Render pipeline (Built-in, URP, HDRP)
- **platform** (string): Platform where issue occurred (Editor, iOS, Android, WebGL, etc.)
- **tags** (array): Searchable keywords (lowercase, hyphen-separated)

## Validation Rules

1. All required fields must be present
2. Enum fields must match allowed values exactly (case-sensitive)
3. symptoms must be YAML array with 1-5 items
4. date must match YYYY-MM-DD format
5. unity_version (if provided) must match Unity version format (e.g., 2022.3.21f1)
6. tags should be lowercase, hyphen-separated

## Example

```yaml
---
module: Physics
date: 2025-11-12
problem_type: runtime_error
component: monobehaviour
symptoms:
  - "NullReferenceException in PlayerController.Update()"
  - "Player character freezes when jumping"
root_cause: null_reference
unity_version: 2022.3.21f1
render_pipeline: URP 14.0.8
platform: Windows Editor
resolution_type: code_fix
severity: high
tags: [null-reference, update-loop, player-controller]
---
```

## Category Mapping

Based on `problem_type`, documentation is filed in:

- **build_error** → `docs/solutions/build-errors/`
- **editor_crash** → `docs/solutions/editor-crashes/`
- **runtime_error** → `docs/solutions/runtime-errors/`
- **performance_issue** → `docs/solutions/performance-issues/`
- **asset_import_issue** → `docs/solutions/asset-import-issues/`
- **physics_bug** → `docs/solutions/physics-bugs/`
- **rendering_bug** → `docs/solutions/rendering-bugs/`
- **ui_bug** → `docs/solutions/ui-bugs/`
- **audio_bug** → `docs/solutions/audio-bugs/`
- **animation_bug** → `docs/solutions/animation-bugs/`
- **input_bug** → `docs/solutions/input-bugs/`
- **integration_issue** → `docs/solutions/integration-issues/`
- **logic_error** → `docs/solutions/logic-errors/`
- **editor_workflow** → `docs/solutions/editor-workflow/`
- **best_practice** → `docs/solutions/best-practices/`
- **documentation_gap** → `docs/solutions/documentation-gaps/`
- **serialization_issue** → `docs/solutions/serialization-issues/`
- **platform_specific** → `docs/solutions/platform-specific/`
