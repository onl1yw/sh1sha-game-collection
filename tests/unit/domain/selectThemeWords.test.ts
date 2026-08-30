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
  it("в classic выбирает одно слово без альтернативы", () => {
    const result = selectThemeWords(theme, "classic", [], new SequenceRandom([0.99]));

    expect(result).toEqual({
      targetWord: "Эпсилон",
      decoyWord: null,
      groupId: "second",
    });
  });

  it("в decoy выбирает два разных слова из одной группы", () => {
    const result = selectThemeWords(theme, "decoy", [], new SequenceRandom([0, 0.99]));

    expect(result).toEqual({
      targetWord: "Альфа",
      decoyWord: "Гамма",
      groupId: "first",
    });
  });

  it("в decoy пропускает группы без альтернативного объекта", () => {
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

  it("не повторяет недавнее основное слово, пока есть свежее", () => {
    const result = selectThemeWords(
      theme,
      "decoy",
      ["альфа", " БЕТА "],
      new SequenceRandom([0, 0]),
    );

    expect(result.targetWord).toBe("Гамма");
    expect(["Альфа", "Бета"]).toContain(result.decoyWord);
  });

  it("сбрасывает ограничение, когда все слова уже игрались", () => {
    const recent = theme.groups.flatMap((group) => group.items);
    const result = selectThemeWords(theme, "classic", recent, new SequenceRandom([0]));

    expect(result.targetWord).toBe("Альфа");
  });

  it("отклоняет пустую тематику", () => {
    expect(() =>
      selectThemeWords({ ...theme, groups: [] }, "classic", [], new SequenceRandom([0])),
    ).toThrow(/нет объектов/);
  });
});
