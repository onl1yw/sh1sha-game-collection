import { describe, expect, it } from "vitest";

import { validateGameSetup } from "../../../src/games/spy/domain/game/validateGameSetup";

describe("validateGameSetup", () => {
  it("принимает корректную игру с несколькими шпионами", () => {
    const result = validateGameSetup(
      [
        { id: "a", name: "Аня" },
        { id: "b", name: "Боря" },
        { id: "c", name: "Саша" },
        { id: "d", name: "Даша" },
      ],
      { spyCount: 2, spyMode: "decoy" },
    );

    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("собирает ошибки игроков и настроек", () => {
    const result = validateGameSetup(
      [
        { id: "same", name: "" },
        { id: "same", name: "Боря" },
      ],
      { spyCount: 0, spyMode: "classic" },
    );

    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toMatch(/минимум 3/);
    expect(result.errors.join(" ")).toMatch(/повторяется/);
    expect(result.errors.join(" ")).toMatch(/не меньше 1/);
  });

  it("отклоняет состав больше интерфейсного лимита", () => {
    const players = Array.from({ length: 21 }, (_, index) => ({
      id: `player-${index + 1}`,
      name: `Игрок ${index + 1}`,
    }));

    const result = validateGameSetup(players, {
      spyCount: 1,
      spyMode: "classic",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toMatch(/не больше 20/);
  });
});
