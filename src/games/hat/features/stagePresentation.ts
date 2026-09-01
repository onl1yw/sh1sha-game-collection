import { HAT_STAGES, type HatStage } from "../domain/types";

export interface HatStagePresentation {
  shortTitle: string;
  title: string;
  prompt: string;
}

const PRESENTATION: Record<HatStage, HatStagePresentation> = {
  describe: {
    shortTitle: "Слова",
    title: "Объясняйте словами",
    prompt: "Объясните слово",
  },
  gestures: {
    shortTitle: "Жесты",
    title: "Показывайте жестами",
    prompt: "Покажите слово",
  },
  "one-word": {
    shortTitle: "Одно слово",
    title: "Подсказывайте одним словом",
    prompt: "Дайте подсказку одним словом",
  },
};

export function hatStageAt(index: number): HatStage {
  return HAT_STAGES[index] ?? "one-word";
}

export function hatStagePresentation(index: number): HatStagePresentation {
  return PRESENTATION[hatStageAt(index)];
}

export function hatStageEyebrow(index: number): string {
  return `Этап ${index + 1} из ${HAT_STAGES.length}`;
}

export function formatHatWords(count: number): string {
  return `${count} ${russianCountNoun(count, "слово", "слова", "слов")}`;
}

export function formatHatTurns(count: number): string {
  return `${count} ${russianCountNoun(count, "ход", "хода", "ходов")}`;
}

function russianCountNoun(
  count: number,
  singular: string,
  few: string,
  many: string,
): string {
  const lastTwo = Math.abs(count) % 100;
  const last = lastTwo % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return singular;
  if (last >= 2 && last <= 4) return few;
  return many;
}
