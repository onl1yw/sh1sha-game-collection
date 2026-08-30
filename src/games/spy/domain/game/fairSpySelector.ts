import type { Player } from "../player/types";
import type { RandomSource } from "../random";
import {
  calculateFairWeight,
  minimumKnownCount,
  selectWeightedIndex,
} from "./fairSelection";
import type { SpyHistoryEntry } from "./types";

export interface FairSpySelectionInput {
  players: readonly Player[];
  spyCount: number;
  history: readonly SpyHistoryEntry[];
  roundNumber: number;
  random: RandomSource;
}

interface WeightedPlayer {
  player: Player;
  weight: number;
}

export function selectFairSpyIds(input: FairSpySelectionInput): string[] {
  validateInput(input);
  const history = historyByPlayer(input.history);
  const newcomerBaseline = minimumKnownCount(input.players.map(
    (player) => history.get(player.id)?.spyAssignments,
  ));
  const assignmentCounts = input.players.map((player) =>
    history.get(player.id)?.spyAssignments ?? newcomerBaseline,
  );
  const minimumAssignments = Math.min(...assignmentCounts);
  const candidates = input.players.map<WeightedPlayer>((player) => {
    const entry = history.get(player.id) ?? {
      playerId: player.id,
      spyAssignments: newcomerBaseline,
      lastSpyRound: null,
    };
    return {
      player,
      weight: calculateSpyWeight(entry, input.roundNumber, minimumAssignments),
    };
  });

  const selected: string[] = [];
  while (selected.length < input.spyCount) {
    const index = selectWeightedIndex(
      candidates.map((candidate) => candidate.weight),
      input.random,
    );
    const [picked] = candidates.splice(index, 1);
    if (!picked) throw new Error("Не удалось выбрать шпиона");
    selected.push(picked.player.id);
  }
  return selected;
}

export function updateSpyHistory(
  players: readonly Player[],
  previous: readonly SpyHistoryEntry[],
  spyIds: readonly string[],
  roundNumber: number,
): SpyHistoryEntry[] {
  const history = historyByPlayer(previous);
  const selected = new Set(spyIds);
  const newcomerBaseline = minimumKnownCount(players.map(
    (player) => history.get(player.id)?.spyAssignments,
  ));
  return players.map((player) => {
    const entry = history.get(player.id);
    const wasSpy = selected.has(player.id);
    return {
      playerId: player.id,
      spyAssignments:
        (entry?.spyAssignments ?? newcomerBaseline) + (wasSpy ? 1 : 0),
      lastSpyRound: wasSpy ? roundNumber : (entry?.lastSpyRound ?? null),
    };
  });
}

export function calculateSpyWeight(
  entry: SpyHistoryEntry | undefined,
  roundNumber: number,
  minimumAssignments: number,
): number {
  return calculateFairWeight(
    entry?.spyAssignments ?? 0,
    entry?.lastSpyRound ?? null,
    roundNumber,
    minimumAssignments,
  );
}

function historyByPlayer(
  history: readonly SpyHistoryEntry[],
): Map<string, SpyHistoryEntry> {
  return new Map(history.map((entry) => [entry.playerId, entry]));
}

function validateInput(input: FairSpySelectionInput): void {
  if (!Number.isInteger(input.spyCount) || input.spyCount < 1) {
    throw new RangeError("Количество шпионов должно быть целым и не меньше 1");
  }
  if (input.spyCount >= input.players.length) {
    throw new RangeError("В игре должен остаться хотя бы один мирный игрок");
  }
  if (!Number.isInteger(input.roundNumber) || input.roundNumber < 0) {
    throw new RangeError("Номер раунда должен быть неотрицательным целым числом");
  }

  const ids = new Set(input.players.map((player) => player.id));
  if (ids.size !== input.players.length) {
    throw new Error("Идентификаторы игроков должны быть уникальны");
  }
  for (const entry of input.history) {
    if (!Number.isInteger(entry.spyAssignments) || entry.spyAssignments < 0) {
      throw new Error("История содержит некорректное число назначений");
    }
    if (
      entry.lastSpyRound !== null &&
      (!Number.isInteger(entry.lastSpyRound) || entry.lastSpyRound > input.roundNumber)
    ) {
      throw new Error("История содержит некорректный номер раунда");
    }
  }
}
