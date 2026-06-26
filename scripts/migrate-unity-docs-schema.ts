#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";

const DOC_TYPES = ["solution", "pattern", "workflow", "documentation_gap"] as const;
const CATEGORIES = [
  "build_ci",
  "editor_workflow",
  "asset_pipeline",
  "packages_integrations",
  "project_configuration",
  "serialization_data",
  "prefabs_scenes",
  "gameplay_code",
  "physics_navigation",
  "rendering_shaders",
  "ui",
  "animation_timeline",
  "audio",
  "input",
  "performance",
  "platform",
  "testing_validation",
  "tooling_vcs",
] as const;
const FAILURE_MODES = [
  "compile_error",
  "build_failure",
  "test_failure",
  "editor_crash",
  "editor_hang",
  "runtime_exception",
  "runtime_crash",
  "incorrect_behavior",
  "visual_artifact",
  "asset_import_failure",
  "performance_regression",
  "missing_reference",
  "data_loss_or_corruption",
  "version_incompatibility",
  "workflow_friction",
  "documentation_gap",
] as const;

type DocType = typeof DOC_TYPES[number];
type Category = typeof CATEGORIES[number];
type FailureMode = typeof FAILURE_MODES[number];
type Classification = { doc_type: DocType; category: Category; failure_mode: FailureMode };
type MappingConfig = {
  problemTypeMap?: Record<string, Partial<Classification>>;
  pathOverrides?: Record<string, Partial<Classification>>;
};
type Frontmatter = { raw: string; body: string; entries: Map<string, string>; order: string[] };
type PlannedDoc = {
  originalPath: string;
  newPath: string;
  originalRelativePath: string;
  newRelativePath: string;
  content: string;
  frontmatter?: Frontmatter;
  classification?: Classification;
  moved: boolean;
  changed: boolean;
  skipped: boolean;
  reasons: string[];
  manualReview: string[];
};

type Args = {
  solutionsRoot?: string;
  apply: boolean;
  dryRun: boolean;
  mappingPath?: string;
  writeReport?: string;
  move: boolean;
  verbose: boolean;
  includeManualReview: boolean;
  help: boolean;
};

const DEFAULT_PROBLEM_TYPE_MAP: Record<string, Classification> = {
  build_error: { doc_type: "solution", category: "build_ci", failure_mode: "build_failure" },
  editor_crash: { doc_type: "solution", category: "editor_workflow", failure_mode: "editor_crash" },
  runtime_error: { doc_type: "solution", category: "gameplay_code", failure_mode: "runtime_exception" },
  performance_issue: { doc_type: "solution", category: "performance", failure_mode: "performance_regression" },
  asset_import_issue: { doc_type: "solution", category: "asset_pipeline", failure_mode: "asset_import_failure" },
  physics_bug: { doc_type: "solution", category: "physics_navigation", failure_mode: "incorrect_behavior" },
  rendering_bug: { doc_type: "solution", category: "rendering_shaders", failure_mode: "visual_artifact" },
  ui_bug: { doc_type: "solution", category: "ui", failure_mode: "incorrect_behavior" },
  audio_bug: { doc_type: "solution", category: "audio", failure_mode: "incorrect_behavior" },
  animation_bug: { doc_type: "solution", category: "animation_timeline", failure_mode: "incorrect_behavior" },
  input_bug: { doc_type: "solution", category: "input", failure_mode: "incorrect_behavior" },
  integration_issue: { doc_type: "solution", category: "packages_integrations", failure_mode: "incorrect_behavior" },
  logic_error: { doc_type: "solution", category: "gameplay_code", failure_mode: "incorrect_behavior" },
  editor_workflow: { doc_type: "solution", category: "editor_workflow", failure_mode: "workflow_friction" },
  best_practice: { doc_type: "pattern", category: "gameplay_code", failure_mode: "workflow_friction" },
  documentation_gap: { doc_type: "documentation_gap", category: "project_configuration", failure_mode: "documentation_gap" },
  serialization_issue: { doc_type: "solution", category: "serialization_data", failure_mode: "incorrect_behavior" },
  platform_specific: { doc_type: "solution", category: "platform", failure_mode: "incorrect_behavior" },
};

