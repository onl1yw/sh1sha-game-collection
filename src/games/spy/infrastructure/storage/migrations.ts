import {
  isValidFairnessHistory,
  isValidGameSession,
} from "./persistedGuards";
import type {
  PersistedFairnessHistory,
  PersistedGameSession,
} from "./persistedTypes";
import { STORAGE_SCHEMA_VERSION } from "./storageKeys";

export type {
  PersistedAssignment,
  PersistedFairnessHistory,
  PersistedGamePhase,
  PersistedGameSession,
  PersistedGameSettings,
  PersistedPlayer,
  PersistedRound,
  PersistedSpyHistoryEntry,
  PersistedStarterHistoryEntry,
} from "./persistedTypes";

export function migrateGameSession(
  input: unknown,
): PersistedGameSession | null {
  const migrated = addRoundTimer(migrateLegacySession(input));
  if (!isValidGameSession(migrated)) {
    return null;
  }

  return {
    ...migrated,
    // A visible role is never restored after a browser refresh.
    phase: migrated.phase === "role" ? "handoff" : migrated.phase,
  };
}

function addRoundTimer(input: unknown): unknown {
  if (!isRecord(input) || "roundStartedAtMs" in input) {
    return input;
  }
  return {
    ...input,
    roundStartedAtMs: input.phase === "active" ? Date.now() : null,
  };
}

export function migrateFairnessHistory(
  input: unknown,
): PersistedFairnessHistory | null {
  const migrated = migrateLegacyFairnessHistory(input);
  return isValidFairnessHistory(migrated) ? migrated : null;
}

function migrateLegacySession(input: unknown): unknown {
  if (!isRecord(input) || input.schemaVersion !== 0) {
    return input;
  }

  return {
    ...input,
    schemaVersion: STORAGE_SCHEMA_VERSION,
    selectedThemeId:
      typeof input.selectedThemeId === "string" ? input.selectedThemeId : null,
    currentPlayerIndex: isNonNegativeInteger(input.currentPlayerIndex)
      ? input.currentPlayerIndex
      : inferLegacyPlayerIndex(input),
  };
}

function inferLegacyPlayerIndex(input: Record<string, unknown>): number {
  const completedRolePhases = new Set(["ready", "active", "results"]);
  return completedRolePhases.has(String(input.phase)) && Array.isArray(input.players)
    ? input.players.length
    : 0;
}

function migrateLegacyFairnessHistory(input: unknown): unknown {
  if (!isRecord(input) || input.schemaVersion !== 0) {
    return input;
  }

  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    roundNumber: input.roundNumber,
    spies: input.spyHistory,
    starters: [],
    recentWordsByTheme: {},
  };
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
