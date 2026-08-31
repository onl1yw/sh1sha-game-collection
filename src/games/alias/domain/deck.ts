import type { AliasWord } from "./types";

export interface AliasThemeWords {
  id: string;
  words: readonly string[];
}

export function createWordDeck(
  themes: readonly AliasThemeWords[],
  selectedThemeIds: readonly string[],
  random: () => number = Math.random,
): AliasWord[] {
  const selected = new Set(selectedThemeIds);
  const words = themes.flatMap((theme) => selected.has(theme.id)
    ? theme.words.map((text, index) => ({
        id: `${theme.id}:${index}`,
        text,
        themeId: theme.id,
      }))
    : []);

  for (let index = words.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    const current = words[index];
    const replacement = words[target];
    if (current && replacement) {
      words[index] = replacement;
      words[target] = current;
    }
  }
  return words;
}

export function wordAt(deck: readonly AliasWord[], cursor: number): AliasWord {
  const word = deck[cursor % deck.length];
  if (!word) throw new Error("Alias needs at least one word");
  return word;
}
