import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createServer } from "vite";

const directory = resolve(process.cwd(), "public/games/alias/themes");
const errors = [];
const manifestJson = await readJson("manifest.json");
const server = await createServer({
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true },
});

let themeCount = 0;
let wordCount = 0;
try {
  const validators = await server.ssrLoadModule(
    "/src/games/alias/domain/theme.ts",
  );
  const entries = validators.parseAliasManifest(manifestJson);
  if (!entries) {
    errors.push("manifest.json: invalid Alias theme manifest");
  } else {
    await reportUnlistedFiles(entries);
    for (const entry of entries) {
      const parsed = validators.parseAliasTheme(await readJson(entry.file));
      if (!parsed) {
        errors.push(`${entry.file}: invalid Alias theme`);
      } else if (parsed.id !== entry.id) {
        errors.push(`${entry.file}: id does not match manifest entry ${entry.id}`);
      } else {
        themeCount += 1;
        wordCount += parsed.words.length;
      }
    }
  }
} finally {
  await server.close();
}

if (errors.length > 0) {
  console.error(`Alias catalog errors:\n- ${errors.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${themeCount} Alias themes and ${wordCount} words.`);
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(resolve(directory, file), "utf8"));
  } catch (error) {
    errors.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
}

async function reportUnlistedFiles(entries) {
  const listed = new Set(entries.map((entry) => entry.file));
  for (const file of await readdir(directory)) {
    if (file.endsWith(".json") && file !== "manifest.json" && !listed.has(file)) {
      errors.push(`${file}: file is not registered in manifest.json`);
    }
  }
}
