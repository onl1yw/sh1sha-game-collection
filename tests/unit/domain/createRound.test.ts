import { describe, expect, it } from "vitest";

import { createRound } from "../../../src/games/spy/domain/game/createRound";
import type { Player } from "../../../src/games/spy/domain/player/types";
import type { RandomSource } from "../../../src/games/spy/domain/random";
import type { Theme } from "../../../src/games/spy/domain/theme/types";

const players: Player[] = ["a", "b", "c", "d"].map((id) => ({ id, name: id }));
const theme: Theme = {
  schemaVersion: 1,
  id: "test",
  name: "Тест",
  description: "",
  groups: [{ id: "group", name: "Группа", items: ["Альфа", "Бета", "Гамма"] }],
};

class SequenceRandom implements RandomSource {
  constructor(private readonly values: number[]) {}

  next(): number {
    const value = this.values.shift();
    if (value === undefined) throw new Error("Random sequence exhausted");
    return value;
  }
}

describe("createRound", () => {
  it("creates a classic round where the spy sees their role without a word", () => {
    const result = createRound({
      players,
      settings: { spyCount: 1, spyMode: "classic" },
      theme,
      spyHistory: [],
      firstPlayerHistory: [],
      recentWords: [],
      roundNumber: 1,
      random: new SequenceRandom([0, 0, 0.99]),
    });

    expect(result.round.targetWord).toBe("Альфа");
    expect(result.round.decoyWord).toBeNull();
    expect(result.round.assignments[0]).toEqual({
      playerId: "a",
      role: "spy",
      displayedWord: null,
    });
    expect(result.round.firstPlayerId).toBe("d");
  });

  it("gives every spy one decoy word without revealing their role on the card", () => {
    const result = createRound({
      players,
      settings: { spyCount: 2, spyMode: "decoy" },
      theme,
      spyHistory: [],
      firstPlayerHistory: [],
      recentWords: [],
      roundNumber: 2,
      random: new SequenceRandom([0, 0.99, 0.3, 0.9, 0.5]),
    });
    const spies = result.round.assignments.filter((item) => item.role === "spy");
    const civilians = result.round.assignments.filter((item) => item.role === "civilian");

    expect(result.round.decoyWord).toBe("Гамма");
    expect(spies.map((item) => item.playerId)).toEqual(["b", "d"]);
    expect(spies.every((item) => item.displayedWord === "Гамма")).toBe(true);
    expect(civilians.every((item) => item.displayedWord === "Альфа")).toBe(true);
    expect(result.nextSpyHistory.filter((item) => item.spyAssignments === 1)).toHaveLength(2);
  });

  it("rejects invalid settings and an invalid theme", () => {
    const common = {
      players,
      spyHistory: [],
      firstPlayerHistory: [],
      recentWords: [],
      roundNumber: 1,
      random: new SequenceRandom([0]),
    };
    expect(() =>
      createRound({
        ...common,
        settings: { spyCount: 4, spyMode: "classic" },
        theme,
      }),
    ).toThrow(/мирный/);
    expect(() =>
      createRound({
        ...common,
        settings: { spyCount: 1, spyMode: "classic" },
        theme: { ...theme, groups: [] },
      }),
    ).toThrow(/Некорректная тематика/);
  });

  it("uses history when selecting the first player", () => {
    const result = createRound({
      players,
      settings: { spyCount: 1, spyMode: "classic" },
      theme,
      spyHistory: [],
      firstPlayerHistory: [
        { playerId: "a", starts: 4, lastStartRound: 4 },
        { playerId: "b", starts: 0, lastStartRound: null },
        { playerId: "c", starts: 4, lastStartRound: 3 },
        { playerId: "d", starts: 4, lastStartRound: 2 },
      ],
      recentWords: [],
      roundNumber: 5,
      random: new SequenceRandom([0, 0, 0.5]),
    });

    expect(result.round.firstPlayerId).toBe("b");
  });
});
