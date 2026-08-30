import { describe, expect, it } from "vitest";
import type { GameSessionSnapshot } from "../../../src/games/spy/app/state/persistenceModels";
import { FairnessHistoryStorage } from "../../../src/games/spy/infrastructure/storage/fairnessHistoryStorage";
import { GameSessionStorage } from "../../../src/games/spy/infrastructure/storage/gameSessionStorage";
import {
  FAIRNESS_HISTORY_STORAGE_KEY,
  GAME_SESSION_STORAGE_KEY,
  LEGACY_GAME_SESSION_KEYS,
} from "../../../src/games/spy/infrastructure/storage/storageKeys";
import type { StorageLike } from "../../../src/games/spy/infrastructure/storage/storageResult";

class MemoryStorage implements StorageLike {
  public readonly values = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }
}

const session: GameSessionSnapshot = {
  phase: "setup",
  selectedThemeId: "places",
  players: [
    { id: "player-1", name: "Игрок 1" },
    { id: "player-2", name: "Игрок 2" },
    { id: "player-3", name: "Игрок 3" },
  ],
  settings: { spyCount: 1, spyMode: "classic" },
  round: null,
  roundStartedAtMs: null,
  currentPlayerIndex: 0,
};

describe("browser storage adapters", () => {
  it("keeps the game session and fairness history under different keys", () => {
    const storage = new MemoryStorage();
    const sessions = new GameSessionStorage(storage);
    const fairness = new FairnessHistoryStorage(storage);

    expect(sessions.save(session).ok).toBe(true);
    expect(
      fairness.save({
        roundNumber: 0,
        spies: [],
        starters: [],
        recentWordsByTheme: {},
      }).ok,
    ).toBe(true);

    expect(storage.values.has(GAME_SESSION_STORAGE_KEY)).toBe(true);
    expect(storage.values.has(FAIRNESS_HISTORY_STORAGE_KEY)).toBe(true);
    expect(JSON.parse(storage.values.get(GAME_SESSION_STORAGE_KEY) ?? "null"))
      .toMatchObject({ schemaVersion: 1 });
    expect(JSON.parse(storage.values.get(FAIRNESS_HISTORY_STORAGE_KEY) ?? "null"))
      .toMatchObject({ schemaVersion: 1 });
    expect(sessions.load()).toEqual({ ok: true, value: session });
  });

  it("never persists the visible-role phase", () => {
    const storage = new MemoryStorage();
    const sessions = new GameSessionStorage(storage);

    const result = sessions.save({
      ...session,
      phase: "role",
      round: createRound(),
    });

    expect(result.ok).toBe(true);
    expect(sessions.load()).toMatchObject({
      ok: true,
      value: { phase: "handoff" },
    });
  });

  it("restores the active round timer origin", () => {
    const storage = new MemoryStorage();
    const sessions = new GameSessionStorage(storage);
    const activeSession: GameSessionSnapshot = {
      ...session,
      phase: "active",
      round: createRound(),
      roundStartedAtMs: 1_788_000_000_000,
      currentPlayerIndex: session.players.length,
    };

    expect(sessions.save(activeSession).ok).toBe(true);
    expect(sessions.load()).toEqual({ ok: true, value: activeSession });
  });

  it("migrates a version-one session saved before the timer existed", () => {
    const storage = new MemoryStorage();
    const sessionWithoutTimer = Object.fromEntries(
      Object.entries(session).filter(([key]) => key !== "roundStartedAtMs"),
    );
    storage.values.set(GAME_SESSION_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      ...sessionWithoutTimer,
    }));

    expect(new GameSessionStorage(storage).load()).toMatchObject({
      ok: true,
      value: { roundStartedAtMs: null },
    });
  });

  it("starts a timer when restoring an old active session", () => {
    const storage = new MemoryStorage();
    const sessionWithoutTimer = Object.fromEntries(
      Object.entries(session).filter(([key]) => key !== "roundStartedAtMs"),
    );
    storage.values.set(GAME_SESSION_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      ...sessionWithoutTimer,
      phase: "active",
      round: createRound(),
      currentPlayerIndex: session.players.length,
    }));

    expect(new GameSessionStorage(storage).load()).toMatchObject({
      ok: true,
      value: { roundStartedAtMs: expect.any(Number) },
    });
  });

  it("returns an error and removes malformed JSON", () => {
    const storage = new MemoryStorage();
    storage.values.set(GAME_SESSION_STORAGE_KEY, "{bad-json");

    const result = new GameSessionStorage(storage).load();

    expect(result).toMatchObject({ ok: false, error: { code: "invalid-data" } });
    expect(storage.values.has(GAME_SESSION_STORAGE_KEY)).toBe(false);
  });

  it("keeps legacy data when writing the migrated key fails", () => {
    const storage = new MemoryStorage();
    const legacyKey = LEGACY_GAME_SESSION_KEYS[0];
    const legacySession = JSON.stringify({ ...session, schemaVersion: 0 });
    storage.values.set(legacyKey, legacySession);
    storage.setItem = () => {
      throw new Error("quota");
    };

    const result = new GameSessionStorage(storage).load();

    expect(result).toMatchObject({
      ok: false,
      error: { code: "write-failed" },
    });
    expect(storage.values.get(legacyKey)).toBe(legacySession);
    expect(storage.values.has(GAME_SESSION_STORAGE_KEY)).toBe(false);
  });

  it("contains unavailable storage without throwing", () => {
    expect(new GameSessionStorage(null).load()).toMatchObject({
      ok: false,
      error: { code: "unavailable" },
    });
  });

  it("contains browser storage exceptions", () => {
    const throwingStorage: StorageLike = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };

    expect(new GameSessionStorage(throwingStorage).load()).toMatchObject({
      ok: false,
      error: { code: "read-failed" },
    });
    expect(new GameSessionStorage(throwingStorage).save(session)).toMatchObject({
      ok: false,
      error: { code: "write-failed" },
    });
  });
});

function createRound(): NonNullable<GameSessionSnapshot["round"]> {
  return {
    number: 1,
    themeId: "places",
    targetWord: "Аэропорт",
    decoyWord: null,
    spyMode: "classic",
    assignments: [
      { playerId: "player-1", role: "spy", displayedWord: null },
      { playerId: "player-2", role: "civilian", displayedWord: "Аэропорт" },
      { playerId: "player-3", role: "civilian", displayedWord: "Аэропорт" },
    ],
    firstPlayerId: "player-2",
  };
}
