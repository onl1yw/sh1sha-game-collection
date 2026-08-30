import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createServer } from "vite";

const ROOT = process.cwd();
const THEME_DIRECTORY = resolve(ROOT, "public", "games", "spy", "themes");
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FILE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;
const MANIFEST_KEYS = ["schemaVersion", "themes"];
const ENTRY_KEYS = ["id", "file", "enabled", "sensitive"];

const errors = [];
const manifest = await readJson("manifest.json");
const entries = readManifestEntries(manifest);
await reportUnlistedThemeFiles(entries);

const server = await createServer({
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true },
});

let itemCount = 0;
try {
  const validator = await server.ssrLoadModule(
    "/src/games/spy/domain/theme/validateTheme.ts",
  );

  for (const entry of entries) {
    const theme = await readJson(entry.file);
    if (theme === undefined) continue;

    const result = validator.validateTheme(theme);
    if (!result.success) {
      for (const issue of result.errors) {
        errors.push(`${entry.file}: ${issue.path}: ${issue.message}`);
      }
      continue;
    }
    if (result.data.id !== entry.id) {
      errors.push(
        `${entry.file}: id "${result.data.id}" does not match manifest id "${entry.id}"`,
      );
    }
    itemCount += result.data.groups.reduce(
      (count, group) => count + group.items.length,
      0,
    );
  }
} finally {
  await server.close();
}

if (errors.length > 0) {
  console.error(`Theme catalog errors:\n- ${errors.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${entries.length} themes and ${itemCount} items. The catalog is valid.`,
  );
}

async function readJson(fileName) {
  try {
    const source = await readFile(resolve(THEME_DIRECTORY, fileName), "utf8");
    return JSON.parse(source);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    errors.push(`${fileName}: could not read JSON: ${reason}`);
    return undefined;
  }
}

function readManifestEntries(input) {
  if (!isRecord(input)) {
    errors.push("manifest.json: root must be an object");
    return [];
  }
  reportUnknownKeys(input, MANIFEST_KEYS, "manifest.json");
  if (input.schemaVersion !== 1) {
    errors.push("manifest.json: only schemaVersion 1 is supported");
  }
  if (!Array.isArray(input.themes) || input.themes.length === 0) {
    errors.push("manifest.json: themes must be a non-empty array");
    return [];
  }

  const entries = [];
  const ids = new Set();
  const files = new Set();
  input.themes.forEach((value, index) => {
    const entry = readManifestEntry(value, index);
    if (!entry) return;

    if (ids.has(entry.id)) {
      errors.push(`manifest.json: duplicate id "${entry.id}"`);
    }
    if (files.has(entry.file)) {
      errors.push(`manifest.json: duplicate file "${entry.file}"`);
    }
    ids.add(entry.id);
    files.add(entry.file);
    entries.push(entry);
  });
  return entries;
}

function readManifestEntry(value, index) {
  const path = `manifest.json: themes[${index}]`;
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return undefined;
  }
  reportUnknownKeys(value, ENTRY_KEYS, path);

  const valid =
    typeof value.id === "string" &&
    ID_PATTERN.test(value.id) &&
    typeof value.file === "string" &&
    FILE_PATTERN.test(value.file) &&
    typeof value.enabled === "boolean" &&
    (value.sensitive === undefined || typeof value.sensitive === "boolean");
  if (!valid) {
    errors.push(`${path} contains a field with an invalid type or format`);
    return undefined;
  }
  return value;
}

function reportUnknownKeys(value, allowed, path) {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      errors.push(`${path}: unknown field "${key}"`);
    }
  }
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function reportUnlistedThemeFiles(entries) {
  const listed = new Set(entries.map((entry) => entry.file));
  const files = await readdir(THEME_DIRECTORY);
  for (const file of files) {
    if (file.endsWith(".json") && file !== "manifest.json" && !listed.has(file)) {
      errors.push(`${file}: file is not registered in manifest.json`);
    }
  }
}
