import { spawn, type ChildProcessByStdio } from "node:child_process";
import * as path from "node:path";
import type { Readable } from "node:stream";

export const UNITY_GENERATED_DIRECTORIES = ["Library", "Temp", "Logs", "obj", "Build", "Builds", "UserSettings", ".vs"] as const;

export type RepoSearchQuery = {
  id: string;
  pattern: string;
  literal: boolean;
  caseSensitive?: boolean;
};

export type RepoSearchMatch = {
  path: string;
  line: number;
  column?: number;
  text: string;
};

export type RepoSearchCellStatus =
  | "matched"
  | "no_matches"
  | "partial_limit"
  | "invalid_regex"
  | "timeout"
  | "error"
  | "root_excluded_by_policy"
  | "not_run_global_limit";

export type RepoSearchCellResult = {
  queryId: string;
  root: string;
  status: RepoSearchCellStatus;
  matches: RepoSearchMatch[];
  appliedIgnoreFiles: string[];
  unityExclusions: string[];
  stderr?: string;
  exitCode?: number | null;
};

export type RipgrepRunInput = {
  command?: string;
  cwd: string;
  root: string;
  query: RepoSearchQuery;
  globs: string[];
  ignoreFiles: string[];
  unityExclusions: string[];
  includeHidden: boolean;
  maxMatches: number;
  maxMatchesPerFile: number;
  maxSnippetChars: number;
  timeoutMs: number;
  signal?: AbortSignal;
};

const MAX_STDERR_CHARS = 8_000;
const MAX_PENDING_JSON_CHARS = 1_000_000;

export function stripLeadingAt(value: string): string {
  return value.trim().replace(/^@+/, "");
}

export function normalizeDisplayPath(value: string): string {
  return value.replace(/\\/g, "/");
}

type PathApi = Pick<typeof path, "relative" | "isAbsolute" | "sep">;

