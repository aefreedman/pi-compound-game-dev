import { existsSync, readdirSync, readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
  name?: string;
  version?: string;
  pi?: { extensions?: string[]; prompts?: string[]; skills?: string[] };
  peerDependencies?: Record<string, string>;
};
const readmeText = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const extensionText = readFileSync(new URL("../extensions/register-subagents.ts", import.meta.url), "utf8");
const referenceReaderText = readFileSync(new URL("../extensions/read-reference.ts", import.meta.url), "utf8");
const artifactSearchText = readFileSync(new URL("../extensions/artifact-search.ts", import.meta.url), "utf8");
const changelogText = readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8");
const artifactSearchDocText = readFileSync(new URL("../docs/artifact-search.md", import.meta.url), "utf8");
const qualityChecklistText = readFileSync(new URL("../references/cg-work/quality-checklist.md", import.meta.url), "utf8");
const reviewAgentPromptsText = readFileSync(new URL("../references/cg-review/agent-prompts.md", import.meta.url), "utf8");
const reviewConditionalAgentsText = readFileSync(new URL("../references/cg-review/conditional-agents.md", import.meta.url), "utf8");
const reviewUnityTestingText = readFileSync(new URL("../references/cg-review/unity-testing.md", import.meta.url), "utf8");
const resolveTodoImplementationText = readFileSync(new URL("../references/cg-resolve-todo-parallel/implementation.md", import.meta.url), "utf8");
const planResearchAgentsText = readFileSync(new URL("../references/cg-plan/research-agents.md", import.meta.url), "utf8");
const planSpecflowText = readFileSync(new URL("../references/cg-plan/specflow.md", import.meta.url), "utf8");
const changelogPromptText = readFileSync(new URL("../prompts/cg-changelog.md", import.meta.url), "utf8");
const changelogPlasticText = readFileSync(new URL("../references/cg-changelog/plastic-workflow.md", import.meta.url), "utf8");
const changelogCodecksText = readFileSync(new URL("../references/cg-changelog/codecks-workflow.md", import.meta.url), "utf8");
const changelogSourceSelectionText = readFileSync(new URL("../references/cg-changelog/source-selection.md", import.meta.url), "utf8");
const changelogErrorHandlingText = readFileSync(new URL("../references/cg-changelog/error-handling.md", import.meta.url), "utf8");

