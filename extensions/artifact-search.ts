import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import * as fs from "node:fs";
import * as path from "node:path";
import { keyHint, type ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";
import { Type } from "typebox";

const INDEX_VERSION = 3;
const DEFAULT_LIMIT = 20;
const DEFAULT_SNIPPET_CHARS = 220;
const DEFAULT_MAX_RESULTS_BEFORE_SNIPPETS = 100;
const DEFAULT_FRESHNESS_TTL_MS = 30_000;
const BODY_PREVIEW_CHARS = 1_200;
const INDEX_LOCK_TIMEOUT_MS = 30_000;
const INDEX_LOCK_STALE_MS = 120_000;
const INDEX_LOCK_RETRY_MS = 100;

const FIELD_WEIGHTS = {
  title: 10,
  tags: 8,
  frontmatter: 6,
  headings: 4,
  path: 3,
  body: 1,
  phraseBonus: 5,
};

const SEVERITY_BOOSTS: Record<string, number> = {
  critical: 3,
  high: 2,
  medium: 1,
  low: 0.25,
};

const TODO_STATUS_BOOSTS: Record<string, number> = {
  ready: 3,
  pending: 2,
  complete: -0.5,
  blocked: -1,
};

const TODO_PRIORITY_BOOSTS: Record<string, number> = {
  p1: 3,
  p2: 1.5,
  p3: 0.5,
};

type Scope = "all" | "docs" | "solutions" | "plans" | "todos";
type RankProfile = "balanced" | "frontmatter" | "recency" | "todos";
type MatchMode = "all" | "any" | "phrase";
type FreshnessMode = "auto" | "strict" | "memory";
type SearchField = "path" | "title" | "tags" | "frontmatter" | "headings" | "body";
type SearchText = Record<SearchField | "all", string>;

type ArtifactEntry = {
  path: string;
  root: "docs" | "todos";
  kind: "doc" | "solution" | "plan" | "todo" | "other-doc";
  mtimeMs: number;
  size: number;
  title?: string;
  frontmatter: Record<string, unknown>;
  headings: string[];
  body?: string;
  bodyPreview?: string;
  searchText?: SearchText;
  linksTo?: string[];
};

type ArtifactIndex = {
  version: number;
  generatedAt: string;
  workspaceRoot: string;
  docsRoot?: string;
  todosRoot?: string;
  files: Record<string, ArtifactEntry>;
};

type CachedIndex = {
  index: ArtifactIndex;
  mtimeMs: number;
  size: number;
  validatedAtMs?: number;
};

const dirtyIndexPaths = new Set<string>();

const inMemoryIndexCache = new Map<string, CachedIndex>();
const inProcessIndexQueues = new Map<string, Promise<unknown>>();

type SearchParams = {
  query?: string;
  requiredTerms?: string | string[];
  optionalTerms?: string | string[];
  searchFields?: SearchField[];
  workspaceRoot?: string;
  docsRoot?: string;
  todosRoot?: string;
  indexPath?: string;
  scopes?: Scope[];
  status?: string | string[];
  priority?: string | string[];
  tags?: string | string[];
  module?: string | string[];
  component?: string | string[];
  docType?: string | string[];
  category?: string | string[];
  failureMode?: string | string[];
  problemType?: string | string[];
  severity?: string | string[];
  rankProfile?: RankProfile;
  matchMode?: MatchMode;
  minTermMatches?: number;
  limit?: number;
  maxSnippetChars?: number;
  includeBody?: boolean;
  includeCompletedTodos?: boolean;
  explain?: boolean;
  includeRelated?: boolean;
  relatedLimit?: number;
  groupByKind?: boolean;
  freshnessMode?: FreshnessMode;
  freshnessTtlMs?: number;
  rebuild?: boolean;
};

type SearchResult = {
  path: string;
  kind: ArtifactEntry["kind"];
  title?: string;
  score: number;
  snippet?: string;
  frontmatter: Record<string, unknown>;
  reasons: string[];
  related?: RelatedArtifact[];
};

type RelatedArtifact = {
  path: string;
  kind: ArtifactEntry["kind"];
  title?: string;
  relation: "linksTo" | "linkedFrom";
};

type SearchIndexResult = {
  results: SearchResult[];
  totalMatches: number;
};

type RefreshStats = { added: number; updated: number; removed: number; unchanged: number };
type RefreshResult = { index: ArtifactIndex; indexPath: string; refreshed: boolean; fastPath: boolean; freshnessMode: FreshnessMode; stats: RefreshStats };

function normalizeForCompare(value: string): string {
  const normalized = path.resolve(value);
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}

function isInside(parent: string, child: string): boolean {
  const normalizedParent = normalizeForCompare(parent);
  const normalizedChild = normalizeForCompare(child);
  const withSep = normalizedParent.endsWith(path.sep) ? normalizedParent : `${normalizedParent}${path.sep}`;
  return normalizedChild === normalizedParent || normalizedChild.startsWith(withSep);
}

function resolveRoot(raw: string | undefined, workspaceRoot: string, fallback: string): string {
  if (!raw?.trim()) return path.resolve(workspaceRoot, fallback);
  return path.isAbsolute(raw) ? path.resolve(raw) : path.resolve(workspaceRoot, raw);
}

function resolveIndexPath(raw: string | undefined, workspaceRoot: string): string {
  const resolved = raw?.trim()
    ? (path.isAbsolute(raw) ? path.resolve(raw) : path.resolve(workspaceRoot, raw))
    : path.resolve(workspaceRoot, ".compound-game-dev", "artifact-index.json");

  if (!isInside(workspaceRoot, resolved)) {
    throw new Error("indexPath must be inside workspaceRoot so the generated project index stays project-local.");
  }
  return resolved;
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isErrorWithCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === code;
}

async function withInProcessIndexQueue<T>(indexPath: string, task: () => Promise<T>): Promise<T> {
  const cacheKey = normalizeForCompare(indexPath);
  const previous = inProcessIndexQueues.get(cacheKey) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  const queued = previous.then(() => current, () => current);
  inProcessIndexQueues.set(cacheKey, queued);

  try {
    await previous.catch(() => undefined);
    return await task();
  } finally {
    release();
    if (inProcessIndexQueues.get(cacheKey) === queued) {
      inProcessIndexQueues.delete(cacheKey);
    }
  }
}

async function acquireIndexLock(indexPath: string): Promise<() => Promise<void>> {
  const lockPath = `${indexPath}.lock`;
  const startedAt = Date.now();
  await mkdir(path.dirname(indexPath), { recursive: true });

  while (true) {
    try {
      await mkdir(lockPath);
      await writeFile(
        path.join(lockPath, "owner.json"),
        `${JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString(), indexPath: normalizePath(indexPath) }, null, 2)}\n`,
        "utf8",
      );
      return async () => {
        await rm(lockPath, { recursive: true, force: true });
      };
    } catch (error) {
      if (!isErrorWithCode(error, "EEXIST")) throw error;

      try {
        const lockStat = await stat(lockPath);
        if (Date.now() - lockStat.mtimeMs > INDEX_LOCK_STALE_MS) {
          await rm(lockPath, { recursive: true, force: true });
          continue;
        }
      } catch (lockError) {
        if (!isErrorWithCode(lockError, "ENOENT")) throw lockError;
        continue;
      }

      if (Date.now() - startedAt > INDEX_LOCK_TIMEOUT_MS) {
        throw new Error(`Timed out waiting for artifact index lock: ${normalizePath(lockPath)}`);
      }
      await sleep(INDEX_LOCK_RETRY_MS);
    }
  }
}

async function withIndexLock<T>(indexPath: string, task: () => Promise<T>): Promise<T> {
  const release = await acquireIndexLock(indexPath);
  try {
    return await task();
  } finally {
    await release();
  }
}

async function listMarkdownFiles(root: string): Promise<string[]> {
  if (!(await pathExists(root))) return [];
  const results: string[] = [];
  const stack = [root];
  const ignoredDirs = new Set([".git", "node_modules", "Library", "Temp", "Obj", "Build", "Builds"]);

  while (stack.length) {
    const current = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) stack.push(child);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        results.push(child);
      }
    }
  }

  return results.sort((a, b) => normalizePath(a).localeCompare(normalizePath(b)));
}

