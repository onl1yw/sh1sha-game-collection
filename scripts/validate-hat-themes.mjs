import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createServer } from "vite";

const directory = resolve(process.cwd(), "public/games/hat/themes");
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
    "/src/games/hat/domain/theme.ts",
  );
  const entries = validators.parseHatManifest(manifestJson);
  if (!entries) {
    errors.push("manifest.json: invalid Hat theme manifest");
  } else {
    await reportUnlistedFiles(entries);
    const enabledWords = new Map();

    for (const entry of entries) {
      const theme = validators.parseHatTheme(await readJson(entry.file));
      if (!theme) {
        errors.push(`${entry.file}: invalid Hat theme`);
        continue;
      }
      if (theme.id !== entry.id) {
        errors.push(`${entry.file}: id does not match manifest entry ${entry.id}`);
        continue;
      }

      themeCount += 1;
      if (!entry.enabled) continue;
      wordCount += theme.words.length;
      for (const word of theme.words) {
        const key = validators.normalizeWord(word);
        const previous = enabledWords.get(key);
        if (previous) {
          errors.push(
            `${entry.file}: word "${word}" duplicates enabled theme ${previous}`,
          );
        } else {
          enabledWords.set(key, entry.file);
        }
      }
    }
  }
} finally {
  await server.close();
}

if (errors.length > 0) {
  console.error(`Hat catalog errors:\n- ${errors.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${themeCount} Hat themes and ${wordCount} enabled words.`);
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
