import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { validateTheme } from "../../src/games/spy/domain/theme/validateTheme";

interface ThemeManifestEntry {
  id: string;
  file: string;
  enabled: boolean;
  sensitive?: boolean;
}

interface ThemeManifestFile {
  schemaVersion: number;
  themes: ThemeManifestEntry[];
}

interface ThemeFile {
  id: string;
  description: string;
  groups: Array<{ items: string[] }>;
}

const FILE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;
const manifest = readJson("manifest.json") as ThemeManifestFile;

describe("spy theme catalog", () => {
  it("contains a valid manifest without duplicate ids or files", () => {
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.themes.length).toBeGreaterThan(0);

    const ids = manifest.themes.map((entry) => entry.id);
    const files = manifest.themes.map((entry) => entry.file);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(files).size).toBe(files.length);
    for (const entry of manifest.themes) {
      expect(entry.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(entry.file).toMatch(FILE_PATTERN);
      expect(typeof entry.enabled).toBe("boolean");
      expect(
        entry.sensitive === undefined || typeof entry.sensitive === "boolean",
      ).toBe(true);
    }
  });

  it.each(manifest.themes)(
    "validates the theme listed in the manifest: $id",
    (entry) => {
      if (!FILE_PATTERN.test(entry.file)) return;

      const validation = validateTheme(readJson(entry.file));
      expect(validation.success).toBe(true);
      if (validation.success) {
        expect(validation.data.id).toBe(entry.id);
      }
    },
  );

  it("marks politics and drugs as sensitive themes", () => {
    for (const id of ["politicians", "drugs"]) {
      expect(manifest.themes.find((entry) => entry.id === id)?.sensitive).toBe(
        true,
      );
    }
  });

  it("labels the drugs theme as non-promotional", () => {
    const theme = readJson("drugs.json") as ThemeFile;
    expect(theme.description).toContain("не пропагандируем");
  });

  it("keeps all 15 original princesses in the Disney theme", () => {
    const theme = readJson("disney.json") as ThemeFile;
    const items = allItems(theme);
    const princesses = [
      "Золушка",
      "Рапунцель",
      "Белоснежка",
      "Ариэль",
      "Белль",
      "Жасмин",
      "Мулан",
      "Эльза",
      "Моана",
      "Анна",
      "Райя",
      "Аврора",
      "Покахонтас",
      "Тиана",
      "Мерида",
    ];

    expect(items).toEqual(expect.arrayContaining(princesses));
  });

  it("keeps the original apps and major categories in the phone theme", () => {
    const theme = readJson("phone-apps.json") as ThemeFile;
    const items = allItems(theme);
    const sourceApps = [
      "TikTok",
      "Instagram",
      "Telegram",
      "MAX",
      "WhatsApp",
      "Pinterest",
      "Wildberries",
      "Ozon",
      "YouTube",
      "Snapchat",
      "Погода",
      "Календарь",
      "Заметки",
      "Камера",
      "Фото",
      "Почта",
      "App Store",
      "Карты",
      "Настройки",
      "Калькулятор",
      "VPN",
      "Яндекс Лавка",
      "Яндекс Go",
      "Google",
      "Likee",
      "Госуслуги",
      "Контакты",
      "Brawl Stars",
      "МТС",
      "ВкусВилл",
    ];

    expect(theme.groups.every((group) => group.items.length >= 10)).toBe(true);
    expect(theme.groups.every((group) => group.items.length <= 15)).toBe(true);
    expect(items).toEqual(expect.arrayContaining(sourceApps));
  });

  it("keeps the author's flavors after semantic deduplication", () => {
    const theme = readJson("chip-flavors.json") as ThemeFile;
    const items = allItems(theme);
    const sourceFlavors = [
      "Капучино",
      "Лось в кленовом сиропе",
      "Булочка с корицей",
      "Черника",
      "Цветущая сакура",
      "Устрица с жареным чесноком",
      "Острый кальмар",
      "Курица и вафли",
      "Малосольный огурец с укропом",
      "Игристое",
      "Двойной гамбургер",
      "Пряная креветка",
      "Стейк рибай",
      "Лангустины в томатном соусе",
      "Чили и лайм",
      "Белые грибы со сметаной",
      "Сыр чеддер с халапеньо по-мексикански",
      "Нежный сыр с трюфелем",
      "Пицца «Четыре сыра»",
      "Куриные крылышки барбекю",
      "Солёная карамель",
    ];

    expect(items).toHaveLength(67);
    expect(theme.groups.every((group) => group.items.length >= 10)).toBe(true);
    expect(theme.groups.every((group) => group.items.length <= 15)).toBe(true);
    expect(items).toEqual(expect.arrayContaining(sourceFlavors));
  });
});

function allItems(theme: ThemeFile): string[] {
  return theme.groups.flatMap((group) => group.items);
}

function readJson(fileName: string): unknown {
  const path = resolve(
    process.cwd(),
    "public",
    "games",
    "spy",
    "themes",
    fileName,
  );
  return JSON.parse(readFileSync(path, "utf8"));
}