function parseScalar(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed === "[]") return [];
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const body = trimmed.slice(1, -1).trim();
    if (!body) return [];
    return body.split(",").map((part) => String(parseScalar(part.trim())));
  }
  return trimmed;
}

function parseFrontmatter(text: string): { frontmatter: Record<string, unknown>; content: string } {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { frontmatter: {}, content: text };

  const frontmatter: Record<string, unknown> = {};
  const lines = match[1].split(/\r?\n/);
  let currentArrayKey: string | undefined;

  for (const line of lines) {
    const arrayItem = line.match(/^\s*-\s+(.+)$/);
    if (arrayItem && currentArrayKey) {
      const existing = Array.isArray(frontmatter[currentArrayKey]) ? frontmatter[currentArrayKey] as unknown[] : [];
      existing.push(parseScalar(arrayItem[1]));
      frontmatter[currentArrayKey] = existing;
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) continue;
    const [, key, value] = keyMatch;
    if (!value.trim()) {
      frontmatter[key] = [];
      currentArrayKey = key;
    } else {
      frontmatter[key] = parseScalar(value);
      currentArrayKey = undefined;
    }
  }

  return { frontmatter, content: text.slice(match[0].length) };
}

function extractTitle(content: string, frontmatter: Record<string, unknown>): string | undefined {
  const frontmatterTitle = frontmatter.title;
  if (typeof frontmatterTitle === "string" && frontmatterTitle.trim()) return frontmatterTitle.trim();
  const heading = content.match(/^#\s+(.+)$/m);
  return heading?.[1]?.trim();
}

function extractHeadings(content: string): string[] {
  return [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => match[1].trim()).slice(0, 40);
}

function detectKind(relativePath: string, root: "docs" | "todos"): ArtifactEntry["kind"] {
  const normalized = normalizePath(relativePath).toLowerCase();
  if (root === "todos") return "todo";
  if (normalized.startsWith("solutions/")) return "solution";
  if (normalized.startsWith("plans/")) return "plan";
  return root === "docs" ? "other-doc" : "doc";
}

function aliasVariants(value: string): string[] {
  const camelSplit = value.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  const separated = camelSplit.replace(/[-_/]+/g, " ");
  const joined = camelSplit.replace(/[-_/\s]+/g, "");
  return [value, camelSplit, separated, joined];
}

function collectAliasText(values: string[]): string {
  return values.flatMap(aliasVariants).join(" ");
}

function frontmatterText(frontmatter: Record<string, unknown>): string {
  return Object.entries(frontmatter).map(([key, value]) => `${key} ${toStringArray(value).join(" ")}`).join(" ");
}

function buildSearchText(entry: Omit<ArtifactEntry, "searchText">): SearchText {
  const pathText = collectAliasText([entry.path]);
  const titleText = collectAliasText([entry.title ?? ""]);
  const tagsText = collectAliasText(toStringArray(entry.frontmatter.tags));
  const frontmatterValueText = frontmatterText(entry.frontmatter);
  const frontmatterAliasText = collectAliasText([frontmatterValueText, ...Object.keys(entry.frontmatter)]);
  const headingsText = collectAliasText(entry.headings);
  const bodyText = entry.body ?? entry.bodyPreview ?? "";
  const searchText: SearchText = {
    path: normalizeSearchText(pathText),
    title: normalizeSearchText(titleText),
    tags: normalizeSearchText(tagsText),
    frontmatter: normalizeSearchText(frontmatterAliasText),
    headings: normalizeSearchText(headingsText),
    body: normalizeSearchText(bodyText),
    all: "",
  };
  searchText.all = [searchText.path, searchText.title, searchText.tags, searchText.frontmatter, searchText.headings, searchText.body].join(" ").trim();
  return searchText;
}

function extractArtifactLinks(content: string): string[] {
  const links = new Set<string>();
  const patterns = [
    /(?:^|[\s(])((?:docs|todos)\/[A-Za-z0-9_./ -]+?\.md)(?=$|[\s)\]`.,:;])/gi,
    /\]\(([^)]+\.md)\)/gi,
  ];
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const raw = (match[1] ?? "").trim().replace(/^\.\//, "");
      if (!raw) continue;
      const normalized = normalizePath(raw).replace(/^.*?(docs|todos)\//i, "$1/");
      if (normalized.startsWith("docs/") || normalized.startsWith("todos/")) links.add(normalized);
    }
  }
  return [...links].sort();
}

async function parseArtifact(filePath: string, workspaceRoot: string, rootPath: string, root: "docs" | "todos"): Promise<ArtifactEntry> {
  const [fileStat, text] = await Promise.all([stat(filePath), readFile(filePath, "utf8")]);
  const { frontmatter, content } = parseFrontmatter(text);
  const relativeToRoot = path.relative(rootPath, filePath);
  const title = extractTitle(content, frontmatter);

  const entry: ArtifactEntry = {
    path: normalizePath(path.relative(workspaceRoot, filePath)),
    root,
    kind: detectKind(relativeToRoot, root),
    mtimeMs: fileStat.mtimeMs,
    size: fileStat.size,
    title,
    frontmatter,
    headings: extractHeadings(content),
    bodyPreview: content.slice(0, BODY_PREVIEW_CHARS),
    linksTo: extractArtifactLinks(content),
  };
  entry.searchText = buildSearchText(entry);
  return entry;
}

async function loadIndex(indexPath: string): Promise<ArtifactIndex | undefined> {
  const cacheKey = normalizeForCompare(indexPath);
  try {
    const indexStat = await stat(indexPath);
    const cached = inMemoryIndexCache.get(cacheKey);
    if (cached && cached.size === indexStat.size && Math.abs(cached.mtimeMs - indexStat.mtimeMs) <= 1) {
      return cached.index;
    }

    const parsed = JSON.parse(await readFile(indexPath, "utf8")) as ArtifactIndex;
    if (parsed.version !== INDEX_VERSION || !parsed.files || typeof parsed.files !== "object") {
      inMemoryIndexCache.delete(cacheKey);
      return undefined;
    }
    inMemoryIndexCache.set(cacheKey, { index: parsed, mtimeMs: indexStat.mtimeMs, size: indexStat.size });
    return parsed;
  } catch {
    inMemoryIndexCache.delete(cacheKey);
    return undefined;
  }
}

function cachedIndex(indexPath: string): CachedIndex | undefined {
  return inMemoryIndexCache.get(normalizeForCompare(indexPath));
}

function isUsableIndex(index: ArtifactIndex | undefined, workspaceRoot: string): index is ArtifactIndex {
  return Boolean(index && index.version === INDEX_VERSION && normalizeForCompare(index.workspaceRoot) === normalizeForCompare(workspaceRoot));
}

function emptyRefreshStats(): RefreshStats {
  return { added: 0, updated: 0, removed: 0, unchanged: 0 };
}

async function writeIndex(indexPath: string, index: ArtifactIndex): Promise<void> {
  await mkdir(path.dirname(indexPath), { recursive: true });
  const tempPath = `${indexPath}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(index, null, 2)}
`, "utf8");
  await rename(tempPath, indexPath);
  const indexStat = await stat(indexPath);
  inMemoryIndexCache.set(normalizeForCompare(indexPath), { index, mtimeMs: indexStat.mtimeMs, size: indexStat.size, validatedAtMs: Date.now() });
  dirtyIndexPaths.delete(normalizeForCompare(indexPath));
}

async function canUseFastPath(indexPath: string, index: ArtifactIndex, mode: FreshnessMode, ttlMs: number): Promise<boolean> {
  if (mode === "memory") return true;
  if (dirtyIndexPaths.has(normalizeForCompare(indexPath))) return false;
  if (await pathExists(`${indexPath}.lock`)) return false;
  const cached = cachedIndex(indexPath);
  return Boolean(cached?.validatedAtMs && Date.now() - cached.validatedAtMs <= ttlMs && cached.index === index);
}

async function buildOrRefreshIndex(params: SearchParams, ctxCwd: string): Promise<RefreshResult> {
  const workspaceRoot = path.resolve(params.workspaceRoot ?? ctxCwd);
  const docsRoot = resolveRoot(params.docsRoot, workspaceRoot, "docs");
  const todosRoot = resolveRoot(params.todosRoot, workspaceRoot, "todos");
  const indexPath = resolveIndexPath(params.indexPath, workspaceRoot);
  const freshnessMode = params.freshnessMode ?? "auto";
  const ttlMs = Math.max(0, params.freshnessTtlMs ?? DEFAULT_FRESHNESS_TTL_MS);

  if (!params.rebuild && freshnessMode !== "strict") {
    const existing = await loadIndex(indexPath);
    if (isUsableIndex(existing, workspaceRoot) && await canUseFastPath(indexPath, existing, freshnessMode, ttlMs)) {
      return { index: existing, indexPath, refreshed: false, fastPath: true, freshnessMode, stats: emptyRefreshStats() };
    }
  }

  return withInProcessIndexQueue(indexPath, () =>
    withIndexLock(indexPath, () => buildOrRefreshIndexLocked(params, workspaceRoot, docsRoot, todosRoot, indexPath, freshnessMode)),
  );
}

async function buildOrRefreshIndexLocked(
  params: SearchParams,
  workspaceRoot: string,
  docsRoot: string,
  todosRoot: string,
  indexPath: string,
  freshnessMode: FreshnessMode,
): Promise<RefreshResult> {
  const currentFiles = new Map<string, { absolute: string; rootPath: string; root: "docs" | "todos"; mtimeMs: number; size: number }>();
  for (const [rootPath, root] of [[docsRoot, "docs"], [todosRoot, "todos"]] as const) {
    for (const absolute of await listMarkdownFiles(rootPath)) {
      const fileStat = await stat(absolute);
      currentFiles.set(normalizePath(path.relative(workspaceRoot, absolute)), { absolute, rootPath, root, mtimeMs: fileStat.mtimeMs, size: fileStat.size });
    }
  }

  const existing = params.rebuild ? undefined : await loadIndex(indexPath);
  const index: ArtifactIndex = existing && normalizeForCompare(existing.workspaceRoot) === normalizeForCompare(workspaceRoot)
    ? existing
    : { version: INDEX_VERSION, generatedAt: new Date(0).toISOString(), workspaceRoot: normalizePath(workspaceRoot), docsRoot: normalizePath(docsRoot), todosRoot: normalizePath(todosRoot), files: {} };

  index.version = INDEX_VERSION;
  index.workspaceRoot = normalizePath(workspaceRoot);
  index.docsRoot = normalizePath(docsRoot);
  index.todosRoot = normalizePath(todosRoot);

  let added = 0;
  let updated = 0;
  let removed = 0;
  let unchanged = 0;
  let refreshed = !existing || params.rebuild === true;

  for (const [relative, current] of currentFiles) {
    const previous = index.files[relative];
    if (!previous) {
      index.files[relative] = await parseArtifact(current.absolute, workspaceRoot, current.rootPath, current.root);
      added++;
      refreshed = true;
      continue;
    }
    if (previous.size !== current.size || Math.abs(previous.mtimeMs - current.mtimeMs) > 1) {
      index.files[relative] = await parseArtifact(current.absolute, workspaceRoot, current.rootPath, current.root);
      updated++;
      refreshed = true;
    } else {
      unchanged++;
    }
  }

  for (const relative of Object.keys(index.files)) {
    if (!currentFiles.has(relative)) {
      delete index.files[relative];
      removed++;
      refreshed = true;
    }
  }

  if (refreshed) {
    index.generatedAt = new Date().toISOString();
    await writeIndex(indexPath, index);
  }

  if (!refreshed) {
    const cached = cachedIndex(indexPath);
    if (cached) cached.validatedAtMs = Date.now();
    dirtyIndexPaths.delete(normalizeForCompare(indexPath));
  }

  return { index, indexPath, refreshed, fastPath: false, freshnessMode, stats: { added, updated, removed, unchanged } };
}

function toStringArray(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.flatMap(toStringArray);
  return [String(value)];
}

function normalizeList(value: string | string[] | undefined): string[] {
  return toStringArray(value).map((part) => part.toLowerCase().trim()).filter(Boolean);
}

function normalizeTodoStatus(status: string | undefined): string | undefined {
  if (!status) return undefined;
  const normalized = status.toLowerCase().trim();
  if (normalized === "completed") return "complete";
  return normalized;
}

function fieldText(entry: ArtifactEntry, field: keyof typeof FIELD_WEIGHTS | "frontmatterText"): string {
  switch (field) {
    case "title": return entry.title ?? "";
    case "tags": return toStringArray(entry.frontmatter.tags).join(" ");
    case "frontmatter":
    case "frontmatterText": return Object.entries(entry.frontmatter).map(([key, value]) => `${key} ${toStringArray(value).join(" ")}`).join(" ");
    case "headings": return entry.headings.join(" ");
    case "path": return entry.path;
    case "body": return entry.body ?? entry.bodyPreview ?? "";
    default: return "";
  }
}

function hasAnyFieldValue(entry: ArtifactEntry, fieldName: string, expected: string[]): boolean {
  if (expected.length === 0) return true;
  const values = toStringArray(entry.frontmatter[fieldName]).map((value) => value.toLowerCase());
  return expected.some((needle) => values.some((value) => value === needle || value.includes(needle)));
}

function statusFromEntry(entry: ArtifactEntry): string | undefined {
  const status = toStringArray(entry.frontmatter.status)[0];
  if (status) return normalizeTodoStatus(status);
  const filename = path.basename(entry.path).toLowerCase();
  const match = filename.match(/^\d+-([a-z]+)-/);
  return normalizeTodoStatus(match?.[1]);
}

function priorityFromEntry(entry: ArtifactEntry): string | undefined {
  const priority = toStringArray(entry.frontmatter.priority)[0];
  if (priority) return priority.toLowerCase();
  const filename = path.basename(entry.path).toLowerCase();
  const match = filename.match(/^\d+-[a-z]+-(p\d)-/);
  return match?.[1];
}

function scopesInclude(entry: ArtifactEntry, scopes: Scope[]): boolean {
  if (scopes.length === 0 || scopes.includes("all")) return true;
  return scopes.some((scope) => {
    if (scope === "docs") return entry.root === "docs";
    if (scope === "todos") return entry.root === "todos";
    if (scope === "solutions") return entry.kind === "solution";
    if (scope === "plans") return entry.kind === "plan";
    return true;
  });
}

function tokenizeQuery(query: string | undefined): string[] {
  if (!query?.trim()) return [];
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const match of query.matchAll(/"([^"]+)"|'([^']+)'|([^\s]+)/g)) {
    const term = normalizeSearchText(match[1] ?? match[2] ?? match[3]);
    if (!term || seen.has(term)) continue;
    seen.add(term);
    terms.push(term);
  }
  return terms;
}

function countMatchedTerms(haystack: string, terms: string[]): number {
  return terms.reduce((count, term) => count + (haystack.includes(term) ? 1 : 0), 0);
}

function dedupeTerms(terms: string[]): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const term of terms.map(normalizeSearchText).filter(Boolean)) {
    if (seen.has(term)) continue;
    seen.add(term);
    deduped.push(term);
  }
  return deduped;
}

function fieldsForSearch(params: SearchParams): SearchField[] {
  if (params.searchFields?.length) return params.searchFields;
  return params.includeBody === false
    ? ["path", "title", "tags", "frontmatter", "headings"]
    : ["path", "title", "tags", "frontmatter", "headings", "body"];
}

function normalizedFieldText(entry: ArtifactEntry, field: SearchField): string {
  if (entry.searchText?.[field]) return entry.searchText[field];
  return normalizeSearchText(fieldText(entry, field === "frontmatter" ? "frontmatterText" : field));
}

function searchHaystack(entry: ArtifactEntry, searchFields: SearchField[]): string {
  if (entry.searchText && searchFields.length === 6) return entry.searchText.all;
  return searchFields.map((field) => normalizedFieldText(entry, field)).join(" ").trim();
}

function matchesQuery(entry: ArtifactEntry, terms: string[], mode: MatchMode, searchFields: SearchField[], minTermMatches?: number, requiredTerms: string[] = []): boolean {
  const haystack = searchHaystack(entry, searchFields);
  if (requiredTerms.some((term) => !haystack.includes(term))) return false;
  if (terms.length === 0) return true;
  if (mode === "phrase") return haystack.includes(terms.join(" "));
  const matchedTermCount = countMatchedTerms(haystack, terms);
  if (minTermMatches !== undefined) return matchedTermCount >= Math.max(1, Math.min(minTermMatches, terms.length));
  if (mode === "any") return matchedTermCount > 0;
  return matchedTermCount === terms.length;
}

function profileMultiplier(field: keyof typeof FIELD_WEIGHTS, profile: RankProfile): number {
  if (profile === "frontmatter") {
    if (field === "body") return 0.25;
    if (field === "tags" || field === "title" || field === "frontmatter") return 1.6;
  }
  if (profile === "todos") {
    if (field === "body") return 0.5;
    if (field === "title" || field === "frontmatter") return 1.3;
  }
  return 1;
}

function scoreEntry(entry: ArtifactEntry, query: string | undefined, terms: string[], profile: RankProfile, searchFields: SearchField[]): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const fields = searchFields.filter((field): field is keyof typeof FIELD_WEIGHTS => field in FIELD_WEIGHTS);

  for (const field of fields) {
    const text = normalizedFieldText(entry, field);
    if (!text) continue;
    const matchedTerms = terms.filter((term) => text.includes(term));
    if (matchedTerms.length === 0) continue;
    const fieldScore = FIELD_WEIGHTS[field] * profileMultiplier(field, profile) * matchedTerms.length;
    score += fieldScore;
    reasons.push(`${field} matched ${matchedTerms.join(", ")} (+${fieldScore.toFixed(1)})`);
  }

  const phrase = query ? normalizeSearchText(query) : undefined;
  if (phrase && phrase.includes(" ")) {
    for (const field of ["title", "tags", "frontmatter", "headings", "body"] as const) {
      if (fieldText(entry, field).toLowerCase().includes(phrase)) {
        score += FIELD_WEIGHTS.phraseBonus;
        reasons.push(`exact phrase in ${field} (+${FIELD_WEIGHTS.phraseBonus})`);
        break;
      }
    }
  }

  const severity = toStringArray(entry.frontmatter.severity)[0]?.toLowerCase();
  const severityBoost = severity ? SEVERITY_BOOSTS[severity] ?? 0 : 0;
  if (severityBoost) {
    score += severityBoost;
    reasons.push(`${severity} severity boost (+${severityBoost})`);
  }

  if (entry.kind === "todo") {
    const status = statusFromEntry(entry);
    const priority = priorityFromEntry(entry);
    const statusBoost = status ? TODO_STATUS_BOOSTS[status] ?? 0 : 0;
    const priorityBoost = priority ? TODO_PRIORITY_BOOSTS[priority] ?? 0 : 0;
    const todoMultiplier = profile === "todos" ? 1.5 : 1;
    if (statusBoost) {
      const value = statusBoost * todoMultiplier;
      score += value;
      reasons.push(`${status} todo status boost (${value >= 0 ? "+" : ""}${value.toFixed(1)})`);
    }
    if (priorityBoost) {
      const value = priorityBoost * todoMultiplier;
      score += value;
      reasons.push(`${priority} todo priority boost (+${value.toFixed(1)})`);
    }
  }

  if (profile === "recency") {
    const ageDays = Math.max(0, (Date.now() - entry.mtimeMs) / 86_400_000);
    const recencyBoost = Math.max(0, 3 - Math.log10(ageDays + 1));
    score += recencyBoost;
    reasons.push(`recency boost (+${recencyBoost.toFixed(1)})`);
  }

  if (terms.length === 0 && score === 0) score = 1;
  return { score, reasons };
}

function passesFilters(entry: ArtifactEntry, params: SearchParams): boolean {
  const scopes = params.scopes ?? ["all"];
  if (!scopesInclude(entry, scopes)) return false;

  const statusFilter = normalizeList(params.status).map(normalizeTodoStatus).filter((status): status is string => Boolean(status));
  if (statusFilter.length && !statusFilter.includes(statusFromEntry(entry) ?? "")) return false;

  const priorityFilter = normalizeList(params.priority);
  if (priorityFilter.length && !priorityFilter.includes(priorityFromEntry(entry) ?? "")) return false;

  if (params.includeCompletedTodos === false && entry.kind === "todo" && statusFromEntry(entry) === "complete" && statusFilter.length === 0) return false;

  if (!hasAnyFieldValue(entry, "tags", normalizeList(params.tags))) return false;
  if (!hasAnyFieldValue(entry, "module", normalizeList(params.module))) return false;
  if (!hasAnyFieldValue(entry, "component", normalizeList(params.component))) return false;
  if (!hasAnyFieldValue(entry, "doc_type", normalizeList(params.docType))) return false;
  if (!hasAnyFieldValue(entry, "category", normalizeList(params.category))) return false;
  if (!hasAnyFieldValue(entry, "failure_mode", normalizeList(params.failureMode))) return false;
  if (!hasAnyFieldValue(entry, "problem_type", normalizeList(params.problemType))) return false;
  if (!hasAnyFieldValue(entry, "severity", normalizeList(params.severity))) return false;

  return true;
}

function makeSnippet(entry: ArtifactEntry, terms: string[], maxChars: number): string | undefined {
  if (terms.length === 0) return undefined;
  const source = entry.body || entry.headings.join("\n") || entry.title || entry.path;
  const lower = source.toLowerCase();
  const hit = terms.map((term) => lower.indexOf(term)).filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? -1;
  if (hit < 0) return undefined;
  const start = Math.max(0, hit - Math.floor(maxChars / 3));
  const end = Math.min(source.length, start + maxChars);
  return `${start > 0 ? "…" : ""}${source.slice(start, end).replace(/\s+/g, " ").trim()}${end < source.length ? "…" : ""}`;
}

function searchIndex(index: ArtifactIndex, params: SearchParams): SearchIndexResult {
  const queryTerms = tokenizeQuery(params.query);
  const requiredTerms = dedupeTerms(normalizeList(params.requiredTerms));
  const optionalTerms = dedupeTerms(normalizeList(params.optionalTerms));
  const terms = dedupeTerms([...queryTerms, ...optionalTerms]);
  const scoringTerms = dedupeTerms([...requiredTerms, ...terms]);
  const mode = params.matchMode ?? "all";
  const includeBody = params.includeBody !== false;
  const searchFields = fieldsForSearch(params);
  const profile = params.rankProfile ?? "balanced";
  const maxSnippetChars = Math.max(60, Math.min(params.maxSnippetChars ?? DEFAULT_SNIPPET_CHARS, 1000));
  const preSnippetLimit = Math.max(params.limit ?? DEFAULT_LIMIT, DEFAULT_MAX_RESULTS_BEFORE_SNIPPETS);
  const minTermMatches = params.minTermMatches === undefined ? undefined : Math.max(1, Math.floor(params.minTermMatches));

  const scored: SearchResult[] = [];
  for (const entry of Object.values(index.files)) {
    if (!passesFilters(entry, params)) continue;
    if (!matchesQuery(entry, terms, mode, searchFields, minTermMatches, requiredTerms)) continue;
    const { score, reasons } = scoreEntry(entry, params.query, scoringTerms, profile, searchFields);
    if (score <= 0) continue;
    scored.push({
      path: entry.path,
      kind: entry.kind,
      title: entry.title,
      score,
      frontmatter: entry.frontmatter,
      reasons,
    });
  }

  scored.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
  const totalMatches = scored.length;
  const results = scored.slice(0, preSnippetLimit).map((result) => {
    const entry = index.files[result.path];
    return { ...result, snippet: makeSnippet(entry, scoringTerms, maxSnippetChars) };
  });
  if (params.includeRelated) attachRelatedArtifacts(results, index, params.relatedLimit);
  return { results, totalMatches };
}

function attachRelatedArtifacts(results: SearchResult[], index: ArtifactIndex, relatedLimit: number | undefined): void {
  const limit = Math.max(0, Math.min(relatedLimit ?? 5, 20));
  if (limit === 0) return;

  const backlinks = new Map<string, ArtifactEntry[]>();
  for (const entry of Object.values(index.files)) {
    for (const linkedPath of entry.linksTo ?? []) {
      const linked = index.files[linkedPath];
      if (!linked) continue;
      const existing = backlinks.get(linked.path) ?? [];
      existing.push(entry);
      backlinks.set(linked.path, existing);
    }
  }

  for (const result of results) {
    const entry = index.files[result.path];
    if (!entry) continue;
    const related: RelatedArtifact[] = [];
    const seen = new Set<string>();
    const add = (candidate: ArtifactEntry | undefined, relation: RelatedArtifact["relation"]) => {
      if (!candidate || candidate.path === result.path || seen.has(candidate.path) || related.length >= limit) return;
      seen.add(candidate.path);
      related.push({ path: candidate.path, kind: candidate.kind, title: candidate.title, relation });
    };
    for (const linkedPath of entry.linksTo ?? []) add(index.files[linkedPath], "linksTo");
    for (const linker of backlinks.get(entry.path) ?? []) add(linker, "linkedFrom");
    if (related.length) result.related = related;
  }
}

function groupResultsByKind(results: SearchResult[]): Record<string, SearchResult[]> {
  return results.reduce<Record<string, SearchResult[]>>((groups, result) => {
    const key = result.kind;
    groups[key] = groups[key] ?? [];
    groups[key].push(result);
    return groups;
  }, {});
}

function regexEscape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function suggestedRgCommand(params: SearchParams): string | undefined {
  const terms = dedupeTerms([...tokenizeQuery(params.query), ...normalizeList(params.requiredTerms), ...normalizeList(params.optionalTerms)]).slice(0, 12);
  if (!terms.length) return undefined;
  const pattern = terms.map(regexEscape).join("|").replace(/'/g, "'\''");
  return `rg -i --glob '*.md' '${pattern}' "\${DOCS_ROOT}" "\${TODOS_ROOT}"`;
}

function formatFrontmatterSummary(frontmatter: Record<string, unknown>): string {
  const fields = ["status", "priority", "module", "doc_type", "category", "failure_mode", "problem_type", "component", "severity", "tags"];
  const parts = fields.flatMap((field) => {
    const values = toStringArray(frontmatter[field]);
    return values.length ? [`${field}: ${values.join(", ")}`] : [];
  });
  return parts.join("; ");
}

function formatResults(searchResult: SearchIndexResult, params: SearchParams, meta: { indexPath: string; refreshed: boolean; stats: { added: number; updated: number; removed: number; unchanged: number }; totalFiles: number }): string {
  const limit = Math.max(1, Math.min(params.limit ?? DEFAULT_LIMIT, 100));
  const shown = searchResult.results.slice(0, limit);
  const lines: string[] = [];
  lines.push(`Found ${searchResult.totalMatches} matching artifact${searchResult.totalMatches === 1 ? "" : "s"}; showing ${shown.length}.`);
  lines.push(`Index: ${normalizePath(meta.indexPath)} (${meta.refreshed ? "refreshed" : "fresh"}; ${meta.totalFiles} files, +${meta.stats.added}/~${meta.stats.updated}/-${meta.stats.removed})`);

  if (!shown.length) return lines.join("\n");
  lines.push("");

  const renderOne = (result: SearchResult, index: number) => {
    lines.push(`${index + 1}. ${result.path}${result.title ? ` — ${result.title}` : ""}`);
    lines.push(`   kind: ${result.kind}; score: ${result.score.toFixed(1)}`);
    const summary = formatFrontmatterSummary(result.frontmatter);
    if (summary) lines.push(`   ${summary}`);
    if (result.snippet) lines.push(`   snippet: ${result.snippet}`);
    if (params.explain && result.reasons.length) lines.push(`   reasons: ${result.reasons.slice(0, 6).join("; ")}`);
    if (result.related?.length) lines.push(`   related: ${result.related.map((item) => `${item.path} (${item.relation})`).join("; ")}`);
  };

  if (params.groupByKind) {
    let resultIndex = 0;
    for (const [kind, group] of Object.entries(groupResultsByKind(shown))) {
      lines.push(`### ${kind}`);
      group.forEach((result) => renderOne(result, resultIndex++));
    }
  } else {
    shown.forEach(renderOne);
  }

  const suggestedRg = suggestedRgCommand(params);
  if (suggestedRg) {
    lines.push("");
    lines.push(`Suggested rg verification: ${suggestedRg}`);
  }

  return lines.join("\n");
}

