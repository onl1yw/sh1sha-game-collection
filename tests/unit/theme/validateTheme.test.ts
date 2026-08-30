import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MAX_THEME_ITEM_COUNT,
  THEME_LIMITS,
} from "../../../src/games/spy/domain/theme/themeLimits";
import { validateTheme } from "../../../src/games/spy/domain/theme/validateTheme";

const validTheme = {
  schemaVersion: 1,
  id: "test-theme",
  name: "  Тест  ",
  description: " Описание ",
  groups: [
    { id: "group-one", name: " Группа ", items: [" Альфа ", "Бета"] },
  ],
};

describe("validateTheme", () => {
  it("validates and normalizes a valid theme", () => {
    const result = validateTheme(validTheme);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Тест");
      expect(result.data.groups[0]?.items).toEqual(["Альфа", "Бета"]);
    }
  });

  it("rejects an empty set, unknown fields, and invalid ids", () => {
    const result = validateTheme({
      ...validTheme,
      id: "Bad ID",
      groups: [],
      unexpected: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.errors.map((error) => `${error.path} ${error.message}`).join(" ");
      expect(messages).toMatch(/Неизвестное поле/);
      expect(messages).toMatch(/kebab-case/);
      expect(messages).toMatch(/хотя бы одна группа/);
    }
  });

  it("detects case-insensitive duplicate items and duplicate group ids", () => {
    const result = validateTheme({
      ...validTheme,
      groups: [
        { id: "same", name: "Первая", items: ["Альфа", "Бета"] },
        { id: "same", name: "Вторая", items: [" альфа ", "Гамма"] },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((error) => error.message.includes("same"))).toBe(true);
      expect(
        result.errors.some((error) => error.message.toLocaleLowerCase("ru-RU").includes("альфа")),
      ).toBe(true);
    }
  });

  it("allows a single group and limits it to fifteen items", () => {
    const one = validateTheme({
      ...validTheme,
      groups: [{ id: "short", name: "Мало", items: ["Один"] }],
    });
    const sixteen = validateTheme({
      ...validTheme,
      groups: [{
        id: "long",
        name: "Много",
        items: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"],
      }],
    });

    expect(one.success).toBe(true);
    expect(sixteen.success).toBe(false);
  });

  it("limits text field lengths", () => {
    const result = validateTheme({
      ...validTheme,
      id: "a".repeat(THEME_LIMITS.idLength + 1),
      name: "Я".repeat(THEME_LIMITS.themeNameLength + 1),
      description: "Я".repeat(THEME_LIMITS.descriptionLength + 1),
      groups: [
        {
          id: "b".repeat(THEME_LIMITS.idLength + 1),
          name: "Я".repeat(THEME_LIMITS.groupNameLength + 1),
          items: ["Я".repeat(THEME_LIMITS.itemLength + 1)],
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.errors.map((error) => error.path);
      expect(paths).toEqual(
        expect.arrayContaining([
          "id",
          "name",
          "description",
          "groups[0].id",
          "groups[0].name",
          "groups[0].items[0]",
        ]),
      );
    }
  });

  it("limits a theme to twenty groups and 300 items", () => {
    const maximumGroups = Array.from(
      { length: THEME_LIMITS.groupCount },
      (_, groupIndex) => ({
        id: `group-${groupIndex}`,
        name: `Группа ${groupIndex}`,
        items: Array.from(
          { length: THEME_LIMITS.itemsPerGroup },
          (_, itemIndex) => `Объект ${groupIndex}-${itemIndex}`,
        ),
      }),
    );
    const maximum = validateTheme({ ...validTheme, groups: maximumGroups });
    const tooManyGroups = validateTheme({
      ...validTheme,
      groups: [
        ...maximumGroups,
        { id: "extra-group", name: "Лишняя", items: ["Лишний объект"] },
      ],
    });

    expect(maximum.success).toBe(true);
    expect(tooManyGroups.success).toBe(false);
    expect(MAX_THEME_ITEM_COUNT).toBe(300);
  });

  it("keeps the JSON Schema synchronized with runtime limits", () => {
    const path = resolve(
      process.cwd(),
      "schemas",
      "games",
      "spy",
      "theme.schema.json",
    );
    const schema = JSON.parse(readFileSync(path, "utf8")) as ThemeSchema;
    const group = schema.properties.groups.items.properties;

    expect(schema.properties.id.maxLength).toBe(THEME_LIMITS.idLength);
    expect(schema.properties.name.maxLength).toBe(
      THEME_LIMITS.themeNameLength,
    );
    expect(schema.properties.description.maxLength).toBe(
      THEME_LIMITS.descriptionLength,
    );
    expect(schema.properties.groups.maxItems).toBe(THEME_LIMITS.groupCount);
    expect(group.id.maxLength).toBe(THEME_LIMITS.idLength);
    expect(group.name.maxLength).toBe(THEME_LIMITS.groupNameLength);
    expect(group.items.minItems).toBe(1);
    expect(group.items.maxItems).toBe(THEME_LIMITS.itemsPerGroup);
    expect(group.items.items.maxLength).toBe(THEME_LIMITS.itemLength);
  });
});

interface ThemeSchema {
  properties: {
    id: { maxLength: number };
    name: { maxLength: number };
    description: { maxLength: number };
    groups: {
      maxItems: number;
      items: {
        properties: {
          id: { maxLength: number };
          name: { maxLength: number };
          items: {
            minItems: number;
            maxItems: number;
            items: { maxLength: number };
          };
        };
      };
    };
  };
}
