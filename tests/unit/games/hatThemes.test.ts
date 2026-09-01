import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parseHatTheme } from "../../../src/games/hat/domain/theme";

const CATALOG = resolve(process.cwd(), "public/games/hat/themes");
const HAT_THEME_IDS = [
  "cinema",
  "physics",
  "mathematics",
  "places",
  "minecraft",
  "disney",
  "phone-apps",
  "chip-flavors",
  "drinks",
  "countries",
  "berries",
  "politicians",
  "drugs",
] as const;

interface ManifestEntry {
  id: string;
  file: string;
  enabled: boolean;
  sensitive?: boolean;
}

interface HatTheme {
  schemaVersion: number;
  id: string;
  name: string;
  description: string;
  words: string[];
}

describe("Hat theme catalog", () => {
  it("owns all registered packs and preserves sensitive flags", async () => {
    const manifest = await readJson<{ schemaVersion: number; themes: ManifestEntry[] }>(
      "manifest.json",
    );

    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.themes.map((entry) => entry.id)).toEqual(HAT_THEME_IDS);
    expect(manifest.themes.filter((entry) => entry.sensitive).map((entry) => entry.id))
      .toEqual(["politicians", "drugs"]);

    const registered = manifest.themes.map((entry) => entry.file).sort();
    const files = (await readdir(CATALOG))
      .filter((file) => file.endsWith(".json") && file !== "manifest.json")
      .sort();
    expect(files).toEqual(registered);
  });

  it("contains globally unique normalized words across enabled themes", async () => {
    const manifest = await readJson<{ themes: ManifestEntry[] }>("manifest.json");
    const seen = new Map<string, string>();

    for (const entry of manifest.themes.filter((item) => item.enabled)) {
      const theme = await readJson<HatTheme>(entry.file);
      expect(theme.schemaVersion).toBe(1);
      expect(theme.id).toBe(entry.id);
      expect(theme.name.trim()).not.toBe("");
      expect(theme.description.length).toBeLessThanOrEqual(200);
      expect(theme.words.length).toBeGreaterThanOrEqual(10);

      for (const word of theme.words) {
        const normalized = word.trim().toLocaleLowerCase("ru");
        expect(normalized).not.toBe("");
        expect(
          seen.has(normalized),
          `Duplicate word "${word}" in ${entry.id} and ${seen.get(normalized)}`,
        ).toBe(false);
        seen.set(normalized, entry.id);
      }
    }
  });

  it("rejects collisions after trimming and case normalization", () => {
    expect(parseHatTheme({
      schemaVersion: 1,
      id: "test",
      name: "Test",
      description: "Test words",
      words: ["Шляпа", " шляпа ", "A", "B", "C", "D", "E", "F", "G", "H"],
    })).toBeNull();
  });
});

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(resolve(CATALOG, file), "utf8")) as T;
}