assert.equal(pkg.name, "@aefree/pi-compound-game-dev");
assert.equal(pkg.version, "0.4.0");
assert(pkg.pi?.extensions?.includes("./extensions"), "Expected extension directory registration.");
assert(pkg.peerDependencies?.typebox === "*", "Expected typebox peer dependency for package reference reader.");
assert(pkg.peerDependencies?.["@mariozechner/pi-tui"] === "*", "Expected pi-tui peer dependency for package reference reader rendering.");
assert(referenceReaderText.includes("cg_read_reference"), "Expected package reference reader tool registration.");
assert(referenceReaderText.includes("renderResult"), "Expected package reference reader to provide expandable result rendering.");
assert(referenceReaderText.includes("app.tools.expand"), "Expected package reference reader rendering to include the standard expand key hint.");
assert(artifactSearchText.includes("cg_search_artifacts"), "Expected project artifact search tool registration.");
assert(artifactSearchText.includes("buildOrRefreshIndex"), "Expected artifact search to refresh its generated project index.");
assert(artifactSearchText.includes("FIELD_WEIGHTS"), "Expected artifact search to expose ranking controls.");
assert(artifactSearchText.includes(".compound-game-dev") && !artifactSearchText.includes(".pi\", \"compound-game-dev"), "Expected artifact index default to avoid the .pi runtime/config directory.");
assert(artifactSearchText.includes("normalizeTodoStatus") && artifactSearchText.includes('normalized === "completed"'), "Expected artifact search to normalize legacy completed todo status.");
assert(artifactSearchText.includes("inMemoryIndexCache") && artifactSearchText.includes("cached.size === indexStat.size"), "Expected artifact search to cache the parsed index in memory safely.");
assert(artifactSearchText.includes("inProcessIndexQueues") && artifactSearchText.includes("acquireIndexLock") && artifactSearchText.includes(".lock"), "Expected artifact search to serialize concurrent index refreshes.");
assert(artifactSearchText.includes("requiredTerms") && artifactSearchText.includes("optionalTerms") && artifactSearchText.includes("searchFields") && artifactSearchText.includes("minTermMatches") && artifactSearchText.includes("countMatchedTerms") && artifactSearchText.includes("totalMatches"), "Expected artifact search to support broad-query noise controls and uncapped match counts.");
assert(artifactSearchText.includes("docType") && artifactSearchText.includes("category") && artifactSearchText.includes("failureMode") && artifactSearchText.includes("failure_mode"), "Expected artifact search to support Unity solution-doc schema v2 filters.");
assert(artifactSearchText.includes("normalizeSearchText") && artifactSearchText.includes("replace(/[-_/]+/g"), "Expected artifact search to normalize common query separators.");
assert(artifactSearchText.includes("buildSearchText") && artifactSearchText.includes("suggestedRgCommand") && artifactSearchText.includes("groupResultsByKind") && artifactSearchText.includes("attachRelatedArtifacts"), "Expected artifact search to include normalized index text, rg suggestions, grouping, and related artifacts.");
assert(artifactSearchText.includes("freshnessMode") && artifactSearchText.includes("freshnessTtlMs") && artifactSearchText.includes("dirtyIndexPaths") && artifactSearchText.includes("bodyPreview"), "Expected artifact search to support fast-path freshness and avoid full-body indexing by default.");
assert(artifactSearchText.includes("outputMode") && artifactSearchText.includes("formatCompactFrontmatterSummary") && artifactSearchText.includes('params.outputMode === "detailed"'), "Expected artifact search to support compact agent-facing output with a detailed fallback.");
assert(artifactSearchText.includes("preparedResultCount") && artifactSearchText.includes("returnedResultCount"), "Expected artifact search details to distinguish prepared and returned result counts.");
assert(changelogText.includes("0.3.6") && changelogText.includes("Unity YAML asset editing"), "Expected changelog entry for large Unity YAML asset guidance.");
assert(changelogText.includes("0.3.5") && changelogText.includes("Python utility environments"), "Expected changelog entry for Python utility environment guidance.");
assert(changelogText.includes("0.3.4") && changelogText.includes("design-time validation"), "Expected changelog entry for authored-content validation guidance.");
assert(changelogText.includes("0.3.3") && changelogText.includes("full replacement"), "Expected changelog entry for replacement-vs-compatibility guidance.");
assert(changelogText.includes("0.3.2") && changelogText.includes("unity-batchmode-tests"), "Expected changelog entry for Unity batchmode skill-loading guidance.");
assert(changelogText.includes("0.3.1") && changelogText.includes("outputMode"), "Expected changelog entry for compact artifact search output.");
assert(changelogText.includes("0.3.0") && changelogText.includes("migrate-unity-docs-schema"), "Expected changelog entry for Unity docs schema migration.");
assert(changelogText.includes("0.2.0") && changelogText.includes("cg_search_artifacts"), "Expected changelog entry for artifact search.");
assert(artifactSearchDocText.includes(".compound-game-dev/") && artifactSearchDocText.includes("Do not ignore `docs/` or `todos/`"), "Expected artifact search docs to recommend ignoring only the generated cache directory.");
assert(artifactSearchDocText.includes("Concurrent Search Safety") && artifactSearchDocText.includes("artifact-index.json.lock"), "Expected artifact search docs to describe lock behavior.");
assert(artifactSearchDocText.includes("Hybrid Search Workflow") && artifactSearchDocText.includes('matchMode: "any"') && artifactSearchDocText.includes("Raw docs verification"), "Expected artifact search docs to describe hybrid indexed/raw search workflow.");
assert(qualityChecklistText.includes("Do not issue multiple `unity_launch_batchmode` calls"), "Expected Unity validation guidance to forbid parallel batchmode runs for one project.");
assert(qualityChecklistText.includes("load the `unity-batchmode-tests` skill"), "Expected Unity validation guidance to load the Unity batchmode skill before first run.");
assert(qualityChecklistText.includes("full replacement") && qualityChecklistText.includes("backward-compatible support"), "Expected scope discipline guidance for replacement vs compatibility.");
assert(qualityChecklistText.includes("UXML") && qualityChecklistText.includes("USS") && qualityChecklistText.includes("C#"), "Expected Unity UI Toolkit structure/style guidance.");
assert(qualityChecklistText.includes("edit/design time") && qualityChecklistText.includes("magic-number"), "Expected authored-content validation and mutable designer-data test guidance.");
assert(qualityChecklistText.includes("Windows Command Safety") && qualityChecklistText.includes("UTF-8"), "Expected Windows command safety guidance.");
assert(qualityChecklistText.includes("local agent Python utility environment") && qualityChecklistText.includes("non-stdlib imports"), "Expected Python utility environment discovery guidance.");
assert(qualityChecklistText.includes("check-only") && qualityChecklistText.includes('agentScope: "both"'), "Expected lint/reviewer delegation to use safe current agent contracts.");
assert(reviewAgentPromptsText.includes("explicitly request") && reviewAgentPromptsText.includes('agentScope: "both"'), "Expected concern-driven review routing and project-local agent discovery.");
assert(reviewConditionalAgentsText.includes("Both, dependent") && reviewConditionalAgentsText.includes("run migration first"), "Expected dependency-aware migration/deployment routing.");
assert(reviewUnityTestingText.includes("not automatically a P1") && !reviewUnityTestingText.includes("create P1 todos for any failing tests"), "Expected evidence-based Unity test failure classification.");
assert(resolveTodoImplementationText.includes("cg-pr-comment-resolver") && resolveTodoImplementationText.includes('agentScope: "both"') && resolveTodoImplementationText.includes("Partial") && resolveTodoImplementationText.includes("Not Applied"), "Expected resolver routing to consume the current status and authority contract.");
assert(planResearchAgentsText.includes("Not Found or Uncertain") && planResearchAgentsText.includes("budget-reached") && !planResearchAgentsText.includes("time-budget"), "Expected planning research briefs to match current stop/output contracts.");
assert(planSpecflowText.includes('agentScope: "both"') && planSpecflowText.includes("Provisional Assumptions"), "Expected SpecFlow delegation to use current discovery and output contracts.");
assert(readFileSync(new URL("../prompts/cg-work.md", import.meta.url), "utf8").includes("references/cg-work/unity-yaml-assets.md"), "Expected cg-work prompt to load Unity YAML asset editing guidance for serialized assets.");
assert(readFileSync(new URL("../references/cg-work/unity-yaml-assets.md", import.meta.url), "utf8").includes("heredocs") && readFileSync(new URL("../references/cg-work/unity-yaml-assets.md", import.meta.url), "utf8").includes("fileID"), "Expected Unity YAML asset guidance to cover heredoc avoidance and Unity serialization identifiers.");
assert(qualityChecklistText.includes("do not pass `-quit` with `-runTests`"), "Expected Unity Test Framework guidance to avoid -quit with -runTests.");
assert(!changelogPlasticText.includes("--orderby"), "Plastic changelog docs must not use unsupported cm find --orderby syntax.");
assert(!changelogPlasticText.includes("--limit"), "Plastic changelog docs must not use unsupported cm find --limit syntax.");
assert(changelogPlasticText.includes("order by date desc limit 200"), "Expected Plastic changelog docs to show query-text ordering and limit syntax.");
assert(changelogCodecksText.includes("codecks_card_list_done_within_timeframe({"), "Expected Codecks changelog docs to show explicit done-timeframe payload.");
assert(changelogCodecksText.includes("since:") && changelogCodecksText.includes("until:"), "Expected Codecks changelog docs to include since and until arguments.");
assert(changelogCodecksText.includes("do not send free-text prompts or GraphQL strings"), "Expected Codecks changelog docs to forbid unsupported query fallbacks.");
assert(changelogPromptText.includes("multiple sources") && changelogPromptText.includes("track status for each source"), "Expected changelog prompt to support multi-source source-status reporting.");
assert(changelogSourceSelectionText.includes("Do not collapse a multi-source request"), "Expected source selection docs to preserve multi-source requests.");
assert(changelogErrorHandlingText.includes("Source Status") && changelogErrorHandlingText.includes("reduced confidence"), "Expected changelog error handling to document source status and reduced confidence.");
assert(pkg.pi?.prompts?.includes("./prompts"), "Expected prompt directory registration.");
assert(pkg.pi?.skills?.includes("./skills"), "Expected skill directory registration.");