const CATEGORY_DIRS: Record<Category, string> = {
  build_ci: "build-ci",
  editor_workflow: "editor-workflow",
  asset_pipeline: "asset-pipeline",
  packages_integrations: "packages-integrations",
  project_configuration: "project-configuration",
  serialization_data: "serialization-data",
  prefabs_scenes: "prefabs-scenes",
  gameplay_code: "gameplay-code",
  physics_navigation: "physics-navigation",
  rendering_shaders: "rendering-shaders",
  ui: "ui",
  animation_timeline: "animation-timeline",
  audio: "audio",
  input: "input",
  performance: "performance",
  platform: "platform",
  testing_validation: "testing-validation",
  tooling_vcs: "tooling-vcs",
};

const FIELD_ORDER = [
  "schema_version",
  "doc_type",
  "category",
  "failure_mode",
  "module",
  "date",
  "component",
  "symptoms",
  "root_cause",
  "unity_version",
  "render_pipeline",
  "platform",
  "resolution_type",
  "severity",
  "related_components",
  "tags",
];

function usage(): string {
  return `Migrate Unity solution-doc YAML frontmatter from schema v1 problem_type buckets to schema v2 doc_type/category/failure_mode.\n\nUsage:\n  npx tsx scripts/migrate-unity-docs-schema.ts --solutions-root <docs/solutions> [--dry-run]\n  npx tsx scripts/migrate-unity-docs-schema.ts --solutions-root <docs/solutions> --apply\n\nOptions:\n  --solutions-root <path>   Directory containing solution markdown files. Alias: --root.\n  --dry-run                 Preview changes only. Default.\n  --apply                   Write migrated files and move them to category folders.\n  --mapping <path>          Optional JSON mapping with problemTypeMap and/or pathOverrides.\n  --write-report <path>     Write a JSON migration report.\n  --no-move                 Update frontmatter but leave files in place.\n  --include-manual-review   Apply files that were flagged for manual review. Default is to leave them untouched.\n  --verbose                 Print per-file decisions.\n  --help                    Show this help.\n\nMapping JSON example:\n{\n  "pathOverrides": {\n    "best-practices/my-doc.md": {"category": "ui", "doc_type": "pattern"}\n  },\n  "problemTypeMap": {\n    "custom_type": {"doc_type": "solution", "category": "tooling_vcs", "failure_mode": "workflow_friction"}\n  }\n}\n`;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { apply: false, dryRun: true, move: true, verbose: false, includeManualReview: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--solutions-root" || arg === "--root") args.solutionsRoot = argv[++i];
    else if (arg.startsWith("--solutions-root=")) args.solutionsRoot = arg.slice("--solutions-root=".length);
    else if (arg.startsWith("--root=")) args.solutionsRoot = arg.slice("--root=".length);
    else if (arg === "--apply") { args.apply = true; args.dryRun = false; }
    else if (arg === "--dry-run") { args.dryRun = true; args.apply = false; }
    else if (arg === "--mapping") args.mappingPath = argv[++i];
    else if (arg.startsWith("--mapping=")) args.mappingPath = arg.slice("--mapping=".length);
    else if (arg === "--write-report") args.writeReport = argv[++i];
    else if (arg.startsWith("--write-report=")) args.writeReport = arg.slice("--write-report=".length);
    else if (arg === "--no-move") args.move = false;
    else if (arg === "--include-manual-review") args.includeManualReview = true;
    else if (arg === "--verbose") args.verbose = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function normalizeRel(value: string): string {
  return value.replace(/\\/g, "/");
}

function listMarkdownFiles(root: string): string[] {
  const out: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) out.push(full);
    }
  }
  walk(root);
  return out.sort((a, b) => a.localeCompare(b));
}

