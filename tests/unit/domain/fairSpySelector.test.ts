import { describe, expect, it } from "vitest";

import {
  calculateSpyWeight,
  selectFairSpyIds,
  updateSpyHistory,
} from "../../../src/games/spy/domain/game/fairSpySelector";
import type { Player } from "../../../src/games/spy/domain/player/types";
import type { RandomSource } from "../../../src/games/spy/domain/random";

const players: Player[] = ["a", "b", "c", "d"].map((id) => ({ id, name: id }));

class SequenceRandom implements RandomSource {
  private index = 0;

  constructor(private readonly values: number[]) {}

  next(): number {
    const value = this.values[this.index];
    this.index += 1;
    if (value === undefined) throw new Error("Random sequence exhausted");
    return value;
  }
}

class LcgRandom implements RandomSource {
  private state = 0x12345678;

  next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
}

describe("selectFairSpyIds", () => {
  it("детерминированно выбирает несколько разных игроков", () => {
    const result = selectFairSpyIds({
      players,
      spyCount: 2,
      history: [
        { playerId: "a", spyAssignments: 2, lastSpyRound: 10 },
        { playerId: "b", spyAssignments: 0, lastSpyRound: null },
        { playerId: "c", spyAssignments: 1, lastSpyRound: 5 },
        { playerId: "d", spyAssignments: 1, lastSpyRound: 9 },
      ],
      roundNumber: 10,
      random: new SequenceRandom([0.1, 0.8]),
    });

    expect(result).toEqual(["b", "c"]);
    expect(new Set(result).size).toBe(2);
  });

  it("снижает вес недавнего шпиона и повышает вес ещё не выбранного", () => {
    const recent = calculateSpyWeight(
      { playerId: "a", spyAssignments: 1, lastSpyRound: 8 },
      8,
      0,
    );
    const never = calculateSpyWeight(undefined, 8, 0);

    expect(recent).toBeLessThan(never);
  });

  it("обновляет историю только выбранных игроков", () => {
    const result = updateSpyHistory(
      players,
      [{ playerId: "a", spyAssignments: 2, lastSpyRound: 3 }],
      ["b", "d"],
      4,
    );

    expect(result).toEqual([
      { playerId: "a", spyAssignments: 2, lastSpyRound: 3 },
      { playerId: "b", spyAssignments: 3, lastSpyRound: 4 },
      { playerId: "c", spyAssignments: 2, lastSpyRound: null },
      { playerId: "d", spyAssignments: 3, lastSpyRound: 4 },
    ]);
  });

  it("не делает нового игрока почти гарантированным шпионом", () => {
    const history = [
      { playerId: "a", spyAssignments: 20, lastSpyRound: 17 },
      { playerId: "b", spyAssignments: 20, lastSpyRound: 18 },
      { playerId: "c", spyAssignments: 20, lastSpyRound: 19 },
    ];
    const random = new LcgRandom();
    let newcomerSelections = 0;

    for (let attempt = 0; attempt < 5_000; attempt += 1) {
      const [selected] = selectFairSpyIds({
        players,
        spyCount: 1,
        history,
        roundNumber: 20,
        random,
      });
      if (selected === "d") newcomerSelections += 1;
    }

    expect(newcomerSelections / 5_000).toBeLessThan(0.6);

    const afterNewcomerWasSpy = updateSpyHistory(
      players,
      history,
      ["d"],
      20,
    );
    const nextRandom = new LcgRandom();
    let immediateRepeats = 0;
    for (let attempt = 0; attempt < 5_000; attempt += 1) {
      const [selected] = selectFairSpyIds({
        players,
        spyCount: 1,
        history: afterNewcomerWasSpy,
        roundNumber: 21,
        random: nextRandom,
      });
      if (selected === "d") immediateRepeats += 1;
    }

    expect(immediateRepeats / 5_000).toBeLessThan(0.1);
  });

  it("отклоняет невозможное число шпионов и плохой random", () => {
    const common = { players, history: [], roundNumber: 0 };
    expect(() =>
      selectFairSpyIds({
        ...common,
        spyCount: players.length,
        random: new SequenceRandom([0]),
      }),
    ).toThrow(/мирный/);
    expect(() =>
      selectFairSpyIds({
        ...common,
        spyCount: 1,
        random: new SequenceRandom([1]),
      }),
    ).toThrow(/\[0, 1\)/);
  });
});
