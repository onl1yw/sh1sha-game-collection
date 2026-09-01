import { describe, expect, it } from "vitest";

import {
  availableHatWordCount,
  createHatWordPool,
  isWordIdPermutation,
  requeueSkippedWord,
  reviewedWordQueue,
} from "../../../src/games/hat/domain/pool";
import {
  expectedFinalHatScore,
  finalHatScoreIsComplete,
  leadingHatTeamIds,
  totalHatScore,
} from "../../../src/games/hat/domain/scoring";
import {
  createInitialHatSetup,
  hatSetupIsValid,
} from "../../../src/games/hat/domain/setup";
import type { HatSession } from "../../../src/games/hat/domain/types";

describe("Hat domain", () => {
  it("accepts one team and validates word and timer limits", () => {
    const setup = {
      ...createInitialHatSetup(["cinema"]),
      teams: [{ id: "solo", name: "Одна команда" }],
      wordCount: 10,
      durationSeconds: 30,
    };

    expect(hatSetupIsValid(setup, 10)).toBe(true);
    expect(hatSetupIsValid({ ...setup, wordCount: 11 }, 10)).toBe(false);
    expect(hatSetupIsValid({ ...setup, durationSeconds: 9 }, 10)).toBe(false);
    expect(hatSetupIsValid({
      ...setup,
      teams: [{ id: "a", name: "Команда" }, { id: "b", name: " команда " }],
    }, 10)).toBe(false);
    expect(hatSetupIsValid({
      ...setup,
      teams: [{ id: "same", name: "Первая" }, { id: "same", name: "Вторая" }],
    }, 10)).toBe(false);
  });

  it("starts with every supplied theme selected for a mixed pool", () => {
    expect(createInitialHatSetup(["cinema", "physics", "cinema"]).selectedThemeIds)
      .toEqual(["cinema", "physics"]);
  });

  it("selects an exact unique master pool across chosen themes", () => {
    const themes = [
      { id: "one", words: ["Кино", "Актёр", "Каскадёр"] },
      { id: "two", words: [" кино ", "Интеграл", "Тервер", "Линал"] },
    ];

    expect(availableHatWordCount(themes, ["one", "two"])).toBe(6);
    const pool = createHatWordPool(themes, ["one", "two"], 5, () => 0);
    expect(pool).toHaveLength(5);
    expect(new Set(pool.map((word) => word.id)).size).toBe(5);
    expect(new Set(pool.map((word) => word.text.toLocaleLowerCase("ru"))).size)
      .toBe(5);
    expect(() => createHatWordPool(themes, ["one"], 5, () => 0))
      .toThrow("every pool slot");
  });

  it("requeues a skipped word without immediately repeating it", () => {
    const queue = ["a", "b", "c"];
    const next = requeueSkippedWord(queue, () => 0);

    expect(next[0]).toBe("b");
    expect(isWordIdPermutation(next, queue)).toBe(true);
    expect(requeueSkippedWord(["last"], () => 0)).toEqual(["last"]);
  });

  it("returns disabled review claims to the shuffled unresolved pool", () => {
    const next = reviewedWordQueue([
      "waiting",
    ], [
      { wordId: "correct", included: true },
      { wordId: "mistake", included: false },
    ], () => 0);

    expect(isWordIdPermutation(next, ["waiting", "mistake"])).toBe(true);
    expect(next).not.toContain("correct");
  });

  it("reports leaders and the fixed three-stage final score", () => {
    const session = scoringSession();
    expect(leadingHatTeamIds(session)).toEqual(["one"]);
    expect(totalHatScore(session)).toBe(15);
    expect(expectedFinalHatScore(session)).toBe(15);
    expect(finalHatScoreIsComplete(session)).toBe(true);
  });
});

function scoringSession(): HatSession {
  const teams = [{ id: "one", name: "Первая" }, { id: "two", name: "Вторая" }];
  const stageValues = { one: 0, two: 0 };
  return {
    setup: {
      teams,
      selectedThemeIds: ["cinema"],
      wordCount: 5,
      durationSeconds: 30,
    },
    masterWords: Array.from({ length: 5 }, (_, index) => ({
      id: `word-${index}`,
      text: `Слово ${index}`,
      themeId: "cinema",
    })),
    stageIndex: 2,
    remainingWordIds: [],
    activeTeamIndex: 0,
    scores: { one: 10, two: 5 },
    stageScores: {
      describe: { ...stageValues },
      gestures: { ...stageValues },
      "one-word": { ...stageValues },
    },
    timeCreditsMs: { ...stageValues },
    turnsStarted: { ...stageValues },
    activePlayMs: { describe: 0, gestures: 0, "one-word": 0 },
  };
}
