import { strict as assert } from "node:assert";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { executeArtifactSearch, trackArtifactToolResult, type ArtifactSearchExecution, type SearchResult } from "../extensions/artifact-search/core";

const root = mkdtempSync(path.join(tmpdir(), "cg-artifact-search-"));
const write = (relative: string, text: string) => {
  const target = path.join(root, relative);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, text, "utf8");
};
const details = (execution: ArtifactSearchExecution) => execution.details as {
  indexPath: string;
  resultCount: number;
  preparedResultCount: number;
  returnedResultCount: number;
  refreshed: boolean;
  results: SearchResult[];
  refreshStats: { added: number; updated: number; removed: number; unchanged: number };
};

try {
  write("docs/solutions/combat.md", `---
tags: [combat, core]
module: battle
doc_type: solution
severity: high
---
# Combat System

The combat bodyneedle validates body search and links to todos/001-completed-p1-combat.md.
`);
  write("docs/plans/combat-plan.md", `---
tags: [combat]
module: battle
---
# Combat Plan

Plan the combat rollout.
`);
  write("docs/notes/related.md", "# Related Note\n\nSee docs/solutions/combat.md for the implementation.\n");
  write("todos/001-completed-p1-combat.md", `---
status: completed
priority: p1
tags: [combat]
---
# Combat Todo

This completed task mentions combat.
`);
  write("docs/notes/malformed.md", `---
tags: [broken
invalid yaml without a closing delimiter
# Malformed Frontmatter

malformedneedle remains searchable as plain Markdown.
`);

  const ranked = await executeArtifactSearch({ query: "combat", freshnessMode: "strict" }, root);
  assert(!ranked.isError);
  assert.equal(details(ranked).resultCount, 4, "Expected matching fixture artifacts to be indexed without malformed text causing a false match.");
  const malformed = await executeArtifactSearch({ query: "malformedneedle", freshnessMode: "strict" }, root);
  assert.deepEqual(details(malformed).results.map((result) => result.path), ["docs/notes/malformed.md"], "Malformed frontmatter should remain searchable as ordinary Markdown rather than failing the refresh.");
  assert.equal(details(ranked).results[0].path, "todos/001-completed-p1-combat.md", "Current todo priority boosts narrowly outrank the otherwise comparable solution.");
  const filtered = await executeArtifactSearch({ query: "combat", scopes: ["solutions"], module: "battle", docType: "solution", freshnessMode: "strict" }, root);
  assert.deepEqual(details(filtered).results.map((result) => result.path), ["docs/solutions/combat.md"], "Scope and frontmatter filters should compose.");

  const complete = await executeArtifactSearch({ query: "combat", status: "complete", freshnessMode: "strict" }, root);
  assert.deepEqual(details(complete).results.map((result) => result.path), ["todos/001-completed-p1-combat.md"], "Legacy completed todo status should normalize to complete.");
  const excludeCompleted = await executeArtifactSearch({ query: "combat", includeCompletedTodos: false, freshnessMode: "strict" }, root);
  assert(!details(excludeCompleted).results.some((result) => result.kind === "todo"), "Completed todos should be omitted without an explicit status filter.");

  const detailed = await executeArtifactSearch({ query: "bodyneedle", outputMode: "detailed", freshnessMode: "strict" }, root);
  assert.match(detailed.text, /snippet:.*bodyneedle/i, "Detailed output should render body snippets.");
  assert.match(detailed.text, /Index: /, "Detailed output should render the index path.");
  const compact = await executeArtifactSearch({ query: "bodyneedle", outputMode: "compact", freshnessMode: "strict" }, root);
  assert(!compact.text.includes("snippet:"), "Compact output should omit snippets.");
  const noBody = await executeArtifactSearch({ query: "bodyneedle", includeBody: false, freshnessMode: "strict" }, root);
  assert.equal(details(noBody).resultCount, 0, "Body-only matches should honor includeBody=false.");

  const related = await executeArtifactSearch({ query: "Combat System", includeRelated: true, outputMode: "detailed", freshnessMode: "strict" }, root);
  const combat = details(related).results.find((result) => result.path === "docs/solutions/combat.md");
  assert.deepEqual(combat?.related?.map((item) => [item.path, item.relation]), [
    ["todos/001-completed-p1-combat.md", "linksTo"],
    ["docs/notes/related.md", "linkedFrom"],
  ], "Related results should preserve outbound links before backlinks.");

  const limited = await executeArtifactSearch({ query: "combat", limit: 1, freshnessMode: "strict" }, root);
  assert.equal(details(limited).resultCount, 4, "resultCount is the uncapped match count.");
  assert.equal(details(limited).preparedResultCount, 4, "Prepared results retain the pre-display result set.");
  assert.equal(details(limited).returnedResultCount, 1, "returnedResultCount honors display limit.");
  assert.match(limited.text, /^4 matching artifacts; showing 1\./, "Visible output must use the displayed limit without changing total count.");

  write("docs/notes/strict-add.md", "# Strict Add\n\ncombat\n");
  const added = await executeArtifactSearch({ query: "combat", freshnessMode: "strict" }, root);
  assert.equal(details(added).refreshStats.added, 1, "Strict refresh should discover added markdown.");
  write("docs/notes/strict-add.md", "# Strict Update\n\ncombat updated content\n");
  const updated = await executeArtifactSearch({ query: "updated", freshnessMode: "strict" }, root);
  assert.equal(details(updated).refreshStats.updated, 1, "Strict refresh should update changed markdown.");
  rmSync(path.join(root, "docs/notes/strict-add.md"));
  const removed = await executeArtifactSearch({ query: "combat", freshnessMode: "strict" }, root);
  assert.equal(details(removed).refreshStats.removed, 1, "Strict refresh should remove deleted markdown.");

  write("docs/notes/dirty.md", "# Dirty Tracking\n\nbeforechange\n");
  await executeArtifactSearch({ query: "beforechange", freshnessMode: "strict" }, root);
  write("docs/notes/dirty.md", "# Dirty Tracking\n\nafterchange with different size\n");
  trackArtifactToolResult({ toolName: "write", input: { path: "docs/notes/dirty.md" } }, root);
  const dirtyRefresh = await executeArtifactSearch({ query: "afterchange", freshnessMode: "auto", freshnessTtlMs: 60_000 }, root);
  assert.equal(details(dirtyRefresh).refreshed, true, "A successful artifact write should invalidate the auto-mode cache before its TTL expires.");
  assert.equal(details(dirtyRefresh).resultCount, 1);

  const [concurrentA, concurrentB] = await Promise.all([
    executeArtifactSearch({ query: "combat", rebuild: true }, root),
    executeArtifactSearch({ query: "combat", rebuild: true }, root),
  ]);
  assert(!concurrentA.isError && !concurrentB.isError, "Concurrent rebuilds should serialize and both complete.");
  assert(!existsSync(`${details(concurrentA).indexPath}.lock`), "Artifact index lock must be released after concurrent refreshes.");

  write("source-docs/guide.md", "# Custom Guide\n\ncustomneedle\n");
  write("work-items/001-ready-p1.md", "# Custom Todo\n\ncustomneedle\n");
  const custom = await executeArtifactSearch({ query: "customneedle", docsRoot: "source-docs", todosRoot: "work-items", freshnessMode: "strict" }, root);
  const sameCustom = await executeArtifactSearch({ query: "customneedle", docsRoot: "source-docs", todosRoot: "work-items", freshnessMode: "memory" }, root);
  assert.match(details(custom).indexPath, /artifact-index-[a-z0-9_-]+-[a-f0-9]{10}\.json$/, "Custom roots require a stable identity-specific index filename.");
  assert(!details(custom).indexPath.endsWith("artifact-index.json"), "Custom roots must not share the default-root index filename.");
  assert.equal(details(custom).indexPath, details(sameCustom).indexPath, "The same custom roots must reuse their index identity.");

  const invalid = await executeArtifactSearch({ indexPath: "../outside.json" }, root);
  assert.equal(invalid.isError, true, "Invalid index locations should return the tool error result rather than throw.");
  assert.equal((invalid.details as { error: string }).error, "indexPath must be inside workspaceRoot so the generated project index stays project-local.");
  assert.equal(invalid.text, (invalid.details as { error: string }).error, "Error text and details.error must retain the current tool shape.");
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("pi-compound-game-dev artifact search tests passed");
