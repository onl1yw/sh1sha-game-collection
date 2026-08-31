import {
  getActivePlayerCount,
  getCivilianCount,
} from "../../domain/roleSetup";
import type {
  MafiaPlayer,
  NightStep,
  RoleAssignment,
} from "../../domain/types";
import { legalNightTargetIds } from "../../domain/nightTargets";
import type { MafiaGameState } from "./gameState";

export function playerById(
  state: MafiaGameState,
  playerId: string,
): MafiaPlayer | undefined {
  return state.players.find((player) => player.id === playerId);
}

export function assignmentByPlayerId(
  state: MafiaGameState,
  playerId: string,
): RoleAssignment | undefined {
  return state.assignments.find((assignment) => assignment.playerId === playerId);
}

export function alivePlayers(state: MafiaGameState): MafiaPlayer[] {
  const alive = new Set(state.alivePlayerIds);
  return state.players.filter((player) => alive.has(player.id));
}

export function currentNightStep(state: MafiaGameState): NightStep | null {
  const phase = state.phase;
  if (phase.kind !== "night-step" && phase.kind !== "night-feedback") return null;
  return phase.plan[phase.stepIndex] ?? null;
}

export function nightTargetPlayers(state: MafiaGameState): MafiaPlayer[] {
  const step = currentNightStep(state);
  if (!step || step.isDummy) return [];
  const targetIds = new Set(legalNightTargetIds({
    assignments: state.assignments,
    alivePlayerIds: state.alivePlayerIds,
    kind: step.kind,
    previousLoverTargetId: state.previousLoverTargetId,
  }));
  return state.players.filter((player) => targetIds.has(player.id));
}

export function maxOrdinaryMafiaCount(state: MafiaGameState): number {
  const uniqueCount = state.roleSetup.don
    + state.roleSetup.commissioner
    + state.roleSetup.doctor
    + state.roleSetup.lover
    + state.roleSetup.maniac
    + (state.roleSetup.hostByLot ? 1 : 0);
  return Math.max(1, state.players.length - uniqueCount - 2);
}

export function civilianCount(state: MafiaGameState): number {
  return getCivilianCount(state.roleSetup);
}

export function activePlayerCount(state: MafiaGameState): number {
  return getActivePlayerCount(state.roleSetup);
}
