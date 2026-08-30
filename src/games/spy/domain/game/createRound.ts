import { selectThemeWords } from "../theme/selectThemeWords";
import { validateTheme } from "../theme/validateTheme";
import { selectFairSpyIds, updateSpyHistory } from "./fairSpySelector";
import { selectFirstPlayerId } from "./selectFirstPlayer";
import type { CreateRoundInput, CreateRoundResult, RoleAssignment } from "./types";
import { validateGameSetup } from "./validateGameSetup";

export class RoundCreationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoundCreationError";
  }
}

export function createRound(input: CreateRoundInput): CreateRoundResult {
  const setupValidation = validateGameSetup(input.players, input.settings);
  if (!setupValidation.valid) {
    throw new RoundCreationError(setupValidation.errors.join("; "));
  }
  if (!Number.isInteger(input.roundNumber) || input.roundNumber < 0) {
    throw new RoundCreationError("Номер раунда должен быть неотрицательным целым числом");
  }

  const themeValidation = validateTheme(input.theme);
  if (!themeValidation.success) {
    const details = themeValidation.errors
      .map((error) => `${error.path}: ${error.message}`)
      .join("; ");
    throw new RoundCreationError(`Некорректная тематика: ${details}`);
  }

  const words = selectThemeWords(
    themeValidation.data,
    input.settings.spyMode,
    input.recentWords,
    input.random,
  );
  const spyIds = selectFairSpyIds({
    players: input.players,
    spyCount: input.settings.spyCount,
    history: input.spyHistory,
    roundNumber: input.roundNumber,
    random: input.random,
  });
  const spyIdSet = new Set(spyIds);
  const assignments = input.players.map<RoleAssignment>((player) => {
    const isSpy = spyIdSet.has(player.id);
    return {
      playerId: player.id,
      role: isSpy ? "spy" : "civilian",
      displayedWord: displayedWord(isSpy, input.settings.spyMode, words),
    };
  });

  return {
    round: {
      number: input.roundNumber,
      themeId: themeValidation.data.id,
      targetWord: words.targetWord,
      decoyWord: words.decoyWord,
      spyMode: input.settings.spyMode,
      assignments,
      firstPlayerId: selectFirstPlayerId({
        players: input.players,
        history: input.firstPlayerHistory,
        roundNumber: input.roundNumber,
        random: input.random,
      }),
    },
    nextSpyHistory: updateSpyHistory(
      input.players,
      input.spyHistory,
      spyIds,
      input.roundNumber,
    ),
  };
}

function displayedWord(
  isSpy: boolean,
  mode: CreateRoundInput["settings"]["spyMode"],
  words: { targetWord: string; decoyWord: string | null },
): string | null {
  if (!isSpy) return words.targetWord;
  if (mode === "classic") return null;
  if (words.decoyWord === null) {
    throw new RoundCreationError("Для режима другого слова не выбрана альтернатива");
  }
  return words.decoyWord;
}
