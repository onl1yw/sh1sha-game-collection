import { describe, expect, it } from "vitest";

import { selectFirstPlayerId } from "../../../src/games/spy/domain/game/selectFirstPlayer";
import type { Player } from "../../../src/games/spy/domain/player/types";
import type { RandomSource } from "../../../src/games/spy/domain/random";

const players: Player[] = ["a", "b", "c", "d"].map((id) => ({ id, name: id }));

class FixedRandom implements RandomSource {
  public constructor(private readonly value: number) {}

  public next(): number {
    return this.value;
  }
}

class LcgRandom implements RandomSource {
  private state = 0x87654321;

  public next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
}

describe("selectFirstPlayerId", () => {
  it("reduces the chance for a player who started often and recently", () => {
    const selected = selectFirstPlayerId({
      players,
      history: [
        { playerId: "a", starts: 5, lastStartRound: 5 },
        { playerId: "b", starts: 0, lastStartRound: null },
        { playerId: "c", starts: 5, lastStartRound: 3 },
        { playerId: "d", starts: 5, lastStartRound: 2 },
      ],
      roundNumber: 6,
      random: new FixedRandom(0.5),
    });

    expect(selected).toBe("b");
  });

  it("remains random when histories are equal", () => {
    expect(selectFirstPlayerId({
      players,
      history: [],
      roundNumber: 1,
      random: new FixedRandom(0.99),
    })).toBe("d");
  });

  it("gives a new player a normal rather than overwhelming chance to start", () => {
    const history = [
      { playerId: "a", starts: 20, lastStartRound: 17 },
      { playerId: "b", starts: 20, lastStartRound: 18 },
      { playerId: "c", starts: 20, lastStartRound: 19 },
    ];
    const random = new LcgRandom();
    let newcomerStarts = 0;

    for (let attempt = 0; attempt < 5_000; attempt += 1) {
      if (selectFirstPlayerId({
        players,
        history,
        roundNumber: 20,
        random,
      }) === "d") {
        newcomerStarts += 1;
      }
    }

    expect(newcomerStarts / 5_000).toBeLessThan(0.6);
  });

  it("rejects corrupted history", () => {
    expect(() => selectFirstPlayerId({
      players,
      history: [{ playerId: "a", starts: 1, lastStartRound: 3 }],
      roundNumber: 2,
      random: new FixedRandom(0),
    })).toThrow(/повреждена/);
  });
});