export function isPathWithin(root: string, target: string, pathApi: PathApi = path): boolean {
  const relative = pathApi.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${pathApi.sep}`) && relative !== ".." && !pathApi.isAbsolute(relative));
}

export function displayPathFromRoot(root: string, target: string, pathApi: PathApi = path): string {
  const relative = pathApi.relative(root, target);
  return normalizeDisplayPath(relative || ".");
}

export function buildUnityGeneratedExclusions(
  searchRoot: string,
  unityRoots: string[],
  pathApi: PathApi = path,
): { globs: string[]; rootExcluded: boolean } {
  const globs = new Set<string>();
  let rootExcluded = false;
  for (const unityRoot of unityRoots) {
    if (isPathWithin(unityRoot, searchRoot, pathApi)) {
      const relativeFromUnity = normalizeDisplayPath(pathApi.relative(unityRoot, searchRoot));
      const firstSegment = relativeFromUnity.split("/")[0];
      if (UNITY_GENERATED_DIRECTORIES.some((entry) => entry.toLowerCase() === firstSegment.toLowerCase())) {
        rootExcluded = true;
      } else if (!relativeFromUnity || relativeFromUnity === ".") {
        for (const excluded of UNITY_GENERATED_DIRECTORIES) globs.add(`!${excluded}/**`);
      }
    } else if (isPathWithin(searchRoot, unityRoot, pathApi)) {
      const prefix = normalizeDisplayPath(pathApi.relative(searchRoot, unityRoot));
      for (const excluded of UNITY_GENERATED_DIRECTORIES) globs.add(`!${prefix}/${excluded}/**`);
    }
  }
  return { globs: [...globs], rootExcluded };
}

export function buildRipgrepArgs(input: Omit<RipgrepRunInput, "command" | "cwd" | "signal" | "timeoutMs" | "maxSnippetChars">): string[] {
  const args = [
    "--json",
    "--color",
    "never",
    "--max-count",
    String(input.maxMatchesPerFile),
  ];
  if (input.query.literal) args.push("--fixed-strings");
  if (input.query.caseSensitive === true) args.push("--case-sensitive");
  else if (input.query.caseSensitive === false) args.push("--ignore-case");
  else args.push("--smart-case");
  if (input.includeHidden) args.push("--hidden");
  for (const ignoreFile of input.ignoreFiles) args.push("--ignore-file", ignoreFile);
  for (const glob of [...input.globs, ...input.unityExclusions]) args.push("--glob", glob);
  args.push("-e", input.query.pattern, "--", input.root);
  return args;
}

function truncateSnippet(value: string, maxChars: number): string {
  const flattened = value.replace(/\r?\n/g, " ").trim();
  return flattened.length <= maxChars ? flattened : `${flattened.slice(0, Math.max(0, maxChars - 1))}…`;
}

export function parseRipgrepMatchEvent(line: string, workspaceRoot: string, maxSnippetChars: number): RepoSearchMatch | null {
  let event: any;
  try {
    event = JSON.parse(line);
  } catch {
    return null;
  }
  if (event?.type !== "match" || !event.data) return null;
  const rawPath = event.data.path?.text;
  const lineNumber = event.data.line_number;
  const lineText = event.data.lines?.text;
  if (typeof rawPath !== "string" || typeof lineNumber !== "number" || typeof lineText !== "string") return null;
  const absolutePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(workspaceRoot, rawPath);
  const firstSubmatch = Array.isArray(event.data.submatches) ? event.data.submatches[0] : undefined;
  return {
    path: displayPathFromRoot(workspaceRoot, absolutePath),
    line: lineNumber,
    column: typeof firstSubmatch?.start === "number" ? firstSubmatch.start + 1 : undefined,
    text: truncateSnippet(lineText, maxSnippetChars),
  };
}

function classifyRipgrepFailure(stderr: string): RepoSearchCellStatus {
  return /regex parse error|invalid regex|error parsing regex/i.test(stderr) ? "invalid_regex" : "error";
}

export function runRipgrepCell(input: RipgrepRunInput): Promise<RepoSearchCellResult> {
  const args = buildRipgrepArgs(input);
  return new Promise((resolve, reject) => {
    if (input.signal?.aborted) {
      const error = new Error("Repository search cancelled.");
      error.name = "AbortError";
      reject(error);
      return;
    }
    let child: ChildProcessByStdio<null, Readable, Readable>;
    try {
      child = spawn(input.command ?? "rg", args, {
        cwd: input.cwd,
        shell: false,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      reject(error);
      return;
    }

    const matches: RepoSearchMatch[] = [];
    let pending = "";
    let stderr = "";
    let limitReached = false;
    let timedOut = false;
    let aborted = false;
    let settled = false;

    const terminate = () => {
      if (!child.killed) child.kill();
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      terminate();
    }, input.timeoutMs);
    const onAbort = () => {
      aborted = true;
      terminate();
    };
    input.signal?.addEventListener("abort", onAbort, { once: true });
    if (input.signal?.aborted) onAbort();

    const consumeLine = (line: string) => {
      if (!line.trim() || limitReached) return;
      const match = parseRipgrepMatchEvent(line, input.cwd, input.maxSnippetChars);
      if (!match) return;
      matches.push(match);
      if (matches.length >= input.maxMatches) {
        limitReached = true;
        terminate();
      }
    };

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      pending += chunk;
      if (pending.length > MAX_PENDING_JSON_CHARS && !pending.includes("\n")) {
        stderr = "ripgrep emitted an oversized JSON event";
        terminate();
        return;
      }
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() ?? "";
      for (const line of lines) consumeLine(line);
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      if (stderr.length < MAX_STDERR_CHARS) stderr += chunk.slice(0, MAX_STDERR_CHARS - stderr.length);
    });
    child.on("error", (error: NodeJS.ErrnoException) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      input.signal?.removeEventListener("abort", onAbort);
      if (error.code === "ENOENT") reject(new Error("ripgrep executable 'rg' was not found on PATH. Install ripgrep and retry cg_search_repo."));
      else reject(error);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      input.signal?.removeEventListener("abort", onAbort);
      if (pending) consumeLine(pending);
      if (aborted) {
        const error = new Error("Repository search cancelled.");
        error.name = "AbortError";
        reject(error);
        return;
      }
      const status: RepoSearchCellStatus = timedOut
        ? "timeout"
        : limitReached
          ? "partial_limit"
          : code === 0
            ? (matches.length > 0 ? "matched" : "no_matches")
            : code === 1
              ? "no_matches"
              : classifyRipgrepFailure(stderr);
      resolve({
        queryId: input.query.id,
        root: input.root,
        status,
        matches,
        appliedIgnoreFiles: input.ignoreFiles,
        unityExclusions: input.unityExclusions,
        stderr: stderr.trim() || undefined,
        exitCode: code,
      });
    });
  });
}
