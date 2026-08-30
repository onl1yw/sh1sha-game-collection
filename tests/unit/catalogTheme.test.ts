import { describe, expect, it } from "vitest";

import type { CatalogTheme } from "../../src/games/spy/app/ports/themeRepository";
import { toGameTheme } from "../../src/games/spy/app/state/catalogTheme";
import { validateTheme } from "../../src/games/spy/domain/theme/validateTheme";

describe("toGameTheme", () => {
  it("does not pass the sensitive metadata flag into the strict game model", () => {
    const catalogTheme: CatalogTheme = {
      schemaVersion: 1,
      id: "politics",
      name: "Политики",
      description: "",
      groups: [{ id: "leaders", name: "Лидеры", items: ["Политик"] }],
      sensitive: true,
    };

    const gameTheme = toGameTheme(catalogTheme);

    expect(gameTheme).not.toHaveProperty("sensitive");
    expect(validateTheme(gameTheme).success).toBe(true);
  });
});
