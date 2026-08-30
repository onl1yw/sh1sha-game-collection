import { describe, expect, it } from "vitest";

import { gameReducer } from "../../src/games/spy/app/state/gameReducer";
import { createInitialGameState, type GameState } from "../../src/games/spy/app/state/gameState";
import type { GameRound } from "../../src/games/spy/domain/game/types";

describe("gameReducer", () => {
  it("opens setup immediately after selecting an available theme", () => {
    const state: GameState = {
      ...createInitialGameState(),
      catalog: {
        status: "ready",
        themes: [{
          schemaVersion: 1,
          id: "places",
          name: "Места",
          description: "",
          groups: [],
          sensitive: false,
        }],
        errors: [],
      },
    };

    const chosen = gameReducer(state, {
      type: "choose-theme",
      themeId: "places",
    });

    expect(chosen.phase).toBe("setup");
    expect(chosen.selectedThemeId).toBe("places");
  });

  it("does not open setup for an unknown theme", () => {
    const state = createInitialGameState();
    const chosen = gameReducer(state, {
      type: "choose-theme",
      themeId: "missing",
    });

    expect(chosen.phase).toBe("theme-selection");
    expect(chosen.errorMessage).toMatch(/недоступна/);
  });

  it("returns to selection without an error when the saved theme was removed", () => {
    const restored = {
      ...setupState(),
      selectedThemeId: "removed-theme",
    };

    const loaded = gameReducer(restored, {
      type: "catalog-loaded",
      themes: [{
        schemaVersion: 1,
        id: "minecraft",
        name: "Minecraft",
        description: "",
        groups: [],
        sensitive: false,
      }],
      errors: [],
    });

    expect(loaded.phase).toBe("theme-selection");
    expect(loaded.selectedThemeId).toBeNull();
    expect(loaded.errorMessage).toBeNull();
  });

  it("does not assign a historical id to a new player", () => {
    const state = setupState();
    const shrunk = gameReducer(state, { type: "set-player-count", count: 3 });
    const grown = gameReducer(shrunk, { type: "set-player-count", count: 4 });

    expect(shrunk.players.map((player) => player.id)).toEqual([
      "player-1",
      "player-2",
      "player-3",
    ]);
    expect(grown.players[3]).toEqual({ id: "player-5", name: "Игрок 4" });
  });

  it("stores history from a cancelled deal to prevent rerolling", () => {
    const state: GameState = {
      ...setupState(),
      phase: "handoff",
      round: round,
      fairnessHistory: {
        roundNumber: 1,
        spies: [
          { playerId: "player-4", spyAssignments: 1, lastSpyRound: 1 },
        ],
        starters: [
          { playerId: "player-1", starts: 1, lastStartRound: 1 },
        ],
        recentWordsByTheme: { places: ["Аэропорт"] },
      },
    };

    const cancelled = gameReducer(state, { type: "cancel-round" });

    expect(cancelled.phase).toBe("setup");
    expect(cancelled.round).toBeNull();
    expect(cancelled.fairnessHistory).toEqual(state.fairnessHistory);
  });

  it("clears a stale warning after storage recovers", () => {
    const warned = {
      ...setupState(),
      storageWarning: "Сохранение временно недоступно",
    };

    const recovered = gameReducer(warned, {
      type: "set-storage-warning",
      message: null,
    });

    expect(recovered.storageWarning).toBeNull();
  });

  it("stores the active round start time", () => {
    const ready: GameState = {
      ...setupState(),
      phase: "ready",
      round,
      currentPlayerIndex: 4,
    };

    const active = gameReducer(ready, {
      type: "start-playing",
      startedAtMs: 1_788_000_000_000,
    });

    expect(active.phase).toBe("active");
    expect(active.roundStartedAtMs).toBe(1_788_000_000_000);
  });
});

function setupState(): GameState {
  return {
    ...createInitialGameState(),
    phase: "setup",
    selectedThemeId: "places",
    fairnessHistory: {
      roundNumber: 3,
      spies: [
        { playerId: "player-4", spyAssignments: 1, lastSpyRound: 3 },
      ],
      starters: [
        { playerId: "player-4", starts: 1, lastStartRound: 2 },
      ],
      recentWordsByTheme: {},
    },
  };
}

const round: GameRound = {
  number: 1,
  themeId: "places",
  targetWord: "Аэропорт",
  decoyWord: null,
  spyMode: "classic",
  assignments: [],
  firstPlayerId: "player-1",
};
