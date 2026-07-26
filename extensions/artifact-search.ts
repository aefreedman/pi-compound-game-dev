import * as path from "node:path";
import { keyHint, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type } from "typebox";
import { executeArtifactSearch, trackArtifactToolResult, type SearchParams } from "./artifact-search/core";

function getTextContent(result: { content?: Array<{ type?: string; text?: string }> }): string {
  const first = result.content?.[0];
  return first?.type === "text" && typeof first.text === "string" ? first.text : "";
}

const scopeSchema = Type.Union([Type.Literal("all"), Type.Literal("docs"), Type.Literal("solutions"), Type.Literal("plans"), Type.Literal("todos")]);
const rankProfileSchema = Type.Union([Type.Literal("balanced"), Type.Literal("frontmatter"), Type.Literal("recency"), Type.Literal("todos")]);
const matchModeSchema = Type.Union([Type.Literal("all"), Type.Literal("any"), Type.Literal("phrase")]);
const searchFieldSchema = Type.Union([Type.Literal("path"), Type.Literal("title"), Type.Literal("tags"), Type.Literal("frontmatter"), Type.Literal("headings"), Type.Literal("body")]);
const stringOrArray = Type.Union([Type.String(), Type.Array(Type.String())]);


export default function registerArtifactSearch(pi: ExtensionAPI) {
  pi.on("tool_result", async (event: any, ctx: any) => {
    trackArtifactToolResult(event, path.resolve(ctx?.cwd ?? process.cwd()));
  });

  pi.registerTool({
    name: "cg_search_artifacts",
    label: "Search Compound Game Dev Artifacts",
    description: "Search project-local Compound Game Dev docs and todos using an automatically refreshed project index while keeping markdown files as the source of truth.",
    promptSnippet: "Search project docs/todos through an auto-refreshed Compound Game Dev markdown artifact index.",
    promptGuidelines: [
      "Use cg_search_artifacts for structured searches across project-local DOCS_ROOT and TODOS_ROOT when looking for plans, solutions, or file-based todos.",
      "For exploratory feature research with cg_search_artifacts, prefer a structured/scoped pass plus a broad matchMode='any' pass; add minTermMatches when a broad query has many common terms.",
      "Use raw rg after cg_search_artifacts for exact API names, code symbols, paths, error text, and body-only verification; do not treat the index as a replacement for reading source markdown.",
      "cg_search_artifacts keeps markdown files as the source of truth and auto-refreshes its project-local index before searching; do not manually edit the generated index.",
      "For sibling workspaces, set workspaceRoot to the selected child and normally omit docsRoot/todosRoot; relative docs/todos roots are resolved from workspaceRoot.",
      "When using cg_search_artifacts results, cite the returned markdown paths, not the generated index path.",
      "Use rg/grep as a fallback when cg_search_artifacts is unavailable, and as a companion verification tool when exact raw-text evidence matters.",
    ],
    parameters: Type.Object({
      query: Type.Optional(Type.String({ description: "Plain-text search query. Quoted phrases are treated as single terms." })),
      requiredTerms: Type.Optional(stringOrArray),
      optionalTerms: Type.Optional(stringOrArray),
      searchFields: Type.Optional(Type.Array(searchFieldSchema, { description: "Fields used for query matching and scoring. Defaults to all fields, or all except body when includeBody=false." })),
      workspaceRoot: Type.Optional(Type.String({ description: "Project/workspace root. Defaults to the current pi cwd." })),
      docsRoot: Type.Optional(Type.String({ description: "Docs root, absolute or workspace-relative. Defaults to <workspaceRoot>/docs." })),
      todosRoot: Type.Optional(Type.String({ description: "Todos root, absolute or workspace-relative. Defaults to <workspaceRoot>/todos." })),
      indexPath: Type.Optional(Type.String({ description: "Generated project-local index path. Defaults under <workspaceRoot>/.compound-game-dev/; custom docs/todos roots receive a stable identity suffix. Must stay inside workspaceRoot." })),
      scopes: Type.Optional(Type.Array(scopeSchema, { description: "Artifact scopes to search: all, docs, solutions, plans, todos." })),
      status: Type.Optional(stringOrArray),
      priority: Type.Optional(stringOrArray),
      tags: Type.Optional(stringOrArray),
      module: Type.Optional(stringOrArray),
      component: Type.Optional(stringOrArray),
      docType: Type.Optional(stringOrArray),
      category: Type.Optional(stringOrArray),
      failureMode: Type.Optional(stringOrArray),
      problemType: Type.Optional(stringOrArray),
      severity: Type.Optional(stringOrArray),
      rankProfile: Type.Optional(rankProfileSchema),
      matchMode: Type.Optional(matchModeSchema),
      minTermMatches: Type.Optional(Type.Number({ description: "Minimum number of unique query terms that must match. Useful with matchMode=any to reduce broad-search noise." })),
      limit: Type.Optional(Type.Number({ description: "Maximum displayed results. Defaults to 20." })),
      maxSnippetChars: Type.Optional(Type.Number({ description: "Approximate max snippet characters per result. Defaults to 220." })),
      includeBody: Type.Optional(Type.Boolean({ description: "Whether query matching should include markdown body text. Defaults to true." })),
      includeCompletedTodos: Type.Optional(Type.Boolean({ description: "Whether todo searches include completed todos when no explicit status filter is supplied. Defaults to true." })),
      includeRelated: Type.Optional(Type.Boolean({ description: "Include directly linked/linking artifacts for returned results when references are present." })),
      relatedLimit: Type.Optional(Type.Number({ description: "Maximum related artifacts per result when includeRelated is true. Defaults to 5." })),
      groupByKind: Type.Optional(Type.Boolean({ description: "Group displayed results by artifact kind while preserving score order within each group." })),
      freshnessMode: Type.Optional(Type.Union([Type.Literal("auto"), Type.Literal("strict"), Type.Literal("memory")], { description: "Freshness strategy: auto uses dirty tracking and a TTL fast path, strict scans markdown every time, memory trusts the loaded index." })),
      freshnessTtlMs: Type.Optional(Type.Number({ description: "Auto-mode in-memory freshness TTL in milliseconds. Defaults to 30000." })),
      outputMode: Type.Optional(Type.Union([Type.Literal("compact"), Type.Literal("detailed")], { description: "Controls agent-facing result text. compact is default and omits snippets/index paths; detailed restores verbose snippets and full metadata." })),
      explain: Type.Optional(Type.Boolean({ description: "Include score/ranking reasons for each result." })),
      rebuild: Type.Optional(Type.Boolean({ description: "Force rebuilding the generated index before searching." })),
    }),
    async execute(_toolCallId, params, _signal, onUpdate, ctx) {
      onUpdate?.({ content: [{ type: "text" as const, text: "Refreshing Compound Game Dev artifact index..." }] });
      const execution = await executeArtifactSearch(params as SearchParams, ctx.cwd);
      const result = {
        content: [{ type: "text" as const, text: execution.text }],
        details: execution.details,
      };
      return execution.isError ? { ...result, isError: true } : result;
    },
    renderCall(args, theme) {
      let text = theme.fg("toolTitle", theme.bold("cg_search_artifacts "));
      text += theme.fg("accent", args.query ?? "<filters only>");
      const scopes = Array.isArray(args.scopes) ? args.scopes.join(",") : undefined;
      if (scopes) text += theme.fg("dim", ` (${scopes})`);
      return new Text(text, 0, 0);
    },
    renderResult(result, { expanded, isPartial }, theme) {
      if (isPartial) return new Text(theme.fg("warning", "Searching artifacts..."), 0, 0);
      const details = result.details as { error?: string; resultCount?: number; totalIndexedFiles?: number; refreshed?: boolean } | undefined;
      const output = getTextContent(result);
      if (details?.error || result.isError) {
        const message = details?.error ?? output.split("\n")[0] ?? "Unknown error";
        return new Text(theme.fg("error", `Error: ${message}`), 0, 0);
      }
      let text = theme.fg("success", `Found ${details?.resultCount ?? 0} artifact match${details?.resultCount === 1 ? "" : "es"}`);
      text += theme.fg("dim", ` across ${details?.totalIndexedFiles ?? 0} indexed files`);
      if (details?.refreshed) text += theme.fg("dim", " (index refreshed)");
      if (!expanded) {
        text += ` ${theme.fg("muted", `(${keyHint("app.tools.expand", "to expand")})`)}`;
        return new Text(text, 0, 0);
      }
      return new Text(`${text}\n${theme.fg("toolOutput", output)}`, 0, 0);
    },
  });
}
