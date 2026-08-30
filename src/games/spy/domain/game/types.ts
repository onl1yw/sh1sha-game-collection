import type { Player } from "../player/types";
import type { Theme } from "../theme/types";
import type { RandomSource } from "../random";

export type SpyMode = "classic" | "decoy";
export type PlayerRole = "civilian" | "spy";

export interface GameSettings {
  spyCount: number;
  spyMode: SpyMode;
}

export interface SpyHistoryEntry {
  playerId: string;
  spyAssignments: number;
  lastSpyRound: number | null;
}

export interface FirstPlayerHistoryEntry {
  playerId: string;
  starts: number;
  lastStartRound: number | null;
}

export interface RoleAssignment {
  playerId: string;
  role: PlayerRole;
  displayedWord: string | null;
}

export interface GameRound {
  number: number;
  themeId: string;
  targetWord: string;
  decoyWord: string | null;
  spyMode: SpyMode;
  assignments: RoleAssignment[];
  firstPlayerId: string;
}

export interface CreateRoundInput {
  players: readonly Player[];
  settings: GameSettings;
  theme: Theme;
  spyHistory: readonly SpyHistoryEntry[];
  firstPlayerHistory: readonly FirstPlayerHistoryEntry[];
  recentWords: readonly string[];
  roundNumber: number;
  random: RandomSource;
}

export interface CreateRoundResult {
  round: GameRound;
  nextSpyHistory: SpyHistoryEntry[];
}
