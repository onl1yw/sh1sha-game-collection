import type { STORAGE_SCHEMA_VERSION } from "./storageKeys";

export type PersistedGamePhase =
  | "theme-selection"
  | "setup"
  | "handoff"
  | "role"
  | "ready"
  | "active"
  | "results";

export interface PersistedPlayer {
  id: string;
  name: string;
}

export interface PersistedGameSettings {
  spyCount: number;
  spyMode: "classic" | "decoy";
}

export interface PersistedAssignment {
  playerId: string;
  role: "civilian" | "spy";
  displayedWord: string | null;
}

export interface PersistedRound {
  number: number;
  themeId: string;
  targetWord: string;
  decoyWord: string | null;
  spyMode: "classic" | "decoy";
  assignments: PersistedAssignment[];
  firstPlayerId: string;
}

export interface PersistedGameSession {
  schemaVersion: typeof STORAGE_SCHEMA_VERSION;
  phase: PersistedGamePhase;
  selectedThemeId: string | null;
  players: PersistedPlayer[];
  settings: PersistedGameSettings;
  round: PersistedRound | null;
  roundStartedAtMs: number | null;
  currentPlayerIndex: number;
}

export interface PersistedSpyHistoryEntry {
  playerId: string;
  spyAssignments: number;
  lastSpyRound: number | null;
}

export interface PersistedStarterHistoryEntry {
  playerId: string;
  starts: number;
  lastStartRound: number | null;
}

export interface PersistedFairnessHistory {
  schemaVersion: typeof STORAGE_SCHEMA_VERSION;
  roundNumber: number;
  spies: PersistedSpyHistoryEntry[];
  starters: PersistedStarterHistoryEntry[];
  recentWordsByTheme: Record<string, string[]>;
}
