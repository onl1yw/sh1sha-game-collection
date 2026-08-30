import type { Player } from "../player/types";
import type { RandomSource } from "../random";
import {
  calculateFairWeight,
  minimumKnownCount,
  selectWeightedIndex,
} from "./fairSelection";
import type { FirstPlayerHistoryEntry } from "./types";

interface FirstPlayerSelectionInput {
  players: readonly Player[];
  history: readonly FirstPlayerHistoryEntry[];
  roundNumber: number;
  random: RandomSource;
}

export function selectFirstPlayerId(
  input: FirstPlayerSelectionInput,
): string {
  validateInput(input);
  const history = new Map(input.history.map((entry) => [entry.playerId, entry]));
  const newcomerBaseline = minimumKnownCount(input.players.map(
    (player) => history.get(player.id)?.starts,
  ));
  const minimumStarts = Math.min(...input.players.map((player) =>
    history.get(player.id)?.starts ?? newcomerBaseline,
  ));
  const weights = input.players.map((player) => {
    const entry = history.get(player.id) ?? {
      playerId: player.id,
      starts: newcomerBaseline,
      lastStartRound: null,
    };
    return calculateFairWeight(
      entry?.starts ?? 0,
      entry?.lastStartRound ?? null,
      input.roundNumber,
      minimumStarts,
    );
  });
  const player = input.players[selectWeightedIndex(weights, input.random)];
  if (!player) throw new Error("Не удалось выбрать первого игрока");
  return player.id;
}

function validateInput(input: FirstPlayerSelectionInput): void {
  if (input.players.length === 0) {
    throw new RangeError("Нужен хотя бы один игрок");
  }
  if (!Number.isInteger(input.roundNumber) || input.roundNumber < 0) {
    throw new RangeError("Номер раунда должен быть неотрицательным целым числом");
  }

  const playerIds = input.players.map((player) => player.id);
  if (new Set(playerIds).size !== playerIds.length) {
    throw new Error("Идентификаторы игроков должны быть уникальны");
  }
  if (new Set(input.history.map((entry) => entry.playerId)).size !== input.history.length) {
    throw new Error("История начинающих содержит дубли");
  }
  input.history.forEach((entry) => {
    const invalidLastRound =
      entry.lastStartRound !== null &&
      (!Number.isInteger(entry.lastStartRound) ||
        entry.lastStartRound < 0 ||
        entry.lastStartRound > input.roundNumber);
    if (!Number.isInteger(entry.starts) || entry.starts < 0 || invalidLastRound) {
      throw new Error("История начинающих повреждена");
    }
  });
}
