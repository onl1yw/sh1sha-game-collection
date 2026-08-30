import { MAX_PLAYERS, MIN_PLAYERS } from "../../domain/game/playerLimits";
import type {
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
import { STORAGE_SCHEMA_VERSION } from "./storageKeys";

const PHASES = new Set<PersistedGamePhase>([
  "theme-selection",
  "setup",
  "handoff",
  "role",
  "ready",
  "active",
  "results",
]);
export function isValidGameSession(
  value: unknown,
): value is PersistedGameSession {
  if (!hasValidSessionFields(value)) {
    return false;
  }

  if (value.settings.spyCount >= value.players.length && value.players.length > 0) {
    return false;
  }

  const needsTheme = value.phase !== "theme-selection";
  const needsRound = !["theme-selection", "setup"].includes(value.phase);
  if (needsTheme && value.selectedThemeId === null) {
    return false;
  }
  if (needsRound !== (value.round !== null)) {
    return false;
  }

  return hasConsistentPlayerIndex(value) && hasConsistentRound(value);
}

export function isValidFairnessHistory(
  value: unknown,
): value is PersistedFairnessHistory {
  if (
    !isRecord(value) ||
    value.schemaVersion !== STORAGE_SCHEMA_VERSION ||
    !isNonNegativeInteger(value.roundNumber) ||
    !Array.isArray(value.spies) ||
    !Array.isArray(value.starters)
  ) {
    return false;
  }

  const roundNumber = value.roundNumber;
  return (
    value.spies.every((entry) => isSpyHistoryEntry(entry, roundNumber)) &&
    hasUniqueStrings(value.spies.map((entry) => entry.playerId)) &&
    value.starters.every((entry) =>
      isStarterHistoryEntry(entry, roundNumber),
    ) &&
    hasUniqueStrings(value.starters.map((entry) => entry.playerId)) &&
    isRecentWordsMap(value.recentWordsByTheme)
  );
}

function hasValidSessionFields(value: unknown): value is PersistedGameSession {
  return (
    isRecord(value) &&
    value.schemaVersion === STORAGE_SCHEMA_VERSION &&
    isPhase(value.phase) &&
    (value.selectedThemeId === null || isNonEmptyString(value.selectedThemeId)) &&
    Array.isArray(value.players) &&
    value.players.length >= MIN_PLAYERS &&
    value.players.length <= MAX_PLAYERS &&
    value.players.every(isPlayer) &&
    hasUniqueStrings(value.players.map((player) => player.id)) &&
    isSettings(value.settings) &&
    (value.round === null || isRound(value.round)) &&
    (value.roundStartedAtMs === null ||
      isNonNegativeInteger(value.roundStartedAtMs)) &&
    isNonNegativeInteger(value.currentPlayerIndex) &&
    value.currentPlayerIndex <= value.players.length
  );
}

function hasConsistentRound(session: PersistedGameSession): boolean {
  if (!session.round) {
    return true;
  }

  const playerIds = new Set(session.players.map((player) => player.id));
  const assignmentIds = session.round.assignments.map(
    (assignment) => assignment.playerId,
  );

  return (
    session.round.themeId === session.selectedThemeId &&
    session.round.spyMode === session.settings.spyMode &&
    assignmentIds.length === session.players.length &&
    assignmentIds.every((id, index) => id === session.players[index]?.id) &&
    session.round.assignments.filter((assignment) => assignment.role === "spy")
      .length === session.settings.spyCount &&
    playerIds.has(session.round.firstPlayerId) &&
    hasConsistentRoleWords(session.round)
  );
}

function hasConsistentPlayerIndex(session: PersistedGameSession): boolean {
  if (session.phase === "handoff" || session.phase === "role") {
    return session.currentPlayerIndex < session.players.length;
  }
  if (["ready", "active", "results"].includes(session.phase)) {
    return session.currentPlayerIndex === session.players.length;
  }
  return true;
}

function hasConsistentRoleWords(round: PersistedRound): boolean {
  if (round.spyMode === "classic") {
    return (
      round.decoyWord === null &&
      round.assignments.every((assignment) =>
        assignment.role === "spy"
          ? assignment.displayedWord === null
          : assignment.displayedWord === round.targetWord,
      )
    );
  }

  if (round.decoyWord === null || round.decoyWord === round.targetWord) {
    return false;
  }
  return round.assignments.every((assignment) =>
    assignment.role === "spy"
      ? assignment.displayedWord === round.decoyWord
      : assignment.displayedWord === round.targetWord,
  );
}

function isRound(value: unknown): value is PersistedRound {
  return (
    isRecord(value) &&
    isNonNegativeInteger(value.number) &&
    isNonEmptyString(value.themeId) &&
    isNonEmptyString(value.targetWord) &&
    (value.decoyWord === null || isNonEmptyString(value.decoyWord)) &&
    isSpyMode(value.spyMode) &&
    Array.isArray(value.assignments) &&
    value.assignments.every(isAssignment) &&
    isNonEmptyString(value.firstPlayerId)
  );
}

function isAssignment(value: unknown): value is PersistedAssignment {
  return (
    isRecord(value) &&
    isNonEmptyString(value.playerId) &&
    (value.role === "civilian" || value.role === "spy") &&
    (value.displayedWord === null || isNonEmptyString(value.displayedWord))
  );
}

function isPlayer(value: unknown): value is PersistedPlayer {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    typeof value.name === "string"
  );
}

function isSettings(value: unknown): value is PersistedGameSettings {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Number.isInteger(value.spyCount) &&
    Number(value.spyCount) >= 1 &&
    isSpyMode(value.spyMode)
  );
}

function isSpyHistoryEntry(
  value: unknown,
  roundNumber: number,
): value is PersistedSpyHistoryEntry {
  return (
    isRecord(value) &&
    isNonEmptyString(value.playerId) &&
    isNonNegativeInteger(value.spyAssignments) &&
    isNullableRoundNumber(value.lastSpyRound, roundNumber)
  );
}

function isStarterHistoryEntry(
  value: unknown,
  roundNumber: number,
): value is PersistedStarterHistoryEntry {
  return (
    isRecord(value) &&
    isNonEmptyString(value.playerId) &&
    isNonNegativeInteger(value.starts) &&
    isNullableRoundNumber(value.lastStartRound, roundNumber)
  );
}

function isRecentWordsMap(value: unknown): value is Record<string, string[]> {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([themeId, words]) =>
        isNonEmptyString(themeId) &&
        Array.isArray(words) &&
        words.every(isNonEmptyString),
    )
  );
}

function isPhase(value: unknown): value is PersistedGamePhase {
  return typeof value === "string" && PHASES.has(value as PersistedGamePhase);
}

function isSpyMode(value: unknown): value is "classic" | "decoy" {
  return value === "classic" || value === "decoy";
}

function isNullableRoundNumber(value: unknown, maximum: number): boolean {
  return value === null || (isNonNegativeInteger(value) && value <= maximum);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasUniqueStrings(values: string[]): boolean {
  return new Set(values).size === values.length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
