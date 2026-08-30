import { randomIndex } from "../random";
import type { RandomSource } from "../random";
import type { SpyMode } from "../game/types";
import type { Theme } from "./types";

export interface ThemeWordSelection {
  targetWord: string;
  decoyWord: string | null;
  groupId: string;
}

interface WordCandidate {
  word: string;
  groupId: string;
  groupItems: readonly string[];
}

export function selectThemeWords(
  theme: Theme,
  mode: SpyMode,
  recentWords: readonly string[],
  random: RandomSource,
): ThemeWordSelection {
  const eligibleGroups = mode === "decoy"
    ? theme.groups.filter((group) => group.items.length >= 2)
    : theme.groups;
  const candidates = eligibleGroups.flatMap<WordCandidate>((group) =>
    group.items.map((word) => ({
      word,
      groupId: group.id,
      groupItems: group.items,
    })),
  );

  if (candidates.length === 0) {
    throw new Error(
      mode === "decoy"
        ? "В тематике нет группы с альтернативными объектами"
        : "В тематике нет объектов для игры",
    );
  }

  const recent = new Set(recentWords.map(normalizeWord));
  const freshCandidates = candidates.filter(
    (candidate) => !recent.has(normalizeWord(candidate.word)),
  );
  const targetPool = freshCandidates.length > 0 ? freshCandidates : candidates;
  const target = targetPool[randomIndex(targetPool.length, random)];
  if (!target) throw new Error("Не удалось выбрать объект тематики");

  if (mode === "classic") {
    return { targetWord: target.word, decoyWord: null, groupId: target.groupId };
  }

  if (mode !== "decoy") {
    throw new Error("Неизвестный режим шпиона");
  }

  const alternatives = target.groupItems.filter(
    (word) => normalizeWord(word) !== normalizeWord(target.word),
  );
  if (alternatives.length === 0) {
    throw new Error(`В группе «${target.groupId}» нет альтернативного объекта`);
  }

  const freshAlternatives = alternatives.filter(
    (word) => !recent.has(normalizeWord(word)),
  );
  const decoyPool = freshAlternatives.length > 0 ? freshAlternatives : alternatives;
  const decoyWord = decoyPool[randomIndex(decoyPool.length, random)];
  if (!decoyWord) throw new Error("Не удалось выбрать альтернативный объект");

  return { targetWord: target.word, decoyWord, groupId: target.groupId };
}

function normalizeWord(word: string): string {
  return word.trim().toLocaleLowerCase("ru-RU");
}
