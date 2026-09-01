import type { CorrectClaim, HatWord } from "./types";

export interface HatThemeWords {
  id: string;
  words: readonly string[];
}

export function availableHatWordCount(
  themes: readonly HatThemeWords[],
  selectedThemeIds: readonly string[],
): number {
  return uniqueCandidates(themes, selectedThemeIds).length;
}

export function createHatWordPool(
  themes: readonly HatThemeWords[],
  selectedThemeIds: readonly string[],
  wordCount: number,
  random: () => number = Math.random,
): HatWord[] {
  const candidates = uniqueCandidates(themes, selectedThemeIds);
  if (!Number.isInteger(wordCount) || wordCount < 1 || wordCount > candidates.length) {
    throw new RangeError("Hat needs an available word for every pool slot");
  }
  return shuffleItems(candidates, random).slice(0, wordCount);
}

export function shuffleWordIds(
  wordIds: readonly string[],
  random: () => number = Math.random,
): string[] {
  return shuffleItems(wordIds, random);
}

export function requeueSkippedWord(
  queueWordIds: readonly string[],
  random: () => number = Math.random,
): string[] {
  const [current, ...rest] = queueWordIds;
  if (!current) return [];
  if (rest.length === 0) return [current];
  const insertionIndex = 1 + Math.floor(normalizeRandom(random()) * rest.length);
  const next = [...rest];
  next.splice(insertionIndex, 0, current);
  return next;
}

export function reviewedWordQueue(
  queueWordIds: readonly string[],
  claims: readonly CorrectClaim[],
  random: () => number = Math.random,
): string[] {
  const returned = claims
    .filter((claim) => !claim.included)
    .map((claim) => claim.wordId);
  return shuffleWordIds([...queueWordIds, ...returned], random);
}

export function isWordIdPermutation(
  candidate: readonly string[],
  expected: readonly string[],
): boolean {
  if (candidate.length !== expected.length) return false;
  const counts = new Map<string, number>();
  for (const id of expected) counts.set(id, (counts.get(id) ?? 0) + 1);
  for (const id of candidate) {
    const count = counts.get(id) ?? 0;
    if (count === 0) return false;
    counts.set(id, count - 1);
  }
  return [...counts.values()].every((count) => count === 0);
}

function uniqueCandidates(
  themes: readonly HatThemeWords[],
  selectedThemeIds: readonly string[],
): HatWord[] {
  const selected = new Set(selectedThemeIds);
  const seen = new Set<string>();
  const words: HatWord[] = [];
  for (const theme of themes) {
    if (!selected.has(theme.id)) continue;
    theme.words.forEach((source, index) => {
      const text = source.trim();
      const normalized = text.toLocaleLowerCase("ru");
      if (!text || seen.has(normalized)) return;
      seen.add(normalized);
      words.push({ id: `${theme.id}:${index}`, text, themeId: theme.id });
    });
  }
  return words;
}

function shuffleItems<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(normalizeRandom(random()) * (index + 1));
    const current = shuffled[index];
    const replacement = shuffled[target];
    if (current !== undefined && replacement !== undefined) {
      shuffled[index] = replacement;
      shuffled[target] = current;
    }
  }
  return shuffled;
}

function normalizeRandom(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 1 - Number.EPSILON);
}
