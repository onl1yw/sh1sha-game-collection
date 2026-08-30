import { describe, expect, it } from "vitest";
import {
  migrateFairnessHistory,
  migrateGameSession,
  type PersistedGameSession,
} from "../../../src/games/spy/infrastructure/storage/migrations";

const validSession: PersistedGameSession = {
  schemaVersion: 1,
  phase: "role",
  selectedThemeId: "places",
  players: [
    { id: "player-1", name: "Игрок 1" },
    { id: "player-2", name: "Игрок 2" },
    { id: "player-3", name: "Игрок 3" },
  ],
  settings: { spyCount: 1, spyMode: "classic" },
  round: {
    number: 1,
    themeId: "places",
    targetWord: "Аэропорт",
    decoyWord: null,
    spyMode: "classic",
    assignments: [
      { playerId: "player-1", role: "civilian", displayedWord: "Аэропорт" },
      { playerId: "player-2", role: "spy", displayedWord: null },
      { playerId: "player-3", role: "civilian", displayedWord: "Аэропорт" },
    ],
    firstPlayerId: "player-3",
  },
  roundStartedAtMs: null,
  currentPlayerIndex: 1,
};

describe("migrateGameSession", () => {
  it("restores a visible role as a closed handoff", () => {
    expect(migrateGameSession(validSession)).toEqual({
      ...validSession,
      phase: "handoff",
    });
  });

  it("migrates the supported version zero shape", () => {
    const migrated = migrateGameSession({
      ...validSession,
      schemaVersion: 0,
      currentPlayerIndex: undefined,
    });

    expect(migrated).toMatchObject({
      schemaVersion: 1,
      phase: "handoff",
      currentPlayerIndex: 0,
    });
  });

  it.each(["ready", "active", "results"] as const)(
    "infers a completed role index for legacy %s sessions",
    (phase) => {
      const migrated = migrateGameSession({
        ...validSession,
        schemaVersion: 0,
        phase,
        currentPlayerIndex: undefined,
      });

      expect(migrated).toMatchObject({
        schemaVersion: 1,
        phase,
        currentPlayerIndex: validSession.players.length,
      });
    },
  );

  it.each([
    [2, false],
    [3, true],
    [20, true],
    [21, false],
  ] as const)("validates the persisted player-count boundary: %s", (count, valid) => {
    const migrated = migrateGameSession({
      ...validSession,
      phase: "setup",
      players: Array.from({ length: count }, (_, index) => ({
        id: `player-${index + 1}`,
        name: `Игрок ${index + 1}`,
      })),
      round: null,
      currentPlayerIndex: 0,
    });

    expect(migrated !== null).toBe(valid);
  });

  it("rejects inconsistent assignments", () => {
    expect(
      migrateGameSession({
        ...validSession,
        round: {
          ...validSession.round,
          assignments: validSession.round?.assignments.slice(1),
        },
      }),
    ).toBeNull();
  });

  it("rejects a session whose spy count leaves no civilians", () => {
    expect(
      migrateGameSession({
        ...validSession,
        settings: { spyCount: 3, spyMode: "classic" },
      }),
    ).toBeNull();
  });

  it.each([
    ["handoff", 3],
    ["role", 3],
    ["ready", 2],
    ["active", 2],
    ["results", 2],
  ] as const)("rejects an inconsistent player index in %s", (phase, currentPlayerIndex) => {
    expect(
      migrateGameSession({ ...validSession, phase, currentPlayerIndex }),
    ).toBeNull();
  });

  it("rejects assignments that are not in player order", () => {
    expect(
      migrateGameSession({
        ...validSession,
        round: {
          ...validSession.round!,
          assignments: [...validSession.round!.assignments].reverse(),
        },
      }),
    ).toBeNull();
  });

  it("rejects a spy count that does not match the assignments", () => {
    expect(
      migrateGameSession({
        ...validSession,
        settings: { ...validSession.settings, spyCount: 2 },
      }),
    ).toBeNull();
  });

  it("rejects a round mode that does not match the settings", () => {
    expect(
      migrateGameSession({
        ...validSession,
        settings: { ...validSession.settings, spyMode: "decoy" },
      }),
    ).toBeNull();
  });

  it("rejects words that contradict classic roles", () => {
    const assignments = validSession.round!.assignments.map((assignment) =>
      assignment.role === "spy"
        ? { ...assignment, displayedWord: validSession.round!.targetWord }
        : assignment,
    );

    expect(
      migrateGameSession({
        ...validSession,
        round: { ...validSession.round!, assignments },
      }),
    ).toBeNull();
    expect(
      migrateGameSession({
        ...validSession,
        round: { ...validSession.round!, decoyWord: "Вокзал" },
      }),
    ).toBeNull();
  });

  it("rejects words that contradict decoy roles", () => {
    const session = createValidDecoySession();
    const assignments = session.round!.assignments.map((assignment) =>
      assignment.role === "spy"
        ? { ...assignment, displayedWord: null }
        : assignment,
    );

    expect(
      migrateGameSession({
        ...session,
        round: { ...session.round!, assignments },
      }),
    ).toBeNull();
  });

  it("rejects identical target and decoy words", () => {
    const session = createValidDecoySession();
    const targetWord = session.round!.targetWord;
    const assignments = session.round!.assignments.map((assignment) =>
      assignment.role === "spy"
        ? { ...assignment, displayedWord: targetWord }
        : assignment,
    );

    expect(
      migrateGameSession({
        ...session,
        round: {
          ...session.round!,
          decoyWord: targetWord,
          assignments,
        },
      }),
    ).toBeNull();
  });
});

