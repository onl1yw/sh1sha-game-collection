import { describe, expect, it } from "vitest";

import { selectFirstPlayerId } from "../../../src/games/spy/domain/game/selectFirstPlayer";
import type { FirstPlayerHistoryEntry } from "../../../src/games/spy/domain/game/types";
import type { Player } from "../../../src/games/spy/domain/player/types";

const players: Player[] = "abcdefgh".split("").map((id) => ({ id, name: id }));

function sampleStarts(
  roster: readonly Player[],
  spyIds: readonly string[],
  history: readonly FirstPlayerHistoryEntry[] = [],
): number[] {
  const counts = roster.map(() => 0);
  // Evenly spaced draws measure the distribution without flaky random samples.
  for (let draw = 0; draw < 10_000; draw += 1) {
    const id = selectFirstPlayerId({
      players: roster,
      spyIds,
      history,
      roundNumber: 10,
      random: { next: () => (draw + 0.5) / 10_000 },
    });
    counts[roster.findIndex((player) => player.id === id)]! += 1;
  }
  return counts.map((count) => count / 10_000);
}

function recipientChance(
  probabilities: readonly number[],
  roster: readonly Player[],
  spyIds: readonly string[],
  question: number,
): number {
  return probabilities.reduce((chance, probability, index) => {
    const recipient = roster[(index + question) % roster.length]!;
    return chance + (spyIds.includes(recipient.id) ? probability : 0);
  }, 0);
}

describe("early question recipients", () => {
  it.each([0, 1, 2, 3, 4, 5])(
    "protects the first two recipients with a spy at position %i, including wraparound",
    (spyIndex) => {
      const roster = players.slice(0, 6);
      const spyIds = [roster[spyIndex]!.id];
      const probabilities = sampleStarts(roster, spyIds);
      const first = recipientChance(probabilities, roster, spyIds, 1);
      const second = recipientChance(probabilities, roster, spyIds, 2);

      expect(first).toBeGreaterThan(0.01);
      expect(first).toBeLessThan(0.04);
      expect(second).toBeGreaterThan(first);
      expect(second).toBeLessThan(0.1);
      expect(probabilities.every((chance) => chance > 0)).toBe(true);
      // The spy can still ask first; the bias concerns receiving questions.
      expect(probabilities[spyIndex]).toBeGreaterThan(1 / roster.length);
    },
  );

  it("only protects the first recipient in a three-player game", () => {
    const probabilities = sampleStarts(players.slice(0, 3), ["a"]);

    expect(probabilities[2]).toBeGreaterThan(0);
    expect(probabilities[2]).toBeLessThan(0.1);
    expect(probabilities[0]).toBeCloseTo(probabilities[1]!, 3);
  });

  it("supports multiple spies while keeping every starting position possible", () => {
    const spyIds = ["b", "f"];
    const probabilities = sampleStarts(players, spyIds);

    expect(recipientChance(probabilities, players, spyIds, 1)).toBeLessThan(0.08);
    expect(recipientChance(probabilities, players, spyIds, 2)).toBeLessThan(0.15);
    expect(probabilities.every((chance) => chance > 0)).toBe(true);
  });

  it("prioritizes the first question when two civilian recipients are impossible", () => {
    const roster = players.slice(0, 4);
    const spyIds = ["a", "c"];
    const probabilities = sampleStarts(roster, spyIds);
    const first = recipientChance(probabilities, roster, spyIds, 1);

    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThan(0.12);
    expect(probabilities[0]).toBeCloseTo(probabilities[2]!, 3);
  });

  it("still rotates starters using their history", () => {
    const probabilities = sampleStarts(players.slice(0, 6), ["f"], [
      { playerId: "a", starts: 7, lastStartRound: 9 },
      { playerId: "b", starts: 0, lastStartRound: null },
    ]);

    expect(probabilities[0]).toBeGreaterThan(0);
    expect(probabilities[0]).toBeLessThan(probabilities[1]!);
  });
});
