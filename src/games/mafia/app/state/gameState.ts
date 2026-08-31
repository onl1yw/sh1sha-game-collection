import {
  getActivePlayerCount,
  getCivilianCount,
  getDefaultRoleSetup,
  MAX_MAFIA_PLAYERS,
  MIN_MAFIA_PLAYERS,
} from "../../domain/roleSetup";
import type {
  LoverMode,
  MafiaPlayer,
  RoleAssignment,
  RoleSetup,
} from "../../domain/types";
import type { MafiaGamePhase } from "./gamePhase";

export interface MafiaGameState {
  players: MafiaPlayer[];
  roleSetup: RoleSetup;
  phase: MafiaGamePhase;
  assignments: RoleAssignment[];
  alivePlayerIds: string[];
  previousLoverTargetId: string | null;
  voteBlockedPlayerId: string | null;
  errorMessage: string | null;
}

const DEFAULT_PLAYER_COUNT = 7;

export function createInitialGameState(): MafiaGameState {
  return {
    players: createPlayers(DEFAULT_PLAYER_COUNT),
    roleSetup: getDefaultRoleSetup(DEFAULT_PLAYER_COUNT),
    phase: { kind: "setup" },
    assignments: [],
    alivePlayerIds: [],
    previousLoverTargetId: null,
    voteBlockedPlayerId: null,
    errorMessage: null,
  };
}

export function createPlayers(count: number): MafiaPlayer[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    name: defaultPlayerName(index),
  }));
}

export function resizePlayers(
  players: readonly MafiaPlayer[],
  count: number,
  minimum = MIN_MAFIA_PLAYERS,
  maximum = MAX_MAFIA_PLAYERS,
): MafiaPlayer[] {
  const bounded = Math.min(maximum, Math.max(minimum, count));
  const next = players.slice(0, bounded).map((player) => ({ ...player }));
  while (next.length < bounded) {
    const index = next.length;
    next.push({ id: nextPlayerId(players, next), name: defaultPlayerName(index) });
  }
  return next;
}

export function normalizePlayerNames(players: readonly MafiaPlayer[]): MafiaPlayer[] {
  return players.map((player, index) => ({
    ...player,
    name: player.name.trim() || defaultPlayerName(index),
  }));
}

export function fitRoleSetup(current: RoleSetup, playerCount: number): RoleSetup {
  const next: RoleSetup = {
    ...current,
    playerCount,
  };
  if (next.commissioner === 0) next.don = 0;
  const activePlayerCount = getActivePlayerCount(next);
  if (activePlayerCount < 9) next.maniac = 0;
  if (activePlayerCount < 7) next.lover = 0;
  while (getCivilianCount(next) < 2) {
    if (next.maniac) next.maniac = 0;
    else if (next.lover) next.lover = 0;
    else if (next.doctor) next.doctor = 0;
    else if (next.don) next.don = 0;
    else if (next.ordinaryMafiaCount > 1) next.ordinaryMafiaCount -= 1;
    else if (next.commissioner) next.commissioner = 0;
    else break;
  }
  return next;
}

export function isLoverMode(value: string): value is LoverMode {
  return value === "protect-and-link" || value === "block-vote";
}

function defaultPlayerName(index: number): string {
  return `Игрок ${index + 1}`;
}

function nextPlayerId(
  existing: readonly MafiaPlayer[],
  next: readonly MafiaPlayer[],
): string {
  const usedIds = new Set([...existing, ...next].map((player) => player.id));
  let sequence = 1;
  while (usedIds.has(`player-${sequence}`)) sequence += 1;
  return `player-${sequence}`;
}
