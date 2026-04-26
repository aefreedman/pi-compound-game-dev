import { existsSync, readdirSync, readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
  name?: string;
  pi?: { extensions?: string[]; prompts?: string[]; skills?: string[] };
};
const readmeText = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const extensionText = readFileSync(new URL("../extensions/register-subagents.ts", import.meta.url), "utf8");

assert.equal(pkg.name, "@aefree/pi-compound-game-dev");
assert(pkg.pi?.extensions?.includes("./extensions"), "Expected extension directory registration.");
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
]) {
  assert(existsSync(new URL(`../prompts/${prompt}`, import.meta.url)), `Expected prompt ${prompt}`);
}

const promptEntries = readdirSync(new URL("../prompts", import.meta.url), { withFileTypes: true });
const topLevelPrompts = promptEntries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name);
assert(promptEntries.every((entry) => entry.isFile()), "The prompts directory must contain only prompt files; reference material belongs in ../references.");
assert(existsSync(new URL("../references/_shared/vcs-detection.md", import.meta.url)), "Expected shared reference files outside prompts.");
assert(!existsSync(new URL("../prompt-support", import.meta.url)), "Did not expect obsolete prompt-support directory.");
assert(!existsSync(new URL("../references/cg-plan/post-generation-options.md", import.meta.url)), "Did not expect cg-plan post-generation options.");
assert(!existsSync(new URL("../skills/unity-docs/references/post-documentation-menu.md", import.meta.url)), "Did not expect unity-docs post-documentation menu.");
for (const supportDir of ["cg-plan", "cg-work", "cg-review", "cg-resolve-todo-parallel", "cg-triage", "cg-compound", "cg-changelog"]) {
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
assert(extensionText.includes("@aefree/pi-compound-game-dev"), "Expected extension fallback package name to be updated.");
assert(existsSync(new URL("../docs/removed-agents.md", import.meta.url)), "Expected removed-agent documentation.");
assert(existsSync(new URL("../docs/output-format-contracts.md", import.meta.url)), "Expected output format contract documentation.");
assert(!existsSync(new URL("../references/cg-review/ultra-thinking.md", import.meta.url)), "Did not expect review ultra-thinking reference.");

for (const expectedAgent of [
  "agents/research/cg-repo-researcher.md",
  "agents/research/cg-learnings-researcher.md",
  "agents/research/cg-git-history-analyzer.md",
  "agents/research/cg-plastic-history-analyzer.md",
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
  "agents/workflow/lint.md",
  "agents/workflow/pr-comment-resolver.md",
  "agents/workflow/spec-flow-analyzer.md",
]) {
  assert(!existsSync(new URL(`../${removedAgent}`, import.meta.url)), `Did not expect old/removed agent ${removedAgent}`);
}

console.log("pi-compound-game-dev package validation tests passed");
