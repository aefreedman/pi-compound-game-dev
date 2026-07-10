import { access, readdir, realpath, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import * as path from "node:path";
import {
  DEFAULT_MAX_BYTES,
  DEFAULT_MAX_LINES,
  truncateHead,
  type ExtensionAPI,
} from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import {
  buildUnityGeneratedExclusions,
  displayPathFromRoot,
  isPathWithin,
  normalizeDisplayPath,
  runRipgrepCell,
  stripLeadingAt,
  type RepoSearchCellResult,
  type RepoSearchQuery,
  UNITY_GENERATED_DIRECTORIES,
} from "./repo-search-core";

const UNITY_MARKERS = ["Assets", "Packages/manifest.json", "ProjectSettings/ProjectVersion.txt"];
const WALK_SKIP_DIRS = new Set([".git", ".plastic", "node_modules", ...UNITY_GENERATED_DIRECTORIES]);

type RepoSearchParams = {
  queries: Array<{ id?: string; pattern: string; literal?: boolean; caseSensitive?: boolean }>;
  workspaceRoot?: string;
  roots?: string[];
  globs?: string[];
  includeHidden?: boolean;
  includeUnityGenerated?: boolean;
  maxMatches?: number;
  maxMatchesPerFile?: number;
  maxSnippetChars?: number;
  timeoutSecondsPerSearch?: number;
};

type RootContext = {
  path: string;
  displayPath: string;
  ignoreFiles: string[];
  unityExclusions: string[];
  excludedByPolicy: boolean;
};

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const error = new Error("Repository search cancelled.");
    error.name = "AbortError";
    throw error;
  }
}

function normalizeForCompare(value: string): string {
  const normalized = path.resolve(value);
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

async function exists(value: string): Promise<boolean> {
  try {
    await stat(value);
    return true;
  } catch {
    return false;
  }
}

async function resolveContainedExistingPath(workspaceRoot: string, rawPath: string): Promise<string> {
  const requested = path.resolve(workspaceRoot, stripLeadingAt(rawPath));
  const canonical = await realpath(requested).catch(() => {
    throw new Error(`Repository search root does not exist: ${rawPath}`);
  });
  if (!isPathWithin(workspaceRoot, canonical)) {
    throw new Error(`Repository search root escapes workspaceRoot: ${rawPath}`);
  }
  return canonical;
}

async function isUnityRoot(directory: string): Promise<boolean> {
  const assets = path.join(directory, UNITY_MARKERS[0]);
  const manifest = path.join(directory, ...UNITY_MARKERS[1].split("/"));
  const projectVersion = path.join(directory, ...UNITY_MARKERS[2].split("/"));
  return (await exists(assets)) && ((await exists(manifest)) || (await exists(projectVersion)));
}

async function findUnityRootsWithin(root: string, maxDepth = 4, signal?: AbortSignal): Promise<string[]> {
  const found: string[] = [];
  const rootStats = await stat(root);
  if (!rootStats.isDirectory()) return found;
  const start = root;

  async function visit(directory: string, depth: number): Promise<void> {
    throwIfAborted(signal);
    if (await isUnityRoot(directory)) {
      found.push(directory);
      return;
    }
    if (depth >= maxDepth) return;
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true, encoding: "utf8" });
    } catch {
      return;
    }
    for (const entry of entries) {
      throwIfAborted(signal);
      if (!entry.isDirectory() || entry.isSymbolicLink() || WALK_SKIP_DIRS.has(entry.name)) continue;
      await visit(path.join(directory, entry.name), depth + 1);
    }
  }

  await visit(start, 0);
  return found;
}

