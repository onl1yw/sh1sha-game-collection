import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  parseAliasManifest,
  parseAliasTheme,
} from "../../../src/games/alias/domain/theme";

const CATALOG = resolve(process.cwd(), "public/games/alias/themes");

describe("Alias theme catalog", () => {
  it("registers valid, distinct, sufficiently large themes", async () => {
    const manifest = parseAliasManifest(await readJson("manifest.json"));
    expect(manifest).not.toBeNull();
    expect(manifest?.map((entry) => entry.id)).toEqual(expect.arrayContaining([
      "cinema", "physics", "mathematics",
    ]));

    for (const entry of manifest ?? []) {
      const theme = parseAliasTheme(await readJson(entry.file));
      expect(theme?.id).toBe(entry.id);
      expect(theme?.words.length).toBeGreaterThanOrEqual(30);
      expect(new Set(theme?.words.map((word) => word.toLocaleLowerCase("ru"))).size)
        .toBe(theme?.words.length);
    }
  });
});

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(CATALOG, file), "utf8")) as unknown;
}
