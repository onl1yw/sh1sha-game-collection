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

  return shuffle(words, random);
}

export function reshuffleWordDeck(
  deck: readonly AliasWord[],
  random: () => number = Math.random,
): AliasWord[] {
  const next = shuffle(deck, random);
  if (next.length > 1 && next[0]?.id === deck.at(-1)?.id) {
    const first = next[0];
    const second = next[1];
    if (first && second) [next[0], next[1]] = [second, first];
  }
  return next;
}

export function wordAt(deck: readonly AliasWord[], cursor: number): AliasWord {
  const word = deck[cursor];
  if (!word) throw new Error("Alias needs an available word");
  return word;
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    const replacement = shuffled[target];
    if (current && replacement) {
      shuffled[index] = replacement;
      shuffled[target] = current;
    }
  }
  return shuffled;
}