describe("migrateFairnessHistory", () => {
  it("adds new collections to version zero history", () => {
    expect(
      migrateFairnessHistory({
        schemaVersion: 0,
        roundNumber: 4,
        spyHistory: [
          { playerId: "player-1", spyAssignments: 2, lastSpyRound: 4 },
        ],
      }),
    ).toEqual({
      schemaVersion: 1,
      roundNumber: 4,
      spies: [
        { playerId: "player-1", spyAssignments: 2, lastSpyRound: 4 },
      ],
      starters: [],
      recentWordsByTheme: {},
    });
  });

  it("rejects duplicate player history", () => {
    const duplicate = {
      schemaVersion: 1,
      roundNumber: 1,
      spies: [
        { playerId: "player-1", spyAssignments: 0, lastSpyRound: null },
        { playerId: "player-1", spyAssignments: 1, lastSpyRound: 1 },
      ],
      starters: [],
      recentWordsByTheme: {},
    };

    expect(migrateFairnessHistory(duplicate)).toBeNull();
  });

  it("rejects history entries from a future round", () => {
    const history = {
      schemaVersion: 1,
      roundNumber: 4,
      spies: [
        { playerId: "player-1", spyAssignments: 1, lastSpyRound: 4 },
      ],
      starters: [
        { playerId: "player-1", starts: 1, lastStartRound: 4 },
      ],
      recentWordsByTheme: {},
    };

    expect(
      migrateFairnessHistory({
        ...history,
        spies: [{ ...history.spies[0], lastSpyRound: 5 }],
      }),
    ).toBeNull();
    expect(
      migrateFairnessHistory({
        ...history,
        starters: [{ ...history.starters[0], lastStartRound: 5 }],
      }),
    ).toBeNull();
  });
});

function createValidDecoySession(): PersistedGameSession {
  const decoyWord = "Вокзал";
  return {
    ...validSession,
    settings: { ...validSession.settings, spyMode: "decoy" },
    round: {
      ...validSession.round!,
      spyMode: "decoy",
      decoyWord,
      assignments: validSession.round!.assignments.map((assignment) => ({
        ...assignment,
        displayedWord:
          assignment.role === "spy"
            ? decoyWord
            : validSession.round!.targetWord,
      })),
    },
  };
}
