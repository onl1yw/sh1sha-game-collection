import { describe, expect, it } from "vitest";
import type {
  FairnessHistoryStore,
  GameSessionStore,
  StorageResult,
} from "../../src/games/spy/app/ports/storage";
import { persistGameState } from "../../src/games/spy/app/state/persistGameState";
import { createInitialGameState } from "../../src/games/spy/app/state/gameState";

function success<T>(value: T): StorageResult<T> {
  return { ok: true, value };
}

function failure(): StorageResult<never> {
  return {
    ok: false,
    error: { code: "write-failed", message: "blocked" },
  };
}

function stores(options: { sessionFails?: boolean; fairnessFails?: boolean }) {
  let fairnessSaveCalls = 0;
  const sessions: GameSessionStore = {
    load: () => success(null),
    save: () => (options.sessionFails ? failure() : success(undefined)),
    clear: () => success(undefined),
  };
  const fairness: FairnessHistoryStore = {
    load: () => success(null),
    save: () => {
      fairnessSaveCalls += 1;
      return options.fairnessFails ? failure() : success(undefined);
    },
    clear: () => success(undefined),
  };
  return { sessions, fairness, fairnessSaveCalls: () => fairnessSaveCalls };
}

describe("persistGameState", () => {
  it("saves session before fairness history", () => {
    const storage = stores({});
    expect(
      persistGameState(createInitialGameState(), storage.sessions, storage.fairness),
    ).toBeNull();
    expect(storage.fairnessSaveCalls()).toBe(1);
  });

  it("reports session failure and does not advance fairness storage", () => {
    const storage = stores({ sessionFails: true });
    const warning = persistGameState(
      createInitialGameState(),
      storage.sessions,
      storage.fairness,
    );
    expect(warning).toContain("не сохраняет");
    expect(storage.fairnessSaveCalls()).toBe(0);
  });

  it("reports a fairness-history failure", () => {
    const storage = stores({ fairnessFails: true });
    const warning = persistGameState(
      createInitialGameState(),
      storage.sessions,
      storage.fairness,
    );
    expect(warning).toContain("история жеребьёвки");
  });
});
