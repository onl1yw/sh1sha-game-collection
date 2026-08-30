import { describe, expect, it } from "vitest";

import { selectThemeWords } from "../../../src/games/spy/domain/theme/selectThemeWords";
import type { Theme } from "../../../src/games/spy/domain/theme/types";
import type { RandomSource } from "../../../src/games/spy/domain/random";

const theme: Theme = {
  schemaVersion: 1,
  id: "test-theme",
  name: "Тест",
  description: "",
  groups: [
    { id: "first", name: "Первая", items: ["Альфа", "Бета", "Гамма"] },
    { id: "second", name: "Вторая", items: ["Дельта", "Эпсилон"] },
  ],
};

class SequenceRandom implements RandomSource {
  constructor(private readonly values: number[]) {}

  next(): number {
    const value = this.values.shift();
    if (value === undefined) throw new Error("Random sequence exhausted");
    return value;
  }
}

describe("selectThemeWords", () => {
  it("selects one word without an alternative in classic mode", () => {
    const result = selectThemeWords(theme, "classic", [], new SequenceRandom([0.99]));

    expect(result).toEqual({
      targetWord: "Эпсилон",
      decoyWord: null,
      groupId: "second",
    });
  });

  it("selects two different words from one group in decoy mode", () => {
    const result = selectThemeWords(theme, "decoy", [], new SequenceRandom([0, 0.99]));

    expect(result).toEqual({
      targetWord: "Альфа",
      decoyWord: "Гамма",
      groupId: "first",
    });
  });

  it("skips groups without an alternative item in decoy mode", () => {
    const result = selectThemeWords(
      {
        ...theme,
        groups: [
          { id: "single", name: "Одиночная", items: ["Один"] },
          ...theme.groups,
        ],
      },
      "decoy",
      [],
      new SequenceRandom([0, 0]),
    );

    expect(result.groupId).toBe("first");
    expect(result.targetWord).toBe("Альфа");
  });

  it("does not repeat a recent target while a fresh one is available", () => {
    const result = selectThemeWords(
      theme,
      "decoy",
      ["альфа", " БЕТА "],
      new SequenceRandom([0, 0]),
    );

    expect(result.targetWord).toBe("Гамма");
    expect(["Альфа", "Бета"]).toContain(result.decoyWord);
  });

  it("resets the restriction after every word has been played", () => {
    const recent = theme.groups.flatMap((group) => group.items);
    const result = selectThemeWords(theme, "classic", recent, new SequenceRandom([0]));

    expect(result.targetWord).toBe("Альфа");
  });

  it("rejects an empty theme", () => {
    expect(() =>
      selectThemeWords({ ...theme, groups: [] }, "classic", [], new SequenceRandom([0])),
    ).toThrow(/нет объектов/);
  });
});