function getTextContent(result: { content?: Array<{ type?: string; text?: string }> }): string {
  const first = result.content?.[0];
  return first?.type === "text" && typeof first.text === "string" ? first.text : "";
}

const scopeSchema = Type.Union([Type.Literal("all"), Type.Literal("docs"), Type.Literal("solutions"), Type.Literal("plans"), Type.Literal("todos")]);
const rankProfileSchema = Type.Union([Type.Literal("balanced"), Type.Literal("frontmatter"), Type.Literal("recency"), Type.Literal("todos")]);
const matchModeSchema = Type.Union([Type.Literal("all"), Type.Literal("any"), Type.Literal("phrase")]);
const searchFieldSchema = Type.Union([Type.Literal("path"), Type.Literal("title"), Type.Literal("tags"), Type.Literal("frontmatter"), Type.Literal("headings"), Type.Literal("body")]);
const stringOrArray = Type.Union([Type.String(), Type.Array(Type.String())]);


function markDefaultIndexDirtyForPath(workspaceRoot: string, rawPath: unknown): void {
  if (typeof rawPath !== "string" || !rawPath.trim()) return;
  const absolutePath = path.isAbsolute(rawPath) ? path.resolve(rawPath) : path.resolve(workspaceRoot, rawPath);
  const docsRoot = path.resolve(workspaceRoot, "docs");
  const todosRoot = path.resolve(workspaceRoot, "todos");
  if (!isInside(docsRoot, absolutePath) && !isInside(todosRoot, absolutePath)) return;
  dirtyIndexPaths.add(normalizeForCompare(resolveIndexPath(undefined, workspaceRoot)));
}

