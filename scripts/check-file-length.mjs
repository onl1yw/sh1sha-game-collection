import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const MAX_LINES = 300;
const ROOT = process.cwd();
const SEARCH_ROOTS = [
  ".github",
  "docs",
  "public",
  "schemas",
  "scripts",
  "src",
  "templates",
  "tests",
];
const ROOT_FILES = [
  ".editorconfig",
  ".gitignore",
  "AGENTS.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "eslint.config.js",
  "index.html",
  "LICENSE",
  "NOTICE",
  "package.json",
  "README.md",
  "SECURITY.md",
  "THIRD_PARTY_NOTICES.md",
  "tsconfig.json",
  "vite.config.ts",
];
const INCLUDED_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (INCLUDED_EXTENSIONS.has(extname(entry.name))) {
      files.push(path);
    }
  }

  return files;
}

function countLines(source) {
  if (source.length === 0) return 0;
  return source.endsWith("\n")
    ? source.slice(0, -1).split("\n").length
    : source.split("\n").length;
}

const nestedFiles = (
  await Promise.all(SEARCH_ROOTS.map((directory) => collectFiles(join(ROOT, directory))))
).flat();
const allFiles = [...ROOT_FILES.map((file) => join(ROOT, file)), ...nestedFiles];
const oversized = [];

for (const file of allFiles) {
  const lines = countLines(await readFile(file, "utf8"));
  if (lines > MAX_LINES) {
    oversized.push(`${relative(ROOT, file)}: ${lines} lines`);
  }
}

if (oversized.length > 0) {
  console.error(`Files exceeding ${MAX_LINES} lines:\n${oversized.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${allFiles.length} files: all are <= ${MAX_LINES} lines.`);
}