async function findAncestorUnityRoot(workspaceRoot: string, root: string, signal?: AbortSignal): Promise<string | undefined> {
  let current = (await stat(root)).isDirectory() ? root : path.dirname(root);
  while (isPathWithin(workspaceRoot, current)) {
    throwIfAborted(signal);
    if (await isUnityRoot(current)) return current;
    if (normalizeForCompare(current) === normalizeForCompare(workspaceRoot)) break;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return undefined;
}

async function collectPlasticIgnoreFiles(workspaceRoot: string, root: string, signal?: AbortSignal): Promise<string[]> {
  const rootStats = await stat(root);
  const directory = rootStats.isDirectory() ? root : path.dirname(root);
  const relative = path.relative(workspaceRoot, directory);
  const segments = relative && relative !== "." ? relative.split(path.sep) : [];
  const directories = [workspaceRoot];
  let current = workspaceRoot;
  for (const segment of segments) {
    current = path.join(current, segment);
    directories.push(current);
  }

  const ignoreFiles: string[] = [];
  for (const candidateDirectory of directories) {
    throwIfAborted(signal);
    for (const name of ["ignore.conf", "cloaked.conf"]) {
      const candidate = path.join(candidateDirectory, name);
      try {
        await access(candidate, fsConstants.R_OK);
        ignoreFiles.push(candidate);
      } catch (error: any) {
        if (error?.code !== "ENOENT") throw new Error(`Plastic ignore file is unreadable: ${candidate}`);
      }
    }
  }
  return ignoreFiles;
}

async function buildRootContext(workspaceRoot: string, root: string, includeUnityGenerated: boolean, signal?: AbortSignal): Promise<RootContext> {
  throwIfAborted(signal);
  const ignoreFiles = await collectPlasticIgnoreFiles(workspaceRoot, root, signal);
  const ancestorUnityRoot = await findAncestorUnityRoot(workspaceRoot, root, signal);
  const nestedUnityRoots = ancestorUnityRoot ? [] : await findUnityRootsWithin(root, 4, signal);
  const unityRoots = ancestorUnityRoot ? [ancestorUnityRoot] : nestedUnityRoots;
  const exclusions = includeUnityGenerated ? { globs: [], rootExcluded: false } : buildUnityGeneratedExclusions(root, unityRoots);
  return {
    path: root,
    displayPath: displayPathFromRoot(workspaceRoot, root),
    ignoreFiles,
    unityExclusions: exclusions.globs,
    excludedByPolicy: exclusions.rootExcluded,
  };
}

function normalizeQueries(params: RepoSearchParams): RepoSearchQuery[] {
  const ids = new Set<string>();
  return params.queries.map((query, index) => {
    const pattern = query.pattern.trim();
    if (!pattern) throw new Error(`queries[${index}].pattern must not be empty.`);
    if (/[\0\r\n]/.test(pattern)) throw new Error(`queries[${index}].pattern must not contain NUL or newline characters.`);
    const id = (query.id?.trim() || `q${index + 1}`).replace(/[^A-Za-z0-9_.-]+/g, "-");
    if (!id || ids.has(id)) throw new Error(`Query ids must be unique after normalization: ${id || "(empty)"}`);
    ids.add(id);
    return { id, pattern, literal: query.literal !== false, caseSensitive: query.caseSensitive };
  });
}

function renderSearchReport(
  workspaceRoot: string,
  queries: RepoSearchQuery[],
  roots: RootContext[],
  cells: RepoSearchCellResult[],
  policies: Record<string, unknown>,
): string {
  const rootByPath = new Map(roots.map((root) => [root.path, root]));
  const queryById = new Map(queries.map((query) => [query.id, query]));
  const callerGlobs = Array.isArray(policies.callerGlobs) ? policies.callerGlobs as string[] : [];
  const lines = [
    "# Repository Search",
    `- Workspace: ${workspaceRoot}`,
    `- Roots: ${roots.map((root) => root.displayPath).join(", ")}`,
    `- Policy: hidden=${String(policies.includeHidden)}, symlinks=not-followed, binary=skipped, git-ignore=enabled, unity-generated=${policies.includeUnityGenerated ? "included" : "excluded-when-detected"}`,
    `- Caller globs: ${callerGlobs.length > 0 ? callerGlobs.join(", ") : "(none)"}`,
    "",
    "## Root Policies",
  ];
  for (const root of roots) {
    lines.push(`- ${root.displayPath}`);
    lines.push(`  - Plastic ignores: ${root.ignoreFiles.length > 0 ? root.ignoreFiles.map((file) => displayPathFromRoot(workspaceRoot, file)).join(", ") : "(none)"}`);
    lines.push(`  - Unity exclusions: ${root.unityExclusions.length > 0 ? root.unityExclusions.join(", ") : "(none)"}`);
  }
  lines.push("", "## Complete Status Matrix");
  for (const cell of cells) {
    const query = queryById.get(cell.queryId);
    const root = rootByPath.get(cell.root);
    lines.push(`- ${cell.queryId} (${query?.literal ? "literal" : "regex"}) / ${root?.displayPath ?? cell.root}: ${cell.status} (${cell.matches.length} shown)`);
  }
  lines.push("- Only no_matches cells are scoped negative evidence. Limited, excluded, not-run, timeout, invalid-regex, and error cells are incomplete.");

  const diagnostics = cells.filter((cell) => cell.stderr);
  if (diagnostics.length > 0) {
    lines.push("", "## Diagnostics");
    for (const cell of diagnostics) {
      const root = rootByPath.get(cell.root);
      lines.push(`- ${cell.queryId} / ${root?.displayPath ?? cell.root}: ${cell.stderr!.replace(/\s+/g, " ").slice(0, 500)}`);
    }
  }

  lines.push("", "## Match Excerpts");
  for (const cell of cells.filter((entry) => entry.matches.length > 0)) {
    const root = rootByPath.get(cell.root);
    lines.push(`### ${cell.queryId} / ${root?.displayPath ?? cell.root}`);
    for (const match of cell.matches) {
      lines.push(`- ${match.path}:${match.line}${match.column ? `:${match.column}` : ""} — ${match.text}`);
    }
  }
  if (!cells.some((cell) => cell.matches.length > 0)) lines.push("- (none)");
  return lines.join("\n");
}

export default function registerRepoSearch(pi: ExtensionAPI) {
  pi.registerTool({
    name: "cg_search_repo",
    label: "Search Repository",
    description: "Run bounded, root-scoped ripgrep searches with per-query attribution, Plastic ignore handling, Unity generated-folder exclusions, and structured negative evidence.",
    promptSnippet: "Search project code/assets with bounded VCS- and Unity-aware ripgrep evidence",
    promptGuidelines: [
      "Use cg_search_repo for bounded exact code/asset/file searches when roots and terms are known; use cg_search_artifacts for structured docs/todos discovery.",
      "Pass cg_search_repo one or more narrow roots and query objects. Literal search is the default; set literal=false only for deliberate regex patterns.",
      "Treat cg_search_repo no_matches as scoped negative evidence only under the roots and disclosed ignore/exclusion policy; partial_limit and not_run_global_limit are not negative evidence.",
      "Set includeUnityGenerated=true in cg_search_repo only when the task explicitly concerns Unity Library/Temp/Logs/build outputs.",
    ],
    parameters: Type.Object({
      queries: Type.Array(Type.Object({
        id: Type.Optional(Type.String({ maxLength: 80, description: "Stable query label; defaults to q1, q2, etc." })),
        pattern: Type.String({ maxLength: 2000, description: "Literal text by default, or a ripgrep regex when literal=false." }),
        literal: Type.Optional(Type.Boolean({ default: true, description: "Use fixed-string matching. Defaults to true." })),
        caseSensitive: Type.Optional(Type.Boolean({ description: "true=case-sensitive, false=case-insensitive, omitted=smart-case." })),
      }), { minItems: 1, maxItems: 8 }),
      workspaceRoot: Type.Optional(Type.String({ description: "Workspace/repository boundary. Defaults to current Pi cwd." })),
      roots: Type.Optional(Type.Array(Type.String(), { minItems: 1, maxItems: 10, description: "Existing files/directories inside workspaceRoot. Defaults to workspaceRoot." })),
      globs: Type.Optional(Type.Array(Type.String({ maxLength: 300 }), { maxItems: 20, description: "Additional ripgrep include/exclude globs." })),
      includeHidden: Type.Optional(Type.Boolean({ default: false })),
      includeUnityGenerated: Type.Optional(Type.Boolean({ default: false, description: "Include detected Unity generated/cache/output folders." })),
      maxMatches: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 80, description: "Global displayed match cap across the query/root matrix." })),
      maxMatchesPerFile: Type.Optional(Type.Integer({ minimum: 1, maximum: 20, default: 5 })),
      maxSnippetChars: Type.Optional(Type.Integer({ minimum: 80, maximum: 300, default: 240 })),
      timeoutSecondsPerSearch: Type.Optional(Type.Integer({ minimum: 1, maximum: 120, default: 30 })),
    }),
    async execute(_toolCallId, params: RepoSearchParams, signal, onUpdate, ctx) {
      throwIfAborted(signal);
      const requestedWorkspace = path.resolve(ctx.cwd, stripLeadingAt(params.workspaceRoot ?? ctx.cwd));
      const workspaceRoot = await realpath(requestedWorkspace).catch(() => {
        throw new Error(`workspaceRoot does not exist: ${params.workspaceRoot ?? ctx.cwd}`);
      });
      throwIfAborted(signal);
      const queries = normalizeQueries(params);
      const canonicalRoots: string[] = [];
      for (const rawRoot of params.roots ?? [workspaceRoot]) {
        throwIfAborted(signal);
        const root = await resolveContainedExistingPath(workspaceRoot, rawRoot);
        if (!canonicalRoots.some((entry) => normalizeForCompare(entry) === normalizeForCompare(root))) canonicalRoots.push(root);
      }
      const rootContexts = await Promise.all(canonicalRoots.map((root) => buildRootContext(workspaceRoot, root, Boolean(params.includeUnityGenerated), signal)));
      throwIfAborted(signal);
      const maxMatches = params.maxMatches ?? 80;
      const cells: RepoSearchCellResult[] = [];
      let remaining = maxMatches;

      for (const query of queries) {
        for (const root of rootContexts) {
          throwIfAborted(signal);
          if (remaining <= 0) {
            cells.push({ queryId: query.id, root: root.path, status: "not_run_global_limit", matches: [], appliedIgnoreFiles: root.ignoreFiles, unityExclusions: root.unityExclusions });
            continue;
          }
          if (root.excludedByPolicy) {
            cells.push({ queryId: query.id, root: root.path, status: "root_excluded_by_policy", matches: [], appliedIgnoreFiles: root.ignoreFiles, unityExclusions: root.unityExclusions });
            continue;
          }
          onUpdate?.({ content: [{ type: "text", text: `Searching ${root.displayPath} for ${query.id}…` }], details: { queryId: query.id, root: root.displayPath } });
          const cell = await runRipgrepCell({
            cwd: workspaceRoot,
            root: root.path,
            query,
            globs: params.globs ?? [],
            ignoreFiles: root.ignoreFiles,
            unityExclusions: root.unityExclusions,
            includeHidden: Boolean(params.includeHidden),
            maxMatches: remaining,
            maxMatchesPerFile: params.maxMatchesPerFile ?? 5,
            maxSnippetChars: params.maxSnippetChars ?? 240,
            timeoutMs: (params.timeoutSecondsPerSearch ?? 30) * 1000,
            signal,
          });
          cells.push(cell);
          remaining -= cell.matches.length;
        }
      }

      const policies = {
        includeHidden: Boolean(params.includeHidden),
        includeUnityGenerated: Boolean(params.includeUnityGenerated),
        followsSymlinks: false,
        binaryFiles: "skipped",
        gitIgnore: true,
        maxMatches,
        maxMatchesPerFile: params.maxMatchesPerFile ?? 5,
        callerGlobs: params.globs ?? [],
      };
      const report = renderSearchReport(workspaceRoot, queries, rootContexts, cells, policies);
      const truncation = truncateHead(report, { maxLines: DEFAULT_MAX_LINES, maxBytes: DEFAULT_MAX_BYTES });
      const content = truncation.truncated
        ? `${truncation.content}\n\n[Match excerpts were truncated at ${truncation.outputLines} lines / ${truncation.outputBytes} bytes. The complete status matrix appears before excerpts; rerun narrower cells or read returned files for omitted match context.]`
        : truncation.content;
      const completedCells = cells.filter((cell) => ["matched", "no_matches", "partial_limit", "root_excluded_by_policy", "not_run_global_limit"].includes(cell.status));
      if (completedCells.length === 0) {
        const diagnostics = cells.map((cell) => `${cell.queryId}/${displayPathFromRoot(workspaceRoot, cell.root)}: ${cell.status}${cell.stderr ? ` — ${cell.stderr}` : ""}`).join("\n");
        throw new Error(`cg_search_repo could not complete any query/root search.\n${diagnostics}`);
      }

      return {
        content: [{ type: "text", text: content }],
        details: {
          workspaceRoot,
          queries,
          roots: rootContexts,
          cells,
          policies,
          truncated: truncation.truncated,
        },
      };
    },
  });
}