for (const prompt of [
  "cg-plan.md",
  "cg-work.md",
  "cg-review.md",
  "cg-review-resolve.md",
  "cg-loop.md",
  "cg-loop-existing-plan.md",
  "cg-resolve-todo-parallel.md",
  "cg-triage.md",
  "cg-compound.md",
  "cg-changelog.md",
  "cg-groom-docs.md",
  "cg-migrate-unity-docs-schema.md",
]) {
  assert(existsSync(new URL(`../prompts/${prompt}`, import.meta.url)), `Expected prompt ${prompt}`);
}

const promptEntries = readdirSync(new URL("../prompts", import.meta.url), { withFileTypes: true });
const topLevelPrompts = promptEntries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name);
const promptTexts = topLevelPrompts.map((prompt) => readFileSync(new URL(`../prompts/${prompt}`, import.meta.url), "utf8"));
for (const promptText of promptTexts) {
  assert(!promptText.includes("../references/"), "Prompt package references must use cg_read_reference package-relative paths, not ../references paths.");
  assert(!promptText.includes("../prompts/"), "Prompt package prompt references must use cg_read_reference package-relative paths, not ../prompts paths.");
  if (promptText.includes("references/") || promptText.includes("prompts/")) {
    assert(promptText.includes("cg_read_reference"), "Prompts that reference package files must instruct use of cg_read_reference.");
  }
}

