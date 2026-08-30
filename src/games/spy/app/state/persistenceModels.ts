import type {
  FirstPlayerHistoryEntry,
  GameRound,
  GameSettings,
  SpyHistoryEntry,
} from "../../domain/game/types";
import type { Player } from "../../domain/player/types";

export type GamePhase =
  | "theme-selection"
  | "setup"
  | "handoff"
  | "role"
  | "ready"
  | "active"
  | "results";

export interface GameSessionSnapshot {
  phase: GamePhase;
  selectedThemeId: string | null;
  players: Player[];
  settings: GameSettings;
  round: GameRound | null;
  roundStartedAtMs: number | null;
  currentPlayerIndex: number;
}

export interface FairnessHistory {
  roundNumber: number;
  spies: SpyHistoryEntry[];
  starters: FirstPlayerHistoryEntry[];
  recentWordsByTheme: Record<string, string[]>;
}

export function createEmptyFairnessHistory(): FairnessHistory {
  return {
    roundNumber: 0,
    spies: [],
    starters: [],
    recentWordsByTheme: {},
  };
}