function commandMayMutateArtifacts(command: unknown): boolean {
  if (typeof command !== "string") return false;
  const lower = command.toLowerCase();
  if (!/(docs|todos|\.md)/.test(lower)) return false;
  return /(rm|del|erase|mv|move|cp|copy|ren|rename|mkdir|touch|tee|echo|python|node|perl|sed|powershell|pwsh)|>|>>/.test(lower);
}

function registerArtifactDirtyTracking(pi: ExtensionAPI) {
  pi.on("tool_result", async (event: any, ctx: any) => {
    if (event?.isError) return;
    const workspaceRoot = path.resolve(ctx?.cwd ?? process.cwd());
    const input = event?.input ?? {};
    if (event?.toolName === "write" || event?.toolName === "edit") {
      markDefaultIndexDirtyForPath(workspaceRoot, input.path);
      return;
    }
    if (event?.toolName === "bash" && commandMayMutateArtifacts(input.command)) {
      dirtyIndexPaths.add(normalizeForCompare(resolveIndexPath(undefined, workspaceRoot)));
    }
  });
}

export default function registerArtifactSearch(pi: ExtensionAPI) {
  registerArtifactDirtyTracking(pi);

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
      indexPath: Type.Optional(Type.String({ description: "Generated project-local index path. Defaults to <workspaceRoot>/.compound-game-dev/artifact-index.json and must stay inside workspaceRoot." })),
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
      explain: Type.Optional(Type.Boolean({ description: "Include score/ranking reasons for each result." })),
      rebuild: Type.Optional(Type.Boolean({ description: "Force rebuilding the generated index before searching." })),
    }),
    async execute(_toolCallId, params, _signal, onUpdate, ctx) {
      try {
        onUpdate?.({ content: [{ type: "text" as const, text: "Refreshing Compound Game Dev artifact index..." }] });
        const searchParams = params as SearchParams;
        const { index, indexPath, refreshed, stats, fastPath, freshnessMode } = await buildOrRefreshIndex(searchParams, ctx.cwd);
        const searchResult = searchIndex(index, searchParams);
        const output = formatResults(searchResult, searchParams, { indexPath, refreshed, stats, totalFiles: Object.keys(index.files).length });
        const limit = Math.max(1, Math.min(searchParams.limit ?? DEFAULT_LIMIT, 100));
        return {
          content: [{ type: "text" as const, text: output }],
          details: {
            query: searchParams.query,
            requiredTerms: searchParams.requiredTerms,
            optionalTerms: searchParams.optionalTerms,
            scopes: searchParams.scopes ?? ["all"],
            indexPath: normalizePath(indexPath),
            refreshed,
            fastPath,
            freshnessMode,
            refreshStats: stats,
            totalIndexedFiles: Object.keys(index.files).length,
            resultCount: searchResult.totalMatches,
            preparedResultCount: searchResult.results.length,
            returnedResultCount: Math.min(searchResult.results.length, limit),
            results: searchResult.results.slice(0, limit),
            groups: searchParams.groupByKind ? groupResultsByKind(searchResult.results.slice(0, limit)) : undefined,
            suggestedRg: suggestedRgCommand(searchParams),
            controls: {
              ranking: {
                rankProfile: searchParams.rankProfile ?? "balanced",
                matchMode: searchParams.matchMode ?? "all",
                minTermMatches: searchParams.minTermMatches,
                requiredTerms: normalizeList(searchParams.requiredTerms),
                optionalTerms: normalizeList(searchParams.optionalTerms),
                includeBody: searchParams.includeBody !== false,
                searchFields: fieldsForSearch(searchParams),
                includeRelated: searchParams.includeRelated === true,
                groupByKind: searchParams.groupByKind === true,
                fieldWeights: FIELD_WEIGHTS,
                severityBoosts: SEVERITY_BOOSTS,
                todoStatusBoosts: TODO_STATUS_BOOSTS,
                todoPriorityBoosts: TODO_PRIORITY_BOOSTS,
              },
              filters: ["scopes", "status", "priority", "tags", "module", "component", "docType", "category", "failureMode", "problemType", "severity", "includeCompletedTodos"],
              index: ["workspaceRoot", "docsRoot", "todosRoot", "indexPath", "rebuild", "freshnessMode", "freshnessTtlMs"],
              concurrency: {
                lockTimeoutMs: INDEX_LOCK_TIMEOUT_MS,
                lockStaleMs: INDEX_LOCK_STALE_MS,
                lockRetryMs: INDEX_LOCK_RETRY_MS,
              },
            },
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: message }],
          details: { error: message },
          isError: true,
        };
      }
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