const packageMarkdownFiles = (function walk(url: URL): URL[] {
  return readdirSync(url, { withFileTypes: true }).flatMap((entry) => {
    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, url);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") return walk(child);
    return entry.isFile() && entry.name.endsWith(".md") ? [child] : [];
  });
})(new URL("../", import.meta.url));
const packageReferencePattern = /(?:prompts|references|skills)\/[A-Za-z0-9_./-]+\.(?:md|markdown|txt|json|ya?ml|ts|js|sh)/g;
for (const markdownFile of packageMarkdownFiles) {
  const markdownText = readFileSync(markdownFile, "utf8");
  assert(!markdownText.includes("../references/"), `Package docs should not refer to ../references paths: ${markdownFile.pathname}`);
  assert(!markdownText.includes("../prompts/"), `Package docs should not refer to ../prompts paths: ${markdownFile.pathname}`);
  for (const [referencePath] of markdownText.matchAll(packageReferencePattern)) {
    assert(existsSync(new URL(`../${referencePath}`, import.meta.url)), `Expected package reference to exist: ${referencePath}`);
  }
}
assert(promptEntries.every((entry) => entry.isFile()), "The prompts directory must contain only prompt files; reference material belongs in ../references.");
assert(existsSync(new URL("../references/_shared/vcs-detection.md", import.meta.url)), "Expected shared reference files outside prompts.");
assert(!existsSync(new URL("../prompt-support", import.meta.url)), "Did not expect obsolete prompt-support directory.");
assert(!existsSync(new URL("../references/cg-plan/post-generation-options.md", import.meta.url)), "Did not expect cg-plan post-generation options.");
assert(!existsSync(new URL("../skills/unity-docs/references/post-documentation-menu.md", import.meta.url)), "Did not expect unity-docs post-documentation menu.");
for (const supportDir of ["cg-plan", "cg-work", "cg-review", "cg-resolve-todo-parallel", "cg-triage", "cg-compound", "cg-changelog", "cg-groom-docs"]) {
  assert(existsSync(new URL(`../references/${supportDir}`, import.meta.url)), `Expected prompt reference directory ${supportDir}`);
  assert(!existsSync(new URL(`../references/${supportDir}/references`, import.meta.url)), `Did not expect nested references directory in ${supportDir}`);
}
for (const oldSupportDir of ["cd-plan", "cd-work", "cd-review", "cd-resolve-todo-parallel", "cd-triage", "cd-compound", "cd-changelog"]) {
  assert(!existsSync(new URL(`../references/${oldSupportDir}`, import.meta.url)), `Did not expect old prompt reference directory ${oldSupportDir}`);
}
for (const oldPrompt of [
  "workflows-plan.md",
  "workflows-work.md",
  "workflows-review.md",
  "workflows-review-resolve.md",
  "workflows-loop.md",
  "workflows-loop-existing-plan.md",
  "workflows-compound.md",
  "workflows-brainstorm.md",
  "resolve_todo_parallel.md",
  "triage.md",
  "changelog.md",
  "continue.md",
  "cd-plan.md",
  "cd-work.md",
  "cd-review.md",
  "cd-review-resolve.md",
  "cd-loop.md",
  "cd-loop-existing-plan.md",
  "cd-resolve-todo-parallel.md",
  "cd-triage.md",
  "cd-compound.md",
  "cd-changelog.md",
]) {
  assert(!topLevelPrompts.includes(oldPrompt), `Did not expect old prompt ${oldPrompt}`);
}

