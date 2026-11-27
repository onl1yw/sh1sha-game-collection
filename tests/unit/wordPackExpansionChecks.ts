import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect } from "vitest";

export const EXPANSION_PACKS = [
  { id: "everyday", name: "На каждый день", words: 250, spy: 160 },
  { id: "people-activities", name: "Люди и занятия", words: 200, spy: 160 },
  { id: "animals-nature", name: "Животные и природа", words: 200, spy: 200 },
  { id: "food-kitchen", name: "Еда и кухня", words: 200, spy: 200 },
  { id: "explain-harder", name: "Объясни посложнее", words: 250, spy: 100 },
  { id: "famous-characters", name: "Знаменитости и персонажи", words: 150, spy: 150 },
] as const;

interface Entry {
  id: string;
  file: string;
  enabled: boolean;
  sensitive?: boolean;
}

interface ContentPack {
  id: string;
  name: string;
  words?: string[];
  groups?: Array<{ items: string[] }>;
}

export function checkExpansionPacks(game: "alias" | "hat" | "spy"): void {
  const directory = resolve(process.cwd(), "public/games", game, "themes");
  const read = (file: string): unknown => JSON.parse(
    readFileSync(resolve(directory, file), "utf8"),
  ) as unknown;
  const manifest = read("manifest.json") as { themes: Entry[] };
  const packs = manifest.themes.map((entry) => read(entry.file) as ContentPack);
  const occurrences = new Map<string, string[]>();

  for (const pack of packs) {
    for (const word of allWords(pack)) {
      const normalized = normalize(word);
      occurrences.set(normalized, [...(occurrences.get(normalized) ?? []), pack.id]);
    }
  }

  for (const expected of EXPANSION_PACKS) {
    const entry = manifest.themes.find((item) => item.id === expected.id);
    expect(entry?.enabled, expected.id).toBe(true);
    expect(entry?.sensitive ?? false, expected.id).toBe(false);
    const pack = packs.find((item) => item.id === expected.id);
    expect(pack?.name).toBe(expected.name);
    expect(pack).toBeDefined();
    if (!pack) continue;

    const words = allWords(pack);
    expect(words).toHaveLength(game === "spy" ? expected.spy : expected.words);
    for (const word of words) {
      expect(word).toBe(word.normalize("NFC").trim());
      expect(word).not.toMatch(/[\u00ad\u200b-\u200f\ufeff]/);
      expect(occurrences.get(normalize(word)), `Repeated word: ${word}`)
        .toEqual([pack.id]);
    }
  }
}

function allWords(pack: ContentPack): string[] {
  return pack.words ?? pack.groups?.flatMap((group) => group.items) ?? [];
}

function normalize(word: string): string {
  return word.trim().toLocaleLowerCase("ru").replaceAll("ё", "е");
}
