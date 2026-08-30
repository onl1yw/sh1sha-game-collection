import {
  Castle,
  Cherry,
  CupSoda,
  Globe2,
  Landmark,
  Pill,
  Pickaxe,
  Popcorn,
  Shapes,
  Smartphone,
} from "lucide-react";
import { describe, expect, it } from "vitest";

import { getThemeIcon } from "../../src/games/spy/features/theme-selection/themeIconRegistry";

describe("getThemeIcon", () => {
  it.each([
    ["minecraft", Pickaxe],
    ["disney", Castle],
    ["phone-apps", Smartphone],
    ["chip-flavors", Popcorn],
    ["drinks", CupSoda],
    ["politicians", Landmark],
    ["countries", Globe2],
    ["berries", Cherry],
    ["drugs", Pill],
  ])("maps %s to its icon", (themeId, expectedIcon) => {
    expect(getThemeIcon(themeId)).toBe(expectedIcon);
  });

  it("uses a neutral icon for a future theme", () => {
    expect(getThemeIcon("future-theme")).toBe(Shapes);
  });
});