for (const skill of ["file-todos", "git-worktree", "unity-docs"]) {
  assert(existsSync(new URL(`../skills/${skill}/SKILL.md`, import.meta.url)), `Expected retained skill ${skill}`);
}

for (const removedSkill of [
  "brainstorming",
  "capturing-screenshots-unity",
  "compound-docs",
  "executing-work",
  "planning-features",
  "resolve-todo-parallel",
  "reviewing-code",
  "streamlining-skills",
  "triage",
  "writing-changelogs",
]) {
  assert(!existsSync(new URL(`../skills/${removedSkill}`, import.meta.url)), `Did not expect removed skill ${removedSkill}`);
}

assert(readmeText.includes("Compound Game Dev"), "Expected public package name in README.");
assert(readmeText.includes("AGENTS.md"), "Expected README to mention project stack guidance.");
assert(readmeText.includes("/cg-plan"), "Expected README to document cg commands.");
assert(readmeText.includes("/cg-groom-docs"), "Expected README to document docs grooming command.");
assert(extensionText.includes("@aefree/pi-compound-game-dev"), "Expected extension fallback package name to be updated.");
assert(existsSync(new URL("../docs/removed-agents.md", import.meta.url)), "Expected removed-agent documentation.");
assert(existsSync(new URL("../docs/output-format-contracts.md", import.meta.url)), "Expected output format contract documentation.");
assert(existsSync(new URL("../docs/artifact-search.md", import.meta.url)), "Expected artifact search documentation.");
assert(existsSync(new URL("../scripts/migrate-unity-docs-schema.ts", import.meta.url)), "Expected Unity docs schema migrator script.");
assert(existsSync(new URL("../skills/unity-docs/references/category-selection.md", import.meta.url)), "Expected Unity docs category-selection guidance.");
assert(existsSync(new URL("../docs/markdown-artifact-authoring.md", import.meta.url)), "Expected markdown artifact authoring documentation.");
assert(!existsSync(new URL("../references/cg-review/ultra-thinking.md", import.meta.url)), "Did not expect review ultra-thinking reference.");
assert(existsSync(new URL("../references/cg-vcs-history-analyzer/git-backend.md", import.meta.url)), "Expected Git history backend guidance.");
assert(existsSync(new URL("../references/cg-vcs-history-analyzer/plastic-backend.md", import.meta.url)), "Expected Plastic history backend guidance.");

