import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { selectThemeWords } from "../../src/games/spy/domain/theme/selectThemeWords";
import type { Theme } from "../../src/games/spy/domain/theme/types";
import { checkExpansionPacks, EXPANSION_PACKS } from "./wordPackExpansionChecks";

describe("Spy theme expansion", () => {
  it("publishes six separate expansion packs without repeating catalog words", () => {
    checkExpansionPacks("spy");
  });

  it.each(EXPANSION_PACKS)("keeps alternatives in the target group of $id", ({ id }) => {
    const file = resolve(process.cwd(), "public/games/spy/themes", `${id}.json`);
    const theme = JSON.parse(readFileSync(file, "utf8")) as Theme;
    expect(theme.groups.length).toBeGreaterThan(0);
    const words = theme.groups.flatMap((group) => group.items);
    let offset = 0;

    for (const group of theme.groups) {
      expect(group.items.length).toBeGreaterThanOrEqual(2);
      const targetDraw = (offset + 0.5) / words.length;
      const values = [targetDraw, 0.999];
      const random = { next: () => values.shift() ?? 0 };
      const classic = selectThemeWords(theme, "classic", [], { next: () => targetDraw });
      expect(classic.targetWord).toBe(group.items[0]);
      expect(classic.decoyWord).toBeNull();

      const decoy = selectThemeWords(theme, "decoy", [], random);
      expect(decoy.groupId).toBe(group.id);
      expect(decoy.targetWord).toBe(group.items[0]);
      expect(group.items).toContain(decoy.decoyWord);
      expect(decoy.targetWord).not.toBe(decoy.decoyWord);
      offset += group.items.length;
    }
  });
});
