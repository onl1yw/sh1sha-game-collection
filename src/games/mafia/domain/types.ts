export const MAFIA_ROLES = [
  "civilian",
  "mafia",
  "don",
  "commissioner",
  "doctor",
  "lover",
  "maniac",
  "host",
] as const;

export type MafiaRole = (typeof MAFIA_ROLES)[number];
export type MafiaTeam = "town" | "mafia" | "independent" | "neutral";
export type UniqueRoleCount = 0 | 1;
export type DeathReveal = "always" | "never";
export type LoverMode = "protect-and-link" | "block-vote";

export interface MafiaPlayer {
  id: string;
  name: string;
}

export interface RoleSetup {
  playerCount: number;
  ordinaryMafiaCount: number;
  don: UniqueRoleCount;
  commissioner: UniqueRoleCount;
  doctor: UniqueRoleCount;
  lover: UniqueRoleCount;
  loverMode: LoverMode;
  maniac: UniqueRoleCount;
  hostByLot: boolean;
  deathReveal: DeathReveal;
}

export interface RoleAssignment {
  playerId: string;
  role: MafiaRole;
  team: MafiaTeam;
}

export const NIGHT_STEP_KINDS = [
  "lover-visit",
  "mafia-kill",
  "don-check",
  "commissioner-check",
  "doctor-protect",
  "maniac-kill",
] as const;

export type NightStepKind = (typeof NIGHT_STEP_KINDS)[number];

export interface NightStep {
  kind: NightStepKind;
  actorPlayerIds: readonly string[];
  isDummy: boolean;
}

export type NightActions = Partial<Record<NightStepKind, string | null>>;

export interface NightKillAttempt {
  kind: "mafia-kill" | "maniac-kill";
  targetPlayerId: string;
  prevented: boolean;
}

export interface NightCheckResult {
  kind: "don-check" | "commissioner-check";
  targetPlayerId: string;
  positive: boolean;
}

export interface NightResolution {
  eliminatedPlayerIds: readonly string[];
  protectedPlayerId: string | null;
  loverProtectedPlayerId: string | null;
  linkedPlayerId: string | null;
  voteBlockedPlayerId: string | null;
  killAttempts: readonly NightKillAttempt[];
  checks: readonly NightCheckResult[];
}

export type MafiaWinner = "town" | "mafia" | "maniac" | "draw";