for (const expectedAgent of [
  "agents/research/cg-repo-researcher.md",
  "agents/research/cg-learnings-researcher.md",
  "agents/research/cg-vcs-history-analyzer.md",
  "agents/review/cg-pattern-specialist.md",
  "agents/review/cg-architecture-specialist.md",
  "agents/review/cg-security-reviewer.md",
  "agents/review/cg-data-integrity-reviewer.md",
  "agents/review/cg-data-migration-reviewer.md",
  "agents/review/cg-deployment-verifier.md",
  "agents/review/cg-agent-native-reviewer.md",
  "agents/review/cg-code-simplicity-reviewer.md",
  "agents/workflow/cg-lint-specialist.md",
  "agents/workflow/cg-pr-comment-resolver.md",
  "agents/workflow/cg-spec-flow-analyzer.md",
]) {
  assert(existsSync(new URL(`../${expectedAgent}`, import.meta.url)), `Expected renamed agent ${expectedAgent}`);
}

const agentRoot = new URL("../agents/", import.meta.url);
const agentFiles = (function walk(url: URL): URL[] {
  return readdirSync(url, { withFileTypes: true }).flatMap((entry) => {
    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, url);
    if (entry.isDirectory()) return walk(child);
    return entry.isFile() && entry.name.endsWith(".md") ? [child] : [];
  });
})(agentRoot);

for (const agentFile of agentFiles) {
  const filename = agentFile.pathname.split("/").pop() ?? "";
  assert(filename.startsWith("cg-"), `Expected agent filename to use cg- prefix: ${filename}`);
  const text = readFileSync(agentFile, "utf8");
  const nameMatch = text.match(/^name:\s*(.+)$/m);
  assert(nameMatch, `Expected agent frontmatter name in ${filename}`);
  assert(nameMatch[1].startsWith("cg-"), `Expected agent frontmatter name to use cg- prefix in ${filename}`);
  assert(!/^mode:/m.test(text), `Did not expect unsupported mode frontmatter in ${filename}`);
  assert(!/^reasoningEffort:/m.test(text), `Did not expect unsupported reasoningEffort frontmatter in ${filename}`);
  assert(!/^tools:\s*$\n\s+[^-\s][^\n]*:/m.test(text), `Did not expect map-shaped tools frontmatter in ${filename}`);
  assert(/^class:\s*(research|review|workflow|planning|implementation)$/m.test(text), `Expected supported class frontmatter in ${filename}`);
  assert(/^tools:\s*\S+/m.test(text), `Expected an explicit tools allowlist in ${filename}`);
  assert(/^output_format:\s*markdown_sections$/m.test(text), `Expected markdown output contract in ${filename}`);
  assert(/^required_sections:\s*\S+/m.test(text), `Expected required sections in ${filename}`);
  assert(/^strictness:\s*(low|medium|high)$/m.test(text), `Expected strictness frontmatter in ${filename}`);
}

for (const removedAgent of [
  "agents/research/best-practices-researcher.md",
  "agents/research/framework-docs-researcher.md",
  "agents/review/performance-oracle.md",
  "agents/review/security-sentinel.md",
  "agents/review/data-integrity-guardian.md",
  "agents/review/data-migration-expert.md",
  "agents/review/deployment-verification-agent.md",
  "agents/review/agent-native-reviewer.md",
  "agents/review/code-simplicity-reviewer.md",
  "agents/review/pattern-recognition-specialist.md",
  "agents/review/architecture-strategist.md",
  "agents/research/repo-research-analyst.md",
  "agents/research/learnings-researcher.md",
  "agents/research/git-history-analyzer.md",
  "agents/research/plastic-history-analyzer.md",
  "agents/research/vcs-history-analyzer.md",
  "agents/research/cg-git-history-analyzer.md",
  "agents/research/cg-plastic-history-analyzer.md",
  "agents/workflow/lint.md",
  "agents/workflow/pr-comment-resolver.md",
  "agents/workflow/spec-flow-analyzer.md",
]) {
  assert(!existsSync(new URL(`../${removedAgent}`, import.meta.url)), `Did not expect old/removed agent ${removedAgent}`);
}

console.log("pi-compound-game-dev package validation tests passed");
