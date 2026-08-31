import { describe, expect, it } from "vitest";

import { createWordDeck, wordAt } from "../../../src/games/alias/domain/deck";
import { gameIsFinished, leadingTeamIds, roundScore } from "../../../src/games/alias/domain/scoring";
import { createInitialSetup, setupIsValid } from "../../../src/games/alias/domain/setup";
import type { AliasSession, RoundWord } from "../../../src/games/alias/domain/types";

describe("Alias domain", () => {
  it("builds a deterministic deck from every selected theme", () => {
    const deck = createWordDeck([
      { id: "one", words: ["A", "B"] },
      { id: "two", words: ["C"] },
    ], ["one", "two"], () => 0);

    expect(deck).toHaveLength(3);
    expect(new Set(deck.map((word) => word.text))).toEqual(new Set(["A", "B", "C"]));
    expect(wordAt(deck, 3)).toEqual(deck[0]);
  });

  it("validates teams and scores skipped words according to the setting", () => {
    const setup = createInitialSetup(["cinema"]);
    expect(setupIsValid(setup)).toBe(true);
    expect(setupIsValid({
      ...setup,
      teams: [{ id: "a", name: "Одинаково" }, { id: "b", name: "одинаково" }],
    })).toBe(false);

    const entries = [entry("correct", 1), entry("skipped", 2)];
    expect(roundScore(entries, false)).toBe(1);
    expect(roundScore(entries, true)).toBe(0);
  });

  it("supports both score and rounds victory conditions", () => {
    const points = session({ type: "points", target: 5 }, { "team-1": 5, "team-2": 3 });
    expect(gameIsFinished(points)).toBe(true);
    expect(leadingTeamIds(points)).toEqual(["team-1"]);

    const rounds = session({ type: "rounds", roundsPerTeam: 2 }, { "team-1": 3, "team-2": 3 });
    rounds.roundsPlayed = { "team-1": 2, "team-2": 1 };
    expect(gameIsFinished(rounds)).toBe(false);
    rounds.roundsPlayed["team-2"] = 2;
    expect(gameIsFinished(rounds)).toBe(true);
    expect(leadingTeamIds(rounds)).toEqual(["team-1", "team-2"]);
  });
});

function entry(outcome: RoundWord["outcome"], index: number): RoundWord {
  return {
    id: String(index),
    outcome,
    word: { id: String(index), text: `Слово ${index}`, themeId: "test" },
  };
}

function session(
  winCondition: AliasSession["setup"]["winCondition"],
  scores: Record<string, number>,
): AliasSession {
  const setup = createInitialSetup(["cinema"]);
  return {
    setup: { ...setup, winCondition },
    scores,
    roundsPlayed: { "team-1": 0, "team-2": 0 },
    activeTeamIndex: 0,
    roundNumber: 1,
    deck: [{ id: "1", text: "Слово", themeId: "cinema" }],
    cursor: 0,
  };
}
