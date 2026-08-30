import type {
  FairnessHistory,
  GameSessionSnapshot,
} from "../../app/state/persistenceModels";
import type {
  PersistedFairnessHistory,
  PersistedGameSession,
} from "./persistedTypes";
import { STORAGE_SCHEMA_VERSION } from "./storageKeys";

export function toPersistedGameSession(
  snapshot: GameSessionSnapshot,
): PersistedGameSession {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    phase: snapshot.phase,
    selectedThemeId: snapshot.selectedThemeId,
    players: snapshot.players.map((player) => ({ ...player })),
    settings: { ...snapshot.settings },
    round: snapshot.round
      ? {
          ...snapshot.round,
          assignments: snapshot.round.assignments.map((assignment) => ({
            ...assignment,
          })),
        }
      : null,
    roundStartedAtMs: snapshot.roundStartedAtMs,
    currentPlayerIndex: snapshot.currentPlayerIndex,
  };
}

export function toGameSessionSnapshot(
  persisted: PersistedGameSession,
): GameSessionSnapshot {
  return {
    phase: persisted.phase,
    selectedThemeId: persisted.selectedThemeId,
    players: persisted.players.map((player) => ({ ...player })),
    settings: { ...persisted.settings },
    round: persisted.round
      ? {
          ...persisted.round,
          assignments: persisted.round.assignments.map((assignment) => ({
            ...assignment,
          })),
        }
      : null,
    roundStartedAtMs: persisted.roundStartedAtMs,
    currentPlayerIndex: persisted.currentPlayerIndex,
  };
}

export function toPersistedFairnessHistory(
  history: FairnessHistory,
): PersistedFairnessHistory {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    roundNumber: history.roundNumber,
    spies: history.spies.map((entry) => ({ ...entry })),
    starters: history.starters.map((entry) => ({ ...entry })),
    recentWordsByTheme: copyRecentWords(history.recentWordsByTheme),
  };
}

export function toFairnessHistory(
  persisted: PersistedFairnessHistory,
): FairnessHistory {
  return {
    roundNumber: persisted.roundNumber,
    spies: persisted.spies.map((entry) => ({ ...entry })),
    starters: persisted.starters.map((entry) => ({ ...entry })),
    recentWordsByTheme: copyRecentWords(persisted.recentWordsByTheme),
  };
}

function copyRecentWords(
  recentWords: Readonly<Record<string, readonly string[]>>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(recentWords).map(([themeId, words]) => [themeId, [...words]]),
  );
}
