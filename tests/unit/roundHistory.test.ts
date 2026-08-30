import { describe, expect, it } from "vitest";

import { createEmptyFairnessHistory } from "../../src/games/spy/app/state/persistenceModels";
import { buildNextFairnessHistory } from "../../src/games/spy/app/state/roundHistory";
import type { GameRound } from "../../src/games/spy/domain/game/types";
import type { Player } from "../../src/games/spy/domain/player/types";
import type { RandomSource } from "../../src/games/spy/domain/random";
import { selectThemeWords } from "../../src/games/spy/domain/theme/selectThemeWords";
import type { Theme } from "../../src/games/spy/domain/theme/types";

const players: Player[] = ["a", "b", "c"].map((id) => ({ id, name: id }));

class ZeroRandom implements RandomSource {
  public next(): number {
    return 0;
  }
}

describe("buildNextFairnessHistory", () => {
  it.each([
    { items: ["А", "Б"], expectedTargets: ["А", "Б", "А", "Б"] },
    { items: ["А", "Б", "В"], expectedTargets: ["А", "Б", "В", "А"] },
  ])("циклично исключает recent target для $items", ({
    items,
    expectedTargets,
  }) => {
    const theme = makeTheme(items);
    let history = createEmptyFairnessHistory();
    const actualTargets: string[] = [];

    expectedTargets.forEach((_, index) => {
      const words = selectThemeWords(
        theme,
        "decoy",
        history.recentWordsByTheme[theme.id] ?? [],
        new ZeroRandom(),
      );
      actualTargets.push(words.targetWord);
      history = buildNextFairnessHistory({
        previous: history,
        players,
        theme,
        round: makeRound(index + 1, words.targetWord, words.decoyWord),
        nextSpyHistory: [],
      });
    });

    expect(actualTargets).toEqual(expectedTargets);
  });

  it("хранит target, но не decoy, и обновляет историю начинающих", () => {
    const theme = makeTheme(["А", "Б", "В"]);
    const history = buildNextFairnessHistory({
      previous: createEmptyFairnessHistory(),
      players,
      theme,
      round: makeRound(1, "А", "Б"),
      nextSpyHistory: [],
    });

    expect(history.recentWordsByTheme.test).toEqual(["А"]);
    expect(history.starters).toContainEqual({
      playerId: "a",
      starts: 1,
      lastStartRound: 1,
    });
  });

  it("подключает нового игрока к текущему уровню истории начинающих", () => {
    const roster = [...players, { id: "d", name: "d" }];
    const previous = {
      ...createEmptyFairnessHistory(),
      roundNumber: 20,
      starters: players.map((player, index) => ({
        playerId: player.id,
        starts: 20 + index,
        lastStartRound: 17 + index,
      })),
    };

    const history = buildNextFairnessHistory({
      previous,
      players: roster,
      theme: makeTheme(["А", "Б"]),
      round: { ...makeRound(21, "А", "Б"), firstPlayerId: "d" },
      nextSpyHistory: [],
    });

    expect(history.starters).toContainEqual({
      playerId: "d",
      starts: 21,
      lastStartRound: 21,
    });
  });
});

function makeTheme(items: string[]): Theme {
  return {
    schemaVersion: 1,
    id: "test",
    name: "Тест",
    description: "",
    groups: [{ id: "group", name: "Группа", items }],
  };
}

function makeRound(
  number: number,
  targetWord: string,
  decoyWord: string | null,
): GameRound {
  return {
    number,
    themeId: "test",
    targetWord,
    decoyWord,
    spyMode: "decoy",
    assignments: [],
    firstPlayerId: "a",
  };
}
