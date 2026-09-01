import { HatGlasses } from "lucide-react";
import { describe, expect, it } from "vitest";

import {
  buildGameRegistry,
  gameCatalogState,
  gameIsVisibleInCatalog,
  gameModules,
} from "../../src/app/gameRegistry";
import {
  GAME_MODULE_API_VERSION,
  type GameModule,
} from "../../src/app/gameModule";

describe("game registry", () => {
  it("discovers every local game module and can load its app", async () => {
    expect(gameModules.map((game) => game.id)).toContain("spy");

    for (const game of gameModules) {
      const loaded = await game.load();
      expect(loaded.default).toEqual(expect.any(Function));
    }
  });

  it("sorts modules without a central hardcoded game list", () => {
    const registry = buildGameRegistry({
      "/src/games/zeta/gameModule.ts": { gameModule: fakeGame("zeta", 20) },
      "/src/games/alpha/gameModule.ts": { gameModule: fakeGame("alpha", 10) },
    });

    expect(registry.map((game) => game.id)).toEqual(["alpha", "zeta"]);
  });

  it("rejects duplicate ids and a folder mismatch", () => {
    expect(() => buildGameRegistry({
      "/src/games/alpha/gameModule.ts": { gameModule: fakeGame("alpha") },
      "/copy/games/alpha/gameModule.ts": { gameModule: fakeGame("alpha") },
    })).toThrow(/duplicate/i);

    expect(() => buildGameRegistry({
      "/src/games/wrong/gameModule.ts": { gameModule: fakeGame("alpha") },
    })).toThrow(/must match folder/i);
  });

  it("contains catalog-state failures from third-party games", () => {
    const game = fakeGame("alpha");
    game.getCatalogState = () => {
      throw new Error("storage denied");
    };

    expect(gameCatalogState(game, null)).toEqual({ hasSavedSession: false });
  });

  it("gates catalog modules that require sensitive content", () => {
    const game = fakeGame("alpha");

    expect(gameIsVisibleInCatalog(game, false)).toBe(true);
    game.requiresSensitiveContent = true;
    expect(gameIsVisibleInCatalog(game, false)).toBe(false);
    expect(gameIsVisibleInCatalog(game, true)).toBe(true);
  });
});

function fakeGame(id: string, order = 100): GameModule {
  return {
    apiVersion: GAME_MODULE_API_VERSION,
    id,
    title: id,
    description: `Game ${id}`,
    Icon: HatGlasses,
    order,
    load: async () => ({ default: () => null }),
  };
}
