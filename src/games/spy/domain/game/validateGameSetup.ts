import type { Player } from "../player/types";
import { MAX_PLAYERS, MIN_PLAYERS } from "./playerLimits";
import type { GameSettings } from "./types";

export interface GameSetupValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateGameSetup(
  players: readonly Player[],
  settings: GameSettings,
): GameSetupValidationResult {
  const errors: string[] = [];

  if (players.length < MIN_PLAYERS) {
    errors.push(`Для игры нужно минимум ${MIN_PLAYERS} игрока`);
  } else if (players.length > MAX_PLAYERS) {
    errors.push(`Для игры можно добавить не больше ${MAX_PLAYERS} игроков`);
  }

  const playerIds = new Set<string>();
  for (const player of players) {
    const id = player.id.trim();
    if (!id) {
      errors.push("У каждого игрока должен быть идентификатор");
    } else if (playerIds.has(id)) {
      errors.push(`Идентификатор игрока «${id}» повторяется`);
    }
    playerIds.add(id);

    if (!player.name.trim()) {
      errors.push(`У игрока «${id || "без идентификатора"}» нет имени`);
    }
  }

  if (!Number.isInteger(settings.spyCount) || settings.spyCount < 1) {
    errors.push("Количество шпионов должно быть целым числом не меньше 1");
  } else if (settings.spyCount >= players.length) {
    errors.push("В игре должен остаться хотя бы один мирный игрок");
  }

  if (settings.spyMode !== "classic" && settings.spyMode !== "decoy") {
    errors.push("Неизвестный режим шпиона");
  }

  return { valid: errors.length === 0, errors };
}