function parseFrontmatter(content: string): Frontmatter | undefined {
  if (!content.startsWith("---\n") && !content.startsWith("---\r\n")) return undefined;
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return undefined;
  const raw = match[1];
  const body = content.slice(match[0].length);
  const lines = raw.split(/\r?\n/);
  const entries = new Map<string, string>();
  const order: string[] = [];
  let currentKey: string | undefined;
  let currentLines: string[] = [];

  function flush() {
    if (!currentKey) return;
    entries.set(currentKey, currentLines.join("\n"));
    order.push(currentKey);
  }

  for (const line of lines) {
    const keyMatch = line.match(/^([A-Za-z0-9_]+):(?:\s*(.*))?$/);
    if (keyMatch && !line.startsWith(" ")) {
      flush();
      currentKey = keyMatch[1];
      currentLines = [line];
    } else if (currentKey) {
      currentLines.push(line);
    }
  }
  flush();
  return { raw, body, entries, order };
}

function scalar(frontmatter: Frontmatter, key: string): string | undefined {
  const raw = frontmatter.entries.get(key);
  if (!raw) return undefined;
  const first = raw.split(/\r?\n/, 1)[0];
  const idx = first.indexOf(":");
  if (idx < 0) return undefined;
  const value = first.slice(idx + 1).trim();
  if (!value) return undefined;
  return value.replace(/^['"]|['"]$/g, "");
}

function setScalar(frontmatter: Frontmatter, key: string, value: string | number) {
  frontmatter.entries.set(key, `${key}: ${value}`);
  if (!frontmatter.order.includes(key)) frontmatter.order.push(key);
}

function stringifyFrontmatter(frontmatter: Frontmatter): string {
  const emitted = new Set<string>();
  const lines: string[] = [];
  for (const key of FIELD_ORDER) {
    const raw = frontmatter.entries.get(key);
    if (raw !== undefined) {
      lines.push(raw);
      emitted.add(key);
    }
  }
  for (const key of frontmatter.order) {
    if (emitted.has(key) || key === "problem_type") continue;
    const raw = frontmatter.entries.get(key);
    if (raw !== undefined) {
      lines.push(raw);
      emitted.add(key);
    }
  }
  return `---\n${lines.join("\n")}\n---\n${frontmatter.body}`;
}

function isDocType(value: string): value is DocType { return (DOC_TYPES as readonly string[]).includes(value); }
function isCategory(value: string): value is Category { return (CATEGORIES as readonly string[]).includes(value); }
function isFailureMode(value: string): value is FailureMode { return (FAILURE_MODES as readonly string[]).includes(value); }

function mergeClassification(base: Classification, override: Partial<Classification> | undefined, notes: string[]): Classification {
  if (!override) return base;
  const next = { ...base };
  if (override.doc_type) {
    if (isDocType(override.doc_type)) next.doc_type = override.doc_type;
    else notes.push(`Invalid doc_type override ignored: ${override.doc_type}`);
  }
  if (override.category) {
    if (isCategory(override.category)) next.category = override.category;
    else notes.push(`Invalid category override ignored: ${override.category}`);
  }
  if (override.failure_mode) {
    if (isFailureMode(override.failure_mode)) next.failure_mode = override.failure_mode;
    else notes.push(`Invalid failure_mode override ignored: ${override.failure_mode}`);
  }
  return next;
}

function inferCategoryFromComponentModule(component: string | undefined, moduleName: string | undefined): Category | undefined {
  const haystack = `${component ?? ""} ${moduleName ?? ""}`.toLowerCase();
  if (/ui|canvas|toolkit|uxml|uss/.test(haystack)) return "ui";
  if (/editor|inspector|window/.test(haystack)) return "editor_workflow";
  if (/build|ci|batchmode/.test(haystack)) return "build_ci";
  if (/package|plugin|sdk|integration|yarn|addressable/.test(haystack)) return "packages_integrations";
  if (/asset|import|texture|model/.test(haystack)) return "asset_pipeline";
  if (/scriptable|serializ|data/.test(haystack)) return "serialization_data";
  if (/prefab|scene/.test(haystack)) return "prefabs_scenes";
  if (/physics|rigidbody|collision|navmesh|navigation/.test(haystack)) return "physics_navigation";
  if (/render|shader|material|lighting|camera|vfx/.test(haystack)) return "rendering_shaders";
  if (/anim|timeline|cinemachine/.test(haystack)) return "animation_timeline";
  if (/audio|mixer|sound/.test(haystack)) return "audio";
  if (/input/.test(haystack)) return "input";
  if (/performance|memory|gc|fps|profiler/.test(haystack)) return "performance";
  if (/test|validation/.test(haystack)) return "testing_validation";
  if (/plastic|git|vcs|version control|screenshot|tooling/.test(haystack)) return "tooling_vcs";
  return undefined;
}

function inferFailureMode(frontmatter: Frontmatter, body: string, fallback: FailureMode): FailureMode {
  const text = `${scalar(frontmatter, "root_cause") ?? ""}\n${frontmatter.entries.get("symptoms") ?? ""}\n${body.slice(0, 2000)}`.toLowerCase();
  if (/compile error|compiler error|cs\d{4}/.test(text)) return "compile_error";
  if (/test failure|failing test|assertion/.test(text)) return "test_failure";
  if (/build fail|build error|failed build/.test(text)) return "build_failure";
  if (/editor.*hang|hangs|freezes|not responding/.test(text)) return "editor_hang";
  if (/editor.*crash|crashes|crashed/.test(text)) return "editor_crash";
  if (/exception|nullreferenceexception|invalidoperationexception|argumentexception/.test(text)) return "runtime_exception";
  if (/runtime crash|player crash|crash at runtime/.test(text)) return "runtime_crash";
  if (/visual|artifact|pink|shader|render/.test(text)) return "visual_artifact";
  if (/import fail|import error|asset import|reimport/.test(text)) return "asset_import_failure";
  if (/performance|fps|gc|alloc|memory leak|slow|stutter/.test(text)) return "performance_regression";
  if (/missing reference|missing_reference/.test(text)) return "missing_reference";
  if (/data loss|corrupt|corruption/.test(text)) return "data_loss_or_corruption";
  if (/version|incompatib|package update/.test(text)) return "version_incompatibility";
  if (/documentation gap|missing doc|docs gap/.test(text)) return "documentation_gap";
  return fallback;
}

function classify(frontmatter: Frontmatter, relPath: string, config: MappingConfig, notes: string[], manual: string[]): Classification | undefined {
  const existingDocType = scalar(frontmatter, "doc_type");
  const existingCategory = scalar(frontmatter, "category");
  const existingFailureMode = scalar(frontmatter, "failure_mode");
  if (existingDocType && existingCategory && existingFailureMode) {
    if (isDocType(existingDocType) && isCategory(existingCategory) && isFailureMode(existingFailureMode)) {
      return { doc_type: existingDocType, category: existingCategory, failure_mode: existingFailureMode };
    }
    manual.push("Existing v2 classification has invalid values.");
    return undefined;
  }

  const legacyProblemType = scalar(frontmatter, "problem_type");
  if (!legacyProblemType) {
    manual.push("No legacy problem_type or complete v2 classification found.");
    return undefined;
  }

  const mapped = config.problemTypeMap?.[legacyProblemType]
    ? mergeClassification(DEFAULT_PROBLEM_TYPE_MAP[legacyProblemType] ?? { doc_type: "solution", category: "gameplay_code", failure_mode: "incorrect_behavior" }, config.problemTypeMap[legacyProblemType], notes)
    : DEFAULT_PROBLEM_TYPE_MAP[legacyProblemType];

  if (!mapped) {
    manual.push(`Unknown legacy problem_type: ${legacyProblemType}`);
    return undefined;
  }

  let result = { ...mapped };
  if (["runtime_error", "logic_error", "best_practice", "documentation_gap"].includes(legacyProblemType)) {
    const inferredCategory = inferCategoryFromComponentModule(scalar(frontmatter, "component"), scalar(frontmatter, "module"));
    if (inferredCategory) result.category = inferredCategory;
  }
  result.failure_mode = inferFailureMode(frontmatter, frontmatter.body, result.failure_mode);
  result = mergeClassification(result, config.pathOverrides?.[relPath], notes);

  if (legacyProblemType === "best_practice") manual.push("Legacy best_practice converted to doc_type: pattern; verify category ownership.");
  if (legacyProblemType === "documentation_gap") manual.push("Legacy documentation_gap converted to doc_type: documentation_gap; verify this belongs under solutions.");
  return result;
}

function desiredPath(root: string, file: string, classification: Classification, shouldMove: boolean): string {
  if (!shouldMove) return file;
  return path.join(root, CATEGORY_DIRS[classification.category], path.basename(file));
}

function updateMarkdownLinks(content: string, oldFile: string, newFile: string, moveMap: Map<string, string>): string {
  return content.replace(/\(([^)]+?\.md)(#[^)]+)?\)/g, (full, linkTarget: string, fragment = "") => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(linkTarget) || linkTarget.startsWith("/") || linkTarget.startsWith("#")) return full;
    const oldTarget = path.resolve(path.dirname(oldFile), linkTarget);
    const newTarget = moveMap.get(path.normalize(oldTarget));
    if (!newTarget) return full;
    let rel = normalizeRel(path.relative(path.dirname(newFile), newTarget));
    if (!rel.startsWith(".")) rel = `./${rel}`;
    return `(${rel}${fragment})`;
  });
}

function loadMapping(mappingPath: string | undefined): MappingConfig {
  if (!mappingPath) return {};
  const resolved = path.resolve(mappingPath);
  return JSON.parse(fs.readFileSync(resolved, "utf8")) as MappingConfig;
}

function planMigration(root: string, config: MappingConfig, shouldMove: boolean): PlannedDoc[] {
  const files = listMarkdownFiles(root);
  const plans: PlannedDoc[] = [];
  for (const file of files) {
    const originalRelativePath = normalizeRel(path.relative(root, file));
    const content = fs.readFileSync(file, "utf8");
    const frontmatter = parseFrontmatter(content);
    const reasons: string[] = [];
    const manualReview: string[] = [];
    if (!frontmatter) {
      plans.push({ originalPath: file, newPath: file, originalRelativePath, newRelativePath: originalRelativePath, content, moved: false, changed: false, skipped: true, reasons, manualReview: ["No YAML frontmatter found."] });
      continue;
    }
    const classification = classify(frontmatter, originalRelativePath, config, reasons, manualReview);
    if (!classification) {
      plans.push({ originalPath: file, newPath: file, originalRelativePath, newRelativePath: originalRelativePath, content, frontmatter, moved: false, changed: false, skipped: true, reasons, manualReview });
      continue;
    }

    setScalar(frontmatter, "schema_version", 2);
    setScalar(frontmatter, "doc_type", classification.doc_type);
    setScalar(frontmatter, "category", classification.category);
    setScalar(frontmatter, "failure_mode", classification.failure_mode);
    frontmatter.entries.delete("problem_type");

    const newPath = desiredPath(root, file, classification, shouldMove);
    const newRelativePath = normalizeRel(path.relative(root, newPath));
    const migratedContent = stringifyFrontmatter(frontmatter);
    const moved = path.normalize(file) !== path.normalize(newPath);
    const changed = moved || migratedContent !== content;
    if (moved && fs.existsSync(newPath) && path.normalize(newPath) !== path.normalize(file)) {
      manualReview.push(`Destination already exists: ${newRelativePath}`);
    }

    plans.push({ originalPath: file, newPath, originalRelativePath, newRelativePath, content: migratedContent, frontmatter, classification, moved, changed, skipped: false, reasons, manualReview });
  }
  return plans;
}

function applyMigration(plans: PlannedDoc[], includeManualReview: boolean) {
  const shouldApply = (plan: PlannedDoc) => !plan.skipped && !plan.manualReview.some((item) => item.startsWith("Destination already exists")) && (includeManualReview || plan.manualReview.length === 0);
  const moveMap = new Map<string, string>();
  for (const plan of plans) {
    if (shouldApply(plan) && plan.moved) {
      moveMap.set(path.normalize(plan.originalPath), plan.newPath);
    }
  }

  for (const plan of plans) {
    if (!shouldApply(plan)) continue;
    const finalContent = updateMarkdownLinks(plan.content, plan.originalPath, plan.newPath, moveMap);
    fs.mkdirSync(path.dirname(plan.newPath), { recursive: true });
    fs.writeFileSync(plan.newPath, finalContent, "utf8");
    if (plan.moved) fs.rmSync(plan.originalPath);
  }
}

function summarize(plans: PlannedDoc[]) {
  const changed = plans.filter((plan) => plan.changed && !plan.skipped).length;
  const moved = plans.filter((plan) => plan.moved && !plan.skipped).length;
  const skipped = plans.filter((plan) => plan.skipped).length;
  const manual = plans.filter((plan) => plan.manualReview.length > 0).length;
  const byCategory: Record<string, number> = {};
  for (const plan of plans) {
    if (plan.classification) byCategory[plan.classification.category] = (byCategory[plan.classification.category] ?? 0) + 1;
  }
  return { scanned: plans.length, changed, moved, skipped, manualReview: manual, byCategory };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.solutionsRoot) throw new Error("--solutions-root is required");
  const root = path.resolve(args.solutionsRoot);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error(`solutions root does not exist or is not a directory: ${root}`);
  const config = loadMapping(args.mappingPath);
  const plans = planMigration(root, config, args.move);
  const summary = summarize(plans);
  const report = {
    mode: args.apply ? "apply" : "dry-run",
    solutionsRoot: root,
    includeManualReview: args.includeManualReview,
    summary,
    files: plans.map((plan) => ({
      path: plan.originalRelativePath,
      newPath: plan.newRelativePath,
      changed: plan.changed,
      moved: plan.moved,
      skipped: plan.skipped,
      classification: plan.classification,
      reasons: plan.reasons,
      manualReview: plan.manualReview,
    })),
  };

  console.log(`Unity docs schema migration (${report.mode})`);
  console.log(`Solutions root: ${root}`);
  console.log(`Scanned: ${summary.scanned}; changed: ${summary.changed}; moved: ${summary.moved}; skipped: ${summary.skipped}; manual review: ${summary.manualReview}`);
  console.log("By category:");
  for (const [category, count] of Object.entries(summary.byCategory).sort((a, b) => a[0].localeCompare(b[0]))) console.log(`  ${category}: ${count}`);

  const needsReview = plans.filter((plan) => plan.manualReview.length > 0);
  if (needsReview.length) {
    console.log("\nManual review:");
    for (const plan of needsReview.slice(0, args.verbose ? undefined : 25)) {
      console.log(`  ${plan.originalRelativePath}${plan.newRelativePath !== plan.originalRelativePath ? ` -> ${plan.newRelativePath}` : ""}`);
      for (const item of plan.manualReview) console.log(`    - ${item}`);
    }
    if (!args.verbose && needsReview.length > 25) console.log(`  ... ${needsReview.length - 25} more (rerun with --verbose or --write-report)`);
  }

  if (args.verbose) {
    console.log("\nFile decisions:");
    for (const plan of plans) {
      console.log(`  ${plan.originalRelativePath}${plan.newRelativePath !== plan.originalRelativePath ? ` -> ${plan.newRelativePath}` : ""}`);
      if (plan.classification) console.log(`    ${plan.classification.doc_type}/${plan.classification.category}/${plan.classification.failure_mode}`);
      for (const reason of plan.reasons) console.log(`    - ${reason}`);
    }
  }

  if (args.writeReport) {
    const reportPath = path.resolve(args.writeReport);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`\nReport written: ${reportPath}`);
  }

  if (args.apply) {
    applyMigration(plans, args.includeManualReview);
    if (needsReview.length && !args.includeManualReview) console.log("\nManual-review files were left untouched. Rerun with mapping overrides or --include-manual-review after explicit approval.");
    console.log("\nMigration applied. Review VCS diff before committing/checking in.");
  } else {
    console.log("\nDry run only. Rerun with --apply to write changes.");
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
