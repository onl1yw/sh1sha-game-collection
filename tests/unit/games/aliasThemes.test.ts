import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  parseAliasManifest,
  parseAliasTheme,
} from "../../../src/games/alias/domain/theme";

const CATALOG = resolve(process.cwd(), "public/games/alias/themes");
const SPY_CATALOG = resolve(process.cwd(), "public/games/spy/themes");
const SPY_THEME_IDS = [
  "places",
  "minecraft",
  "disney",
  "phone-apps",
  "chip-flavors",
  "drinks",
  "politicians",
  "countries",
  "berries",
  "drugs",
] as const;

describe("Alias theme catalog", () => {
  it("registers valid, distinct, sufficiently large themes", async () => {
    const manifest = parseAliasManifest(await readJson("manifest.json"));
    expect(manifest).not.toBeNull();
    expect(manifest?.map((entry) => entry.id)).toEqual(expect.arrayContaining([
      "cinema", "physics", "mathematics",
      ...SPY_THEME_IDS,
    ]));

    for (const entry of manifest ?? []) {
      const theme = parseAliasTheme(await readJson(entry.file));
      expect(theme?.id).toBe(entry.id);
      expect(theme?.words.length).toBeGreaterThanOrEqual(10);
      expect(new Set(theme?.words.map((word) => word.toLocaleLowerCase("ru"))).size)
        .toBe(theme?.words.length);
    }
  });

  it("keeps every adapted Spy pack exactly synchronized", async () => {
    for (const themeId of SPY_THEME_IDS) {
      const aliasTheme = parseAliasTheme(await readJson(`${themeId}.json`));
      const spyTheme = await readSpyTheme(`${themeId}.json`);
      expect(aliasTheme?.words).toEqual(
        spyTheme.groups.flatMap((group) => group.items),
      );
    }
  });
});

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(CATALOG, file), "utf8")) as unknown;
}

interface SpyThemeJson {
  groups: Array<{ items: string[] }>;
}

async function readSpyTheme(file: string): Promise<SpyThemeJson> {
  return JSON.parse(await readFile(resolve(SPY_CATALOG, file), "utf8")) as SpyThemeJson;
}
