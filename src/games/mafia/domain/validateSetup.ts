import {
  getActivePlayerCount,
  getCivilianCount,
  MAX_MAFIA_PLAYERS,
  MIN_MAFIA_PLAYERS,
} from "./roleSetup";
import type { MafiaPlayer, RoleSetup } from "./types";

export interface SetupValidationResult {
  valid: boolean;
  errors: string[];
}

const UNIQUE_ROLES = [
  ["don", "Дон"],
  ["commissioner", "Комиссар"],
  ["doctor", "Доктор"],
  ["lover", "Любовница"],
  ["maniac", "Маньяк"],
] as const satisfies ReadonlyArray<readonly [
  "don" | "commissioner" | "doctor" | "lover" | "maniac",
  string,
]>;

export function validateSetup(
  roleSetup: RoleSetup,
  players?: readonly MafiaPlayer[],
): SetupValidationResult {
  const errors: string[] = [];
  const activePlayerCount = getActivePlayerCount(roleSetup);

  if (!Number.isInteger(roleSetup.playerCount)
    || activePlayerCount < MIN_MAFIA_PLAYERS
    || activePlayerCount > MAX_MAFIA_PLAYERS) {
    errors.push(
      `Активных игроков должно быть от ${MIN_MAFIA_PLAYERS} до ${MAX_MAFIA_PLAYERS}`,
    );
  }

  if (typeof roleSetup.hostByLot !== "boolean") {
    errors.push("Неизвестная настройка ведущего");
  }

  if (!Number.isInteger(roleSetup.ordinaryMafiaCount)
    || roleSetup.ordinaryMafiaCount < 1) {
    errors.push("Нужен хотя бы один обычный игрок мафии");
  }

  for (const [role, label] of UNIQUE_ROLES) {
    if (roleSetup[role] !== 0 && roleSetup[role] !== 1) {
      errors.push(`Роль «${label}» может быть в игре только один раз`);
    }
  }

  if (roleSetup.deathReveal !== "always" && roleSetup.deathReveal !== "never") {
    errors.push("Неизвестная настройка раскрытия ролей");
  }
  if (roleSetup.loverMode !== "protect-and-link"
    && roleSetup.loverMode !== "block-vote") {
    errors.push("Неизвестный режим Любовницы");
  }

  if (roleSetup.don === 1 && roleSetup.ordinaryMafiaCount < 1) {
    errors.push("Дону нужен хотя бы один обычный игрок мафии");
  }
  if (roleSetup.don === 1 && roleSetup.commissioner !== 1) {
    errors.push("Дона можно добавить только в игру с Комиссаром");
  }
  if (roleSetup.maniac === 1 && activePlayerCount < 9) {
    errors.push("Маньяк доступен от 9 активных игроков");
  }
  if (roleSetup.lover === 1 && activePlayerCount < 7) {
    errors.push("Любовница доступна от 7 активных игроков");
  }

  const civilianCount = getCivilianCount(roleSetup);
  if (Number.isFinite(civilianCount) && civilianCount < 2) {
    errors.push("В игре должно остаться хотя бы два мирных жителя");
  }

  if (players) validatePlayers(players, roleSetup.playerCount, errors);
  return { valid: errors.length === 0, errors };
}

function validatePlayers(
  players: readonly MafiaPlayer[],
  expectedCount: number,
  errors: string[],
): void {
  if (players.length !== expectedCount) {
    errors.push("Число игроков не совпадает с настройками");
  }

  const ids = new Set<string>();
  for (const player of players) {
    const id = player.id.trim();
    if (!id) errors.push("У каждого игрока должен быть идентификатор");
    else if (ids.has(id)) errors.push(`Идентификатор игрока «${id}» повторяется`);
    ids.add(id);
    if (!player.name.trim()) errors.push(`У игрока «${id || "без id"}» нет имени`);
  }
}
