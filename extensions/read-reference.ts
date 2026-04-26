import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { keyHint, type ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";
import { Type } from "typebox";

const TEXT_EXTENSIONS = new Set([
  ".md",
  ".markdown",
  ".txt",
  ".json",
  ".yaml",
  ".yml",
  ".ts",
  ".js",
  ".sh",
]);

function normalizeForCompare(value: string): string {
  const normalized = path.resolve(value);
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function normalizeInputPath(input: string): string {
  return input.trim().replace(/^@+/, "").replace(/\\/g, "/");
}

function resolvePackageReference(packageRoot: string, rawPath: string): string {
  const requestedPath = normalizeInputPath(rawPath);

  if (!requestedPath) {
    throw new Error("Reference path is required.");
  }

  if (path.isAbsolute(requestedPath)) {
    throw new Error("Use a package-relative reference path, not an absolute path.");
  }

  const absolutePath = path.resolve(packageRoot, requestedPath);
  const normalizedRoot = normalizeForCompare(packageRoot);
  const normalizedTarget = normalizeForCompare(absolutePath);
  const rootWithSeparator = normalizedRoot.endsWith(path.sep) ? normalizedRoot : `${normalizedRoot}${path.sep}`;

  if (normalizedTarget !== normalizedRoot && !normalizedTarget.startsWith(rootWithSeparator)) {
    throw new Error(`Reference path escapes the package root: ${rawPath}`);
  }

  const extension = path.extname(absolutePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported reference file extension: ${extension || "<none>"}`);
  }

  return absolutePath;
}

function sliceLines(text: string, offset?: number, limit?: number): string {
  if (offset === undefined && limit === undefined) return text;

  const lines = text.split(/\r?\n/);
  const start = Math.max((offset ?? 1) - 1, 0);
  const end = limit === undefined ? undefined : start + Math.max(limit, 0);
  return lines.slice(start, end).join("\n");
}

function countLines(text: string): number {
  if (!text) return 0;
  return text.split(/\r?\n/).length;
}

function getTextContent(result: { content?: Array<{ type?: string; text?: string }> }): string {
  const first = result.content?.[0];
  return first?.type === "text" && typeof first.text === "string" ? first.text : "";
}

export default function registerCompoundGameDevReferenceReader(pi: ExtensionAPI) {
  const extensionDir = path.dirname(fileURLToPath(import.meta.url));
  const packageRoot = path.resolve(extensionDir, "..");

  pi.registerTool({
    name: "cg_read_reference",
    label: "Read Compound Game Dev Reference",
    description: "Read a Compound Game Dev package prompt, reference, skill asset, or other text file by package-relative path.",
    promptSnippet: "Read Compound Game Dev package files by package-relative path",
    promptGuidelines: [
      "Use cg_read_reference for Compound Game Dev package files such as prompts/cg-work.md or references/cg-plan/research-agents.md instead of the read tool with package-relative paths.",
      "Pass cg_read_reference package-relative paths only; do not pass project cwd-relative paths or absolute local package paths.",
    ],
    parameters: Type.Object({
      path: Type.String({ description: "Package-relative path such as prompts/cg-work.md or references/cg-plan/research-agents.md" }),
      offset: Type.Optional(Type.Number({ description: "1-indexed line number to start reading from" })),
      limit: Type.Optional(Type.Number({ description: "Maximum number of lines to return" })),
    }),
    prepareArguments(args) {
      if (!args || typeof args !== "object") return args;
      const input = args as { path?: unknown };
      if (typeof input.path === "string") {
        return { ...args, path: normalizeInputPath(input.path) };
      }
      return args;
    },
    async execute(_toolCallId, params) {
      try {
        const absolutePath = resolvePackageReference(packageRoot, params.path);
        const text = await readFile(absolutePath, "utf8");
        const output = sliceLines(text, params.offset, params.limit);
        const normalizedPackagePath = path.relative(packageRoot, absolutePath).replace(/\\/g, "/");

        return {
          content: [{ type: "text" as const, text: output }],
          details: {
            path: normalizedPackagePath,
            absolutePath,
            offset: params.offset,
            limit: params.limit,
            lines: countLines(output),
            totalLines: countLines(text),
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: message }],
          details: { path: params.path, error: message },
          isError: true,
        };
      }
    },
    renderCall(args, theme) {
      let text = theme.fg("toolTitle", theme.bold("cg_read_reference "));
      text += theme.fg("accent", args.path ?? "<missing path>");
      if (args.offset || args.limit) {
        const parts: string[] = [];
        if (args.offset) parts.push(`offset=${args.offset}`);
        if (args.limit) parts.push(`limit=${args.limit}`);
        text += theme.fg("dim", ` (${parts.join(", ")})`);
      }
      return new Text(text, 0, 0);
    },
    renderResult(result, { expanded, isPartial }, theme) {
      if (isPartial) return new Text(theme.fg("warning", "Reading package reference..."), 0, 0);

      const details = result.details as { path?: string; error?: string; lines?: number; totalLines?: number } | undefined;
      const output = getTextContent(result);

      if (details?.error || result.isError) {
        const message = details?.error ?? output.split("\n")[0] ?? "Unknown error";
        return new Text(theme.fg("error", `Error: ${message}`), 0, 0);
      }

      const shownLines = details?.lines ?? countLines(output);
      const totalLines = details?.totalLines ?? shownLines;
      const pathLabel = details?.path ? theme.fg("accent", details.path) : "package reference";
      let text = theme.fg("success", `Read ${shownLines} line${shownLines === 1 ? "" : "s"}`);
      if (totalLines !== shownLines) text += theme.fg("dim", ` of ${totalLines}`);
      text += theme.fg("dim", ` from ${pathLabel}`);

      if (!expanded) {
        text += ` ${theme.fg("muted", `(${keyHint("app.tools.expand", "to expand")})`)}`;
        return new Text(text, 0, 0);
      }

      return new Text(`${text}\n${theme.fg("toolOutput", output)}`, 0, 0);
    },
  });
}
